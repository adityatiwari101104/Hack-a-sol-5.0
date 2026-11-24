"""FastAPI routes. Run: uvicorn app.api:app --reload  (from backend/)."""
import json
import os
import queue
import sys
import threading
import time
from contextlib import asynccontextmanager
from datetime import date, datetime

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse
from pydantic import BaseModel

from . import audit, config, contradict, db, impact, llm, retrieve, service, uploads


def warm_up():
    """Load every local model once at startup so the first question of a demo is not the 30-60 s one.
    Skip with WARMUP=0 (tests)."""
    from . import privacy, retrieve, verify
    t0 = time.time()
    steps = [("database", lambda: db.corpus_hash()), ("search index", retrieve.index),
             ("embedder", lambda: retrieve.embed(["warm up"], query=True)),
             ("HHEM", lambda: verify.entail("The bank shall not levy charges.", "No charges are levied.")),
             ("MiniCheck", lambda: verify.minicheck("The bank shall not levy charges.", "No charges are levied.")),
             ("Presidio", lambda: privacy.redact(["warm up PAN ABCDE1234F"]))]
    for name, fn in steps:
        try:
            fn()
        except Exception as e:  # a missing optional model must not stop the server
            print(f"warm-up: {name} failed: {type(e).__name__}: {str(e)[:120]}", file=sys.stderr)
    print(f"warm-up done in {time.time() - t0:.1f}s", file=sys.stderr)


@asynccontextmanager
async def lifespan(_app):
    if os.getenv("WARMUP", "1") != "0":
        warm_up()
    yield


app = FastAPI(title="Proof-or-Silence: zero-guessing document AI", version="0.1", lifespan=lifespan)


class AskIn(BaseModel):
    question: str
    as_of: str | None = None
    bank_profile: str = "ucb_tier3"
    slots: dict | None = None
    collection: str = "banking"  # banking | insurance (demo set) | general (your uploads)
    upload_ids: list[str] | None = None  # uploaded documents to search as well
    lang: str | None = None  # "hi" forces a Hindi translation of the verified answer; default: the question's language
    history: list[dict] | None = None  # last 1-3 turns [{question, answer_summary?, query_id?}] for follow-ups
    previous_query_id: str | None = None  # or: the query_id of the previous answer from this server


class ImpactIn(BaseModel):
    doc_id: str
    bank_profile: str = "ucb_tier3"
    as_of: str | None = None


class ReviewIn(BaseModel):
    action: str  # accept | reject | edit (maker decides) | sign_off (a different checker confirms)
    reason: str = ""
    actor: str = "officer"


class RulesIn(BaseModel):
    case: dict = {}  # rate_type, borrower, purpose, facility, amount_inr, sanction_date (same keys as plan.case)
    bank_profile: str = "ucb_tier3"
    as_of: str | None = None
    subjects: list[str] | None = None  # default: every compliance subject
    question: str = ""  # optional: used only to keep product-specific rules (gold loan, microfinance ...) in scope


class IncidentIn(BaseModel):
    query_id: str
    note: str


@app.get("/health")
def health():
    con = db.connect()
    return {"ok": True, "llm_mode": config.LLM_MODE, "models": [config.LLM_MODEL_EXTRACT, config.LLM_MODEL_DRAFT],
            "embed_model": config.EMBED_MODEL, "nli_model": config.NLI_MODEL, "spend_usd": round(llm.spent(), 4),
            "spend_cap_usd": config.SPEND_CAP_USD,
            "corpus_hash": db.corpus_hash(con),
            "documents": con.execute("SELECT COUNT(*) FROM documents").fetchone()[0]}


@app.get("/documents")
def documents(source: str = "corpus", collection: str | None = None):
    """Library. Default: the shipped corpus (unchanged). source=upload -> 'My uploads' (with ingest status);
    source=demo -> pre-loaded demo sets (e.g. collection=insurance); source=all -> everything."""
    if source == "upload":
        rows = uploads.list_uploads("upload")
        return [r for r in rows if not collection or r.get("collection") == collection]
    q = ("SELECT doc_id,title,issuer,doc_type,circular_no,issue_date,effective_date,withdrawn_on,n_pages,is_synthetic,"
         "COALESCE(source,'corpus') AS source, COALESCE(collection,'banking') AS collection, doc_kind FROM documents")
    rows = [dict(r) for r in db.connect().execute(q)]
    if source != "all":
        rows = [r for r in rows if r["source"] == source]
    return [r for r in rows if not collection or r["collection"] == collection]


