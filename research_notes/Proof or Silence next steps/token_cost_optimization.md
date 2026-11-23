# Token and cost optimization for the Proof-or-Silence verification-first RAG backend

Method note: "repo" findings were measured locally on 2026-11-23 without any OpenAI call. Token counts come from
`eval/cassettes/*/*.json` (3,761 cached responses with `usage`), `eval/spend_ledger.json`, `eval/reports/*.json`, and
an offline replay (LLM_MODE=replay, cassette hits only, $0 spend) that rebuilt the actual draft prompts for 34 fresh-test
questions and evidence packs for 114 fresh/dev/test questions. Tokenizer: tiktoken `o200k_base` (GPT-4o/5 family encoding),
installed into the scratchpad only. Unless noted, $ figures use OpenAI list prices **without** the 20% safety margin
that `config.PRICES` adds (so they are ~1/1.2 of the ledger's "upper bound" numbers). µ$ = millionths of a dollar.

## 1. Measure: tokens in/out per call type, and which calls dominate

### Takeaway
At list prices a question costs about **$0.0045** (ledger upper bound $0.0053 with the 20% margin). The mini **draft call
is ~80% of per-question cost** (~90% including the repair retry). About **43% of draft cost is output tokens, and almost
half of those output tokens (~165 of 346) are hidden reasoning** caused by `reasoning_effort="low"`. Inside the draft prompt, the
actual evidence sentences are only ~25% of tokens. Per-sentence document tags (~22%), repeated context prefixes (~13%),
and the system prompt plus schema (~26%) make up much of the rest.

### Cited Findings
- Cassette totals by call type (calls / mean input / mean output tokens): `draft_answer` (gpt-5.4-mini) 374 / 2,751 / 346
  (median in 2,788, max 3,675); `query_plan` (nano) 149 / 429 / 166; `claim_judge` (nano) 110 / 350 / 191; `value_tuples`
  (nano, ingest) 961 / 914 / 149; `chunk_prefix` (nano, ingest) 1,916 / 213 / 60; `tuple_check` (mini, ingest) 141 / 320 / 116;
  `baseline_answer` (mini, naive-RAG baseline) 70 / 580 / 324 — [repo: eval/cassettes](file:///Users/gaurav/Hack-a-sol-5.0/eval/cassettes)
- Hidden reasoning share of completion tokens, estimated as completion_tokens minus o200k tokens of the returned JSON: draft
  ~165 of 346 (48%); judge ~88 of 191 (46%); tuple_check ~66 of 116 (57%); value_tuples ~49 of 149 (33%); query_plan ~34 of
  166 (20%); chunk_prefix ~7 of 60 (12%) — [repo: eval/cassettes](file:///Users/gaurav/Hack-a-sol-5.0/eval/cassettes). `llm.structured()` defaults to `reasoning_effort="low"` for every call — [repo: backend/app/llm.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/llm.py)
- Per-call cost at list prices (mini $0.75/$4.50, nano $0.20/$1.25 per 1M): draft ≈ 2,751×0.75 + 346×4.50 = 2,063 + 1,557 ≈
  **3,620 µ$**; plan ≈ 86 + 208 ≈ **293 µ$** (71% of it output); judge ≈ 70 + 239 ≈ **309 µ$** per call (77% output) —
  computed from cassette means and [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Per-question mix (estimated): 1 plan + 1 draft + a repair draft in ~10–15% of questions (fresh run: 3/34 rows have
  draft_total 5–6 sentences, which is only possible after a merge with attempt 2; 11/34 rows had ≥1 blocked sentence) + judge
  calls, capped at 3 per answer (`_judge_budget`) and only reached when HHEM and MiniCheck both fail — [repo: eval/reports/fresh.json](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports/fresh.json), [repo: backend/app/verify.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/verify.py)
- Bottom-up estimate: 293 (plan) + 3,620 (draft) + 0.12×~3,750 (retry) + ~0.4×309 (judge) ≈ **4,490 µ$ ≈ $0.0045/question**.
  Measured ledger upper bounds (including the 20% margin): fresh 34 q $0.1794 → $0.00528/q; test 30 q $0.1575 → $0.00525/q; dev 50 q $0.2801 → $0.0056/q. Dividing by 1.2 gives $0.0044–0.0047, which matches —
  [repo: eval/reports/eval_runs.csv](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports/eval_runs.csv)
- Draft prompt anatomy, rebuilt offline for 34 fresh questions (user message mean 1,974 tokens, max 2,944): header/question
  73; rule findings 226 (median 100, max 739); evidence tags `[title, para, page, status, applicability]` **613**; `[context: …]`
  prefixes **361**, of which **181 are exact duplicates** (same chunk's context repeated for each of its up to 3 sentences);
  evidence sentence text only **687**; mean 17 evidence items (cap 18). Static part: DRAFT_SYSTEM 352 tokens + DRAFT_SCHEMA
  345 tokens as raw JSON (the API's internal schema rendering may be smaller; the smallest observed draft prompt is 1,486) —
  [repo: backend/app/service.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py) (replay measurement)
- Static prompt sizes (o200k, raw JSON schema): plan system 91 + schema 447; judge 70 + 61; prefix 41 + 43; tuple
  extraction 366 + 704; tuple_check 120 + 135. Smallest observed prompts: plan 409, value_tuples 701, chunk_prefix 126 —
  [repo: backend/app](file:///Users/gaurav/Hack-a-sol-5.0/backend/app)
- Ingestion LLM cost for the current corpus (22 docs, 360 pages, 2,312 chunks, 228 value tuples), using list prices on
  cassette totals: value_tuples 877,937 in / 143,634 out ≈ **$0.356**; chunk_prefix 408,288 / 114,646 ≈ **$0.225** (64% output);
  tuple_check 45,063 / 16,287 ≈ **$0.107** → **≈$0.69 total ≈ $0.031/doc ≈ $0.0019/page ≈ $0.0003/chunk**. Cassettes may
  contain a few re-runs after prompt edits, so this is an upper bound — [repo: backend/data/aiml02.sqlite + eval/cassettes](file:///Users/gaurav/Hack-a-sol-5.0/backend/data)
- Ledger: $2.77 over 3,771 calls; it "starts with the 2026-11-23 spike (conservative estimate)" — [repo: eval/spend_ledger.json](file:///Users/gaurav/Hack-a-sol-5.0/eval/spend_ledger.json)
- Accounting bug/gap: `_record()` bills every `prompt_tokens` at the full input rate and never reads
  `prompt_tokens_details.cached_tokens` or reasoning-token details. Cassettes store only `prompt_tokens`/`completion_tokens`.
  As a result, any automatic cache hits OpenAI already gave (for example on the repair retry, whose prompt starts with the
  first draft's ~2.7k-token prompt) are invisible, and cost is overstated — [repo: backend/app/llm.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/llm.py); OpenAI reports cache hits in `cached_tokens`, "rounded down to a multiple of 128" for pre-5.6 models — [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching); reasoning tokens "are billed as [output tokens]" and reported under `output_tokens_details.reasoning_tokens` — [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)

### Inferences
- Draft output is the biggest single line item: 346 tokens × $4.50/M ≈ 1,557 µ$, about 35% of a whole question. Removing
  hidden reasoning there is worth more than every other per-question optimization except a cheaper draft model.
- The judge is a minor cost (~3%) because it runs rarely. The plan is ~6.5%.
- The 20% margin plus ignored cache hits mean the "$0.005/question" figure is a conservative upper bound. This is honest to
  present, but a per-call-type ledger would let you show the true number.

### Gaps
- Exact retry and judge frequency per question isn't logged (traces store verdicts without `checks`; cassettes do not store
  input). The 12% retry and 0.4 judge/question figures are estimates. Logging `attempt` and `e:llm-judge` counts per query
  would pin them down at $0.
- The exact token count OpenAI charges for the strict JSON schema isn't public; raw-JSON counts above are an upper proxy.

## 2. Current OpenAI pricing (Nov 2026) for gpt-5.4 / mini / nano, caching, batch, flex

### Takeaway
gpt-5.4-mini is $0.75 in / $0.075 cached / $4.50 out per 1M, and gpt-5.4-nano is $0.20 / $0.02 / $1.25. Cached input is 90% off. **Batch and Flex
are both exactly 50% off**, and Batch has its own cached rate, so the discounts stack. Both gpt-5.4 small models
**default to `reasoning_effort: none`**. The code sets "low" explicitly, so it pays for reasoning it may not need.

### Cited Findings
- Standard per 1M tokens (input / cached / output): gpt-5.4 $2.50 / $0.25 / $15.00; gpt-5.4-mini $0.75 / $0.075 / $4.50;
  gpt-5.4-nano $0.20 / $0.02 / $1.25; gpt-5.5 $5.00 / $0.50 / $30.00 — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Batch: gpt-5.4-mini $0.375 / $0.0375 / $2.25; gpt-5.4-nano $0.10 / $0.01 / $0.625; gpt-5.4 $1.25 / $0.13 / $7.50. Flex
  rows are identical to Batch for these models. "Fast (formerly Priority)" is 2× standard (mini $1.50/$9.00) — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Regional processing (data residency) endpoints carry a 10% uplift "for models released on or after March 5, 2026". This is
  relevant if an Indian bank requires in-region processing — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Batch: "50% cost discount compared to synchronous APIs", completes "within 24 hours", up to 50,000 requests and 200 MB per
  batch, supports `/v1/chat/completions` and `/v1/responses` — [OpenAI Batch guide](https://developers.openai.com/api/docs/guides/batch)
- Flex: "Tokens are priced at Batch API rates, with additional discounts from prompt caching". It trades slower responses and
  occasional unavailability; a 429 "Resource Unavailable" is not charged, and you can retry or fall back with `service_tier` "auto" — [OpenAI Flex guide](https://developers.openai.com/api/docs/guides/flex-processing)
- gpt-5.4-mini: reasoning effort "none (default), low, medium, high and xhigh" (no "minimal"); 400k context, 272k max input;
  snapshot `gpt-5.4-mini-2026-03-17`; structured outputs, prompt caching and Batch supported — [OpenAI model page: gpt-5.4-mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
- gpt-5.4-nano: the same effort levels, default none; **status listed as "Deprecated"** — [OpenAI model page: gpt-5.4-nano](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- Prompt caching (pre-GPT-5.6 models such as gpt-5.4): the minimum cacheable length "varies with request settings such as tools,
  images, output schemas, reasoning effort, and verbosity". Implicit breakpoints sit at "regular, model-dependent intervals".
  Retention is `in_memory` (~5–10 min idle, up to 1 h) or `24h`, and orgs without ZDR default to `24h`. `prompt_cache_key` helps
  routing (aim for ~15 requests/min per key). Changing `text.format` schemas or reasoning effort "can alter the prefix and
  reduce reuse". Best practice is to put stable instructions and reference material first and dynamic content last. For GPT-5.6+
  the stated minimum is 1,024 tokens, with reads at 0.1× and paid cache writes — [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

### Inferences
- `config.PRICES` matches list prices ×1.2, so the ledger is correct as an upper bound.
- Because gpt-5.4-nano is marked Deprecated, a bank-scale cost slide should say "nano-class model" and show a fallback
  (gpt-5.4-mini on Batch/Flex costs $0.375/$2.25, still cheap for ingestion).
- Changing `reasoning_effort` changes the cassette key (it is in the hashed request), so any reasoning change invalidates
  cassettes and needs paid re-runs.

### Gaps
- The exact minimum cacheable prefix for gpt-5.4-mini/nano isn't published (it "varies"). One live call, logging
  `usage.prompt_tokens_details.cached_tokens` on a repeated ~1.1k-token prefix (~$0.001), would settle it.
- Whether Flex is enabled for the gpt-5.4 family isn't stated on the model pages, though the pricing page lists Flex rows for them.

## 3. Quantified optimizations per call type (savings and accuracy risk)

### Takeaway
Three groups of changes. A **zero-accuracy-risk package** (evidence formatting, cache-friendly retry, accurate ledger,
trimmed plan output, Flex for eval runs) cuts per-question cost about **15–20%**. **reasoning_effort=none on the draft** adds about
**18%** but needs a dev re-eval. A **verifier-gated cascade** (nano draft first, then mini only if verification fails) could cut
another ~30–40% with verification strictness unchanged. Token-level compression (LLMLingua-2) and semantic answer caching
conflict with "proof or silence" and should not be used. For ingestion, **Batch API halves cost** at no accuracy risk.

### Cited Findings
Per-question baseline used below: $0.00449 at list price (draft 3,620 µ$, retry ~450, plan 293, judge ~124). Savings for the draft also
apply to the retry (×1.12).

**Draft call (mini) — about 90% of query cost**
- (A) **Group evidence by document and print each chunk's context once.** In an offline replay on 114 questions, the evidence block went from
  1,759 to 1,393 tokens mean (**−366 tokens, −21%**) with identical information (title as a `## doc` header; tags shortened to
  `[para X p.Y in force, applies: …]`; context only on the first sentence of each chunk). Saving ≈ 366×0.75×1.12 ≈ **307 µ$/q (−6.8%)**.
  Risk: very low (format only). Check that the drafter still cites the right E-ids. Validate on canary (14 q, ~$0.05) — [repo replay](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py)
- Dropping context prefixes entirely saves more (1,759 → 1,356, −403 tokens) but removes disambiguation the drafter uses for
  table rows and clauses. Not recommended — [repo replay](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py)
- (B) **reasoning_effort "low" → "none" (the model default)** removes ~165 hidden output tokens ≈ 742 µ$/draft → **≈831 µ$/q
  (−18.5%)**, and should also cut latency. Risk: medium. The drafter may follow the rules (cite only IN_FORCE, use calc_requests,
  at most 4 sentences) less reliably. That cannot create hallucinations, because the verifier is unchanged, but it can raise
  the blocked→retry rate and the Incomplete count. Mitigation: use none on attempt 1 and low on the repair retry. Defaults
  and billing — [gpt-5.4-mini model page](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- (C) **Prompt caching on the repair retry.** The retry prompt is the first prompt plus appended feedback, so ~2,560 of ~2.7k tokens
  are a cacheable prefix (multiples of 128). At 0.1× that saves ~2,560×0.675 ≈ 1,728 µ$ per retry ≈ **207 µ$/q (−4.6%)**.
  This may already happen silently. Add `prompt_cache_key=<query_id>` and log `cached_tokens` to prove it. Risk: none — [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- (D) **Cross-question caching of the static prefix.** System + schema is ≈700 tokens, likely below the cacheable minimum. If it is
  extended to ≥1,024 with *useful* static content (abbreviation glossary from the `glossary` table, one worked example of a
  calc_request and a conflict sentence), the whole prefix bills at $0.075/M on hits. 1,024 tokens cached ≈ 77 µ$ vs ~525 µ$ today ≈
  **−450 µ$/draft (≈ −10%)** at a high hit rate. The 24h default retention makes hits likely even at low traffic. Risk: low.
  Uncertainty: the gpt-5.4 minimum is not published. Measure with one call — [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- (E) **Shorter output keys** (`sentences→s, text→t, cites→c, calc_requests→calc`, with `description` fields keeping the meaning).
  Visible draft output is 181 tokens mean, of which roughly 25–35 are key and punctuation overhead → **≈ −135 µ$/q (−3%)**. Risk: low to
  medium, since key names carry semantics for the model. Lowest priority — [repo cassettes](file:///Users/gaurav/Hack-a-sol-5.0/eval/cassettes)
- (F) **Fewer evidence sentences.** Offline gold-citation recall (75 questions with gold cites, rank of the first gold-matching
  evidence by similarity): top-6 58/75, top-8 60/75, top-10 63/75, top-12 65/75, top-14 67/75, top-18 69/75. The evidence block costs
  1,196 tokens at top-12 and 1,386 at top-14, vs ~1,759 at 18. Going to 14 saves ~370 tokens (≈ **−310 µ$/q, −7%**) but loses 2/75 gold
  citations (single_fact and different-condition questions). 12 loses 4/75. **Not recommended** as a fixed cap. An adaptive cap
  (stop when similarity drops below best−δ) is the safer variant and needs its own ablation — [repo replay](file:///Users/gaurav/Hack-a-sol-5.0/eval/gold.jsonl)
- (G) **Verifier-gated model cascade:** draft with nano (≈2,751×0.20 + 346×1.25 ≈ 982 µ$), then escalate to mini only when no core
  sentence passes verification. Expected draft cost = 982 + p_escalate×3,620. For p=0.3 that is ≈2,068 µ$ vs 3,620 (**−43% of draft, ≈ −35% of
  the question**). Strictness is unchanged because every sentence still passes the same checks. Risks: more Incomplete answers,
  plus extra latency on escalations. Note nano's "Deprecated" status — [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [gpt-5.4-nano page](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- **Token-level compression (LLMLingua-2)** reports 2×–5× compression and 1.6×–2.9× end-to-end latency gains — [LLMLingua-2, arXiv 2403.12968](https://arxiv.org/abs/2403.12968). On NQ, the Provence paper's comparison table shows LLMLingua-2 at 59.5 (74% compression) / 67.5 (45%) / 70.3 (25%) vs 71.8 with full context — [Provence, arXiv 2501.16214](https://arxiv.org/html/2501.16214v1). This doesn't fit our design: it drops tokens inside sentences, which breaks "stay close to evidence wording", the lexical/coverage checks and the verbatim quote location.
- **Sentence-level pruning (Provence)**: DeBERTa-v3-based (0.4B) pruner inside a reranker. It reports 49–82% context compression
  with small changes vs full context (e.g. NQ 71.8 → 72.4 at 62% compression; HotpotQA 57.0 → 56.7 at 66%; Syllabus QA 52.9 → 49.8 at
  61%; TyDi 73.9 → 70.5 at 63%), and ×1.2–1.4 generation speedup at batch size 1 — [Provence paper](https://arxiv.org/html/2501.16214v1); threshold 0.1 is "more conservative" than 0.5 — [HF blog](https://huggingface.co/blog/nadiinchi/provence)

**Plan call (nano) — about 6.5%**
- reasoning none: −~34 out tokens ≈ −42 µ$. Leaving `english_question` empty when lang=en (today it echoes the whole question,
  ~30–50 tokens): ≈ −44 µ$. Together **≈ −86 µ$/q (−1.9%)**, low risk — [repo](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py)
- **Removing the plan call** saves 293 µ$/q (−6.5%) and one round trip of latency. However, the plan produces the Hindi→English translation,
  `premises` (false-premise handling), `case` facts (applicability rules) and `subjects` (rule findings). Regex replacements
  for amount, date and rate type are feasible, but premises and Hindi are not. High risk to false_premise and Hindi rows. **Not
  recommended before judging.** A middle path is to skip the plan only when the question is English and matches a cached exact-question plan — [repo](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py)

**Judge (nano, third tier) — about 3%**
- The judge can only turn a would-be BLOCKED sentence into PASS (`llm_judge` is called after HHEM and MiniCheck fail). Removing it
  therefore makes the system *stricter*, never looser, and saves ~124 µ$/q (−2.8%) plus latency. The cost is possible extra
  blocks/retries on paraphrased sentences. reasoning none on the judge saves ~88 out tokens (≈110 µ$/call) but may make it more
  lenient. **Keep reasoning low for the judge** under the "no lower strictness" constraint — [repo: verify.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/verify.py)
- Replacing the judge with MiniCheck alone is already the tier-2 check (`minicheck(...) >= 0.5`). The judge is the fallback after
  both NLI models fail — [repo: verify.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/verify.py)

**Ingestion (offline: value_tuples nano, chunk_prefix nano, tuple_check mini) — $0.69 for the current corpus**
- **Batch API −50% on all ingest calls** (≈ $0.69 → $0.34). No accuracy change (same model and prompt). The cost is a ≤24 h turnaround,
  which is fine for a nightly or weekly circular refresh — [OpenAI Batch](https://developers.openai.com/api/docs/guides/batch)
- reasoning none: value_tuples −49 out × 961 calls ≈ −$0.059; chunk_prefix −7 × 1,916 ≈ −$0.017; tuple_check (mini) −66 × 141 ≈
  −$0.042. Risk: extraction quality (keep low for tuple_check, which is the audit step) — [repo cassettes](file:///Users/gaurav/Hack-a-sol-5.0/eval/cassettes)
- Tuple extraction prefix caching: the static system + schema is ≥700 tokens on every one of 961 calls (the smallest prompt is 701 tokens). Pushed
  over the cache minimum and cached at $0.02/M, that is ≈ −110 µ$/call ≈ −$0.10 (−30% of tuple cost) — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- chunk_prefix: output is 64% of its cost. Several chunks of the same document can be batched per call (one header, N one-sentence prefixes),
  or prefixes can be made deterministic (title + breadcrumb are already stored). The retrieval effect of LLM prefixes isn't measured in the repo,
  so this is a gap — [repo: pipeline.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/pipeline.py)
- Incremental re-ingest: cassette keys hash the full request, so unchanged chunks cost $0 on re-ingest. Only new or amended circulars
  incur cost — [repo: llm.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/llm.py)

**Semantic answer caching**
- GPTCache-style similarity caches produce false hits: MeanCache measured 54 false hits for GPTCache on 250 queries — [MeanCache, arXiv 2403.02694](https://arxiv.org/pdf/2403.02694); InstCache reports GPTCache hit rates of 22.0% and 17.7% at thresholds 0.9 and 0.95, with many hits judged not equivalent — [InstCache, arXiv 2411.13820](https://arxiv.org/pdf/2411.13820); vCache argues a single global threshold is unsafe and learns per-entry thresholds against a user-set error bound — [vCache, arXiv 2502.03771](https://arxiv.org/pdf/2502.03771.pdf)
- A compliance answer also depends on as-of date, bank profile and corpus version (point-in-time logic in `build_evidence`) — [repo: service.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py)

**Eval spend (protects the remaining ~$1)**
- Ledger cost per eval run (upper bound): dev 50 q ≈ $0.27–0.28, fresh 34 q ≈ $0.18, test 30 q ≈ $0.16, canary 14 q ≈ $0.01–0.06 (mostly
  cassette hits) — [repo: eval_runs.csv](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports/eval_runs.csv). Sending eval traffic with
  `service_tier="flex"` would price it at Batch rates (−50%). `service_tier` is not part of the cassette key, so cassettes stay valid — [OpenAI Flex](https://developers.openai.com/api/docs/guides/flex-processing), [repo: llm.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/llm.py)

### Inferences
- **Recommended for the hackathon (no accuracy risk):** A (evidence grouping) + C (retry cache key and cached-token logging) + plan trims +
  ledger fix + Flex for evals. Expected ≈ 307 + 207 + 86 ≈ 600 µ$ → **$0.0045 → ~$0.0039/q (−13%)**, plus D if a one-call test
  shows the prefix caches (→ ~$0.0035, −22%). The one paid validation needed is a canary run (~$0.05 at Flex rates).
- **Next tier (needs a dev re-eval, ~$0.14 at Flex rates):** B (draft reasoning none) → **~$0.0027/q (−40% total)**. Accept it only if
  dev Accurate stays ≥40/50 and blocked-retry rate doesn't rise.
- **Production tier:** G (cascade) on top → **~$0.0018–0.0022/q**. Verification strictness is unchanged by construction, because every
  path ends in the same verifier.
- Exact-match caching (normalized question + profile + as-of date + corpus hash → stored *verified* answer) is safe and already
  how cassettes work. Semantic near-duplicate reuse should at most reuse retrieval, never an answer, and only with re-verification.
  It shouldn't be presented as a cost lever without a measured hit rate.
- Do not adopt LLMLingua-style compression. It attacks the 25% of the prompt that is actual evidence text, while 75% is formatting
  and instructions that are cheaper and safer to trim.

### Gaps
- None of B, D, E or G has been measured; they need paid runs. Expected deltas are arithmetic from measured token counts, not
  accuracy measurements.
- There is no repo A/B of contextual prefixes vs title + breadcrumb on retrieval (`eval/retrieval_ab.py` exists but no saved report was
  found for prefixes), so dropping LLM prefixes at ingest is unquantified.
- No source quantifies real-world repeat-question rates for bank compliance desks, so semantic-cache savings can't be estimated.

## 4. Hindi: token cost of Devanagari vs English, and translation strategy

### Takeaway
With the GPT-5-family tokenizer (o200k), Hindi costs only **~1.35–1.4× English tokens** (it was ~3.8–4× with the old
cl100k tokenizer). The current design already translates once in the plan call and runs retrieval, drafting and verification in English.
That makes the extra cost of a Hindi question about **+50–80 µ$ (~1–2%)**.

### Cited Findings
- The repo's own Hindi gold question (q054, prepayment charge for a Tier-3 UCB MSE loan) is 48 o200k tokens vs 34 for its English
  equivalent (1.41×). A sample regulatory answer sentence is 47 vs 35 (1.34×). With cl100k_base the same texts are 128 vs 34 (3.76×) and 139 vs 35
  (3.97×) — [repo: eval/gold.jsonl](file:///Users/gaurav/Hack-a-sol-5.0/eval/gold.jsonl) (local tiktoken measurement)
- PLAN_SYSTEM: "If the question is in Hindi, translate it to English in english_question and set lang=hi". The embedding model
  is `BAAI/bge-small-en-v1.5` (English). The config comment suggests bge-m3 for Hindi — [repo: service.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/service.py), [repo: config.py](file:///Users/gaurav/Hack-a-sol-5.0/backend/app/config.py)
- XProvence extends sentence pruning to 16 trained languages and 100+ via transfer, for multilingual RAG — [XProvence, arXiv 2601.18886](https://arxiv.org/abs/2601.18886)

### Inferences
- Keep "translate in, verify in English". A Hindi *answer*, if needed, costs ≈ 1.35× the visible English answer (≈181 → ~245 tokens). On nano,
  that is ≈200 in + ~250 out ≈ 350 µ$ (+8%). Translating *after* verification means the Hindi text was not itself verified. Show it as
  "translation of the verified English answer", with the English sentences and citations alongside, so strictness is not weakened.
- Do not draft directly in Hindi. The evidence is English, so lexical, coverage, HHEM and MiniCheck checks would all degrade
  (MiniCheck-DeBERTa and HHEM are English models).

### Gaps
- Only two Hindi samples were measured. A larger Hindi set would give a tighter ratio. No public source on o200k Hindi ratios was retrieved.

## 5. Presenting cost per query and cost at scale to judges; how others report it

### Takeaway
Present **measured cost per question by call type** (from the ledger and cassettes, with token counts), **cost per *accurate* answer** next to
the naive-RAG baseline, and a **scale table** (one-time ingest for 5k documents plus 10k questions/month). The verification-first
system costs ~2.5× naive RAG per question but has 0 hallucinations vs 3 and 0 fabricated quotes vs 2. At bank scale the whole LLM bill stays
in the tens of dollars per month.

### Cited Findings
- Own vs baseline (ledger upper bounds, 20% margin included): fresh 34 q — system $0.00528/q, 29 Accurate, 0 Hallucinated, 0
  fabricated quotes; naive baseline $0.00209/q, 17 Accurate, 1 Hallucinated, 1 fabricated quote. Test 30 q — system $0.00525/q, 25 Accurate, 0
  Hallucinated; baseline $0.00143/q, 17 Accurate, 3 Hallucinated, 2 fabricated — [repo: eval/reports](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports/eval_runs.csv)
- Cost per accurate answer (fresh): system $0.1794/29 = **$0.0062**; baseline $0.0711/17 = **$0.0042** — computed from [repo: fresh.json / fresh_baseline.json](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports)
- Latency is a likely judge question: p50 54 s, p95 143 s (fresh); naive baseline p50 ~2.8 s — [repo: eval/reports](file:///Users/gaurav/Hack-a-sol-5.0/eval/reports/fresh.json)
- Industry write-ups usually compute cost per query as monthly LLM spend / monthly queries, and claim generation dominates (≈85–95%
  of per-query cost, with embeddings negligible). These are blog and calculator sources with differing assumptions, so they serve as
  framing only — [search summary incl. spendark.com](https://spendark.com/blog/rag-system-cost/), [ecomcalctools](https://ecomcalctools.com/blog/rag-cost-optimization-2026/), [onyx.app](https://onyx.app/insights/rag-token-costs). Our measured split agrees: LLM generation ≈ 100% of $ because embeddings, reranking and NLI are local.
- Papers on compression report cost as compression ratio plus end-to-end latency speedup (LLMLingua-2: 2–5×, 1.6–2.9×) — [arXiv 2403.12968](https://arxiv.org/abs/2403.12968). Provence reports compression % plus LLM-Eval score delta and ×speedup per batch size — [arXiv 2501.16214](https://arxiv.org/html/2501.16214v1)

### Inferences
Scale table, using list prices from the [OpenAI pricing page](https://developers.openai.com/api/docs/pricing) and our measured tokens. Assumptions: bank documents are similar in size to the
current corpus (16.4 pages and 105 chunks per document), and question traffic mixes like the eval sets.

| Item | Today | Safe package (A+C+plan trims, ±D) | + draft reasoning none (B) | + nano→mini cascade (G) |
|---|---|---|---|---|
| LLM cost / question | $0.0045 | $0.0035–0.0039 | ~$0.0027 | ~$0.0018–0.0022 |
| per 1,000 questions | $4.50 | $3.5–3.9 | ~$2.7 | ~$1.8–2.2 |
| 10k questions / month | ~$45 | ~$35–39 | ~$27 | ~$18–22 |
| One-time ingest, 5k docs (~82k pages, ~525k chunks) at $0.0003/chunk | ~$156 standard | ~$78 with Batch | ~$65 Batch + reasoning none on extraction | same |
| Monthly delta ingest (e.g. 50 new or amended circulars) | ~$1.6 | ~$0.8 Batch | | |

- One-year total at 10k q/month: today ≈ $156 + 12×$45 ≈ **$700/year**. Optimized ≈ $78 + 12×$22 ≈ **$340/year**. The +10% regional-processing
  uplift applies if in-India data residency is used ([OpenAI pricing](https://developers.openai.com/api/docs/pricing)).
- Slide framing: (1) "Every answer costs about half a US cent, measured, not estimated: ledger of 3,771 calls." (2) A stacked bar by call type:
  draft ~80%, retry ~10%, plan ~6.5%, judge ~3%. (3) "We pay ~2.5× naive RAG per question to get 0 hallucinations and 0 fabricated
  quotes. Per accurate answer it's $0.0062 vs $0.0042." (4) Abstentions are cheap: a retrieval-gate abstain costs only the plan call (~$0.0003).
  (5) The scale table above, with the line "local models (bge-small, HHEM, MiniCheck) cost $0 in API; compute on one CPU box".
- Be explicit that figures are list-price upper bounds (no cache discounts counted) and that gpt-5.4-nano is listed as deprecated
  (fallback: mini on Batch for ingest, ≈ +3.75× on nano-routed lines, still under ~$0.001/q for plan + judge).

### Gaps
- No credible primary source was found reporting cost per query for competing regulatory or compliance RAG products. Blog figures
  ($0.015–0.059/query) use different models and token assumptions and should not be cited as competitor numbers.
- CPU/GPU hosting cost for the local models (HHEM, MiniCheck-DeBERTa-large, bge-small) wasn't measured. The 54 s p50 latency suggests
  compute, not tokens, may be the real bottleneck at scale.
- The scale estimate assumes bank documents resemble RBI circulars in size and tuple density. Real bank SOP corpora could differ.
