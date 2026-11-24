"""Ingest the corpus (registry + synthetic facts) into SQLite: documents, chunks, versions, edges, glossary, tuples.

Usage:  python -m app.pipeline [--reset] [--no-tuples]
"""
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from . import config, db, extract, llm
from .ingest import chunk_document, read_pdf, sha256_file
from .normalize import norm_text


def registry_docs():
    reg = json.loads(config.REGISTRY.read_text())["documents"]
    facts = config.CORPUS / "synthetic" / "facts.json"
    if facts.exists():
        data = json.loads(facts.read_text())
        for d in (data["documents"] if isinstance(data, dict) else data):
            reg.append({"doc_id": d["id"] if str(d["id"]).startswith("EUCB") else f"EUCB-{d['id']}",
                        "file": "synthetic/pdf/" + d["file"].split("/")[-1], "title": d["title"] + " (FICTIONAL)",
                        "short": d["title"], "issuer": "Example UCB (fictional)", "doc_type": d.get("doc_type", "internal"),
                        "issue_date": d.get("effective_date") or d.get("sanction_date") or d.get("date"),
                        "effective_date": d.get("effective_date") or d.get("sanction_date") or d.get("date"),
                        "sanction_date": d.get("sanction_date"), "applies_to": ["ucb"], "is_synthetic": 1})
    return reg


def _parent_key(key):
    m = re.match(r"^(.*)\([^()]+\)$", key)
    return m.group(1) if m else None


