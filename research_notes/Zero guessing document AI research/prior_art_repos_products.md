# Prior Art: Repos, Research and Products for "Zero-Guessing & Contradiction-Checking Document AI"

Research date: 2026-11-23. GitHub star counts and last-push dates were pulled live from the GitHub API on this date (format: stars / last push). "Stale" = no push in 12+ months.

---

## 1. Which GitHub repos implement citation-grounded / verifiable RAG with exact quote/span citations and PDF highlighting?

### Takeaway
Only a handful of open-source apps actually show the cited span highlighted inside the PDF (kotaemon is the clearest reference implementation); most "citation" RAG apps (AnythingLLM, Open WebUI, DocsGPT, LibreChat) just list source chunks. The strongest techniques for *verifiable* citations come from research code (ALCE, LongCite, ContextCite, Self-RAG, CRAG, RARR, FActScore) plus small NLI/grounding checkers (HHEM, MiniCheck, AlignScore, LettuceDetect) that a hackathon team can bolt on as a post-hoc verifier. The cheapest route to exact page + verbatim quote is the Anthropic Citations API, which returns `cited_text` with page numbers for PDFs natively.

### Cited Findings

**A. End-user apps with citation UIs**

| Name | Link | Stars / last push | What it does / key technique | What to borrow |
|---|---|---|---|---|
| kotaemon (Cinnamon) | https://github.com/Cinnamon/kotaemon | 25,925 / 2026-07-14 | Open-source RAG UI for chatting with documents; Gradio-based | (1) "View your citations (incl. relevant score) directly in the in-browser PDF viewer with highlights"; (2) "Warning when retrieval pipeline return low relevant articles" (a ready-made abstention trigger); (3) hybrid full-text + vector retrieval with re-ranking; (4) pluggable parsers (Azure Document Intelligence, Adobe PDF Extract, Docling, PaddleOCR); (5) optional GraphRAG / LightRAG / nano-GraphRAG — [kotaemon README](https://github.com/Cinnamon/kotaemon) |
| RAGFlow (infiniflow) | https://github.com/infiniflow/ragflow | 94,541 / 2026-11-22 | "Agent-native" RAG engine with deep document understanding — [repo](https://github.com/infiniflow/ragflow) | Very active; known for template-based chunking and grounded citations (see Gaps — UI details not verified this session) |
| PaperQA2 (FutureHouse) | https://github.com/Future-House/paper-qa | 9,638 / 2026-11-16 | "High accuracy RAG for answering questions from scientific documents with citations" — [repo](https://github.com/Future-House/paper-qa) | Agentic retrieve → evidence-gather (LLM summarizes each chunk w.r.t. the question and scores relevance) → answer with citations; also ships a contradiction mode (ContraCrow, see Section 2) — [PaperQA2 paper](https://arxiv.org/abs/2409.13740) |
| Open WebUI | https://github.com/open-webui/open-webui | 159,275 / 2026-11-22 | Generic chat UI with document RAG — [repo](https://github.com/open-webui/open-webui) | Very popular reference for chat + inline numbered source chips; not span-level |
| AnythingLLM | https://github.com/Mintplex-Labs/anything-llm | 68,517 / 2026-11-21 | All-in-one local doc chat — [repo](https://github.com/Mintplex-Labs/anything-llm) | Workspace-per-document-set pattern |
| DocsGPT (arc53) | https://github.com/arc53/DocsGPT | 18,373 / 2026-11-22 | Private agents/enterprise search — [repo](https://github.com/arc53/DocsGPT) | Source list under answers |
| Khoj | https://github.com/khoj-ai/khoj | 38,207 / 2026-08-02 | Self-hostable "AI second brain" over docs + web — [repo](https://github.com/khoj-ai/khoj) | Low relevance for this use case |
| Onyx (ex-Danswer) | https://github.com/onyx-dot-app/onyx | 33,503 / 2026-11-22 | Open-source enterprise AI chat/search — [repo](https://github.com/onyx-dot-app/onyx) | Enterprise connector + cited answer pattern |
| Open Notebook | https://github.com/lfnovo/open-notebook | 42,134 / 2026-11-18 | "Open Source implementation of Notebook LM" — [repo](https://github.com/lfnovo/open-notebook) | Clone of NotebookLM's sources-panel + cited chat layout |
| LibreChat | https://github.com/LibreChat-AI/LibreChat | 47,419 / 2026-11-22 | ChatGPT clone with RAG — [repo](https://github.com/LibreChat-AI/LibreChat) | Low relevance |
| Verba (Weaviate) | https://github.com/weaviate/Verba | 7,688 / 2026-06-08, **ARCHIVED** | RAG chatbot on Weaviate — [repo](https://github.com/weaviate/Verba) | Archived; do not build on it |
| Quivr | https://github.com/QuivrHQ/quivr → now redirects to The-Vibe-Company/quivr | 39,654 / 2026-11-16 | **Pivoted**: description now "An open-source engine that turns continuous content streams into search and monitoring" — [repo](https://github.com/The-Vibe-Company/quivr) | No longer a doc-QA reference |
| R2R (SciPhi) | https://github.com/SciPhi-AI/R2R | 8,105 / 2025-11-07 (**stale ~1 yr**) | "Agentic RAG" retrieval system — [repo](https://github.com/SciPhi-AI/R2R) | Avoid as a base (inactive) |
| Morphik core | https://github.com/morphik-org/morphik-core | 3,722 / 2026-11-20 | Multimodal retrieval engine — [repo](https://github.com/morphik-org/morphik-core) | Option for scanned/visual PDFs |
| txtai | https://github.com/neuml/txtai | 13,714 / 2026-11-22 | All-in-one semantic search + LLM workflows — [repo](https://github.com/neuml/txtai) | Lightweight embeddings index alternative |

