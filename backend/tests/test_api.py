"""API smoke tests against the ingested corpus (no LLM calls: health, documents, timeline, conflicts, trace chain,
review maker-checker)."""
import pytest
from fastapi.testclient import TestClient

from app import audit, config
from app.api import app

pytestmark = pytest.mark.skipif(not config.DB_PATH.exists(), reason="run `python -m app.pipeline` first")
client = TestClient(app)


def test_health_and_documents():
    h = client.get("/health").json()
    assert h["ok"] and h["documents"] >= 20 and h["spend_usd"] <= h["spend_cap_usd"]
    docs = client.get("/documents").json()
    assert any(d["doc_id"] == "RBI-UCB-RBC-MD-2025" for d in docs)
    withdrawn = {d["doc_id"]: d["withdrawn_on"] for d in docs}
    assert withdrawn["RBI-PREPAY-DIR-2025"] == "2025-11-28"


def test_amendment_timeline_from_footnotes():
    t = client.get("/provisions/RBI-EMI-RESET-2023:2(ii)/timeline", params={"as_of": "2025-09-15"}).json()
    statuses = {v["op"]: v["status"] for v in t["versions"]}
    assert statuses == {"original": "IN_FORCE", "substitute": "NOT_YET_IN_FORCE"}
    t2 = client.get("/provisions/RBI-EMI-RESET-2023:2(ii)/timeline", params={"as_of": "2025-10-15"}).json()
    assert {v["op"]: v["status"] for v in t2["versions"]} == {"original": "SUPERSEDED", "substitute": "IN_FORCE"}
    assert any(e["type"] == "AMENDED_BY" and "Substituted vide" in e["quote"] for e in t["edges"])


def test_conflicts_find_planted_ones_and_spare_different_condition():
    c = client.get("/conflicts", params={"as_of": "2026-11-23", "profile": "ucb_tier3"}).json()
    pairs = {(i["a"]["doc_id"], i["a"]["clause"], i["b"]["doc_id"], i["b"]["clause"], i["verdict"]) for i in c["items"]}
    flat = {(x[0], x[1], x[4]) for x in pairs} | {(x[2], x[3], x[4]) for x in pairs}
    assert ("EUCB-S1", "7.4", "CONFLICT") in flat
    assert not any(d == "EUCB-S6" and cl == "3.1" and v == "CONFLICT" for d, cl, v in flat)


def test_trace_chain_detects_tampering():
    audit.append("unit-test", "test", {"x": 1})
    assert client.get("/trace/verify-chain").json()["ok"]
    from app import db
    con = db.connect()
    seq = con.execute("SELECT MAX(seq) FROM trace_log").fetchone()[0]
    con.execute("UPDATE trace_log SET payload_json='{\"x\":2}' WHERE seq=?", (seq,))
    con.commit()
    r = client.get("/trace/verify-chain").json()
    assert not r["ok"] and r["broken_at_seq"] == seq
    con.execute("DELETE FROM trace_log WHERE seq=?", (seq,))  # restore a valid chain
    con.commit()
    assert client.get("/trace/verify-chain").json()["ok"]
