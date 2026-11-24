# DocuHelp: every evaluation metric explained

For each metric this guide gives:
- **What it means**
- **Formula**
- **How we computed it** (data, n)
- **Our number**
- **Why it matters**
- **How to show it to judges**
- **Which official criterion it earns**

All numbers replay at $0 from `eval/reports/critical/final_pass.json` and `reports/Banking judge critique and evals.md` (§3).

Official criteria: Innovation & originality /25 · Technical execution /25 · Impact & relevance /20 · Track fit /15 · Presentation & demo /15.

---

## A. Retrieval: did search find the right clause?
Data: **75 questions** with a known correct ("gold") clause. Each question's search returns a ranked list of clauses.

| Metric | Formula | Our number (hybrid search) | Meaning |
|---|---|---|---|
| **Hit@k** | share of questions where at least one gold clause is in the top *k* | @1 **0.61** · @3 **0.88** · @5 **0.89** · @8 **0.92** · @20 **0.97** | "Is the answer in the first k results?" @8 matters most: we keep 8 clauses per sub-query. |
| **Recall@k** | (gold clauses found in top *k*) ÷ (all gold clauses), averaged over questions | @8 **0.89** | Some questions need two clauses; recall checks we got all of them, not just one. |
| **Precision@k** | (gold clauses in top *k*) ÷ *k*, averaged | @8 **0.33** | Low by design and a lower bound: gold lists only 1–2 clauses, while neighbouring clauses are often also relevant. The verifier, not search, filters noise. |
| **MRR** (mean reciprocal rank) | mean over questions of **1 ÷ rank of the first gold clause** (0 if absent within 50) | **0.74** | One number for "how high is the right clause?" 1.0 means always first; 0.5 means usually second. |
| **Union hit@8** | gold clause in the top 8 of **any** of the plan's 2–4 sub-queries | **0.99** | Splitting the question into sub-queries finds the clause 99% of the time. |
| **Citation recall** | answered questions whose answer **cites** a gold clause ÷ answered questions | **68 / 71 = 0.91** | Retrieval found it, *and* the final answer used it. |

**Comparison (why hybrid search):**

| Retriever | Hit@1 | Hit@8 | MRR |
|---|---|---|---|
| **Hybrid** (keyword + semantic, rank fusion) | **0.61** | **0.92** | **0.74** |
| Keyword (BM25) only | 0.53 | 0.88 | 0.66 |
| Semantic only | 0.60 | 0.92 | 0.70 |

A cross-encoder re-ranker gave no gain (28/32 either way), so it is off.

**Why it matters**
- Keyword search catches exact strings like "261(2)(ii)" and "₹50 lakh"; semantic search catches meaning. Combined, they beat either alone on every column.
- Recall is not our bottleneck (99%). Evidence selection after search is, which is why the effort went into the verifier.

**How to show it:** appendix **A9** (table). Say: *"The right clause is in our top 8 for 92% of questions, and in 99% once sub-queries are combined; MRR 0.74. So search isn't the weak point. Proving each sentence is."*

**Criterion:** Technical execution (25). An AIML judge expects retrieval metrics on a RAG project.

---

## B. Answer quality: is the whole answer right?
Data: **114 questions** in frozen splits:
- dev, 50 (used for tuning);
- test, 30 (held out);
- fresh, 34 (written by a separate AI and run once).

| Metric | Formula / method | Our number | Meaning |
|---|---|---|---|
| **Strict accuracy** | Accurate ÷ n. *Accurate* = right outcome **and** every key fact present **and** expected clause cited **and** nothing forbidden **and** no fabricated quote, checked by code against the answer key | **102 / 114 = 89.5%** | Strict: a missing date counts as wrong. |
| **Per split** | same | test **27/30**, fresh **29/34** | Not tuned to the test. |
| **Hallucination rate** | answers labelled *Hallucinated* (a fabricated quote or a forbidden wrong fact) ÷ n | **0 / 114** | The core promise. |
| **Fabricated quotes** | quotes not located verbatim on their cited page ÷ quotes | **0 / 375** | Deterministic string check, no AI. |
| **Wilson 95% CI** | (p̂ + z²/2n ± z·√(p̂(1−p̂)/n + z²/4n²)) ÷ (1 + z²/n), z = 1.96 | **82.5% – 93.9%** | The honest error bar on 114 samples. More reliable than ±% for small n or rates near 100%. |
| **Baseline gap** | same questions, plain RAG (same drafting AI, top 5, one prompt, no checks) | fresh **85% vs 50%** | What our checks add. |

