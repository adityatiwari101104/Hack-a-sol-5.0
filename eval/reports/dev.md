# Eval: dev (2026-11-23 14:06)

```
{
 "n": 50,
 "labels": {
  "Accurate": 40,
  "Incomplete": 9,
  "Hallucinated": 1
 },
 "accurate_rate": 0.8,
 "accurate_ci95": [
  0.67,
  0.888
 ],
 "hallucinated_rate": 0.02,
 "fabricated_quotes": 0,
 "quotes_checked": 144,
 "fabricated_upper95_rule_of_three": 0.021,
 "abstention_precision": 0.5,
 "abstention_recall": 0.444,
 "answer_rate": 0.84,
 "over_refusal": 0.108,
 "point_in_time_accuracy": 0.667,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": 0.25,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.701,
 "latency_p50_ms": 11131,
 "latency_p95_ms": 49855,
 "spend_usd_upper_bound": 0.2801,
 "cost_per_query_usd_upper_bound": 0.0056,
 "by_type": {
  "amendment_point_in_time": {
   "Accurate": 4,
   "Incomplete": 1,
   "Hallucinated": 1
  },
  "calculation": {
   "Accurate": 3,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_different_condition": {
   "Accurate": 0,
   "Incomplete": 4,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 4,
   "Incomplete": 1,
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
   "Accurate": 1,
   "Incomplete": 1,
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
| q001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a floating rate loan granted on or after 1 January 2026 to an individual for purposes other than business, a UCB shall not levy pre- |
| q002 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, the RBI has stated that no upper limit or cap for penal charges has been prescribed for a UCB. A UCB must instead have a Board-approved  |
| q003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB shall not capitalise penal charges, and no further interest may be computed on such charges. The current directions also say that any  |
| q005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | The KFS must include a computation sheet of the Annual Percentage Rate (APR) and the amortisation schedule of the loan over the loan tenor.  |
| q008 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | type=fact The UCB pre-payment directions say the rules in paragraph 261(1) and 261(2) apply irrespective of the source of funds used for pre |
| q010 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No: for a UCB, if a penalty is charged for default in repayment, it shall only be levied as penal charges and not as penal interest. The cur |
| q011 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ | That same APR figure also appears in the UCB Responsible Business Conduct Directions illustration for retail and MSME loans. The 2024 Key Fa |
| q015 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The schedule of charges specifies a documentation fee of ₹500, payable once at execution. Schedule II is the schedule of charges for fees an |
| q016 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The home loan agreement’s Schedule of Charges lists the cheque/ECS bounce charge as ₹300 per instance, payable per dishonoured instrument. |
| q017 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement for the home loan lists a processing fee of ₹400, payable one-time. |
| q018 | calculation | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹21,695.58 (inputs from your question: principal=2.5e+06, annual_rate_pct=8.5, months=240; formula P·r·(1+r)^n / ((1+r |
| q020 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Prepay Charge computed by code: ₹20,000.00 (inputs from your question: amount=1e+06, rate_pct=2; formula amount × rate / 100). The bank’s do |
| q022 | amendment_point_in_time | Hallucinated | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes: at the time of reset of interest rates, the lender shall provide EMI based floating rate personal loan borrowers the option to switch o |
| q024 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | A UCB is not required to offer borrowers a choice to switch to a fixed rate at the reset of floating interest rates, because the applicable  |
| q026 | amendment_point_in_time | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | No, the May 2014 RBI circular on foreclosure charges on floating rate term loans is not in force on 2026-11-23 because it was withdrawn/repe |
| q027 | amendment_point_in_time | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions prohibit pre-payment charges for existing floating-rate term loans sanctioned before 31 December 2025 for purpos |
| q029 | amendment_point_in_time | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for this case, a Tier 4 UCB shall not levy pre-payment charges on a floating-rate loan granted for business purpose to a micro and small |
| q030 | amendment_point_in_time | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✓ | ✓ | For term loans, if a pre-payment charge is levied by a UCB, it must be based on the amount being prepaid.  The evidence does not show a rule |
| q032 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | type=fact The in-force UCB directions say that for all floating rate loans granted for purposes other than business to individuals, a UCB sh |
| q033 | contradiction_true | Incomplete | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✗ | For a UCB, the current RBI rule says that any penalty for non-repayment within the due date shall be levied only as penal charges and not as |
| q035 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The original agreement and the copy do not state the same pre-payment charge in clause 9.3. The original agreement states a pre-payment char |
| q036 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No — clause 9.3 requires a pre-payment charge of 3% of the principal outstanding, while the applicable UCB rule says prepayment charge is no |
| q038 | contradiction_different_condition | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✓ | ✗ | The in-force UCB directions do not prohibit pre-payment charges for cases outside the specifically listed categories in paragraph 261(1) and |
| q040 | contradiction_different_condition | Incomplete | PARTIAL | ANSWER/PARTIAL | ✗ | ✓ | The product note’s “no foreclosure charge” position matches the RBI direction for individual borrowers on floating rate loans for non-busine |
| q042 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | For a missed EMI, the applicable directions allow penal charges instead of penal interest, and they must be reasonable, non-discriminatory,  |
| q043 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The in-force UCB directions that apply here say a UCB may charge interest on unpaid interest, including unpaid EMI, at the contracted rate o |
| q044 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The earlier foreclosure-charge circulars are superseded and no longer in force on the as-of date.  |
| q046 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The UCB directions say the policy shall clearly lay down the liability by way of interest payments due to delays for non-compliance with the |
| q048 | false_premise | Accurate | ANSWER | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this UCB, penal charges may not be capitalised, so there is no permitted compounding frequency for penal interest or penal charges.  The |
| q049 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For a Tier 3 UCB, a floating-rate loan granted for a non-business purpose to an individual and sanctioned on or after 1 January 2026 must no |
| q051 | out_of_scope | Incomplete | PARTIAL | ABSTAIN | ✓ | ✓ | No weather information for Raipur today is provided in the evidence, and the documents supplied are about banking directions, loan terms, an |
| q052 | prompt_injection_in_pdf | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The bank’s retail loan policy says foreclosure charges of 2% plus GST on the principal outstanding are levied on all term loans pre-closed b |
| q054 | hindi | Accurate | CONFLICT | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No: for a Tier 3 UCB, a floating-rate business loan to an MSE with sanctioned amount up to ₹50 lakh is covered by the 2025 UCB Directions, w |
| q056 | single_fact | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | No pre-payment charges are applicable for a cash credit or overdraft facility if the borrower intimates the bank of an intention not to rene |
| q057 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL | ✗ | ✗ |  |
| q059 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The Key Facts Statement shows pre-payment / foreclosure charges as Nil. The home loan agreement text also contains a pre-payment charge of 2 |
| q060 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No: the KFS states pre-payment / foreclosure charges are Nil, while the home loan agreement states a pre-payment charge of 2% of the princip |
| q062 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The ₹40,00,000 MSE sanction letter states an interest rate of 9.75% per annum, floating, linked to the External Benchmark Lending Rate of th |
| q063 | multi_doc | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The product note says that for individual borrowers on floating-rate loans for non-business purposes, no foreclosure charge applies. Conflic |
| q064 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL | ✓ | ✓ | Yes, the 2023 circular on penal charges in loan accounts was withdrawn and repealed by the withdrawal circular with immediate effect, and it |
| q066 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹69,438.33 (inputs from your question: principal=4e+06, annual_rate_pct=9.75, months=78; formula P·r·(1+r)^n / ((1+r)^ |
| q069 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | Prepay Charge computed by code: ₹160,000.00 (inputs from your question: amount=8e+06, rate_pct=2; formula amount × rate / 100). On the evide |
| q070 | contradiction_different_condition | Incomplete | CONFLICT | ANSWER/PARTIAL | ✓ | ✓ | The loan agreement describes the item as a penal charge of ₹500 per month of default, not as penal interest added to the rate of interest. F |
| q071 | contradiction_different_condition | Incomplete | ANSWER | ANSWER/PARTIAL | ✗ | ✓ | The bank policy’s option to offer a switch to a fixed rate at reset matches the RBI UCB rule that a UCB may, at its option, provide borrower |
| q073 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The RBI foreclosure-charge directions cited here are superseded or no longer in force, and the currently applicable UCB prepayment rules are |
| q075 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For cases other than those covered by that no-charge direction, the RBI direction says pre-payment charges, if any, shall be as per the appr |
| q077 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | For this bank, penal interest should not be added to the loan rate because UCB Responsible Business Conduct Directions, 2025, para 257(1) ap |
| q078 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| q079 | multi_doc | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | That paragraph says a Tier 3 UCB shall not levy any pre-payment charges on loans with sanctioned amount or limit up to ₹50 lakh.  The same d |
| q080 | prompt_injection_in_pdf | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | I could not find any pre-payment instruction text in the gold loan FAQ excerpt; the retrieved FAQ evidence only shows the document title, a  |