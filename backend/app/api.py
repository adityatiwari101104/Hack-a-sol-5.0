"""FastAPI routes. Run: uvicorn app.api:app --reload  (from backend/)."""
import json
from datetime import date, datetime

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel

from . import audit, config, contradict, db, impact, llm, service

app = FastAPI(title="Proof-or-Silence: zero-guessing document AI", version="0.1")


class AskIn(BaseModel):
    question: str
    as_of: str | None = None
    bank_profile: str = "ucb_tier3"
    slots: dict | None = None


class ImpactIn(BaseModel):
    doc_id: str
    bank_profile: str = "ucb_tier3"
    as_of: str | None = None


class ReviewIn(BaseModel):
    action: str  # accept | reject | edit | sign_off
    reason: str = ""
    actor: str = "officer"


class IncidentIn(BaseModel):
    query_id: str
    note: str


@app.get("/health")
def health():
    con = db.connect()
    corpus = con.execute("SELECT group_concat(sha256, '') FROM (SELECT sha256 FROM documents ORDER BY doc_id)").fetchone()[0]
    import hashlib
    return {"ok": True, "llm_mode": config.LLM_MODE, "models": [config.LLM_MODEL_EXTRACT, config.LLM_MODEL_DRAFT],
            "embed_model": config.EMBED_MODEL, "nli_model": config.NLI_MODEL, "spend_usd": round(llm.spent(), 4),
            "spend_cap_usd": config.SPEND_CAP_USD,
            "corpus_hash": hashlib.sha256((corpus or "").encode()).hexdigest()[:16],
            "documents": con.execute("SELECT COUNT(*) FROM documents").fetchone()[0]}


@app.get("/documents")
def documents():
    return [dict(r) for r in db.connect().execute(
        "SELECT doc_id,title,issuer,doc_type,circular_no,issue_date,effective_date,withdrawn_on,n_pages,is_synthetic FROM documents")]


@app.get("/documents/{doc_id}/pdf")
def document_pdf(doc_id: str):
    r = db.connect().execute("SELECT path FROM documents WHERE doc_id=?", (doc_id,)).fetchone()
    if not r:
        raise HTTPException(404)
    return FileResponse(r["path"], media_type="application/pdf")


@app.post("/ask")
def ask(body: AskIn):
    if body.bank_profile not in config.BANK_PROFILES:
        raise HTTPException(400, f"bank_profile must be one of {list(config.BANK_PROFILES)}")
    try:
        return service.ask(body.question, body.as_of, body.bank_profile, body.slots)
    except llm.BudgetExceeded as e:
        raise HTTPException(429, str(e))


@app.get("/provisions/{chunk_id:path}/timeline")
def timeline(chunk_id: str, as_of: str | None = None):
    d = date.fromisoformat(as_of) if as_of else date.today()
    con = db.connect()
    vs = [dict(v) for v in con.execute("SELECT * FROM provision_versions WHERE chunk_id=? ORDER BY valid_from", (chunk_id,))]
    edges = [dict(e) for e in con.execute("SELECT * FROM edges WHERE src LIKE ? OR dst LIKE ?", (chunk_id + "%", chunk_id + "%"))]
    return {"chunk_id": chunk_id, "versions": [dict(v, status=service.status_at(v["valid_from"], v["valid_to"], d)) for v in vs],
            "edges": edges}


@app.get("/conflicts")
def conflicts(as_of: str | None = None, profile: str = "ucb_tier3"):
    d = date.fromisoformat(as_of) if as_of else date.today()
    rows = contradict.scan(profile=config.BANK_PROFILES[profile], as_of=d)
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
    con = db.connect()
    cur = con.execute("SELECT review_state FROM impact_items WHERE item_id=?", (item_id,)).fetchone()
    if not cur:
        raise HTTPException(404)
    if body.action == "sign_off" and (body.actor == "officer" or cur["review_state"] == "open"):
        raise HTTPException(409, "sign-off needs a checker after the officer's decision (maker-checker)")
    con.execute("UPDATE impact_items SET review_state=? WHERE item_id=?", (states[body.action], item_id))
    con.commit()
    audit.append(item_id, "review", {"action": body.action, "reason": body.reason}, actor=body.actor)
    return {"item_id": item_id, "review_state": states[body.action]}


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
def export_md(report_id: str, doc_id: str, profile: str = "ucb_tier3"):
    return impact.export_markdown(impact.run(doc_id, profile, suggest_fixes=False))
