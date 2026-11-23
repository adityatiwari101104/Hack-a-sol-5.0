# Eval: dev (2026-11-23 05:56)

```
{
 "n": 33,
 "labels": {
  "Accurate": 29,
  "Incomplete": 4,
  "Hallucinated": 0
 },
 "accurate_rate": 0.879,
 "accurate_ci95": [
  0.727,
  0.952
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 97,
 "fabricated_upper95_rule_of_three": 0.031,
 "abstention_precision": 0.75,
 "abstention_recall": 0.5,
 "answer_rate": 0.879,
 "over_refusal": 0.04,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 0.5,
 "draft_faithfulness_mean": 0.623,
 "latency_p50_ms": 4203,
 "latency_p95_ms": 12682,
 "spend_usd_upper_bound": 0.1803,
 "cost_per_query_usd_upper_bound": 0.00546,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 1,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 0,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "hindi": {
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
   "Accurate": 5,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| q001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, pre-payment charges are not permitted on all floating rate loans granted for purposes other than business to individuals, wit |
| q002 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL | ✓ | ✗ | Those in-force directions apply to all fresh loans availed from April 1, 2024 onwards, and the earlier 2023 penal-charges circulars are no l |
| q003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for this UCB, penal charges must be treated as penal charges and must not be levied as penal interest added to the rate of interest char |
| q005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The KFS shall include a computation sheet of the Annual Percentage Rate (APR) and the amortisation schedule of the loan over the loan tenor. |
| q008 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For the pre-payment charge directions at paragraph 261(1) and 261(2), the source of funds used for pre-payment does not matter, because they |
| q010 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, penalty for borrower default shall only be levied in the form of penal charges and not penal interest, and there shall be no  |
| q011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | In the RBI illustration for computation of APR, the annual percentage rate is 17.07%. |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II specifies a documentation fee of ₹500, payable once at execution.  |
| q016 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The cheque/ECS bounce charge in the home loan agreement’s schedule of charges is ₹300 per instance for a dishonoured instrument.  The Key Fa |
| q017 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement for the home loan lists a processing fee of ₹400 as a one-time charge. |
| q018 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The home loan has 240 monthly instalments, an interest rate of 8.5% per annum, and the EMI on the date of sanction is ₹21,696. |
| q020 | calculation | Incomplete | ABSTAIN | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ |  |
| q022 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes; for EMI-based personal loans, the applicable directions require the lender to provide borrowers the option to switch over to a fixed ra |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a UCB with a floating-rate loan, the rules say the bank may, at its option, provide a choice to switch to a fixed rate at the time of re |
| q026 | amendment_point_in_time | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | No: the May 7, 2014 circular on levy of foreclosure charges/pre-payment penalty on floating rate term loans is no longer in force on 2026-11 |
| q027 | amendment_point_in_time | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions require that floating-rate loans sanctioned before December 31, 2025 to individual borrowers for purposes other  |
| q029 | amendment_point_in_time | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a floating-rate business loan to an MSE sanctioned on or after 1 January 2026, a Tier 4 UCB shall not levy prepayment charges.  The  |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a floating-rate business loan sanctioned on or after 1 January 2026 to an MSE, a Tier 3 UCB shall not levy pre-payment charges only wher |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | For floating-rate loans granted for purposes other than business to individuals and sanctioned on or after 1 January 2026, a UCB shall not l |
| q033 | contradiction_true | Accurate | ANSWER | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Section 8.2 is in force and says penal interest at 2% per month over the applicable rate of interest shall be charged on overdue instalments |
| q035 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The original home loan agreement states a pre-payment charge of 2% of the principal outstanding in clause 9.3. The copy of the home loan agr |
| q036 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No: clause 9.3 provides a pre-payment charge of 3% of principal outstanding on pre-payment or foreclosure, while the applicable UCB rule fin |
| q038 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✓ | ✗ | The bank’s note says a 2% pre-payment charge applies on foreclosure or pre-payment of the loan. For loans and advances sanctioned or renewed |
| q040 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✗ | ✓ | type=fact The product note says that for individual borrowers on floating rate loans for non-business purposes, no foreclosure charge applie |
| q042 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The provided rules do not state a rupee cap for the penal charge on one missed EMI; they only say penal charges may be levied, must be reaso |
| q043 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions instead address penal interest, saying default-related penalty must be levied as penal charges and not penal int |
| q044 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions say a UCB shall not levy pre-payment charges in the covered floating-rate cases, including existing floating rat |
| q046 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force policy text says the policy shall clearly lay down the liability by way of interest payments due to delays for non-compliance w |
| q048 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this UCB, the in-force directions say there is no capitalization of penal charges, meaning no further interest is to be computed on such |
| q049 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For a floating-rate loan granted for purposes other than business to an individual and sanctioned on or after 1 January 2026, a UCB shall no |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The bank’s retail loan policy says foreclosure charges of 2% plus GST on the principal outstanding shall be levied on all term loans pre-clo |
| q054 | hindi | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | A Tier 3 UCB shall not levy any pre-payment charges on a floating-rate business loan to an MSE with sanctioned amount/limit up to ₹50 lakh w |