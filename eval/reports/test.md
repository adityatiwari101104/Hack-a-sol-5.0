# Eval: test (2026-11-23 06:06)

```
{
 "n": 30,
 "labels": {
  "Accurate": 25,
  "Incomplete": 5,
  "Hallucinated": 0
 },
 "accurate_rate": 0.833,
 "accurate_ci95": [
  0.664,
  0.927
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 70,
 "fabricated_upper95_rule_of_three": 0.043,
 "abstention_precision": 0.5,
 "abstention_recall": 0.6,
 "answer_rate": 0.8,
 "over_refusal": 0.13,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.667,
 "draft_faithfulness_mean": 0.614,
 "latency_p50_ms": 4822,
 "latency_p95_ms": 8080,
 "spend_usd_upper_bound": 0.1575,
 "cost_per_query_usd_upper_bound": 0.00525,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 2,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 1,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 2,
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
   "Accurate": 5,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 1,
   "Incomplete": 3,
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
| q004 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must release the original property documents and remove the charge within 30 days after full repayment or settlement of the loan accou |
| q006 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For new retail and MSME term loans sanctioned on or after 1 October 2024 by a UCB, fees or charges not mentioned in the KFS cannot be charge |
| q007 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | No; a UCB shall not levy any charges where pre-payment is effected at the instance of the bank.  The current UCB directions on pre-payment c |
| q009 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must clearly disclose whether pre-payment charges apply in the sanction letter and the loan agreement. Where a key fact statement is r |
| q012 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q013 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q014 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q019 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The KFS illustration for a sanctioned loan amount of ₹20,000 at 15% with a monthly EPI for 24 instalments shows an EMI of ₹970 per month. |
| q021 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The loan amount is ₹25,00,000, the interest rate is 8.5% per annum, and the loan term is 240 months. |
| q023 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; at the time of reset of interest rates, the applicable directions say the lender may, at its option, provide a choice to switch to a fix |
| q025 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The instructions apply to fresh loans availed from April 1, 2024 onwards. |
| q028 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a floating-rate business loan to an MSE sanctioned on or after 1 January 2026, a Tier 3 UCB shall not levy any pre-payment charges w |
| q031 | amendment_point_in_time | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No, a UCB shall not charge pre-payment charges on an existing floating rate term loan sanctioned before December 31, 2025 to an individual f |
| q034 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The bank’s MSE business loan sanction letters say pre-payment charges are 2% of the amount prepaid. For a UCB’s loans sanctioned or renewed  |
| q037 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | For a UCB, fees and charges not mentioned in the KFS cannot be charged at any stage during the term of the loan without the borrower’s expli |
| q039 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For cases other than those covered by that no-charge rule, pre-payment charges may be as per the UCB’s approved policy, and for term loans a |
| q041 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | For UCBs, the in-force directions say pre-payment charges on loans and advances sanctioned or renewed on or after 1 January 2026 are subject |
| q045 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | Gold loans are governed by the bank’s Gold Loan Operational Guidelines, read with the Retail Loan Policy. The policy says processing fee and |
| q047 | false_premise | Incomplete | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✗ | ✓ | The current UCB directions instead require penal charges, if charged, to be treated as penal charges and not as penal interest, and they mus |
| q050 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q053 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ |  |
| q055 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must release all original movable or immovable property documents within 30 days after full repayment or settlement of the loan accoun |
| q058 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement lists penal charges as ₹500 per month of default.  |
| q061 | multi_doc | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The agreement record shows a date of sanction of 10 February 2026, and it does not state a separate agreement date in the cited text.  The l |
| q065 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The Retail Loan Policy allows the bank, at the time of reset of a floating rate, to offer the borrower a choice to switch to a fixed rate as |
| q067 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a net disbursed amount of ₹19,600 repaid in 24 monthly instalments of ₹969.73, the APR is 17.07% under the applicable UCB Responsible Bu |
| q068 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The copy of clause 9.3 says a pre-payment charge of 3% of the principal outstanding is payable on foreclosure or pre-payment, so it does imp |
| q072 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The bank’s own product note says a 2% foreclosure charge applies to non-individual corporate borrowers on a term loan. |
| q074 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ |  |
| q076 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The withdrawn RBI circular on the Key Facts Statement (KFS) for Loans & Advances does not show any replacement document in the evidence prov |