@app.post("/documents", status_code=202)
async def upload_document(file: UploadFile = File(...), doc_kind: str = Form("other"), title: str | None = Form(None),
                          effective_date: str | None = Form(None)):
    """Upload one PDF (≤ 40 pages, ≤ 20 MB). doc_kind: rbi_circular | bank_policy | loan_agreement | kfs_or_sanction
    (banking collection) | other (general mode). Returns 202 with the job status; poll GET /documents/{id}/status.
    The same file twice -> status 'duplicate' (nothing re-ingested). Then ask with upload_ids=[doc_id]."""
    data = await file.read()
    try:
        return uploads.submit(data, file.filename, doc_kind=doc_kind, title=title or None,
                              effective_date=effective_date or None)
    except uploads.UploadError as e:
        raise HTTPException(e.status, str(e))


@app.get("/documents/{doc_id}/status")
def document_status(doc_id: str):
    st = uploads.status(doc_id)
    if st is None:
        if db.connect().execute("SELECT 1 FROM documents WHERE doc_id=?", (doc_id,)).fetchone():
            return {"doc_id": doc_id, "stage": "ready", "status": "ready", "source": "corpus"}
        raise HTTPException(404)
    return st


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str, actor: str = "officer"):
    """Uploads only: removes its chunks, tuples, edges, index rows and file; undoes validity changes it made; audited."""
    try:
        return uploads.delete(doc_id, actor=actor)
    except uploads.UploadError as e:
        raise HTTPException(e.status, str(e))


@app.get("/documents/{doc_id}/pdf")
def document_pdf(doc_id: str):
    r = db.connect().execute("SELECT path FROM documents WHERE doc_id=?", (doc_id,)).fetchone()
    if not r:
        raise HTTPException(404)
    return FileResponse(r["path"], media_type="application/pdf")


@app.get("/documents/{doc_id}/pages")
def document_pages(doc_id: str):
    """Page sizes in PDF points, so the UI can scale citation bboxes ([x0, top, x1, bottom], same units) onto pages."""
    con = db.connect()
    if not con.execute("SELECT 1 FROM documents WHERE doc_id=?", (doc_id,)).fetchone():
        raise HTTPException(404)
    return {"doc_id": doc_id, "pages": [dict(r) for r in con.execute(
        "SELECT page_no, width, height FROM pages WHERE doc_id=? ORDER BY page_no", (doc_id,))]}


@app.post("/rules")
def simulate_rules(body: RulesIn):
    """Rule simulator: the code-side applicability check for given case facts, with no retrieval and no LLM call.
    Change Tier 3 -> Tier 4 or ₹40 lakh -> ₹80 lakh and watch the findings flip."""
    from .extract import SUBJECTS
    if body.bank_profile not in config.BANK_PROFILES:
        raise HTTPException(400, f"bank_profile must be one of {list(config.BANK_PROFILES)}")
    bad = [x for x in body.subjects or [] if x not in SUBJECTS]
    if bad:
        raise HTTPException(400, f"unknown subject(s) {bad}; use {SUBJECTS}")
    case = {k: v for k, v in body.case.items() if v not in (None, "")}
    if "amount_inr" in case:
        try:
            case["amount_inr"] = float(str(case["amount_inr"]).replace(",", ""))
        except ValueError:
            raise HTTPException(400, "amount_inr must be a number of rupees")
    as_of = date.fromisoformat(body.as_of) if body.as_of else date.today()
    plan = {"subjects": body.subjects or [x for x in SUBJECTS if x != "other"], "case": case,
            "english_question": body.question}
    docs = {r["doc_id"]: dict(r) for r in db.connect().execute("SELECT * FROM documents")}
    rules, gaps = service.rule_findings(plan, as_of, config.BANK_PROFILES[body.bank_profile], docs)
    return {"as_of": as_of.isoformat(), "bank_profile": body.bank_profile, "case": case, "llm_calls": 0,
            "rules": list(rules.values()), "gaps": gaps}


