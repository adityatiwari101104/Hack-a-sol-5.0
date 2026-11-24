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
# Structured identifiers only. Used on the question before it reaches the LLM: the PERSON detector misfires on
# question text ("T20", "Raipur", "Schedule II"), which would change what is sent and break recorded responses.
STRUCTURED = [e for e in ENTITIES if e != "PERSON"]
_engine, _lock, _analyze_lock = {}, threading.Lock(), threading.Lock()


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


# Always on, on top of Presidio: its IN_PAN / IN_AADHAAR scores often fall under the threshold without context words
# (red-team: a PAN reached the query-plan call). Strict shapes only, so ordinary amounts are never touched.
ALWAYS = [("IN_PAN", r"\b[A-Z]{5}\d{4}[A-Z]\b"), ("IN_AADHAAR", r"(?<![\d,.])[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}(?![\d,.])")]
# Hindi documents: spaCy's English NER cannot see Devanagari names, so names after an honorific ('श्री रमेश कुमार
# वर्मा') and signature lines ('(सुरेश चंद्र शर्मा)') are matched by pattern. Patterns run on a digit-folded copy, so
# an Aadhaar or phone number written in Devanagari digits ('२३४५ ...') is caught too. No effect on English text.
from .hindi import DEV as _DEV, HONORIFIC_NAME, SIGNATURE_NAME, fold_digits, is_hindi  # noqa: E402
HINDI_ALWAYS = [("PERSON", HONORIFIC_NAME), ("PERSON", SIGNATURE_NAME)]  # mostly-Hindi text only (English unchanged)


def _spans(text, entities=None):
    entities = entities or ENTITIES
    hi = is_hindi(text)
    folded = fold_digits(text) if hi else text
    always = [(label, m.start(), m.end()) for label, pat in ALWAYS + (HINDI_ALWAYS if hi else [])
              if label in entities for m in re.finditer(pat, folded)]
    a = _analyzer()
    if a is not None:
        with _analyze_lock:  # spaCy/Presidio are not thread-safe: parallel calls can return different entities,
            res = a.analyze(text=text, language="en", entities=entities, score_threshold=0.5)  # i.e. a different prompt
        # spaCy's English model tags Devanagari words ('हैं') as PERSON at random: Hindi names come from the patterns
        return [(r.entity_type, r.start, r.end) for r in res
                if not (hi and r.entity_type == "PERSON" and _DEV.search(text[r.start:r.end]))] + always
    out = list(always)
    for label, pat in PATTERNS:
        if label not in entities:
            continue
        for m in re.finditer(pat, text):
            g = m.lastindex or 0
            out.append((label, m.start(g), m.end(g)))
    return out


def redact(texts, entities=None, prefix=""):
    """texts: list[str] -> (redacted list, mapping placeholder->original, mapping hash).
    prefix keeps placeholders from two separate redactions apart (e.g. <Q_IN_PAN_1> for the question)."""
    mapping, reverse, counters, out = {}, {}, {}, []
    for t in texts:
        spans = sorted(_spans(t, entities), key=lambda x: (x[1], -(x[2] - x[1])))
        kept, last_end = [], -1
        for s in spans:  # drop overlaps, keep the longest at each start
            if s[1] >= last_end:
                kept.append(s)
                last_end = s[2]
        for label, s, e in reversed(kept):
            val = t[s:e]
            if val not in reverse:
                counters[label] = counters.get(label, 0) + 1
                ph = f"<{prefix}{label}_{counters[label]}>"
                mapping[ph], reverse[val] = val, ph
            t = t[:s] + reverse[val] + t[e:]
        out.append(t)
    digest = hashlib.sha256(json.dumps(mapping, sort_keys=True).encode()).hexdigest() if mapping else None
    return out, mapping, digest


def rehydrate(text, mapping):
    for ph, val in mapping.items():
        text = text.replace(ph, val)
    return text
