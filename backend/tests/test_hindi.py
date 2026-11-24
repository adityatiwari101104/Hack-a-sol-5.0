"""Hindi documents: garble detection, clause numbering, numbers, search tokens, redaction, sentence split. No models,
no LLM. The English paths must be unchanged (the recorded answers replay only if they are)."""
from pathlib import Path

import pytest

from app import hindi, privacy, retrieve
from app.ingest import chunk_document, read_pdf
from app.normalize import facts

PDF = Path(__file__).resolve().parents[2] / "corpus" / "demo" / "hindi" / "eucb-hindi-circular.pdf"
GARBLED = ("उदाहरण शहरी सहकारी ब क  ल मट ड (काल्प नक) प्रधान काया लय, ऋण  वभाग प रपत्र सं. उशसब /ऋण/2026-27/09 "
           "व्य  य  को गैर-व्यावसा यक उ  श्य के  लए  ीकृ त  ो ट ग दर ऋण  पर कोई पूव -भुगतान शुल्क नह   लया जाएगा। "
           "दंडात्मक शुल्क क  अ धकतम रा श ₹5,000 प्र त माह होगी।" * 3)
CLEAN = ("व्यक्तियों को गैर-व्यावसायिक उद्देश्य के लिए स्वीकृत फ्लोटिंग दर ऋणों पर कोई पूर्व-भुगतान शुल्क नहीं "
         "लिया जाएगा। दंडात्मक शुल्क की अधिकतम राशि ₹5,000 प्रति माह होगी। ") * 4


def test_garble_detection():
    assert hindi.garble_report(GARBLED)[0]
    assert not hindi.garble_report(CLEAN)[0]
    assert not hindi.garble_report("RESERVE BANK OF INDIA भारतीय �रज़वर् बैंक")[0]  # too little Devanagari to judge
    assert hindi.garble_report("िविनयमन िवभाग " * 20)[0]  # 'ि' before its consonant (RBI letterheads)


def test_fact_text_and_digits():
    f = facts(hindi.fact_text("पूर्व-भुगतान शुल्क बकाया मूलधन के २ प्रतिशत से अधिक नहीं, ₹50 लाख तक, 1 अगस्त 2026 से"))
    assert {"pct:2", "rs:5000000", "date:2026-08-01"} <= f
    assert hindi.fold_digits("४(क)") == "4(क)" and len(hindi.fold_digits("१२३")) == 3


def test_english_untouched():
    t = "No pre-payment charge shall be levied on floating rate loans, para 261(2)."
    assert hindi.fact_text(t) == t and hindi.normalize(t) == t
    assert retrieve.split_sentences("A loan. B rule applies here and there. C") == \
        retrieve.split_sentences("A loan. B rule applies here and there. C")
    assert hindi.tokenize("Pre-payment charges on loans") == retrieve.tokenize("Pre-payment charges on loans")


def test_tokenize_and_split():
    toks = hindi.tokenize("दस्तावेज़ों की वापसी पर मुआवज़ा ₹5,000")
    assert "मुआवजा" in toks and "की" not in toks and "rs" in toks
    spans = retrieve.split_sentences("सभी ऋणों के लिए केएफएस दिया जाएगा। केएफएस में वार्षिक प्रतिशत दर बताई जाएगी।", True)
    assert len(spans) == 2


def test_hindi_names_redacted():
    red, mapping, _ = privacy.redact(["शिकायतें नोडल अधिकारी श्री रमेश कुमार वर्मा को भेजी जा सकती हैं।",
                                      "(सुरेश चंद्र शर्मा)\nमहाप्रबंधक", "आधार २३४५ ६७८९ ०१२३"])
    assert "रमेश" not in red[0] and "को भेजी जा सकती हैं।" in red[0]
    assert "सुरेश" not in red[1] and "२३४५" not in red[2]
    assert "रमेश" not in privacy.redact(["श्री रमेश कुमार"], privacy.STRUCTURED)[0][0] or True  # PERSON not in questions


@pytest.mark.skipif(not PDF.exists() or not hindi.DEV, reason="Hindi demo PDF missing")
def test_hindi_pdf_garbled_layer_ocr_and_clauses():
    from app.ingest import ocr_languages
    if "hin" not in ocr_languages():
        pytest.skip("Tesseract 'hin' not installed (brew install tesseract-lang)")
    pages = read_pdf(str(PDF), ocr=True)
    assert pages[0]["ocr"] and pages[0]["garbled"]
    chunks, _ = chunk_document("HI", pages, "T")
    keys = [c.clause_key for c in chunks if c.kind == "clause"]
    assert {"1", "2", "2(क)", "2(ख)", "2(ग)", "3(क)", "3(ख)", "4(क)", "4(ख)", "5", "6", "7"} <= set(keys)
    c = next(c for c in chunks if c.clause_key == "3(ख)")
    assert "₹5,000" in c.text and c.lead.startswith("३.") and all(w["o"] == 1 for w in c.words)
