# Proof-or-Silence: industry numbers and component licences (gap fill)

Research date: 24 Nov 2026. This file only fills gaps left by the existing notes in `research_notes/` (industry_numbers_incidents, model_hosting_and_judging, research_systems, evaluation_quality, compliance_privacy).

Type labels:
- **paper**: a peer-reviewed or arXiv paper.
- **official**: a regulator, a maintainer's model card or README, PyPI, or a vendor's own price page.
- **vendor claim**: a number the vendor says about its own product.
- **secondary**: a news write-up, an aggregator, or a law-firm summary.

"Not found" means I searched and found nothing. I did not guess any figure.

---

## Part A: Numbers

### A1. Stanford RegLab/HAI legal RAG study (Magesh et al., *J. Empirical Legal Studies* 22:216, 2025, DOI 10.1111/jels.12413)

| Number | Value | Source | Type |
|---|---|---|---|
| Queries | 202, preregistered on OSF on 22 Mar 2024. Split: 80 general research, 70 jurisdiction/time-specific, 22 false-premise, 30 factual recall. | [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1) | paper |
| Lexis+ AI | 65% accurate, 18% incomplete, about 17% hallucinated (17% is the remainder) | [JELS PDF](https://dho.stanford.edu/wp-content/uploads/Legal_RAG_Hallucinations.pdf), p.10 | paper |
| Westlaw AI-Assisted Research | 41% accurate (42% in the abstract), 25% incomplete, about 33% hallucinated. That is "nearly twice as often" as the other legal tools. | same | paper |
| Ask Practical Law AI | 19–20% accurate, 62% incomplete, about 17–18% hallucinated | same | paper |
| GPT-4 (gpt-4-turbo-2024-04-09, given a "cite caselaw" prompt) | Shown only in Figure 4; no number appears in the text. The paper says the legal tools are "less prone to hallucination than GPT-4". | same | paper. Exact GPT-4 % **not found** in text. |
| Average answer length, refusals excluded | Westlaw 350 words (SD 120); Lexis 219 (SD 114); Practical Law 175 (SD 67) | same | paper |
| When the queries were run | Lexis, Practical Law and GPT-4: 22 Mar – 22 Apr 2024. Westlaw: 23–27 May 2024. | same | paper |

**Definitions (verbatim):**
- **Misgrounded:** "key factual propositions are cited but misinterpret the source or reference an inapplicable source."
- **Hallucinated:** "either incorrect or misgrounded … if a model makes a false statement or falsely asserts that a source supports a statement."
- **Incomplete:** a refusal, or a correct but *ungrounded* (uncited) answer.

The paper notes that its use of "grounded" differs from the usual computer-science meaning. A citation to a retrieved document that does not apply in the relevant jurisdiction still counts as misgrounded.

### A2. Vals Legal AI Report (VLAIR)

**Feb 2025 report (document tasks), released 27 Feb 2025.** Scores are %. A dash means the vendor did not opt in or withdrew. Source: [vals.ai VLAIR 2-27-25](https://www.vals.ai/industry-reports/vlair-2-27-25) (official). Per-task figures are cross-checked against [LawNext](https://www.lawnext.com/2025/02/legal-ai-tools-show-promise-in-first-of-its-kind-benchmark-study-with-harvey-and-cocounsel-leading-the-pack.html) (secondary).

| Task (n questions) | Harvey Assistant | CoCounsel (TR) | Vincent AI (vLex) | Oliver (Vecflow) | Lawyer baseline |
|---|---|---|---|---|---|
| Data extraction (30) | 75.1 | 73.2 | 69.2 | 64.0 | 71.1 |
| Document Q&A (30) | **94.8** | 89.6 | 72.7 | 74.0 | 70.1 |
| Doc summarization (20) | 72.1 | 77.2 | 58.9 | 62.4 | 50.3 |
| Redlining (20) | 65.0* | – | 53.6 | – | **79.7** |
| Transcript analysis (30) | 77.8 | – | 64.8 | – | 53.7 |
| Chronology (10) | 80.2 | 78.0 | – | 66.9 | 80.2 |
| EDGAR research (100) | – | – | – | 55.2 | **70.1** |

Notes on the Feb 2025 report:
- \*For Harvey on Redlining, the report's text says 59.4, which conflicts with the 65.0 in its table.
- There were 240 questions in total.
- **LexisNexis withdrew from every skill except legal research.**
- AI tools were 6x to 80x faster than lawyers. Harvey and CoCounsel each answered in under 1 minute; Oliver often took 5 minutes or more.

**Oct 2025 report (legal research), 14 Oct 2025.** 210 questions across 9 research types. Source: [vals.ai VLAIR 10-14-25](https://vals.ai/industry-reports/vlair-10-14-25), with numbers as reported by [LawNext](https://www.lawnext.com/2025/10/vals-ais-latest-benchmark-finds-legal-and-general-ai-now-outperform-lawyers-in-legal-research-accuracy.html) (secondary) and [Legal IT Insider](https://legaltechnology.com/vals-ais-benchmarking-report-for-legal-research-is-out-but-the-market-leaders-are-absent/) (secondary).

| Number | Value | Type |
|---|---|---|
| Accuracy | Counsel Stack 81%, Alexi 80%, ChatGPT 80%, Midpage 79%. **Lawyer baseline 71%.** | secondary, from the Vals report |
| Authoritativeness | ChatGPT 70%; legal AI tools 76% on average | secondary |
| Incumbents absent | **Thomson Reuters (Westlaw/CoCounsel) and LexisNexis declined; vLex withdrew before publication.** Harvey was also not in the field. | secondary |

### A3. IndiaFinBench (arXiv 2604.19298, v3 26 Oct 2026, R. S. Pall)

| Number | Value | Source | Type |
|---|---|---|---|
| Items | 406 items from 192 SEBI and RBI documents (1992–2026). By task: REG 174, NUM 92, CON 62, TMP 78. By difficulty: 160 easy, 182 medium, 64 hard. | [GitHub README](https://github.com/Rajveer-code/IndiaFinBench) | official |
| Models (12, zero-shot, closed-book, strict scoring) | Gemini 2.5 Flash 89.7; Qwen3-32B 85.5; Llama-3.3-70B 83.7; Llama 4 Scout 17B 83.3; Kimi K2 81.5; Gemma 3 4B 78.8; Llama-3-8B 78.1; GPT-OSS-120B 77.1; GPT-OSS-20B 76.8; Gemini 2.5 Pro 76.1; Mistral-7B 75.9; DeepSeek-R1-Distill-Llama-70B 75.1 | same | official |
| Per-task results | Numerical reasoning ranges from 84.8 down to 48.9; Gemini 2.5 Pro is last on NUM. Contradiction detection has the highest mean, 91.5, but its majority-class baseline is already 85.5%. | same | official |
| Strict vs judge scoring | Strict 75.1–89.7%; judge 87.2–94.8%; composite 94.1–98.0%. The two rankings show Spearman ρ = −0.273 (p = 0.39). The judge is phi4-mini. It rescued 93.9% of DeepSeek-R1-Distill's strict errors. | [arXiv abs](https://arxiv.org/abs/2604.19298) | paper |
| Other findings | 148/406 items (36.5%) do not separate any pair of models. A non-specialist human scored 80.0% (48/60). | same | paper |
| Licence | Dataset CC BY 4.0; code MIT | GitHub | official |

### A4. Grounding checkers: LLM-AggreFact and RAGTruth

**LLM-AggreFact, average balanced accuracy (BAcc) over 11 datasets.** The [leaderboard](https://llm-aggrefact.github.io/) shows no update date. It does **not list HHEM, MiniCheck-DeBERTa, any GPT-5 model, or Paladin**.

| Model (size) | AggreFact avg BAcc | Source | Type |
|---|---|---|---|
| Bespoke-MiniCheck-7B | 77.4 | leaderboard | official |
| Claude-3.5 Sonnet | 77.2 | leaderboard | official |
| Granite Guardian 3.3 8B (no_think) | 76.5 on the leaderboard; 76.1 on its [HF card](https://huggingface.co/ibm-granite/granite-guardian-3.3-8b), which gives 83.1 on the RAGTruth subset | leaderboard / card | official |
| GPT-4o-2024-05-13 | 75.9 | leaderboard | official |
| HalluGuard-4B (Qwen3-4B base; Apache-2.0 promised but **not released**) | 75.7. It scores 84.0 on the RAGTruth subset; the same paper gives MiniCheck-7B 84.0, Granite Guardian 3.3 82.2 and GPT-4o 84.3. | [arXiv 2510.00880](https://arxiv.org/html/2510.00880v1) | paper |
| **FactCG-DeBERTa-L (0.4B)** | **75.6** at a fixed 0.5 threshold; 77.2 with a per-dataset tuned threshold | [FactCG paper, Tables 3 and 10](https://arxiv.org/html/2501.17144) | paper |
| MiniCheck-Flan-T5-L (0.8B) | 75.0 (FactCG paper, fixed threshold); 74.7 (MiniCheck paper) | FactCG / [MiniCheck paper](https://arxiv.org/html/2404.10774) | paper |
| MiniCheck-RoBERTa-L | 72.7 (MiniCheck paper); 73.5 (FactCG paper, fixed threshold) | same | paper |
| **MiniCheck-DeBERTa-v3-L (0.4B)** | **72.6** (MiniCheck paper); 73.1 (FactCG paper, fixed threshold); 74.1 (tuned threshold) | same | paper |
| AlignScore | 70.4 | MiniCheck paper | paper |
| GPT-4 / Claude-3 Opus | 75.3 / 74.1 | MiniCheck paper | paper |
| **HHEM-2.1-Open (110M)** | Not on LLM-AggreFact. Vectara reports **76.55 BAcc on AggreFact-SOTA** (an older, different benchmark), 64.42 on RAGTruth-Summ and 74.28 on RAGTruth-QA. On the same three benchmarks GPT-4-0613 scored 73.78, 62.62 and 74.11. | [HF card](https://huggingface.co/vectara/hallucination_evaluation_model) | vendor claim |
| MiniCheck cost | MiniCheck-FT5 costs $0.24 to run the 13K-item test set, against $107 for GPT-4: about 400x cheaper. | MiniCheck paper | paper |

**RAGTruth: LettuceDetect, P/R/F1 in %** ([arXiv 2502.17125](https://arxiv.org/html/2502.17125v1), paper)

| Model | Example-level F1 overall (QA / Data2Text / Summ) | Span-level F1 overall (QA / Data2Text / Summ) |
|---|---|---|
| lettucedetect-base (150M) | 76.07 (65.52 / 87.89 / 50.52); P 76.64, R 75.50 | 55.44 (61.50 / 57.39 / 36.71) |
| lettucedetect-large (396M) | **79.22** (70.18 / 88.54 / 59.69); P 80.44, R 78.05 | **58.93** (64.41 / 60.04 / 44.63) |
| GPT-4-turbo prompt | 63.4 (P 46.9, R 97.9) | 28.3 |
| Luna | 65.4 | n/a |
| Fine-tuned Llama-2-13B | 78.7 | 52.7 |
| RAG-HAT, fine-tuned Llama-3-8B | 83.9 | not reported |

Notes on LettuceDetect:
- The paper reports about 30–60 examples per second on one GPU; it does not name the GPU.
- The 2026 v2 models score as follows on the RAGTruth slice of a new unified test set: mmBERT-base 0.528 span-F1, Qwen-2B 0.574. These are not comparable to the table above. Source: [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect) (official).

**RAGTruth base rates** ([arXiv 2401.00396](https://arxiv.org/html/2401.00396), paper; repo MIT)

| Number | Value |
|---|---|
| Corpus | 2,965 inputs; 17,790 responses from 6 models; 7,664 hallucinated responses (43.1%); 14,289 annotated spans |
| Share of responses with at least one hallucination (QA / D2T / Summ / overall) | GPT-4-0613: 4.9 / 28.1 / 7.8 / **13.7%**<br>GPT-3.5-turbo: 7.6 / 26.3 / 5.7 / 13.5%<br>Llama-2-70B: 32.4 / 83.5 / 22.5 / 47.1%<br>Llama-2-13B: 56.6%<br>Llama-2-7B: 61.8%<br>Mistral-7B: 65.9% |

Per-model percentages are derived from the paper's counts divided by the per-task totals.

### A5. Other hallucination baselines

| Number | Value | Source | Type |
|---|---|---|---|
| Vectara leaderboard (updated 22 Oct 2026; HHEM-2.3; more than 7,700 articles) | Best: finix_s1_32b 1.8%. Other GPT-family models:<br>• gpt-5.4-nano 3.1%<br>• gpt-5.4-mini 5.5%<br>• gpt-4.1 5.6%<br>• gpt-5.4 7.0%<br>• gpt-5.5 9.3%<br>• gpt-4o 9.6%<br>• gpt-5-high 15.1% | [README](https://raw.githubusercontent.com/vectara/hallucination-leaderboard/main/README.md) | official (Vectara's evaluator) |
| Vectara leaderboard, Claude and Gemini | Claude: Haiku 4.5 9.8%, Opus 5.5 9.9%, Sonnet 4.6 10.6%.<br>Gemini: 2.5 Flash-Lite 3.3%, 2.5 Pro 7.0%, 3 Pro 13.6%. | same | official |
| FACTS Grounding | GPT-5.2 leads the Kaggle FACTS Grounding board at 76.17% (Mar 2026). In the FACTS Suite paper, Gemini 3 Pro scores about 69.0 on grounding. In Dec 2024, gemini-2.0-flash-exp scored 83.6% on v1, which is not comparable. | [Buttondown digest](https://buttondown.com/theaggregate/archive/ai-benchmark-digest-2026-03-25/), [arXiv 2512.10791](https://arxiv.org/html/2512.10791v1), [DeepMind 2024](https://deepmind.google/discover/blog/facts-grounding-a-new-benchmark-for-evaluating-the-factuality-of-large-language-models/) | secondary (2026 figure) / paper |
| FinanceBench | GPT-4-Turbo with retrieval "incorrectly answered or refused to answer **81%** of questions". The full set has 10,231 questions; the open sample has 150. 16 configurations were tested and 2,400 answers reviewed by hand. | [arXiv 2311.11944](https://arxiv.org/abs/2311.11944) | paper (confirms the 19% correct figure the team already has) |
| Other banking/finance RAG accuracy | Not found beyond IndiaFinBench and FinanceBench. | – | – |

### A6. India: banking, RBI and UCBs

**RBI Integrated Ombudsman Scheme (RB-IOS), FY2024-25.** Annual report published 1 Dec 2025. Source: [RBI](https://rbi.org.in/Scripts/PublicationsView.aspx?id=23441) (official).

| Number | Value |
|---|---|
| Total complaints | **13,34,244** in FY25, up 13.55% from 11,75,075 |
| Received at ORBIOs / CRPC | ORBIOs 2,96,321; CRPC 9,11,384 |
| Against banks | 2,41,601 complaints = **81.53%** of ORBIO complaints |
| By bank group | Private sector 37.53%; public sector 34.80%; **UCBs 3,369 (1.14%)**. UCB complaints were 3,800 in FY24. |
| Top grounds (share of ORBIO complaints) | **Loans and advances 29.25%**; credit cards 17.15%; mobile/electronic banking 16.86% (down 12.74% year on year); deposit accounts 16.84%; ATM/debit 6.10% |
| Disposal | ORBIO disposal rate 93.07% (95.10% in FY24). Cost per complaint ₹1,582. |

**RB-IOS, FY2023-24.** Source: [RBI](https://rbi.org.in/scripts/PublicationsView.aspx?id=23126) (official), via search snippet. Note: the FY25 report restates FY24 as 11,75,075, which suggests a change in how complaints were counted.

| Number | Value |
|---|---|
| Total complaints | **9,34,355** (up 32.81%). ORBIOs 2,93,924; CRPC 6,40,431. |
| Share against banks / NBFCs | Banks 82.28%; NBFCs 14.53% |
| Mobile/e-banking share of bank complaints | 22.48% |
| Disposal rate | 95.10% |

**RBI FREE-AI report, 13 Aug 2025.** The RBI PDF sits behind a bot-check page, so it was not opened. Figures come from [Dvara Research](https://dvararesearch.com/summary-of-the-rbi-free-ai-committee-report/) and [Khaitan & Co](https://www.khaitanco.com/sites/default/files/2025-08/Ergo%20-%20FREE%20AI%20Framework%20-%2028%20Augusut%202025.pdf) (secondary), and search-index snippets of the RBI PDF.

| Number | Value |
|---|---|
| Survey | 612 supervised entities, Feb–May 2025 (DoS survey); separate FTD survey of 76 entities |
| Using or developing AI | **20.8% (127 of 612)**; 67% interested |
| **Audit logs** | **18%** keep audit logs. **Verified: the base is the 127 AI-using entities, not all 612.** |
| Other controls | Interpretability tools (SHAP/LIME) 15%; bias-mitigation protocols 10%; drift monitoring 21%; real-time performance monitoring 14%; board-level AI oversight about 1/3 (mostly large banks); formal AI-incident processes about 1/4 |
| 7 Sutras | Trust is the Foundation; People First; Innovation over Restraint; Fairness and Equity; Accountability; Understandable by Design; Safety, Resilience and Sustainability |
| Structure | 6 pillars and 26 recommendations |

**Bank chatbots in India**

| Number | Value | Source | Type |
|---|---|---|---|
| SBI SIA (Payjo, 2017) | Design capacity 864 million enquiries a day; 19.8M queries in a year (about 54,310 a day); 28.8% product queries. **No accuracy figure found.** | [Business Standard 2017](https://www.business-standard.com/article/news-ians/sbi-introduces-ai-based-chat-assistant-117092500560_1.html), [vendor case study](https://cdn.featuredcustomers.com/CustomerCaseStudy.document/interface_state-bank-of-india_556215.pdf) | vendor claim |
| HDFC EVA | More than 2.7M queries, 530k users, 1.2M conversations (launch period). **No accuracy figure found.** | [Emerj](https://emerj.com/ai-applications-in-the-top-4-indian-banks/) | secondary / vendor claim |
| ICICI iPal | 6M queries and "90% accuracy" | same | vendor claim |
| RBI's own chatbot | **No public RBI chatbot launch found.** Related items: RBI's internal GenAI platform "ChiRAG"; AI-based UPI HELP at GFF, Oct 2025; a phased conversational-AI plan for the complaint management system with ReBIT. | [Business Today](https://www.businesstoday.in/personal-finance/news/story/rbi-rolls-out-ai-based-upi-help-iot-payments-new-credit-features-at-gff-2025-497393-2025-10-08), [Tribune](https://www.tribuneindia.com/news/business/ai-enabled-tools-to-streamline-complaint-handling-at-rbi-mos-finance) | secondary |

**UCBs at end-March 2025.** Source: RBI *Trend and Progress of Banking 2024-25* (29 Dec 2025), Table V.1 ([RBI](https://rbi.org.in/Scripts/PublicationsView.aspx?id=23640), official).

| Tier | Deposit band | Banks | Share of deposits |
|---|---|---|---|
| Tier 1 | up to ₹100 cr; also all unit and salary-earner UCBs | 838 (57.5%) | 11.3% |
| Tier 2 | ₹100–1,000 cr | 535 (36.7%) | 30.5% |
| Tier 3 | ₹1,000–10,000 cr | 78 (5.4%) | 34.4% |
| Tier 4 | above ₹10,000 cr | 6 (0.4%) | 23.8% |
| **All UCBs** | | **1,457**, down from 1,926 in 2004 | deposits ₹5.84 lakh cr |

- Tier bands come from the RBI UCB Licensing, Scheduling and Regulatory Classification Guidelines, 2025 ([RBI](https://website.rbi.org.in/ur/web/rbi/-/notifications/reserve-bank-of-india-urban-co-operative-banks-licensing-scheduling-and-regulatory-classification-guidelines-2025-3), official).
- **NUCFDC (umbrella organisation)** runs a "Bank in a Box" platform: Sahakar CBS core banking, payments, cloud compliance and cyber-security tools, aimed at Tier 1/2 and unit banks ([Indian Cooperative](https://www.indiancooperative.com/featured/nucfdc-set-to-transform-ucb-sector-introduces-key-services-shah/), secondary). In Aug 2026, close to half of about 1,400 UCBs were still not registered with NUCFDC, and the target is all of them by Mar 2027 ([Business Today, 8 Aug 2026](https://www.businesstoday.in/india/story/hope-to-register-all-urban-cooperative-banks-with-umbrella-body-in-current-financial-year-nucfdc-ceo-548141-2026-08-08), secondary).
- The T&P chapter does not discuss UCB IT constraints (not found).

### A7. Latency expectations

| Number | Value | Source | Type |
|---|---|---|---|
| Nielsen response-time limits | 0.1 s feels instant; 1 s keeps the user's flow of thought; 10 s is the limit of attention. Unchanged since 1993; based on Miller (1968). | [NN/g](https://www.nngroup.com/alertbox/response-times.html), [NN/g video](https://www.nngroup.com/videos/3-response-time-limits-interaction-design/) | official (UX research) |
| NVIDIA RAG sizing target | Customer-service chatbot time to first token (TTFT) under 3 s; chat-sizing table p90 TTFT 3–5 s; LLM prefill is about 80% of RAG TTFT | [NVIDIA RAG scaling guide](https://docs.nvidia.com/enterprise-reference-architectures/enterprise-rag-retrieval-scaling-and-sizing-guide/latest/rag-scaling-guidelines.html) | vendor claim |
| Glean | p95 TTFT grows about 0.24 ms per input token (about 240 ms per 1k tokens); average about 0.20 ms per token. Measured on GPT-4 Turbo on Azure PTU, Jul 2024. | [Glean blog](https://glean.com/blog/glean-input-token-llm-latency) | vendor claim |
| Microsoft 365 Copilot | Published p50/p95 **not found**. One forum user reported 58 s for a 3-paragraph answer (anecdote). | [MS Tech Community](https://techcommunity.microsoft.com/discussions/bingchatenterprise/copilot-is-slow-compared-to-free-genai-chat-tools/4060462) | secondary, n=1 |
| HHEM-2.1-Open on CPU | About 1.5 s for a 2k-token input on a modern x86 CPU; under 600 MB RAM in fp32 | [HF card](https://huggingface.co/vectara/hallucination_evaluation_model) | vendor claim |
| bm25s throughput (single-thread Xeon) | 507 QPS on fiqa and 953 QPS on scifact, against 4.5 and 47.6 QPS for rank-bm25 | [bm25s README](https://github.com/xhluca/bm25s) | official |

### A8. Cost

| Number | Value | Source | Type |
|---|---|---|---|
| gpt-5.4-mini price (per 1M tokens) | Input $0.75; cached input $0.075; output $4.50. Context 400k; knowledge cutoff 31 Aug 2025; snapshot dated 2026-03-17. | [OpenAI model page](https://developers.openai.com/api/docs/models/gpt-5.4-mini) | official |
| gpt-5.4-nano price | Input $0.20; cached input $0.02; output $1.25 | same | official |
| gpt-5.4 price | Input $2.50; cached input $0.25; output $15.00 | same | official |
| Harvey | About $1,000–1,200 per lawyer per month; 12-month contract; about 20-seat minimum. Not published by Harvey. | [CloudZero](https://www.cloudzero.com/blog/harvey-ai-pricing), [eesel](https://www.eesel.ai/blog/harvey-ai-pricing) | secondary (estimates) |
| CoCounsel | About $104–639 per user per month depending on bundle. The Westlaw Advantage + CoCounsel Essentials bundle is about $639. | [Costbench](https://www.costbench.com/compare/harvey-ai-vs-cocounsel/) | secondary |
| Typical RAG cost per query | Estimates range widely:<br>• about $0.0013–0.0033 per query (gpt-oss-120b, DigitalOcean)<br>• about $0.015–0.025 per query (3k input / 500 output tokens, frontier model)<br>Generation is 85–95% of the per-query cost. | [DigitalOcean](https://www.digitalocean.com/community/tutorials/build-production-rag-pipeline-digitalocean), [aipromptshub](https://aipromptshub.co/calc/rag-cost-per-query) | secondary |
| Our pipeline on gpt-5.4-mini (arithmetic, not a source) | A 4k-input / 400-output call costs 4000×0.75e-6 + 400×4.5e-6 = **$0.0048**, about ₹0.40 at ₹84/$ (exchange rate assumed). | computed | – |

---

## Part B: Open-source components

Versions and licences below are from PyPI and the Hugging Face API, read 24 Nov 2026.

| Component | What it is | Latest version (date) | Licence | Published numbers (source) |
|---|---|---|---|---|
| bm25s | Sparse-matrix BM25 in pure Python and numpy | 0.3.16 (28 Oct 2026) | MIT | Up to about 500x faster than rank-bm25; see A7 ([README](https://github.com/xhluca/bm25s)) |
| BAAI/bge-small-en-v1.5 | 33M-parameter English embedder, 384 dimensions, 512 tokens | card last changed 22 Feb 2024 | MIT | **MTEB average (56 tasks) 62.17; Retrieval (15) 51.68**; Reranking 58.36. For comparison, bge-base 53.25 and ada-002 49.25 on Retrieval. ([HF card](https://huggingface.co/BAAI/bge-small-en-v1.5)) |
| vectara/hallucination_evaluation_model (HHEM-2.1-Open) | T5-base classifier, 110M params. Output: 1 = consistent, 0 = hallucinated. Needs `trust_remote_code=True`. Prompt starts `<pad> Determine if the hypothesis is true given the premise?` | card updated 6 Oct 2026 | Apache-2.0. HHEM-2.3 is commercial. | See A4 ([card](https://huggingface.co/vectara/hallucination_evaluation_model)) |
| lytang/MiniCheck-DeBERTa-v3-Large | Sentence-level fact checker, 0.4B. Label 1 = supported. Used through the `minicheck` package. | 22 Sep 2024 | MIT (model); GitHub repo Apache-2.0 | AggreFact 72.6 (paper) / 73.1 (fixed threshold, FactCG paper). Card: "~800 docs/min, depending on hardware". |
| BAAI/bge-reranker-base | XLM-R cross-encoder, 278M params, trained on Chinese and English | 24 Jun 2024 | MIT | C-MTEB reranking average 65.42; MMarco 35.46 ([card](https://huggingface.co/BAAI/bge-reranker-base)). **No English BEIR number found on the card.** |
| Microsoft Presidio (analyzer, anonymizer) | PII detection and anonymisation. The repo moved to `github.com/data-privacy-stack/presidio`. | 2.2.366 (27 Oct 2026) | MIT | No accuracy benchmark is published by the maintainers (not found). |
| pdfplumber | PDF text, character and table extraction | 0.11.11 (21 Nov 2026) | MIT | – |
| pypdf | Pure-Python PDF library | 7.1.1 (18 Nov 2026) | BSD-3-Clause | – |
| rapidfuzz | C++ fuzzy string matching | 3.14.6 (30 Aug 2026) | MIT | – |
| spaCy and en_core_web_sm | NLP library and small English pipeline | spaCy 3.8.18 (26 Oct 2026); en_core_web_sm 3.8.0 (30 Sep 2024) | MIT (both) | NER F 0.846; POS 0.972 ([HF card](https://huggingface.co/spacy/en_core_web_sm); the card reflects v3.7.1) |
| sentence-transformers | Embedding and cross-encoder framework | 6.3.0 (11 Nov 2026) | Apache-2.0 | – |
| transformers | Hugging Face model library | 5.24.0 (21 Nov 2026) | Apache-2.0 | – |
| torch | PyTorch | 2.15.0 (28 Oct 2026) | BSD-style. PyPI lists Apache-2.0 plus BSD-2/3 for bundled parts. | – |
| FastAPI | Web API framework | 0.165.0 (18 Nov 2026) | MIT | – |
| reportlab | PDF generation | 5.1.0 (22 Oct 2026) | BSD | – |
| numpy | Array library | 2.5.5 (15 Nov 2026) | BSD-3-Clause (bundled code under 0BSD, MIT, Zlib, CC0) | – |

### Candidate swaps

**FactCG-DeBERTa-v3-Large**
- Repo: `yaxili96/FactCG-DeBERTa-v3-Large`. MIT licence for both model and code; NAACL 2025; 435M params.
- Loads with plain `AutoModelForSequenceClassification` (`num_labels=2`, `problem_type="single_label_classification"`). **No custom code and no trust_remote_code.**
- Input is a **single string**, not a sentence pair. Template from `factcg/utils.py`:

  `"{doc}\n\nChoose your answer: based on the paragraph above can we conclude that \"{claim}\"?\n\nOPTIONS:\n- Yes\n- No\nI think the answer is "`
- Tokenizer settings: `max_length=2048`, `truncation='only_first'`, and `tokenizer.pad_token = tokenizer.eos_token`.
- **Supported score = softmax(logits)[:, 1].** The default threshold is 0.5.
- The reference code splits the document into chunks of about 550 tokens on NLTK sentence boundaries, then takes the maximum score over chunks.
- Benchmarks: AggreFact 75.6 at a fixed threshold, 77.2 with a tuned threshold.
- Sources: [HF](https://huggingface.co/yaxili96/FactCG-DeBERTa-v3-Large), [GitHub](https://github.com/derenlei/FactCG).

**LettuceDetect**
- Repos: `KRLabsOrg/lettucedect-base-modernbert-en-v1` (149.6M params) and `KRLabsOrg/lettucedect-large-modernbert-en-v1` (395.8M). MIT licence. Architecture `ModernBertForTokenClassification`; 8,192-token context. The pip package is `lettucedetect` 0.2.3 (MIT).
- **Can be loaded with plain `AutoModelForTokenClassification`**, which is what the library does internally. ModernBERT needs transformers 4.48 or later.
- Input is a tokenizer pair: `tokenizer(prompt, answer, truncation="only_first", max_length=4096, return_offsets_mapping=True)`.
- `prompt` is the RAGTruth QA template:

  `"Briefly answer the following question:\n{question}\nBear in mind that your response should be strictly based on the following {n} passages:\n" + "passage 1: …\npassage 2: …" + "\nIn case the passages do not contain the necessary information to answer the question, please reply with: \"Unable to answer based on given passages.\"\noutput:"`
- **Labels: 1 = hallucinated (unsupported) token, 0 = supported.** Context tokens are ignored (label −100 in training). Only tokens after the answer start are read; runs of label-1 tokens are merged into character spans, and the span confidence is the maximum label-1 probability.
- Also available: EuroBERT multilingual variants (210M/610M, 7 languages, **no Hindi**); TinyLettuce Ettin 17–68M; v2 `lettucedect-v2-mmbert-base`.
- Sources: [GitHub](https://github.com/KRLabsOrg/LettuceDetect), [HF card](https://huggingface.co/KRLabsOrg/lettucedect-base-modernbert-en-v1).

**BAAI/bge-m3**
- MIT licence. XLM-R based; the weights file is 2.27 GB in fp32 (about 568M params). 8,192 tokens; dense, sparse and multi-vector modes; more than 100 languages.
- **MIRACL nDCG@10: average 69.2 (dense) / 71.5 (all modes); Hindi 59.5 (dense) / 63.3 (all).** For comparison, on Hindi BM25 scores 35.0 and mE5-large 62.0. MKQA Recall@100 is 75.1 (dense).
- Source: [arXiv 2402.03216](https://arxiv.org/html/2402.03216) (paper).

**Newer grounding checkers (2025–26)**

| Model | Size / licence | Numbers | CPU-feasible? |
|---|---|---|---|
| HHEM-2.3 | Commercial; available only through the Vectara API | Powers the Vectara leaderboard; no open numbers | n/a |
| Granite Guardian 3.3 8B | Apache-2.0; GGUF available; 4.1-8B also released | AggreFact 76.1–76.5; RAGTruth subset 83.1 | Slow (8B) |
| Bespoke-MiniCheck-7B | **CC BY-NC 4.0, not for commercial use** | AggreFact 77.4 | Slow (7B) |
| HalluGuard-4B | Apache-2.0 promised; **not released** | AggreFact 75.7 (77.1 elsewhere in the paper); RAGTruth subset 84.0 | No |
| Paladin-mini | 3.8B, Phi-4-mini based ([arXiv 2506.20384](https://arxiv.org/abs/2506.20384)); paper licence CC BY-NC-ND; model licence not found | AggreFact/RAGTruth numbers **not found** | Marginal |

No open grounding checker under 1B that beats FactCG-DeBERTa-L on LLM-AggreFact was found for 2026.

---

## Top 10 pitch-useful numbers

1. Stanford (JELS 2025, n=202): the best legal RAG tool, Lexis+ AI, was accurate on only **65%** of queries; Westlaw AI-AR on **41%**, with about **1 in 3 hallucinated**. Citing a real source that does not support the claim ("misgrounding") counts as a hallucination, which is the failure our verbatim-quote check targets.
2. FinanceBench: GPT-4-Turbo with retrieval got **81%** of filing questions wrong or refused them.
3. Vectara leaderboard (Oct 2026): even **gpt-5.4** adds unsupported content in **7.0%** of summaries; gpt-5.4-mini 5.5%, gpt-5-high 15.1%.
4. RAGTruth: **13.7%** of GPT-4's RAG answers had at least one hallucination, and 43% of answers across 6 LLMs did.
5. Our verifier class is competitive: FactCG-DeBERTa (0.4B, MIT) scores **75.6** on LLM-AggreFact, against GPT-4o at 75.9. MiniCheck is about **400x cheaper** than GPT-4.
6. IndiaFinBench (RBI/SEBI): changing the scoring rule alone reorders 12 LLMs (Spearman **ρ = −0.27**). We should report strict and judge scores side by side.
7. RBI FREE-AI survey: only **20.8%** of 612 regulated entities use AI, and of those only **18% keep audit logs** and 15% use interpretability tools. Our evidence pack is an audit log.
8. RBI Ombudsman FY25: **13.34 lakh complaints** (up 13.6%); **81.5%** of ORBIO complaints are against banks; **loans and advances are the top ground at 29.25%**.
9. India has **1,457 UCBs**: 838 are Tier 1 with deposits under ₹100 cr. Many cannot buy tools priced like Harvey (about $1,200 per seat per month); our answer costs about **$0.005** on gpt-5.4-mini.
10. Vals 2025: Thomson Reuters, LexisNexis and vLex **declined or withdrew** from the independent legal-research benchmark. Where the AI tools were tested, lawyers' baseline accuracy was 71%, and on redlining lawyers (79.7) still beat AI.
