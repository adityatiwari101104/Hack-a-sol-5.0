"""Hindi (Devanagari) documents: detect a garbled text layer, normalise, fold digits, tokenise, read numbers.

Everything here switches on only for text that is mostly Devanagari, so the English corpus (whose RBI letterheads
carry a few garbled Devanagari words) is read, searched and checked exactly as before and its recorded answers
replay. The garble checks follow the Janmitra extraction validator (malformed matra sequences, replacement/PUA
residue), plus two signals that catch the commonest failure of a font without proper ToUnicode/shaping data: vowel
signs silently dropped (no 'ि' in a page of Hindi) and words broken into single letters.
"""
import re
import unicodedata

DEV = re.compile(r"[ऀ-ॿ]")
DEV_LETTER = re.compile(r"[ऄ-हक़-ॡॲ-ॿ]")
DEV_TOKEN = re.compile(r"[ऀ-ॣॱ-ॿ]+")
ZERO_WIDTH = re.compile(r"[​‌‍⁠﻿]")
ORPHAN_SIGN = re.compile(r"(?<=[ऀ-ॿ])[ \t]+(?=[ा-्ँ-ः])")  # Janmitra lane_a
RESIDUE = re.compile(r"[�-\x00]|\(cid:\d+\)")
_MALFORMED = (  # Janmitra validate.py
    re.compile(r"(?:^|[^क-हक़-य़़])[ा-ौ]"),  # vowel sign with no consonant
    re.compile(r"[ा-ौ][ा-ौ]"),                              # two vowel signs in a row
    re.compile(r"्[ऄ-औा-ौ]"),                          # virama then a vowel
    re.compile(r"[ऄ-औ]्"),                                       # independent vowel + virama
    re.compile(r"़़"),                                                # double nukta
)
DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
SUBMARKERS = "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशसह"
NUKTA = "़"


def letters(text):
    return [c for c in text if unicodedata.category(c).startswith("L") or "ऀ" <= c <= "ॿ"]


def dev_share(text):
    """Share of letters (and Devanagari marks) that are Devanagari."""
    ls = letters(text or "")
    return sum(1 for c in ls if "ऀ" <= c <= "ॿ") / len(ls) if ls else 0.0


def is_hindi(text, share=0.3):
    return bool(text) and dev_share(text) >= share


def normalize(text):
    """NFC (one form for nukta letters), no zero-width characters, combining signs re-attached to their letter."""
    t = unicodedata.normalize("NFC", ZERO_WIDTH.sub("", text or ""))
    return ORPHAN_SIGN.sub("", t)


def fold_digits(text):
    """Devanagari digits -> ASCII. Length-preserving, so offsets into the original text stay valid."""
    return (text or "").translate(DIGITS)


def garble_report(text):
    """(garbled?, reasons) for a page of extracted text. Only judges pages with real Devanagari content."""
    t = unicodedata.normalize("NFC", text or "")
    devs = DEV.findall(t)
    n_dev = len(devs)
    reasons = []
    if n_dev < 30:
        return False, reasons
    residue = len(RESIDUE.findall(t))
    if residue / n_dev > 0.005:
        reasons.append(f"replacement/PUA/cid residue {residue}")
    malformed = sum(len(p.findall(t)) for p in _MALFORMED) * 1000 / n_dev
    if malformed > 10:
        reasons.append(f"malformed matra sequences {malformed:.1f}/1000")
    toks = DEV_TOKEN.findall(t)
    singles = sum(1 for x in toks if len(DEV_LETTER.findall(x)) == 1 and len(x) == 1)
    if len(toks) >= 20 and singles / len(toks) > 0.08:
        reasons.append(f"words broken into single letters {singles}/{len(toks)}")
    i_matra = t.count("ि") * 1000 / n_dev
    if n_dev >= 200 and i_matra < 8:  # running Hindi has ~25-45 'ि' per 1000 Devanagari characters
        reasons.append(f"vowel sign 'ि' missing ({i_matra:.1f}/1000)")
    return bool(reasons), reasons


# ---------- numbers and dates written in Hindi (for the verifier's number check) ----------
HI_MONTHS = {"जनवरी": "january", "फरवरी": "february", "फ़रवरी": "february", "मार्च": "march", "अप्रैल": "april",
             "मई": "may", "जून": "june", "जुलाई": "july", "अगस्त": "august", "सितंबर": "september",
             "सितम्बर": "september", "अक्टूबर": "october", "अक्तूबर": "october", "नवंबर": "november",
             "नवम्बर": "november", "दिसंबर": "december", "दिसम्बर": "december"}
_WORDS = [(r"प्रतिशत", " percent"), (r"फ़ीसदी|फीसदी", " percent"), (r"लाख", " lakh"), (r"करोड़|करोड", " crore"),
          (r"रुपये|रुपए|रुपया|रु\.", " rs ")]


def fact_text(text):
    """Hindi number words -> the English forms normalize.facts() reads: '2 प्रतिशत' -> '2 percent', '₹50 लाख' ->
    '₹50 lakh', '1 अगस्त 2026' -> '1 august 2026', '२' -> '2'."""
    t = unicodedata.normalize("NFC", fold_digits(text))
    for hi, en in HI_MONTHS.items():
        t = t.replace(unicodedata.normalize("NFC", hi), " " + en + " ")
    for pat, en in _WORDS:
        t = re.sub(unicodedata.normalize("NFC", pat), en, t)
    return re.sub(r"[ \t]+", " ", t)


# ---------- search ----------
STOP = set(unicodedata.normalize("NFC", w) for w in """का की के को में से पर है हैं और या भी तो यह वह इस उस इन उन एक
कि जो था थी थे होगा होगी होंगे हो कर किया किए गया गई गए लिए द्वारा तक साथ अपने नहीं कोई क्या कब कैसे कितना कितनी
कौन जाएगा जाएगी जाएंगे सकता सकती सकते""".split())


def tokenize(text):
    """BM25 tokens for a scope that holds a Hindi document: the English tokens as before, plus NFC Devanagari words
    (digits folded, nukta dropped so 'मुआवज़ा' and 'मुआवजा' meet, common function words dropped)."""
    t = normalize(fold_digits(text)).lower()
    t = t.replace("₹", " rs ").replace("pre-payment", "prepayment").replace("co-operative", "cooperative")
    out = []
    for m in re.finditer(r"[a-z]+|\d+(?:\.\d+)?|[ऀ-ॣॱ-ॿ]+", t):
        w = m.group(0)
        if DEV.match(w):
            w = w.replace(NUKTA, "")
            if w in STOP or len(w) < 2:
                continue
        out.append(w)
    return out


# ---------- redaction ----------
# Names after an honorific ('श्री रमेश कुमार वर्मा') and in a signature line ('(सुरेश चंद्र शर्मा)').
_W = r"[\u0900-\u0963\u0971-\u097F]+"
_NOT_NAME = r"(?!(?:को|ने|से|का|की|के|जी|द्वारा|ही|भी|तथा|और)(?![\u0900-\u097F]))"
HONORIFIC_NAME = rf"(?:श्रीमती|श्री|सुश्री|कुमारी|डॉ\.?|डा\.)\s+{_W}(?:\s+{_NOT_NAME}{_W}){{0,2}}"
SIGNATURE_NAME = r"(?<=\()(?:[ऀ-ॣॱ-ॿ]+\s){1,2}[ऀ-ॣॱ-ॿ]+(?=\)\s*(?:\n|$|महाप्रबंधक|मुख्य|उप|सहायक|प्रबंधक|निदेशक))"
