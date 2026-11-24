"""Gate e on Hindi evidence: which local checker is stricter? ($0, no LLM; the LLM span-judge tier is not included)

    python eval/hindi_gate_e.py

Each pair is a verbatim clause of the fictional Hindi circular (corpus/demo/hindi) with an English claim that is
SUPPORTED by it or NOT (a flipped negation, a wrong number binding, a wrong subject, an added condition). Reports, per
checker, how many supported claims pass (recall) and how many unsupported claims wrongly pass (false passes; the
number that matters: a false pass is an unverified sentence shown to the user). Writes eval/reports/hindi_gate_e.json.
"""
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
from app import config, verify  # noqa: E402

C = {
    "2(क)": "(क) व्यक्तियों को गैर-व्यावसायिक उद्देश्य के लिए स्वीकृत फ्लोटिंग दर ऋणों पर कोई पूर्व-भुगतान शुल्क नहीं लिया जाएगा।",
    "2(ख)": "(ख) सूक्ष्म और लघु उद्यमों को ₹50 लाख तक स्वीकृत फ्लोटिंग दर ऋणों पर भी कोई पूर्व-भुगतान शुल्क नहीं लिया जाएगा।",
    "2(ग)": "(ग) स्थिर दर ऋणों पर पूर्व-भुगतान शुल्क बकाया मूलधन के 2 प्रतिशत से अधिक नहीं होगा।",
    "3(क)": "(क) ऋण की शर्तों के उल्लंघन पर लगाया गया दंडात्मक शुल्क ब्याज दर में नहीं जोड़ा जाएगा और उस पर कोई ब्याज नहीं लिया जाएगा।",
    "3(ख)": "(ख) दंडात्मक शुल्क की अधिकतम राशि ₹5,000 प्रति माह होगी।",
    "4(क)": "(क) पूरा ऋण चुकाने के 30 दिनों के भीतर सभी मूल चल और अचल संपत्ति दस्तावेज़ उधारकर्ता को लौटाए जाएंगे।",
    "4(ख)": "(ख) देरी होने पर बैंक उधारकर्ता को देरी के प्रत्येक दिन के लिए ₹5,000 का मुआवज़ा देगा।",
    "5": "सभी खुदरा और एमएसएमई ऋणों के लिए ऋण अनुबंध से पहले उधारकर्ता को मुख्य तथ्य विवरण (केएफएस) दिया जाएगा।",
    "6": "ब्याज दर रीसेट के समय उधारकर्ता को ईएमआई बढ़ाने, अवधि बढ़ाने या दोनों के संयोजन का विकल्प दिया जाएगा।",
    "7": "इस परिपत्र से संबंधित शिकायतें नोडल अधिकारी को भेजी जा सकती हैं, जो 15 कार्य दिवसों में उत्तर देंगे।",
}
PAIRS = [
    ("2(क)", "No pre-payment charge will be levied on floating rate loans sanctioned to individuals for non-business purposes.", True),
    ("2(क)", "A pre-payment charge may be levied on floating rate loans sanctioned to individuals for non-business purposes.", False),
    ("2(ख)", "No pre-payment charge will be levied on floating rate loans of up to ₹50 lakh sanctioned to micro and small enterprises.", True),
    ("2(ख)", "Micro and small enterprises must pay a pre-payment charge on floating rate loans of up to ₹50 lakh.", False),
    ("2(ग)", "The pre-payment charge on fixed rate loans will not exceed 2 per cent of the outstanding principal.", True),
    ("2(ग)", "The pre-payment charge on fixed rate loans will be at least 2 per cent of the outstanding principal.", False),
    ("2(ग)", "No pre-payment charge can be levied on fixed rate loans.", False),
    ("3(क)", "Penal charges for breach of loan terms will not be added to the interest rate.", True),
    ("3(क)", "No interest will be charged on penal charges.", True),
    ("3(क)", "Penal charges will be added to the rate of interest.", False),
    ("3(ख)", "The maximum penal charge is ₹5,000 per month.", True),
    ("3(ख)", "The minimum penal charge is ₹5,000 per month.", False),
    ("4(क)", "All original property documents must be returned to the borrower within 30 days of full repayment.", True),
    ("4(क)", "Original property documents must be returned within 30 days of the loan being sanctioned.", False),
    ("4(ख)", "For a delay, the bank will pay the borrower compensation of ₹5,000 for each day of delay.", True),
    ("4(ख)", "For a delay, the borrower must pay the bank ₹5,000 for each day of delay.", False),
    ("4(ख)", "For a delay, the bank will pay a one-time compensation of ₹5,000.", False),
    ("5", "The borrower must be given a Key Facts Statement before the loan agreement for all retail and MSME loans.", True),
    ("5", "The Key Facts Statement is given only after the loan agreement is signed.", False),
    ("6", "At an interest rate reset, the borrower is offered the option to increase the EMI, extend the tenor, or a combination of both.", True),
    ("6", "At an interest rate reset, the bank may increase the EMI without offering the borrower any option.", False),
    ("7", "Complaints can be sent to the nodal officer, who will reply within 15 working days.", True),
    ("7", "Complaints can be sent to the nodal officer, who will reply within 15 calendar days.", False),
    ("7", "Complaints must be sent to the RBI Ombudsman.", False),
]


def checker(mode):
    def run(ev, claim):
        ok, label, _ = verify.hindi_gate_e(ev, verify.mt_hi_en(ev), claim, mode=mode)
        return ok, label
    return run


def main():
    rows, out = [], {}
    for name, fn in (("mt: translate (opus-mt) + HHEM/MiniCheck", checker("mt")),
                     ("mnli: multilingual NLI (mDeBERTa XNLI)", checker("mnli")),
                     ("both must agree (default)", checker("both"))):
        tp = fp = 0
        for key, claim, truth in PAIRS:
            ok, why = fn(C[key], claim)
            tp += ok and truth
            fp += ok and not truth
            rows.append({"checker": name, "clause": key, "claim": claim, "supported": truth, "passed": ok, "scores": why})
        n_t = sum(1 for p in PAIRS if p[2])
        out[name] = {"supported_passed": f"{tp}/{n_t}", "unsupported_passed (false pass)": f"{fp}/{len(PAIRS) - n_t}"}
        print(name, out[name])
    print("translations:", json.dumps({k: verify.mt_hi_en(v) for k, v in C.items()}, ensure_ascii=False, indent=1))
    (HERE / "reports").mkdir(exist_ok=True)
    (HERE / "reports" / "hindi_gate_e.json").write_text(json.dumps({"summary": out, "rows": rows}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    os.environ.setdefault("LLM_MODE", "replay")
    main()
