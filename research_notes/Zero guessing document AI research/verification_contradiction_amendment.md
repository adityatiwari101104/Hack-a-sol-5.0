# Verification Layer for a "Zero-Guessing" Document QA System: Claim Verification, Citation Grounding, Abstention, Faithfulness, Contradiction Detection, Amendment/Temporal Resolution, Deterministic Calculation

Source-quality legend: items marked **[verified this session]** were read from the primary page during this research (Nov 2026). Items marked **[from paper, not re-fetched]** are well-known published figures that I did not re-open this session, so check them before quoting on a slide. Anything I could not source is under Gaps.

---

## 1. Claim decomposition + per-claim verification (FActScore, SAFE, RARR, CoVe, Self-RAG, CRAG, attribute-first)

### Takeaway
Every serious method uses the same loop: split the answer into atomic claims, check each claim against evidence on its own, then score, revise or drop it. For a closed corpus (your documents, not the web), the best fit is "decompose with an LLM, verify each claim with a small NLI/fact-check model (MiniCheck/HHEM), fall back to an LLM judge for borderline cases". Web-search verifiers (SAFE, RARR) are the wrong tool when the evidence set is fixed.

### Cited Findings
- **SAFE** (Google DeepMind, "Long-form factuality in LLMs", NeurIPS 2024): an LLM splits a long answer into individual facts, then runs multi-step Google Search queries to check each one. It agreed with crowdsourced annotators on about 72% of roughly 16k facts. On 100 disagreements, SAFE was judged right 76% of the time. It costs more than 20x less than human annotation (a secondary source gives about $0.19 vs $4.00 per response). It used gpt-3.5-turbo with the Serper search API. Caveat: the comparison was against crowdworkers, not experts. **[verified this session]** — [arXiv 2403.18802](https://arxiv.org/abs/2403.18802v3); [Kore.ai summary](https://www.kore.ai/blog/agentic-search-augmented-factuality-evaluator-safe-for-llms)
- **Chain-of-Verification (CoVe)** (Meta, 2023) has four steps: (1) draft a response, (2) plan verification questions, (3) answer them independently so the draft cannot bias the answers, (4) write the final verified response. The paper reports fewer hallucinations on Wikidata list questions, closed-book MultiSpanQA and long-form biographies. **[abstract verified this session]** — [arXiv 2309.11495](https://arxiv.org/abs/2309.11495)
  - The headline numbers are not in the abstract and were not re-fetched: Llama-65B biography FActScore rose from about 55.9 to 71.4 with the "factor+revise" variant, and Wikidata list precision roughly doubled (about 0.17 to 0.36). The "factored" variant, which answers verification questions in separate prompts, beat the "joint" variant. **[from paper, not re-fetched]** — [arXiv HTML](https://arxiv.org/html/2309.11495v2)
- **FActScore** (Min et al., EMNLP 2023) splits a generation into atomic facts and reports the share supported by a knowledge source (Wikipedia). It has a retrieve-then-LM-judge estimator. The paper reports ChatGPT bios at about 58% supported and an automated estimator error under 2% against humans. **[from paper, not re-fetched]** — [arXiv 2305.14251](https://arxiv.org/abs/2305.14251)
- **RARR** (Gao et al., 2022/ACL 2023) is a post-hoc "research and revise" method. It generates queries for the draft, retrieves evidence, uses an agreement model to find unsupported spans, then makes minimal edits while preserving the original text, and outputs an attribution report. **[from paper, not re-fetched]** — [arXiv 2210.08726](https://arxiv.org/abs/2210.08726)
- **Self-RAG** (Asai et al., ICLR 2024) trains the generator to emit reflection tokens such as [Retrieve], [IsREL], [IsSUP] (fully, partially or not supported) and [IsUSE]. Segment-level beam search can then favor outputs whose segments are supported. It needs a fine-tuned model (7B/13B released), so it is not plug-and-play with an API LLM. **[from paper, not re-fetched]** — [arXiv 2310.11511](https://arxiv.org/abs/2310.11511)
- **CRAG / Corrective RAG** (Yan et al., 2024) uses a lightweight retrieval evaluator (T5-large) that labels retrieved documents Correct, Incorrect or Ambiguous. "Incorrect" sends the query to web search, and "Ambiguous" combines both sources. It also uses decompose-then-recompose filtering of documents. For a zero-guessing system, the useful idea is the evaluator-gated decision, with "Incorrect" mapped to abstain instead of web search. **[from paper, not re-fetched]** — [arXiv 2401.15884](https://arxiv.org/abs/2401.15884)
- **LongCite** trains models (LongCite-8B/9B, from 45k SFT instances) to produce answers with sentence-level citations in one pass. On LongBench-Cite it reports citation quality ahead of GPT-4o and finds that citation training reduces hallucination. **[verified this session]** — [arXiv 2409.02897](https://arxiv.org/abs/2409.02897v3)
- A 2026 paper warns that forcing very fine citation granularity can hurt attribution. It reports that enforcing fine-grained citations degrades attribution quality by 16–276% compared with the best granularity. **[verified via search snippet]** — [arXiv 2604.01432](https://arxiv.org/html/2604.01432v2)

### Inferences
- For a hackathon, "attribute first, then generate" is the most robust approach. Retrieve, have the LLM pick and quote the supporting spans first, then have it write an answer that may only use those quotes, then verify each sentence. It turns verification into a cheap string check plus NLI, rather than an open-ended fact check.
- The CoVe "factored" insight carries over: verify each claim in a fresh call or with a cross-encoder that only sees (evidence, claim), never the full draft. Otherwise the verifier copies the draft's mistakes.
- The granularity paper suggests citing at sentence or clause level, with consecutive sentences merged, not token or sub-sentence spans.

### Gaps
- I found no head-to-head benchmark of CoVe, Self-RAG and CRAG on a closed-corpus regulatory or legal QA task.
- The CoVe, FActScore, Self-RAG and CRAG figures were not re-read this session.

---

## 2. NLI / fact-check models for grounding (which open models, benchmark scores, size, CPU speed)

### Takeaway
The best open models are **Bespoke-MiniCheck-7B** (LLM-AggreFact avg 77.4, beating GPT-4o's 75.9) for an affordable GPU, and **MiniCheck-Flan-T5-L (0.8B, 75.0)**, **FactCG-DeBERTa-L (0.4B, 75.6)** or **HHEM-2.1-Open (0.1B, under 600 MB, about 1.5 s per 2k tokens on CPU)** for CPU. **LettuceDetect (0.4B ModernBERT, 8k context)** gives token-level hallucinated spans, which is useful for highlighting. **Granite Guardian 3.3 (8B, 76.5)** and **Lynx (8B/70B)** are LLM-sized judges.

### Cited Findings
**LLM-AggreFact leaderboard** (11 datasets, balanced accuracy; the page shows 19 of 47 models and has no "last updated" date) **[verified this session]** — [llm-aggrefact.github.io](https://llm-aggrefact.github.io/)

| Model | Size | Avg | RAGTruth |
|---|---|---|---|
| nimble-v4-max | 27B | 79.5 | 90.5 |
| Clef | 27B | 79.0 | 87.3 |
| Decider v1.2 | 27B | 78.7 | 89.0 |
| nimble-v4 | 9B | 77.8 | 88.9 |
| **Bespoke-MiniCheck-7B** | 7B | **77.4** | 84.0 |
| Claude-3.5 Sonnet | – | 77.2 | 86.1 |
| **Granite Guardian 3.3** | 8B | **76.5** | 82.2 |
| Mistral-Large 2 | 123B | 76.5 | 85.9 |
| gpt-4o-2024-05-13 | – | 75.9 | 84.3 |
| **FactCG-DeBERTa-L** | 0.4B | **75.6** | 82.3 |
| Qwen2.5-72B-Instruct | 72B | 75.6 | 81.9 |
| **MiniCheck-Flan-T5-L** | 0.8B | **75.0** | 78.0 |
| Llama-3.3-70B-Instruct | 70B | 74.5 | 82.6 |
| Llama-3.1-405B-Instruct | 405B | 74.4 | 82.9 |

- Several top entries (nimble, Clef, Decider, d1-ultra, Jev) are vendor or proprietary submissions. Their open-weight status was not confirmed here, so it should not be assumed. — [llm-aggrefact.github.io](https://llm-aggrefact.github.io/)
- The weakest dataset for every model is ExpertQA, at about 58–61. Even the best checkers are near coin-flip on expert-domain claims, so do not over-trust any verifier on specialist regulatory text. — [llm-aggrefact.github.io](https://llm-aggrefact.github.io/)
- **MiniCheck** (Tang, Laban, Durrett; EMNLP 2024): MiniCheck-FT5 has 770M parameters and is trained on GPT-4-generated synthetic data plus entailment data. The paper claims GPT-4-level accuracy at about 400x lower cost and a 4–10 point absolute gain over specialized systems such as AlignScore. The 400x figure is the authors' own and has not been independently checked. **[verified this session]** — [arXiv 2404.10774](https://arxiv.org/abs/2404.10774); [ACL Anthology](https://aclanthology.org/2024.emnlp-main.499)
- **HHEM-2.1-Open** (Vectara) is fine-tuned from flan-t5-base (0.1B). It has no hard context limit (HHEM-1.0 was capped at 512 tokens), takes about 1.5 s for a 2k-token input on a modern x86 CPU, and uses under 600 MB RAM at FP32. It returns a 0–1 consistency score. **[verified this session]** — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)
  - Balanced accuracy / F1: AggreFact-SOTA 76.55/66.77 (GPT-4 73.78/63.87); RAGTruth-Summ 64.42/44.83 (GPT-4 62.62/40.59); RAGTruth-QA 74.28/60.00 (GPT-4 74.11/57.78). — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)
  - Usage: `AutoModelForSequenceClassification.from_pretrained('vectara/hallucination_evaluation_model', trust_remote_code=True).predict([(premise, hypothesis)])`. — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- **LettuceDetect** (KRLabs): a ModernBERT-large token classifier (0.4B) with 8,192-token context that marks hallucinated spans. RAGTruth example-level F1 is 79.22% for the large model, against GPT-4 prompting at 63.4%, Luna at 65.4%, fine-tuned Llama-2-13B at 78.7% and fine-tuned Llama-3-8B (RAG-HAT) at 83.9%. The card reports no throughput figures. Usage: `pip install lettucedetect`, `HallucinationDetector(method="transformer", model_path=...)`, `predict(context, question, answer, output_format="spans")`. **[verified this session]** — [HF model card](https://huggingface.co/KRLabsOrg/lettucedect-large-modernbert-en-v1)
- **Lynx** (Patronus AI, 2024) on HaluBench (15k context-question-answer triplets from HaluEval, RAGTruth, FinanceBench, DROP, CovidQA and PubMedQA, with perturbed hallucinations): Lynx-70B 87.4%, GPT-4o 86.5%, GPT-4-Turbo 85.0%, Lynx-8B 82.9%, Llama-3-70B-Instruct 80.1%, Claude-3-Sonnet 78.8%, Claude-3-Haiku 69.0%, **RAGAS Faithfulness 66.9%**. Patronus built both the model and the benchmark, and I found no independent replication. **[verified this session]** — [arXiv 2407.08488](https://arxiv.org/html/2407.08488v2); [Patronus announcement](https://patronus.ai/announcements/patronus-ai-launches-lynx-state-of-the-art-open-source-hallucination-detection-model)
- **DeBERTa-v3 MNLI/ANLI cross-encoders** and **AlignScore** are older baselines. The MiniCheck paper reports beating AlignScore substantially. — [arXiv 2404.10774](https://arxiv.org/abs/2404.10774)

### Inferences
- **CPU-only stack**: HHEM-2.1-Open (fastest, 0.1B) or MiniCheck-Flan-T5-L / FactCG-DeBERTa-L (about 75 avg) as the per-claim gate, plus LettuceDetect for span highlighting in the UI.
- **One GPU (24 GB)**: Bespoke-MiniCheck-7B via vLLM is the strongest open checker you can realistically run, beating GPT-4o on the aggregate.
- Raw NLI models trained on MNLI behave poorly on long premises and multi-sentence evidence. Chunk the evidence to the cited span plus about ±1 sentence before scoring, or use MiniCheck/HHEM, which handle longer documents by chunking internally.
- Calibrate thresholds on 30–50 hand-labelled examples from your own corpus. The leaderboard's ExpertQA scores show that domain shift is the main risk.

### Gaps
- I did not find CPU latency for MiniCheck-FT5, Bespoke-MiniCheck-7B or LettuceDetect from primary sources.
- Granite Guardian's model card was not fetched (only its leaderboard score). AlignScore and DeBERTa NLI absolute scores were not retrieved.

---

## 3. Exact / verbatim citation (quote-then-verify, span offsets, Citations API, ContextCite, LongCite) and faithfulness = supported/total

### Takeaway
Make the generator emit verbatim quotes, or use an API that returns character offsets. Then verify each quote deterministically against the source text with exact match first and RapidFuzz partial-ratio second. Any quote that fails the check is a hallucinated citation and the sentence is rejected. Score faithfulness as supported sentences or claims divided by total.

### Cited Findings
- **Anthropic Citations API** **[verified this session]** — [Claude docs: Citations](https://platform.claude.com/docs/en/build-with-claude/citations)
  - Plain-text and PDF documents are chunked into sentences automatically. "Custom content" documents use your blocks as-is, with no further chunking, which controls citation granularity.
  - Citations come back as `char_location` (0-indexed `start_char_index`, exclusive `end_char_index`) for plain text, `page_location` (1-indexed start page, exclusive end page) for PDFs, and block indices for custom content. Each carries `cited_text`.
  - The docs state that "citations are guaranteed to contain valid pointers to the provided documents", because the API parses citations and extracts `cited_text` itself.
  - `cited_text` does not count toward output tokens. Enabling citations adds a slight input-token increase.
  - The docs warn that the API does not guarantee every field has a value and at least one citation. You must still check coverage yourself.
- **ContextCite** (Cohen-Wang et al., MIT, 2024) is described as contributive context attribution. It runs several random context ablations and fits a surrogate model to estimate which context sources caused a generated statement. It works with any open-weight model with logits. **[via SelfCite description, verified]** — [SelfCite arXiv 2502.09604](https://arxiv.org/pdf/2502.09604)
- **LongCite** produces sentence-level citations in one pass. See Section 1. — [arXiv 2409.02897](https://arxiv.org/abs/2409.02897v3)
- The **RAGAS faithfulness** formula is (claims in response supported by retrieved context) / (total claims). The LLM extracts claims, each claim is checked for inferability, and the score is the ratio (for example, 1 of 2 supported gives 0.5). `FaithfulnesswithHHEM` replaces the LLM verifier with HHEM-2.1-Open on CPU (settable `device`, `batch_size=10`). **[verified this session]** — [RAGAS docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)

### Inferences (implementation recipe)
1. Store each chunk with `doc_id`, `version_id`, `page`, `char_start`, `char_end` and the normalized text, using NFKC, collapsed whitespace and unified quotes and dashes.
2. Prompt with strict JSON output: `{"answer_sentences":[{"text":..., "quotes":[{"doc_id":..., "quote":"<verbatim>"}]}]}`, or use the Citations API with custom-content blocks set to your chunk boundaries so the indices map 1:1 onto your store.
3. Check each quote:
   - Exact `normalized_source.find(normalized_quote)` first.
   - If that fails, use `rapidfuzz.fuzz.partial_ratio` (and `rapidfuzz.process.extractOne` over candidate chunks) with a threshold of about 95 to tolerate OCR or hyphenation noise, and record the matched offsets for highlighting.
   - Below about 90, reject the sentence.
   - Numbers and dates must match exactly after normalization. Fuzzy matching must never accept "₹5,000" vs "₹50,000".
4. Run NLI with (quote ± neighbouring sentence, answer sentence) through MiniCheck/HHEM to confirm the quote actually entails the claim. A verbatim quote can still be cited for the wrong claim.
5. Compute `faithfulness = #sentences(passed quote-check AND NLI ≥ τ) / #sentences`. Show it in the UI, and either abstain or strip unsupported sentences when it is below 1.0.

### Gaps
- I did not retrieve ContextCite's own accuracy numbers or LongCite's exact LongBench-Cite F1 values.
- I found no published accuracy figure for Anthropic's Citations API recall versus prompt-based citing. The current docs page makes no such numeric claim.

---

## 4. Faithfulness / groundedness metrics (RAGAS, TruLens, DeepEval) and LLM-as-judge reliability

### Takeaway
All three frameworks use the same claim-ratio idea, scored by an LLM judge. Off-the-shelf RAGAS faithfulness scored only 66.9% on HaluBench, against about 83–87% for dedicated detectors. Use these frameworks for offline evaluation dashboards, not as the runtime gate.

### Cited Findings
- RAGAS faithfulness is supported claims divided by total claims, with an HHEM variant. — [RAGAS docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)
- RAGAS Faithfulness reaches 66.9% on HaluBench, against Lynx-70B at 87.4% and GPT-4o at 86.5%. — [Lynx paper, arXiv 2407.08488](https://arxiv.org/html/2407.08488v2)
- The AbstentionBench authors rely on a "quality-verified LLM judge", meaning they had to validate the judge first. That is a standard precaution because LLM judges are not reliable by default. — [arXiv 2506.09038](https://arxiv.org/abs/2506.09038v1)
- WikiContradict's automated judge (an open LLM) reached F-score 0.8 against humans. Even a purpose-built judge disagrees with humans about 1 time in 5 on conflict handling. — [WikiContradict, arXiv 2406.13805](https://arxiv.org/html/2406.13805v1)
- **TruLens groundedness** and **DeepEval FaithfulnessMetric** are LLM-judge claim-support ratios similar to RAGAS. TruLens scores each statement in the response against the sources, and DeepEval extracts "truths" from the context and "claims" from the output and counts claims that do not contradict the truths. **[from documentation knowledge, not re-fetched]** — [TruLens docs](https://www.trulens.org/); [DeepEval docs](https://deepeval.com/docs/metrics-faithfulness)

### Inferences
- Known LLM-judge failure modes include self-preference bias (the judge favors its own family's outputs), verbosity bias, sensitivity to prompt wording and run-to-run variance. Mitigations: temperature 0, a judge from a different family than the generator, a binary per-claim verdict rather than a 1–10 score, and agreement with a small human-labelled set.
- DeepEval's "does not contradict" definition is more lenient than "is entailed by". For zero-guessing, require entailment (supported), and treat neutral the same as unsupported.

### Gaps
- I did not fetch TruLens or DeepEval pages this session. I found no published head-to-head numbers for TruLens or DeepEval on HaluBench or LLM-AggreFact.

---

## 5. Abstention / refusal (answerability detection, thresholds, unanswerable benchmarks, stating missing evidence)

### Takeaway
LLMs abstain poorly, and reasoning models do worse. Abstention therefore has to be engineered outside the generator. Gate on retrieval evidence (reranker score plus a CRAG-style evaluator), gate on post-hoc verification (any unsupported claim triggers abstain or a partial answer), and make the refusal explicit about what was looked for and not found.

### Cited Findings
- **AbstentionBench** (Meta FAIR, NeurIPS 2025 D&B) covers 20 datasets: unknown answers, underspecification, false premises, subjective questions and stale information. Across 20 frontier LLMs, it found that reasoning fine-tuning degrades abstention by 24% on average, that scaling helps little, and that a careful system prompt helps but "does not resolve models' fundamental inability to reason about uncertainty". Data is at HF `facebook/AbstentionBench`. **[verified this session]** — [arXiv 2506.09038](https://arxiv.org/abs/2506.09038v1); [GitHub](https://github.com/facebookresearch/AbstentionBench); [NeurIPS proceedings](https://proceedings.neurips.cc/paper_files/paper/2025/hash/fb122bfc3f0127a94ded048b5b03496f-Abstract-Datasets_and_Benchmarks_Track.html)
- CRAG's retrieval evaluator (Correct / Incorrect / Ambiguous) is a learned answerability gate on retrieved documents. **[from paper, not re-fetched]** — [arXiv 2401.15884](https://arxiv.org/abs/2401.15884)
- Self-RAG's [IsSUP] token lets the model mark its own segments as unsupported. **[from paper, not re-fetched]** — [arXiv 2310.11511](https://arxiv.org/abs/2310.11511)

### Inferences (pragmatic abstention policy)
- **Layer 1, retrieval gate:** if the top cross-encoder rerank score is below τ_r (tuned on 20 answerable and 20 unanswerable dev questions), abstain with: "No passage in [corpus/version as of date] addresses X; closest sections were A, B (scores …)".
- **Layer 2, slot coverage:** pull the required slots out of the question (for example: entity = NBFC, attribute = penalty rate, condition = delayed payment, date = as-of). If any slot has no matching evidence, give a partial answer and name the missing slot. This covers the requirement to state what evidence is missing.
- **Layer 3, post-verification:** if any answer sentence fails the quote or NLI check, drop it. If the core claim drops, abstain.
- **Layer 4, conflict gate:** if Section 6 finds unresolved contradictions among in-force sources, do not pick one. Present both with citations and the reason they cannot be reconciled.
- Do not rely on a "say I don't know if unsure" prompt alone. AbstentionBench shows prompting is insufficient.

### Gaps
- I found no published calibration curves for reranker-score thresholds on regulatory corpora. Thresholds must be tuned locally.

---

## 6. Contradiction detection across documents (NLI, tuple extraction, normalization, ContractNLI, knowledge-conflict research)

### Takeaway
LLMs often fail to notice or handle conflicting passages unless explicitly told to look. The reliable route is to extract (subject, attribute, value, unit, condition, effective_date, source) tuples, normalize values, group by (subject, attribute, condition) and compare deterministically. Use NLI "contradiction" only as a secondary signal on candidate pairs.

### Cited Findings
- **WikiContradict** (IBM, NeurIPS 2024 D&B) has 253 human-annotated real Wikipedia contradiction instances, split into explicit and implicit types. Seven LLMs were tested with one passage and with two contradictory passages. Human evaluation found LLMs "often struggle" to answer correctly when the context conflicts. Explicitly prompting the model to attend to contradictions helped. The automated judge reached F 0.8. **[verified this session]** — [arXiv 2406.13805](https://arxiv.org/html/2406.13805v1); [NeurIPS abstract](https://proceedings.neurips.cc/paper_files/paper/2024/hash/c63819755591ea972f8570beffca6b1b-Abstract.html); [HF dataset](https://huggingface.co/datasets/ibm/Wikipedia_contradict_benchmark/raw/main/README.md)
- **MAGIC** (2025) is a multi-hop, graph-based benchmark for inter-context conflicts in RAG. It builds on WikiContradict's explicit/implicit split. **[search snippet]** — [arXiv 2507.21544](https://arxiv.org/pdf/2507.21544)
- **ContractNLI** (Koreeda & Manning, 2021) frames contracts as document-level NLI: for 17 fixed hypotheses per NDA, label entailed, contradicted or not-mentioned, and identify evidence spans. It is a template for "regulation X vs hypothesis Y" checks. **[from paper, not re-fetched]** — [arXiv 2110.01799](https://arxiv.org/abs/2110.01799)
- **ConflictBank** (2024) is a large benchmark of knowledge conflicts (misinformation, temporal and semantic conflicts) between retrieved context and parametric memory, and within contexts. Temporal conflicts, where an old fact is superseded by a newer one, are the closest analogue to amended regulations. **[from paper, not re-fetched]** — [arXiv 2408.12076](https://arxiv.org/abs/2408.12076)

### Inferences (implementation)
- **Extraction:** an LLM with a JSON schema such as `{subject, attribute, value, unit, condition, effective_from, effective_to, doc_id, version, span}`. Validate every extracted value with the quote-check from Section 3.
- **Normalization:**
  - Money and amounts: ₹/Rs./INR, lakh/crore to integers (Indian digit grouping "1,00,000"), percentages ("2 per cent per month" to 0.02/month; convert to annual only explicitly).
  - Dates: `dateparser` with DMY preference for Indian docs, and "w.e.f." mapped to effective_from.
  - Units: `pint`. Number words to digits: `word2number`.
- **Comparison:**
  - Same (subject, attribute, condition) with different normalized values and overlapping validity intervals is a **true conflict**.
  - Non-overlapping intervals mean **supersession, not conflict**. Route those to Section 7.
  - Different conditions mean **no conflict**, but surface the condition.
- Run NLI contradiction (DeBERTa-v3 / MiniCheck) only on tuple pairs that share a subject and attribute, to catch phrasing the tuples missed. Never run it all-pairs over the corpus (O(n²) and noisy).
- Prompting alone ("are there contradictions?") is weak per WikiContradict. If you use an LLM, give it the two candidate passages side by side and ask a targeted question.

### Gaps
- I did not retrieve per-model WikiContradict accuracy tables, ConflictBank numbers or ContractNLI SOTA scores this session.
- I found no benchmark specifically on regulatory inter-document conflict detection.

---

## 7. Amendment chains and temporal validity (EUR-Lex, Akoma Ntoso, legislation.gov.uk, temporal KGs, amendment language, RBI practice)

### Takeaway
Legal publishers treat "what is the law on date D" as a versioning problem. Each provision has dated versions, amendments are first-class events linking source and target, and consolidated texts are derived artifacts that may lag behind. For a hackathon, build a small supersession graph: a `Document` table with `effective_from/to` and `status`, plus `SUPERSEDES / AMENDS(target_para, op, old, new) / WITHDRAWS` edges populated by regex plus LLM parsing of amendment sentences. Answer "as of" queries by filtering to in-force versions before retrieval.

### Cited Findings
- **legislation.gov.uk point-in-time model:** each provision is viewable at a dated version (URLs end in `/YYYY-MM-DD`). Pages state whether there are "outstanding changes not yet made by the editorial team". Unapplied effects appear only in the latest or prospective view, not at a historic point in time. Prospective provisions may depend on commencement orders. This is a concrete example of the consolidated text lagging the amending instruments. **[verified this session]** — [legislation.gov.uk example](https://www.legislation.gov.uk/ukpga/2003/44/part/5/2022-07-01); [example 2](https://legislation.gov.uk/ukpga/2009/25/part/9/2024-01-01)
- **RBI consolidation and repeal practice** **[verified this session via search of RBI pages]**:
  - In late 2025 the RBI Department of Regulation withdrew **9,445 circulars** "with immediate effect", listed in an Annex, after consolidating about 3,500 directions, circulars and guidelines into **238 Master Directions** across 11 types of regulated entities. Taxmann reports 244, which conflicts with the RBI's 238; prefer RBI. — [RBI notification](https://website.rbi.org.in/web/rbi/-/notifications/consolidation-of-regulations-withdrawal-of-circulars); [RBI withdrawal PDF](https://website.rbi.org.in/documents/d/rbi/withdrawalofcirculars-1-); [Taxmann](https://www.taxmann.com/post/blog/rbi-withdraws-9445-circulars-following-consolidation-into-244-master-directions)
  - A **saving clause** states that actions taken or initiated under repealed instructions "shall continue to be governed by the provisions thereof". Repeal is therefore not retroactive, and a question about a past transaction needs the old text. — [RBI withdrawal PDF](https://website.rbi.org.in/documents/d/rbi/withdrawalofcirculars-1-)
  - The existing Master Circulars on a subject "stand withdrawn" when the Master Direction on that subject is issued. — [RBI Master Directions page](https://website.rbi.org.in/kn/web/rbi/notifications/master-directions?delta=100)
  - The Department of Supervision followed with **628 circulars consolidated into 64 Master Directions**, under a notice dated 31 July 2026 titled "Consolidation of Supervisory Instructions – Repeal of Circulars". RBI keeps "Circulars Withdrawn" sections per department. — [RBI press release](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63265); [RBI circular index](https://www.rbi.org.in/scripts/BS_CircularIndexDisplay.aspx?Id=13663)
- **Akoma Ntoso (OASIS LegalDocML):**
  - `<lifecycle>` holds `<eventRef>` dates (generation, amendment, repeal).
  - `<analysis><activeModifications>` (in the amending act) and `<passiveModifications>` (in the amended act) contain `<textualMod type="substitution|insertion|repeal|...">` with `<source href>`, `<destination href="#para_3">`, `<old>` and `<new>`.
  - `<temporalData>` / `<timeInterval start end>` gives each provision version a validity interval.
  - **[from standard knowledge, not re-fetched; the search returned no primary page]** — [OASIS LegalDocML TC](https://www.oasis-open.org/committees/legaldocml/); [akomantoso.org](http://www.akomantoso.org/)
- **EUR-Lex** publishes "consolidated versions" that integrate amendments into the base act. Each version is identified by an ELI or CELEX number with a consolidation date suffix. The texts carry a disclaimer that they are for documentation purposes only, and only the Official Journal is authentic. **[from knowledge, not re-fetched]** — [EUR-Lex consolidated texts help](https://eur-lex.europa.eu/content/help/faq/consolidation.html)

### Inferences (implementation for RBI-style documents)
- **Parse amendment language with regex first, LLM second.** Typical patterns:
  - `supersedes|in supersession of|stands? (hereby )?withdrawn|(is|are) (hereby )?repealed|shall cease to (have effect|apply)` gives a SUPERSEDES/WITHDRAWS edge to a referenced circular number.
  - RBI references look like `RBI/20xx-yy/NNN` and `DOR.XXX.REC.No.NN/..../20xx-yy dated DD Month YYYY`. Regex for `[A-Z]{2,6}(\.[A-Za-z]+)*\.?\s?No\.?\s?[\w./-]+` plus `dated \d{1,2}(st|nd|rd|th)? \w+,? \d{4}`, then resolve against the index.
  - `in (sub-)?paragraph (\S+),? for the words? "(.+?)",? the words? "(.+?)" shall be substituted` maps to AMENDS(op=substitute, target, old, new). Similar patterns exist for `shall be inserted after`, `shall be omitted|deleted`.
  - `with (immediate )?effect from|w\.e\.f\.|shall come into force on` sets effective_from.
- **Data model:** `Provision(doc_id, para_id, text, valid_from, valid_to, status)`. Applying a substitution closes the old version (`valid_to = amend_date - 1`) and opens a new one. When retrieving, filter `valid_from ≤ as_of < valid_to`. Default `as_of = today`, but let the user set it to handle the saving-clause case.
- **Surface the chain in answers:** "Para 3 of MD X (2025) as amended by circular Y (date) — original wording '…' replaced by '…'". This is the "zero-guessing" differentiator, and judges can see it.
- Temporal knowledge graphs (quads with validity intervals) are the general form of this. A Neo4j or SQLite table with interval columns is enough for 36 hours. Do not build full Akoma Ntoso.
- **Failure modes:**
  - Implicit supersession, where a newer rule contradicts an older one without saying so. Catch it with the Section 6 tuple comparison.
  - Partial withdrawal ("except para 5").
  - Circular references by subject title rather than number.
  - Consolidated Master Directions labelled "Updated as on" whose embedded footnotes cite the amending circulars. Parse those footnotes as AMENDS edges.

### Gaps
- I did not open the RBI annex lists or an actual Master Direction to confirm the exact "Repeal and saving" section wording or footnote format.
- The Akoma Ntoso element details and the EUR-Lex disclaimer are from prior knowledge, not primary pages fetched this session.
- I found no open-source parser specifically for Indian regulatory amendment language.

---

## 8. Deterministic calculation (EMI / penalty) via code vs LLM arithmetic

### Takeaway
LLMs are unreliable at multi-digit arithmetic: GPT-4o is under 30% accurate beyond 4×4-digit multiplication, and frontier models still make tokenization-driven addition errors. Every number in an answer should therefore come from executed code with inputs that are quoted and verified from the documents, and the LLM's only job is extracting parameters.

### Cited Findings
- GPT-4o reaches "less than 30% accuracy beyond four-digit by four-digit" multiplication. o1 does much better but is only about 50% accurate at 9×9 digits. Errors come from compounding intermediate steps and from tokenization breaking digit relationships. **[secondary reporting of Deng et al.]** — [TechCrunch](https://techcrunch.com/2024/10/02/why-is-chatgpt-so-bad-at-math)
- A 2026 study finds that all frontier models suffer significantly degraded integer-addition accuracy, with tokenization-related errors as a major contributor. **[search snippet]** — [arXiv 2602.10416](https://www.arxiv.org/pdf/2602.10416)
- "Close enough?" (NeurIPS 2026) analyses about 17k multiplication problems. Errors grow with the number of carry columns and show systematic off-by-one carry failures in high-order digits. **[search snippet]** — [arXiv 2610.38634](https://arxiv.org/pdf/2610.38634); [NeurIPS page](https://neurips.cc/virtual/2026/159205)
- A mechanistic study attributes multiplication difficulty to computing successive carries and caching intermediate results. — [arXiv 2407.15360](https://arxiv.org/abs/2407.15360)

### Inferences (implementation)
- **Flow:**
  1. The LLM extracts `{principal, annual_rate, tenure_months, penalty_rate, penalty_basis, grace_days}`, each with a verbatim quote and the Section 3 check.
  2. A Python function computes the result using `decimal.Decimal` with explicit rounding (`ROUND_HALF_UP` to paise).
  3. The answer shows the formula, the inputs with citations, and the result.
- **EMI** = P·r·(1+r)^n / ((1+r)^n − 1) with r = annual/12/100. Unit-test it against a known bank calculator value.
- **Penalty clauses carry ambiguity:** simple vs compound interest, per-month vs per-annum basis, on the overdue instalment vs the outstanding balance. If the basis is not stated in the quoted text, abstain on that parameter rather than defaulting.
- Never let the LLM restate the computed number in prose without a post-check. Regex all numbers in the final answer and assert each equals either a computed value or a quoted source value. This catches "₹12,345" being rewritten as "₹12,354".

### Gaps
- I found no study quantifying the error reduction from code-interpreter or tool use against direct LLM arithmetic on financial calculations. The search returned none.
- I found no published error rates for LLMs computing EMI or loan amortization specifically.
