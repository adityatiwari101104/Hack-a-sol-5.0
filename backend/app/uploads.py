"""Runtime PDF upload: save -> parse -> OCR if needed -> redact -> extract -> index -> link -> conflict/impact scan
-> ready. A failed ingest leaves no rows behind (all rows are written in one short transaction at the end).

Uploads are kept apart from the shipped corpus: they are searched only when a request names them (`upload_ids`), so
the shipped demo answers do not change, and they can be deleted (the corpus cannot).
"""
import hashlib
import io
import json
import os
import re
import threading
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime

from . import audit, config, db, extract, hindi, llm, privacy, retrieve
from .ingest import chunk_document, read_pdf
from .normalize import parse_date

MAX_PAGES = int(os.getenv("UPLOAD_MAX_PAGES", "40"))
MAX_BYTES = int(os.getenv("UPLOAD_MAX_MB", "20")) * 1024 * 1024
UPLOAD_DIR = config.CORPUS / "uploads"
# doc_kind -> (collection, is the bank's own document)
DOC_KINDS = {"rbi_circular": ("banking", False), "bank_policy": ("banking", True), "loan_agreement": ("banking", True),
             "kfs_or_sanction": ("banking", True), "other": ("general", False)}
STAGES = ["saved", "parsing", "ocr", "redacting", "extracting", "indexing", "linking", "scanning", "ready"]
_worker = ThreadPoolExecutor(max_workers=1)  # one ingest at a time: local models and SQLite writes are shared
_lock = threading.Lock()


class UploadError(ValueError):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def enabled():
    return os.getenv("UPLOADS_ENABLED", "1") != "0"


def _now():
    return datetime.now().isoformat(timespec="seconds")


def _set(doc_id, stage=None, status=None, **fields):
    con = db.connect()
    cur = con.execute("SELECT counts_json, warnings_json FROM upload_jobs WHERE doc_id=?", (doc_id,)).fetchone()
    counts = json.loads(cur["counts_json"] or "{}") if cur else {}
    warnings = json.loads(cur["warnings_json"] or "[]") if cur else []
    counts.update(fields.pop("counts", {}))
    warnings += fields.pop("warnings", [])
    sets = {"counts_json": json.dumps(counts), "warnings_json": json.dumps(warnings), "updated_at": _now()}
    if stage:
        sets["stage"] = stage
    if status:
        sets["status"] = status
    sets.update(fields)
    con.execute(f"UPDATE upload_jobs SET {', '.join(k + '=?' for k in sets)} WHERE doc_id=?", (*sets.values(), doc_id))
    con.commit()
    if stage:
        audit.append(doc_id, "upload", {"stage": stage, "status": status or "running", "counts": counts},
                     actor="upload", corpus_hash=None)


def status(doc_id):
    r = db.connect().execute("SELECT * FROM upload_jobs WHERE doc_id=?", (doc_id,)).fetchone()
    if not r:
        return None
    out = {k: r[k] for k in ("doc_id", "filename", "doc_kind", "collection", "stage", "status", "error", "created_at",
                             "updated_at")}
    out["counts"] = json.loads(r["counts_json"] or "{}")
    out["warnings"] = json.loads(r["warnings_json"] or "[]")
    out["report"] = json.loads(r["report_json"] or "null")
    out["stages"] = [{"stage": s, "done": STAGES.index(s) < STAGES.index(r["stage"]) or r["stage"] == "ready"}
                     for s in STAGES if r["stage"] in STAGES] if r["stage"] in STAGES else []
    out["progress"] = round(STAGES.index(r["stage"]) / (len(STAGES) - 1), 2) if r["stage"] in STAGES else None
    return out


