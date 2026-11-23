# Eval: dev (2026-11-23 06:14)

```
{
 "n": 49,
 "labels": {
  "Accurate": 38,
  "Incomplete": 11,
  "Hallucinated": 0
 },
 "accurate_rate": 0.776,
 "accurate_ci95": [
  0.641,
  0.87
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 134,
 "fabricated_upper95_rule_of_three": 0.022,
 "abstention_precision": 0.545,
 "abstention_recall": 0.667,
 "answer_rate": 0.776,
 "over_refusal": 0.111,
 "point_in_time_accuracy": 1.0,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.25,
 "calc_accuracy": 0.0,
 "draft_faithfulness_mean": 0.619,
 "latency_p50_ms": 3672,
 "latency_p95_ms": 11342,
 "spend_usd_upper_bound": 0.0,
 "cost_per_query_usd_upper_bound": 0.0,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "calculation": {
   "Accurate": 0,
   "Incomplete": 3,
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
   "Accurate": 3,
   "Incomplete": 1,
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
   "Accurate": 4,
   "Incomplete": 2,
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
| q002 | single_fact | Incomplete | ANSWER | ANSWER/PARTIAL | ✓ | ✗ | Those in-force directions apply to all fresh loans availed from April 1, 2024 onwards, and the earlier 2023 penal-charges circulars are no l |
| q003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for this UCB, penal capitalisation is not permitted, and there shall be no further interest computed on penal charges.  No: penal charge |
| q005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The Key Facts Statement must include a computation sheet of Annual Percentage Rate and the amortisation schedule of the loan over the loan t |
| q008 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | For the pre-payment charge directions at paragraph 261(1) and 261(2), the source of funds used for pre-payment does not matter, because they |
| q010 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, default in repayment may be penalised only in the form of penal charges and not penal interest. A UCB shall not capitalise pe |
| q011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | In the KFS illustration for computation of APR, the annual percentage rate is 17.07% (effective annualized interest rate). For this illustra |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule II specifies a documentation fee of ₹500, payable once at execution. The agreement says only the fees and |
| q016 | table_numeric | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✗ | The Key Facts Statement also lists cheque/ECS bounce charges as ₹300 per instance. The agreement says no fee or charge other than those list |
| q017 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement lists a one-time processing fee of ₹400. |
| q018 | calculation | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✓ |  |
| q020 | calculation | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The bank’s documents state a pre-payment charge of 2% of the amount prepaid.  |
| q022 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes; at the time of reset of interest rates, REs shall provide EMI-based personal loan borrowers the option to switch over to a fixed rate a |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The applicable UCB direction also says borrowers may switch to a fixed interest rate only where such an option is provided by the bank. A ba |
| q026 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No. The May 7, 2014 RBI circular on foreclosure charges/pre-payment penalty on floating rate term loans is no longer in force on 2026-11-23  |
| q027 | amendment_point_in_time | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions prohibit pre-payment charges for floating-rate loans to individuals for non-business purposes if sanctioned befo |
| q029 | amendment_point_in_time | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a floating-rate business loan to an MSE sanctioned on or after 1 January 2026, a Tier 4 UCB shall not levy prepayment charges.  The  |
| q030 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | For a Tier 3 UCB, the directions for loans sanctioned on or after 1 January 2026 apply to this floating-rate business loan to an MSE sanctio |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | For floating-rate loans granted for purposes other than business to individuals and sanctioned on or after 1 January 2026, a UCB shall not l |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a Tier 3 UCB, the in-force directions state that penal interest is not permitted.  The in-force directions also state that penal charges |
| q035 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Conflict on prepayment charge: UCB Responsible Business Conduct Directions, 2025 (updated 1 Jul 2026) §261(1) (p.81) says "For all floating  |
| q036 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The loan is a home loan (term loan) for purchase of a residential house for self-occupation, not for business, and it was sanctioned on 10 F |
| q038 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | The in-force UCB directions say that for loans sanctioned or renewed on or after 2026-01-01, pre-payment charges are not to be levied for al |
| q040 | contradiction_different_condition | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | The product note says that for individual borrowers on floating rate loans for non-business purposes, no foreclosure charge applies.  That m |
| q042 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The provided rules do not state a rupee cap for the penal charge on one missed EMI; they only say penal charges may be levied, must be reaso |
| q043 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions provided here do not state a maximum interest rate for MSE loans. The in-force directions here instead address p |
| q044 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The available in-force directions say a Tier 3 UCB shall not levy any pre-payment charges on loans with sanctioned amount/limit up to ₹50 la |
| q046 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The policy materials also say that the bank’s policy must clearly lay down liability by way of interest payments due to delays for non-compl |
| q048 | false_premise | Accurate | ABSTAIN | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | The current UCB directions also say penal charges shall be levied only on the amount under default and that additional or fresh penal charge |
| q049 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For a floating-rate loan granted for purposes other than business to an individual and sanctioned on or after 1 January 2026, a UCB shall no |
| q051 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ | The provided materials do not include any weather information for Raipur today, and the listed RBI directions and bank documents do not cove |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions say that, in cases other than the listed exceptions, pre-payment charges, if any, shall be as per the approved p |
| q054 | hindi | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No; for floating-rate business loans to Micro and Small Enterprises sanctioned on or after 1 January 2026, a Tier 3 UCB shall not levy any p |
| q056 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, a UCB shall not levy pre-payment charges on a cash credit/overdraft facility if the borrower intimates the bank of the intention not to  |
| q057 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q059 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement shows pre-payment / foreclosure charges as Nil. |
| q060 | multi_doc | Incomplete | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✗ | ✓ | Conflict on prepayment charge: UCB Responsible Business Conduct Directions, 2025 (updated 1 Jul 2026) §261(1) (p.81) says "For all floating  |
| q062 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The ₹40,00,000 MSE sanction letter states a rate of interest of 9.75% per annum, floating, linked to the External Benchmark Lending Rate of  |
| q063 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The product note says that for individual borrowers on floating-rate loans for non-business purposes, no foreclosure charge applies. Conflic |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, the 2023 circular on Fair Lending Practice - Penal Charges in Loan Accounts was withdrawn with immediate effect on 2025-11-28.  The rel |
| q066 | calculation | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✓ | The evidence defines EMI as the equated monthly instalment payable toward principal and interest, and monthly EPIs are called EMIs. |
| q069 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The evidence provided does not include the sanction date, so the applicability of the UCB pre-payment-charge directions to this sanction let |
| q070 | contradiction_different_condition | Incomplete | CONFLICT | ANSWER/PARTIAL | ✓ | ✓ | For a Primary Urban Co-operative Bank, penal interest is not permitted, and any penalty for non-compliance of loan terms must be treated as  |
| q071 | contradiction_different_condition | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The RBI’s current UCB rule allows a UCB, at its option, to provide borrowers a choice to switch to a fixed rate at the time of reset, as per |
| q073 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The rule findings on UCB prepayment charges do not establish a car-loan foreclosure charge here because applicability is unknown without fac |
| q075 | false_premise | Incomplete | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✗ | ✓ | The same in-force direction says that, in cases other than those covered by paragraph 261(1) and 261(2), any pre-payment charges shall be as |
| q077 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this Primary (Urban) Co-operative Bank case, penal interest is not permitted to be added to the rate of interest charged on the advances |
| q078 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q079 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ |  |