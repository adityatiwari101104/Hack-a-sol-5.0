# Competitor and overlap repos for "Proof-or-Silence" (zero-guessing, contradiction-checking regulatory document AI)

Method note: star counts, `pushed_at` dates (last push to any branch; a proxy for "last commit") and SPDX license IDs below were pulled live from the GitHub REST API on 2026-11-23 with `gh api repos/<owner>/<repo>`. "NOASSERTION" means GitHub could not classify a custom license. Feature claims come from each repo's own README (fetched the same day) unless another source is cited. Vendor benchmark numbers are the vendor's own claims and have not been checked independently. This file covers what the earlier report (`reports/Zero guessing document AI research.md`) did not: repo renames and archivals, license traps, new 2026 projects, India-specific repos, and contradiction/temporal/compliance tools.

## Q1. Citation-grounded QA with verifiable quotes / page highlights: who does it, and how do they compare?

### Takeaway
The large platforms (RAGFlow, Kotaemon, Open WebUI, Onyx, AnythingLLM, LlamaIndex) all show "citations". None of them checks a verbatim quote deterministically, gates an answer on entailment, or understands that a rule can be superseded. Their real advantages over us are UI polish (in-PDF highlight, chunk visualisation) and parsing breadth. The closest architectural peers are small 2026 projects, especially **Axiom Engine** (verbatim quote plus a tier taxonomy that includes a "Conflicted" tier) and **PaperQA2** (RCS plus contradiction detection). None of them has amendment versioning or an as-of date.

