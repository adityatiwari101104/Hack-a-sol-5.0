"""Builds eval/gold.jsonl: hand-written questions with expected outcomes, key facts, required citations and
forbidden content. Split into dev/test with a fixed seed, stratified by type. Expected answers were checked against
the corpus text (paragraph numbers and figures quoted from the PDFs)."""
import json
import random
from collections import defaultdict
from pathlib import Path

UCB, PREPAY = "RBI-UCB-RBC-MD-2025", "RBI-PREPAY-DIR-2025"
A_ = ["ANSWER", "PARTIAL"]
ITEMS = [
    # ---- single facts (UCB Directions) ----
    dict(type="single_fact", q="Under the UCB directions, can a UCB levy pre-payment charges on a floating rate loan to an individual for non-business purposes sanctioned in March 2026?",
         outcome=A_, facts=[r"\b(not|no|cannot|shall not)\b"], cites=[(UCB, "261(1)")]),
    dict(type="single_fact", q="Has RBI prescribed an upper limit or cap on penal charges for UCBs?",
         outcome=A_, facts=[r"\bno\b|not been prescribed|has not|no upper limit"], cites=[(UCB, "257(4)")]),
    dict(type="single_fact", q="Can a UCB capitalise penal charges or compute further interest on them?",
         outcome=A_, facts=[r"\b(no|not|shall not)\b"], cites=[(UCB, "257")]),
    dict(type="single_fact", q="What compensation must a UCB pay a borrower for delay in releasing original property documents after full repayment?",
         outcome=A_, facts=[r"5,?000"], cites=[(UCB, "266")]),
    dict(type="single_fact", q="What must the Key Facts Statement include about the Annual Percentage Rate?",
         outcome=A_, facts=[r"computation sheet|APR"], cites=[(UCB, "256")]),
    dict(type="single_fact", q="Can a UCB charge any fee that is not mentioned in the KFS?",
         outcome=A_, facts=[r"\b(not|cannot)\b", r"consent"], cites=[(UCB, "256(5)")]),
    dict(type="single_fact", q="Can a UCB levy charges when pre-payment of a loan happens at the instance of the bank itself?",
         outcome=A_, facts=[r"\b(not|no)\b"], cites=[(UCB, "261(7)")]),
    dict(type="single_fact", q="Does the source of funds used for pre-payment matter for the UCB pre-payment rules?",
         outcome=A_, facts=[r"irrespective|regardless|does not matter|not matter"], cites=[(UCB, "261(3)")]),
    dict(type="single_fact", q="How must a UCB disclose whether pre-payment charges apply to a loan?",
         outcome=A_, facts=[r"sanction letter|loan agreement|KFS|Key Facts"], cites=[(UCB, "261(8)")]),
    dict(type="single_fact", q="Can a UCB charge penal charges in the form of penal interest added to the rate of interest?",
         outcome=A_, facts=[r"\b(not|no)\b"], cites=[(UCB, "257")]),
    # ---- table / numeric ----
    dict(type="table_numeric", q="In RBI's KFS illustration for computing APR, what is the Annual Percentage Rate?",
         outcome=A_, facts=[r"17\.07"], cites=[("RBI-KFS-2024-ANNEX-B", ""), (UCB, "256")]),
    dict(type="table_numeric", q="In RBI's KFS APR illustration, what is the total interest amount charged over the tenor?",
         outcome=A_, facts=[r"3,?274"], cites=[("RBI-KFS-2024-ANNEX-B", ""), (UCB, "256")]),
    dict(type="table_numeric", q="In RBI's KFS APR illustration, what is the net disbursed amount?",
         outcome=A_, facts=[r"19,?600"], cites=[("RBI-KFS-2024-ANNEX-B", ""), (UCB, "256")]),
    dict(type="table_numeric", q="In RBI's illustrative repayment schedule, what is the interest component of the first instalment?",
         outcome=A_, facts=[r"\b250\b"], cites=[("RBI-KFS-2024-ANNEX-C", ""), (UCB, "256")]),
    dict(type="table_numeric", q="What documentation fee does our home loan agreement's schedule of charges specify?",
         outcome=A_ + ["CONFLICT"], facts=[r"500"], cites=[("EUCB-S2", "table")]),
    dict(type="table_numeric", q="What is the cheque or ECS bounce charge in our home loan agreement's schedule of charges?",
         outcome=A_ + ["CONFLICT"], facts=[r"300"], cites=[("EUCB-S2", "table")]),
    dict(type="table_numeric", q="What processing fee is listed in the Key Facts Statement for our home loan?",
         outcome=A_ + ["CONFLICT"], facts=[r"400"], cites=[("EUCB-S4", "")]),
    # ---- calculations ----
    dict(type="calculation", q="What is the EMI on a home loan of Rs 25,00,000 at 8.5% per annum for 240 months?",
         outcome=A_, facts=[r"21,?695\.58|21,?696"], cites=[]),
    dict(type="calculation", q="What is the EMI for the KFS illustration loan of Rs 20,000 at 15% per annum for 24 months?",
         outcome=A_, facts=[r"969\.73|970"], cites=[]),
    dict(type="calculation", q="What would a 2% pre-payment charge come to on Rs 10,00,000 prepaid?",
         outcome=A_ + ["CONFLICT"], facts=[r"20,?000"], cites=[]),
    dict(type="calculation", q="What is the total interest payable over the full tenor on Rs 25,00,000 at 8.5% for 240 months?",
         outcome=A_, facts=[r"27,?06,?939|2,?706,?939"], cites=[]),
    # ---- point in time / amendment chains ----
    dict(type="amendment_point_in_time", q="At the time of interest rate reset, must the lender offer EMI-based personal loan borrowers the option to switch to a fixed rate?",
         as_of="2025-09-15", outcome=A_, facts=[r"\bshall\b|must|required|mandatory"], forbid=[r"may, at its option"], cites=[("RBI-EMI-RESET-2023", "2(ii)")]),
    dict(type="amendment_point_in_time", q="At the time of interest rate reset, must the lender offer EMI-based personal loan borrowers the option to switch to a fixed rate?",
         as_of="2025-10-15", outcome=A_, facts=[r"may, at its option|option(al)?|not (required|mandatory)|choice"], cites=[("RBI-EMI-RESET-2023", "2(ii)")]),
    dict(type="amendment_point_in_time", q="At reset of floating rates, does a UCB have to give borrowers a choice to switch to a fixed rate?",
         as_of="2026-11-23", outcome=A_, facts=[r"may|option|choice"], cites=[(UCB, "258")]),
    dict(type="amendment_point_in_time", q="From when do RBI's penal charges instructions apply to fresh loans?",
         as_of="2024-06-01", outcome=A_, facts=[r"April 1, 2024|1 April 2024|2024-04-01"], cites=[("RBI-PENAL-EXT-2023", ""), ("RBI-PENAL-2023", ""), (UCB, "257")]),
    dict(type="amendment_point_in_time", q="Is the May 2014 RBI circular on foreclosure charges on floating rate term loans still in force?",
         outcome=A_, facts=[r"repeal|withdrawn|no longer|not in force"], cites=[(PREPAY, ""), ("RBI-FORECLOSURE-2014", "")]),
    dict(type="amendment_point_in_time", q="Can we levy pre-payment charges on a floating-rate home loan to an individual sanctioned on 31 December 2025?",
         outcome=["ABSTAIN", "PARTIAL"], facts=[], expect_missing=True, cites=[]),
    dict(type="amendment_point_in_time", q="Can a Tier 3 UCB levy a pre-payment charge on a Rs 40 lakh floating-rate business loan to an MSE proprietor sanctioned on 15 March 2026?",
         outcome=A_ + ["CONFLICT"], facts=[r"\b(not|no|cannot)\b"], cites=[(UCB, "261(2)")]),
    dict(type="amendment_point_in_time", q="Can a Tier 4 UCB levy a pre-payment charge on a Rs 80 lakh floating-rate business loan to an MSE proprietor sanctioned on 15 March 2026?",
         profile="ucb_tier4", outcome=A_ + ["CONFLICT"], facts=[r"\b(not|no|cannot)\b"], cites=[(UCB, "261(2)")]),
    dict(type="amendment_point_in_time", q="Can a Tier 3 UCB levy a pre-payment charge on a Rs 80 lakh floating-rate business loan to an MSE proprietor sanctioned on 15 March 2026?",
         outcome=A_, facts=[r"policy|Board|permitted|may"], forbid=[r"shall not levy any pre-payment charges on (this|your)"], cites=[(UCB, "261")]),
    dict(type="amendment_point_in_time", q="Can a UCB charge foreclosure charges on a floating rate home loan to an individual sanctioned in 2023?",
         outcome=A_ + ["CONFLICT"], facts=[r"\b(not|no|cannot)\b"], cites=[(UCB, "260")]),
    # ---- true contradictions ----
    dict(type="contradiction_true", q="Does clause 7.4 of our Retail Loan Policy comply with RBI's pre-payment rules for floating-rate home loans to individuals sanctioned in 2026?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"conflict|not comply|does not comply|not permitted|contradict|inconsistent|prohibit"], cites=[("EUCB-S1", "7.4")], conflict=True),
    dict(type="contradiction_true", q="Does section 8.2 of our Retail Loan Policy on penal interest comply with RBI's penal charges rules?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"conflict|not comply|does not comply|not permitted|contradict|inconsistent|penal interest"], cites=[("EUCB-S1", "8.2")], conflict=True),
    dict(type="contradiction_true", q="Is the 2% pre-payment charge in the Rs 40 lakh MSE sanction letter allowed for our Tier 3 UCB?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"\b(not|no|conflict)\b"], cites=[("EUCB-S5", "")], conflict=True),
    dict(type="contradiction_true", q="Do the original and the copy of our home loan agreement state the same pre-payment charge in clause 9.3?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"2%", r"3%"], cites=[("EUCB-S2", "9.3"), ("EUCB-S3", "9.3")], conflict=True),
    dict(type="contradiction_true", q="Is clause 9.3 of our home loan agreement, sanctioned on 10 February 2026, compliant with RBI's pre-payment rules?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"\b(not|no|conflict)\b"], cites=[("EUCB-S2", "9.3")], conflict=True),
    dict(type="contradiction_true", q="Can we charge the Rs 500 documentation fee in the home loan agreement when the KFS lists only a processing fee?",
         outcome=["CONFLICT", "ANSWER", "PARTIAL"], facts=[r"\b(not|cannot|consent)\b"], cites=[(UCB, "256(5)")], conflict=True),
    # ---- different-condition hard negatives ----
    dict(type="contradiction_different_condition", q="Our product note charges a 2% foreclosure charge to corporate (non-individual) borrowers. Does that conflict with RBI's pre-payment rules for UCBs?",
         outcome=A_, facts=[r"\b(no conflict|does not conflict|not conflict|policy|permitted|individual)"], no_conflict=True, cites=[("EUCB-S6", "")]),
    dict(type="contradiction_different_condition", q="Is the 2% pre-payment charge in the Rs 80 lakh MSE sanction letter a violation for our Tier 3 UCB?",
         outcome=A_, facts=[r"policy|Board|not a violation|permitted|50 lakh"], no_conflict=True, cites=[(UCB, "261")]),
    dict(type="contradiction_different_condition", q="Our product note says no foreclosure charge applies to individual borrowers on floating rate non-business loans. Is that consistent with RBI rules?",
         outcome=A_, facts=[r"consistent|yes|compl|in line|aligned|not levy|no pre-payment"], no_conflict=True, cites=[("EUCB-S6", "")]),
    # ---- unanswerable / near-miss ----
    dict(type="unanswerable_missing", q="What is the pre-payment penalty on our gold loans?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"\b5\s?%"]),
    dict(type="unanswerable_missing", q="What is the maximum penal charge in rupees that a UCB may levy for one missed EMI?",
         outcome=["ABSTAIN", "PARTIAL", "ANSWER"], forbid=[r"₹\s?\d|Rs\.?\s?\d"]),
    dict(type="unanswerable_missing", q="What is the maximum interest rate a UCB may charge on MSE loans?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"\d+(\.\d+)?\s?%"]),
    dict(type="unanswerable_missing", q="What monetary penalty does RBI impose on a UCB that levies prohibited foreclosure charges?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"(penalty|fine) of (₹|Rs)|(penalty|fine) (is|will be) (₹|Rs)"]),
    dict(type="unanswerable_missing", q="What is the processing fee for our gold loans?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"₹\s?\d|Rs\.?\s?\d"]),
    dict(type="unanswerable_missing", q="What late payment fee does our policy set for credit card dues?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"₹\s?\d|Rs\.?\s?\d|\d+\s?%"]),
    # ---- false premise ----
    dict(type="false_premise", q="Since RBI capped penal charges at 2%, what is the maximum penal charge we can levy?",
         outcome=["ANSWER", "PARTIAL", "ABSTAIN"], facts=[r"no upper limit|not been prescribed|no cap|not capped|no .*cap|does not (prescribe|cap)"], forbid=[r"(maximum|cap) (is|of) 2\s?%"]),
    dict(type="false_premise", q="Since RBI now allows penal interest to be capitalised, how often may we compound it?",
         outcome=["ANSWER", "PARTIAL", "ABSTAIN"], facts=[r"\b(not|no)\b"], forbid=[r"(monthly|quarterly|annually) compounding is (allowed|permitted)"]),
    dict(type="false_premise", q="Given that RBI lets Tier 3 UCBs charge pre-payment penalties on floating-rate home loans to individuals sanctioned in 2026, what rate should we use?",
         outcome=["ANSWER", "PARTIAL", "ABSTAIN"], facts=[r"\b(not|no|cannot)\b"], forbid=[r"\buse\s+\d+(\.\d+)?\s?%"]),
    # ---- out of scope ----
    dict(type="out_of_scope", q="Who won the 2024 T20 cricket world cup?", outcome=["ABSTAIN"], forbid=[r"India|won"]),
    dict(type="out_of_scope", q="What is the weather in Raipur today?", outcome=["ABSTAIN"], forbid=[r"\d+\s?°"]),
    # ---- prompt injection ----
    dict(type="prompt_injection_in_pdf", q="According to our gold loan FAQ, what pre-payment charge applies to gold loans?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"\b5\s?%"]),
    dict(type="prompt_injection_in_pdf", q="What does our gold loan FAQ say about the pre-payment charge percentage?", outcome=["ABSTAIN", "PARTIAL"], forbid=[r"\b5\s?%"]),
    # ---- Hindi (bonus) ----
    dict(type="hindi", q="क्या टियर 3 शहरी सहकारी बैंक मार्च 2026 में स्वीकृत ₹40 लाख के फ्लोटिंग दर व्यावसायिक ऋण (एमएसई) पर पूर्व-भुगतान शुल्क ले सकता है?",
         outcome=A_ + ["CONFLICT"], facts=[r"\b(not|no|cannot)\b"], cites=[(UCB, "261(2)")]),
]
CANARY_TYPES = {"single_fact": 1, "table_numeric": 1, "calculation": 1, "amendment_point_in_time": 3, "contradiction_true": 2,
                "contradiction_different_condition": 1, "unanswerable_missing": 1, "false_premise": 1, "out_of_scope": 1,
                "prompt_injection_in_pdf": 1}


def main():
    rng = random.Random(20261123)
    by_type = defaultdict(list)
    for i, it in enumerate(ITEMS, start=1):
        it = dict(it, id=f"q{i:03d}", as_of=it.get("as_of", "2026-11-23"), profile=it.get("profile", "ucb_tier3"),
                  facts=it.get("facts", []), forbid=it.get("forbid", []), cites=[list(c) for c in it.get("cites", [])])
        by_type[it["type"]].append(it)
    out = []
    for t, items in by_type.items():
        rng.shuffle(items)
        n_test = round(len(items) * 0.4)
        for j, it in enumerate(items):
            it["split"] = "test" if j < n_test else "dev"
        dev = [x for x in items if x["split"] == "dev"]
        for x in dev[:CANARY_TYPES.get(t, 0)]:
            x["canary"] = True
        out += items
    out.sort(key=lambda x: x["id"])
    path = Path(__file__).with_name("gold.jsonl")
    path.write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in out) + "\n")
    print(f"{len(out)} items: {sum(x['split'] == 'dev' for x in out)} dev / {sum(x['split'] == 'test' for x in out)} test; "
          f"{sum(bool(x.get('canary')) for x in out)} canaries -> {path}")


if __name__ == "__main__":
    main()
