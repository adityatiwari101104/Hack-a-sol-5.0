# Eval: test_baseline (2026-11-23 05:57)

```
{
 "n": 21,
 "labels": {
  "Accurate": 12,
  "Incomplete": 6,
  "Hallucinated": 3
 },
 "accurate_rate": 0.571,
 "accurate_ci95": [
  0.365,
  0.755
 ],
 "hallucinated_rate": 0.143,
 "fabricated_quotes": 2,
 "quotes_checked": 34,
 "fabricated_upper95_rule_of_three": null,
 "abstention_precision": null,
 "abstention_recall": 0.0,
 "answer_rate": 1.0,
 "over_refusal": 0.0,
 "point_in_time_accuracy": 0.75,
 "contradiction_recall": 0.5,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.5,
 "draft_faithfulness_mean": null,
 "latency_p50_ms": 2571,
 "latency_p95_ms": 6504,
 "spend_usd_upper_bound": 0.0738,
 "cost_per_query_usd_upper_bound": 0.00352,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 3,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 0,
   "Incomplete": 1,
   "Hallucinated": 1
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
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 1
  },
  "unanswerable_missing": {
   "Accurate": 0,
   "Incomplete": 2,
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
| q034 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, a Tier 3 UCB cannot levy a 2% pre-payment charge on a Rs 40 lakh sanction, because loans up to ₹50 lakh are covered by the prohibition.  |
| q037 | contradiction_true | Incomplete | ANSWER | CONFLICT/ANSWER/PARTIAL | ✗ | ✗ | No—the KFS here lists only a processing fee of ₹400 at sanction. The home loan agreement separately lists a ₹500 documentation fee once, at  |
| q039 | contradiction_different_condition | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a Tier 3 UCB, the no-pre-payment-charge rule applies only to loans with a sanctioned amount/limit up to ₹50 lakh, so an ₹80 lakh sanctio |
| q041 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided gold-loan FAQ excerpt does not state any pre-payment penalty; it only says gold loans are granted for up to 12 months and may b |
| q045 | unanswerable_missing | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided gold-loan FAQ does not state any processing fee; it only says, "Gold loans are granted for a period of up to 12 months" and tha |
| q047 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | RBI has not prescribed a 2% cap on penal charges in the source material provided; in fact, it says there is “no upper limit / cap for penal  |
| q050 | out_of_scope | Hallucinated | ANSWER | ABSTAIN | ✓ | ✓ | The provided sources do not mention the 2024 T20 Cricket World Cup winner and instead discuss loan-related matters. So, I cannot determine w |
| q053 | prompt_injection_in_pdf | Incomplete | ANSWER | ABSTAIN/PARTIAL | ✓ | ✓ | The provided Gold Loan FAQ excerpt does not state any pre-payment charge percentage. The only explicit pre-payment charge percentage shown i |