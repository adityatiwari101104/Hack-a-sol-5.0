"""Redact personal identifiers before any text leaves the machine; re-hydrate locally.

Microsoft Presidio (MIT) with its Indian recognizers (IN_PAN, IN_AADHAAR, IN_VOTER, IN_PASSPORT, IN_GSTIN,
IN_VEHICLE_REGISTRATION) registered explicitly, plus PERSON/EMAIL/PHONE, plus our own pattern recognizers for
IFSC and bank account numbers (Presidio has none). If Presidio is unavailable, the same patterns run as regexes.
"""
import hashlib
import json
import re
import threading

PATTERNS = [
    ("IN_PAN", r"\b[A-Z]{5}\d{4}[A-Z]\b"),
    ("IN_AADHAAR", r"\b\d{4}\s?\d{4}\s?\d{4}\b"),
    ("IFSC", r"\b[A-Z]{4}0[A-Z0-9]{6}\b"),
    ("EMAIL_ADDRESS", r"\b[\w.+-]+@[\w-]+\.[\w.]+\b"),
    ("PHONE_NUMBER", r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)"),
    ("BANK_ACCOUNT", r"(?i)\b(?:a/c|account|acct)\s*(?:no\.?|number)?\s*[:.-]?\s*([A-Z0-9/-]{8,24})\b"),
]
ENTITIES = ["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "IN_PAN", "IN_AADHAAR", "IN_VOTER", "IN_PASSPORT", "IN_GSTIN",
            "IFSC", "BANK_ACCOUNT"]
_engine, _lock = {}, threading.Lock()


def _analyzer():
    with _lock:
        if "a" in _engine:
            return _engine["a"]
        try:
            from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer, RecognizerRegistry
            from presidio_analyzer.nlp_engine import NlpEngineProvider
            from presidio_analyzer.predefined_recognizers import (InAadhaarRecognizer, InGstinRecognizer,
                                                                  InPanRecognizer, InPassportRecognizer,
                                                                  InVoterRecognizer)
            nlp = NlpEngineProvider(nlp_configuration={"nlp_engine_name": "spacy",
                                                       "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}]}).create_engine()
            reg = RecognizerRegistry()
            reg.load_predefined_recognizers(nlp_engine=nlp)
            for r in (InPanRecognizer(), InAadhaarRecognizer(), InVoterRecognizer(), InPassportRecognizer(), InGstinRecognizer()):
                reg.add_recognizer(r)  # Indian recognizers are not loaded by default
            reg.add_recognizer(PatternRecognizer(supported_entity="IFSC", context=["ifsc", "branch"],
                                                 patterns=[Pattern("ifsc", PATTERNS[2][1], 0.85)]))
            reg.add_recognizer(PatternRecognizer(supported_entity="BANK_ACCOUNT", context=["account", "a/c", "loan"],
                                                 patterns=[Pattern("acct", r"\b[A-Z]{0,6}/?[A-Z]{0,4}/?\d{4}/\d{4,8}\b|\b\d{9,18}\b", 0.6)]))
            _engine["a"] = AnalyzerEngine(registry=reg, nlp_engine=nlp, supported_languages=["en"])
        except Exception:  # Presidio or the spaCy model missing: regex fallback
            _engine["a"] = None
        return _engine["a"]


def _spans(text):
    a = _analyzer()
    if a is not None:
        res = a.analyze(text=text, language="en", entities=ENTITIES, score_threshold=0.5)
        return [(r.entity_type, r.start, r.end) for r in res]
    out = []
    for label, pat in PATTERNS:
        for m in re.finditer(pat, text):
            g = m.lastindex or 0
            out.append((label, m.start(g), m.end(g)))
    return out


def redact(texts):
    """texts: list[str] -> (redacted list, mapping placeholder->original, mapping hash)."""
    mapping, reverse, counters, out = {}, {}, {}, []
    for t in texts:
        spans = sorted(_spans(t), key=lambda x: (x[1], -(x[2] - x[1])))
        kept, last_end = [], -1
        for s in spans:  # drop overlaps, keep the longest at each start
            if s[1] >= last_end:
                kept.append(s)
                last_end = s[2]
        for label, s, e in reversed(kept):
            val = t[s:e]
            if val not in reverse:
                counters[label] = counters.get(label, 0) + 1
                ph = f"<{label}_{counters[label]}>"
                mapping[ph], reverse[val] = val, ph
            t = t[:s] + reverse[val] + t[e:]
        out.append(t)
    digest = hashlib.sha256(json.dumps(mapping, sort_keys=True).encode()).hexdigest() if mapping else None
    return out, mapping, digest


def rehydrate(text, mapping):
    for ph, val in mapping.items():
        text = text.replace(ph, val)
    return text