def submit(data, filename, doc_kind="other", title=None, effective_date=None, collection=None, source="upload",
           doc_id=None, wait=False):
    """Validate and queue an upload. Returns its status dict (status 'duplicate' if the same file is already in)."""
    if source == "upload" and not enabled():
        raise UploadError(403, "uploads are switched off on this server (UPLOADS_ENABLED=0)")
    if doc_kind not in DOC_KINDS:
        raise UploadError(400, f"doc_kind must be one of {sorted(DOC_KINDS)}")
    if not data or not data[:5] == b"%PDF-":
        raise UploadError(415, "only PDF files can be uploaded")
    if len(data) > MAX_BYTES:
        raise UploadError(413, f"file is larger than {MAX_BYTES // (1024 * 1024)} MB")
    try:
        from pypdf import PdfReader
        n_pages = len(PdfReader(io.BytesIO(data)).pages)
    except Exception as e:
        raise UploadError(422, f"could not read the PDF ({type(e).__name__})")
    if n_pages > MAX_PAGES:
        raise UploadError(413, f"PDF has {n_pages} pages; the limit is {MAX_PAGES}")
    if effective_date:
        try:
            date.fromisoformat(effective_date)
        except ValueError:
            raise UploadError(400, "effective_date must be YYYY-MM-DD")
    sha = hashlib.sha256(data).hexdigest()
    con = db.connect()
    dup = con.execute("SELECT doc_id FROM documents WHERE sha256=?", (sha,)).fetchone()
    if dup:
        st = status(dup["doc_id"]) or {"doc_id": dup["doc_id"], "stage": "ready"}
        return dict(st, status="duplicate", doc_id=dup["doc_id"],
                    message="this file is already in the library; nothing was re-ingested")
    doc_id = doc_id or f"UP-{sha[:10]}"
    with _lock:
        running = con.execute("SELECT status FROM upload_jobs WHERE doc_id=?", (doc_id,)).fetchone()
        if running and running["status"] == "running":
            return dict(status(doc_id), message="this file is already being ingested")
        con.execute("DELETE FROM upload_jobs WHERE doc_id=?", (doc_id,))
        coll = collection or DOC_KINDS[doc_kind][0]
        con.execute("INSERT INTO upload_jobs (doc_id, filename, doc_kind, collection, stage, status, counts_json, "
                    "warnings_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (doc_id, filename, doc_kind, coll, "saved", "running", json.dumps({"pages": n_pages, "bytes": len(data)}),
                     "[]", _now(), _now()))
        con.commit()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = UPLOAD_DIR / f"{doc_id}.pdf"
    path.write_bytes(data)
    meta = {"doc_id": doc_id, "path": str(path), "filename": filename, "doc_kind": doc_kind, "collection": coll,
            "source": source, "title": title, "effective_date": effective_date, "sha256": sha}
    audit.append(doc_id, "upload", {"stage": "saved", "filename": filename, "sha256": sha, "doc_kind": doc_kind,
                                    "collection": coll, "pages": n_pages}, actor="upload")
    fut = _worker.submit(_run, meta)
    if wait:
        fut.result()
    return status(doc_id)


def _run(meta):
    doc_id = meta["doc_id"]
    try:
        _ingest(meta)
    except Exception as e:  # nothing was written (rows go in one transaction at the end); say why
        traceback.print_exc()
        _set(doc_id, stage="failed", status="failed", error=f"{type(e).__name__}: {str(e)[:300]}")
        try:
            os.remove(meta["path"])
        except OSError:
            pass


# ---------------- the ingest ----------------
EFFECTIVE = re.compile(r"(?:with effect from|w\.e\.f\.?|effective (?:from|date|on)?:?|comes? into (?:force|effect) "
                       r"(?:on|from)|shall come into force on)\s*[:\-]?\s*([A-Za-z0-9 ,./-]{6,30})", re.I)
DATED = re.compile(r"\b(?:dated|date[d]? of issue|issued on|date:)\s*[:\-]?\s*([A-Za-z0-9 ,./-]{6,30})", re.I)


EFFECTIVE_HI = re.compile(r"(\d{1,2}\s+[a-z]+\s+\d{4})\s+(?:से|को)\s+(?:लागू|प्रभावी)")
DATED_HI = re.compile(r"दिनांक\s*[:\-]?\s*(\d{1,2}\s+[a-z]+\s+\d{4})")


def detect_dates(text):
    """(effective_date, issue_date) found in the first pages, as ISO strings or None. Hindi: 'दिनांक: 15 जुलाई 2026',
    '1 अगस्त 2026 से लागू होगा'."""
    if hindi.is_hindi(text):
        t = hindi.fact_text(text)
        eff = next((parse_date(m.group(1)) for m in EFFECTIVE_HI.finditer(t) if parse_date(m.group(1))), None)
        iss = next((parse_date(m.group(1)) for m in DATED_HI.finditer(t) if parse_date(m.group(1))), None)
        return (eff.isoformat() if eff else None), (iss.isoformat() if iss else None)
    eff = next((parse_date(m.group(1)) for m in EFFECTIVE.finditer(text) if parse_date(m.group(1))), None)
    iss = next((parse_date(m.group(1)) for m in DATED.finditer(text) if parse_date(m.group(1))), None)
    return (eff.isoformat() if eff else None), (iss.isoformat() if iss else None)


