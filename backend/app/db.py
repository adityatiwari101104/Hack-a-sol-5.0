"""SQLite schema (see plans/AIML-02 build plan.md §2.4). Statuses are never stored; they are computed at query time."""
import json
import sqlite3

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
  context TEXT  -- lead-in text inherited from parent clauses, e.g. '(2) For all floating rate loans ... MSEs:'
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
"""


def connect():
    config.DATA.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(config.DB_PATH, timeout=30)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


def jload(s, default=None):
    return json.loads(s) if s else default
