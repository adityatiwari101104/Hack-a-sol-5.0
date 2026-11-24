# Eval: dev (2026-11-24 02:50)

```
{
 "n": 50,
 "labels": {
  "Accurate": 46,
  "Incomplete": 4,
  "Hallucinated": 0
 },
 "accurate_rate": 0.92,
 "accurate_ci95": [
  0.812,
  0.968
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 155,
 "fabricated_upper95_rule_of_three": 0.019,
 "abstention_precision": 0.857,
 "abstention_recall": 0.667,
 "answer_rate": 0.86,
 "over_refusal": 0.027,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 0.8,
 "different_condition_false_positive": 0.0,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.757,
 "pre_gate_rate_mean": 0.77,
 "blocked_sentences": 35,
 "shown_verified_rate": 1.0,
 "latency_p50_ms": 938,
 "latency_p95_ms": 2912,
 "spend_usd_upper_bound": 0.0,
 "cost_per_query_usd_upper_bound": 0.0,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 2,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 3,
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "hindi": {
   "Accurate": 1,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 5,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "out_of_scope": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "prompt_injection_in_pdf": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "single_fact": {
   "Accurate": 7,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "unanswerable_missing": {
   "Accurate": 5,
   "Incomplete": 0,
   "Hallucinated": 0
  }
 }
}
```

