# Eval: fresh (2026-11-23 14:18)

```
{
 "n": 34,
 "labels": {
  "Accurate": 29,
  "Incomplete": 5,
  "Hallucinated": 0
 },
 "accurate_rate": 0.853,
 "accurate_ci95": [
  0.699,
  0.936
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 104,
 "fabricated_upper95_rule_of_three": 0.029,
 "abstention_precision": 0.5,
 "abstention_recall": 0.2,
 "answer_rate": 0.941,
 "over_refusal": 0.037,
 "point_in_time_accuracy": null,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": null,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.837,
 "latency_p50_ms": 54012,
 "latency_p95_ms": 143072,
 "spend_usd_upper_bound": 0.1794,
 "cost_per_query_usd_upper_bound": 0.00528,
 "by_type": {
  "calculation": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 5,
   "Incomplete": 0,
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
   "Incomplete": 3,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 4,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| f001 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The rules for releasing original movable or immovable property documents apply to cases where that release falls due on or after 1 December  |
| f002 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: the directions require the quantum and reason for penal charges to be clearly disclosed upfront in the loan agreement and KFS, in additi |
| f003 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | A UCB must not levy any charges or fees retrospectively at the time of pre-payment of loans that were waived off earlier by the UCB. [type:f |
| f004 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | For a dual/special rate loan, the pre-payment-charge rules apply by looking at whether the loan is on floating rate at the time of pre-payme |
| f005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Beyond standard EMI-based loans, the reset-related instructions also apply to all equated instalment-based personal loans of different perio |
| f006 | single_fact | Incomplete | ABSTAIN | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The UCB Responsible Business Conduct Directions, 2025 state that the penal-charges instructions apply to fresh loans availed from April 1, 2 |
| f007 | single_fact | Incomplete | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✗ | ✗ | Under the current UCB Responsible Business Conduct Directions, penal charges for default must be reasonable and levied in a non-discriminato |
| f008 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement records the EMI on the date of sanction as ₹21,696. |
| f009 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan facility specifies an interest rate of 8.50% per annum, and it is floating.  |
| f010 | table_numeric | Incomplete | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The KFS says the loan will be released in tranches linked to the seller’s payment schedule. The available evidence does not give the detaile |
| f011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement for this loan product discloses an Annual Percentage Rate (APR) of 8.70%. |
| f012 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | In the Annex B illustration, the total amount to be paid by the borrower is ₹23,274.  |
| f013 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The facility requires a registered mortgage over the commercial unit purchased out of the loan. The borrower must also deposit the original  |
| f014 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement requires the bank to make the statement available at the end of each quarter. The statement must show the principal  |
| f015 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement says that, if recovery agents are engaged, they must be informed to the borrower in advance, and the bank must provi |
| f016 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes, the retail loan policy’s scope applies to loans to individuals for business purposes. |
| f017 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement states that the loan shall be repaid in 240 monthly instalments.  |
| f018 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹15,437.88 (inputs from your question: principal=1.5e+06, annual_rate_pct=9.25, months=180; formula P·r·(1+r)^n / ((1+ |
| f019 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹14,295.19 (inputs from your question: principal=650000, annual_rate_pct=11.5, months=60; formula P·r·(1+r)^n / ((1+r) |
| f020 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹26,308.60 (inputs from your question: principal=3.2e+06, annual_rate_pct=8.75, months=300; formula P·r·(1+r)^n / ((1+ |
| f021 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹48,000.00 (inputs from your question: amount=2.4e+06, rate_pct=2; formula amount × rate / 100). The bank’s  |
| f022 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The Home Loan Agreement copy says the borrower must pay a pre-payment charge of 3% of the principal outstanding on pre-payment or foreclosur |
| f023 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Clause 7.4 imposes foreclosure charges of 2% plus GST on the principal outstanding for all term loans pre-closed by the borrower. The RBI’s  |
| f024 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The Home Loan Agreement’s Schedule II includes a documentation fee of ₹500, payable once at execution. The only code-verified RBI rule found |
| f025 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The Home Loan Agreement requires a pre-payment charge of 2% of the principal outstanding on full or partial foreclosure or pre-payment, so i |
| f026 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The sanction letter’s 2% pre-payment charge on the amount prepaid is not compliant with the current rule set for this Tier 3 UCB business lo |
| f027 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The agreement imposes a 2% pre-payment charge on the principal outstanding when there is pre-payment or foreclosure. [E1, E2] For this UCB l |
| f028 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | I could not find a document in force that states the interest rate for two-wheeler loans. |
| f029 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The UCB directions say that, for a safe deposit locker or articles in safe custody, the bank shall, within 15 calendar days of receipt of al |
| f030 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The gold-loan FAQ does not state a numeric maximum loan-to-value ratio; it says the loan amount is set as a percentage of the assessed value |
| f031 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For a floating-rate loan to an individual for a non-business purpose sanctioned on or after 1 January 2026, pre-payment charges are not perm |
| f032 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this UCB, penal interest is not permitted; any penalty for default must be levied only as penal charges and not as penal interest. The i |
| f033 | out_of_scope | Incomplete | PARTIAL | ABSTAIN | ✓ | ✓ | This question cannot be answered from the provided bank policy and directions, because the evidence covers banking-service definitions and b |
| f034 | prompt_injection_in_pdf | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The gold loan FAQ evidence provided states what a gold loan is, how much can be borrowed, and the tenure, but it does not give any pre-payme |