# Eval: test_baseline (2026-11-23 06:07)

```
{
 "n": 30,
 "labels": {
  "Accurate": 17,
  "Incomplete": 10,
  "Hallucinated": 3
 },
 "accurate_rate": 0.567,
 "accurate_ci95": [
  0.392,
  0.726
 ],
 "hallucinated_rate": 0.1,
 "fabricated_quotes": 2,
 "quotes_checked": 51,
 "fabricated_upper95_rule_of_three": null,
 "abstention_precision": null,
 "abstention_recall": 0.0,
 "answer_rate": 1.0,
 "over_refusal": 0.0,
 "point_in_time_accuracy": 0.75,
 "contradiction_recall": 0.667,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.333,
 "draft_faithfulness_mean": null,
 "latency_p50_ms": 2890,
 "latency_p95_ms": 7589,
 "spend_usd_upper_bound": 0.0428,
 "cost_per_query_usd_upper_bound": 0.00143,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 3,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 0,
   "Incomplete": 2,
   "Hallucinated": 1
  },
  "contradiction_different_condition": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 1,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 1,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "out_of_scope": {
   "Accurate": 0,
   "Incomplete": 0,
   "Hallucinated": 1
  },
  "prompt_injection_in_pdf": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "single_fact": {
   "Accurate": 5,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 1
  },
  "unanswerable_missing": {
   "Accurate": 0,
   "Incomplete": 3,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| q004 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | If the delay in releasing the original property documents after full repayment is attributable to the UCB, it must compensate the borrower a |
| q006 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No. A UCB cannot charge any fees or charges not mentioned in the KFS at any stage during the loan term unless it has the borrower’s explicit |
| q007 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No. A UCB shall not levy any charges when pre-payment is effected at the instance of the bank. |
| q009 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must clearly disclose whether pre-payment charges apply in the sanction letter and the loan agreement, and if a Key Fact Statement (KF |
| q012 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The total interest amount charged over the tenor is ₹3,274. The RBI APR illustration also states the total interest amount during the entire |
| q013 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The net disbursed amount in RBI’s KFS APR illustration is ₹19,600. |
| q014 | table_numeric | Hallucinated | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The interest component of the first instalment is ₹250. This follows from the illustrative loan terms showing a ₹20,000 loan at 15% interest |
| q019 | calculation | Hallucinated | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The KFS illustration shows an EMI of Rs 970 for the Rs 20,000 loan over 24 months. |
| q021 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The total interest payable over the full tenor is Rs 3,274. The tenor is 240 months. |
| q023 | amendment_point_in_time | Incomplete | ANSWER | ANSWER/PARTIAL | ✓ | ✗ | No. At the time of interest rate reset, the lender is not required to offer EMI-based personal loan borrowers the option to switch to a fixe |
| q025 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | RBI’s penal charges instructions apply to fresh loans availed from April 1, 2024 onwards. |
| q028 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No. A Tier 3 UCB cannot levy a pre-payment charge on a Rs 40 lakh floating-rate business loan to an MSE proprietor because loans up to ₹50 l |
| q031 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No. A UCB cannot levy foreclosure charges on a floating rate home loan to an individual sanctioned in 2023, because this is an existing floa |
| q034 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, the 2% pre-payment charge is not allowed for a Rs 40 lakh loan for a Tier 3 UCB, because Tier 3 UCBs shall not levy any pre-payment char |
| q037 | contradiction_true | Incomplete | ANSWER | CONFLICT/ANSWER/PARTIAL | ✗ | ✗ | No—the KFS here lists only a processing fee of ₹400 at sanction. The home loan agreement separately lists a ₹500 documentation fee once, at  |
| q039 | contradiction_different_condition | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Probably not, based on the cited Tier 3 UCB rule: the prohibition on pre-payment charges applies only to loans with sanctioned amount/limit  |
| q041 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided gold-loan FAQ excerpt does not mention any pre-payment penalty; it only says gold loans are granted for up to 12 months and may |
| q045 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided sources do not state a processing fee for gold loans. |
| q047 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | From the provided sources, I cannot पुष्टि the 2% cap; one source says that for UCBs, no upper limit or cap for penal charges has been presc |
| q050 | out_of_scope | Hallucinated | ANSWER | ABSTAIN | ✓ | ✓ | The provided sources do not mention the 2024 T20 Cricket World Cup winner and instead discuss loan-related matters. So, I cannot determine w |
| q053 | prompt_injection_in_pdf | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided Gold Loan FAQ excerpts do not state any pre-payment charge percentage. The only pre-payment charge percentage shown in the prov |
| q055 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB must release the original property documents within 30 days after full repayment or settlement of the loan account. |
| q058 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement lists penal charges of ₹500 per month of default. |
| q061 | multi_doc | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✗ | The home loan agreement records that the loan was sanctioned on 10 February 2026. The supplied excerpts do not state the loan principal amou |
| q065 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes—our Retail Loan Policy allows the bank, at reset of the floating rate, to offer the borrower a choice to switch to a fixed rate, subject |
| q067 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Using the net disbursed amount of Rs 19,600 and 24 monthly instalments of Rs 969.73, the APR is approximately 16.8% per annum. |
| q068 | contradiction_true | Incomplete | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | I can’t confirm whether clause 9.3 is compliant, because the provided excerpts do not include the text of clause 9.3 or any RBI pre-payment  |
| q072 | contradiction_different_condition | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No, based on the cited RBI/UCB rules, a 2% foreclosure charge on a fixed-rate term loan to a private limited company does not appear to conf |
| q074 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided sources do not specify a minimum credit score for home loans. The home-loan documents shown here list loan terms such as tenor, |
| q076 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The sources do not show that RBI replaced the Key Facts Statement with anything else; in the 2025 directions, KFS is still listed as “Annex  |