**B. Framework-level citation components**

- LlamaIndex `CitationQueryEngine`: re-splits retrieved nodes into citation-sized chunks (default `citation_chunk_size`=512, overlap 20), labels each as a numbered "Source N", and prompts the LLM to cite those numbers — [LlamaIndex docs](https://developers.llamaindex.ai/python/examples/query_engine/citation_query_engine/); [workflow version](https://developers.llamaindex.ai/python/examples/workflow/citation_query_engine/). Known pain point: `response.source_nodes` labels don't line up with in-text citation numbers; users parse the "Source N" prefix to map them — [LlamaIndex community](https://community.llamaindex.ai/hey-can-we-know-which-nodes-are-used-by-rrwtyHqKQBMh). Community advice: chunk sizes under ~256 can hurt answer quality — [LlamaIndex community](https://community.llamaindex.ai/citation-query-engine-Rqw3NzvXbrcP). LlamaIndex repo: 52,983 / 2026-11-20 — [repo](https://github.com/run-llama/llama_index).
- Haystack (deepset): 27,077 / 2026-11-21 — [repo](https://github.com/deepset-ai/haystack). Orchestration framework; useful for pipelines, not a citation UI.
- **Anthropic Citations API** (strongest shortcut for "doc, page, verbatim quote"): PDFs are chunked by sentence and citations come back as `page_location` objects with 1-indexed page numbers; plain text returns `char_location` with 0-indexed character offsets — [Claude docs](https://platform.claude.com/docs/en/build-with-claude/citations). The `page_location` object carries `cited_text`, document index/title, start and end page (end page exclusive) — [claude-api Rust crate source](https://docs.rs/crate/claude-api/0.5.3/source/src/messages/citation.rs). `cited_text` does not count toward output tokens; scanned PDFs without extractable text cannot be cited — [Claude docs](https://platform.claude.com/docs/en/build-with-claude/citations); [Anthropic announcement](https://anthropic.com/news/introducing-citations-api); [Claude cookbook](https://platform.claude.com/cookbook/misc-using-citations).
- Google LangExtract: 39,348 / 2026-11-10 — "A Python library for extracting structured information from unstructured text using LLMs w[ith source grounding]" — [repo](https://github.com/google/langextract). Useful for clause extraction (interest rate, tenure, penalty) with character offsets back into the source.

**C. Parsing (prerequisite for exact page + bbox highlighting)**

- Docling: 70,880 / 2026-11-22 — [repo](https://github.com/docling-project/docling). MinerU: 84,146 / 2026-11-22, converts PDFs to LLM-ready markdown/JSON — [repo](https://github.com/opendatalab/MinerU). PyMuPDF: 11,181 / 2026-11-21, "Layout-aware document engine" — [repo](https://github.com/pymupdf/PyMuPDF). Unstructured: 15,771 / 2026-11-19 — [repo](https://github.com/Unstructured-IO/unstructured). spacy-layout: 914 / 2026-03-27 — [repo](https://github.com/explosion/spacy-layout).
- react-pdf-highlighter: 1,414 / 2024-11-22 (stale-ish but usable), React components for PDF annotation/highlighting — [repo](https://github.com/agentcooper/react-pdf-highlighter).

**D. Research code for attributed / self-verifying generation**

| Name | Link | Stars / last push | Key technique | What to borrow |
|---|---|---|---|---|
| ALCE (Princeton, EMNLP 2023) | https://github.com/princeton-nlp/ALCE | 533 / 2024-10 (stale) | Benchmark "Enabling LLMs to Generate Text with Citations"; defines citation recall/precision measured with an NLI model | Metric definition: a sentence is "supported" if its cited passages entail it (citation recall); a citation is "precise" if it's needed — directly maps to the faithfulness score — [repo](https://github.com/princeton-nlp/ALCE) |
| LongCite (THUDM) | https://github.com/THUDM/LongCite | 523 / 2024-12 (stale) | "Enabling LLMs to Generate Fine-grained Citations in Long-context QA" — sentence-level citations into long docs | Sentence-indexed context (number every sentence; model cites sentence IDs) — [repo](https://github.com/THUDM/LongCite) |
| ContextCite (MIT Madry Lab) | https://github.com/MadryLab/context-cite | 343 / 2024-10 (stale) | "Attribute (or cite) statements generated by LLMs back to in-context information" via context ablation | Post-hoc attribution; needs open-weights model access, so heavy for 36h — [repo](https://github.com/MadryLab/context-cite) |
| Self-RAG | https://github.com/AkariAsai/self-rag | 2,450 / 2024-05 (stale) | Model learns to retrieve, generate and critique itself (reflection tokens for relevance/support) | Borrow the *idea*: per-sentence "IsSupported" judgement as a prompted LLM/NLI check — [repo](https://github.com/AkariAsai/self-rag) |
| CRAG (Corrective RAG) | https://github.com/HuskyInSalt/CRAG | 477 / 2024-10 (stale) | Retrieval evaluator grades retrieved docs as correct/ambiguous/incorrect and triggers corrective action | Borrow the 3-way retrieval-confidence gate → abstain on "incorrect" — [repo](https://github.com/HuskyInSalt/CRAG) |
| RARR | https://github.com/anthonywchen/RARR | 53 / 2023-06 (stale) | "Researching and Revising What Language Models Say" — post-hoc research + revision of LLM output | Pattern: draft → find evidence → revise/delete unsupported sentences — [repo](https://github.com/anthonywchen/RARR) |
| FActScore | https://github.com/shmsw25/FActScore | 465 / 2025-04 | Evaluates long-form factuality by splitting into atomic facts and checking each against a knowledge source | Atomic-claim decomposition → % supported = faithfulness score — [repo](https://github.com/shmsw25/FActScore) |
| AttributionBench (OSU) | https://github.com/OSU-NLP-Group/AttributionBench | 11 / 2025-08 | "How Hard is Automatic Attribution Evaluation?" (ACL'24 Findings) | Warning that automatic attribution judges are imperfect — [repo](https://github.com/OSU-NLP-Group/AttributionBench) |
| WikiChat (Stanford OVAL) | https://github.com/stanford-oval/WikiChat | 1,629 / 2026-01-31 | "Stops the hallucination of LLMs by retrieving..." — claim extraction + fact-check of each claim before responding | Pipeline: generate → extract claims → verify each → keep only verified — [repo](https://github.com/stanford-oval/WikiChat) |
| OpenScholar | https://github.com/AkariAsai/OpenScholar | 1,692 / 2025-08 | Scientific literature synthesis with citations — [repo](https://github.com/AkariAsai/OpenScholar) | Self-feedback loop on citations |
| Ai2 ScholarQA lib | https://github.com/allenai/ai2-scholarqa-lib | 290 / 2026-11-16 | Open code for Ai2 Scholar QA — [repo](https://github.com/allenai/ai2-scholarqa-lib) | Quote-extraction-then-synthesize pipeline |

**E. Grounding / faithfulness checkers (the "faithfulness score" engine)**

- Vectara HHEM: open model outputs 0–1 (0 = hallucination, 1 = consistent), built on DeBERTa-v3-base, calibrated; score < 0.5 = likely hallucination; HHEM-2.1-Open on Hugging Face — [OECD catalogue](https://oecd.ai/en/catalogue/metrics/hughes-hallucination-evaluation-model-hhem-score); [Vectara HHEM-2.1 blog](https://www.vectara.com/blog/hhem-2-1-a-better-hallucination-detection-model); [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model/blame/main/README.md). Vectara's commercial "Factual Consistency Score" is attached to every Query API response — [SiliconANGLE](https://siliconangle.com/2024/03/26/vectara-adds-anti-hallucination-features-generative-ai-service/). Vectara hallucination leaderboard: 3,329 / 2026-11-17 — [repo](https://github.com/vectara/hallucination-leaderboard).
- MiniCheck (EMNLP 2024): "Efficient Fact-Checking of LLMs on Grounding Documents", 235 / 2025-08 — [repo](https://github.com/Liyan06/MiniCheck).
- AlignScore (ACL 2023): factual-consistency metric, 179 / 2024-03 (stale) — [repo](https://github.com/yuh-zha/AlignScore).
- LettuceDetect: "Span-level grounding verification for RAG", 627 / 2026-11-22 (active) — [repo](https://github.com/KRLabsOrg/LettuceDetect). Span-level = can highlight the unsupported words in red.
- Granite Guardian (IBM): detects risks incl. groundedness in responses, 192 / 2026-10-16 — [repo](https://github.com/ibm-granite/granite-guardian).
- RAG eval frameworks: Ragas 16,401 / 2026-11-14 (moved to vibrantlabsai/ragas) — [repo](https://github.com/vibrantlabsai/ragas); DeepEval 19,594 / 2026-11-22 — [repo](https://github.com/confident-ai/deepeval); TruLens 3,667 / 2026-11-20 — [repo](https://github.com/truera/trulens); Vectara open-rag-eval "RAG evaluation without golden answers" 427 / 2026-10-08 — [repo](https://github.com/vectara/open-rag-eval); ARES 739 / 2025-03 — [repo](https://github.com/stanford-futuredata/ARES). Guardrails AI 7,636 — [repo](https://github.com/guardrails-ai/guardrails); NeMo Guardrails 7,550 (now NVIDIA-NeMo/Guardrails) — [repo](https://github.com/NVIDIA-NeMo/Guardrails).
- Caution from research: CiteVQA reports models "frequently output correct text while grounding it in entirely incorrect visual evidence" — i.e., a citation can look right without supporting the answer — [CiteVQA arXiv 2605.12882](https://arxiv.org/pdf/2605.12882).

### Inferences
- Best 36-hour stack: Docling/PyMuPDF parse (keeps page + bbox) → hybrid BM25+vector + reranker (kotaemon recipe) → generation with Anthropic Citations API *or* sentence-ID-indexed context (LongCite style) → **deterministic verbatim check** (fuzzy string match of each quote against the page text; reject if not found) → per-sentence NLI check (HHEM-2.1-Open or MiniCheck, both small enough for CPU/GPU in a demo) → faithfulness % = supported sentences / total (ALCE citation-recall definition) → PDF viewer highlight via PyMuPDF `search_for()` bbox or react-pdf-highlighter.
- The verbatim string-match step is the cheapest, most demo-able "zero guessing" guarantee and is what distinguishes this from LlamaIndex-style numbered sources, which only point at a 512-token chunk.
- Context-ablation (ContextCite) and trained models (Self-RAG, LongCite fine-tunes) are **heavy** for 36h; borrow the ideas as prompts instead.

### Gaps
- I did not verify RAGFlow's, Open WebUI's, or AnythingLLM's current citation UI details (span highlight vs. chunk list) this session; star counts are verified, UI claims are not.
- The `verifiable-rag` PyPI package (described in search snippets as "sentence-level citations and NLI verification of every claim") could not be fetched (page failed to load), so its maturity is unverified — [PyPI](https://pypi.org/project/verifiable-rag/).

---

## 2. Which repos/products do contradiction or inconsistency detection across documents or contracts?

### Takeaway
There is no mature, maintained open-source "cross-contract contradiction detector"; the space is mostly datasets/benchmarks (ContractNLI, CUAD, ContraDoc, CLAUSE, LegalWiz/ContraGen) plus PaperQA2's ContraCrow for scientific claims. The practical recipe is claim/clause extraction → pairwise candidate generation (same topic/entity) → NLI or LLM judge labeling entail/contradict/neutral.

### Cited Findings
- **PaperQA2 ContraCrow**: agent on top of PaperQA2 that takes each claim in a paper and searches the literature for disagreeing papers; found 2.34 ± 1.99 contradictions per paper on a random biology subset, 70% validated by human experts; contradictions graded on a Likert scale to remove trivial ones; exposed as a `contracrow` setting where the query is the claim to check — [PaperQA2 arXiv 2409.13740](https://arxiv.org/abs/2409.13740v2); [FutureHouse PaperQA2 post](https://www.futurehouse.org/articles/wikicrow). **Borrow**: claim-by-claim contradiction search + Likert severity grading to suppress trivial conflicts.
- **ContractNLI** (Stanford, 2021): "Document-level Natural Language Inference for Contracts" — repo 15 stars / 2022-02 (stale, dataset only) — [repo](https://github.com/stanfordnlp/contract-nli). Labels a hypothesis as entailed/contradicted/not-mentioned against a whole contract with evidence spans — directly mirrors "contradiction" vs "I don't have proof".
- **CUAD** (NeurIPS 2021): contract clause extraction dataset, 579 / 2023-07 (stale) — [repo](https://github.com/The-Atticus-Project/cuad). Useful clause taxonomy (governing law, termination, etc.) for picking comparison categories.
- **CLAUSE benchmark** (arXiv 2511.00340): perturbs 7,500+ real contracts from CUAD and ContractNLI to inject discrepancies across ten categories, testing whether LLMs detect them — [CLAUSE paper](https://arxiv.org/html/2511.00340v2).
- **LegalWiz / ContraGen** (arXiv 2510.03418): multi-agent framework generating synthetic legal/enterprise documents with injected self- and pairwise contradictions; lists six contradiction types incl. authority and process conflicts; contradiction mining combines NLI models with LLM reasoning and confidence-weighted scoring — [LegalWiz](https://arxiv.org/pdf/2510.03418); [ContraGen v1](https://arxiv.org/html/2510.03418v1). **Borrow**: the contradiction-type taxonomy for UI labels; synthetic contradiction injection to build a demo test set.
- **ContraDoc** (arXiv 2311.09182): human-annotated self-contradictions in long documents; even GPT-4 struggles with subtle internal inconsistencies — code at [github.com/ddhruvkr/CONTRADOC](https://github.com/ddhruvkr/CONTRADOC) — [paper](https://arxiv.org/pdf/2311.09182v2).
- **LegalBench** (Hazy Research): 663 / 2026-03 — benchmark of legal reasoning tasks — [repo](https://github.com/HazyResearch/legalbench). **LexGLUE**: 276 / 2025-07 — [repo](https://github.com/coastalcph/lex-glue). **LexNLP** (LexPredict): 798 / 2024-05 (stale) — rule-based legal entity/date/amount extraction — [repo](https://github.com/LexPredict/lexpredict-lexnlp). Useful for deterministic extraction of dates/amounts/percentages that feed numeric contradiction checks.

### Inferences
- For a 36-hour build, numeric/date contradictions (interest rate 9.5% vs 10.25%, notice period 30 vs 60 days) can be detected deterministically by extracting typed values per clause type (LangExtract/LexNLP/regex) and diffing — far more reliable and demo-able than free-form NLI. Use an LLM/NLI judge only for qualitative clause conflicts, and show severity (ContraCrow-style Likert).
- Avoid O(n²) pairwise NLI over all clauses: block by clause type/topic first (CUAD categories), then compare within blocks.

### Gaps
- I found no maintained open-source product that does cross-document contract contradiction detection end-to-end; commercial contract tools (Kira, Luminance) were not confirmed to offer explicit contradiction detection in this session's sources.

---

## 3. Which tools handle regulatory amendment/version tracking or temporal validity of clauses?

### Takeaway
Commercial RegTech (Ascent, CUBE, Fintellix, TeamLease RegTrack) treats the *obligation* as the unit of change and shows side-by-side old-vs-new markups; academic work models legislation as "abstract work + dated versions" in a temporal graph to answer "what applied on date X". For India, the 2025 RBI consolidation into Master Directions makes "which circular is superseded" a highly topical demo.

### Cited Findings
- **AscentAI (Ascent RegTech)**: obligations-based change management; argues horizon-scanning tools don't reliably identify obligations within rules and amendments; AscentFocus builds a tailored obligations inventory; maps rule changes to impacted obligations; offers "a side-by-side markup comparison of the previous to new change"; connects to GRC tools — [Ascent](https://www.ascentregtech.com/rlm-platform/ascentfocus/); [Ascent blog](https://www.ascentregtech.com/blog/a-new-paradigm-for-regulatory-change-management/); [FinTech Global, Oct 2026](https://fintech.global/2026/10/30/why-ascentai-makes-obligations-the-unit-of-regtech-change/). (Vendor-authored claims.)
- **CUBE**: Automated Regulatory Intelligence (ARI) + Regulatory Change Management (RCM); acquired 4CRisk.ai for AI policy/control mapping — [A-Team Insight](https://a-teaminsight.com/briefs/cube-acquires-silicon-valley-regtech-4crisk-delivering-next-generation-compliance-and-risk-mapping-automation/?brand=ati); described as semantic AI mapping regulation to business obligations — [Microsoft industry blog](https://www.microsoft.com/en-gb/industry/blog/?p=71106).
- **India-specific**: RBI consolidated its rulebook in 2025 — reportedly ~9,445 legacy circulars reviewed, ~5,600 repealed, leaving 244 Master Directions — [OnFinance AI newsletter](https://onfinanceainewsletter.beehiiv.com/p/rbi-consolidates-decades-of-regulation-into-244-master-directions); [Mondaq](https://www.mondaq.com/india/financial-services/1727612/rbi-regulatory-reset-2025-navigating-the-consolidation-of-circulars-into-master-directions-video) (secondary sources; figures not verified against RBI directly). Fintellix Compliance Tracker tracks RBI guideline/circular changes with impact-area insights — [Fintellix solution sheet](https://fintellix.com/wp-content/uploads/2025/07/Fintellix_Data-and-Regulatory_Compliance-Tracker-Solution-Sheet.pdf.pdf). TeamLease RegTech "RegTrack" — [TeamLease](https://teamleaseregtech.com/blogs/102/compliance-management-systems-made-mandatory-by-rbi-for-banks). RBI's own "Index to RBI Circulars" page lists circulars — [RBI](https://www.rbi.org.in/scripts/BS_CircularIndexDisplay.aspx?Id=12603).
- **autoReg** (academic, IJRASET): NLP pipeline for RBI circulars covering retrieval, summarization, clause-level change detection, compliance mapping; weighted F1 0.78 for clause-level change detection on 75 RBI circulars — [IJRASET](https://www.ijraset.com/research-paper/an-integrated-nlp-pipeline-for-automated-regulatory-impact) (low-tier venue; treat numbers cautiously).
- **Temporal legal knowledge graphs**: Ontology-driven Graph RAG for legal norms separates abstract legal works from versioned expressions to support point-in-time retrieval, impact analysis, provenance (Brazilian Constitution case study) — [arXiv 2505.00039](https://arxiv.org/html/2505.00039v5). Component-level versioning for deterministic point-in-time reconstruction — [arXiv 2506.07853](https://arxiv.org/html/2506.07853v4). Agent layer over a temporal KG with point-in-time retrieval and causal lineage tracing — [arXiv 2510.06002](https://arxiv.org/pdf/2510.06002v2). LLM reconstruction of consolidated German statutes from 908 amendment–law pairs — [ACL NLLP 2025](https://aclanthology.org/2025.nllp-1.29). Standards: ELI point-in-time URIs; Akoma Ntoso XML — [arXiv 2506.07853](https://arxiv.org/html/2506.07853v4); [EU transitional provisions paper](https://cris.unibo.it/bitstream/11585/1024381/1/Detecting%20Transitional%20Provisions%20in%20EU%20Legislation.pdf).
- **Temporal KG libraries**: Graphiti (Zep) "Build Real-Time Knowledge Graphs for AI Agents", 33,003 / 2026-11-20 — [repo](https://github.com/getzep/graphiti) (bi-temporal edges with validity intervals is its known design; see Gaps). Microsoft GraphRAG 36,722 — [repo](https://github.com/microsoft/graphrag); LightRAG 40,814 — [repo](https://github.com/HKUDS/LightRAG); neo4j-graphrag-python 1,336 — [repo](https://github.com/neo4j/neo4j-graphrag-python).

### Inferences
- Hackathon-sized version of the LRMoo "work vs. expression" model: a tiny table `clause_versions(clause_key, doc_id, page, text, effective_from, effective_to, amended_by)` built by an LLM extraction pass that reads "This circular amends para X of circular Y w.e.f. DATE". Resolve "which applies today" with a deterministic query (latest `effective_from ≤ today` not superseded), then render the chain as a timeline A → B → C with the winning version highlighted. A full temporal graph DB (Graphiti/Neo4j) is **heavy** and unnecessary for a demo of 5–20 PDFs.
- Borrow Ascent's side-by-side redline (old clause vs. new clause, diff-highlighted) — cheap with Python `difflib`.

### Gaps
- Could not confirm Graphiti's bi-temporal model from a fetched source this session (stated from repo description only).
- Compliance.ai was not covered by retrieved sources.
- No open-source "consolidated version" tool for RBI circulars was found.

---

## 4. Commercial products in banking/legal doc AI — UI patterns for citations, confidence, refusal

### Takeaway
The dominant pattern is "click/hover a citation → jump to the exact highlighted passage in the source document" (Hebbia, NotebookLM), plus grid/matrix views where every cell is a cited answer (Hebbia Matrix, Harvey Vault). Explicit confidence scores are rare in legal tools; Vectara is the clearest example of a per-answer numeric factual-consistency score. Independent testing shows vendor "hallucination-free" claims don't hold, which is the opening for a visible faithfulness meter.

### Cited Findings
- **Hebbia Matrix**: every cell backed by a "Verifiable Fact Layer" with clickable citations linking to the source PDF; hover any AI answer to see the exact highlight in the original document — [Dynamic Business](https://dynamicbusiness.com/ai-tools/hebbia-revolutionizes-ai-interface-meet-the-matrix.html). Architecture separates a find-and-verify agent from a formatting agent (memo/grid/deck) — [Sacra](https://sacra.com/chat/h/d3d0bacd-aa2d-495c-940a-9a9c9b622ba4/). Hebbia MCP gives inline citations inside host tools — [Hebbia June 2026 update](https://hebbia.com/blog/whats-new-june-disclosure-2026).
- **Harvey Vault**: analyze up to 100,000 documents in a spreadsheet-style extraction interface — [Spellbook comparison](https://spellbook.com/briefs/hebbia-vs-harvey) (third-party). Harvey added citation-backed answers via LexisNexis — [Sacra](https://sacra.com/chat/h/d3d0bacd-aa2d-495c-940a-9a9c9b622ba4/).
- **NotebookLM**: inline citations; clicking opens the source and jumps to the exact passage — [PupuWeb](https://pupuweb.com/google-certified-gemini-educator-how-does-google-notebooklm-use-inline-citations-to-verify-source-information/); hovering shows the cited text in chat; one source says it was renamed "Gemini Notebook" in July 2026 (single unverified source) — [Hora de Codar](https://horadecodar.com.br/?p=45216).
- **Lexis+ AI**: five-stage check per prompt incl. citation validation; citations that can't be linked are flagged for manual validation — [LexisNexis](https://www.lexisnexis.com/community/insights/legal/b/thought-leadership/posts/legal-ai-citation-integrity). **Borrow**: an explicit "unverified citation" badge.
- **CoCounsel (Casetext/Thomson Reuters)**: pre-acquisition claim that it does not hallucinate because it is restricted to known sources, "or not to answer at all" — cited in [Stanford RegLab/HAI study](https://arxiv.org/html/2405.20362v1).
- **Independent reality check**: Stanford study found Lexis+ AI and Ask Practical Law AI gave incorrect information >17% of the time, Westlaw AI-Assisted Research >34%; a citation can be "hallucination-free" only in the narrow sense that it exists; refusal / unresponsive answers counted as a separate failure mode — [Stanford HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries); [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1).
- **Vectara**: Factual Consistency Score (HHEM-based) returned with every Query API call — [SiliconANGLE](https://siliconangle.com/2024/03/26/vectara-adds-anti-hallucination-features-generative-ai-service/).
- **EvenUp** (legal): line-level evidence verification; deterministic citation matching for briefs — [Sacra](https://sacra.com/chat/h/5288ef19-83b7-4038-998f-773cf6b8eeeb/); [Sacra](https://sacra.com/chat/h/79829983-17bd-419b-b5a1-f1634248a37e/).

### Inferences
- Steal-worthy UI patterns (all cheap): (1) superscript citation chips per sentence; hover = quote tooltip, click = PDF scrolls to page with yellow bbox highlight (Hebbia/NotebookLM); (2) per-sentence colouring green/amber/red by NLI support, with overall faithfulness % gauge (Vectara FCS idea, made more granular); (3) "Unverified" badge on any quote that fails verbatim match (Lexis+ AI pattern); (4) a matrix view: rows = documents, columns = questions (interest rate, prepayment penalty, governing law), each cell a cited value, conflicting cells highlighted red (Hebbia Matrix / Harvey Vault); (5) a first-class abstain card "I don't have proof — closest evidence found: …" rather than a blank refusal (the Stanford study treats unresponsive refusal as a failure, so show what *was* found).

### Gaps
- No official vendor documentation was retrieved for Harvey Vault's citation UI, Kira, Luminance, AlphaSense, or Glean citation behavior; I found nothing on how legal tools display numeric confidence or refusal states.

---

## 5. Past hackathon projects / competitions on hallucination-free grounded document QA

### Takeaway
"Chat with PDF + citations + refuse when unsupported" is a crowded hackathon genre (lablab.ai, FOSS Hack, GitHub portfolios), so the differentiators must be contradiction detection, amendment-chain resolution and a measurable faithfulness score — not citations alone.

### Cited Findings
- **DocuMind** (lablab.ai AMD Developer Hackathon): React/TS + Supabase, Gemma; citations with the exact snippet; says when the answer isn't in the document — [lablab.ai](https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-ii/nexus-builders/documind-chat-with-your-pdfs); [submission](https://lablab.ai/submissions/qrmg2khwfk8w1yjjulkptp69).
- **DocMind**: hybrid retrieval, cross-encoder reranking, hallucination guards; declines when context is weak — [GitHub](https://github.com/Neogenxx/DocMind).
- **DocuLens**: citations verified against retrieved text; "insufficient evidence" response; limits: no OCR, keyword retrieval — [Contra](https://contra.com/p/qomOEMle-ai-for-document-qanda-with-source-citations).
- **SideQuest** (FOSS Hack 2026): grounded strictly in uploaded doc with page and section citations — [FOSS United](https://fossunited.org/hack/fosshack26/p/ahlnh3pgjc); [GitHub](https://github.com/Janmesh23/sidequest).
- **CiteVQA** benchmark for evidence attribution in document intelligence — [arXiv 2605.12882](https://arxiv.org/pdf/2605.12882).

### Inferences
- Judges will have seen citation-only PDF chat many times; lead the demo with a contradiction alert and an amendment timeline, and show the faithfulness % dropping when a sentence is unsupported.

### Gaps
- No Devpost gallery entry or Kaggle competition specifically on hallucination-free document QA was found in this session.

---

## 6. What distinguishes the best systems from naive "LangChain + vector DB + LLM" RAG?

### Takeaway
The best systems add (a) layout-aware parsing that preserves page/bbox, (b) hybrid retrieval + reranking + a retrieval-quality gate, (c) fine-grained (sentence/span) citations rather than chunk IDs, (d) a separate verification stage that checks each claim against its quote, and (e) explicit abstention and contradiction outputs.

### Cited Findings
- Hybrid full-text + vector retrieval + reranking, and low-relevance warnings — [kotaemon](https://github.com/Cinnamon/kotaemon).
- Retrieval-quality evaluator gating generation (correct/ambiguous/incorrect) — [CRAG](https://github.com/HuskyInSalt/CRAG).
- Sentence-level fine-grained citations in long context — [LongCite](https://github.com/THUDM/LongCite); NLI-based citation recall/precision — [ALCE](https://github.com/princeton-nlp/ALCE).
- Separate find-and-verify agent from writer agent — [Sacra on Hebbia](https://sacra.com/chat/h/d3d0bacd-aa2d-495c-940a-9a9c9b622ba4/).
- Claim extraction + per-claim verification before responding — [WikiChat](https://github.com/stanford-oval/WikiChat); atomic-fact scoring — [FActScore](https://github.com/shmsw25/FActScore).
- Calibrated consistency score per answer — [Vectara HHEM](https://www.vectara.com/blog/hhem-2-1-a-better-hallucination-detection-model).
- Span-level unsupported-text detection — [LettuceDetect](https://github.com/KRLabsOrg/LettuceDetect).
- Naive chunk-level citations have a known mismatch between cited numbers and source nodes — [LlamaIndex community](https://community.llamaindex.ai/hey-can-we-know-which-nodes-are-used-by-rrwtyHqKQBMh).

### Inferences
- **Ranked "steal list" for 36 hours** (effort: L=low, M=medium, H=heavy):
  1. (L) Verbatim-quote guarantee: require model to output `{doc, page, quote}` per sentence; fuzzy-match quote against stored page text; drop/flag non-matches.
  2. (L) Anthropic Citations API or sentence-numbered context to get page + `cited_text` natively.
  3. (L) PDF highlight: PyMuPDF `search_for(quote)` → bbox → overlay in pdf.js / react-pdf-highlighter.
  4. (L/M) Faithfulness % = sentences entailed by their quote (HHEM-2.1-Open or MiniCheck) / total; per-sentence traffic-light colouring.
  5. (L) Abstention: retrieval-score threshold (kotaemon/CRAG) + "if no verified quote, answer = I don't have proof" + show closest evidence.
  6. (M) Contradiction finder: typed value extraction per clause type → deterministic diff; LLM/NLI for qualitative conflicts; Likert severity (ContraCrow).
  7. (M) Amendment chain: LLM extracts (amends, target clause, effective date) → versions table → timeline UI + side-by-side redline (Ascent pattern).
  8. (M) Matrix view across documents (Hebbia/Harvey Vault).
  9. (H, skip) Fine-tuning Self-RAG/LongCite models, ContextCite ablation, full temporal KG (Graphiti/Neo4j), GraphRAG indexing.

### Gaps
- No head-to-head benchmark comparing HHEM vs. MiniCheck vs. LettuceDetect on legal/banking text was retrieved; choice should be validated on a small hand-labelled set during the hackathon.
