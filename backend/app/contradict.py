"""Contradiction triage over value tuples: CONFLICT vs SUPERSESSION (amendment) vs DIFFERENT_CONDITION vs CONSISTENT."""
import difflib
import functools
import json
import re
from datetime import date

from . import db
from .applicability import conditions_overlap


def _d(s):
    return date.fromisoformat(s) if s else None


def validity(con, tuple_row):
    """[from, to) of the clause version that holds this tuple; internal documents use their own effective date."""
    v = con.execute("SELECT MIN(valid_from) f, MAX(COALESCE(valid_to,'9999-12-31')) t FROM provision_versions WHERE chunk_id=?",
                    (tuple_row["chunk_id"],)).fetchone()
    return _d(v["f"]) or date.min, _d(v["t"]) or date.max


def same_value(a, b):
    if a["permitted"] != b["permitted"]:
        return False
    if a["permitted"] == "yes" and a["value_num"] and b["value_num"]:
        try:
            return float(a["value_num"]) == float(b["value_num"])
        except ValueError:
            return a["value_num"] == b["value_num"]
    return True


def classify_pair(con, a, b, check_validity=True):
    ca, cb = json.loads(a["condition_json"]), json.loads(b["condition_json"])
    if not conditions_overlap(ca, cb):
        return "DIFFERENT_CONDITION"
    if check_validity:
        fa, ta = validity(con, a)
        fb, tb = validity(con, b)
        if not (max(fa, fb) < min(ta, tb)):
            return "SUPERSESSION"
    if same_value(a, b):
        return "CONSISTENT"
    special = [t for t in (a, b) if t.get("value_text") and not t.get("is_synthetic")]
    if "conditional" in (a["permitted"], b["permitted"]) or special:
        return "NEEDS_REVIEW"  # conditional rules or rules limited to a special circumstance (value_text)
    return "CONFLICT"


def _regulator_ok(con, t, profile, as_of):
    """Keep a regulator tuple only if it binds this bank (entity) and is in force on as_of."""
    from .applicability import ENTITY_OK
    ents = (json.loads(t["applies_to_json"] or "{}") or {}).get("entities") or []
    if profile and ents and profile["entity"] not in ents:
        return False
    cond = json.loads(t["condition_json"])
    if profile and not ENTITY_OK.get(cond.get("entity", "any"), lambda p: True)(profile):
        return False
    if as_of:
        f, to = validity(con, t)
        if not (f <= as_of < to):
            return False
    return True


def scan(subjects=None, profile=None, as_of=None, doc_ids=None):
    """Pairs across documents with the same subject: regulator-vs-bank and bank-vs-bank.
    doc_ids: documents in scope (None = the shipped banking corpus; uploads join only when named)."""
    con = db.connect()
    rows = [dict(r) for r in con.execute(
        "SELECT t.*, d.issuer, d.is_synthetic, d.title, d.applies_to_json, d.source, d.collection, c.clause_key, "
        "c.breadcrumb FROM value_tuples t JOIN documents d USING(doc_id) JOIN chunks c USING(chunk_id) WHERE t.verified=1 "
        "AND t.subject NOT LIKE 'term:%'")]
    if doc_ids is None:
        rows = [r for r in rows if (r["source"] or "corpus") == "corpus" and (r["collection"] or "banking") == "banking"]
    else:
        rows = [r for r in rows if r["doc_id"] in doc_ids]
    if subjects:
        rows = [r for r in rows if r["subject"] in subjects]
    from .applicability import product_scope
    rows = [r for r in rows if r["is_synthetic"] or (_regulator_ok(con, r, profile, as_of) and not r["value_text"]
                                                    and not (r["permitted"] == "yes" and not r["value_num"])
                                                    and not product_scope(r["breadcrumb"] + " " + r["quote"]))]
    out = []
    for i, a in enumerate(rows):
        for b in rows[i + 1:]:
            if a["subject"] != b["subject"] or a["doc_id"] == b["doc_id"] or "not_applicable" in (a["permitted"], b["permitted"]):
                continue
            if not (a["is_synthetic"] or b["is_synthetic"]):
                continue  # regulator-vs-regulator differences are amendments/scope; handled by the version graph
            verdict = classify_pair(con, a, b, check_validity=not (a["is_synthetic"] and b["is_synthetic"]))
            out.append({"verdict": verdict, "subject": a["subject"], "a": _brief(a), "b": _brief(b)})
    return out


def _tok(x):
    return re.sub(r"[^0-9a-z₹%]", "", x.lower())


@functools.lru_cache(maxsize=4096)
def quote_bboxes(chunk_id, quote):
    """{page: [[x0, top, x1, bottom], ...]} for the words of `quote` inside its chunk (token alignment, so line breaks
    and hyphenation in the PDF do not matter). Empty if fewer than 80% of the quote's words can be placed."""
    r = db.connect().execute("SELECT words_json FROM chunks WHERE chunk_id=?", (chunk_id,)).fetchone()
    if not r or not quote:
        return {}
    words = [w for w in json.loads(r["words_json"]) if _tok(w.get("t", ""))]
    ct, qt = [_tok(w["t"]) for w in words], [t for t in (_tok(x) for x in quote.split()) if t]
    if not qt:
        return {}
    blocks = [b for b in difflib.SequenceMatcher(None, ct, qt, autojunk=False).get_matching_blocks() if b.size]
    if sum(b.size for b in blocks) < 0.8 * len(qt):
        return {}
    lo, hi = min(b.a for b in blocks), max(b.a + b.size for b in blocks)
    out = {}
    for w in words[lo:hi]:
        if not w.get("h"):  # never box hidden (white) text
            out.setdefault(str(w["p"]), []).append([w["x0"], w["top"], w["x1"], w["bottom"]])
    return out


def _brief(t):
    return {"tuple_id": t["tuple_id"], "doc_id": t["doc_id"], "title": t["title"], "clause": t["clause_key"],
            "chunk_id": t["chunk_id"], "page": t["page"], "quote": t["quote"], "permitted": t["permitted"],
            "value": t["value_num"], "unit": t["unit"], "condition": json.loads(t["condition_json"]),
            "bboxes": quote_bboxes(t["chunk_id"], t["quote"])}
