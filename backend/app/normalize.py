"""Text and value normalisation: PDF extraction quirks, Indian money (₹/Rs/INR, lakh/crore), rates, dates."""
import re
import unicodedata
from datetime import date

MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august",
                                       "september", "october", "november", "december"], start=1)}
MONTH_RE = "january|february|march|april|may|june|july|august|september|october|november|december"


def norm_text(s: str) -> str:
    """Normalise for quote matching. Fixes RBI PDF quirks: 'RBI /2024-25/18', 'Co -operative', 'pre- payment'."""
    s = unicodedata.normalize("NFKC", s)
    s = (s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
         .replace("–", "-").replace("—", "-").replace("­", ""))
    s = re.sub(r"\s*/\s*", "/", s)
    s = re.sub(r"(\w)\s*-\s+(\w)", r"\1-\2", s)
    s = re.sub(r"(\w)\s+-(\w)", r"\1-\2", s)
    s = re.sub(r"(?<=\d)\s+(?=\d)", "", s)
    s = re.sub(r"\s+([,.;:)])", r"\1", s)
    s = re.sub(r"\(\s+", "(", s)
    return re.sub(r"\s+", " ", s).strip()


def parse_date(text: str):
    """'January 1, 2026' / '1 January 2026' / '01.01.2026' / '2026-01-01' -> date or None."""
    t = text.strip().lower().replace(",", " ")
    m = re.search(rf"({MONTH_RE})\s+(\d{{1,2}})\s+(\d{{4}})", t)
    if m:
        return date(int(m.group(3)), MONTHS[m.group(1)], int(m.group(2)))
    m = re.search(rf"(\d{{1,2}})(?:st|nd|rd|th)?\s+({MONTH_RE})\s+(\d{{4}})", t)
    if m:
        return date(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", t)
    if m:
        return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    m = re.search(r"(\d{1,2})[./-](\d{1,2})[./-](\d{4})", t)
    if m:
        return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    return None


def iso(d):
    return d.isoformat() if d else None


def _rs(v):
    return f"rs:{v:.0f}" if abs(v - round(v)) < 0.005 else f"rs:{v:.2f}"


def facts(text: str) -> set:
    """Normalised numeric facts in a sentence: rs:<rupees>, pct:<value>[pm|pa], date:<iso>, n:<int>.

    Used by the verifier: every fact in an answer sentence must appear in its cited evidence
    (or in the user's question, or in a calculation result)."""
    t = unicodedata.normalize("NFKC", text).lower().replace("–", "-").replace("—", "-")
    t = re.sub(r"\s+", " ", t)  # no digit-joining here: table rows like "2 19,280 729" must stay separate numbers
    t = re.sub(r"(?<=\d),(?=\d)", "", t)
    out = set()
    consumed = []
    for m in re.finditer(r"(?:₹|rs\.?|inr|rupees)\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|crore|crores)?", t):
        mult = {"lakh": 1e5, "lakhs": 1e5, "crore": 1e7, "crores": 1e7}.get(m.group(2) or "", 1)
        out.add(_rs(float(m.group(1)) * mult))
        consumed.append(m.span())
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*(lakh|lakhs|crore|crores)\b", t):
        if any(a <= m.start() < b for a, b in consumed):
            continue
        mult = 1e5 if m.group(2).startswith("lakh") else 1e7
        out.add(_rs(float(m.group(1)) * mult))
        consumed.append(m.span())
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*(?:%|per\s?cent|percent)(\s*(?:p\.?\s?m\.?|per month|p\.?\s?a\.?|per annum))?", t):
        per = m.group(2) or ""
        suffix = "pm" if ("m" in per and "month" in per or "p.m" in per or per.strip() in ("pm", "p.m.", "p. m.")) else ""
        out.add(f"pct:{float(m.group(1)):g}{suffix}")
        consumed.append(m.span())
    for m in re.finditer(rf"({MONTH_RE})\s+(\d{{1,2}}),?\s+(\d{{4}})|(\d{{1,2}})\s+({MONTH_RE})\s+(\d{{4}})", t):
        d = parse_date(m.group(0))
        if d:
            out.add(f"date:{d.isoformat()}")
            consumed.append(m.span())
    for m in re.finditer(r"\b\d{4}-\d{2}-\d{2}\b", t):
        out.add(f"date:{m.group(0)}")
        consumed.append(m.span())
    for m in re.finditer(r"(?<![\w./])(\d+(?:\.\d+)?)(?![\w%])", t):
        if any(a <= m.start() < b for a, b in consumed):
            continue
        v = m.group(1)
        if len(v) == 4 and v.startswith(("19", "20")):
            out.add(f"year:{v}")
        else:
            out.add(f"n:{float(v):g}")
    return out


def implied(facts_set: set) -> set:
    """Facts implied by others, so 'March 2026' (year:2026) is supported by 'date:2026-03-15'."""
    extra = set()
    for f in facts_set:
        if f.startswith("date:"):
            extra.add("year:" + f[5:9])
        if f.startswith("rs:"):
            extra.add("n:" + str(float(f[3:])).rstrip("0").rstrip("."))
    return facts_set | extra