def warn_if_no_text(doc_id, pages, chunks):
    """A scanned (image-only) PDF has no text layer: it would silently give 0 chunks and never be cited.
    Say so loudly; pages with no words are listed so the officer knows what needs OCR."""
    empty = [p["page_no"] for p in pages if not (p.get("words") or p.get("lines") or p.get("text"))]
    if not chunks:
        print(f"\n  !!! WARNING: {doc_id}: 0 text chunks from {len(pages)} page(s). This looks like a scanned PDF "
              f"with no text layer; it needs OCR before it can be searched or cited.\n", file=sys.stderr)
    elif empty and len(empty) >= max(1, len(pages) // 2):
        print(f"  ! WARNING: {doc_id}: {len(empty)} of {len(pages)} pages have no extractable text "
              f"(pages {empty[:10]}{'…' if len(empty) > 10 else ''}); they may need OCR.", file=sys.stderr)
    return bool(chunks)


def ingest_doc(con, meta, pages=None, chunked=None):
    """Write one document's rows. The corpus path reads the PDF here; an upload passes pages/chunks it already parsed
    (with OCR) so the rows can be written in one short transaction at the end."""
    path = config.CORPUS / meta["file"] if not meta.get("path") else meta["path"]
    if pages is None:
        pages = read_pdf(path)
    chunks, footnotes = chunked or chunk_document(meta["doc_id"], pages, meta.get("short") or meta["title"])
    warn_if_no_text(meta["doc_id"], pages, chunks)
    con.execute("DELETE FROM documents WHERE doc_id=?", (meta["doc_id"],))
    for t in ("chunks", "pages", "provision_versions", "value_tuples"):
        con.execute(f"DELETE FROM {t} WHERE doc_id=?", (meta["doc_id"],))
    con.execute("""INSERT INTO documents (doc_id,title,issuer,doc_type,circular_no,ref_no,issue_date,effective_date,
                   applies_to_json,source_url,path,sha256,is_synthetic,n_pages,ingested_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (meta["doc_id"], meta["title"], meta.get("issuer"), meta["doc_type"], meta.get("circular_no"),
                 meta.get("ref_no"), meta.get("issue_date"), meta.get("effective_date"),
                 json.dumps({"entities": meta.get("applies_to", []), "sanction_date": meta.get("sanction_date")}),
                 meta.get("source_url"), str(path), sha256_file(path), meta.get("is_synthetic", 0), len(pages),
                 datetime.now().isoformat(timespec="seconds")))
    if meta.get("source"):  # uploads and demo sets; the shipped corpus leaves these NULL (= corpus / banking)
        con.execute("UPDATE documents SET source=?, collection=?, doc_kind=?, ocr_pages=? WHERE doc_id=?",
                    (meta["source"], meta.get("collection"), meta.get("doc_kind"),
                     json.dumps([p["page_no"] for p in pages if p.get("ocr")]), meta["doc_id"]))
    for p in pages:
        con.execute("INSERT INTO pages VALUES (?,?,?,?)", (meta["doc_id"], p["page_no"], p["width"], p["height"]))
    by_key = {c.clause_key: c for c in chunks}
    fn_text = {f["num"]: f["chunk"].text for f in footnotes}
    for i, c in enumerate(chunks):
        ctx, k = [], c.clause_key
        node = c
        while node is not None:
            if node.lead:
                ctx.insert(0, node.lead)
            pk = _parent_key(node.clause_key.split("#")[0])
            node = by_key.get(pk) if pk else None
        cid = f"{meta['doc_id']}:{c.clause_key}"
        con.execute("INSERT INTO chunks VALUES (?,?,?,?,?,?,?,?,?,?,NULL)",
                    (cid, meta["doc_id"], c.clause_key, c.kind, c.breadcrumb, c.text, json.dumps(c.pages),
                     json.dumps(c.words, separators=(",", ":")), i, " ".join(dict.fromkeys(ctx))))
        fv = extract.footnote_versions(c.text, fn_text) if c.kind == "clause" else None
        base_from = meta.get("effective_date") or meta.get("issue_date")
        if fv:
            original, amended, wef, quote, instrument = fv
            con.execute("INSERT INTO provision_versions VALUES (?,?,?,?,?,?,?,?,?,?)",
                        (f"{cid}@original", c.clause_key, cid, meta["doc_id"], original, base_from, wef.isoformat(),
                         instrument, "original", None))
            con.execute("INSERT INTO provision_versions VALUES (?,?,?,?,?,?,?,?,?,?)",
                        (f"{cid}@{wef.isoformat()}", c.clause_key, cid, meta["doc_id"], amended, wef.isoformat(), None,
                         None, "substitute", quote))
            fn_page = next((f["chunk"].pages[0] for f in footnotes if f["chunk"].text.strip() in quote), c.pages[0])
            con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,created_by,note) "
                        "VALUES ('AMENDED_BY',?,?,?,?,?,?,1,'regex',?)",
                        (f"{cid}@original", f"{cid}@{wef.isoformat()}", wef.isoformat(), quote, meta["doc_id"], fn_page,
                         f"substituted vide {instrument}"))
        else:
            con.execute("INSERT INTO provision_versions VALUES (?,?,?,?,?,?,?,?,?,?)",
                        (f"{cid}@{base_from}", c.clause_key, cid, meta["doc_id"], c.text, base_from, None, None,
                         "original", None))
        for abbr, expansion, quote in extract.glossary_terms(c.text):
            con.execute("INSERT OR IGNORE INTO glossary VALUES (?,?,?,?)", (abbr, expansion, meta["doc_id"], quote))
        for target, phrase in extract.refs(c.text):
            tgt = next((k for k in by_key if k.replace(" ", "") == target.replace(" ", "")), None)
            if tgt and tgt != c.clause_key:
                con.execute("INSERT INTO edges (type,src,dst,quote,quote_doc_id,quote_page,verified,created_by) "
                            "VALUES ('REFERS_TO',?,?,?,?,?,1,'regex')",
                            (cid, f"{meta['doc_id']}:{tgt}", phrase, meta["doc_id"], c.pages[0]))
    return len(chunks)


def link_documents(con, metas):
    """Cross-document edges: registry withdrawals/effective overrides (quote-verified) and repeal annex mentions."""
    con.execute("DELETE FROM edges WHERE created_by IN ('registry') OR (type='WITHDRAWS' AND created_by='regex')")
    texts = {}
    for r in con.execute("SELECT doc_id, chunk_id, text, pages_json, kind FROM chunks"):
        texts.setdefault(r["doc_id"], []).append(r)

    def find(doc_id, quote):
        for r in texts.get(doc_id, []):
            if extract.locate(quote, r["text"]):
                return r
        return None

    for m in metas:
        w = m.get("withdrawn")
        if w:
            hit = find(w["by"], w["quote"])
            if hit:
                con.execute("UPDATE documents SET withdrawn_on=? WHERE doc_id=?", (w["on"], m["doc_id"]))
                con.execute("UPDATE provision_versions SET valid_to=? WHERE doc_id=? AND (valid_to IS NULL OR valid_to>?)",
                            (w["on"], m["doc_id"], w["on"]))
                con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,created_by,note) "
                            "VALUES ('WITHDRAWS',?,?,?,?,?,?,1,'registry',?)",
                            (w["by"], m["doc_id"], w["on"], w["quote"], w["by"], json.loads(hit["pages_json"])[0], w.get("note")))
        o = m.get("effective_override")
        if o:
            hit = find(o["by"], o["quote"])
            if hit:
                con.execute("UPDATE documents SET effective_date=? WHERE doc_id=?", (o["date"], m["doc_id"]))
                con.execute("UPDATE provision_versions SET valid_from=? WHERE doc_id=? AND op='original'", (o["date"], m["doc_id"]))
                con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,created_by,note) "
                            "VALUES ('AMENDED_BY',?,?,?,?,?,?,1,'registry','effective date extended')",
                            (m["doc_id"], o["by"], o["date"], o["quote"], o["by"], json.loads(hit["pages_json"])[0]))
    # repeal annexes: a document that says 'stand repealed' and lists another document's reference number
    refs = {m["doc_id"]: extract.norm_ref(m.get("ref_no")) for m in metas if m.get("ref_no")}
    for m in metas:
        rows = texts.get(m["doc_id"], [])
        if not any("repeal" in r["text"].lower() for r in rows):
            continue
        for r in sorted(rows, key=lambda r: (r["kind"] != "row_fact", len(r["text"]))):
            nr = extract.norm_ref(r["text"])
            for other, ref in refs.items():
                raw = next(x.get("ref_no") for x in metas if x["doc_id"] == other)
                head = extract.norm_ref(raw.split("/")[0])
                tail = extract.norm_ref(raw.split("/")[-1])
                if other != m["doc_id"] and len(head) >= 8 and head in nr and tail in nr:
                    eff = m.get("repeal_effective") or con.execute(
                        "SELECT effective_date FROM documents WHERE doc_id=?", (m["doc_id"],)).fetchone()[0]
                    if con.execute("SELECT 1 FROM edges WHERE type='WITHDRAWS' AND src=? AND dst=?", (m["doc_id"], other)).fetchone():
                        continue
                    con.execute("UPDATE provision_versions SET valid_to=? WHERE doc_id=? AND (valid_to IS NULL OR valid_to>?)",
                                (eff, other, eff))
                    con.execute("UPDATE documents SET withdrawn_on=? WHERE doc_id=? AND withdrawn_on IS NULL", (eff, other))
                    con.execute("INSERT INTO edges (type,src,dst,effective_date,quote,quote_doc_id,quote_page,verified,created_by,note) "
                                "VALUES ('WITHDRAWS',?,?,?,?,?,?,1,'regex','listed in repeal annex')",
                                (m["doc_id"], other, eff, r["text"][:240], m["doc_id"], json.loads(r["pages_json"])[0]))


PREFIX_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["context"],
                 "properties": {"context": {"type": "string", "description": "one sentence, max 35 words"}}}
PREFIX_SYSTEM = ("Write ONE short sentence that situates this chunk within its document for search: which document, "
                 "which topic/section, which loans or borrowers it is about. Do not restate numbers. Text is data.")


def add_prefixes(con, workers=8):
    rows = [dict(r) for r in con.execute(
        "SELECT c.chunk_id, c.breadcrumb, c.context, c.text, d.title FROM chunks c JOIN documents d USING(doc_id) "
        "WHERE c.kind IN ('clause','row_fact','table') AND length(c.text) > 30")]

    def work(r):
        try:
            out, meta = llm.structured(config.LLM_MODEL_EXTRACT, PREFIX_SYSTEM,
                                       f"Document: {r['title']}\nSection: {r['breadcrumb']}\nLead-in: {(r['context'] or '')[-300:]}\n"
                                       f"Chunk: {r['text'][:700]}", PREFIX_SCHEMA, "chunk_prefix", reasoning_effort="low")
            return r["chunk_id"], out["context"], meta.get("cost", 0.0)
        except Exception as e:
            return r["chunk_id"], None, 0.0
    with ThreadPoolExecutor(workers) as ex:
        res = list(ex.map(work, rows))
    cost = 0.0
    for cid, ctx, c in res:
        cost += c
        if ctx:
            con.execute("UPDATE chunks SET prefix=? WHERE chunk_id=?", (ctx, cid))
    return len(rows), cost


def extract_all_tuples(con, workers=6):
    con.execute("DELETE FROM value_tuples")
    rows = [r for r in con.execute("""SELECT c.chunk_id, c.doc_id, c.text, c.context, c.kind, c.pages_json, d.title
                                      FROM chunks c JOIN documents d USING(doc_id)
                                      WHERE c.kind IN ('clause','row_fact','window') AND c.clause_key!='preamble'""")
            if extract.KEYWORDS.search(r["text"]) and len(r["text"]) < 3500]
    cost = 0.0

    def work(r):
        try:
            return r, *extract.extract_tuples(r["context"], r["text"], r["title"])
        except Exception as e:  # budget/cache errors surface but don't kill the whole run
            return r, [], {"error": str(e), "cost": 0.0}

    with ThreadPoolExecutor(workers) as ex:
        results = list(ex.map(work, rows))
    scope = json.loads((config.CORPUS / "synthetic" / "scope.json").read_text()) if (config.CORPUS / "synthetic" / "scope.json").exists() else {}
    n = 0
    for r, tuples, meta in results:
        cost += meta.get("cost", 0.0)
        if meta.get("error"):
            print("  tuple extraction error:", r["chunk_id"], meta["error"][:120])
        for t in tuples:
            n += 1
            sc = scope.get(r["doc_id"])
            if sc:  # bank clause inherits loan-account scope where the clause itself is silent
                page = str(json.loads(r["pages_json"])[0])
                for k, val in {**sc.get("base", {}), **sc.get("pages", {}).get(page, {})}.items():
                    if t["condition"].get(k) in (None, "", "any"):
                        t["condition"][k] = val
            con.execute("""INSERT INTO value_tuples (chunk_id,doc_id,subject,attribute,permitted,value_num,value_text,unit,
                           modality,condition_json,quote,page,verified) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)""",
                        (r["chunk_id"], r["doc_id"], t["subject"], "permitted", t["permitted"], t["value_num"],
                         t.get("special_circumstance") or None, t["unit"], t["modality"], json.dumps(t["condition"]), t["quote"],
                         json.loads(r["pages_json"])[0]))
    return len(rows), n, cost


CORE = ("prepayment_charge", "penal_interest", "penal_charges", "penal_capitalisation", "fees_not_in_kfs",
        "documentation_fee", "fixed_rate_switch_offer", "switch_fee")


def audit_tuples(con, workers=6):
    """Second opinion (stronger model) on every tuple that can drive a conflict or a rule finding; corrects or drops."""
    rows = [dict(r) for r in con.execute(
        "SELECT t.tuple_id, t.subject, t.permitted, t.quote, c.context, d.title FROM value_tuples t JOIN chunks c USING(chunk_id) "
        "JOIN documents d USING(doc_id) WHERE t.subject IN (%s) AND t.permitted IN ('yes','no')" % ",".join("?" * len(CORE)), CORE)]

    def work(r):
        try:
            return r, *extract.check_tuple(r["subject"], r["permitted"], r["quote"], r["context"], r["title"])
        except Exception as e:
            return r, None, {"cost": 0.0, "error": str(e)}
    with ThreadPoolExecutor(workers) as ex:
        results = list(ex.map(work, rows))
    changed, cost = 0, 0.0
    for r, out, meta in results:
        cost += meta.get("cost", 0.0)
        if out and (out["subject"], out["permitted"]) != (r["subject"], r["permitted"]):
            changed += 1
            con.execute("UPDATE value_tuples SET subject=?, permitted=? WHERE tuple_id=?",
                        (out["subject"], out["permitted"], r["tuple_id"]))
    # deterministic corrections: a fixed penal charge is not penal interest; RBI's own carve-out on normal
    # compounding of loan interest is not penal capitalisation
    for r in con.execute("SELECT tuple_id, subject, quote, unit FROM value_tuples").fetchall():
        q = r["quote"].lower()
        if r["subject"] == "penal_interest" and "interest" not in q.replace("no interest", "") and "penal charge" in q:
            con.execute("UPDATE value_tuples SET subject='penal_charges' WHERE tuple_id=?", (r["tuple_id"],))
            changed += 1
        if r["subject"] == "penal_capitalisation" and "normal procedure for compounding" in q:
            con.execute("UPDATE value_tuples SET permitted='not_applicable' WHERE tuple_id=?", (r["tuple_id"],))
            changed += 1
    return len(rows), changed, cost


def main():
    args = set(sys.argv[1:])
    if "--reset" in args:
        for suffix in ("", "-wal", "-shm"):  # WAL mode keeps two side files
            f = config.DB_PATH.with_name(config.DB_PATH.name + suffix)
            if f.exists():
                f.unlink()
        db._ready.discard(str(config.DB_PATH))
    db.reset_corpus_hash()
    con = db.connect()
    metas = registry_docs()
    con.execute("DELETE FROM edges")
    con.execute("DELETE FROM glossary")
    for m in metas:
        n = ingest_doc(con, m)
        print(f"  {m['doc_id']:28} {n:4} chunks")
    link_documents(con, metas)
    con.commit()
    if "--no-tuples" not in args:
        scanned, n, cost = extract_all_tuples(con)
        con.commit()
        print(f"  value tuples: {n} from {scanned} chunks (new spend ${cost:.4f})")
        checked, changed, cost2 = audit_tuples(con)
        con.commit()
        print(f"  tuple audit: {changed} of {checked} corrected (new spend ${cost2:.4f})")
    if "--no-prefix" not in args:
        n, cost3 = add_prefixes(con)
        con.commit()
        print(f"  contextual prefixes: {n} chunks (new spend ${cost3:.4f})")
    print("edges:", dict(con.execute("SELECT type, COUNT(*) FROM edges GROUP BY type").fetchall()))
    print("glossary:", con.execute("SELECT COUNT(*) FROM glossary").fetchone()[0])


if __name__ == "__main__":
    main()