**How to show it:** slide 7 (the 85 vs 50 bars plus the 89.5% tile with its CI); appendix A1.

**Criteria:** Technical execution (25); the 0-hallucination number also helps Impact (20).

---

## C. Faithfulness and grounding: is each sentence backed by its quote?

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Pre-gate faithfulness** (per answer) | (p₁ + p₂) ÷ (n₁ + n₂): sentences that passed all five gates ÷ sentences drafted, over the first attempt plus the retry | shown live on the Proof meter | How good the AI's drafts were. The honest score. |
| **First-draft pass rate** (dataset) | Σ passed ÷ Σ drafted, first attempt, dev set | **0.757** (up from 0.736 after a prompt fix) | Tracks drafting quality over time. |
| **Shown faithfulness** | shown ÷ shown | **100% by construction** | We say this openly: it proves nothing alone, which is why we show the two rows above and the audit below. |
| **Support (misgrounding) rate** | an independent AI reads each **shown** sentence against **only** its cited span; unsupported ÷ shown | **7 / 247 = 2.8%**, vs plain RAG **5 / 47 = 10.6%** | Catches real citations that don't prove the claim. Plain RAG's 5 bad quotes all existed verbatim. |

**Caveat:** the support rate comes from an AI auditor, so call it "an independent AI audit", not ground truth.

**How to show it:**
- the Proof meter in the demo (point at "3 drafted › 3 passed › 3 shown · 0 withheld");
- the 2.8% vs 10.6% bars on slide 7.

**Criteria:** Track fit (15), since the brief asks for a faithfulness score as a percentage; Technical execution (25).

---

## D. Refusal: does it stay silent at the right times?
Data: 114 questions, 19 of which can't be answered from the documents or are out of scope.

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Unanswerables handled** | correct refusal or a "what is missing" answer ÷ unanswerable questions | **19 / 19** | Never guessed when the proof was missing. |
| **Over-refusal** | answerable questions that were refused ÷ answerable questions | **4.6%** (was 8%) | The cost of being careful. Lower is better. |
| **Abstention precision** | outputs labelled ABSTAIN that *should* abstain ÷ all ABSTAIN outputs | **0.71** | Label-based: it counts only the ABSTAIN tag. |
| **Abstention recall** | should-abstain questions tagged ABSTAIN ÷ all should-abstain | **0.53** | Undercounts: many correct refusals come back as PARTIAL ("the FAQ does not state…"), which is why "19/19 handled" is the fairer number. |
| **F1** | 2PR ÷ (P + R) | **0.61** | Harmonic mean of precision and recall. |
| **Risk–coverage** | sort answers by a confidence signal; at coverage *c* (share answered), **selective risk** = wrong ÷ answered | at **87.7% coverage, 9.0% risk**; answering the top 50% → **7%**; top 22% → **4%** | "If we answer less, how much safer is it?" The basis for a future risk dial. |
| **AURC** | area under the risk–coverage curve (lower is better) | **0.049** using the draft pass rate as the signal | Our best confidence signal is "what share of drafted sentences survived", not search similarity. |

**How to show it:** the refusal card in the demo (repo rate today), the 19/19 KPI on slide 7, and appendix A9.

**Criteria:** Track fit (15), since zero-guessing abstention is a must-have; Innovation (25), since the risk–coverage curve is rare in hackathon RAG.

---

## E. Contradiction detection
Data: 16 questions whose correct answer is a conflict (positives), 68 where a conflict is wrong (negatives).

| | Predicted conflict | Predicted no conflict |
|---|---|---|
| **Actual conflict (16)** | TP **13** | FN **3** |
| **Actual no conflict (68)** | FP **1** | TN **67** |

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Precision** | TP ÷ (TP + FP) = 13 ÷ 14 | **0.93** | When we say "conflict", we are almost always right: few false alarms for the officer. |
| **Recall** | TP ÷ (TP + FN) = 13 ÷ 16 | **0.81** | We find about 4 in 5 real conflicts. The misses depend on conditions rather than values. |
| **F1** | 2·TP ÷ (2·TP + FP + FN) = 26 ÷ 30 | **0.87** | Balance of the two. |
| **Decoys flagged** | "different condition" pairs wrongly called conflicts | **1 / 6** | Tests the triage types, not just detection. |