REPLAY_MISS = ("This question was not recorded and the server is in replay mode (LLM_MODE=replay), so it cannot call "
               "the model. Ask one of the recorded demo questions, or restart with LLM_MODE=live (this spends from the "
               "budget).")


def _ask_kwargs(body):
    if body.bank_profile not in config.BANK_PROFILES:
        raise HTTPException(400, f"bank_profile must be one of {list(config.BANK_PROFILES)}")
    try:
        service.resolve_scope(body.collection, body.upload_ids)
    except service.ScopeError as e:
        raise HTTPException(400, str(e))
    kw = dict(question=body.question, as_of=body.as_of, bank_profile=body.bank_profile, slots=body.slots)
    if body.collection != "banking":
        kw["collection"] = body.collection
    if body.upload_ids:
        kw["upload_ids"] = body.upload_ids
    if body.lang:
        kw["lang"] = body.lang
    if body.history:
        kw["history"] = body.history[-3:]
    if body.previous_query_id:
        kw["previous_query_id"] = body.previous_query_id
    return kw


@app.post("/ask")
def ask(body: AskIn):
    kw = _ask_kwargs(body)
    try:
        return service.ask(**kw)
    except llm.BudgetExceeded as e:
        raise HTTPException(429, str(e))
    except llm.CacheMiss:
        raise HTTPException(503, REPLAY_MISS)


@app.post("/ask/stream")
def ask_stream(body: AskIn):
    """Server-sent events. Stage events while the answer is built ('stage': understanding, searching, evidence, rules,
    drafting, verifying, repair); one 'verdict' event per drafted sentence (verdict only, no text); then, after every
    verdict is final, one 'sentence' event per shown sentence, a 'withheld' event, and 'result' with the same JSON as
    POST /ask. Unverified text is never streamed. Errors arrive as an 'error' event with an HTTP-like status."""
    kw = _ask_kwargs(body)
    events = queue.Queue()

    def run():
        try:
            events.put(("result", service.ask(**kw, on_event=lambda ev, data: events.put((ev, data)))))
        except llm.BudgetExceeded as e:
            events.put(("error", {"status": 429, "message": str(e)}))
        except llm.CacheMiss:
            events.put(("error", {"status": 503, "message": REPLAY_MISS}))
        except Exception as e:  # the stream must end with a readable event, never hang
            events.put(("error", {"status": 500, "message": f"{type(e).__name__}: {str(e)[:200]}"}))
        finally:
            events.put(None)

    threading.Thread(target=run, daemon=True).start()

    def gen():
        yield "retry: 3000\n\n"
        while True:
            item = events.get()
            if item is None:
                yield "event: done\ndata: {}\n\n"
                return
            ev, data = item
            yield f"event: {ev}\ndata: {json.dumps(data, ensure_ascii=False, default=str)}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/provisions/{chunk_id:path}/timeline")
def timeline(chunk_id: str, as_of: str | None = None):
    d = date.fromisoformat(as_of) if as_of else date.today()
    con = db.connect()
    vs = [dict(v) for v in con.execute("SELECT * FROM provision_versions WHERE chunk_id=? ORDER BY valid_from", (chunk_id,))]
    edges = [dict(e) for e in con.execute("SELECT * FROM edges WHERE src LIKE ? OR dst LIKE ?", (chunk_id + "%", chunk_id + "%"))]
    return {"chunk_id": chunk_id, "versions": [dict(v, status=service.status_at(v["valid_from"], v["valid_to"], d)) for v in vs],
            "edges": edges}


