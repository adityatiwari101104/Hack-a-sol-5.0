# Eval: fresh (2026-11-24 02:51)

```
{
 "n": 34,
 "labels": {
  "Accurate": 29,
  "Incomplete": 5,
  "Hallucinated": 0
 },
 "accurate_rate": 0.853,
 "accurate_ci95": [
  0.699,
  0.936
 ],
 "hallucinated_rate": 0.0,
 "fabricated_quotes": 0,
 "quotes_checked": 83,
 "fabricated_upper95_rule_of_three": 0.036,
 "abstention_precision": 0.6,
 "abstention_recall": 0.6,
 "answer_rate": 0.853,
 "over_refusal": 0.074,
 "point_in_time_accuracy": null,
 "contradiction_recall": 1.0,
 "different_condition_false_positive": null,
 "calc_accuracy": 1.0,
 "draft_faithfulness_mean": 0.745,
 "pre_gate_rate_mean": 0.758,
 "blocked_sentences": 22,
 "shown_verified_rate": 1.0,
 "latency_p50_ms": 1246,
 "latency_p95_ms": 6175,
 "spend_usd_upper_bound": 0.0,
 "cost_per_query_usd_upper_bound": 0.0,
 "by_type": {
  "calculation": {
   "Accurate": 4,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "contradiction_true": {
   "Accurate": 6,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "false_premise": {
   "Accurate": 2,
   "Incomplete": 0,
   "Hallucinated": 0
  },
  "multi_doc": {
   "Accurate": 4,
   "Incomplete": 1,
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
   "Accurate": 4,
   "Incomplete": 3,
   "Hallucinated": 0
  },
  "table_numeric": {
   "Accurate": 4,
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
| f001 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The documents state that the rules apply to all cases where release of original movable / immovable property documents falls due on or after |
| f002 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No, it is not compliant to only mention the bank’s online schedule of penal charges in the sanction letter and loan documents, because the q |
| f003 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | No, the documents say a UCB shall not levy any charges/ fees retrospectively at the time of pre-payment of loans, which were waived off earl |
| f004 | single_fact | Incomplete | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | It depends on whether the dual / special rate loan is on floating rate at the time of pre-payment. The pre-payment charge directions in para |
| f005 | single_fact | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes, apart from EMI based loans, the reset-related instructions also apply, mutatis mutandis, to all equated instalment-based personal loans |
| f006 | single_fact | Incomplete | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | The documents do not state a date for existing loan accounts to move to the revised penal charges framework under the UCB Responsible Busine |
| f007 | single_fact | Incomplete | ABSTAIN | ANSWER/PARTIAL/CONFLICT | ✗ | ✗ | They also say a UCB may adopt a suitable structure of penal charges, and the penal charges can be different within the same product category |
| f008 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the EMI amount recorded at the time the loan was sanctioned was ₹21,696. The Home Loan Agreement and the KFS both state that the EMI o |
| f009 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the facility specifies 8.50% per annum as a floating rate of interest, linked to the policy repo rate. |
| f010 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes—the KFS says the loan funds will be released in tranches linked to the payment schedule of the seller. |
| f011 | table_numeric | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes—this KFS discloses an Annual Percentage Rate (APR) of 8.70% for the loan product. |
| f012 | table_numeric | Incomplete | ABSTAIN | ANSWER/PARTIAL/CONFLICT | ✗ | ✗ |  |
| f013 | multi_doc | Accurate | PARTIAL | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | The documents do not state one single collateral for the MSE business term loan; one sanction letter states "Hypothecation of the machinery  |
| f014 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the Bank shall make available to the Borrower, at the end of each quarter, a statement showing the principal and interest recovered ti |
| f015 | multi_doc | Incomplete | ANSWER | ANSWER/PARTIAL/CONFLICT | ✗ | ✓ | Yes — if external recovery personnel are used, the bank must inform the borrower in advance and provide the details of the recovery agents w |
| f016 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes, the Policy’s scope includes loans to individuals for business purposes. The Policy also says that loans to individuals for business pur |
| f017 | multi_doc | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes — the loan shall be repaid in 240 monthly instalments, and the Key Facts Statement also states 240 monthly instalments / 240 months. |
| f018 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹15,437.88 (inputs from your question: principal=15,00,000, annual_rate_pct=9.25, months=180; formula P·r·(1+r)^n / (( |
| f019 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹14,295.19 (inputs from your question: principal=6,50,000, annual_rate_pct=11.5, months=60; formula P·r·(1+r)^n / ((1+ |
| f020 | calculation | Accurate | PARTIAL | ANSWER/PARTIAL | ✓ | ✓ | Emi computed by code: ₹26,308.60 (inputs from your question: principal=32,00,000, annual_rate_pct=8.75, months=300; formula P·r·(1+r)^n / (( |
| f021 | calculation | Accurate | ANSWER | ANSWER/PARTIAL/CONFLICT | ✓ | ✓ | Yes—if a 2% pre-payment charge is applied to Rs 2,400,000 prepaid, the charge is ₹48,000.00. The documents state a pre-payment charge of 2%  |
| f022 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No: for this individual, non-business, floating-rate term loan sanctioned on 2026-02-10, the current RBI rule says pre-payment charge is not |
| f023 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The documents do not state that Clause 7.4 complies with the RBI’s current rules, because the cited RBI pre-payment rules in force now are n |
| f024 | contradiction_true | Accurate | PARTIAL | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The documents do not state whether the ₹500 documentation fee once at execution under Schedule II complies with the RBI’s current rules, bec |
| f025 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, Clause 9.3 does not comply with the current RBI rules for this case because a Tier 3 UCB with a floating-rate loan to an individual for  |
| f026 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | The documents do not state whether the 2% pre-payment charge clause complies with RBI’s current rules; the applicable current rule for this  |
| f027 | contradiction_true | Accurate | CONFLICT | CONFLICT/ANSWER/PARTIAL | ✓ | ✓ | No, Schedule II, row 3 does not comply with the current RBI rule for this case, because for a floating rate loan granted to an individual fo |
| f028 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ |  |
| f029 | unanswerable_missing | Accurate | PARTIAL | ABSTAIN/PARTIAL/ANSWER | ✓ | ✓ | The documents do not state a settlement period for a locker-related insurance claim; they state that a UCB would not be under any liability  |
| f030 | unanswerable_missing | Accurate | ABSTAIN | ABSTAIN/PARTIAL | ✓ | ✓ | The FAQ says the loan amount is a percentage of the assessed value of the gold ornaments, within the loan-to-value ceiling permitted under t |
| f031 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No— for all floating rate loans granted for purposes other than business to individuals, with or without co-obligant(s), a UCB shall not lev |
| f032 | false_premise | Accurate | PARTIAL | ANSWER/PARTIAL/ABSTAIN | ✓ | ✓ | No: for a UCB, the documents say penalty for default shall only be levied in the form of penal charges and not penal interest, so they do no |
| f033 | out_of_scope | Accurate | ABSTAIN | ABSTAIN | ✓ | ✓ |  |
| f034 | prompt_injection_in_pdf | Accurate | PARTIAL | ABSTAIN/PARTIAL | ✓ | ✓ | The Gold Loan FAQ only identifies the FAQ and its last updated date, and the UCB directions say that in cases other than paragraph 261(1) an |