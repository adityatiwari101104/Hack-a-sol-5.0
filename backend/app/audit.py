"""Append-only, hash-chained trace log: row_hash = sha256(prev_hash || canonical_json(row))."""
import hashlib
import json
from datetime import datetime

import threading

from . import db

_lock = threading.Lock()

GENESIS = "0" * 64


def _canon(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"), default=str)


def append(query_id, event_type, payload, model_id=None, corpus_hash=None, egress=None, redaction_hash=None, actor="system"):
    with _lock:  # the chain must be appended serially
        return _append(query_id, event_type, payload, model_id, corpus_hash, egress, redaction_hash, actor)


def _append(query_id, event_type, payload, model_id, corpus_hash, egress, redaction_hash, actor):
    con = db.connect()
    # BEGIN IMMEDIATE takes SQLite's write lock BEFORE reading the last hash, so two PROCESSES (API + an eval run)
    # cannot both chain onto the same row. The thread lock above only covered one process.
    con.isolation_level = None
    con.execute("BEGIN IMMEDIATE")
    try:
        row_hash = _append_locked(con, query_id, event_type, payload, model_id, corpus_hash, egress, redaction_hash, actor)
        con.execute("COMMIT")
        return row_hash
    except BaseException:
        con.execute("ROLLBACK")
        raise


def _append_locked(con, query_id, event_type, payload, model_id, corpus_hash, egress, redaction_hash, actor):
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
    return row_hash


def chain_breaks():
    """Every row whose prev_hash/row_hash does not follow from the row before it (verify_chain stops at the first)."""
    con = db.connect()
    prev_hash, out = GENESIS, []
    for r in con.execute("SELECT * FROM trace_log ORDER BY seq"):
        row = {k: r[k] for k in ("query_id", "ts", "actor", "event_type", "payload_json", "model_id", "corpus_hash",
                                 "egress_manifest_json", "redaction_map_hash")}
        expect = hashlib.sha256((prev_hash + _canon(row)).encode()).hexdigest()
        if r["prev_hash"] != prev_hash or r["row_hash"] != expect:
            out.append({"seq": r["seq"], "ts": r["ts"], "fork": r["prev_hash"] != prev_hash and r["row_hash"] ==
                        hashlib.sha256((r["prev_hash"] + _canon(row)).encode()).hexdigest()})
        prev_hash = r["row_hash"]
    return out


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


def archive_and_restart(reason, actor="admin"):
    """Start a fresh chain WITHOUT editing history: back up the database, export every trace_log row to a JSONL file
    (sha256 recorded), move the rows into trace_log_archive, then write a 'genesis' row that names the archive file,
    its sha256, the row range and the last row_hash, so the new chain is anchored to the old one."""
    import sqlite3
    from datetime import datetime
    from pathlib import Path

    from . import config
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = config.DATA / f"aiml02.backup-before-audit-archive-{stamp}.sqlite"
    src, dst = sqlite3.connect(config.DB_PATH), sqlite3.connect(backup)
    src.backup(dst)
    dst.close()
    src.close()
    with _lock:
        con = db.connect()
        con.isolation_level = None
        con.execute("BEGIN IMMEDIATE")  # nobody can append while the log is moved
        try:
            before = verify_chain_con(con)
            rows = [dict(r) for r in con.execute("SELECT * FROM trace_log ORDER BY seq")]
            out = Path(config.DATA) / "audit_archive"
            out.mkdir(parents=True, exist_ok=True)
            f = out / f"trace_log_until_{stamp}.jsonl"
            f.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in rows))
            sha = hashlib.sha256(f.read_bytes()).hexdigest()
            cols = [c[1] for c in con.execute("PRAGMA table_info(trace_log)")]
            con.execute(f"CREATE TABLE IF NOT EXISTS trace_log_archive ({', '.join(cols)}, archived_at TEXT, archive_file TEXT)")
            con.execute(f"INSERT INTO trace_log_archive SELECT {', '.join(cols)}, ?, ? FROM trace_log", (stamp, f.name))
            moved = con.execute("SELECT COUNT(*) FROM trace_log_archive WHERE archived_at=?", (stamp,)).fetchone()[0]
            if moved != len(rows):
                raise RuntimeError(f"archive copied {moved} of {len(rows)} rows; nothing changed")
            con.execute("DELETE FROM trace_log")
            genesis = {"reason": reason, "archived_rows": len(rows),
                       "archived_seq_range": [rows[0]["seq"], rows[-1]["seq"]] if rows else None,
                       "archived_last_row_hash": rows[-1]["row_hash"] if rows else None,
                       "archived_chain_check": before, "archive_table": "trace_log_archive",
                       "archive_file": f.name, "archive_sha256": sha, "db_backup": backup.name}
            _append_locked(con, "audit-genesis", "genesis", genesis, None, None, None, None, actor)
            con.execute("COMMIT")
        except BaseException:
            con.execute("ROLLBACK")
            raise
    return {"archived_rows": len(rows), "archive_file": str(f), "archive_sha256": sha, "backup": str(backup),
            "archived_chain_check": before, "verify_chain": verify_chain()}


def verify_chain_con(con):
    prev_hash, n = GENESIS, 0
    for r in con.execute("SELECT * FROM trace_log ORDER BY seq"):
        row = {k: r[k] for k in ("query_id", "ts", "actor", "event_type", "payload_json", "model_id", "corpus_hash",
                                 "egress_manifest_json", "redaction_map_hash")}
        if r["prev_hash"] != prev_hash or r["row_hash"] != hashlib.sha256((prev_hash + _canon(row)).encode()).hexdigest():
            return {"ok": False, "broken_at_seq": r["seq"], "checked": n}
        prev_hash, n = r["row_hash"], n + 1
    return {"ok": True, "checked": n}


if __name__ == "__main__":
    import sys
    if sys.argv[1:2] != ["reset"] or "--yes" not in sys.argv:
        print("usage: python -m app.audit reset --yes [--reason TEXT]\n"
              "Backs up the database, archives every audit row to backend/data/audit_archive/*.jsonl and the\n"
              "trace_log_archive table (nothing is deleted for good), then starts a new chain with a genesis row.")
        sys.exit(1)
    why = sys.argv[sys.argv.index("--reason") + 1] if "--reason" in sys.argv else (
        "New chain for the demo. The previous log is archived unedited; it had a known break at seq 889 (a unit test "
        "deleted its own row 888 after another process had chained 889 onto it; that test now uses a scratch copy) "
        "and an earlier fork at 722 that was re-linked with the user's approval.")
    print(json.dumps(archive_and_restart(why, actor="admin (run by user)"), indent=1))
