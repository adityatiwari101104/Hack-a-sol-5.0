"""Baseline: plain RAG. Dense top-5 chunks, one prompt ("answer and quote your sources"), no gates, no version or
applicability logic, no verifier. Graded with the same metrics, including the deterministic fabricated-quote check."""
import json
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import config, llm, retrieve  # noqa: E402
from app.extract import locate  # noqa: E402

SCHEMA = {"type": "object", "additionalProperties": False, "required": ["answer_sentences"],
          "properties": {"answer_sentences": {"type": "array", "items": {
              "type": "object", "additionalProperties": False, "required": ["text", "source", "quote"],
              "properties": {"text": {"type": "string"}, "source": {"type": "string", "description": "S1..S5"},
                             "quote": {"type": "string", "description": "verbatim quote from the source"}}}}}}
SYSTEM = "Answer the question using the sources. For each sentence give the source id and a verbatim supporting quote."


def ask(question, as_of=None, bank_profile=None):
    t0 = time.time()
    st = retrieve.index()
    qv = retrieve.embed([question], query=True)[0]
    top = (st["emb"] @ qv).argsort()[::-1][:5]
    rows = [st["rows"][i] for i in top]
    src = "\n".join(f"S{i + 1} [{r['title']}, para {r['clause_key']}]: {r['text'][:1500]}" for i, r in enumerate(rows))
    out, _ = llm.structured(config.LLM_MODEL_DRAFT, SYSTEM, f"Question: {question}\n\nSources:\n{src}", SCHEMA, "baseline_answer")
    sents = []
    for s in out["answer_sentences"]:
        try:
            r = rows[int(s["source"].strip().lstrip("S")) - 1]
        except (ValueError, IndexError):
            r = None
        sents.append({"text": s["text"], "verdict": "PASS", "citations": [{
            "eid": s["source"], "doc_id": r["doc_id"] if r else "?", "clause": r["clause_key"] if r else "",
            "page": json.loads(r["pages_json"])[0] if r else None, "text": s["quote"], "status": "?",
            "located": bool(r) and locate(s["quote"], r["text"])}]})
    return {"query_id": uuid.uuid4().hex[:12], "outcome": "ANSWER" if sents else "ABSTAIN", "sentences": sents,
            "blocked": [], "missing": [], "conflicts": [], "faithfulness": {}, "latency_ms": int((time.time() - t0) * 1000)}
