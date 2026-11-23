"""PDF -> pages -> lines -> clause chunks (+ table units, row facts, footnotes) with word-level bboxes.

pdfplumber (MIT) gives exact word boxes for highlighting. Headers/footers, the RBI "Withdrawn" stamp and the
demo watermark are stripped. White/invisible text is kept in the text layer but flagged hidden=True so it can
never become evidence (prompt-injection defence).
"""
import hashlib
import re
from collections import Counter

import pdfplumber

from .normalize import norm_text

CHAPTER = re.compile(r"^(Chapter\s+[IVXLC]+\s*[–-]\s*.+)$")
SECTION = re.compile(r"^([A-H])\.\s+([A-Z][^.]{3,90})$")
CLAUSE = re.compile(r"^(\d{1,3}\.\d{1,2}(?:\.\d{1,2})?|\d{1,3}(?=[.)]))[.)]?\s*(\((?:[ivx]{1,5}|\d{1,2}|[a-h])\))?\s+(\S.*)$")
PLAIN_FOOTNOTE = re.compile(r"^(\d{1,2})\s+[A-Z]")
SUBCLAUSE = re.compile(r"^\(((?:[ivx]{1,5})|(?:\d{1,2})|(?:[a-h]))\)\s+\S")
FOOTNOTE = re.compile(r"^(\d{1,2})\s+(Substituted|Inserted|Deleted)\s+vide\b(.*)$", re.I)
NOISE = re.compile(r"^(page \d+ of \d+|\d{1,3}|withdrawn|sample\s*[–-]\s*fictional\s*[–-]\s*for demo)$", re.I)
TOC_LINE = re.compile(r"\.{6,}\s*\d+\s*$")