def _title_from(pages, filename):
    for p in pages[:1]:
        for ln in p["lines"][:6]:
            t = ln["text"].strip()
            if 8 <= len(t) <= 120 and (re.search(r"[A-Za-z]{3}", t) or (hindi.is_hindi(t, 0.8) and len(t) >= 12)):
                return t
    return re.sub(r"[_-]+", " ", os.path.splitext(filename or "Uploaded document")[0]).strip()[:120]


def _ingest(meta):
    from . import pipeline
    doc_id = meta["doc_id"]
    _set(doc_id, stage="parsing")
    pages = read_pdf(meta["path"], ocr=True)
    ocr_pages = [p["page_no"] for p in pages if p.get("ocr")]
    words = sum(len(ln["words"]) for p in pages for ln in p["lines"])
    garbled = [p["page_no"] for p in pages if p.get("garbled")]
    if garbled:
        _set(doc_id, warnings=[f"page(s) {garbled}: the Hindi text layer was garbled ({pages[garbled[0] - 1]['garbled'][0]}); "
                               f"read again with Hindi OCR"])
    if ocr_pages:
        _set(doc_id, stage="ocr", counts={"ocr_pages": len(ocr_pages), "garbled_hindi_pages": len(garbled)},
             warnings=[f"{len(ocr_pages)} page(s) had no usable text layer and were read by OCR; quotes from them are "
                       f"marked 'OCR text, check the page image'"])
    if not words:
        raise RuntimeError("no text found in the PDF, even with OCR")
    title = meta.get("title") or _title_from(pages, meta.get("filename"))
    first = " ".join(ln["text"] for p in pages[:2] for ln in p["lines"])
    eff, iss = detect_dates(first)
    effective = meta.get("effective_date") or eff or iss or date.today().isoformat()
    chunks, footnotes = chunk_document(doc_id, pages, title)
    if not chunks:
        raise RuntimeError("the PDF has text but no paragraphs could be read from it")
    collection, bank_own = meta["collection"], DOC_KINDS[meta["doc_kind"]][1]
    general = collection != "banking"

    # redact BEFORE any text goes to the model (extraction, search prefixes). Stored text stays original (local only).
    _set(doc_id, stage="redacting")
    texts = [c.text for c in chunks]
    leads = [getattr(c, "lead", "") or "" for c in chunks]
    red_texts, mapping, rhash = privacy.redact(texts + leads)
    red_text, red_lead = red_texts[:len(texts)], red_texts[len(texts):]
    by_label = {}
    for ph in mapping:
        lab = re.sub(r"^<|_\d+>$", "", ph)
        by_label[lab] = by_label.get(lab, 0) + 1
    _set(doc_id, counts={"chunks": len(chunks), "redacted": sum(by_label.values()), "redacted_by_type": by_label})

    _set(doc_id, stage="extracting")
    warnings, cost = [], 0.0
    tuples = {}  # chunk index -> [tuple]
    prefixes = {}
    terms = {}
    try:
        if general:
            from . import general as gen
            terms, c = gen.extract_terms_for(chunks, red_text, red_lead, title, mapping)
            cost += c
        else:
            tuples, c = _extract_tuples(chunks, red_text, red_lead, title, mapping, ocr=bool(ocr_pages))
            cost += c
        prefixes, c = _prefixes(chunks, red_text, red_lead, title)
        cost += c
    except (llm.BudgetExceeded, llm.CacheMiss) as e:
        warnings.append(f"model extraction skipped ({type(e).__name__}): the document is searchable, but rule and "
                        f"conflict checks on it are limited")
    _set(doc_id, counts={"value_tuples": sum(len(v) for v in tuples.values()),
                         "terms": sum(len(v) for v in terms.values()), "prefixes": len(prefixes),
                         "extraction_cost_usd": round(cost, 4)}, warnings=warnings)

    _set(doc_id, stage="indexing")
    con = db.connect()
    con.isolation_level = None
    con.execute("BEGIN IMMEDIATE")
    try:
        m = {"doc_id": doc_id, "path": meta["path"], "title": title, "short": title, "issuer": "uploaded",
             "doc_type": meta["doc_kind"], "issue_date": iss or effective, "effective_date": effective,
             "applies_to": [], "is_synthetic": 1 if bank_own else 0, "source": meta["source"],
             "collection": collection, "doc_kind": meta["doc_kind"]}
        pipeline.ingest_doc(con, m, pages=pages, chunked=(chunks, footnotes))
        for i, c in enumerate(chunks):
            cid = f"{doc_id}:{c.clause_key}"
            if i in prefixes:
                con.execute("UPDATE chunks SET prefix=? WHERE chunk_id=?", (prefixes[i], cid))
            for t in tuples.get(i, []):
                con.execute("""INSERT INTO value_tuples (chunk_id,doc_id,subject,attribute,permitted,value_num,value_text,
                               unit,modality,condition_json,quote,page,verified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)""",
                            (cid, doc_id, t["subject"], "permitted", t["permitted"], t["value_num"],
                             t.get("special_circumstance") or None, t["unit"], t["modality"], json.dumps(t["condition"]),
                             t["quote"], c.pages[0]))
            for t in terms.get(i, []):
                con.execute("""INSERT INTO value_tuples (chunk_id,doc_id,subject,attribute,permitted,value_num,value_text,
                               unit,modality,condition_json,quote,page,verified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)""",
                            (cid, doc_id, "term:" + t["term_key"], t["term"], "n/a", t["value"], t.get("value_text") or None,
                             t["unit"], "none", json.dumps({"condition": t.get("condition", "")}), t["quote"], c.pages[0]))
        links = link_upload(con, doc_id, collection, effective)  # same transaction: no half-linked document
        con.execute("COMMIT")
    except BaseException:
        con.execute("ROLLBACK")
        raise
    db.reset_corpus_hash()
    rows = retrieve._rows_for(db.connect(), {doc_id})
    retrieve._doc_embeddings(doc_id, rows)  # embed only this document's chunks (cached per document)
    retrieve.forget()
    _set(doc_id, stage="linking", counts={"indexed_chunks": len(rows), "links": len(links)})

    _set(doc_id, stage="scanning")
    report = {"links": links, "title": title, "effective_date": effective, "collection": collection,
              "redaction_hash": rhash}
    report.update(scan_upload(doc_id, meta["doc_kind"], collection, effective))
    _set(doc_id, stage="ready", status="ready", report_json=json.dumps(report, default=str),
         counts={"conflicts": len(report.get("conflicts", [])), "impact_items": report.get("impact", {}).get("items", 0)})


