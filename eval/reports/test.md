# Eval: test (2026-11-24 02:50)

```
{
 "n": 30,
 "labels": {
  "Accurate": 27,
  "Incomplete": 3,
  "Hallucinated": 0
 },
 "accurate_rate": 0.9,
 "accurate_ci95": [
  0.744,
  0.965
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 89,
 "fabricated_upper95_rule_of_three": 0.034,
 "abstention_precision": 0.714,
 "abstention_recall": 1.0,
 "answer_rate": 0.767,
 "over_refusal": 0.087,
 "point_in_time_accuracy": 0.75,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.764,
 "pre_gate_rate_mean": 0.779,
 "blocked_sentences": 17,
 "shown_verified_rate": 1.0,
 "latency_p50_ms": 1101,
 "latency_p95_ms": 4582,
 "spend_usd_upper_bound": 0.0,
 "cost_per_query_usd_upper_bound": 0.0,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 3,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 3,
   "Incomplete": 0,
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
   "Accurate": 3,
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
| q004 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes — if the delay in releasing the original movable / immovable property documents beyond 30 days after full repayment / settlement is attr |
| q006 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for all new retail and MSME term loans sanctioned on or after October 1, 2024, a UCB cannot charge any fees, charges, etc. not mentioned |
| q007 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | No, a UCB shall not levy any charges where pre-payment is effected at the instance of the bank. This rule is stated for loans and advances s |
| q009 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes: the applicability or otherwise of pre-payment charges shall be clearly disclosed in the sanction letter and loan agreement. For loans a |
| q012 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes — the total interest amount to be charged during the entire tenor is 3,274. |
| q013 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q014 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, in the illustrative repayment schedule the interest component of the first instalment is 250. |
| q019 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹969.73 (inputs from your question: principal=20,000, annual_rate_pct=15, months=24; formula P·r·(1+r)^n / ((1+r)^n −  |
| q021 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Total Interest computed by code: ₹2,706,939.40 (inputs from your question: principal=25,00,000, annual_rate_pct=8.5, months=240; formula EMI |
| q023 | amendment_point_in_time | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✓ | ✓ | No, the documents do not state that the lender must offer EMI-based personal loan borrowers the option to switch to a fixed rate at reset; t |
| q025 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes — for fresh loans, RBI’s instructions on penal charges apply to loans availed from April 1, 2024 onwards. |
| q028 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No, a Tier 3 UCB shall not levy any pre-payment charges on this floating rate business loan to an MSE when the sanctioned amount is ₹40 lakh |
| q031 | amendment_point_in_time | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No— for existing floating rate term loans sanctioned before December 31, 2025 for purposes other than business to individual borrowers, a UC |
| q034 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, the documents say a Tier 3 UCB shall not levy any pre-payment charges on business-purpose loans to Micro and Small Enterprises with sanc |
| q037 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, a ₹500 documentation fee cannot be charged by a UCB at any stage during the term of the loan if it is not mentioned in the KFS, without  |
| q039 | contradiction_different_condition | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: the documents do not state that a 2% pre-payment charge in this Rs 80 lakh MSE sanction letter is a violation for a Tier 3 UCB, because  |
| q041 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | For loans and advances sanctioned or renewed on or after January 1, 2026, paragraph 261(5) says that in cases other than those mentioned at  |
| q045 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ |  |
| q047 | false_premise | Incomplete | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✗ | ✓ | The documents state only that such penal charges shall be reasonable and levied only on the amount under default in a non-discriminatory man |
| q050 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q053 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The Gold Loan FAQ says only that gold loans are granted against the security of gold ornaments pledged with the Bank, that the loan amount i |
| q055 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes—UCB must release all the original movable / immovable property documents within a period of 30 days after full repayment/ settlement of  |
| q058 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The KFS for the home loan lists penal charges of ₹500 per month of default. The Home Loan Agreement says penal charges shall be disclosed in |
| q061 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the Home Loan Agreement was made on 10 February 2026, and the Loan is ₹25,00,000. |
| q065 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, the Retail Loan Policy allows the Bank, at the time of reset of the floating rate, to offer the borrower a choice to switch to a fixed  |
| q067 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Apr Irr computed by code: 17.07% (inputs from your question: net_disbursed=19,600, instalment=969.73, months=24; formula solve net disbursed |
| q068 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, clause 9.3 of the copy is not compliant with the applicable RBI pre-payment rule for this case. The copy says that, in the event of fore |
| q072 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No, the documents do not state that a 2% foreclosure charge on a fixed-rate term loan to a private limited company conflicts with the RBI pr |
| q074 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The home-loan materials state that a credit information report shall be obtained from at least one credit information company for every borr |
| q076 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The documents do not state that anything replaces KFS. The 2024 KFS for Loans & Advances is repealed by the 2025 withdrawal with effect from |