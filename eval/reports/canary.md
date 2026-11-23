# Eval: canary (2026-11-23 11:56)

```
{
 "n": 14,
 "labels": {
  "Accurate": 12,
  "Incomplete": 2,
  "Hallucinated": 0
 },
 "accurate_rate": 0.857,
 "accurate_ci95": [
  0.601,
  0.96
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 28,
 "fabricated_upper95_rule_of_three": 0.107,
 "abstention_precision": 0.75,
 "abstention_recall": 1.0,
 "answer_rate": 0.714,
 "over_refusal": 0.0,
 "point_in_time_accuracy": 0.667,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.501,
 "latency_p50_ms": 7965,
 "latency_p95_ms": 17203,
 "spend_usd_upper_bound": 0.0,
 "cost_per_query_usd_upper_bound": 0.0,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 2,
   "Incomplete": 1,
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
| q001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, pre-payment charges are not permitted on all floating rate loans granted for purposes other than business to individuals, wit |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II specifies a documentation fee of ₹500, payable once at execution. |
| q020 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹20,000.00 (inputs from your question: amount=1e+06, rate_pct=2; formula amount × rate / 100). |
| q022 | amendment_point_in_time | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Yes: at the time of reset of interest rates, the applicable RBI rule requires the lender to provide borrowers the option to switch over to a |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; for a UCB, the policy says the bank may, at its option, provide borrowers a choice to switch to a fixed rate at the time of reset of int |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A Tier 3 UCB may levy a pre-payment charge on a floating-rate business loan to an MSE sanctioned on or after 1 January 2026 only within the  |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The home-loan agreement says that on foreclosure or pre-payment, in full or in part, the borrower shall pay a pre-payment charge of 3% of th |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a Tier 3 UCB, the current applicable rule says penal interest is not permitted, while penal charges are permitted only under the stated  |
| q038 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | The in-force UCB directions say that for loans sanctioned or renewed on or after 2026-01-01, pre-payment charges are not to be levied for al |
| q042 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The provided rules do not state a rupee cap for the penal charge on one missed EMI; they only say penal charges may be levied, must be reaso |
| q048 | false_premise | Accurate | ABSTAIN | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The current UCB directions also say penal charges shall be levied only on the amount under default and that additional or fresh penal charge |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions say that, in cases other than the listed exceptions, pre-payment charges, if any, shall be as per the approved p |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes; the 2023 circular on penal charges in loan accounts was withdrawn and repealed with immediate effect on 2025-11-28, and it is no longer |