def _rehydrate_quote(q, mapping):
    return privacy.rehydrate(q, mapping)


def _extract_tuples(chunks, red_text, red_lead, title, mapping, ocr=False):
    """Banking value tuples (same nano schema as the corpus), quote-checked against the ORIGINAL text after the
    placeholders are put back; OCR text is matched at fuzzy >= 90 instead of 95."""
    from .pipeline import CORE
    jobs = [i for i, c in enumerate(chunks) if c.kind in ("clause", "row_fact", "window") and c.clause_key != "preamble"
            and extract.KEYWORDS.search(c.text) and len(c.text) < 3500]
    out, cost = {}, 0.0

    def work(i):
        user = f"Document: {title}\nContext (lead-in): {red_lead[i] or '-'}\nCLAUSE: {red_text[i]}"
        res, meta = llm.structured(config.LLM_MODEL_EXTRACT, extract.TUPLE_SYSTEM, user, extract.TUPLE_SCHEMA, "value_tuples")
        return i, res, meta

    with ThreadPoolExecutor(4) as ex:
        results = list(ex.map(work, jobs))
    cutoff = 90 if ocr else None
    for i, res, meta in results:
        cost += meta.get("cost", 0.0)
        for t in res["tuples"]:
            t["quote"] = _rehydrate_quote(t["quote"], mapping)
            if extract.locate(t["quote"], chunks[i].text, cutoff) or extract.locate(t["quote"], getattr(chunks[i], "lead", ""), cutoff):
                out.setdefault(i, []).append(t)
    # second opinion (stronger model) on tuples that can drive a conflict, as for the corpus
    for i, ts in out.items():
        for t in ts:
            if t["subject"] in CORE and t["permitted"] in ("yes", "no"):
                q_red = privacy.redact([t["quote"]])[0][0]
                chk, meta = extract.check_tuple(t["subject"], t["permitted"], q_red, red_lead[i], title)
                cost += meta.get("cost", 0.0)
                t["subject"], t["permitted"] = chk["subject"], chk["permitted"]
    return out, cost