### Cited Findings
**Platform / app layer (big, active)**
- **infiniflow/ragflow**: 94,594 stars, pushed 2026-11-23, Apache-2.0. Released 1.0.0 on 2026-11-06. Offers "grounded citations with reduced hallucinations", visualisation of chunking for human intervention, template-based chunking, DeepDoc (CPU layout/OCR/table recognition), "Knowledge Compilation" (2026-08-19) that generates Wikis, Graphs, Trees, PageIndex, Mind Maps and **Timelines**, and Agentic RAG with Low/Medium/High/Ultra thinking modes — [RAGFlow README](https://github.com/infiniflow/ragflow)
- **Cinnamon/kotaemon**: 25,929 stars, last push 2026-07-14 (slowing), Apache-2.0. Hybrid full-text + vector retriever with re-ranking, "advanced citations with document preview" (in-browser PDF with highlights and relevance scores), optional nano-GraphRAG / MS GraphRAG, built on Gradio — [Kotaemon README](https://github.com/Cinnamon/kotaemon)
- **open-webui/open-webui**: 159,343 stars, pushed 2026-11-23. Uses a custom "Open WebUI License" (BSD-style text, not a standard SPDX license; GitHub reports NOASSERTION) — [Open WebUI LICENSE](https://github.com/open-webui/open-webui/blob/main/LICENSE)
- **onyx-dot-app/onyx**: 33,514 stars, pushed 2026-11-23. Split license: content under `ee/` directories is under the Onyx Enterprise License, the rest is open — [Onyx LICENSE](https://github.com/onyx-dot-app/onyx/blob/main/LICENSE)
- **Mintplex-Labs/anything-llm**: 68,547 stars, pushed 2026-11-21, MIT, "local-first agent" positioning — [GitHub API / repo](https://github.com/Mintplex-Labs/anything-llm)
- **run-llama/llama_index**: 52,987 stars, pushed 2026-11-20, MIT. Now describes itself as "the document processing platform for AI" — [repo](https://github.com/run-llama/llama_index)
- **deepset-ai/haystack**: 27,083 stars, pushed 2026-11-23, Apache-2.0 — [repo](https://github.com/deepset-ai/haystack)
- **khoj-ai/khoj**: 38,219 stars, pushed 2026-08-02, **AGPL-3.0** — [repo](https://github.com/khoj-ai/khoj)
- **pathwaycom/llm-app has been renamed `pathwaycom/serviette`** (58,680 stars, MIT, pushed 2026-11-10). It is a no-code RAG server that keeps answers "in sync with your documents" within seconds of an edit, cites sources, and needs a free Pathway license key — [serviette README](https://github.com/pathwaycom/serviette)

**Status changes since the first pass (check before citing)**
- **weaviate/Verba is archived** (7,688 stars, BSD-3-Clause, last push 2026-06-08) — [repo](https://github.com/weaviate/Verba)
- **SciPhi-AI/R2R**: last push 2025-11-07, so inactive for about a year (8,107 stars, MIT) — [repo](https://github.com/SciPhi-AI/R2R)
- **Quivr now resolves to The-Vibe-Company/quivr** (39,656 stars, MIT). It is now "an open-source engine that turns continuous content streams into search and monitoring", no longer document QA — [repo](https://github.com/The-Vibe-Company/quivr)
- **microsoft/PIKE-RAG is archived** (2,465 stars, MIT, last push 2025-09-10) — [repo](https://github.com/microsoft/PIKE-RAG)

**Research-grade citation QA**
- **Future-House/paper-qa (PaperQA2)**: 9,646 stars, pushed 2026-11-16, Apache-2.0. Does QA, summarisation and **contradiction detection**. Uses LLM re-ranking with contextual summarisation (RCS). Added multimodal contextual summarisation (media objects go to the summary LLM). Switched to calendar versioning in Dec 2025. Citation metadata includes a retraction check — [PaperQA README](https://github.com/Future-House/paper-qa)
- **THUDM/LongCite**: 523 stars, **last push 2024-12-31** (stale), Apache-2.0 — [repo](https://github.com/THUDM/LongCite)
- **MadryLab/context-cite**: 343 stars, last push 2024-10-08 (stale), MIT — [repo](https://github.com/MadryLab/context-cite)
- **princeton-nlp/ALCE**: 533 stars, last push 2024-10-09, MIT — [repo](https://github.com/princeton-nlp/ALCE)
- **stanford-oval/WikiChat**: 1,629 stars, last push 2026-01-31, Apache-2.0 — [repo](https://github.com/stanford-oval/WikiChat)

**Graph / structure-first retrieval**
- **microsoft/graphrag**: 36,727 stars, pushed 2026-11-23, MIT — [repo](https://github.com/microsoft/graphrag)
- **HKUDS/LightRAG**: 40,834 stars, pushed 2026-11-23, MIT (EMNLP 2025) — [repo](https://github.com/HKUDS/LightRAG)
- **HKUDS/RAG-Anything**: 24,781 stars, pushed 2026-11-23, MIT — [repo](https://github.com/HKUDS/RAG-Anything)
- **OSU-NLP-Group/HippoRAG**: 4,139 stars, pushed 2026-10-06, MIT — [repo](https://github.com/OSU-NLP-Group/HippoRAG)
- **VectifyAI/PageIndex**: 40,761 stars, pushed 2026-11-21, MIT. "Vectorless, reasoning-based RAG" over a document tree with no chunking. In Nov 2026 it announced "PageIndex Agent" with **line-level citations** and stated that it "removed OCR from every PageIndex product" — [PageIndex README](https://github.com/VectifyAI/PageIndex)
- **D-Star-AI/dsRAG**: 1,590 stars, last push 2025-11-10, MIT — [repo](https://github.com/D-Star-AI/dsRAG)

**Parsing (all keep page/bbox; relevant to our pdfplumber layer)**
- **docling-project/docling**: 70,920 stars, pushed 2026-11-23, MIT. `docling-serve` (1,930 stars, MIT) wraps it as an API — [docling](https://github.com/docling-project/docling); [docling-serve](https://github.com/docling-project/docling-serve)
- **opendataloader-project/opendataloader-pdf** (new, 30,360 stars, pushed 2026-11-23, Apache-2.0). Outputs JSON "with bounding boxes for every element", XY-Cut++ reading order, a deterministic local mode at 0.015 s/page, and a hybrid AI mode it says ranks first (0.907 overall, 0.928 table accuracy on 200 PDFs; **self-reported**) — [OpenDataLoader README](https://github.com/opendataloader-project/opendataloader-pdf)
- **opendatalab/MinerU**: 84,205 stars, pushed 2026-11-22. **License trap:** Apache-2.0 plus extra terms. Commercial users with more than 100M MAU or more than USD 20M monthly revenue need a separate license — [MinerU LICENSE](https://github.com/opendatalab/MinerU/blob/master/LICENSE.md)
- **datalab-to/marker**: 41,031 stars, pushed 2026-11-20, Apache-2.0 (code) — [repo](https://github.com/datalab-to/marker)
- **pymupdf/PyMuPDF** is **AGPL-3.0** (11,183 stars), while **jsvine/pdfplumber** (our parser) is MIT (10,923 stars, pushed 2026-11-21) — [PyMuPDF](https://github.com/pymupdf/PyMuPDF); [pdfplumber](https://github.com/jsvine/pdfplumber)
- **allenai/olmocr**: 19,842 stars, last push 2026-03-25, Apache-2.0 — [repo](https://github.com/allenai/olmocr)
- **Unstructured-IO/unstructured**: 15,775 stars, Apache-2.0 — [repo](https://github.com/Unstructured-IO/unstructured)

**Extraction with source grounding**
- **google/langextract**: 39,350 stars, pushed 2026-11-23, Apache-2.0. Maps every extraction to its exact location in the source. Automatically detects extractions "that cannot be located in the source text" (for example, ones copied from few-shot examples). Generates a self-contained interactive HTML review view — [LangExtract README](https://github.com/google/langextract)

**PDF highlight UI**
- **agentcooper/react-pdf-highlighter**: 1,414 stars, last push 2024-11-22, MIT. **DanielArnould/react-pdf-highlighter-extended**: 111 stars, last push 2024-11-22, MIT. Both are stale but usable — [original](https://github.com/agentcooper/react-pdf-highlighter); [extended](https://github.com/DanielArnould/react-pdf-highlighter-extended)

**Closest small peers (2026, low stars, same thesis as ours)**
- **FurkhanShaikh/axiom-rag-engine** (MIT, pushed 2026-11-20, on PyPI as `axiom-rag-engine`). Every claim carries a verbatim quote checked deterministically, then a model faithfulness verdict, then a tier: 1 Authoritative (official .gov or treaty-org domain), 2 Multi-Domain, 3 Model-Assisted / "Unverified (never silent)", 4 Misrepresented, 5 substring check failed, and an opt-in **6 Conflicted** "when cited sources actively contradict each other". Exposes separate `source_class` and `agreement` fields. Optional corroboration check, a rewrite loop for Tier 4/5, production mode that fails closed, a per-key daily USD budget, and a BENCHMARKS.md regression gate — [Axiom README](https://github.com/FurkhanShaikh/axiom-rag-engine)
- **gyanpattnaik/UAE-Regulatory-Compliance-RAG-Agent** (2 stars, pushed 2026-09-07). Regulator corpus (CBUAE etc.), hybrid + RRF + ms-marco cross-encoder, server-side refusal threshold before the LLM is called, substring verification of every quote, and a composite confidence score ("40% retrieval confidence…") instead of LLM self-reported confidence. Chunks are prefixed `[Regulator | Doc Title | Section]`. Reports 93% fact recall and 100% citation verification on **20 questions** — [UAE agent README](https://github.com/gyanpattnaik/UAE-Regulatory-Compliance-RAG-Agent)
- Other tiny "citation-verified RAG" repos from 2026 (TrueCite, TraceRAG, cbh-rag, ckd-rag-system) show the pattern is common. All have 0–1 stars — [TrueCite](https://github.com/SumanthMamidi-MNS/TrueCite); [TraceRAG](https://github.com/Malaika-Naz315/TraceRAG)

### Inferences
- **What they do better than us:** RAGFlow and Kotaemon offer an in-browser PDF viewer with highlight, plus chunk visualisation and editing. RAGFlow's "Timelines" compilation is the nearest thing in a big platform to our amendment timeline. PageIndex and RAGFlow have tree/ToC navigation. Docling and OpenDataLoader parse layout and tables better than raw pdfplumber.
- **What we beat them on:** None of the platforms (a) checks a quote verbatim against the source deterministically, (b) has a verifier ladder whose verdict cannot be overridden by the generator, (c) models valid_from/valid_to with as-of status, (d) separates CONFLICT from SUPERSESSION and DIFFERENT_CONDITION, or (e) reports a fabricated-quote rate against a baseline. Axiom is the only peer with a "Conflicted" tier, and it compares *web sources* with no notion of time or condition. Our triage is strictly richer.
- **Borrow:** (1) Axiom's honest tier vocabulary ("what it proves / what it does not prove"), with uncited or unverified output never silent, and a separate `agreement` field. This maps onto our ladder as a UI legend. (2) The UAE repo's `[Regulator | Doc | Section]` contextual prefix, which is cheap to add to our breadcrumbs. (3) LangExtract's "extraction not located in source → reject" check and its HTML review page for our value tuples. (4) An evaluation of OpenDataLoader's deterministic bbox JSON as a table/structure layer next to pdfplumber (Apache-2.0, fast, local).
- **Licensing:** keep pdfplumber (MIT) rather than PyMuPDF (AGPL). Avoid copying code from MinerU (extra terms), Khoj (AGPL), Onyx `ee/` and Phoenix (ELv2) if the project may ship commercially.

### Gaps
- `pushed_at` reflects any branch, not the default-branch commit date. Exact last-commit dates on `main` were not pulled.
- Not checked: whether Open WebUI's or Onyx's citation UIs added quote verification in late 2026 (their READMEs were not read in full).
- No independent benchmark of OpenDataLoader's "#1" claim was found.

## Q2. Contradiction detection, versioned/temporal legal text, amendment tracking, compliance checking

### Takeaway
No open repo combines amendment-chain reconstruction, as-of-date validity and typed contradiction triage the way Proof-or-Silence does. The nearest work splits into four groups: temporal knowledge graphs (Graphiti, Cognee, which are generic agent memory), legislation platforms (i.AI Lex, Laws.Africa Indigo, Akoma Ntoso), compliance checkers (ARCCS) and conflict datasets (Clash-of-Leges). The strongest academic match, SAT-Graph RAG from Brazil's Federal Senate, has no public code that I could find.

### Cited Findings
- **getzep/graphiti**: 33,026 stars, pushed 2026-11-23, Apache-2.0. A temporal "context graph" in which each fact (edge) has a validity window. "When information changes, old facts are invalidated — not deleted. Query what's true now, or what was true at any point in time." Supports Pydantic custom entity and edge types. Paper: [Zep: A Temporal Knowledge Graph Architecture, arXiv 2501.13956](https://arxiv.org/abs/2501.13956) — [Graphiti README](https://github.com/getzep/graphiti)
- **topoteretes/cognee**: 33,510 stars, pushed 2026-11-23, Apache-2.0. An agent memory platform — [repo](https://github.com/topoteretes/cognee)
- **SAT-Graph RAG** (Hudson de Martim, Federal Senate of Brazil). An ontology-driven graph RAG for legal norms, using an LRMoo-inspired split between abstract legal *Works* and their versioned *Expressions*. It builds point-in-time states by reusing unchanged components and models legislative events as explicit *Action* nodes, with the Brazilian Constitution as its case study. A follow-up paper, "Deterministic Legal Agents" (SAT-Graph API), proposes atomic, auditable primitives that separate probabilistic discovery from deterministic retrieval. Published in Frontiers in AI and Applications (DOI 10.3233/FAIA251598) — [arXiv 2505.00039](https://arxiv.org/abs/2505.00039v5); [arXiv 2510.06002](https://arxiv.org/html/2510.06002v2). A web search found no GitHub repository.
- **i-dot-ai/lex** (UK government i.AI): 82 stars, pushed 2026-11-22, MIT. A UK legal API plus MCP server: 220K Acts and SIs, **892K amendments**, 89K explanatory notes, hybrid semantic search. Marked "experimental… not a production dependency" — [Lex README](https://github.com/i-dot-ai/lex)
- **laws-africa/indigo**: 78 stars, pushed 2026-11-23, custom license. A legislation publishing platform built on Akoma Ntoso. **laws-africa/bluebell**: a generic Akoma Ntoso 3 parser, GPL-3.0, pushed 2026-07-13. **laws-africa/slaw** is archived — [indigo](https://github.com/laws-africa/indigo); [bluebell](https://github.com/laws-africa/bluebell); [slaw](https://github.com/laws-africa/slaw)
- **Open-Source-Legal/OpenContracts**: 1,552 stars, pushed 2026-11-21, MIT. A "programmable citation graph". Every statutory citation is detected, resolved and drawn as an edge. **Law the library does not yet hold is tracked as a backlog and drawn as dashed nodes until ingested.** Citations are highlighted inline, a References panel shows reverse citations, and it ships GraphQL/REST, an MCP server and a corpus-scoped agent — [OpenContracts README](https://github.com/Open-Source-Legal/OpenContracts)
- **geofila/ARCCS** (accepted at EMNLP 2026 System Demonstrations): 6 stars, pushed 2026-08-27, **no license file**. It breaks regulatory text into atomic, traceable requirements and checks a target document against each one, assigning one of four labels: **Compliant, Non-Compliant, Insufficient Information, Human Required** (abstention and deferral are explicit outcomes). Reports 98.8% violation-detection accuracy on more than 1,200 EU public-procurement rule checks — [ARCCS README](https://github.com/geofila/ARCCS)
- **disi-unibo-nlp/clash-of-leges**: a bilingual (IT/EN) dataset for detecting and explaining conflicts in statutory law, built from Italian Constitutional Court rulings, with a binary `label` for conflicting article pairs. No license file; last push 2025-10-10 — [Clash-of-Leges README](https://github.com/disi-unibo-nlp/clash-of-leges)
- **Contradiction-detection research (no tool released):** GPT-4 on injected contradictions in regulatory text [arXiv 2412.20602](https://arxiv.org/abs/2412.20602v1). A prompt-engineered classifier with 26 rules reports F1 0.851 across seven LLMs [U. Hawaiʻi ScholarSpace](https://scholarspace.manoa.hawaii.edu/items/12f45ca7-374d-4108-87df-af515716f8af). "RegDivergence-101" (FDA/EMA cross-jurisdiction contradiction benchmark) [arXiv 2608.28607](https://arxiv.org/pdf/2608.28607). The arXiv ID was not verified; treat it with caution.
- **eeshsaxena/Conflict-Aware-Graph-RAG ("TruthfulRAG v5")**: 16 stars, IIIT Manipur, pushed 2026-07-16, no license. Neo4j knowledge graph with temporal decay on edges (`e^(-0.08 × age_in_years)`), temporal snapshots anchored to a year, entropy-based path filtering, and SUPPORTED/REFUTED/UNCERTAIN claim verification (for example "The BNS replaced the IPC in 2024"). Builds on TruthfulRAG, arXiv 2511.10375 — [README](https://github.com/eeshsaxena/Conflict-Aware-Graph-RAG)
- **Vladimir-Ershov/adgm-kg1 (OpenRegs)**: a regulatory knowledge graph of Abu Dhabi Global Market rules (26 documents, 22,027 paragraphs), CC-BY-4.0, last push 2025-09. NER for entity, permission, act, product, risk and mitigation types, stored in Neo4j. Relation extraction is unfinished — [README](https://github.com/Vladimir-Ershov/adgm-kg1)
- **Rules-as-code:** CatalaLang/catala (2,451 stars, pushed 2026-11-23, Apache-2.0); Lexpedite/blawx (161 stars, last push 2024-11-01, MIT) — [catala](https://github.com/CatalaLang/catala); [blawx](https://github.com/Lexpedite/blawx)
- **Benchmarks:** HazyResearch/legalbench (663 stars, last push 2026-03-30, no repo license); zeroentropy-ai/legalbenchrag (220 stars, last push 2025-05-30, MIT); The-Atticus-Project/cuad (579 stars, last push 2023-07-13) — [legalbench](https://github.com/HazyResearch/legalbench); [legalbenchrag](https://github.com/zeroentropy-ai/legalbenchrag); [cuad](https://github.com/The-Atticus-Project/cuad)
- **LexPredict/lexpredict-lexnlp**: AGPL-3.0, last push 2024-05-27 (stale) — [repo](https://github.com/LexPredict/lexpredict-lexnlp)

### Inferences
- **We beat all of these on the combination.** Graphiti has validity windows but is generic agent memory: no clause tree, no footnote-based amendment parsing, no verbatim quote per edge. Lex has amendment *data* for the UK but no QA verifier. ARCCS checks compliance but has no version or as-of logic. TruthfulRAG's exponential time decay is the wrong model for law: a rule does not fade with age, it stays in force until it is withdrawn. Our valid_from/valid_to plus a computed status is the correct one, and this is a pitch point.
- **SAT-Graph RAG is academic validation of our design** (Work vs Expression ≈ clause_key vs version rows; Action nodes ≈ our WITHDRAWS/AMENDED_BY edges; "deterministic retrieval primitives" ≈ our code-side status computation). Cite it as "the Brazilian Senate's approach, which we implement for RBI".
- **Borrow:** (1) OpenContracts' **dashed "not-in-corpus" nodes**. When a REFERS_TO edge points to a circular we have not ingested, show it as a dashed node and say "cannot verify; source not loaded". This extends abstention into the graph. (2) ARCCS's four-label scheme, including **Human Required**, for our bank-document vs RBI-obligation checks. Our obligations engine could output Compliant / Non-Compliant / Insufficient Information / Human Required per obligation. Re-implement it rather than copy, since ARCCS has no license. (3) Graphiti's wording, "invalidated, not deleted", for the UI and README. (4) Lex/OpenContracts-style MCP exposure of our `/ask` and `/as_of` endpoints, so the system can be called from Claude or Cursor; this is a cheap "platform" story. (5) Clash-of-Leges as an outside sanity set for the CONFLICT classifier. It is Italian/English constitutional law, so use it only as a stress test.
- An Akoma Ntoso export of our clause tree (via bluebell's grammar ideas) would be a credible "standards-compliant" talking point, but it is optional.

### Gaps
- No public code found for SAT-Graph RAG, RegDivergence-101 or Ascent-style regulatory change tools.
- No open repo found that reconstructs versions from *footnotes* (RBI's Master Direction footnote style). This looks unique to us, but absence from search is not proof.
- GitHub search was rate-limited partway through (HTTP 403 after about 25 searches), so some long-tail queries ("legislation diff amendment", "point in time law") returned nothing and may be under-covered.

## Q3. Hallucination detection / attribution verification we could swap in or compare

### Takeaway
Our stack (HHEM-2.1 → MiniCheck → small LLM judge) is still reasonable, but MiniCheck, AlignScore and RefChecker are now stale or archived. LettuceDetect is the actively maintained span-level option (v0.2.x in mid-2026, typed spans, multilingual). The evaluation frameworks (RAGAS, DeepEval, TruLens, UQLM) suit offline comparison tables, not a runtime gate.

### Cited Findings
- **KRLabsOrg/LettuceDetect**: 627 stars, pushed 2026-11-22, MIT. Now a "span-level grounding verifier" that returns exact character spans. v0.2.0 (2026-06-22) added `lettucedect-v2-qwen-2b` (generative, **typed spans**) and `lettucedect-v2-mmbert-base` (encoder). 0.2.2 shipped on 2026-07-05. Earlier releases: TinyLettuce (Ettin 17M/32M/68M) and multilingual EuroBERT models (7 languages, claimed "up to 17 F1 points" over GPT-4.1-mini judges). Context of 4K tokens (ModernBERT) or 8K (EuroBERT). Its EuroBERT models need `transformers<5` — [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect); paper at [GroundLM 2026](https://aclanthology.org/2026.groundlm-1.44/)
- **Liyan06/MiniCheck**: 235 stars, **last push 2025-08-27**, Apache-2.0 — [repo](https://github.com/Liyan06/MiniCheck)
- **yuh-zha/AlignScore**: 179 stars, **last push 2024-03-11** (stale), MIT — [repo](https://github.com/yuh-zha/AlignScore)
- **amazon-science/RefChecker: archived** (439 stars, Apache-2.0, last push 2025-05-16) — [repo](https://github.com/amazon-science/RefChecker)
- **derenlei/FactCG** (NAACL 2025): 18 stars, last push 2025-07-14, MIT — [repo](https://github.com/derenlei/FactCG)
- **vectara/hallucination-leaderboard**: 3,329 stars, pushed 2026-11-17, Apache-2.0. **vectara/open-rag-eval**: 427 stars, pushed 2026-10-08, Apache-2.0, "RAG evaluation without the need for golden answers" — [leaderboard](https://github.com/vectara/hallucination-leaderboard); [open-rag-eval](https://github.com/vectara/open-rag-eval)
- **RAGAS has moved to vibrantlabsai/ragas** (16,406 stars, pushed 2026-11-14, Apache-2.0) — [repo](https://github.com/vibrantlabsai/ragas)
- **confident-ai/deepeval**: 19,605 stars, pushed 2026-11-23, Apache-2.0. **truera/trulens**: 3,668 stars, pushed 2026-11-23, MIT — [deepeval](https://github.com/confident-ai/deepeval); [trulens](https://github.com/truera/trulens)
- **Arize-ai/phoenix**: 12,384 stars, **Elastic License 2.0** (not OSI open source) — [Phoenix LICENSE](https://github.com/Arize-ai/phoenix/blob/main/LICENSE)
- **cvs-health/uqlm** (JMLR 2026): 1,215 stars, pushed 2026-11-08, Apache-2.0. Response-level 0–1 confidence from black-box (consistency over multiple generations), white-box (token probabilities, almost no extra cost), LLM-judge, ensemble and long-text claim-level scorers — [UQLM README](https://github.com/cvs-health/uqlm)
- **potsawee/selfcheckgpt**: 635 stars, last push 2024-06 — [repo](https://github.com/potsawee/selfcheckgpt)
- **ibm-granite/granite-guardian**: 192 stars, pushed 2026-10-16, Apache-2.0. Models "to detect risks in prompts and responses" — [repo](https://github.com/ibm-granite/granite-guardian)
- **Guardrails:** guardrails-ai/guardrails (7,638 stars, Apache-2.0). NeMo Guardrails has **moved to NVIDIA-NeMo/Guardrails** (7,558 stars, custom license) — [guardrails](https://github.com/guardrails-ai/guardrails); [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails)
- **Presidio has moved to data-privacy-stack/presidio** (12,010 stars, pushed 2026-11-23, MIT) — [repo](https://github.com/data-privacy-stack/presidio)
- **EdinburghNLP/awesome-hallucination-detection** (1,140 stars, pushed 2026-11-15) is the maintained paper list — [repo](https://github.com/EdinburghNLP/awesome-hallucination-detection)
- **Key evidence for our positioning, from an RBI peer repo:** srini2k03/rbi-circulars-rag reports **LLM-judge faithfulness 0.953 against NLI faithfulness 0.212** on the same 155 answers (local qwen2.5:3b generator, qwen2.5:7b judge), with NLI citation accuracy of 0.170. In other words, the LLM judge rated answers as faithful that an NLI model did not support — [rbi-circulars-rag README](https://github.com/srini2k03/rbi-circulars-rag)

### Inferences
- **Swap or add:** LettuceDetect's encoder (MIT, active) as the span-highlighting stage, painting unsupported spans red in the UI, either in place of AlignScore-class models or next to HHEM. Keep MiniCheck: it is stale but frozen weights still work, and its LLM-AggreFact ranking is unchanged.
- **Compare:** run RAGAS or DeepEval faithfulness on our 34-question test as a "what an off-the-shelf judge says" column next to our verifier. The srini2k03 gap (0.95 judge vs 0.21 NLI) shows why judge-only scores mislead, and our 0/104 fabricated quotes is a deterministic number that a judge-only score cannot match.
- UQLM's white-box (logprob) scorer is a cheap extra signal if OpenAI logprobs are enabled. It is optional and lower priority than the deterministic checks.
- Update the import paths and README links for the moved repos (Presidio, RAGAS, NeMo Guardrails) to avoid dead-looking links in front of judges.

### Gaps
- No GitHub repo exists at `patronus-ai/Lynx` (404). Lynx appears to be distributed only as Hugging Face weights; not verified here.
- Not checked: whether Granite Guardian's groundedness/RAG-hallucination risk mode works on CPU fast enough for our latency budget.
- No 2026 LLM-AggreFact leaderboard refresh was fetched in this pass.

## Q4. India / RBI / SEBI-specific regulatory AI repos and hackathon projects

### Takeaway
There are a handful of 2026 India-regulatory RAG repos, all with 0–53 stars. The two most serious are **srini2k03/rbi-circulars-rag** (rigorous eval, 2,000+ RBI notifications) and **anuragthakur73/rbi-master-directions-assistant** (3 RBI credit MDs, paragraph-level cites, 83% holdout). None does amendment/version reconstruction, contradiction triage or a deterministic quote verifier beyond ID validation. No maintained RBI chatbot was found on Hugging Face Spaces.

### Cited Findings
- **srini2k03/rbi-circulars-rag** (MIT, pushed 2026-11-22, 0 stars). Hybrid RAG over 2,000+ RBI notifications: a polite crawler with a SHA-256 manifest; metadata for date, circular number, department and sections; fixed, semantic and section-aware chunking; BM25 + bge-small-en-v1.5 (Qdrant) + **RRF k=60** + ms-marco cross-encoder; a confidence gate ("sigmoid top score < τ → I don't know"); citation validation (unknown ids, uncited sentences); FastAPI with SSE; Streamlit; a **browser-only demo on GitHub Pages** (int8 embeddings + transformers.js + BM25 in the browser). The eval reports 36 retrieval configurations with bootstrap CIs and a document-disjoint dev/test split. **Best retrieval was BM25-only fixed-512 (nDCG@10 0.703); hybrid did not win.** The test set is model-generated, with none of it human-verified — [README](https://github.com/srini2k03/rbi-circulars-rag)
- **anuragthakur73/rbi-master-directions-assistant ("Credit Assist")** (MIT, pushed 2026-11-16). Covers 3 RBI Credit Master Directions (2025, 618 paragraphs). Cites in the form `[Credit Facilities, Para 44]` and replies "Not found in the provided documents." otherwise. Includes a **direct paragraph-lookup route ("Para 70 of CRM")** alongside BM25 + bge-small + RRF; a deterministic limit comparison ("90.3% exceeds the 90% ceiling") with shown steps; flags citations to paragraphs that were not retrieved; blocks PAN, Aadhaar, mobile, email and account numbers by regex before the LLM call; collects 👍/👎 feedback. Scores: **83% correct on a 15-question holdout**, 94% on the 40-question tuned set, 100% citation accuracy, about $0.57 per 1,000 queries on Claude Haiku. The sidebar shows each direction's "updated as on" date. All 3 holdout misses were retrieval failures — [README](https://github.com/anuragthakur73/rbi-master-directions-assistant)
- **SamuelNittala/sebi-rag ("MF-RAG")** (MIT, pushed 2026-10-29). An MCP server over SEBI scheme documents (SID/KIM), AMC factsheets and AMFI pages. "LLM-free": it returns chunks for Claude to synthesise. Docling parsing service, bge-m3 + BM25 + RRF + bge-reranker-v2-m3, pgvector, **chunk review and publish workflow (nothing is searchable until it passes checks or human review)**, per-AMC access scopes — [README](https://github.com/SamuelNittala/sebi-rag)
- **rhnvrm/exchange-circulars** (11 stars, MIT, pushed 2026-11-23). A "living dataset" of NSE/BSE/SEBI/RBI/MSEI/MCX/India INX circulars, updated **every 3 hours** by GitHub Actions. Each circular is stored as Markdown with YAML frontmatter (source, date, impact level, affected stocks, categories) produced by Gemini. Go server with Typesense, published at exchangecirculars.com — [README](https://github.com/rhnvrm/exchange-circulars)
- **Siddarthb07/VidhiSethu** (MIT docs only; **code is closed**, closed beta). Indian-legal RAG with a "citation audit + hallucination filter" that removes unsupported claims; Next.js + FastAPI + Qdrant + Ollama Llama 3; about 1,300+ instruments — [README](https://github.com/Siddarthb07/VidhiSethu)
- **RepoCodeGanesh/bank-compliance-ai-app** (1 star, pushed 2026-11-21). A "Banking Regulatory & Compliance Copilot" on AKS + Azure OpenAI + LiteLLM + Qdrant + Azure AI Content Safety. The README is mostly infrastructure, with no verification details — [README](https://github.com/RepoCodeGanesh/bank-compliance-ai-app)
- Other tiny or empty RBI/SEBI RAG repos (0–1 stars): Tusharrepo93/rbi-circular-rag, tusharnibrad/rbi-circulars-rag, shivin4/RAGSebi, plus several `sebi-rag` repos. The FinStack LOS "RBI Master Directions" repo (10 stars) is a marketing repo. paramanandmallik/aws-india-compliance is an MCP server checking AWS infrastructure against DPDP and the RBI IT Master Direction — [GitHub search results, 2026-11-23](https://github.com/search?q=RBI+circulars+RAG&type=repositories)
- **OpenNyAI/Opennyai**: 103 stars, MIT, last push 2026-04-01. An NLP pipeline for Indian legal documents (judgments) — [repo](https://github.com/OpenNyAI/Opennyai)
- **Hugging Face:** no maintained RBI-circular Space was found. The banking/financial chatbot Spaces are Gradio template duplicates. The RBI Q&A datasets that exist are `AISimplyExplained/Assignment_RBI_Notifications` and `lirus18/rbi` (fraud master circular Q&A). Related Indian government bots: `NCTCMumbai/Customs_Manual_Chatbot` — [AISimplyExplained dataset](https://huggingface.co/datasets/AISimplyExplained/Assignment_RBI_Notifications/viewer/default/train?p=1); [lirus18/rbi](https://huggingface.co/datasets/lirus18/rbi); [Customs bot Space](https://huggingface.co/spaces/NCTCMumbai/Customs_Manual_Chatbot/tree/07f915bfeca691d4a9ed5d9a9ae6f23b60f48ac2)

### Inferences
- **Direct competitors for the "RBI" slot** are srini2k03 (eval rigour) and Credit Assist (product polish). Our differentiators are concrete and demonstrable: the as-of date with withdrawn/amended status, contradiction triage, verbatim-quote location with bbox, an NLI/MiniCheck ladder (their faithfulness relies on an LLM judge or on ID validation only), Decimal calculations, and a hash-chained audit log.
- **Similar headline numbers:** Credit Assist reports 83% on a 15-question holdout, against our 85% on a fresh 34-question set. Our 0/104 fabricated quotes versus a 50% baseline is the stronger and less common claim. Present the numbers side by side honestly; both are small test sets.
- **Borrow:**
  1. Credit Assist's **regex paragraph-lookup route** ("para 4.2 of the KYC MD" → direct clause_key hit before hybrid search). Our hierarchical keys make this trivial.
  2. Its **"updated as on" per-document badge**.
  3. Its **pre-LLM PII block** as a complement to Presidio redaction (block versus redact).
  4. srini2k03's **document-disjoint dev/test split and bootstrap CIs** for our eval table, and its finding that BM25-only can beat hybrid on RBI text. Ablate our hybrid to check.
  5. srini2k03's **browser-only static demo** (GitHub Pages) as a fallback if the venue Wi-Fi dies.
  6. MF-RAG's **chunk review before publish** gate, which fits our ingestion of synthetic bank docs.
  7. exchange-circulars as a **live feed source** for "new circular arrives → amendment graph updates" (MIT).

### Gaps
- No Hack-a-Sol or other Indian hackathon RBI projects with public code turned up beyond those listed. Devfolio project pages were not searched in this pass.
- GitHub search rate limits blocked the bare "RBI" and "nyaya" star-sorted queries. One "nyaya legal" result (vamshi992/nyaya-legal-assistant, 14 stars) was not inspected.
- No SEBI-circular *contradiction* or *amendment* tool was found.

## Q5. Summary: concrete borrow list and where we win (cross-cutting)

### Takeaway
Borrow mostly UI and eval-hygiene ideas: tier legend, dashed missing-source nodes, paragraph-lookup routing, an "updated as on" badge, span-red highlighting, document-disjoint CIs, an MCP endpoint and a static fallback demo. Our core (versioned clause graph, typed contradiction triage, deterministic quote gate) has no direct open-source equivalent.

### Cited Findings
- A tier taxonomy with "what it proves / does not prove" and a Conflicted tier — [Axiom](https://github.com/FurkhanShaikh/axiom-rag-engine)
- Dashed nodes for cited-but-not-ingested law — [OpenContracts](https://github.com/Open-Source-Legal/OpenContracts)
- Four-label compliance outcome including Human Required — [ARCCS](https://github.com/geofila/ARCCS)
- Paragraph-lookup route, "updated as on" date, pre-LLM PII block — [Credit Assist](https://github.com/anuragthakur73/rbi-master-directions-assistant)
- Judge 0.95 vs NLI 0.21 faithfulness gap; doc-disjoint split; browser-only demo — [rbi-circulars-rag](https://github.com/srini2k03/rbi-circulars-rag)
- Character-span unsupported-text detection with typed spans — [LettuceDetect](https://github.com/KRLabsOrg/LettuceDetect)
- Extraction rejected if not locatable in source; HTML review page — [LangExtract](https://github.com/google/langextract)
- "Invalidated, not deleted" validity windows — [Graphiti](https://github.com/getzep/graphiti)
- Work/Expression versioning plus deterministic retrieval primitives for legal norms — [arXiv 2505.00039](https://arxiv.org/abs/2505.00039v5); [arXiv 2510.06002](https://arxiv.org/html/2510.06002v2)
- In-PDF citation highlight UX — [Kotaemon](https://github.com/Cinnamon/kotaemon); Timelines knowledge compilation — [RAGFlow](https://github.com/infiniflow/ragflow)

### Inferences
- **Positioning line:** "Platforms cite; peers validate IDs; we prove each quote exists at a location, check it is in force on the as-of date, and refuse otherwise." Every competitor listed lacks at least two of: an as-of status, typed contradiction triage, deterministic quote location, and an NLI gate.
- **Most likely judge comparison:** RAGFlow or Kotaemon for UI, and PaperQA2 for contradiction detection. Have an answer ready. PaperQA2's contradiction detection works on scientific claims and has no notion of validity windows or conditions. Kotaemon's citations are retrieval chunks with a relevance score and no verbatim check.
- **Priority for the remaining hackathon time (my judgement):** (1) the dashed not-in-corpus nodes plus the tier legend, a UI-only change; (2) the paragraph-lookup route; (3) a LettuceDetect span highlight; (4) a RAGAS/judge comparison column in the eval table; (5) the MCP endpoint, only if time remains.

### Gaps
- No hands-on test of any repo was run. All comparisons rest on READMEs.
- Star counts of 0–20 for the peer repos mean they are not "competitors" by adoption. They matter only as evidence that the pattern is common in 2026 portfolios and hackathons.