**How to show it:** the conflict card (clause 9.3 vs RBI 261(1)) in the demo; P/R on slide 7. Say *"precision 0.93, recall 0.81; we'd rather miss a subtle one than cry wolf."*

**Criteria:** Track fit (15) (a must-have); Technical execution (25).

---

## F. Does each check matter? (Ablation)
Method: 415 drafted sentences captured from real runs and re-run offline through the verifier with **one check switched off at a time**, counting sentences that flip from blocked to shown. The offline copy reproduces **414 / 415** live verdicts.

| Check switched off | Wrong sentences that would reach users | Answers affected | Good sentences lost |
|---|---|---|---|
| In-force / applicability | **18** | 16 | 0 |
| Numbers + numeric binding | **7** | 5 | 1 |
| Whole support ladder | **90** | 55 | 0 |
| First entailment model alone (no ladder) | 0 | 0 | **113** more withheld |

**Why it matters:** this proves causation, not just correlation. Each gate stops errors nothing else stops, and the ladder exists to avoid silence, not to add strictness.

**How to show it:** the "Ablation" line on slide 6; appendix A2. Say *"Switch off the in-force check and 18 wrong ‘current law’ sentences reach the user."*

**Criteria:** Technical execution (25). This is the strongest single technical point.

---

## G. Safety and robustness

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Red-team pass rate** | attacks handled correctly ÷ attacks (expected outcome, no forbidden text) | **22 / 22**, plain RAG **10 / 22** | Injection in the question or a document, false premises, superseded traps, number traps, PII, look-alike characters, off-task requests. |
| **Hindi** | Hindi questions answered correctly ÷ 8; translated sentences whose numbers, dates and ids match the English ÷ 20 | **8 / 8 · 20 / 20** | Hindi is a bonus in the brief; the number check makes it safe. |

**How to show it:** the gold-loan FAQ (hidden instruction flagged) and the Hindi summary in the demo; slide 7.

**Criteria:** Technical execution (25), Track fit (15) (Hindi bonus), Impact (20) (safety for a bank).

---

## H. Agreement between graders: can you trust the scores?

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Percent agreement** | items where two graders agree ÷ items | strict vs AI grader: fresh **73%**, red-team **76%** | Raw agreement. |
| **Cohen's κ** | (pₒ − pₑ) ÷ (1 − pₑ), where pₒ is observed agreement and pₑ is agreement expected by chance | fresh **0.17**, red-team **0.46** | 0 = chance, 1 = perfect. Low κ means one grader isn't enough, so we report strict, AI-graded and a careful re-read (**31/34**). |

**How to show it:** only in Q&A (appendix A1). Say *"Our graders disagreed (κ 0.17), so we report all three, quote the strict one, and a two-person blind check is next."*

**Criteria:** Technical execution (25). It shows evaluation maturity, which this judge values.

---

## I. Cost and speed

| Metric | Formula | Our number | Meaning |
|---|---|---|---|
| **Cost per answer** | Σ API cost ÷ answers, at list price | mean **$0.0045 (≈ ₹0.38)**, p95 $0.0086 | ~$45 a month at 10,000 questions. |
| **Latency p50 / p95** | median and 95th percentile of per-stage timers | local work **1.1 s / 3.0 s**; live end to end **~7–15 s** | Back-office speed, not chat. |

**How to show it:** slide 8 (₹0.38); say "7–15 s" honestly if asked.

**Criteria:** Impact & relevance (20); also feasibility within Technical execution.

---

## Cheat sheet: one line per criterion
- **Innovation & originality (25):** Withheld tray and per-sentence proof; risk–coverage (AURC 0.049) as a future dial.
- **Technical execution (25):** hit@8 0.92 → 0.99, MRR 0.74; 89.5% with CI 82.5–93.9; 0/375 fabricated; ablation 18 / 7 / 90; 2.8% vs 10.6%; κ honesty.
- **Impact & relevance (20):** 0 hallucinated; 22/22 attacks; ₹0.38 per answer; 7–15 s.
- **Track fit (15):** faithfulness on the Proof meter; contradictions P 0.93 / R 0.81; 19/19 refusals; Hindi 8/8; amendment chains; PDF highlight.
- **Presentation & demo (15):** show each number *on the screen that produces it*: Proof meter, conflict card, refusal card, Hindi.

**Rules for saying numbers**
- Always give n ("102 of 114").
- Give the CI for the headline only.
- Call AI-graded numbers "independent AI audit".
- Never round 89.5% up to 90%.
