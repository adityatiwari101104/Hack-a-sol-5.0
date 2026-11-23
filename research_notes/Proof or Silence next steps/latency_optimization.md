# Latency optimization for the verification-first RAG backend (Proof or Silence)

Scope: cut end-to-end `/ask` latency on a CPU-only Apple-silicon MacBook (machine checked: Apple M4, 16 GB RAM) without loosening any verifier threshold. Grounded in `backend/app/{service,retrieve,verify,privacy,llm,config,api}.py` as of commit 50cd086 plus working-tree edits. Nothing was run against OpenAI. Local package versions (read with `pip show`): fastapi 0.165.0, openai 3.57.0, torch 2.15.0, transformers 5.24.0, sentence-transformers 6.3.0, bm25s 0.3.16, presidio_analyzer 2.2.366, spacy 3.8.18. onnxruntime and optimum are **not installed**.

Code facts that drive the ranking. These were read from the repo, so they carry no web citation:
- `service.ask` is fully sequential: `understand()` (nano plan) → `build_evidence()` → `rule_findings()` → `draft()` (mini) → `run_calcs` → `_verify_all()` → optional repair `draft()` + `_verify_all()`.
- `build_evidence()` calls `retrieve.search()` once per query (up to 4). Each call embeds one query and runs `bm25.retrieve(k=len(rows))` over all 2,312 chunks. It then **embeds every candidate sentence at query time** (`sv = retrieve.embed([... for x in sents])`, each up to 600 chars) and **re-embeds the same queries again** (`qv = retrieve.embed(queries, query=True)`). The candidates are up to 4×8 chunks, plus WITHDRAWS hits, plus ≤6 REFERS_TO hops, so this is likely hundreds of bge-small forward passes per question.
- The WITHDRAWS loop runs `locate(quote, chunk_text)` (fuzzy) over every chunk of the withdrawing doc at query time.
- The SQLite DB has **no indexes** (`.indexes` is empty). Per question, each of the 18 evidence items runs `provision_versions WHERE chunk_id=?` and `value_tuples WHERE chunk_id=?` as full scans. The tables are small (2,313 provision versions).
- `verify.verify_sentence` runs per sentence and serially. HHEM is called with a **single pair** (`nli_model().predict([(premise, hypothesis)])`) on `p[-3000:]` characters. MiniCheck-DeBERTa-v3-Large is called with a single pair at max_length 512. Both sit behind one `RLock`, so they are serialized even if threads are added. LLM judge calls (≤3, nano) are sequential.
- Models load lazily on first use: bge-small, HHEM, MiniCheck, Presidio+spaCy, and the bm25 index build. `api.py` has no startup/lifespan hook, so the first question pays every load. HHEM is loaded with `revision=config.NLI_REVISION` (default `"main"`) and `trust_remote_code=True`.
- `llm.structured` is synchronous `chat.completions.create`, non-streaming, with `reasoning_effort="low"` for both plan and draft. The cache key includes `reasoning_effort` and the prompts, so any change to them invalidates the cassettes.
- The draft repair round appends the feedback at the **end** of the user message, after the identical system prompt, schema and evidence. That ordering is already prefix-cache friendly.
- Static prompt sizes: PLAN_SYSTEM ~455 chars, DRAFT_SYSTEM ~1,583 chars, DRAFT_SCHEMA ~3,077 chars.
- Budget: `eval/spend_ledger.json` = **$2.77 spent of the $3.50 cap** ($4 hard project budget). About $0.73 is left for any experiment that changes prompts or parameters.
- Measured tail without the LLM: `eval/reports/canary.json` (14 questions; that run's ledger delta was ~$0, i.e. mostly cassette replay) shows latency_ms sorted as 939, 1194, 1521 … 7406, 9639, 13501, 14352. p50 is 4.2 s and p95 is 14.4 s **with essentially no live LLM time**. Local compute (embedding, NLI, Presidio, cold loads) is therefore a large share of the tail, not only OpenAI.

---

## 1. Model loading: warm-up, ONNX/CoreML/int8, MPS vs CPU, batching, smaller verifiers

### Takeaway
The cold 30–60 s first question is removed by eager loading plus one dummy forward pass per model in a FastAPI lifespan hook: no accuracy risk, under 1 hour of work. The next-largest local wins are (a) batching all HHEM pairs, then all MiniCheck pairs, into one forward pass each, and (b) ONNX/int8 for the cross-encoders. Smaller verifiers are an accuracy decision, not a free speedup, and need a re-run of the gold set.

### Cited Findings
- HHEM-2.1-Open is built on `google/flan-t5-base`. Its card says it takes "around 1.5 second for a 2k-token input on a modern x86 CPU" and uses "less than 600MB RAM" at fp32. `model.predict(pairs)` accepts a **list** of (premise, hypothesis) pairs, so batching is supported. — [Vectara HHEM model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- HHEM-2.1-Open balanced accuracy: AggreFact-SOTA 76.55%, RAGTruth-Summ 64.42%, RAGTruth-QA 74.28%. On RAGTruth-QA that is roughly on par with GPT-4 (74.11%). — [Vectara HHEM model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- MiniCheck LLM-AggreFact average balanced accuracy (no threshold tuning): RoBERTa-large 72.7, **DeBERTa-v3-large 72.6**, Flan-T5-large 74.7, AlignScore 70.4, GPT-4 75.3, GPT-3.5 69.6. — [MiniCheck paper, arXiv 2404.10774](https://arxiv.org/html/2404.10774v1)
- Inference cost on the 13K test set at $0.8/GPU-hour: RoBERTa $0.20, DeBERTa $0.20, Flan-T5 $0.24, versus GPT-4 API $107. The paper gives no wall-clock CPU numbers. — [MiniCheck paper](https://arxiv.org/html/2404.10774v1)
- The MiniCheck scorer accepts lists (`scorer.score(docs=[doc, doc], claims=[c1, c2])`) and is designed as sentence-level `MiniCheck(document, sentence)`. Flan-T5-Large is 770M and is described as reaching GPT-4 level. Bespoke-MiniCheck-7B is SOTA but needs a GPU (timings were on an A6000) and commercial use requires contacting Bespoke Labs. — [MiniCheck GitHub](https://github.com/Liyan06/MiniCheck)
- LettuceDetect-large (ModernBERT, token-level span detection over context-question-answer) reports 79.22% example-level F1 on RAGTruth, versus GPT-4 63.4% and Luna 65.4%; the base model scores 76.8%. The only throughput figure is 30–60 samples/s on an A100; no CPU benchmark was found. — [LettuceDetect paper](https://arxiv.org/html/2502.17125v1); [model card](https://huggingface.co/KRLabsOrg/lettucedect-large-modernbert-en-v1); search summary of [project docs](https://krlabsorg.github.io/LettuceDetect)
- Sentence Transformers supports `backend="onnx"` and `backend="openvino"`. `export_optimized_onnx_model()` offers O1–O4 (O4 is fp16, which is GPU-oriented). `export_dynamic_quantized_onnx_model()` takes `"arm64"`, `"avx2"`, `"avx512"` or `"avx512_vnni"` configs and needs no calibration data. Decision chart: on CPU with no accuracy loss allowed and a non-Intel CPU, use **ONNX**; with a small loss acceptable, use OpenVINO int8. Quality was reported as a ratio to fp32, but exact CPU speedup numbers are only in charts the fetch could not read. — [Sentence Transformers efficiency docs](https://sbert.net/docs/sentence_transformer/usage/efficiency.html)
- Optimum's ONNX Runtime dynamic int8 on DistilBERT (128 tokens, Intel Ice Lake c6i.xlarge): 56.28 ms down to 27.29 ms average, a 2.48× speedup at p95, keeping 99.72% of fp32 accuracy (92.5% vs 92.24%). — [Phil Schmid, Optimizing Transformers with Optimum](https://www.philschmid.de/optimizing-transformers-with-optimum)
- DeBERTa-v3-base int8 dynamic (Intel Neural Compressor, MRPC): F1 0.9239 vs 0.9223 fp32, with size 705 MB down to 350 MB. Static int8 was slightly worse (0.9185). It loads with Optimum `ORTModelForSequenceClassification`. — [Intel/deberta-v3-base-mrpc-int8-dynamic-inc](https://huggingface.co/Intel/deberta-v3-base-mrpc-int8-dynamic-inc/blob/main/README.md); [static variant](https://huggingface.co/Intel/deberta-v3-base-mrpc-int8-static-inc)
- Optimum's configuration docs note that some graph-fusion options are incompatible with ONNX Runtime quantization. — [Optimum ORT configuration reference](https://huggingface.co/docs/optimum/onnxruntime/package_reference/configuration)

### Inferences
- **Warm-up (rank 1, ~30–60 s saved on the first question, ~0 on later ones; effort under 1 h; accuracy risk none).** Add a FastAPI `lifespan` that calls `retrieve.index()`, `retrieve.model()`, `verify.nli_model()`, a MiniCheck load (split `minicheck()` into a `minicheck_model()` getter), and `privacy._analyzer()`. Then run one dummy `encode` / `predict` / `analyze` so kernels and allocators are warm. Also set `HF_HUB_OFFLINE=1` (or pin `NLI_REVISION` to a commit hash) so `from_pretrained(..., revision="main", trust_remote_code=True)` does not make network round-trips on load. A `/health` field reporting "models_ready" lets the demo wait for warm state. This is standard library behaviour, not benchmarked here.
- **Batch NLI across sentences (rank 3, likely 1–4 s saved on multi-sentence answers; effort 2–3 h; accuracy risk near zero).** Restructure `_verify_all` into phases:
  1. Run the deterministic checks (a)–(d), coverage and lexical for all sentences.
  2. Send every survivor to a single `nli_model().predict([...all pairs...])`.
  3. Send the HHEM failures to one batched MiniCheck forward pass with padding.
  4. Run the remaining LLM judges concurrently.

  Decisions and thresholds stay identical. The only change is the numerical noise from padding (fp32), so confirm verdict equality on the gold/fresh sets in replay mode (no LLM spend). The per-pair cost on CPU is dominated by sequence length (~750 tokens of premise for HHEM at 3,000 chars), so batching saves Python and dispatch overhead and lets torch use all cores well. The gain is real but smaller than N×. Estimate 1.5–3× on the NLI stage; this is a hypothesis to benchmark.
- **Precompute the HHEM/MiniCheck inputs once.** `expand_abbr` runs a regex per glossary term over the full premise for every sentence. Cache the expanded premise per evidence-set key. This is a minor saving.
- **ONNX Runtime for HHEM and MiniCheck-DeBERTa (rank 6, maybe 1.5–2.5× faster NLI if int8, ~1.2–1.5× if fp32-ONNX only; effort 0.5–1 day; risk low to medium).**
  - DeBERTa-v3 ONNX export is supported by Optimum, and int8 dynamic kept F1 on MRPC (cited above).
  - HHEM is a custom `trust_remote_code` T5 classifier (`HHEMv2ForSequenceClassification`), so Optimum export is not turnkey. It probably needs a manual `torch.onnx.export` of the T5 encoder+head, or exporting the underlying flan-t5-base and replicating the head. Treat HHEM ONNX as the riskiest item.
  - int8 shifts scores slightly. Because thresholds are fixed (TAU_ENTAIL 0.5, MiniCheck ≥0.5), a shift can flip borderline sentences **in either direction**. Strictness must be re-validated: fabricated-quote rate is untouched (that is check (c), deterministic), but hallucinated count and pass rate must be re-checked.
  - Recommended order: fp32 ONNX first (bit-close outputs), int8 only if needed.
- **bge-small via `backend="onnx"` (rank 9, small saving; effort ~30 min).** It is mostly moot if sentence embeddings are precomputed (Section 4). Query-time encoding would then be only 4 short queries.
- **CoreML / MPS.** This research found no reliable benchmark for these exact models on M-series. For single-pair, short-sequence inference, MPS dispatch overhead often eats the gain; MPS tends to pay off only when batches are large. Test it after batching is in place (one flag: `model.to("mps")`). CoreML conversion of T5/DeBERTa classifiers is non-trivial and not hackathon-sized. The ONNX Runtime CoreML execution provider is an option, but this research did not verify how many ops it covers for these models.
- **Smaller or different verifiers (accuracy trade-off, not a free win).**
  - MiniCheck-RoBERTa-large has essentially the same LLM-AggreFact BAcc as DeBERTa-v3-large (72.7 vs 72.6), a similar parameter count (~355M vs ~435M), and simpler attention. It is likely somewhat faster on CPU and exports cleanly to ONNX. It is the safest swap if MiniCheck latency matters.
  - Flan-T5-large is more accurate (74.7) but larger (770M), so it is slower and not a latency move.
  - There is no MiniCheck "Flan-T5-small" in the official list. Using a non-official small checkpoint would be unvalidated.
  - LettuceDetect is a different contract (token spans over a whole answer, not a per-sentence entailment score). It would also need re-thresholding and has no CPU numbers. It is not recommended mid-hackathon.
  - Because MiniCheck and the judge can only **pass** sentences that HHEM failed, any second-opinion swap can change the pass set. It must be re-run on gold+fresh before demo. The "0 fabricated quotes" headline is enforced by check (c) before any NLI, so it is unaffected by verifier model choice.
- **Skipping later stages early is already done.** The cascade stops at the first pass. A further safe cut is to skip MiniCheck when HHEM is very low (for example <0.05) and go straight to the judge or BLOCKED. Whether this is *strictness-neutral* depends on whether MiniCheck ever rescued such cases, and it is not neutral if it did. Check the audit logs for "e:minicheck … (hhem 0.0x)" before doing it.

### Gaps
- No published CPU latency numbers were found for HHEM-2.1 on Apple silicon, MiniCheck-DeBERTa-v3-large on CPU, or ONNX/int8 speedups specifically for DeBERTa-v3-large or T5-base on ARM. The sbert benchmark charts were not machine-readable. A 15-minute local micro-benchmark (no OpenAI) is the only way to get these numbers.
- It was not verified whether Optimum can export HHEM's custom remote-code class directly.
- No CPU throughput figure was found for LettuceDetect.

---

## 2. Parallelism: plan ∥ retrieval, async OpenAI, concurrent verification, caching embeddings

### Takeaway
The pipeline is strictly sequential. Overlapping plan with retrieval on the raw question saves on the order of the retrieval time. Running the ≤3 LLM-judge calls concurrently removes up to ~2 judge round-trips from the tail. Precomputing sentence embeddings at ingest is probably the single biggest *local* steady-state win. None of these change any verdict.

### Cited Findings
- OpenAI's latency guide lists "Make fewer requests" (each sequential call adds another wait) and "Parallelize" (run independent lookups at the same time, so the answer waits only for the slower one) among its seven principles. It gives no percentage figures. — [OpenAI latency optimization guide](https://developers.openai.com/api/docs/guides/latency-optimization)
- The guide also says: "Don't default to an LLM". If code already has the answer, skip the model. — [OpenAI latency optimization guide](https://developers.openai.com/api/docs/guides/latency-optimization)

### Inferences
- **Precompute sentence embeddings at ingest (rank 2; likely the largest steady-state local saving, plausibly 0.5–2 s per question depending on candidate count; effort 2–3 h; accuracy risk none if inputs are byte-identical).**
  - `build_evidence` encodes `f"{context} {sentence}"[-600:]` for every sentence of every candidate chunk on every question.
  - `split_sentences(row["text"])` and `row["context"]` are deterministic per chunk. Compute them once in ingest or in `retrieve.index()`, store a `(chunk_id, s, e) → row` map plus an `npy` matrix keyed by the same corpus signature `sig`, and do a lookup plus slice at query time.
  - The hidden-text filter (`words_json` `h` flag) is also per-chunk deterministic and can be precomputed.
  - Keep exactly the same input string, so cosine scores, picks and the TAU_RETRIEVAL gate are identical.
- **Embed all queries once (small, ~20–60 ms).** Today each `search()` encodes its own expanded query, and `build_evidence` re-encodes the raw queries. Batch-encode both lists in one `encode` call at the start and pass the vectors in.
- **Overlap the plan call with retrieval (rank 5, saves ~min(plan latency, retrieval time), likely 0.3–1 s; effort 1–2 h; risk none).** Start `retrieve.search(question)` and `search(expand_query(question))` in a thread while the nano plan is in flight. In current code `english_question` is usually the question itself for English input. When the plan returns, run only the `sub_queries` searches and merge.
  - For Hindi input (`lang="hi"`) the speculative raw-question search is wasted but harmless.
  - The retrieval set is identical if you still include `plan["english_question"]`, because it is searched as before. It would just be a cache hit when it equals the raw question.
- **Concurrent LLM judges (rank 4 for tail latency; saves up to 2 × judge latency, roughly 1–4 s on the worst cases; effort 1–2 h; risk none).**
  - Phase the verifier as described in Section 1, then submit the ≤3 judge calls to a `ThreadPoolExecutor` (the OpenAI sync client is thread-safe for concurrent requests) or use `AsyncOpenAI`.
  - Caveat: `_judge_budget` is a `contextvars.ContextVar` decremented inside `verify_sentence`. Worker threads do not inherit or propagate it, so pick the ≤3 judge candidates in the main thread (same order as today) before dispatching.
  - Judge cassettes are keyed by request, so replay still works.
- **Run deterministic checks in parallel?** Not worth it. They are microseconds to milliseconds (rapidfuzz, regex), and the GIL would serialize them anyway.
- **Async OpenAI end-to-end.** `/ask` is a sync `def`, so FastAPI runs it in its threadpool, which is fine for a single-user demo. Converting to `AsyncOpenAI` only matters for concurrency across users, or for running judge calls concurrently without threads. It is not a single-request latency win by itself.
- **Query-embedding cache.** An LRU keyed on the query string helps only for repeated demo questions, where the whole answer is already cassette-cached. Low value.
- **Presidio.** It analyzes 18 evidence texts one by one and re-analyzes the same texts in the repair draft. Memoize `_spans(text)` with `functools.lru_cache` (evidence text is deterministic per chunk sentence), or precompute redaction at ingest, because the corpus is public regulatory text plus synthetic bank docs. This is likely a 100–500 ms saving with zero risk. It is not benchmarked; spaCy `en_core_web_sm` NER per short text is fast, but 18–36 calls add up.

### Gaps
- There is no per-stage timing breakdown in the repo (only total `latency_ms`). Add `time.perf_counter()` spans per stage to the result's `trace` before choosing between items 2–6. Without it, the savings estimates above are reasoned from code structure, not measured.

---

## 3. LLM side: reasoning effort, predicted outputs, streaming structured outputs, prompt caching, Priority/Flex, skipping the plan call

### Takeaway
The cheapest safe LLM-side levers are: keep the stable-prefix layout so prompt caching hits (especially on the repair call); stream the draft's structured output so verification overlaps generation; and test a lower `reasoning_effort` on the plan and judge calls. Predicted Outputs do not apply to gpt-5.4 models. Flex is slower. Priority ("Fast mode") is faster but costs ~2× with only ~$0.73 of budget left.

### Cited Findings
- **Output tokens and reasoning.** "Generate fewer tokens": shorter visible output, a lower reasoning effort and tighter structured output all help. `max_output_tokens` caps reasoning plus visible output, so a low cap can truncate. — [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)
- **Input tokens** mainly affect TTFT: "A long prompt can delay the first token". Keep prefixes stable for caching and compare TTFT with and without cache hits via `cached_tokens`. — [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)
- **Reasoning effort.** Values listed are `none`, `minimal`, `low`, `medium`, `high`, `xhigh` and `max`. "Some models support only a subset", so check the model page. Lower effort favours speed and fewer tokens. For latency-sensitive gpt-5.5 workloads the guide suggests starting at `low` and moving to `none` only if needed. The page does **not** list supported values for gpt-5.4-mini or gpt-5.4-nano. — [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- **Prompt caching.**
  - It is automatic and prefix-based. Tool definitions and structured-output settings are part of the cacheable prefix, so changing the schema breaks reuse.
  - The minimum is 1,024 tokens for GPT-5.6+; earlier models "vary with request settings". On older models `cached_tokens` is reported in multiples of 128.
  - Cached input is discounted up to 95%. The guide says caching reduces input-processing time before the response starts but gives **no latency percentage**.
  - In-memory retention is typically 5–10 minutes of inactivity, up to 1 hour. Organizations without ZDR default to 24h extended retention.
  - `prompt_cache_key` helps routing on pre-5.6 models (~15 requests per minute per key).
  - Source: [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)
- **Predicted Outputs** are supported only on GPT-4o, GPT-4o mini, GPT-4.1, GPT-4.1 mini and GPT-4.1 nano. They are not supported with `tools`, `n>1`, logprobs or `max_completion_tokens`, and rejected prediction tokens are billed. — [OpenAI predicted outputs guide](https://developers.openai.com/api/docs/guides/predicted-outputs)
- **Priority processing** is now "Fast mode": `service_tier="priority"`/`"fast"`. It claims "up to 2.5× faster than Standard" with more consistent latency, at a per-token premium (2× standard in the GPT-5.6 Sol example). Rapid traffic ramps can downgrade requests to standard. — [OpenAI priority processing guide](https://developers.openai.com/api/docs/guides/priority-processing)
- **Flex processing** trades "slower response times and occasional resource unavailability" (429s) for Batch-API pricing, and timeouts are more likely. It is being wound down as a beta. — [OpenAI flex processing guide](https://developers.openai.com/api/docs/guides/flex-processing)
- **Streaming.** `stream: true` lets users start reading before generation ends. For longer tasks, show progress. — [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)

### Inferences
- **Stream the draft and verify sentences as they complete (rank 7 for total latency, rank 1 for perceived latency; saves roughly "verify time" from the critical path plus most of the generation wait for the first verified sentence; effort 0.5–1 day; risk none to strictness if the UI never shows unverified text).**
  - The draft schema is `{"sentences": [{text, cites, type, core…}], "calc_requests": [...], "missing": [...]}`. With `stream=True` and `json_schema` strict, the content arrives as incremental JSON. Run an incremental JSON parser (or the SDK's `.stream()` helper's partial-parse events) and hand each completed `sentences[i]` object to the verifier while the model keeps generating.
  - Caveats:
    - `calc_requests` come **after** `sentences` in the schema, and `fill_calc` needs the calc cards. Calc-type sentences must therefore wait for the end; moving `calc_requests` first in the schema would change the cassette key and the output distribution.
    - Outcome gating (ANSWER/PARTIAL/ABSTAIN, repair decision) still happens at the end.
    - Cassette replay needs a non-streaming path, so keep both.
- **Lower `reasoning_effort` for plan (nano) and judge (nano) (rank 8; potentially hundreds of ms to ~1 s per call if reasoning tokens are a meaningful share; effort trivial, but it costs budget to re-eval; risk: plan quality and judge strictness).**
  - The judge is the one place where lower effort could make the verifier *more lenient or more erratic*, because it can PASS a sentence. Keep the judge at `low` unless a re-eval shows identical or stricter verdicts.
  - The plan is safer to lower: its errors mostly cause abstention or retrieval misses, not fabrications.
  - Check that gpt-5.4-nano accepts `minimal`/`none`. The code already retries without `reasoning_effort` on a "reasoning" error, but that retry adds a round-trip, so verify once.
  - Each change invalidates cassettes. Re-running the 33+34+14 eval questions at ~$0.03–0.15 per run (see `eval_runs.csv`) fits in the remaining ~$0.73, but not many times.
- **Prompt caching (rank 10; free; small TTFT gain).**
  - Keep `DRAFT_SYSTEM` + schema byte-stable at the front. The variable question and case should go **after** stable content. Today the user message starts with `Question: …`, so the cacheable prefix is system + schema only (~1.2k tokens estimated from character counts: 1,583 + 3,077 chars). That may or may not cross the model's minimum.
  - The repair call already shares system + schema + question + evidence and appends feedback last, so it should get a large cache hit. Verify via `usage.prompt_tokens_details.cached_tokens` (log it in `llm._record`).
  - Moving rule findings and evidence before the question would *not* help across different questions, because evidence differs.
- **Shorter outputs (rank 11; proportional to output tokens; risk to completeness).** Cap the sentences array (`maxItems`, e.g. 6) and the `reason`/`missing` lengths. The judge's `reason` field is free text; a short enum-plus-≤15-word reason cuts output tokens. This changes cassette keys and needs a re-eval.
- **Skip the plan call (rank 12; saves one nano round-trip, ~0.5–1.5 s; effort 1+ day; accuracy risk medium).**
  - The plan supplies `case` slots (rate_type, borrower, purpose, facility, amount, sanction_date), `subjects`, `sub_queries`, `lang` and `premises`. These feed `applicability.evaluate` and `rule_findings`, which are core to correctness.
  - A rules/regex fallback for English questions with UI-provided `slots` is possible: the `/ask` API already accepts `slots`, and the UI could collect them as form fields. That removes the plan dependency only when slots are complete.
  - The safer variant is "draft while retrieving" in reverse: overlap the plan with retrieval (Section 2) instead of removing it.
  - Speculatively starting the *draft* before the plan returns is not viable, because the draft needs plan-dependent evidence and rule findings.
- **Merge plan + judge calls?** No. They are at different stages.
- **Priority/Fast mode (optional, demo-only).** Up to 2.5× faster LLM legs (from the guide), at ~2× token price. Given the ~$0.73 remainder, enable it per request via an env flag only during the live demo. The guide does not say whether gpt-5.4 mini/nano are eligible, so verify on the models page.
- **Do not use Flex** (slower and 429-prone). **Predicted Outputs do not apply** to gpt-5.4 models or to structured JSON drafts.

### Gaps
- No public TTFT or tokens-per-second numbers were found for gpt-5.4-mini or gpt-5.4-nano. The OpenAI guides give no quantitative latency figures for caching, reasoning effort or model size. Measure locally from `resp.usage` (reasoning tokens) and wall-clock time, or from existing cassettes, which store usage but not timing.
- Supported `reasoning_effort` values for gpt-5.4-mini and gpt-5.4-nano were not confirmed from a primary source.
- It was not confirmed whether the 1,024-token caching minimum applies to gpt-5.4 models (the guide says earlier models vary).

---

## 4. Retrieval: bm25s, FAISS/hnswlib, top-200 depth, SQLite costs

### Takeaway
At 2,312 chunks, brute-force numpy dense search and bm25s are already sub-10 ms operations, so FAISS/hnswlib or cutting top-200 buys nothing measurable and risks recall. The retrieval-stage cost is in per-question sentence embedding, the WITHDRAWS fuzzy scan and unindexed SQLite lookups. All three are fixable without changing results.

### Cited Findings
- The OpenAI guide's "Don't default to an LLM" and "Parallelize" principles apply equally to deterministic pre-computation (compute once, reuse). — [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)
- No external benchmark was needed for the conclusion about corpus scale. The numbers come from the repo: `SELECT count(*) FROM chunks` = 2,312, bge-small has 384 dimensions, and `.indexes` returns none.

### Inferences
- **Dense search.** `emb @ qv` is a 2,312×384 matrix-vector product, well under a millisecond. FAISS or hnswlib only pays off at hundreds of thousands to millions of vectors. Not recommended.
- **bm25s.** `retrieve(k=len(rows))` returns a full ranking. Set `k=200`, since only the top 200 are used, for a trivial saving with identical results. Cutting RRF depth below 200 saves nothing measurable and could drop recall for the 4-query union. Not recommended.
- **Embedding the query 4×, plus 4× again.** Covered in Section 2 (batch once).
- **SQLite (rank 13; tens of ms; effort 10 min; risk none).** Add indexes:
  - `CREATE INDEX ON provision_versions(chunk_id)`
  - `CREATE INDEX ON value_tuples(chunk_id, verified)`
  - `CREATE INDEX ON edges(type, dst)`
  - `CREATE INDEX ON edges(type, src)`
  - `CREATE INDEX ON chunks(doc_id)`

  Also load `glossary` and `documents` once per process instead of per `ask`.
- **WITHDRAWS fuzzy scan (rank 14; variable).** For each candidate doc with WITHDRAWS edges, `locate()` runs over every chunk of the withdrawing document. Precompute the hit chunk_id per edge at ingest; the edges are static.
- **Optional reranker.** `RERANK` (bge-reranker-base over 30 pairs) is off by default. Keep it off for latency unless it measurably improves the gold set.

### Gaps
- There are no stage timings to confirm how many sentences `build_evidence` embeds per question on average. Log `len(sents)` per question to size the Section 2 win precisely.

---

## 5. Perceived latency: SSE streaming of verified sentences, stage progress events

### Takeaway
FastAPI 0.165 (installed) has native SSE via `fastapi.sse.EventSourceResponse` (added in 0.135.0). A `/ask/stream` endpoint can emit stage events (planning → retrieving → evidence ready with the 18 citations → drafting → sentence i verified/blocked → final outcome). That cuts perceived wait to roughly the plan+retrieval time (~1–2 s warm) while keeping "verify-before-show".

### Cited Findings
- FastAPI supports SSE through `EventSourceResponse` (`from fastapi.sse import EventSourceResponse, ServerSentEvent`), added in **FastAPI 0.135.0**. Path operations `yield` items (Pydantic-serialized into `data:`). `ServerSentEvent(data=..., event=..., id=..., retry=...)` sets fields explicitly. Sync `def` generators are supported "so that it doesn't block the event loop". — [FastAPI SSE tutorial](https://fastapi.tiangolo.com/tutorial/server-sent-events/)
- OpenAI recommends streaming so users read before generation ends, buffering when output needs checking first, and showing progress for longer tasks. — [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization)

### Inferences
- **Design (rank 1 for perceived latency; effort 0.5 day including the UI; no strictness risk).**
  - Refactor `service.ask` into a generator `ask_events()` that yields `{"event": "stage", ...}` at each step and `{"event": "sentence", verdict, citations}` only **after** `verify_sentence` returns PASS or CONTESTED.
  - Blocked sentences are emitted as `blocked` events, matching the current "blocked" panel. They are never shown as answer text.
  - The final `{"event": "result", ...}` is exactly today's JSON, so `/ask` stays as is: it consumes the generator and returns the last event, and eval and cassettes are unaffected.
- **Strictness hazards to keep explicit.**
  - The final outcome (ANSWER/PARTIAL/ABSTAIN/CONFLICT) is decided only at the end. A sentence that passes can still end up under an ABSTAIN, for example when all core sentences are refusals or gaps exist. The UI should label streamed sentences "verified, answer pending" until the result event arrives.
  - If the repair round runs, attempt-1 passes are discarded when attempt 2 yields a core sentence (`shown, blocked = s2, ...`). Streaming must either hold attempt-1 sentences until the repair decision, or emit a `retract` event. Holding is simpler and safer.
  - Calc-type sentences need `cards` (after the full draft), so they arrive last.
- **Early "evidence ready" event.** The citation cards (doc, page, bbox) are known before drafting. Showing them while the LLM drafts gives the user something real to read within ~1–2 s, and it showcases the system's "proof" side.

### Gaps
- It was not verified whether the existing frontend (if any) can consume SSE (`EventSource` is GET-only; POST bodies need `fetch` with a ReadableStream).

---

## 6. Ranked list (objective): expected savings, effort, accuracy risk

### Takeaway
Do items 1–5 first. They are low-effort, strictness-neutral, need no OpenAI spend, and together should remove the 30–60 s cold start and plausibly several seconds from the p95 tail. They also make the warm p50 *feel* like ~1–2 s through streaming. Items 6+ need measurement or an eval re-run.

### Cited Findings
- Supporting evidence for each item is cited in Sections 1–5 above: [HHEM card](https://huggingface.co/vectara/hallucination_evaluation_model), [MiniCheck paper](https://arxiv.org/html/2404.10774v1), [sbert efficiency](https://sbert.net/docs/sentence_transformer/usage/efficiency.html), [Optimum int8 blog](https://www.philschmid.de/optimizing-transformers-with-optimum), [OpenAI latency guide](https://developers.openai.com/api/docs/guides/latency-optimization), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [priority](https://developers.openai.com/api/docs/guides/priority-processing), [flex](https://developers.openai.com/api/docs/guides/flex-processing), [predicted outputs](https://developers.openai.com/api/docs/guides/predicted-outputs), [FastAPI SSE](https://fastapi.tiangolo.com/tutorial/server-sent-events/).

### Inferences
All savings below are engineering estimates from code structure, not measurements. Add per-stage timers first: 15 minutes, which turns every estimate into a number.

| # | Change | Expected saving | Effort | Accuracy/strictness risk | OpenAI spend |
|---|---|---|---|---|---|
| 0 | Per-stage `perf_counter` timings in `trace` | none (enables everything) | 15 min | none | none |
| 1 | Lifespan warm-up of bge, HHEM, MiniCheck, Presidio/spaCy, bm25 index + dummy forward; `HF_HUB_OFFLINE=1`, pin HHEM revision | **30–60 s on the first question**; removes cold outliers from p95 | <1 h | none | none |
| 2 | Precompute sentence embeddings (and hidden-text filter) at ingest/index time; batch-embed queries once | likely **0.5–2 s/question** (hundreds of bge forwards removed) | 2–3 h | none (byte-identical inputs) | none |
| 3 | Phase `_verify_all`: deterministic checks for all → one batched HHEM call → one batched MiniCheck call | likely **1–3 s** on 4–8 sentence answers | 2–3 h | ~none (padding numerics; confirm identical verdicts in replay) | none |
| 4 | Run ≤3 LLM-judge calls concurrently (pick candidates in the main thread; contextvar caveat) | **up to ~2 judge round-trips (~1–4 s)** on tail cases | 1–2 h | none | none (cassettes reused) |
| 5 | SSE `/ask/stream` with stage + per-verified-sentence events (verify-before-show; hold attempt-1 until the repair decision) | perceived wait drops to ~plan+retrieval (~1–2 s warm) | 0.5 day | none if the UI labels pending outcome | none |
| 6 | Overlap the nano plan with retrieval on the raw question | ~0.3–1 s | 1–2 h | none | none |
| 7 | Stream the draft's structured output and verify sentences while it generates | ~verify time off the critical path (≈1–2 s) | 0.5–1 day | none (calc sentences wait; gating unchanged) | none (needs a non-stream replay path) |
| 8 | Memoize/precompute Presidio spans per evidence text; SQLite indexes; cache glossary/documents; precompute WITHDRAWS hits; `bm25 k=200` | ~0.1–0.5 s combined | 1 h | none | none |
| 9 | ONNX Runtime fp32 for MiniCheck-DeBERTa (Optimum) and bge-small (`backend="onnx"`) | ~1.2–1.5× on those stages (unverified on M4) | 2–4 h | very low (verify verdict equality) | none |
| 10 | int8 dynamic quantization (`arm64` config) for MiniCheck / bge | ~2× on those stages (DistilBERT reference 2.48× p95) | +2 h | **low–medium**: borderline verdicts can flip; re-run gold+fresh | none |
| 11 | HHEM ONNX export (custom remote code) | similar to #9/#10 on the biggest NLI cost | 0.5–1 day | medium (export fidelity) | none |
| 12 | Lower `reasoning_effort` on the **plan** call (`minimal`/`none` if gpt-5.4-nano accepts it) | ~0.2–1 s (unquantified) | trivial + eval | low–medium (plan quality → retrieval/applicability) | re-eval ~$0.05–0.15 |
| 13 | Shorter outputs: `maxItems` on sentences, terse judge reason | proportional to output tokens | 1 h + eval | low (completeness) | re-eval |
| 14 | MPS for the NLI models after batching | unknown; may be slower for small batches | 30 min to test | none | none |
| 15 | Swap MiniCheck-DeBERTa → MiniCheck-RoBERTa-large (same BAcc 72.7 vs 72.6) | modest | 1 h + eval | **medium**: changes the rescue set | none |
| 16 | Priority/Fast mode for draft (demo only) | up to 2.5× on LLM legs (OpenAI claim) | trivial | none | **~2× price**; ~$0.73 left |
| 17 | Skip the plan call (UI slots + rules) | ~0.5–1.5 s | 1+ day | **medium–high** | re-eval |
| ✗ | FAISS/hnswlib, cutting RRF top-200, Flex processing, Predicted Outputs, LettuceDetect swap, Bespoke-MiniCheck-7B on CPU | none / negative / not applicable | — | — | — |

- **The headline is protected.** "0 fabricated quotes" is enforced by deterministic check (c) (`located`) before any model. None of items 1–9 touch it. Items 10, 11, 12 and 15 can change *hallucinated/pass* counts, so gate them on a replay-mode re-run of gold (33/79), fresh (34) and canary (14) with an unchanged or lower hallucinated count.
- **The tail (18–45 s) is probably cold loads plus the repair round plus sequential judges.** Items 1, 3, 4 and 7 target exactly those. If the repair round is a frequent tail driver, the per-stage timers will show it. Its own latency then shrinks via the prefix cache hit (repair shares the whole prefix) and items 3 and 4.

### Gaps
- No measured per-stage breakdown exists yet. All savings figures are engineering estimates and should be replaced with timer output before they are quoted in a deck.
- No primary-source latency numbers were found for gpt-5.4-mini/nano TTFT, for prompt-cache TTFT reduction, or for CPU/ARM inference of HHEM and MiniCheck.
