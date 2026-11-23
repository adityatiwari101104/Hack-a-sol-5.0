# Published systems for verifiable, abstaining, contradiction-aware QA over long regulatory/legal documents (2024 to 2026)

Scope note: research run on 2026-11-23 with about 20 search/fetch calls. Items marked "(snippet only)" were seen in search-result summaries but the primary page was not opened; verify before quoting in a deck. Baseline we compare against: Proof-or-Silence pipeline (hybrid BM25+dense+RRF, graph expansion, amendment versioning, evidence packs, verifier ladder with HHEM-2.1 + MiniCheck + LLM judge, abstention). It scores 85% on a fresh 34-question test with 0 fabricated quotes; plain RAG scores 50%.

## 1. State of the art for attribution and citation faithfulness

### Takeaway
Citation quality is now measured mostly with citation recall, precision and F1 (LongBench-Cite, ALCE-style). Fine-tuned long-context citers (LongCite) beat GPT-4o by about 4 to 6 F1, and native citation APIs report up to 15% better recall than prompt-built citations. None of these does better than our deterministic quote-location check for "no fabricated quotes". The useful new idea is per-claim false-discovery-rate (FDR) control (CiteGuard): accept or withhold each cited sentence under a statistical guarantee rather than all-or-nothing.

### Cited Findings
- LongCite-8B reaches 72.0 citation F1 on LongBench-Cite, versus 65.6 for GPT-4o, a gap of +6.4. LongCite-9B beats GPT-4o by 3.6 F1. Citation F1 is the harmonic mean of citation recall and precision. — [LongCite, arXiv 2409.02897](https://arxiv.org/html/2409.02897v3); [ACL Findings 2025](https://aclanthology.org/2025.findings-acl.264)
- A later training-free, attention-based citation method reports 82.7 to 86.4 citation F1 on LongBench-Cite. Its setup differs from LongCite's. (snippet only) — [arXiv 2604.01432](https://arxiv.org/html/2604.01432v2)
- Anthropic Citations API: Anthropic reports that it "improved recall accuracy by up to 15%" compared with custom prompt-based citation implementations from its own prompt library and cookbooks. Customer Endex reports source hallucinations and formatting issues dropping from 10% to 0%, and a 20% increase in references per response. — [Anthropic: Introducing Citations](https://claude.com/blog/introducing-citations-api)
- Conflicting secondary report: Maginative describes Endex's gain as "20% increase in reference accuracy". The primary quote says references per response. — [Maginative](https://www.maginative.com/article/anthropic-launches-citations-api-for-more-trustworthy-responses-from-claude/)
- CiteGuard (ICML 2026 poster) treats sentence-level factuality as a multiple-testing problem. It turns claim-evidence scores into p-values (null hypothesis: the claim is unsupported) and applies Benjamini-Hochberg or Benjamini-Yekutieli to decide which claims keep their citation and which are withheld. It gives finite-sample guarantees under exchangeability. On FEVER and NQ, FDR among accepted claims falls from 28 to 31% (vanilla RAG) to below 10% at alpha=0.10, while keeping 86 to 92% of supported claims. No code release is mentioned. — [ICML 2026 CiteGuard](https://icml.cc/virtual/2026/poster/64935)
- Stanford RegLab/HAI legal RAG audit: Lexis+ AI and Thomson Reuters tools (Westlaw AI-Assisted Research, Ask Practical Law AI) hallucinate 17% to 33% of the time. Lexis+ AI answered 65% of queries accurately and Westlaw AI-AR 42%. Westlaw hallucinated nearly twice as often as the other legal tools. "Hallucination" covers both incorrect statements and a false claim that a source supports a proposition (misgrounding). Published version accepted March 2025. — [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1); [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-queries); [Stanford PDF](https://dho.stanford.edu/wp-content/uploads/Legal_RAG_Hallucinations.pdf)
- FinRAG-12B (banking grounded QA, not India-specific) reports 73% citation quality. (snippet only) — [arXiv 2605.05482](https://arxiv.org/pdf/2605.05482)

### Inferences
- Our exact or fuzzy quote location already removes the fabricated-quote failure that these APIs target. The remaining risk is misgrounding: the quote exists but does not support the claim. Stanford counts misgrounding as hallucination, so the eval should report a "supported-by-cited-span" rate as well as "0 fabricated quotes".
- CiteGuard's idea fits our verifier ladder without much change. Turn the MiniCheck or HHEM score into a conformal p-value, using our gold-set (79 items) supported and unsupported claim pairs as the calibration set, then apply BH per answer. This replaces hand-tuned thresholds with "FDR at most 10%" stated on a slide. It is CPU-only and costs nothing.
- LongCite-8B/9B is not CPU-feasible for a hackathon demo. Its value here is the metric (citation F1), which we can compute on our own outputs.

### Gaps
- No ALCE numbers for 2025 or 2026 systems were retrieved. Self-RAG, CRAG, FRONT, AttributionBench and OpenAI file search citation accuracy were not verified in this session, so no figures are given for them.
- Constrained quote decoding (forcing generated quotes to be substrings of the source) has no verified numbers here.

## 2. Selective prediction and calibrated abstention for RAG

### Takeaway
Conformal methods (conformal abstention, CiteGuard's FDR control, conformal retrieval filtering) give the cleanest threshold guarantees, and they need only a labelled calibration set plus a score we already compute. Semantic entropy works but costs 5 to 10 times more generation per query, which our ~$1 budget rules out.

### Cited Findings
- Conformal Abstention (Yadkori et al., NeurIPS 2024) bounds the hallucination rate on closed-book and open-domain generative QA. It uses conformal prediction to choose the abstention threshold, and it calibrates the answer-match similarity threshold with theoretical guarantees. — [arXiv 2405.01563](https://arxiv.org/pdf/2405.01563); [NeurIPS 2024](https://neurips.cc/virtual/2024/105548)
- "The Semantic Illusion" (Dec 2025) applies split conformal prediction to RAG hallucination detection. The threshold guarantees, with probability 1-delta, that the true detection rate is at least 1-alpha. It also shows that embedding-similarity detectors fail: conformal FPR reaches 100% on HaluEval for semantic features. — [arXiv 2512.15068](https://arxiv.org/html/2512.15068v2)
- Conformalized retrieval plus chunk-level hallucination detection (May 2026) keeps only retrieved chunks with a high calibrated probability of coming from the correct source. (snippet only) — [arXiv 2605.05244](https://arxiv.org/html/2605.05244v1)
- MiCP (Apr 2026) spreads the error budget across turns of adaptive or multi-step RAG, with a rejection option that preserves overall coverage. (snippet only) — [arXiv 2604.01413](https://arxiv.org/html/2604.01413v1)
- Geometry-Calibrated Conformal Abstention (NeurIPS 2026 poster) uses prediction confidence because non-conformity scores are intractable for open-ended generation. (snippet only) — [NeurIPS 2026](https://neurips.cc/virtual/2026/poster/148649)
- Semantic entropy (Farquhar et al., Nature 2024) clusters sampled answers by meaning before computing entropy. It used 10 generations per prompt plus a quadratic number of equivalence checks. — [Semantic Entropy Probes paper describing SE cost](https://arxiv.org/html/2406.15927v1); [PMC Nature paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11186750)
- Semantic Entropy Probes cost 5 to 10 times less than full semantic entropy by putting linear probes on hidden states, which needs white-box model access. — [arXiv 2406.15927](https://arxiv.org/abs/2406.15927)
- A Bayesian semantic entropy estimator matches SE's AUROC with 53% of the samples. — [arXiv 2504.03579](https://arxiv.org/html/2504.03579v2)
- "Entropy Alone is Insufficient for Safe Selective Prediction in LLMs" (2026) finds that SE probes trail full SE on some datasets. (snippet only) — [arXiv 2603.21172](https://arxiv.org/pdf/2603.21172)

### Inferences
- Cheapest guarantee for us: split-conformal on the verifier score. On the 79-item gold set plus the 34-item fresh set, label each (answer, verified?) outcome. For a target risk alpha (for example, at most 5% wrong among answered), choose the score threshold as the ceil((n+1)(1-alpha))/n quantile of the nonconformity scores on the correct answers. Then report "coverage at risk at most alpha" and a risk-coverage curve. With n around 100, the guarantee is loose (alpha around 0.05 needs care), so present it as "calibrated on n=..., guarantee holds marginally under exchangeability".
- Semantic entropy needs at least 10 calls per query on OpenAI and is not affordable on ~$1. SE probes need open-weight hidden states. Skip both.
- "The Semantic Illusion" supports our choice of NLI/MiniCheck over cosine similarity as the verifier signal.

### Gaps
- No follow-up legal RAG hallucination audit (2025 to 2026) from Stanford RegLab beyond the published version of the 2024 study was found.
- Reported accuracy and coverage numbers for conformal abstention on legal or regulatory QA were not found.

## 3. Contradiction and conflict detection across documents; temporal or amendment reasoning

### Takeaway
Benchmarks exist (WikiContradict, ConflictBank, plus a 2026 cluster of temporal legal benchmarks: LexKairos, LawInForce-eCFR, NitiBench+, "Asking For An Old Friend"). Their consistent finding is that LLMs struggle with in-context conflicts and apply the wrong version of a law unless temporal validity is enforced as a hard constraint. Our code-side as-of-date reconstruction already follows the recommended practice. The pitch value is citing these papers as external evidence that the design choice is right.

### Cited Findings
- WikiContradict (IBM, NeurIPS 2024 D&B): 253 human-annotated instances of real Wikipedia contradictions, 5 LLMs, more than 3,500 human judgements. LLMs often fail to give correct answers when the context contains conflicting information. Their automated judge reaches F-score 0.8. — [arXiv 2406.13805](https://arxiv.org/html/2406.13805v1); [NeurIPS 2024](https://proceedings.neurips.cc/paper_files/paper/2024/hash/c63819755591ea972f8570beffca6b1b-Abstract.html)
- ConflictBank (2024): 7M claim-evidence pairs and 553k QA pairs, covering misinformation, temporal and semantic conflicts, tested on 12 LLMs. — [arXiv 2408.12076](https://arxiv.org/html/2408.12076v1)
- "Asking For An Old Friend" (May 2026): 312 expert-validated German statutory QA pairs on post-cutoff amendments. Vanilla LLMs degrade severely, RAG helps, and web search gives unstable gains with recency bias. The authors conclude that temporal validity should be a hard constraint. (snippet only) — [arXiv 2605.23497](https://arxiv.org/html/2605.23497)
- LexKairos (2026): 9 sub-tasks on statute effective dates, version identification and status verification at a timestamp. (snippet only) — [arXiv 2608.09106](https://arxiv.org/pdf/2608.09106)
- LawInForce-eCFR (AACL 2026): built from real amendments to US eCFR/CFR. Tests whether retrieved text is the legally applicable version. (snippet only) — [AACL 2026](https://aclanthology.org/2026.aacl-long.42.pdf)
- NitiBench+ (Nov 2026): 1,670 Thai legal QA items, each gold citation tied to the statute version in force on the decision date. 2.3% of predecessor citations had drifted from current text. (snippet only) — [arXiv 2611.03576](https://arxiv.org/pdf/2611.03576)
- "When Do LLMs Apply the Wrong Law?" (2026) diagnoses version-selection failures (Civil Code versus predecessor statutes). (snippet only) — [arXiv 2608.14610](https://arxiv.org/pdf/2608.14610)
- RIRAG/ObliQA: 27,869 questions from Abu Dhabi Global Market financial regulation. Its RePASs metric checks that answers capture all relevant obligations while avoiding contradictions. — [arXiv 2409.05677](https://arxiv.org/abs/2409.05677)
- A 2026 paper argues the RePASs metric has weaknesses for regulatory QA. (snippet only) — [arXiv 2609.30009](https://arxiv.org/pdf/2609.30009)

### Inferences
- RePASs's "obligation coverage + no contradiction" structure matches our obligation extraction. A cheap addition is an obligation-recall metric: what share of gold obligations appear in the answer. It shows completeness alongside faithfulness.
- Our tuple-level contradiction triage (on value, unit and effective date) is more precise than the NLI-on-passages approach these benchmarks evaluate. A good demo is to show a WikiContradict-style case on RBI text: two circulars with different limits, resolved by as-of date.

### Gaps
- ContraDoc (self-contradiction in long documents) did not appear in search. No numbers.
- Headline accuracy for LexKairos, LawInForce, NitiBench+ and the German amendment benchmark were not retrieved.
- LegalBench statutory-reasoning numbers and Catala or rules-as-code results for 2024 to 2026 were not researched in this session.

## 4. Structure-aware retrieval for legal text: does anything beat hybrid plus rerank?

### Takeaway
No source shows graph RAG (GraphRAG, LightRAG, HippoRAG 2) clearly beating hybrid BM25+dense+rerank on legal or regulatory QA. One legal study finds hybrid modes (LightRAG Mix, LlamaIndex Hybrid) best and KG-only systems behind. The strongest evidence is for (a) contextual chunk headers, as in Anthropic's Contextual Retrieval, and (b) structure-aligned chunking by section, which beats naive or recursive chunks on LegalBench-RAG recall. Some evidence says generic rerankers hurt legal retrieval.

### Cited Findings
- Anthropic Contextual Retrieval: contextual embeddings plus contextual BM25 cut the top-20 retrieval failure rate by 49% (5.7% to 2.9%). Adding a reranker brings it to 67% (1.9%). Evaluated on codebases, fiction and papers, not legal text. — [Anthropic](https://www.anthropic.com/engineering/contextual-retrieval); [critique, Medium](https://medium.com/almond-ai/responding-to-anthropics-contextual-retrieval-for-rag-apps-why-context-is-not-all-you-need-af503985aa55)
- Breakdown: contextual embeddings alone took failures from 5.7% to 3.7% (-35%). (secondary) — [DataCamp tutorial](https://www.datacamp.com/ja/tutorial/contextual-retrieval-anthropic)
- LegalBench-RAG: 6,858 query-answer pairs over a corpus of more than 79M characters, scored with character-level Precision@k and Recall@k. The original authors found recursive character splitting better than naive splitting, using text-embedding-3-large with and without Cohere rerank. — [arXiv 2408.10343](https://arxiv.org/html/2408.10343v1)
- StrucChunk (2026): structural chunking beats post-hoc reranking, and general-purpose rerankers hurt legal retrieval. Reports +104% Char-Recall@8 over the best baseline (naive 500-char baseline: 34.51%). Its Char-Precision@1 is 4.51%, below Recursive+Dense at 6.64%. (snippet only, secondary) — [arXiv 2610.26313](https://arxiv.org/pdf/2610.26313)
- Tailored legal retrieval with open SBERT/GTE embeddings improves Recall@K by 30 to 95% and Precision@K by about 2.5x for K>4. (snippet only) — [arXiv 2510.06999](https://arxiv.org/pdf/2510.06999)
- Legal QA comparison of HippoRAG 2, Nano GraphRAG, LightRAG and LlamaIndex: LightRAG Mix and LlamaIndex Hybrid were most accurate, and KG-only systems trailed on text semantics. (snippet only) — [CEUR-WS Vol-4079](https://ceur-ws.org/Vol-4079/paper6.pdf)
- ARGUS (US bar-exam passages, about 857k): BM25 Recall@10 of 1%, raised to 8% by graph reranking of the BM25 top-1000. Downstream, BM25-RAG scored 73% and Graph-RAG 72%, both below a no-passage baseline of 76%. (snippet only) — [arXiv 2609.30184](https://arxiv.org/pdf/2609.30184)
- HippoRAG 2 beats standard embedding RAG on factual, sense-making and associative tasks in its own (non-legal) evaluation. — [arXiv 2502.14802](https://arxiv.org/html/2502.14802)

### Inferences
- Our explicit WITHDRAWS/AMENDED_BY/REFERS_TO graph is a typed citation graph, not an LLM-extracted entity graph. It is closer to what legal work needs and cheaper than GraphRAG or LightRAG indexing. Do not switch.
- The cheapest likely gain is contextual headers without an LLM. Prepend "Master Direction X, Chapter Y, Para Z: <title>" to each chunk before BM25 and embedding. Anthropic's 35 to 49% failure reduction came from LLM-written context. A deterministic breadcrumb header from the document structure costs $0 and likely gets part of that.
- If the reranker is optional, A/B it on our gold set. StrucChunk reports that generic rerankers can hurt legal retrieval.

### Gaps
- No verified ColBERT/ColPali, late-chunking or RAPTOR results on legal or regulatory benchmarks.
- Full numeric tables for the CEUR legal GraphRAG comparison were not retrieved.

## 5. Verification models newer than HHEM-2.1 and MiniCheck

### Takeaway
On the LLM-AggreFact leaderboard, the best small CPU-feasible checkers are FactCG-DeBERTa-L (0.4B, 75.6) and MiniCheck-Flan-T5-L (0.8B, 75.0). Bespoke-MiniCheck-7B (77.4) and Granite Guardian 3.3 8B (76.5) are 1 to 2 points better but need 7 to 8B inference, which is slow on a MacBook CPU. Proprietary top models reach about 79.5. LettuceDetect (ModernBERT, 149M or 395M) adds token-level span detection at 79.2 F1 on RAGTruth. It is the most practical new addition for highlighting unsupported spans in the UI.

### Cited Findings
- LLM-AggreFact leaderboard (11 datasets, ranked by average balanced accuracy; page shows no update date):
  - nimble-v4-max 27B 79.5
  - Decido-1 Grounding 79.2
  - Clef 27B 79.0
  - Bespoke-MiniCheck-7B 77.4
  - Claude-3.5 Sonnet 77.2
  - Granite Guardian 3.3 8B 76.5
  - gpt-4o-2024-05-13 75.9
  - FactCG-DeBERTa-L 0.4B 75.6
  - MiniCheck-Flan-T5-L 0.8B 75.0
  - Llama-3.1-405B 74.4

  Lynx and HHEM are not listed. — [LLM-AggreFact leaderboard](https://llm-aggrefact.github.io/); [blog](https://llm-aggrefact.github.io/blog)
- Bespoke-MiniCheck-7B was trained on synthetic data from Llama-3.1-405B. — [HF model card](https://huggingface.co/bespokelabs/Bespoke-MiniCheck-7B)
- Vectara's FaithJudge benchmark scores Bespoke-MiniCheck-7B at 67.3 average on its own dataset mix. That figure is not comparable with LLM-AggreFact. — [arXiv 2505.04847](https://arxiv.org/html/2505.04847v2)
- HHEM-2.1-Open (110M) scores 67.7% accuracy and 56.1 F1 on RAGTruth-Summ in Vectara's comparison. It was trained partly on RAGTruth. — [arXiv 2505.04847](https://arxiv.org/html/2505.04847v1)
- "Verify with Caution" (2025) warns that factuality metrics are imperfect and that systems should not be tuned blindly to one metric. — [arXiv 2501.14883](https://arxiv.org/html/2501.14883v2)
- LettuceDetect: a ModernBERT token-level classifier trained on RAGTruth with up to 8k context. It scores 79.22% example-level F1 on RAGTruth, +14.8% over Luna (65.4), ahead of GPT-4 (63.4), and short of fine-tuned Llama-3-8B (83.9). The base model (149M) scores 76.8 and the large model (395M) 79.2. — [arXiv 2502.17125](https://arxiv.org/html/2502.17125v1); [HF card](https://huggingface.co/KRLabsOrg/lettucedect-large-modernbert-en-v1)
- Lynx (Patronus, 8B or 70B) beats GPT-4o and Claude-3-Sonnet on HaluBench (15k context-question-answer triples). Exact numbers were not retrieved. — [arXiv 2407.08488](https://arxiv.org/html/2407.08488v2)

### Inferences
- Swap or add FactCG-DeBERTa-L (0.4B) next to MiniCheck-FT5. It scores slightly higher on the leaderboard and is smaller, so it runs on CPU in well under a second per claim, but measure this. An ensemble of two small checkers (MiniCheck and FactCG), combined by min or mean, is a cheap robustness gain.
- Add LettuceDetect-base (149M) for span-level "unsupported words" highlighting. It is visible in the demo and cheap.
- Bespoke-MiniCheck-7B and Granite Guardian 3.3 8B could run via llama.cpp/Ollama in a 4-bit quant on an M-series Mac, but latency would likely be several seconds per claim. Use them only as an offline second opinion on the eval set, not in the live path.
- HHEM-2.1-open is the weakest of our checkers on published numbers. It could be demoted to a tie-breaker.

### Gaps
- No verified CPU latency numbers for any of these models.
- Exact HaluBench numbers for Lynx, and Granite Guardian's RAG-specific groundedness scores outside LLM-AggreFact, were not retrieved.

## 6. Work specific to India, RBI or financial compliance QA

### Takeaway
IndiaFinBench (2026) is the only benchmark found that is built from RBI and SEBI text and includes contradiction detection and temporal reasoning. Its main lesson is that the scoring rule can flip model rankings, which bears directly on how we report our 85%. No published RBI-specific verifiable-RAG system with strong numbers was found.

### Cited Findings
- IndiaFinBench: 406 expert-annotated items over SEBI and RBI regulatory text, covering interpretation, numerical reasoning, contradiction detection and temporal reasoning. 12 LLMs were tested zero-shot. Accuracy ranges by scoring regime: strict string match 75.12 to 89.66%, cross-model judge 87.19 to 94.83%, composite 94.1 to 98.0%. Strict and judge rankings are uncorrelated (Spearman rho -0.273, p 0.39). For one model, the judge rescored 93.9% of its strict errors as correct. 148 of 406 items (36.5%) were answered identically by all models. A non-specialist human scored 80.0% (48/60) on a medium/hard subset, not significantly different from the models. — [arXiv 2604.19298](https://arxiv.org/abs/2604.19298)
- An RBI-corpus RAG compliance tool (IJIRT, June 2026) uses all-MiniLM-L6-v2 embeddings. (snippet only; low-tier venue) — [IJIRT](https://ijirt.org/publishedpaper/IJIRT203665_PAPER.pdf)
- EY fine-tuned Llama-3.1-8B with LoRA on 70 recent RBI documents for Indian BFSI. This is a white paper, not peer-reviewed. — [EY PDF](https://www.ey.com/content/dam/ey-unified-site/ey-com/en-in/services/consulting/fine-tuned-llm-for-transforming-the-bfsi-sector/ey-fine-tuned-llma-3-point-1-instruct-with-peft-lora-for-indian-bfsi-domain.pdf)
- ObliQA/RIRAG (ADGM) is the closest public regulatory-obligation QA benchmark to our task. — [arXiv 2409.05677](https://arxiv.org/abs/2409.05677)

### Inferences
- Our 85% versus 50% claim should state the scoring rule (strict or judge), given IndiaFinBench's finding that the rule alone can reorder systems. Reporting both strict and judge scores, plus "fabricated quotes: 0", answers this criticism before it is raised.
- If IndiaFinBench's data is public, running the RBI subset, especially the contradiction and temporal items, would give an external number. Data availability was not confirmed.

### Gaps
- Per-task accuracy in IndiaFinBench (contradiction, temporal) and the dataset licence or release were not retrieved.
- No RBI- or SEBI-specific abstention or citation-faithfulness study was found.

## Hackathon-feasibility shortlist (CPU MacBook, days, about $1 OpenAI)
Ordered by expected value per effort. All are inferences from the findings above, not reported results on our data.

1. **Conformal threshold or BH-FDR on verifier scores** (CiteGuard / Conformal Abstention idea).
   - Cost: $0, about half a day.
   - Gives a stated guarantee ("at most 10% unsupported accepted claims") and a risk-coverage curve.
2. **Deterministic contextual breadcrumb headers on chunks** (Contextual Retrieval, without the LLM).
   - Cost: $0, about half a day plus re-indexing.
   - Anthropic's LLM-written variant cut retrieval failures by 35 to 49%. Gains from a deterministic header are unmeasured.
3. **Add FactCG-DeBERTa-L (0.4B) to the verifier ladder**, ensembled with MiniCheck.
   - Cost: $0, a few hours.
   - Leaderboard: 75.6 versus 75.0.
4. **LettuceDetect-base for token-level unsupported-span highlighting** in the UI.
   - Cost: $0, a few hours.
   - 76.8 F1 on RAGTruth.
5. **Report strict and judge scores, citation F1 and obligation recall** (IndiaFinBench lesson, LongBench-Cite metric, RePASs idea).
   - Cost: $0 (the judge pass on 34 questions is only cents).
6. **A/B test the reranker** (StrucChunk claims generic rerankers hurt legal retrieval).
   - Cost: $0.
7. **Not recommended now**:
   - Semantic entropy: at least 10 generations per query, over budget.
   - GraphRAG or LightRAG re-indexing: LLM-heavy, with no evidence it beats hybrid on legal text.
   - LongCite or Bespoke-7B in the live path: too slow on CPU.