def _prefixes(chunks, red_text, red_lead, title):
    from .pipeline import PREFIX_SCHEMA, PREFIX_SYSTEM
    jobs = [i for i, c in enumerate(chunks) if c.kind in ("clause", "row_fact", "table") and len(c.text) > 30]
    out, cost = {}, 0.0

    def work(i):
        c = chunks[i]
        res, meta = llm.structured(config.LLM_MODEL_EXTRACT, PREFIX_SYSTEM,
                                   f"Document: {title}\nSection: {c.breadcrumb}\nLead-in: {(red_lead[i] or '')[-300:]}\n"
                                   f"Chunk: {red_text[i][:700]}", PREFIX_SCHEMA, "chunk_prefix", reasoning_effort="low")
        return i, res["context"], meta.get("cost", 0.0)

    with ThreadPoolExecutor(4) as ex:
        for i, ctx, c in ex.map(work, jobs):
            out[i] = ctx
            cost += c
    return out, cost


# ---------------- linking ----------------
REF_CLAUSE = re.compile(r"\b(?:paragraphs?|paras?|clauses?|sections?|conditions?|articles?)\s+"
                        r"(\d{1,3}(?:\.\d{1,2})*(?:\s?\([\w]{1,4}\))*)", re.I)
SUPERSEDE = re.compile(r"\b(in supersession of|supersedes?|superseded|stands? withdrawn|hereby withdrawn|is withdrawn|"
                       r"shall stand repealed|stands? repealed|is repealed|replaces?)\b", re.I)
AMEND = re.compile(r"\b(shall be substituted|is substituted|stands? substituted|substituted (?:to read|by|with)|"
                   r"stands? amended|is (?:hereby )?amended|shall be read as|shall read as|is replaced by|is modified)\b", re.I)


def _doc_mentions(sentence, others):
    """Other documents a sentence names: by circular/reference number, or by their full short title."""
    s = sentence.lower()
    ns = extract.norm_ref(sentence)
    out = []
    for d in others:
        for ref in (d.get("circular_no"), d.get("ref_no")):
            if ref and len(extract.norm_ref(ref)) >= 6 and extract.norm_ref(ref) in ns:
                out.append(d)
                break
        else:
            short = re.split(r" \(", d["title"])[0].lower()
            words = [w for w in re.findall(r"[a-z0-9]{3,}", short) if w not in ("the", "and", "for", "fictional")]
            if short and (short in s or (len(words) >= 3 and sum(w in s for w in words) / len(words) >= 0.8)):
                out.append(d)
    return out


def link_upload(con, doc_id, collection, effective):
    """Edges from the new document to the library, each with its proof sentence:
    - REFERS_TO: names another document (and a paragraph of it, if that paragraph exists);
    - WITHDRAWS: says it supersedes / withdraws / repeals another document (from its effective date);
    - AMENDED_BY: says a clause of another document is substituted / amended / to be read as (endorsements too).
    A shipped-corpus document is never edited: the edge is applied only to searches that include this upload.
    For another upload or demo document, the amended clause's validity ends on the effective date (undone on delete)."""
    others = [dict(r) for r in con.execute("SELECT doc_id, title, circular_no, ref_no, source, collection FROM documents "
                                           "WHERE doc_id != ? AND (COALESCE(collection,'banking')=? OR ?='banking')",
                                           (doc_id, collection, collection))]
    links = []
    rows = [dict(r) for r in con.execute("SELECT chunk_id, text, pages_json FROM chunks WHERE doc_id=? AND kind!='footnote'",
                                         (doc_id,))]
    for r in rows:
        for a, b in retrieve.split_sentences(r["text"]):
            sent = r["text"][a:b].strip()
            named = _doc_mentions(sent, others)
            if not named:
                continue
            page = json.loads(r["pages_json"])[0]
            for d in named[:2]:
                clauses = [m.group(1).replace(" ", "") for m in REF_CLAUSE.finditer(sent)]
                tgt_chunks = [c for c in (f"{d['doc_id']}:{k}" for k in clauses)
                              if con.execute("SELECT 1 FROM chunks WHERE chunk_id=?", (c,)).fetchone()]
                if AMEND.search(sent) and tgt_chunks:
                    for tc in tgt_chunks:
                        con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,"
                                    "created_by,note) VALUES ('AMENDED_BY',?,?,?,?,?,?,1,'regex',?)",
                                    (tc, r["chunk_id"], effective, sent[:400], doc_id, page, f"upload:{doc_id} amends clause"))
                        if (d.get("source") or "corpus") != "corpus":
                            _end_validity(con, doc_id, tc, effective)
                        links.append({"type": "AMENDED_BY", "target": tc, "by": r["chunk_id"], "effective_date": effective,
                                      "quote": sent[:300], "page": page})
                elif SUPERSEDE.search(sent):
                    con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,"
                                "created_by,note) VALUES ('WITHDRAWS',?,?,?,?,?,?,1,'regex',?)",
                                (doc_id, d["doc_id"], effective, sent[:400], doc_id, page, f"upload:{doc_id} supersedes"))
                    if (d.get("source") or "corpus") != "corpus":
                        for (vid,) in con.execute("SELECT version_id FROM provision_versions WHERE doc_id=?", (d["doc_id"],)).fetchall():
                            _end_validity(con, doc_id, vid, effective, by_version=True)
                    links.append({"type": "WITHDRAWS", "target": d["doc_id"], "by": doc_id, "effective_date": effective,
                                  "quote": sent[:300], "page": page})
                else:
                    dst = tgt_chunks[0] if tgt_chunks else d["doc_id"]
                    con.execute("INSERT INTO edges (type,src,dst,quote,quote_doc_id,quote_page,verified,created_by,note) "
                                "VALUES ('REFERS_TO',?,?,?,?,?,1,'regex',?)",
                                (r["chunk_id"], dst, sent[:400], doc_id, page, f"upload:{doc_id} refers"))
                    links.append({"type": "REFERS_TO", "target": dst, "by": r["chunk_id"], "quote": sent[:300], "page": page})
    return links


