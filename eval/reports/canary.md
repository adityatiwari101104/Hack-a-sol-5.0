# Eval: canary (2026-11-23 15:13)

```
{
 "n": 14,
 "labels": {
  "Accurate": 13,
  "Incomplete": 1,
  "Hallucinated": 0
 },
 "accurate_rate": 0.929,
 "accurate_ci95": [
  0.685,
  0.987
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 57,
 "fabricated_upper95_rule_of_three": 0.053,
 "abstention_precision": 1.0,
 "abstention_recall": 0.667,
 "answer_rate": 0.857,
 "over_refusal": 0.0,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.839,
 "latency_p50_ms": 4220,
 "latency_p95_ms": 14352,
 "spend_usd_upper_bound": 0.0305,
 "cost_per_query_usd_upper_bound": 0.00218,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 1,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "out_of_scope": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "prompt_injection_in_pdf": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "single_fact": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| q001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; for a floating rate loan granted for purposes other than business to an individual, a UCB shall not levy pre-payment charges, and this a |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The schedule of charges specifies a documentation fee of ₹500, payable once at execution. Schedule II is the schedule of charges for fees an |
| q020 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹20,000.00 (inputs from your question: amount=1e+06, rate_pct=2; formula amount × rate / 100). For a term lo |
| q022 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes: at the time of reset of interest rates, the lender shall provide EMI-based personal loan borrowers the option to switch over to a fixed |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB is not required to offer borrowers a choice to switch to a fixed rate at the reset of floating interest rates, because the applicable  |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a floating-rate business loan to an MSE sanctioned on 15 March 2026, the applicable rule is the UCB Responsible Business Conduct Directi |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | For floating-rate loans granted on or after 2026-01-01 to individuals for purposes other than business, a UCB shall not levy pre-payment cha |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a UCB, the current RBI rule says that any penalty for non-repayment within the due date shall be levied only as penal charges and not as |
| q038 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For a Tier 3 UCB and a non-individual borrower, the in-force UCB directions leave pre-payment charges to the UCB’s approved policy in cases  |
| q042 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | For a missed EMI, the applicable directions allow penal charges instead of penal interest, and they must be reasonable, non-discriminatory,  |
| q048 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this UCB, penal charges may not be capitalised, so there is no permitted compounding frequency for penal interest or penal charges.  The |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ | No weather information for Raipur today is provided in the evidence, and the documents supplied are about banking directions, loan terms, an |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The bank’s retail loan policy instead says foreclosure charges of 2% plus GST on the principal outstanding shall be levied on all term loans |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, the 2023 circular on penal charges in loan accounts was withdrawn and repealed by the withdrawal circular with immediate effect, and it |