@app.get("/conflicts")
def conflicts(as_of: str | None = None, profile: str = "ucb_tier3", collection: str = "banking",
              upload_ids: str | None = None):
    """upload_ids: comma-separated uploads to include. collection=insurance|general: generic term contradictions."""
    d = date.fromisoformat(as_of) if as_of else date.today()
    ids = [x for x in (upload_ids or "").split(",") if x]
    try:
        allowed, index_scope = service.resolve_scope(collection, ids)
    except service.ScopeError as e:
        raise HTTPException(400, str(e))
    if collection != "banking":
        from . import general
        rows = general.conflicts(allowed, d)
    else:
        rows = contradict.scan(profile=config.BANK_PROFILES[profile], as_of=d, doc_ids=index_scope)
    return {"as_of": d.isoformat(), "counts": {v: sum(1 for r in rows if r["verdict"] == v) for v in
                                              ("CONFLICT", "NEEDS_REVIEW", "DIFFERENT_CONDITION", "SUPERSESSION", "CONSISTENT")},
            "items": [r for r in rows if r["verdict"] != "CONSISTENT"]}


@app.post("/impact")
def run_impact(body: ImpactIn):
    return impact.run(body.doc_id, body.bank_profile, body.as_of)


@app.get("/impact/{report_id}")
def get_impact(report_id: str):
    rows = [dict(r) for r in db.connect().execute("SELECT * FROM impact_items WHERE report_id=?", (report_id,))]
    if not rows:
        raise HTTPException(404)
    return rows


@app.get("/review-queue")
def review_queue():
    return [dict(r) for r in db.connect().execute(
        "SELECT * FROM impact_items WHERE verdict IN ('CONFLICT','NEEDS_REVIEW') AND review_state!='signed_off'")]


@app.post("/review/{item_id}")
def review(item_id: str, body: ReviewIn):
    states = {"accept": "accepted", "reject": "rejected", "edit": "edited", "sign_off": "signed_off"}
    if body.action not in states:
        raise HTTPException(400, f"action must be one of {list(states)}")
    actor = body.actor.strip()
    if not actor:
        raise HTTPException(400, "actor is required")
    con = db.connect()
    cur = con.execute("SELECT review_state, decided_by FROM impact_items WHERE item_id=?", (item_id,)).fetchone()
    if not cur:
        raise HTTPException(404)
    if cur["review_state"] == "signed_off":
        raise HTTPException(409, "already signed off: no further changes")
    if body.action == "sign_off":
        if cur["review_state"] == "open" or not cur["decided_by"]:
            raise HTTPException(409, "sign-off needs a maker's decision first (accept, reject or edit)")
        if actor == cur["decided_by"]:
            raise HTTPException(409, f"maker-checker: {actor} made the decision, so a different person must sign off")
        con.execute("UPDATE impact_items SET review_state='signed_off', signed_off_by=? WHERE item_id=?", (actor, item_id))
    else:
        con.execute("UPDATE impact_items SET review_state=?, decided_by=? WHERE item_id=?",
                    (states[body.action], actor, item_id))
    con.commit()
    audit.append(item_id, "review", {"action": body.action, "reason": body.reason,
                                     "maker": cur["decided_by"] if body.action == "sign_off" else actor}, actor=actor)
    return {"item_id": item_id, "review_state": states[body.action],
            "decided_by": cur["decided_by"] if body.action == "sign_off" else actor,
            "signed_off_by": actor if body.action == "sign_off" else None}


@app.get("/trace")
def trace_list(limit: int = 50, before_seq: int | None = None):
    """Most recent audit rows first (hashes included) for the audit timeline; page with before_seq."""
    con = db.connect()
    rows = con.execute("SELECT seq, query_id, ts, actor, event_type, model_id, corpus_hash, prev_hash, row_hash "
                       "FROM trace_log" + (" WHERE seq < ?" if before_seq else "") + " ORDER BY seq DESC LIMIT ?",
                       ((before_seq, min(limit, 500)) if before_seq else (min(limit, 500),)))
    return [dict(r) for r in rows]


@app.get("/trace/verify-chain")
def verify_chain():
    return audit.verify_chain()


@app.get("/trace/{query_id}")
def trace(query_id: str):
    return [dict(r, payload=json.loads(r["payload_json"])) for r in audit.export(query_id)]