def _end_validity(con, upload_id, key, effective, by_version=False):
    """valid_to = effective on the target's current versions, remembering the old value for DELETE."""
    q = "SELECT version_id, valid_to FROM provision_versions WHERE " + ("version_id=?" if by_version else "chunk_id=?")
    for v in con.execute(q, (key,)).fetchall():
        if v["valid_to"] and v["valid_to"] <= effective:
            continue
        con.execute("INSERT INTO upload_effects (upload_doc_id, tbl, row_key, col, old_value) VALUES (?,?,?,?,?)",
                    (upload_id, "provision_versions", v["version_id"], "valid_to", v["valid_to"]))
        con.execute("UPDATE provision_versions SET valid_to=? WHERE version_id=?", (effective, v["version_id"]))


# ---------------- conflict / impact scan ----------------
def scan_upload(doc_id, doc_kind, collection, effective, profile="ucb_tier3"):
    """Bank document -> contradictions against in-force RBI rules (both quotes side by side).
    RBI circular -> impact report against the bank's own documents. Other -> generic term contradictions."""
    from . import contradict, impact
    as_of = max(date.today(), date.fromisoformat(effective))
    if collection != "banking":
        from . import general as gen
        scope = retrieve.core_doc_ids(collection=collection) | {doc_id}
        items = [c for c in gen.conflicts(scope, as_of) if doc_id in (c["a"]["doc_id"], c["b"]["doc_id"])]
        return {"conflicts": items[:20], "as_of": as_of.isoformat()}
    scope = retrieve.core_doc_ids() | {doc_id}
    if DOC_KINDS[doc_kind][1]:
        docs = {r["doc_id"]: r["is_synthetic"] for r in db.connect().execute("SELECT doc_id, is_synthetic FROM documents")}
        items = [c for c in contradict.scan(profile=config.BANK_PROFILES[profile], as_of=as_of, doc_ids=scope)
                 if doc_id in (c["a"]["doc_id"], c["b"]["doc_id"]) and c["verdict"] in ("CONFLICT", "NEEDS_REVIEW")]
        # RBI-vs-upload conflicts first (the compliance finding), then clashes with the bank's other papers
        items.sort(key=lambda c: (c["verdict"] != "CONFLICT",
                                  all(docs.get(x["doc_id"]) for x in (c["a"], c["b"]))))
        return {"conflicts": items[:20], "as_of": as_of.isoformat(), "profile": profile}
    rep = impact.run(doc_id, profile, as_of, suggest_fixes=False, doc_ids=scope)
    return {"impact": {"report_id": rep["report_id"], "items": len(rep["items"]),
                       "conflicts": sum(1 for i in rep["items"] if i["verdict"] == "CONFLICT")},
            "conflicts": [{"verdict": i["verdict"], "subject": i["subject"], "a": i["obligation"], "b": i["internal"]}
                          for i in rep["items"]][:20], "as_of": as_of.isoformat(), "profile": profile}


