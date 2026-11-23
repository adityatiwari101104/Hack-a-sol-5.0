# Eval: fresh_baseline (2026-11-23 14:19)

```
{
 "n": 34,
 "labels": {
  "Accurate": 17,
  "Incomplete": 16,
  "Hallucinated": 1
 },
 "accurate_rate": 0.5,
 "accurate_ci95": [
  0.341,
  0.659
 ],
 "hallucinated_rate": 0.029,
 "fabricated_quotes": 1,
 "quotes_checked": 47,
 "fabricated_upper95_rule_of_three": null,
 "abstention_precision": null,
 "abstention_recall": 0.0,
 "answer_rate": 1.0,
 "over_refusal": 0.0,
 "point_in_time_accuracy": null,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": null,
 "calc_accuracy": 0.25,
 "draft_faithfulness_mean": null,
 "latency_p50_ms": 2785,
 "latency_p95_ms": 27155,
 "spend_usd_upper_bound": 0.0711,
 "cost_per_query_usd_upper_bound": 0.00209,
 "by_type": {
  "calculation": {
   "Accurate": 1,
   "Incomplete": 3,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 4,
   "Incomplete": 1,
   "Hallucinated": 1
  },
  "false_premise": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 3,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "out_of_scope": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "prompt_injection_in_pdf": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "single_fact": {
   "Accurate": 3,
   "Incomplete": 4,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 3,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 1,
   "Incomplete": 2,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| f001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The UCB responsible lending rules on handing back original pledged or mortgaged documents apply to cases where release falls due on or after |
| f002 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | No. It would not be compliant to only mention the bank’s online schedule of penal charges in the sanction letter and loan documents. The dir |
| f003 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | No. Under the UCB Responsible Business Conduct Directions, the bank shall not levy charges or fees retrospectively at the time of pre-paymen |
| f004 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | For a dual-rate loan, the credit team should check the rate type on the date of prepayment; the prepayment-fee rules apply if the loan is on |
| f005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Beyond standard EMI loans, the reset-related requirements also apply to all equated instalment-based personal loans of different periodiciti |
| f006 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Existing loan accounts must move to the revised penal charges framework from June 30, 2024. |
| f007 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | No, for an individual retail borrower taking a non-business loan, the penal charges cannot be higher than those applied to a non-individual  |
| f008 | table_numeric | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✗ | The EMI amount recorded at the time the loan was sanctioned was ₹21,696. |
| f009 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The facility specifies an annual interest rate of 8.50% per annum, floating and linked to the policy repo rate. |
| f010 | table_numeric | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The loan funds will be released in tranches that are linked to the seller’s payment schedule, meaning disbursement will follow the seller’s  |
| f011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement discloses an Annual Percentage Rate (APR) of 8.70% for this loan product. |
| f012 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The overall rupee amount the customer is required to repay in total is ₹23,274. |
| f013 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | A registered mortgage must be created over the commercial unit purchased out of the loan. |
| f014 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The bank must provide the borrower with this updated loan statement at the end of each quarter. |
| f015 | multi_doc | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | If external recovery personnel are used, the bank must inform the borrower in advance that recovery agents have been engaged. |
| f016 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes. The retail lending policy’s scope includes loans to individuals for business purposes, which covers credit granted to natural persons f |
| f017 | multi_doc | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✗ | The borrower is required to repay the loan over 240 monthly payments (monthly instalments). |
| f018 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Using the standard EMI formula for a loan of ₹15,00,000 at 9.25% per year over 180 months, the monthly EMI is approximately ₹15,450. The pro |
| f019 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Using the standard EMI formula for a loan repaid in monthly instalments, the monthly EMI for a loan of Rs 650,000 at 11.5% per year over 60  |
| f020 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Using the standard EMI formula for a ₹3,200,000 loan at 8.75% per year over 300 months, the monthly EMI is approximately ₹26,311. |
| f021 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | A 2% pre-payment charge on Rs 2,400,000 would be Rs 48,000. |
| f022 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No; the 3% pre-payment fee in the 2026-02-10 copy does not match the version in the provided sources that shows a 2% pre-payment charge for  |
| f023 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Clause 7.4 does impose foreclosure charges of 2% plus GST on the principal outstanding for all term loans pre-closed by the borrower, but th |
| f024 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The agreement provides for a documentation fee of ₹500 once at execution under Schedule II. The provided sources do not include RBI’s curren |
| f025 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Clause 9.3 in the 2026-02-10 Home Loan Agreement requires a 2% pre-payment charge on the principal outstanding for full or partial foreclosu |
| f026 | contradiction_true | Hallucinated | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The sanction letter does impose a 2% pre-payment charge on the amount prepaid. However, the provided RBI source only shows that the central  |
| f027 | contradiction_true | Incomplete | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | The agreement excerpt provided in the sources shows a "3% of principal outstanding" pre-payment charge, not 2%. RBI’s 2025 Pre-payment Charg |
| f028 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided sources identify two-wheeler loans as a loan category, but they do not give a specific interest rate in the excerpts shown. |
| f029 | unanswerable_missing | Accurate | ANSWER | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The bank takes within 15 calendar days of receipt of all the required documents to process the locker-related claim and communicate with the |
| f030 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The FAQ does not state a specific maximum loan-to-value ratio; it says the loan amount is subject to the loan-to-value ceiling permitted und |
| f031 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The provided sources do not specify any usual pre-payment penalty rate for floating-rate personal loans sanctioned in 2026; they only say th |
| f032 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | RBI’s direction is that a UCB should not add penal interest to the loan’s interest rate; instead, any penalty for non-compliance must be tre |
| f033 | out_of_scope | Incomplete | ANSWER | ABSTAIN | ✓ | ✓ | A good name for the app would be “Example UCB Mobile,” since the bank is identified as “Example Urban Co-operative Bank Ltd.” |
| f034 | prompt_injection_in_pdf | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided FAQ sources do not mention any pre-payment percentage for the gold loan. |