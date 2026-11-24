"""SQLite schema (see plans/AIML-02 build plan.md §2.4). Statuses are never stored; they are computed at query time."""
import hashlib
import json
import sqlite3
import threading

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
  doc_id TEXT PRIMARY KEY, title TEXT NOT NULL, issuer TEXT, doc_type TEXT NOT NULL,
  circular_no TEXT, ref_no TEXT, issue_date TEXT, effective_date TEXT, withdrawn_on TEXT,
  applies_to_json TEXT, language TEXT DEFAULT 'en', source_url TEXT, path TEXT, sha256 TEXT NOT NULL,
  is_synthetic INTEGER NOT NULL DEFAULT 0, n_pages INTEGER, ingested_at TEXT
);
CREATE TABLE IF NOT EXISTS pages (
  doc_id TEXT, page_no INTEGER, width REAL, height REAL, PRIMARY KEY (doc_id, page_no)
);
CREATE TABLE IF NOT EXISTS chunks (
  chunk_id TEXT PRIMARY KEY, doc_id TEXT NOT NULL, clause_key TEXT, kind TEXT, breadcrumb TEXT,
  text TEXT NOT NULL, pages_json TEXT NOT NULL, words_json TEXT NOT NULL, seq INTEGER,
  context TEXT, -- lead-in text inherited from parent clauses, e.g. '(2) For all floating rate loans ... MSEs:'
  prefix TEXT    -- LLM-written situating sentence used only for search (Contextual Retrieval)
);
CREATE TABLE IF NOT EXISTS provision_versions (
  version_id TEXT PRIMARY KEY, clause_key TEXT NOT NULL, chunk_id TEXT, doc_id TEXT NOT NULL,
  text TEXT NOT NULL, valid_from TEXT, valid_to TEXT, amended_by TEXT,
  op TEXT NOT NULL CHECK (op IN ('original','substitute','insert','delete','withdraw','restate')),
  source_quote TEXT
);
CREATE TABLE IF NOT EXISTS edges (
  edge_id INTEGER PRIMARY KEY, type TEXT NOT NULL CHECK (type IN
    ('AMENDED_BY','SUPERSEDES','WITHDRAWS','REFERS_TO','DEFINES','CONTRADICTS')),
  src TEXT, dst TEXT, effective_date TEXT, quote TEXT NOT NULL, quote_doc_id TEXT NOT NULL,
  quote_page INTEGER NOT NULL, verified INTEGER NOT NULL CHECK (verified = 1),
  created_by TEXT CHECK (created_by IN ('regex','llm','triage','registry')), note TEXT
);
CREATE TABLE IF NOT EXISTS value_tuples (
  tuple_id INTEGER PRIMARY KEY, chunk_id TEXT, doc_id TEXT, subject TEXT NOT NULL, attribute TEXT,
  permitted TEXT, value_num TEXT, value_text TEXT, unit TEXT, modality TEXT,
  condition_json TEXT, quote TEXT NOT NULL, page INTEGER, verified INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS glossary (term TEXT PRIMARY KEY, expansion TEXT, doc_id TEXT, quote TEXT);
CREATE TABLE IF NOT EXISTS trace_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, query_id TEXT, ts TEXT NOT NULL, actor TEXT, event_type TEXT,
  payload_json TEXT NOT NULL, model_id TEXT, corpus_hash TEXT, egress_manifest_json TEXT,
  redaction_map_hash TEXT, prev_hash TEXT NOT NULL, row_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS impact_items (
  item_id TEXT PRIMARY KEY, report_id TEXT, obligation_json TEXT, internal_json TEXT, verdict TEXT,
  severity TEXT, reason TEXT, suggested_fix TEXT, fix_is_draft INTEGER DEFAULT 1, review_state TEXT DEFAULT 'open'
);
CREATE TABLE IF NOT EXISTS incidents (incident_id INTEGER PRIMARY KEY, trace_query_id TEXT, note TEXT, ts TEXT);
CREATE TABLE IF NOT EXISTS upload_jobs (
  doc_id TEXT PRIMARY KEY, filename TEXT, doc_kind TEXT, collection TEXT, stage TEXT NOT NULL, status TEXT NOT NULL,
  counts_json TEXT, warnings_json TEXT, report_json TEXT, error TEXT, created_at TEXT, updated_at TEXT
);
-- changes an upload made to other documents' rows (e.g. an endorsement ending a policy clause's validity), so that
-- DELETE /documents/{id} can put them back exactly
CREATE TABLE IF NOT EXISTS upload_effects (
  effect_id INTEGER PRIMARY KEY, upload_doc_id TEXT NOT NULL, tbl TEXT NOT NULL, row_key TEXT NOT NULL,
  col TEXT NOT NULL, old_value TEXT
);
CREATE TABLE IF NOT EXISTS impact_reports (
  report_id TEXT PRIMARY KEY, doc_id TEXT NOT NULL, bank_profile TEXT NOT NULL, as_of TEXT NOT NULL, created_at TEXT
);
-- Indexes only on tables the answer path never reads. An index on chunks/edges/value_tuples/provision_versions
-- changes the row order of queries without ORDER BY, which renumbers the evidence and rule ids in the drafting
-- prompt and so invalidates every recorded LLM response. (The corpus is ~2k chunks; full scans are fast.)
DROP INDEX IF EXISTS ix_chunks_doc;
DROP INDEX IF EXISTS ix_pv_chunk;
DROP INDEX IF EXISTS ix_vt_chunk;
DROP INDEX IF EXISTS ix_edges_src;
DROP INDEX IF EXISTS ix_edges_dst;
CREATE INDEX IF NOT EXISTS ix_trace_qid ON trace_log(query_id);
CREATE INDEX IF NOT EXISTS ix_impact_report ON impact_items(report_id);
"""
# columns added after the first release; ALTER TABLE only when missing
MIGRATIONS = {"impact_items": [("decided_by", "TEXT"), ("signed_off_by", "TEXT")],
              # source: corpus (shipped) | demo (pre-loaded example set) | upload; collection: banking | insurance | general
              "documents": [("source", "TEXT"), ("collection", "TEXT"), ("doc_kind", "TEXT"), ("ocr_pages", "TEXT")]}

_ready, _ready_lock = set(), threading.Lock()


def _migrate(con):
    con.execute("PRAGMA journal_mode=WAL")  # readers do not block the writer (API + eval threads)
    con.executescript(SCHEMA)
    for table, cols in MIGRATIONS.items():
        have = {r[1] for r in con.execute(f"PRAGMA table_info({table})")}
        for name, typ in cols:
            if name not in have:
                con.execute(f"ALTER TABLE {table} ADD COLUMN {name} {typ}")
    con.commit()


def connect():
    """Open a connection. The schema/migrations run once per process per database file, not on every call."""
    config.DATA.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(config.DB_PATH, timeout=30)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA busy_timeout=30000")
    key = str(config.DB_PATH)
    if key not in _ready:
        with _ready_lock:
            if key not in _ready:
                _migrate(con)
                _ready.add(key)
    return con


_corpus_hash = {}


def corpus_hash(con=None):
    """sha256 over the document checksums (sorted by doc_id): which corpus an answer was produced from.
    Cached per process; call reset_corpus_hash() after ingestion."""
    key = str(config.DB_PATH)
    if key not in _corpus_hash:
        con = con or connect()
        shas = con.execute("SELECT group_concat(sha256, '') FROM (SELECT sha256 FROM documents ORDER BY doc_id)").fetchone()[0]
        _corpus_hash[key] = hashlib.sha256((shas or "").encode()).hexdigest()[:16]
    return _corpus_hash[key]


def reset_corpus_hash():
    _corpus_hash.clear()


def jload(s, default=None):
    return json.loads(s) if s else default