@app.post("/incidents")
def incident(body: IncidentIn):
    con = db.connect()
    con.execute("INSERT INTO incidents (trace_query_id, note, ts) VALUES (?,?,?)",
                (body.query_id, body.note, datetime.now().isoformat(timespec="seconds")))
    con.commit()
    audit.append(body.query_id, "incident", {"note": body.note}, actor="officer")
    return {"ok": True}


@app.get("/impact/{report_id}/export.md", response_class=PlainTextResponse)
def export_md(report_id: str):
    """Export the stored report as it is (with review state); it is not re-run, so no rows or audit entries are added."""
    rep = impact.load(report_id)
    if rep is None:
        raise HTTPException(404, "unknown report_id; run POST /impact first")
    return impact.export_markdown(rep)


@app.get("/obligations")
def obligations(doc_id: str | None = None, profile: str = "ucb_tier3"):
    """Obligation register: normative RBI tuples (with verified quotes) applicable to the bank profile."""
    from .applicability import ENTITY_OK, product_scope
    prof = config.BANK_PROFILES[profile]
    con = db.connect()
    rows = con.execute("SELECT t.*, c.clause_key, c.breadcrumb, d.title, d.withdrawn_on FROM value_tuples t JOIN chunks c USING(chunk_id) "
                       "JOIN documents d USING(doc_id) WHERE d.is_synthetic=0 AND t.verified=1 AND t.permitted IN ('no','conditional','yes')"
                       + (" AND t.doc_id=?" if doc_id else ""), (doc_id,) if doc_id else ())
    out = []
    for r in rows:
        cond = json.loads(r["condition_json"])
        if not ENTITY_OK.get(cond.get("entity", "any"), lambda p: True)(prof) or product_scope(r["breadcrumb"]):
            continue
        out.append({"doc_id": r["doc_id"], "title": r["title"], "clause": r["clause_key"], "page": r["page"],
                    "subject": r["subject"], "modality": r["modality"], "permitted": r["permitted"], "condition": cond,
                    "special_circumstance": r["value_text"], "quote": r["quote"],
                    "register_status": "repealed" if r["withdrawn_on"] else "in_force"})
    return out


# ---------------- dev-only: tamper demo (DEV_TAMPER=1) ----------------
def _tamper_file():
    return config.DATA / "dev_tamper.json"


def _dev_only():
    if os.getenv("DEV_TAMPER") != "1":
        raise HTTPException(404)  # invisible unless the demo flag is set


@app.post("/dev/tamper/{seq}")
def dev_tamper(seq: int):
    """Edit one audit row's payload in place (as an attacker with database access would) so verify-chain turns red.
    The original text is saved first; POST /dev/restore puts it back byte for byte."""
    _dev_only()
    con = db.connect()
    row = con.execute("SELECT payload_json FROM trace_log WHERE seq=?", (seq,)).fetchone()
    if not row:
        raise HTTPException(404, f"no audit row {seq}")
    saved = json.loads(_tamper_file().read_text()) if _tamper_file().exists() else {}
    saved.setdefault(str(seq), row["payload_json"])  # keep the true original if tampered twice
    _tamper_file().write_text(json.dumps(saved))
    payload = json.loads(row["payload_json"])
    payload["_tampered"] = f"edited outside the application at {datetime.now().isoformat(timespec='seconds')}"
    con.execute("UPDATE trace_log SET payload_json=? WHERE seq=?",
                (json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":")), seq))
    con.commit()
    return {"tampered_seq": seq, "verify_chain": audit.verify_chain()}


@app.post("/dev/restore")
def dev_restore():
    _dev_only()
    if not _tamper_file().exists():
        return {"restored": [], "verify_chain": audit.verify_chain()}
    saved = json.loads(_tamper_file().read_text())
    con = db.connect()
    for seq, original in saved.items():
        con.execute("UPDATE trace_log SET payload_json=? WHERE seq=?", (original, int(seq)))
    con.commit()
    _tamper_file().unlink()
    return {"restored": sorted(int(k) for k in saved), "verify_chain": audit.verify_chain()}
