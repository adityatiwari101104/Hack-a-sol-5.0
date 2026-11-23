# Eval: test (2026-11-23 05:57)

```
{
 "n": 21,
 "labels": {
  "Accurate": 14,
  "Incomplete": 7,
  "Hallucinated": 0
 },
 "accurate_rate": 0.667,
 "accurate_ci95": [
  0.454,
  0.828
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 52,
 "fabricated_upper95_rule_of_three": 0.058,
 "abstention_precision": 0.25,
 "abstention_recall": 0.25,
 "answer_rate": 0.81,
 "over_refusal": 0.188,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.0,
 "draft_faithfulness_mean": 0.623,
 "latency_p50_ms": 5653,
 "latency_p95_ms": 13720,
 "spend_usd_upper_bound": 0.1516,
 "cost_per_query_usd_upper_bound": 0.00722,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 0,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "out_of_scope": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "prompt_injection_in_pdf": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "single_fact": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 0,
   "Incomplete": 3,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| q004 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must release the original property documents and remove the charge within 30 days after full repayment or settlement of the loan accou |
| q006 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | A UCB cannot charge fees or charges that are not mentioned in the KFS during the loan term unless the borrower gives explicit consent. For n |
| q007 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | type=fact: Under the in-force UCB directions for loans and advances sanctioned or renewed on or after 1 January 2026, a UCB shall not levy a |
| q009 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must clearly disclose whether pre-payment charges apply in the sanction letter and the loan agreement. Where a key fact statement is r |
| q012 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q013 | table_numeric | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | In the APR illustration, the net disbursed amount is ₹20,000, which is the loan amount shown in the hypothetical example. |
| q014 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q019 | calculation | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✓ |  |
| q021 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The loan amount is ₹25,00,000, the interest rate is 8.5% p.a., and the repayment term is 240 months. [E6, E2] |
| q023 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; at the time of reset of interest rates, the lender may, at its option, provide borrowers a choice to switch to a fixed rate as per its B |
| q025 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For fresh loans, RBI’s penal charges instructions apply to loans availed from April 1, 2024 onwards. The earlier timeline was extended to th |
| q028 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a floating-rate business loan to an MSE sanctioned on or after 1 January 2026, a Tier 3 UCB shall not levy any pre-payment charges w |
| q031 | amendment_point_in_time | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No; for an existing floating-rate term loan sanctioned before 31 December 2025 to an individual for a purpose other than business, a UCB sha |
| q034 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | I cannot confirm whether the 2% pre-payment charge is allowed because the sanction date is not in the evidence, and the applicable UCB rule  |
| q037 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The current UCB rule says fees or charges not mentioned in the KFS cannot be charged at any stage during the loan term without the borrower’ |
| q039 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For cases other than those covered by that no-charge rule, pre-payment charges may be as per the UCB’s approved policy, and for term loans a |
| q041 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The evidence does not state a gold-loan pre-payment penalty amount or rate. The in-force UCB directions say that, for loans and advances san |
| q045 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The bank’s policy says processing fee and documentation charges for loans are recovered as applicable at the time of sanction. The policy sa |
| q047 | false_premise | Incomplete | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✗ | ✓ | The same in-force directions say penal charges must be treated as penal charges and not as penal interest, and additional or fresh penal cha |
| q050 | out_of_scope | Incomplete | PARTIAL | ABSTAIN | ✓ | ✓ | The rule findings provided are about withdrawn or in-force banking directions and do not cover cricket or tournament outcomes. |
| q053 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ |  |