def sha256_file(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def _is_white(w):
    c = w.get("non_stroking_color")
    if c is None:
        return False
    if isinstance(c, (int, float)):
        c = (c,)
    try:
        vals = [float(x) for x in c]
    except (TypeError, ValueError):
        return False
    if len(vals) == 1:
        return vals[0] >= 0.95
    if len(vals) == 3:
        return min(vals) >= 0.95
    if len(vals) == 4:  # CMYK white
        return max(vals) <= 0.05
    return False


def _drop_stamp_letters(words):
    """RBI's diagonal 'Withdrawn' stamp extracts as single letters stacked in a column; drop such columns."""
    singles = [w for w in words if len(w["text"]) == 1 and w["text"].isalpha()]
    cols = Counter(round(w["x0"] / 6) for w in singles)
    bad = {c for c, n in cols.items() if n >= 4}
    return [w for w in words if not (len(w["text"]) == 1 and w["text"].isalpha() and
                                     (round(w["x0"] / 6) in bad or w["text"] not in "aAIi"))]


def read_pdf(path):
    pages = []
    with pdfplumber.open(path) as pdf:
        for pno, page in enumerate(pdf.pages, start=1):
            tables = []
            try:
                for t in page.find_tables():
                    rows = t.extract()
                    if rows and len(rows) >= 2 and max(len(r) for r in rows) >= 2:
                        tables.append({"bbox": t.bbox, "rows": rows, "row_bboxes": [r.bbox for r in t.rows]})
            except Exception:
                tables = []
            words = page.extract_words(use_text_flow=True, keep_blank_chars=False, extra_attrs=["non_stroking_color"])
            words = [w for w in words if w.get("upright", True)]  # drop rotated stamps ("Withdrawn") and watermarks
            words = _drop_stamp_letters(words)
            for w in words:
                w["hidden"] = _is_white(w)
                w["in_table"] = any(tb["bbox"][0] - 1 <= w["x0"] and w["x1"] <= tb["bbox"][2] + 1 and
                                    tb["bbox"][1] - 1 <= w["top"] and w["bottom"] <= tb["bbox"][3] + 1 for tb in tables)
            lines, cur, cur_top = [], [], None
            for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
                if cur_top is None or abs(w["top"] - cur_top) > 3:
                    if cur:
                        lines.append(cur)
                    cur, cur_top = [w], w["top"]
                else:
                    cur.append(w)
            if cur:
                lines.append(cur)
            pages.append({"page_no": pno, "width": float(page.width), "height": float(page.height),
                          "lines": [{"text": " ".join(x["text"] for x in sorted(ln, key=lambda w: w["x0"])),
                                     "words": sorted(ln, key=lambda w: w["x0"]),
                                     "top": min(x["top"] for x in ln), "bottom": max(x["bottom"] for x in ln)}
                                    for ln in lines],
                          "tables": tables})
    _strip_headers_footers(pages)
    return pages


def _strip_headers_footers(pages):
    zone_lines = Counter()
    for p in pages:
        for ln in p["lines"]:
            if ln["top"] < 0.09 * p["height"] or ln["bottom"] > 0.91 * p["height"]:
                zone_lines[re.sub(r"\d+", "#", ln["text"].strip().lower())] += 1
    repeated = {k for k, v in zone_lines.items() if len(pages) >= 3 and v >= 0.4 * len(pages)}
    for p in pages:
        keep = []
        for ln in p["lines"]:
            t = ln["text"].strip()
            in_zone = ln["top"] < 0.09 * p["height"] or ln["bottom"] > 0.91 * p["height"]
            if NOISE.match(t) or (in_zone and re.sub(r"\d+", "#", t.lower()) in repeated):
                continue
            keep.append(ln)
        p["lines"] = keep


class _Chunk:
    def __init__(self, doc_id, clause_key, kind, breadcrumb):
        self.doc_id, self.clause_key, self.kind, self.breadcrumb = doc_id, clause_key, kind, breadcrumb
        self.text, self.words, self.pages = "", [], []

    def add_words(self, page_no, words):
        if page_no not in self.pages:
            self.pages.append(page_no)
        for w in words:
            start = len(self.text) + (1 if self.text else 0)
            self.text += (" " if self.text else "") + w["text"]
            self.words.append({"t": w["text"], "p": page_no, "x0": round(w["x0"], 1), "top": round(w["top"], 1),
                               "x1": round(w["x1"], 1), "bottom": round(w["bottom"], 1), "s": start,
                               "e": start + len(w["text"]), "h": bool(w.get("hidden"))})


def _key_order(key):
    return tuple(int(x) for x in key.split("."))


def chunk_document(doc_id, pages, title):
    """Clause tree -> chunks. Keys are hierarchical: '261', '261(2)', '261(2)(ii)', '7.4'. Each sub-clause carries
    `lead`: the lead-in text it depends on (e.g. '(2) For all floating rate loans ... to individuals and MSEs:')."""
    chunks, footnotes = [], []
    preamble = _Chunk(doc_id, "preamble", "clause", f"{title} > preamble")
    preamble.lead = ""
    chunks.append(preamble)
    cur, chapter, section, last_key = preamble, "", "", None
    top_key, num_key = None, None  # current top-level clause and current numeric sub-clause (e.g. '261(2)')
    child_lead = {}  # parent clause key -> its lead-in text ending with ':'
    open_fn, open_fn_page = None, None
    last_clause_page = 0

    def crumb(key):
        return " > ".join(x for x in [title, chapter, section, f"para {key}"] if x)

    def lead_of(chunk):
        t = chunk.text.strip()
        return t[-400:] if t.endswith(":") or t.endswith(":-") else ""

    def new_chunk(key, lead):
        c = _Chunk(doc_id, key, "clause", crumb(key))
        c.lead = lead
        chunks.append(c)
        return c

    for p in pages:
        for ln in p["lines"]:
            text = ln["text"].strip()
            visible = [w for w in ln["words"] if not w["in_table"]]
            if not visible or TOC_LINE.search(text):
                continue
            m_fn = FOOTNOTE.match(text)
            if (not m_fn and open_fn is not None and open_fn_page == p["page_no"] and ln["top"] > 0.75 * p["height"]
                    and not PLAIN_FOOTNOTE.match(text)):
                open_fn.add_words(p["page_no"], visible)  # wrapped continuation of a footnote
                continue
            if not (ln["top"] > 0.75 * p["height"]):
                open_fn = None
            if not m_fn and ln["top"] > 0.75 * p["height"] and PLAIN_FOOTNOTE.match(text) and not CLAUSE.match(text):
                m_fn = PLAIN_FOOTNOTE.match(text)
            if m_fn:
                fn = _Chunk(doc_id, f"fn{m_fn.group(1)}", "footnote", f"{title} > footnote {m_fn.group(1)}")
                fn.lead = ""
                fn.add_words(p["page_no"], visible)
                chunks.append(fn)
                footnotes.append({"num": m_fn.group(1), "chunk": fn})
                open_fn, open_fn_page = fn, p["page_no"]
                continue
            m_ch, m_sec, m_cl = CHAPTER.match(text), SECTION.match(text), CLAUSE.match(text)
            if m_ch:
                chapter, section = m_ch.group(1).strip(), ""
                continue
            if m_sec and not m_cl and len(text) < 95:
                section = f"{m_sec.group(1)}. {m_sec.group(2).strip()}"
                continue
            if m_cl and not re.match(r"^\d{1,3}(?:\.\d+)?\s*(%|per|lakh|crore|months?|days?|years?)", text, re.I):
                key = m_cl.group(1)
                ok = last_key is None or (_key_order(key) > _key_order(last_key) and
                                          _key_order(key)[0] - _key_order(last_key)[0] <= 3)
                if not ok and _key_order(key)[0] == 1 and p["page_no"] > last_clause_page:
                    ok = True  # numbering restarts on a new page (e.g. a second letter in the same PDF)
                if ok:
                    last_key, top_key, num_key = key, key, None
                    last_clause_page = p["page_no"]
                    if m_cl.group(2):  # '3.(i) These Directions ...'
                        cur = new_chunk(f"{key}{m_cl.group(2)}", "")
                    else:
                        cur = new_chunk(key, "")
                    cur.add_words(p["page_no"], visible)
                    continue
            m_sub = SUBCLAUSE.match(text)
            if m_sub and top_key is not None:
                marker = m_sub.group(1)
                if marker.isdigit():
                    parent = top_key
                elif marker in "abcdefgh" and re.search(r"\((?:[ivx]{1,5})\)(\([a-h]\))?$", cur.clause_key):
                    parent = re.sub(r"\([a-h]\)$", "", cur.clause_key)  # (a)/(b) nested under a roman item
                else:
                    parent = num_key or top_key
                if parent not in child_lead:
                    child_lead[parent] = lead_of(cur) if cur.clause_key == parent else ""
                key = f"{parent}({marker})"
                if marker.isdigit():
                    num_key = key
                cur = new_chunk(key, child_lead[parent])
            cur.add_words(p["page_no"], visible)

    chunks.extend(_table_chunks(doc_id, pages, title))
    chunks = [c for c in chunks if c.text.strip()]
    if sum(1 for c in chunks if c.kind == "clause" and c.clause_key != "preamble") < 2:
        chunks = _window_chunks(doc_id, pages, title) + [c for c in chunks if c.kind != "clause"]
    seen = Counter()
    for c in chunks:
        if not hasattr(c, "lead"):
            c.lead = ""
        seen[c.clause_key] += 1
        if seen[c.clause_key] > 1:
            c.clause_key = f"{c.clause_key}#{seen[c.clause_key]}"
    return chunks, footnotes


def _table_chunks(doc_id, pages, title):
    """One chunk per (stitched) table + one row-fact chunk per data row. Stitch a table ending near the bottom of
    page p with a table starting near the top of page p+1 when column counts match and the second has no header."""
    tables = []
    for p in pages:
        for t in p["tables"]:
            tables.append({**t, "page": p["page_no"], "h": p["height"], "words": [w for ln in p["lines"] for w in ln["words"]]})
    merged = []
    for t in tables:
        prev = merged[-1] if merged else None
        ncols = max(len(r) for r in t["rows"])
        if (prev and prev["pages"][-1] == t["page"] - 1 and prev["ncols"] == ncols and
                prev["last_bottom"] > 0.5 * prev["last_h"] and t["bbox"][1] < 0.35 * t["h"] and
                norm_text(" ".join(c or "" for c in t["rows"][0])).lower() != norm_text(" ".join(c or "" for c in prev["header"])).lower()):
            prev["parts"].append(t)
            prev["pages"].append(t["page"])
            prev["last_bottom"], prev["last_h"] = t["bbox"][3], t["h"]
            continue
        merged.append({"parts": [t], "pages": [t["page"]], "ncols": ncols, "header": t["rows"][0],
                       "last_bottom": t["bbox"][3], "last_h": t["h"]})
    out = []
    for ti, m in enumerate(merged, start=1):
        header = [norm_text(c or "") for c in m["header"]]
        tc = _Chunk(doc_id, f"table{ti}", "table", f"{title} > table {ti} (pp. {'-'.join(map(str, m['pages']))})")
        for pi, part in enumerate(m["parts"]):
            for ri, (row, rb) in enumerate(zip(part["rows"], part["row_bboxes"])):
                if pi == 0 and ri == 0:
                    continue
                cells = [norm_text(c or "") for c in row]
                if not any(cells):
                    continue
                rw = [w for w in part["words"] if rb[1] - 1 <= w["top"] and w["bottom"] <= rb[3] + 1 and
                      rb[0] - 1 <= w["x0"] and w["x1"] <= rb[2] + 1]
                rc = _Chunk(doc_id, f"table{ti}.r{len(out) + 1}", "row_fact",
                            f"{title} > table {ti} > " + " | ".join(header) + f" (p. {part['page']})")
                rc.add_words(part["page"], rw)
                rc.lead = "Table columns: " + " | ".join(h for h in header if h)
                out.append(rc)
                tc.add_words(part["page"], rw)
        tc.lead = "Table columns: " + " | ".join(h for h in header if h)
        if tc.text:
            out.insert(0, tc)
    return out


def _window_chunks(doc_id, pages, title, size=120, overlap=30):
    words = [(p["page_no"], w) for p in pages for ln in p["lines"] for w in ln["words"] if not w["in_table"]]
    out, i, n = [], 0, 0
    while i < len(words):
        n += 1
        c = _Chunk(doc_id, f"w{n}", "window", f"{title} > window {n}")
        for pno, w in words[i:i + size]:
            c.add_words(pno, [w])
        out.append(c)
        i += size - overlap
    return out
