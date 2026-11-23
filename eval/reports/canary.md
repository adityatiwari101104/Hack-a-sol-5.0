# Eval: canary (2026-11-23 06:00)

```
{
 "n": 13,
 "labels": {
  "Accurate": 11,
  "Incomplete": 2,
  "Hallucinated": 0
 },
 "accurate_rate": 0.846,
 "accurate_ci95": [
  0.578,
  0.957
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 45,
 "fabricated_upper95_rule_of_three": 0.067,
 "abstention_precision": 0.667,
 "abstention_recall": 0.667,
 "answer_rate": 0.769,
 "over_refusal": 0.111,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.0,
 "draft_faithfulness_mean": 0.635,
 "latency_p50_ms": 1741,
 "latency_p95_ms": 10028,
 "spend_usd_upper_bound": 0.013,
 "cost_per_query_usd_upper_bound": 0.001,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
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
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II specifies a documentation fee of ₹500, payable once at execution.  |
| q020 | calculation | Incomplete | ABSTAIN | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The bank documents state a pre-payment charge of 2% of the amount prepaid or principal outstanding, depending on the document used.  |
| q022 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes; for EMI-based personal loans, the applicable directions require the lender to provide borrowers the option to switch over to a fixed ra |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a UCB with a floating-rate loan, the rules say the bank may, at its option, provide a choice to switch to a fixed rate at the time of re |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a floating-rate business loan sanctioned on or after 1 January 2026 to an MSE, a Tier 3 UCB shall not levy pre-payment charges only wher |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | For floating-rate loans granted for purposes other than business to individuals and sanctioned on or after 1 January 2026, a UCB shall not l |
| q033 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Section 8.2 is in force and says penal interest at 2% per month over the applicable rate of interest shall be charged on overdue instalments |
| q038 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✓ | ✗ | The bank’s note says a 2% pre-payment charge applies on foreclosure or pre-payment of the loan. For loans and advances sanctioned or renewed |
| q042 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The provided rules do not state a rupee cap for the penal charge on one missed EMI; they only say penal charges may be levied, must be reaso |
| q048 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The in-force UCB directions do not allow capitalisation of penal charges or penal interest, and they say there shall be no further interest  |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The bank’s retail loan policy says foreclosure charges of 2% plus GST on the principal outstanding shall be levied on all term loans pre-clo |