"""Append-only, hash-chained trace log: row_hash = sha256(prev_hash || canonical_json(row))."""
import hashlib
import json
from datetime import datetime

from . import db

GENESIS = "0" * 64


def _canon(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"), default=str)


def append(query_id, event_type, payload, model_id=None, corpus_hash=None, egress=None, redaction_hash=None, actor="system"):
    con = db.connect()
    prev = con.execute("SELECT row_hash FROM trace_log ORDER BY seq DESC LIMIT 1").fetchone()
    prev_hash = prev[0] if prev else GENESIS
    row = {"query_id": query_id, "ts": datetime.now().isoformat(timespec="seconds"), "actor": actor,
           "event_type": event_type, "payload_json": _canon(payload), "model_id": model_id, "corpus_hash": corpus_hash,
           "egress_manifest_json": _canon(egress or []), "redaction_map_hash": redaction_hash}
    row_hash = hashlib.sha256((prev_hash + _canon(row)).encode()).hexdigest()
    con.execute("""INSERT INTO trace_log (query_id,ts,actor,event_type,payload_json,model_id,corpus_hash,
                   egress_manifest_json,redaction_map_hash,prev_hash,row_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (row["query_id"], row["ts"], actor, event_type, row["payload_json"], model_id, corpus_hash,
                 row["egress_manifest_json"], redaction_hash, prev_hash, row_hash))
    con.commit()
    return row_hash


def verify_chain():
    con = db.connect()
    prev_hash = GENESIS
    n = 0
    for r in con.execute("SELECT * FROM trace_log ORDER BY seq"):
        row = {k: r[k] for k in ("query_id", "ts", "actor", "event_type", "payload_json", "model_id", "corpus_hash",
                                 "egress_manifest_json", "redaction_map_hash")}
        expect = hashlib.sha256((prev_hash + _canon(row)).encode()).hexdigest()
        if r["prev_hash"] != prev_hash or r["row_hash"] != expect:
            return {"ok": False, "broken_at_seq": r["seq"], "checked": n}
        prev_hash = r["row_hash"]
        n += 1
    return {"ok": True, "checked": n}


def export(query_id):
    con = db.connect()
    return [dict(r) for r in con.execute("SELECT * FROM trace_log WHERE query_id=? ORDER BY seq", (query_id,))]
