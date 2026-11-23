# Eval: dev (2026-11-23 11:56)

```
{
 "n": 50,
 "labels": {
  "Accurate": 43,
  "Incomplete": 7,
  "Hallucinated": 0
 },
 "accurate_rate": 0.86,
 "accurate_ci95": [
  0.738,
  0.93
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 114,
 "fabricated_upper95_rule_of_three": 0.026,
 "abstention_precision": 0.6,
 "abstention_recall": 0.667,
 "answer_rate": 0.8,
 "over_refusal": 0.081,
 "point_in_time_accuracy": 0.833,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.25,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.613,
 "latency_p50_ms": 5148,
 "latency_p95_ms": 23045,
 "spend_usd_upper_bound": 0.1378,
 "cost_per_query_usd_upper_bound": 0.00276,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 5,
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
   "Incomplete": 2,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 4,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 3,
   "Incomplete": 1,
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
   "Accurate": 6,
   "Incomplete": 1,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 5,
   "Incomplete": 1,
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
| q001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, pre-payment charges are not permitted on all floating rate loans granted for purposes other than business to individuals, wit |
| q002 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No upper limit or cap for penal charges has been prescribed for a UCB in the in-force directions, and the directions say so expressly.  Thos |
| q003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for this UCB, penal capitalisation is not permitted, and there shall be no further interest computed on penal charges.  No: penal charge |
| q005 | single_fact | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q008 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For the pre-payment charge directions at paragraph 261(1) and 261(2), the source of funds used for pre-payment does not matter, because they |
| q010 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, default in repayment may be penalised only in the form of penal charges and not penal interest. A UCB shall not capitalise pe |
| q011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | In the KFS illustration for computation of APR, the annual percentage rate is 17.07% (effective annualized interest rate). For this illustra |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II specifies a documentation fee of ₹500, payable once at execution. |
| q016 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II lists cheque/ECS bounce as ₹300 per instance, payable per dishonoured instrument. The Key Facts Statem |
| q017 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement lists a one-time processing fee of ₹400 for the home loan. |
| q018 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹21,695.58 (inputs from your question: principal=2.5e+06, annual_rate_pct=8.5, months=240; formula P·r·(1+r)^n / ((1+r |
| q020 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹20,000.00 (inputs from your question: amount=1e+06, rate_pct=2; formula amount × rate / 100). |
| q022 | amendment_point_in_time | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | Yes: at the time of reset of interest rates, the applicable RBI rule requires the lender to provide borrowers the option to switch over to a |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No; for a UCB, the policy says the bank may, at its option, provide borrowers a choice to switch to a fixed rate at the time of reset of int |
| q026 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, the May 7, 2014 RBI circular on foreclosure charges / pre-payment penalty on floating rate term loans is no longer in force as of 2026-1 |
| q027 | amendment_point_in_time | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions prohibit pre-payment charges for floating-rate loans to individuals for non-business purposes if sanctioned befo |
| q029 | amendment_point_in_time | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a floating-rate business loan to an MSE sanctioned on or after 1 January 2026, a Tier 4 UCB shall not levy prepayment charges.  The  |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A Tier 3 UCB may levy a pre-payment charge on a floating-rate business loan to an MSE sanctioned on or after 1 January 2026 only within the  |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The home-loan agreement says that on foreclosure or pre-payment, in full or in part, the borrower shall pay a pre-payment charge of 3% of th |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a Tier 3 UCB, the current applicable rule says penal interest is not permitted, while penal charges are permitted only under the stated  |
| q035 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The original agreement and the copy do not state the same pre-payment charge in clause 9.3: the original says 2% of the principal outstandin |
| q036 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No: clause 9.3 requires a pre-payment charge of 3% of the principal outstanding on foreclosure or pre-payment, but the applicable UCB rule f |
| q038 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | The in-force UCB directions say that for loans sanctioned or renewed on or after 2026-01-01, pre-payment charges are not to be levied for al |
| q040 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | The product note says that for individual borrowers on floating rate loans for non-business purposes, no foreclosure charge applies.  That m |
| q042 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The provided rules do not state a rupee cap for the penal charge on one missed EMI; they only say penal charges may be levied, must be reaso |
| q043 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions provided here do not state a maximum interest rate for MSE loans. The in-force directions here instead address p |
| q044 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The current UCB directions say a Tier 3 UCB shall not levy pre-payment charges on loans with sanctioned amount or limit up to ₹50 lakh, and  |
| q046 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | For UCBs, credit card receivables are exempted from the APR-disclosure provisions quoted here.  |
| q048 | false_premise | Accurate | ABSTAIN | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The current UCB directions also say penal charges shall be levied only on the amount under default and that additional or fresh penal charge |
| q049 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this floating-rate loan to an individual for a purpose other than business, the UCB shall not levy pre-payment charges. (E10) The older  |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions say that, in cases other than the listed exceptions, pre-payment charges, if any, shall be as per the approved p |
| q054 | hindi | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No; for floating-rate business loans to Micro and Small Enterprises sanctioned on or after 1 January 2026, a Tier 3 UCB shall not levy any p |
| q056 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, a UCB shall not levy pre-payment charges on a cash credit/overdraft facility if the borrower intimates the bank of the intention not to  |
| q057 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q059 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement shows pre-payment / foreclosure charges as Nil. |
| q060 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Conflict on prepayment charge: Home Loan Agreement §9.3 (p.3) says "9.3 In the event of foreclosure or pre-payment of the loan, in full or i |
| q062 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The ₹40,00,000 MSE sanction letter states an interest rate of 9.75% per annum, floating, linked to the Bank’s External Benchmark Lending Rat |
| q063 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The product note says that for individual borrowers on floating-rate loans for non-business purposes, no foreclosure charge applies.  Confli |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes; the 2023 circular on penal charges in loan accounts was withdrawn and repealed with immediate effect on 2025-11-28, and it is no longer |
| q066 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹69,438.33 (inputs from your question: principal=4e+06, annual_rate_pct=9.75, months=78; formula P·r·(1+r)^n / ((1+r)^ |
| q069 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Prepay Charge computed by code: ₹160,000.00 (inputs from your question: amount=8e+06, rate_pct=2; formula amount × rate / 100). The evidence |
| q070 | contradiction_different_condition | Incomplete | CONFLICT | ANSWER/PARTIAL | ✓ | ✓ | For a Primary Urban Co-operative Bank, penal interest is not permitted, and any penalty for non-compliance of loan terms must be treated as  |
| q071 | contradiction_different_condition | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The RBI’s current UCB rule allows a UCB, at its option, to provide borrowers a choice to switch to a fixed rate at the time of reset, as per |
| q073 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The RBI 2014 foreclosure-charge circular is no longer in force, and the later 2025 pre-payment-charge directions were also later withdrawn,  |
| q075 | false_premise | Incomplete | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✗ | ✓ | The same in-force direction says that, in cases other than those covered by paragraph 261(1) and 261(2), any pre-payment charges shall be as |
| q077 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this Primary (Urban) Co-operative Bank case, penal interest is not permitted to be added to the rate of interest charged on the advances |
| q078 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q079 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The limiting paragraph is paragraph 261(2)(ii), which says a Tier 3 UCB shall not levy any pre-payment charges on floating-rate business loa |
| q080 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ |  |