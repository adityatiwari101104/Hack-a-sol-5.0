"""Redact personal identifiers before any text leaves the machine; re-hydrate locally.

Regex recognizers for Indian identifiers (PAN, Aadhaar, IFSC, account numbers, mobile, email). The build plan
names Microsoft Presidio; these patterns are the same idea without the spaCy dependency, and IFSC/account
patterns are needed anyway because Presidio has no recognizer for them."""
import hashlib
import json
import re

PATTERNS = [
    ("PAN", re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")),
    ("AADHAAR", re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")),
    ("IFSC", re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")),
    ("EMAIL", re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.]+\b")),
    ("MOBILE", re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)")),
    ("ACCOUNT", re.compile(r"(?i)\b(?:a/c|account|acct)\s*(?:no\.?|number)?\s*[:.-]?\s*([A-Z0-9-]{8,20})\b")),
]


def redact(texts):
    """texts: list[str] -> (redacted list, mapping placeholder->original, mapping hash)."""
    mapping, counters, out = {}, {}, []
    reverse = {}
    for t in texts:
        for label, pat in PATTERNS:
            def sub(m, label=label):
                val = m.group(m.lastindex or 0)
                if val not in reverse:
                    counters[label] = counters.get(label, 0) + 1
                    ph = f"<{label}_{counters[label]}>"
                    mapping[ph], reverse[val] = val, ph
                return m.group(0).replace(val, reverse[val])
            t = pat.sub(sub, t)
        out.append(t)
    digest = hashlib.sha256(json.dumps(mapping, sort_keys=True).encode()).hexdigest() if mapping else None
    return out, mapping, digest


def rehydrate(text, mapping):
    for ph, val in mapping.items():
        text = text.replace(ph, val)
    return text