# ---------------- manage ----------------
def list_uploads(source="upload"):
    con = db.connect()
    rows = [dict(r) for r in con.execute(
        "SELECT d.doc_id, d.title, d.doc_type, d.doc_kind, d.collection, d.source, d.effective_date, d.n_pages, "
        "d.ingested_at, d.ocr_pages, j.status, j.stage FROM documents d LEFT JOIN upload_jobs j USING(doc_id) "
        "WHERE COALESCE(d.source,'corpus')=? ORDER BY d.ingested_at DESC", (source,))]
    seen = {r["doc_id"] for r in rows}
    for j in con.execute("SELECT doc_id, filename, doc_kind, collection, stage, status FROM upload_jobs ORDER BY created_at DESC"):
        if j["doc_id"] not in seen and source == "upload":
            rows.append({"doc_id": j["doc_id"], "title": j["filename"], "doc_kind": j["doc_kind"],
                         "collection": j["collection"], "source": "upload", "status": j["status"], "stage": j["stage"]})
    for r in rows:
        r["ocr_pages"] = json.loads(r.get("ocr_pages") or "[]")
    return rows


def delete(doc_id, actor="officer", allow_demo=False):
    """Remove an upload and everything derived from it; put back any validity it ended. Corpus documents are refused."""
    con = db.connect()
    d = con.execute("SELECT doc_id, title, source, path FROM documents WHERE doc_id=?", (doc_id,)).fetchone()
    job = con.execute("SELECT status FROM upload_jobs WHERE doc_id=?", (doc_id,)).fetchone()
    if not d and not job:
        raise UploadError(404, "unknown document")
    if d and (d["source"] or "corpus") != "upload" and not (allow_demo and d["source"] == "demo"):
        raise UploadError(403, "only uploaded documents can be deleted; the shipped corpus and demo sets are protected")
    if job and job["status"] == "running":
        raise UploadError(409, "this upload is still being ingested; try again when it is ready or failed")
    con.isolation_level = None
    con.execute("BEGIN IMMEDIATE")
    try:
        restored = 0
        for e in con.execute("SELECT * FROM upload_effects WHERE upload_doc_id=? ORDER BY effect_id DESC", (doc_id,)).fetchall():
            if e["tbl"] == "provision_versions" and e["col"] == "valid_to":
                con.execute("UPDATE provision_versions SET valid_to=? WHERE version_id=?", (e["old_value"], e["row_key"]))
                restored += 1
        counts = {t: con.execute(f"SELECT COUNT(*) FROM {t} WHERE doc_id=?", (doc_id,)).fetchone()[0]
                  for t in ("chunks", "value_tuples", "provision_versions")}
        for t in ("chunks", "pages", "provision_versions", "value_tuples", "glossary"):
            con.execute(f"DELETE FROM {t} WHERE doc_id=?", (doc_id,))
        counts["edges"] = con.execute("DELETE FROM edges WHERE quote_doc_id=? OR src=? OR dst=? OR src LIKE ? OR dst LIKE ?",
                                      (doc_id, doc_id, doc_id, doc_id + ":%", doc_id + ":%")).rowcount
        con.execute("DELETE FROM impact_items WHERE report_id IN (SELECT report_id FROM impact_reports WHERE doc_id=?)", (doc_id,))
        con.execute("DELETE FROM impact_reports WHERE doc_id=?", (doc_id,))
        con.execute("DELETE FROM upload_effects WHERE upload_doc_id=?", (doc_id,))
        con.execute("DELETE FROM upload_jobs WHERE doc_id=?", (doc_id,))
        con.execute("DELETE FROM documents WHERE doc_id=?", (doc_id,))
        con.execute("COMMIT")
    except BaseException:
        con.execute("ROLLBACK")
        raise
    if d and d["path"]:
        try:
            os.remove(d["path"])
        except OSError:
            pass
    retrieve.forget(doc_id)
    db.reset_corpus_hash()
    audit.append(doc_id, "upload_deleted", {"title": d["title"] if d else None, "removed": counts,
                                            "validity_restored": restored}, actor=actor)
    return {"doc_id": doc_id, "deleted": True, "removed": counts, "validity_restored": restored}
