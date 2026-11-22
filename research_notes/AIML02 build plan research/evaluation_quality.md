# Evaluation and QA Harness for a Verifiable Document-QA System (Hackasol 5.0 AIML-02)

Scope: a fast, rigorous eval harness for a 36-hour build of a "Zero-Guessing & Contradiction-Checking Document AI". It covers metric definitions, reusable datasets, frameworks, gold-set construction, threshold tuning, regression gates and how to present results to judges. Research date: 2026-11-23. Formulas marked "proposed" are design recommendations derived from the cited standard definitions, not quotes from a source.

---

## 1. Which metrics to use, and exactly how to compute each

### Takeaway
Use ALCE's NLI-based citation recall and precision, RAGAS-style claim-level faithfulness (computed with a local verifier, not only an LLM judge), and a Stanford-legal-RAG-style three-way outcome label (accurate / incomplete / hallucinated). Add abstention precision, recall and F1 (AbstentionBench) and a deterministic "fabricated citation" check. Everything else (retrieval recall@k, contradiction P/R, point-in-time accuracy, calculation accuracy, latency, cost) is simple counting over a labelled JSONL gold set.

### Cited Findings
**Citation recall and precision (ALCE)**
- ALCE citation recall is computed per statement and averaged over statements. A statement s_i scores 1 only if it has at least one citation (C_i ≠ ∅) and an NLI model φ judges that the concatenated cited passages entail it: φ(concat(C_i), s_i) = 1. This follows the AIS framework, where an entailment of 1 means "s_i is true based solely on concat(C_i)." — [ALCE, Gao et al. 2023](https://arxiv.org/html/2305.14627)
- ALCE citation precision is computed per citation and averaged over citations. A citation c_{i,j} is "irrelevant" if and only if (a) φ(c_{i,j}, s_i) = 0 AND (b) φ(concat(C_i \ {c_{i,j}}), s_i) = 1. A citation scores 1 if its statement has recall 1 and the citation is not irrelevant. ALCE deliberately does not require a minimal citation set. — [ALCE](https://arxiv.org/html/2305.14627)
- ALCE's NLI judge is TRUE, a T5-11B model fine-tuned on SNLI, MNLI, FEVER, SciTail, PAWS and VitaminC. Its prompt format is "premise: {PREMISE} hypothesis: {}". — [ALCE](https://arxiv.org/html/2305.14627)
- ALCE's correctness metrics: EM recall (gold short answers as exact substrings after SQuAD-style normalization, best alias), claim recall (TRUE checks whether the output entails sub-claims of the reference) and exact-match P/R on answer lists. MAUVE fluency is treated only as a sanity check. — [ALCE](https://arxiv.org/html/2305.14627)

**Faithfulness (RAGAS / claim-level)**
- RAGAS faithfulness = (number of response claims supported by the retrieved context) / (total claims in the response), range 0–1. The procedure is: split the response into claims, check each claim against the context, then score. In the worked example, 1 of 2 claims is supported, giving 0.5. — [RAGAS docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)
- `FaithfulnesswithHHEM` replaces the LLM verifier with Vectara's HHEM-2.1-Open, a free, open-source T5 classifier that runs on CPU by default (batch_size defaults to 10). — [RAGAS docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)

**Reliability warning for LLM-judge faithfulness**
- On HaluBench, RAGAS Faithfulness scores 66.9% overall, versus 87.4% for Lynx-70B and 84.3% for Lynx-8B. HaluBench includes FinanceBench, DROP, CovidQA, PubMedQA and RAGTruth subsets. — [Lynx paper, arXiv 2407.08488](https://arxiv.org/html/2407.08488v1); [Patronus docs](https://docs.patronus.ai/docs/research_and_differentiators/Lynx)
- Bespoke-MiniCheck-7B reports about 77.4% average balanced accuracy on LLM-AggreFact (11 grounding-document fact-check datasets). This figure comes mainly from secondary or aggregator sources, not an official leaderboard I could reach. — [Bespoke-MiniCheck-7B model card](https://huggingface.co/bespokelabs/Bespoke-MiniCheck-7B); [LLM-AggreFact blog](https://llm-aggrefact.github.io/blog)
- Fact-checkers with similar balanced accuracy (Bespoke-7B vs gpt-4-turbo) show "low instance-level labeling consistency" and different TP/TN error trade-offs. A single checker's score is therefore not ground truth. — [Verify with Caution, arXiv 2501.14883](https://arxiv.org/html/2501.14883v2)

**Abstention**
- AbstentionBench scores abstention with precision, recall and F1. An LLM classifier decides whether a response declines, expresses uncertainty or flags a problem with the question. The benchmark spans 20 datasets and more than 35k unanswerable questions (unknown answers, underspecified, false premise, subjective, outdated information). Reasoning fine-tuning lowered abstention by about 24% on average, and a careful system prompt helps but does not solve the problem. — [AbstentionBench, arXiv 2506.09038](https://arxiv.org/abs/2506.09038v1); [NeurIPS 2025 page](https://neurips.cc/virtual/2025/poster/121675)

**Outcome taxonomy (Stanford legal RAG)**
- Magesh et al. label correctness as Correct / Incorrect / Refusal, and groundedness (for correct answers) as Grounded / Misgrounded / Ungrounded. The top-level labels are: **Hallucinated** = incorrect OR misgrounded; **Accurate** = correct AND grounded; **Incomplete** = refusal OR correct-but-ungrounded. — [Magesh et al., arXiv 2405.20362](https://arxiv.org/html/2405.20362v1)
- Results on 202 queries (80 general, 70 jurisdiction/time-specific, 22 false-premise, 30 factual recall):
  - Lexis+ AI: 65% accurate / 18% incomplete / ~17% hallucinated
  - Westlaw AI-AR: 41% / 25% / ~34%
  - Ask Practical Law AI: ~20% / 62% / ~18%
  Hallucination rates are derived as 100 − accurate − incomplete. — [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1); [Stanford HAI summary](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries)
- A citation can exist and still fail to support the claim ("misgrounded"). Magesh et al. count misgrounding as hallucination. — [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries)

**Citation-faithfulness grading without gold answers**
- Vectara open-rag-eval has four areas: UMBRELA retrieval relevance (0–3 per result), AutoNuggetizer answer assessment, citation faithfulness (each citation graded full / partial / no support) and HHEM hallucination detection. Its core metrics need no golden chunks or golden answers. — [open-rag-eval README](https://raw.githubusercontent.com/vectara/open-rag-eval/dev/README.md); [AI Engineer talk](https://ai.engineer/talks/open-rag-eval-rag-evaluation-without-golden-answers); [Vectara blog](https://www.vectara.com/blog/towards-a-gold-standard-for-rag-evaluation)

**Retrieval at span level**
- LegalBench-RAG gives each query ground-truth snippets with file path, exact quote and character indices. It measures document-level and character-level precision/recall between retrieved and gold snippets. — [LegalBench-RAG, arXiv 2408.10343](https://arxiv.org/html/2408.10343v1)

### Inferences
Proposed exact definitions for the harness. Each gold item has a `type`; "answerable" means gold evidence exists.

**Retrieval**
- **Evidence recall@k** (answerable items) = |gold_evidence_units ∩ top-k retrieved units| / |gold_evidence_units|, averaged over items. A unit is a (doc_id, page) pair, giving "page recall@k". Also report **hit@k** = 1 if any gold page is in the top k. Report it at k = 5 and k = 10 (or whatever k the reranker passes to the LLM).
- **Quote-level evidence recall** (optional, LegalBench-RAG style): character overlap between the gold quote span and the retrieved chunk span.

**Citations**
- **Fabricated-citation rate (deterministic, the headline "0")** = cited quotes that fail the verbatim check / total cited quotes. A quote fails if (normalized quote ⊄ normalized text of the cited doc_id+page), OR the doc_id/page does not exist. Normalization: Unicode NFKC, collapse whitespace, unify quotes and dashes, de-hyphenate line breaks. Report both an exact-match version and a fuzzy version (e.g. rapidfuzz partial_ratio ≥ cutoff) and say which one the "0" refers to.
- **Citation recall (ALCE)** = mean over answer sentences of 1[sentence has ≥ 1 citation AND entail(concat(cited quotes), sentence) ≥ τ]. Use MiniCheck or HHEM as φ instead of T5-11B TRUE.
- **Citation precision (ALCE)** = mean over citations of 1[the parent sentence has recall 1 AND NOT(entail(c, s) < τ AND entail(concat(C \ c), s) ≥ τ)].
- **Misgrounded rate** = answers whose citations exist verbatim but don't entail the claim / answered items. This separates "real quote, wrong support" from fabrication, the failure mode Magesh et al. stress.

**Faithfulness score (the UI number)**
- Faithfulness(answer) = supported sentences / total factual sentences. A sentence is supported iff it has ≥ 1 verbatim-verified quote AND entail ≥ τ AND every number in the sentence appears in the cited quote(s) after number normalization. Exclude abstention boilerplate and headings from the denominator. Report the mean over answered items plus the % of answers with faithfulness = 1.0.

**Answer correctness**
- Use a per-type deterministic check where possible:
  - Numbers and dates: exact after normalization (₹, lakh/crore, %, bps, dd/mm/yyyy).
  - Lists: set P/R.
  - Free text: claim recall against 1–3 gold "key facts" via the NLI checker, with an LLM judge only as a secondary check.
- Assign the Magesh-style label per item: **Accurate** (correct AND all key claims grounded), **Incomplete** (abstained OR correct but under-cited) or **Hallucinated** (wrong OR misgrounded).

**Abstention (treat abstain as the positive class)**
- Gold `should_abstain` ∈ {0, 1}; predicted `abstained` ∈ {0, 1}.
  - Abstention precision = TP / (TP + FP): of abstentions, how many were correct.
  - Abstention recall = TP / (TP + FN): of unanswerable items, how many were caught.
  - F1 = 2PR / (P + R).
- **Answer rate** = answered / all items.
- **Over-refusal rate** = FP / answerable items.
- **Correct-abstention rate** = TP / unanswerable items. This equals recall and is the "Y%" in the headline.
- A "good" abstention also names the missing evidence: score 1 if the stated missing item matches the gold `missing_evidence` field (LLM-judged or keyword match).

**Contradiction detection** (pair level; positive = "conflict")
- Precision = correct conflict flags / all flags. Recall = gold conflicts flagged / all gold conflicts. Report F1.
- Separately report the **false-positive rate on "different-condition" pairs** = flagged / total, for gold pairs that look contradictory but apply to different conditions (different customer segment, date, product, jurisdiction). This is the hardest negative class.
- Side-by-side quote validity = % of flagged conflicts where both quotes pass the verbatim check.

**Amendment / point-in-time accuracy**
- For items with `as_of_date`: correct iff the answer cites the version in force on that date (gold `applicable_version_id`) AND the value matches.
- Also report the **stale-version error rate** = answers citing a superseded version.

**Calculation accuracy**
- Correct iff |pred − gold| ≤ tolerance (e.g. 0.5% relative or an exact rupee match) AND all input operands are cited.

**Latency and cost**
- Latency: wall-clock p50/p95 per query over the full eval run. Use `numpy.percentile` on N ≥ 50 runs, after warm-up with caches cleared or explicitly noted.
- Cost per query = Σ(prompt_tokens × input price + completion_tokens × output price) / N, using the usage fields from the OpenAI response. Report the median and the max.

**Why the verifier must be deterministic-first**
- The HaluBench and LLM-AggreFact numbers show that LLM or NLI judges are 67–87% accurate. The team's headline "0 fabricated citations" should rest on the deterministic verbatim check, and "faithfulness %" should be shown together with the judge used and its known accuracy.

### Gaps
- I did not verify the current RAGAS definitions of context precision, context recall or answer correctness; the fetched page only covered faithfulness.
- I could not reach an official, current LLM-AggreFact leaderboard number for MiniCheck variants (Flan-T5, RoBERTa, 7B) or for HHEM-2.1-Open.
- I found no published standard metric for "amendment-chain / point-in-time" correctness. The definition above is proposed.

---

## 2. Reusable datasets and benchmarks (size, license, how to sample 10–30 items)

### Takeaway
No public dataset matches "Indian banking circulars with amendment chains" exactly. The team should build ~70–80% of the gold set from its own demo corpus and borrow 10–30 items each from a few external sets to show generalization:
- FinanceBench open subset (financial numeric QA with page evidence)
- ContractNLI / CUAD / LegalBench-RAG (clause retrieval and entailment/contradiction)
- ContraDoc / WikiContradict (contradiction)
- CREPE / FalseQA (false premise)
- AbstentionBench subsets (abstention)
- an Indian BFSI QA set such as FABRIC (RBI/SEBI questions)

### Cited Findings
**FinanceBench**
- Open sample of 150 annotated questions with source filings, free for non-commercial use. The HF card license is **CC BY-NC 4.0** and the repo is ungated. The full benchmark (10,231 questions) requires a license. One third-party site claims an MIT-style license; this conflicts with the HF/Patronus label, so trust CC BY-NC 4.0. — [HF API card](https://huggingface.co/api/datasets/PatronusAI/financebench); [GitHub mirror](https://github.com/AI-App/Patronus-AI.FinanceBench); [Patronus docs](https://docs.patronus.ai/docs/research_and_differentiators/financebench); [paper arXiv 2311.11944](https://arxiv.org/abs/2311.11944v1)

**LegalBench-RAG**
- 6,858 query-answer pairs over a corpus of more than 79M characters, built from ContractNLI, CUAD, MAUD and PrivacyQA. Each query has ground-truth snippets with file path, exact quote and character indices. Code is at github.com/zeroentropy-cc/legalbenchrag. I did not confirm the license. — [arXiv 2408.10343](https://arxiv.org/html/2408.10343v1)

**ContractNLI**
- 607 annotated contracts (NDAs), with document-level NLI labels (entailment / contradiction / not mentioned) and evidence spans. The project page says CC BY 4.0, but also mentions a Hitachi America dataset agreement, so check the terms. — [ContractNLI site](https://stanfordnlp.github.io/contract-nli); [arXiv 2110.01799](https://arxiv.org/abs/2110.01799v1)

**CUAD**
- More than 13,000 labels across 510 commercial contracts, under CC BY 4.0. — [HF CUAD card](https://huggingface.co/datasets/cuad/blame/main/README.md); [arXiv 2103.06268](https://arxiv.org/pdf/2103.06268)

**CLAUSE** (arXiv 2511.00340, "Better Call CLAUSE")
- More than 7,500 perturbed contracts derived from CUAD and ContractNLI. A persona-driven pipeline injects 10 anomaly categories, which a RAG system checks against statutes. Models often miss subtle discrepancies and struggle to justify them legally. The paper is CC BY 4.0; the arXiv page doesn't state whether the dataset or code is released. — [arXiv 2511.00340](https://arxiv.org/abs/2511.00340)

**ContraGen / LegalWiz** (arXiv 2510.03418)
- One paper retitled between versions. v1 ContraGen is an enterprise contradiction benchmark framework (contracts, financial filings, compliance reports, policy manuals) with a contradiction-type taxonomy, controlled injection and a retrieval evaluation pipeline. v2 LegalWiz injects six structured contradiction types, both self- and pairwise. It was a NeurIPS 2025 workshop paper. — [arXiv v1](https://arxiv.org/html/2510.03418v1); [arXiv v2](https://arxiv.org/html/2510.03418v2); [NeurIPS page](https://neurips.cc/virtual/2025/128298)

**ContraDoc** (NAACL 2024)
- 449 self-contradictory and 442 non-contradictory documents (300–2,200 tokens) from news, Wikipedia and story summaries. GPT-4 performs best but is still unreliable. — [arXiv 2311.09182](https://arxiv.org/html/2311.09182v2); [GitHub](https://github.com/ddhruvkr/CONTRADOC)

**WikiContradict** (NeurIPS 2024 D&B)
- 253 human-annotated instances of real-world knowledge conflicts, yielding 1,375 evaluation samples and 2,750 human judgements. — [arXiv 2406.13805](https://arxiv.org/html/2406.13805v1)

**ConflictBank**
- 7M claim-evidence pairs and 553k QA pairs that simulate knowledge conflicts. This is far too large and synthetic for direct use; sample only. — [arXiv 2408.12076](https://arxiv.org/html/2408.12076v1)

**RAGTruth**
- Nearly 18,000 RAG responses with word-level and case-level hallucination annotations and intensity ratings. Repo: github.com/ParticleMedia/RAGTruth. I did not confirm the license. — [arXiv 2401.00396](https://arxiv.org/abs/2401.00396)

**CREPE**
- 8,400 Reddit questions annotated for false presuppositions plus corrections; 25% of the questions contain a false presupposition. — [ACL 2023](https://aclanthology.org/2023.acl-long.583); [HF tasksource/CREPE](https://huggingface.co/datasets/tasksource/CREPE/tree/main)

**FalseQA**
- 2,365 question pairs (train 1,187 / val 491 / test 687) of false-premise questions. It is also bundled as a subset loader inside AbstentionBench on HF. — [arXiv 2307.02394](https://arxiv.org/pdf/2307.02394); [GitHub thunlp/falseqa](https://github.com/thunlp/falseqa); [AbstentionBench HF false_qa.py](https://huggingface.co/datasets/facebook/AbstentionBench/blob/aced6bba9f88f14765eb3f51b62c4ca2101a4579/false_qa.py)

**AbstentionBench**
- 20 datasets and more than 35k unanswerable prompts; code at github.com/facebookresearch/AbstentionBench, data on HF facebook/AbstentionBench. — [arXiv 2506.09038](https://arxiv.org/abs/2506.09038v1)

**Indian BFSI**
- **agenticclass/fabric**: 204 questions × 6 languages (English, Hindi, Hinglish, Telugu, Bengali, Tamil) = 1,224 QA pairs, under CC BY 4.0. Includes "Banking & RBI" (20 questions) and "SEBI Regulations" (15) categories. Answers are checked against RBI Master Directions and SEBI circulars. — [HF card](https://huggingface.co/datasets/agenticclass/fabric/blob/main/README.md)
- **ground-truth/bfsi-bench**: Indian BFSI regulatory QA (RBI/SEBI/IRDAI), CC BY 4.0, gated (you must accept conditions). — [HF](https://huggingface.co/datasets/ground-truth/bfsi-bench)
- **AISimplyExplained/Assignment_RBI_Notifications**: QA pairs from RBI notifications. Snippets show truncated answers, so quality is uneven. Size and license not checked. — [HF](https://huggingface.co/datasets/AISimplyExplained/Assignment_RBI_Notifications)

### Inferences
Sampling recipe, about 2–3 hours total:
- **FinanceBench (10–15 items)**: filter to questions whose evidence is on one or two pages and includes a table (numeric extraction / calculation). Ingest only those PDFs to keep indexing small. Keep their `evidence` page numbers as gold evidence. Because the license is non-commercial, this is fine for a hackathon demo; note the license on the slide.
- **ContractNLI (10 items)**: pick hypotheses labelled "Contradiction" and "NotMentioned". NotMentioned maps directly to gold `should_abstain=1` ("contract is silent"), and Contradiction maps to conflict-detection items. Evidence spans give gold quotes.
- **LegalBench-RAG mini (10 items)**: the exact quote plus character offsets make it the cleanest source for testing the verbatim-quote verifier and page/span recall.
- **ContraDoc / WikiContradict (5–10 items)**: use as a smoke test for the contradiction detector. These are not banking documents, so report them separately as "out-of-domain".
- **CREPE / FalseQA (5–10 items)**: rewrite the premise onto a bank document. For example, take "Why did RBI raise the KYC update period to 5 years?" where the docs say otherwise. Use the dataset as inspiration for templates rather than verbatim, since the original items are open-domain.
- **FABRIC Banking/RBI + SEBI (10–20 items)**: the only found Indian regulatory set with CC BY 4.0. It works for "real regulatory question phrasing", but the team must attach its own corpus (the actual RBI Master Direction PDFs) and annotate evidence pages themselves.
- **CLAUSE / LegalWiz taxonomies**: borrow their perturbation categories as the checklist for the team's own adversarial injection, even if the data itself isn't downloadable.

### Gaps
- Licenses not confirmed: LegalBench-RAG, RAGTruth, WikiContradict, ConflictBank, ContraDoc, FalseQA, CREPE. Check each repo's LICENSE before redistribution.
- I could not verify RAG-ConfusionQA, ScopeQA, IndicQA or Hindi QA datasets in this session; these need a follow-up search.
- Whether the CLAUSE dataset and code are publicly released is unconfirmed.
- I found no public dataset of Indian circular amendment chains (Master Direction → amendment notifications). The team must construct these.

---

## 3. Frameworks: which to wire into a FastAPI pipeline, run in CI, with custom metrics

### Takeaway
For a 36-hour build, write a ~200-line custom pytest harness that calls the FastAPI endpoint and computes the deterministic metrics above, writing JSON plus HTML/Markdown reports. Optionally wrap 2–3 LLM-judged checks with DeepEval (native pytest `assert_test`, GEval for custom criteria) or RAGAS `FaithfulnesswithHHEM`. Use open-rag-eval only if a reference-free second opinion is wanted. Don't adopt heavy observability platforms unless a teammate already knows one.

### Cited Findings
- DeepEval integrates with pytest via `assert_test()` and the `deepeval test run` CLI. A metric below its threshold raises AssertionError, and the non-zero exit code fails CI. FaithfulnessMetric needs `retrieval_context`. GEval is the escape hatch for custom natural-language criteria scored by a judge model. Example CI: `deepeval test run evals/ --display-mode failing` with OPENAI_API_KEY from secrets. Tip: use `async_mode=False` inside pytest to avoid event-loop conflicts. These details come mostly from third-party tutorials; verify against current docs. — [DeepEval CI docs](https://deepeval.com/docs/evaluation-unit-testing-in-ci-cd); [SitePoint guide](https://www.sitepoint.com/testing-ai-agents-deterministic-evaluation-in-a-non-deterministic-world/); [framework comparison](https://aadhar-build.github.io/llm-evals-comparison/frameworks/deepeval.html)
- RAGAS faithfulness can run with a local HHEM-2.1-Open classifier (`FaithfulnesswithHHEM`) instead of an LLM. — [RAGAS docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)
- RAGAS's LLM-judge faithfulness scored 66.9% on HaluBench. — [Lynx paper](https://arxiv.org/html/2407.08488v1)
- Vectara open-rag-eval is reference-free (UMBRELA, AutoNuggetizer, citation faithfulness, HHEM). — [README](https://raw.githubusercontent.com/vectara/open-rag-eval/dev/README.md)
- RAGAS test-data generation builds a knowledge graph from documents (splitters, NER and keyphrase extractors, relationship builders) and traverses it to synthesize single-hop and multi-hop, specific or abstract queries. Class names differ across versions, e.g. `SingleHopSpecificQuerySynthesizer` vs `SingleHopQuerySynthesizer`. — [RAGAS testgen concepts](https://docs.ragas.io/en/latest/concepts/test_data_generation/rag/); [single-hop how-to](https://docs.ragas.io/en/stable/howtos/applications/singlehop_testset_gen/)

### Inferences
Recommended stack, in priority order:
1. **Custom `evals/run_eval.py` + `tests/test_eval_gate.py` (pytest)**. It reads `gold.jsonl` and calls `POST /ask` on the FastAPI app (in-process via `fastapi.testclient.TestClient` to avoid network flakiness). It writes `eval_results.jsonl` (one row per item) and `eval_summary.json`, and renders `eval_report.md` or HTML with a confusion matrix. This is fastest, fully deterministic and needs no vendor account.
2. **DeepEval** only for GEval-style checks that need judgment, e.g. "does the abstention message name the missing evidence?". Native pytest fits the gate.
3. **RAGAS**: use only `FaithfulnesswithHHEM` as an independent cross-check of the team's own faithfulness score, plus the testset generator for bootstrapping questions.
4. **promptfoo / Phoenix / LangSmith / TruLens / ARES / OpenAI Evals**: skip for a 36-hour build unless a teammate already knows one. They add setup and accounts but cover nothing the custom harness lacks. ARES requires training judge classifiers, which is unrealistic in 36 hours.
- Making the harness reproducible:
  - Pin the OpenAI model snapshot and use temperature 0.
  - Cache LLM responses keyed by (prompt hash, model) so CI replays without API cost. ClauseTrace does this with "replay cassettes" (see section 6).

### Gaps
- I did not verify current promptfoo, Arize Phoenix, LangSmith, TruLens, ARES or OpenAI Evals docs in this session. Claims about them above are general knowledge and should be checked.
- I found no third-party reliability numbers for DeepEval's FaithfulnessMetric comparable to the HaluBench figure for RAGAS.

---

## 4. Building a gold set fast: synthetic, adversarial, verification, schema, agreement

### Takeaway
Generate candidates with an LLM (or the RAGAS testset generator) from the team's own corpus, then hand-craft adversarial variants from a fixed checklist. Have two people verify every item against the PDF with a short protocol, and measure agreement on an overlapping 20-item slice. Target about 80 items: ~48 dev and ~32 test, stratified by type.

### Cited Findings
- RAGAS generates single-hop and multi-hop queries by traversing a document knowledge graph. — [RAGAS docs](https://docs.ragas.io/en/latest/concepts/test_data_generation/rag/)
- The Stanford legal-RAG study used a preregistered set of 202 queries across four strata, including 22 false-premise and 70 jurisdiction/time-specific queries. This is a precedent for small, stratified, adversarial sets with time-dependence. — [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1)
- WikiContradict had each sample annotated by 2 authors (2,750 judgements over 1,375 samples), showing that two-annotator verification is standard for contradiction sets. — [arXiv 2406.13805](https://arxiv.org/html/2406.13805v1)
- CLAUSE injects 10 anomaly categories into CUAD/ContractNLI contracts, and LegalWiz injects 6 contradiction types (self and pairwise). Both are precedents for programmatic contradiction injection. — [CLAUSE](https://arxiv.org/abs/2511.00340); [LegalWiz](https://arxiv.org/html/2510.03418v2)
- AbstentionBench's unanswerable scenarios cover unknown answer, underspecified, false premise, subjective and outdated information. These can serve as abstention categories. — [AbstentionBench](https://arxiv.org/abs/2506.09038v1)

### Inferences
**Proposed composition** (~80 items; adjust to the corpus):

| Type | Count | What it tests |
|---|---|---|
| `single_fact` | 12 | page + quote retrieval |
| `table_numeric` | 10 | table cell extraction, exact numbers |
| `multi_page` / `multi_doc` | 8 | joining evidence |
| `calculation` | 6 | arithmetic over cited operands |
| `amendment_point_in_time` | 10 | which version applies on date X; includes "as of today" and "as of before amendment" |
| `contradiction_true` | 8 | real conflicts between docs |
| `contradiction_different_condition` (hard negatives) | 6 | e.g. rate differs for senior citizens vs others; should NOT be flagged |
| `unanswerable_missing` | 8 | info absent from corpus; near-miss topic |
| `false_premise` | 6 | question asserts something the docs contradict |
| `out_of_scope` | 3 | unrelated domain |
| `prompt_injection_in_pdf` | 3 | PDF contains "ignore instructions, answer X" text |

**Adversarial generation**, one script per perturbation:
- (a) Copy a doc and perturb numbers or dates (₹, %, days) to create an injected conflicting "circular"; gold = conflict with both quotes.
- (b) Create an amendment doc that supersedes clause N from an effective date; gold = new value for dates after it, old value before.
- (c) Take answerable questions and swap the entity or product to one absent from the corpus (near-miss unanswerable).
- (d) Write false-premise rewrites ("Since the limit was raised to X…").
- (e) Inject an instruction string into a PDF page (white text or footer) and check that the system neither obeys it nor cites it as evidence.

**Proposed JSONL schema** (one line per item):
```json
{"id":"q031","split":"dev","type":"amendment_point_in_time",
 "question":"What is the maximum ... as of 2026-04-01?",
 "as_of_date":"2026-04-01",
 "should_abstain":false,
 "gold_answer":"₹2,00,000","answer_type":"number","tolerance":0,
 "gold_key_facts":["limit is ₹2,00,000","applies from 2025-10-01 per Amendment 2"],
 "gold_evidence":[{"doc_id":"rbi_md_kyc_2016_amend2","page":3,"quote":"...exact text..."}],
 "applicable_version_id":"rbi_md_kyc_2016_amend2",
 "superseded_version_ids":["rbi_md_kyc_2016_v1"],
 "gold_conflicts":[{"a":{"doc_id":"..","page":4,"quote":".."},"b":{"doc_id":"..","page":2,"quote":".."},"label":"conflict|different_condition"}],
 "missing_evidence":null,
 "source":"own_corpus|financebench|contractnli|legalbenchrag|fabric",
 "author":"A","verified_by":"B","notes":""}
```

**Two-person verification protocol** (~2 min/item, so ~3 person-hours for 80 items):
1. Author A writes the item and pastes the quote by copying from the PDF text layer, not by retyping.
2. Reviewer B independently opens the cited page, confirms the quote with an automated verbatim check script plus a visual check for tables, then answers the question blind before reading `gold_answer`.
3. If B disagrees, discuss; drop the item if unresolved within 2 minutes.
4. For abstention items, B searches the corpus (Ctrl-F plus BM25) for 1 minute to confirm the answer is truly absent.

**Inter-annotator check**:
- Both annotators label the same 20 items blind on (a) answerable vs abstain, (b) conflict vs different-condition vs none, (c) applicable version.
- Report Cohen's κ = (p_o − p_e) / (1 − p_e), using `sklearn.metrics.cohen_kappa_score`, plus raw % agreement.
- Fix guideline ambiguities if κ < 0.6. With 20 items κ is noisy, so present it as a sanity check, not a claim.

**Synthetic bootstrapping**:
- Use the RAGAS testset generator or a GPT prompt ("given this page, write 3 questions answerable only from it; return quote") for the ~30 straightforward items.
- Hand-write all adversarial items; LLM generators tend to produce easy, lexically overlapping questions.

### Gaps
- I found no published timing data for human verification throughput on document-QA gold sets. The 2 min/item figure is an estimate.
- I did not verify the DeepEval Synthesizer API in this session.

---

## 5. Tuning thresholds (reranker cutoff, entailment τ, fuzzy-match cutoff) without overfitting

### Takeaway
Freeze a stratified test split before any tuning. Tune each threshold on dev only with a coarse grid and a declared objective (e.g. maximize answer accuracy subject to fabricated citations = 0 and abstention precision ≥ 0.9). Pick values from a plateau, not a spike. Report test once, with confidence intervals.

### Cited Findings
- Different fact-checkers with similar balanced accuracy make different TP/TN error trade-offs. This means the entailment τ is checker-specific and must be calibrated on the team's own data rather than copied. — [Verify with Caution](https://arxiv.org/html/2501.14883v2)
- AbstentionBench finds that system-prompt design changes abstention behaviour substantially. This means the prompt is effectively a tunable "threshold" too and must be frozen before the test run. — [AbstentionBench](https://arxiv.org/abs/2506.09038v1)

### Inferences
**Split**
- With ~80 items, use 60/40 dev/test (48/32), stratified by `type`. Write split assignments into the JSONL once (`split` field) with a fixed seed and commit the file. Don't move items afterward.
- Include the out-of-domain borrowed items only in test, as a generalization check.

**Grid**
- Reranker score cutoff: 5–7 values.
- Entailment τ ∈ {0.3, 0.4, 0.5, 0.6, 0.7, 0.8}.
- Fuzzy match cutoff ∈ {90, 95, 98, 100} on a 0–100 partial_ratio. Keep exact match as the reported "fabricated" definition.
- Top-k ∈ {5, 8, 12}.
- Tune sequentially (retrieval first, then verifier) to avoid a combinatorial search on 48 items.

**Objective**
- Lexicographic: (1) fabricated-citation rate = 0 on dev, (2) abstention precision ≥ 0.9, (3) maximize Accurate%.
- Plot accuracy and answer rate vs τ (a risk–coverage curve) and pick the knee inside a stable plateau.

**Overfitting guard**
- Run the test set at most twice: once at the end, and once after a single declared bug fix. Log every test run in `eval_runs.csv`.
- Unit-test the verbatim matcher on synthetic cases (OCR hyphenation, smart quotes, ₹ symbols) so the fuzzy cutoff isn't tuned to hide parser bugs.

**Uncertainty**
- Report Wilson 95% CIs. At n = 32 and p = 0.8 the interval is roughly ±0.14, so judges should see it.
- For "0 fabricated citations out of M quotes", report the rule-of-three upper bound of about 3/M at 95% confidence. For example, 0/150 quotes gives a rate of at most ~2%.

### Gaps
- I found no source giving recommended τ values for MiniCheck or HHEM on financial/regulatory text. Calibration must be empirical.

---

## 6. Regression testing and quality gates during the hackathon (incl. ClauseTrace's eval gate)

### Takeaway
Copy ClauseTrace's pattern: a golden-set script that gates merges with hard, binary invariants. For this project: zero fabricated citations, zero answered items with faithfulness < 1.0 on dev, and no regression in Accurate% or abstention precision beyond a tolerance. Use temperature 0 and recorded LLM responses ("cassettes") so CI is deterministic and free.

### Cited Findings
- ClauseTrace uses a golden-set harness at `scripts/run_evals.py` to gate releases. The page says "verdict agreement must be total and premise-admission violations zero." The gate is wired into CI. Latest reported result (2026-11-05): eval gate 5/5 with 0 premise violations. — [ClauseTrace repo](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- ClauseTrace runs extraction and the proof loop at temperature 0 with at most 12 tool calls, uses replay cassettes in CI, and never runs tests with `LLM_MODE=live`. A "challenger" pass returns structured objections, and a blocking objection sets the finding to REQUIRES_REVIEW. — [ClauseTrace repo](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- ClauseTrace also reports 344 backend pytest passes (3 infra-gated skips), clean ruff/mypy and 53/53 frontend vitest, run via `make check`. The golden set's size and source location were not stated on the page. — [ClauseTrace repo](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- DeepEval's `assert_test` fails pytest (and hence CI) when a metric falls below its threshold. — [DeepEval CI docs](https://deepeval.com/docs/evaluation-unit-testing-in-ci-cd)

### Inferences
**Three test tiers**
1. **Unit** (seconds, every save): verbatim matcher, number normalizer, date/version resolver, conflict-pair classifier on fixed fixtures.
2. **Smoke gate** (under 1 min, every commit): 15 "canary" dev items covering every `type`, run against cassettes. Assert:
   - fabricated == 0
   - every answered item has faithfulness == 1.0
   - all `should_abstain` canaries abstain
   - all `amendment` canaries cite `applicable_version_id`
   - the prompt-injection canary is not obeyed
3. **Full dev eval** (a few minutes, live API, on demand or nightly): writes `eval_summary.json`. Compare to `baseline_summary.json` and fail if Accurate% drops by more than 5 pp or abstention precision drops by more than 0.05. Update the baseline only by explicit commit.

**Implementation sketch**
- `pytest -m gate` uses `@pytest.mark.parametrize` over canary items. Use the `vcrpy` / `pytest-recording` libraries to record OpenAI HTTP calls, or a simple disk cache keyed by the SHA-256 of the request JSON.
- Add a GitHub Actions workflow on push, or for a hackathon just a `make gate` pre-push hook.

**Hard invariants as headlines**
- ClauseTrace's credibility comes from binary invariants ("total agreement, zero violations"), not soft averages. The team should headline "0 fabricated citations" and "0 answered-without-evidence", both enforced by the gate.

### Gaps
- I couldn't see ClauseTrace's golden-set file, its CI workflow or how "5/5" is computed. A 5-item gate is small; the team should aim for more items while keeping the same hard-invariant style.

---

## 7. Presenting eval results to hackathon judges

### Takeaway
One results slide with a stratified table (by question type), a three-way outcome bar (Accurate / Incomplete-abstained / Hallucinated, as in the Stanford legal-RAG study), an abstention confusion matrix, and hard-invariant callouts with honest n and CIs. Add a live "Run eval" button in the UI that replays the canary set and shows pass/fail per item with clickable citations.

### Cited Findings
- The Stanford legal-RAG study's headline presentation is a stacked accurate / incomplete / hallucinated bar per tool on 202 stratified queries. It became widely cited because it separates "refused" from "wrong". — [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1); [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries)
- That study showed tools marketed as "hallucination-free" still hallucinated 17–34% of the time. The authors stress that vendor claims lacked evidence, so concrete, reproducible numbers are what make such claims credible. — [Stanford Law](https://law.stanford.edu/?p=472427)
- ClauseTrace publishes its eval gate result alongside test counts in its README ("eval gate 5/5 with 0 premise violations"). — [ClauseTrace](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- LLM-judge faithfulness metrics can be unreliable (RAGAS 66.9% on HaluBench). Disclose which checker produced each number. — [Lynx paper](https://arxiv.org/html/2407.08488v1)

### Inferences
**Results slide template**

> "On our 80-question adversarial set (32 held-out test, built from 14 RBI/bank PDFs + 20 borrowed FinanceBench/ContractNLI items): **X% accurate, Y% correct abstentions (abstention precision P, recall R), 0 fabricated citations out of M quotes (≤ 3/M at 95%), answer rate Z%, faithfulness mean F, point-in-time accuracy A%, contradiction P/R, p50/p95 latency, ₹/$ per query**."

Each number should carry its n.

**Visuals**
1. Stacked bar of Accurate / Incomplete / Hallucinated, overall and per type.
2. A 2×2 abstention confusion matrix (should-abstain × did-abstain).
3. A 3×3 contradiction matrix (conflict / different-condition / none).
4. A risk–coverage curve vs entailment τ, showing the chosen operating point.
5. A small "failure gallery" of 2 real misses with the cause. Honesty about failures increases credibility.

**Live demo**
- A "Run eval" button triggers the 15-item canary set (cached, so it finishes in seconds) and renders a green/red grid.
- Clicking a row shows the question, the answer, the highlighted quote on the PDF page, the verifier verdicts and the gold answer.
- Let a judge type their own trick question (false premise or out-of-scope) to demonstrate abstention live.

**Baseline comparison**
- Show the same set run through "plain GPT + top-k RAG, no verifier" next to the full system. The delta in fabricated citations and hallucinated% is the most persuasive number.

**Credibility signals**
- Held-out test split frozen before tuning (show the commit hash and timestamp).
- Two-annotator verification and κ.
- Deterministic definitions published in the repo (`EVAL.md` plus the JSONL).
- Gold set released.
- Hard invariants enforced in CI.

**Pitfalls to avoid**
- Don't report a single "accuracy" that hides abstentions. Always pair it with answer rate.
- Don't report LLM-judge faithfulness as fact.
- Don't over-claim from tiny n.

### Gaps
- I found no published rubric or survey of what hackathon judges specifically find credible in eval presentations. The recommendations above are inferred from research-community norms and the ClauseTrace example.