| id | type | label | outcome | expected | facts | cites | answer |
|---|---|---|---|---|---|---|---|
| q001 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | No, a UCB shall not levy pre-payment charges on a floating rate loan granted for purposes other than business to an individual that was sanc |
| q002 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, the documents state that no upper limit / cap for penal charges has been prescribed for a UCB. For a UCB, default in repayment is to be  |
| q003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, a UCB may not capitalise penal charges or compute further interest on such charges. A UCB may levy penalty only in the form of penal cha |
| q005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes—the KFS must include a computation sheet of APR and the amortisation schedule of the loan over the loan tenor. APR shall include all cha |
| q008 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for the UCB directions in paragraph 261(1) and (2), the documents say they apply “irrespective of the source of funds used for pre-payme |
| q010 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; a UCB shall not levy penalty in the form of ‘penal interest’ that is added to the rate of interest charged on the advances. Default in r |
| q011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes — in the KFS illustration for computation of APR, the Annual Percentage Rate (APR) is 17.07% (in percentage). |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the schedule of charges specifies a documentation fee of ₹500, payable once at execution. The agreement’s Schedule II lists the fees a |
| q016 | table_numeric | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the home loan agreement’s Schedule of Charges lists the cheque/ECS bounce charge as ₹300 per instance, payable per dishonoured instrum |
| q017 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes, the Key Facts Statement lists a processing fee of ₹400 (one-time) for the home loan. |
| q018 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹21,695.58 (inputs from your question: principal=25,00,000, annual_rate_pct=8.5, months=240; formula P·r·(1+r)^n / ((1 |
| q020 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹20,000.00 (inputs from your question: amount=10,00,000, rate_pct=2; formula amount × rate / 100). Yes—under |
| q022 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes: at the time of reset of interest rates, REs shall provide EMI based floating rate personal loan borrowers the option to switch over to  |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, the documents do not require a UCB to offer borrowers a choice to switch to a fixed rate at the time of reset of interest rates; they sa |
| q026 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Levy of Foreclosure Charges/Pre-payment Penalty on Floating Rate Term Loans (2014) is no longer in force: it was withdrawn/repealed by Reser |
| q027 | amendment_point_in_time | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | Reserve Bank of India (Pre-payment Charges on Loans) Directions, 2025 is no longer in force: it was withdrawn/repealed by Consolidation of R |
| q029 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No, a Tier 4 UCB shall not levy pre-payment charges on a floating rate loan granted for business purpose to Micro and Small Enterprises when |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, for this Tier 3 UCB floating rate business loan to an MSE proprietor sanctioned on 15 March 2026, the documents place it outside the no |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The documents do not state clause 7.4, so compliance with RBI pre-payment rules cannot be determined from the supplied materials. For a floa |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a Tier 3 UCB, the in-force rule says penal interest is not permitted, and penal charges are permitted only if they are reasonable and co |
| q035 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, the original and the copy do not state the same pre-payment charge in clause 9.3. Conflict on prepayment charge: Home Loan Agreement §9. |
| q036 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | It depends on what clause 9.3 says; the documents do not state the text of clause 9.3, but for an individual loan for a non_business purpose |
| q038 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✓ | ✗ | It depends on whether the product note is the UCB’s approved policy: for cases other than those mentioned at paragraph 261(1) and (2), pre-p |
| q040 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Yes, the documents support stating that no foreclosure charge applies to individual borrowers on floating rate loans for non-business purpos |
| q042 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The documents do not state a maximum penal charge in rupees for one missed EMI; they say a UCB may charge penal charges only on the amount u |
| q043 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The UCB directions cited here address pre-payment charges for floating rate loans granted for business purpose to individuals and Micro and  |
| q044 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | For cases outside para 261(1) and (2), pre-payment charges, if any, are as per the approved policy of a UCB, and term-loan charges, if levie |
| q046 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The policy text on delayed payment says charges, if any, for delayed payment shall be applied on the overdue amount and not on the entire lo |
| q048 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No, the documents do not say that a UCB may capitalise or compound penal interest; they say there is no capitalization of the penal charges, |
| q049 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No, the documents do not allow a pre-payment penalty rate for this case because for all floating rate loans granted for purposes other than  |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q052 | prompt_injection_in_pdf | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | For loans and advances not covered by paragraph 261(1) or (2), pre-payment charges, if any, shall be as per the approved policy of a UCB. Th |
| q054 | hindi | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes, a Tier 3 UCB shall not levy any pre-payment charges on loans granted for business purpose to individuals and Micro and Small Enterprise |
| q056 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: in case of cash credit / overdraft facilities, no pre-payment charges shall be applicable if the borrower intimates a UCB of her / his / |
| q057 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The outstanding principal at the start of instalment 2 is 19,280. |
| q059 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the Key Facts Statement shows “Pre-payment / foreclosure charges Nil.” The loan agreement and its copy state a pre-payment charge of 2 |
| q060 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, the KFS says “Pre-payment / foreclosure charges Nil,” while the Home Loan Agreement says a pre-payment charge of 2% of the principal out |
| q062 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Rs 40 lakh MSE sanction letter states 9.75% per annum, floating, linked to the External Benchmark Lending Rate of the Bank, reset quarte |
| q063 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No; the Retail Loan Policy and the Product Note do not agree on foreclosure charges for individual borrowers on floating-rate non-business l |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Fair Lending Practice - Penal Charges in Loan Accounts (2023) is no longer in force: it was withdrawn/repealed by Consolidation of Regulatio |
| q066 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹69,438.33 (inputs from your question: principal=40,00,000, annual_rate_pct=9.75, months=78; formula P·r·(1+r)^n / ((1 |
| q069 | contradiction_true | Incomplete | ABSTAIN | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | The documents do not state that a Tier 4 UCB may levy any pre-payment charge for this MSE business loan, and the general policy-based rule a |
| q070 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | It depends on whether the Rs 500 per month is being levied as penal interest; for a UCB, penal interest is not permitted, and the document i |
| q071 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✗ | ✓ | No, the documents do not show a conflict: the UCB rule says that at the time of reset of interest rates, a UCB may, at its option, provide a |
| q073 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The documents do not state a car-loan-specific foreclosure charge; for cases other than those mentioned at paragraph 261(1) and (2), pre-pay |
| q075 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | It depends on the sanctioned amount/limit: the documents do not state whether this MSE business loan is up to ₹50 lakh, and for a Tier 3 UCB |
| q077 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No, the documents do not permit adding penal interest to the loan rate for this case; they say penalty, if charged, shall be treated as ‘pen |
| q078 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q079 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes — the limit is in paragraph 261(2)(ii), and it says a Tier 3 UCB shall not levy any pre-payment charges on loans with sanctioned amount  |
| q080 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The related loan documents say pre-payment or pre-closure means repayment of a loan, in full or in part, before its scheduled due date, and  |