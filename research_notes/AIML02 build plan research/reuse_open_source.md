# Reusable Open-Source Code for the AIML-02 "Zero-Guessing & Contradiction-Checking Document AI" Build (36 h, FastAPI + Next.js, OpenAI LLM)

Verification method: repo metadata (license SPDX id, stars, last push) pulled live from the GitHub REST API on 2026-11-23 via `gh api repos/<owner>/<repo>`; LICENSE files read directly where the SPDX id was ambiguous; source trees listed with `gh api repos/<r>/git/trees/main?recursive=1`; PyPI versions from `https://pypi.org/pypi/<pkg>/json`; npm versions from `npm view`. All benchmark numbers below are from the authors' own pages on public benchmarks, NOT on the team's documents.

## 1. License and repo-health matrix (can we copy code into a hackathon repo?)

### Takeaway
Almost everything on the candidate list is MIT or Apache-2.0 (copy-with-attribution is fine; Apache-2.0 additionally wants the LICENSE/NOTICE kept and modified files marked). The exceptions are PyMuPDF/pymupdf4llm (AGPL-3.0), MinerU (Apache-2.0 plus extra commercial-threshold terms), EmbedPDF (mixed Apache-2.0 + FCL for one component), and the archived react-pdf-viewer (custom/commercial license) — avoid copying from those.

### Cited Findings
Repo metadata as returned by the GitHub API on 2026-11-23 (license = SPDX id from the repo's LICENSE file):

| Repo | License | Stars | Last push | Notes |
|---|---|---|---|---|
| [Cinnamon/kotaemon](https://github.com/Cinnamon/kotaemon) | Apache-2.0 | 25,925 | 2026-07-14 | slowing activity |
| [infiniflow/ragflow](https://github.com/infiniflow/ragflow) | Apache-2.0 | 94,545 | 2026-11-22 | main branch now mostly Go (see §2) |
| [docling-project/docling](https://github.com/docling-project/docling) | MIT | 70,882 | 2026-11-22 | |
| [docling-project/docling-core](https://github.com/docling-project/docling-core) | MIT | 301 | 2026-11-20 | chunkers live here |
| [pymupdf/PyMuPDF](https://github.com/pymupdf/PyMuPDF) | AGPL-3.0 | 11,183 | 2026-11-21 | dual-licensed (commercial via Artifex) |
| [pymupdf/pymupdf4llm](https://github.com/pymupdf/pymupdf4llm) | AGPL-3.0 | 2,302 | 2026-11-19 | |
| [jsvine/pdfplumber](https://github.com/jsvine/pdfplumber) | MIT | 10,920 | 2026-11-21 | |
| [agentcooper/react-pdf-highlighter](https://github.com/agentcooper/react-pdf-highlighter) | MIT | 1,414 | 2024-11-22 | stale 2 years |
| [DanielArnould/react-pdf-highlighter-extended](https://github.com/DanielArnould/react-pdf-highlighter-extended) | MIT | 111 | 2024-11-22 | stale 2 years |
| [react-pdf-viewer/react-pdf-viewer](https://github.com/react-pdf-viewer/react-pdf-viewer) | NOASSERTION (custom, `https://react-pdf-viewer.dev/license`) | 2,598 | 2024-08-19 | **archived** |
| [mozilla/pdf.js](https://github.com/mozilla/pdf.js) | Apache-2.0 | 54,174 | 2026-11-22 | |
| [wojtekmaj/react-pdf](https://github.com/wojtekmaj/react-pdf) | MIT | 11,204 | 2026-11-16 | |
| [embedpdf/embed-pdf-viewer](https://github.com/embedpdf/embed-pdf-viewer) | Mixed: Apache-2.0, except `cloudpdf/server` under FCL-1.0-ALv2 | 4,677 | 2026-11-22 | |
| [Liyan06/MiniCheck](https://github.com/Liyan06/MiniCheck) | Apache-2.0 | 235 | 2025-08-27 | |
| [vectara/hallucination-leaderboard](https://github.com/vectara/hallucination-leaderboard) | Apache-2.0 | 3,329 | 2026-11-17 | HHEM itself is an HF model (Apache-2.0) |
| [KRLabsOrg/LettuceDetect](https://github.com/KRLabsOrg/LettuceDetect) | MIT | 627 | 2026-11-22 | very active |
| [yuh-zha/AlignScore](https://github.com/yuh-zha/AlignScore) | MIT | 179 | 2024-03-11 | stale |
| [FlagOpen/FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding) | MIT | 12,354 | 2026-10-27 | |
| [huggingface/sentence-transformers](https://github.com/huggingface/sentence-transformers) (redirected from UKPLab) | Apache-2.0 | 19,302 | 2026-11-20 | |
| [AnswerDotAI/rerankers](https://github.com/AnswerDotAI/rerankers) | Apache-2.0 | 1,645 | 2025-12-20 | last PyPI release 0.10.0 on 2025-05-22 |
| [dorianbrown/rank_bm25](https://github.com/dorianbrown/rank_bm25) | Apache-2.0 | 1,420 | 2026-05-02 | last PyPI release 0.2.2 in 2022 |
| [xhluca/bm25s](https://github.com/xhluca/bm25s) | MIT | 1,828 | 2026-11-13 | |
| [quickwit-oss/tantivy-py](https://github.com/quickwit-oss/tantivy-py) | MIT | 436 | 2026-11-20 | |
| [Future-House/paper-qa](https://github.com/Future-House/paper-qa) | Apache-2.0 | 9,638 | 2026-11-16 | |
| [google/langextract](https://github.com/google/langextract) | Apache-2.0 | 39,348 | 2026-11-10 | |
| [Mvdodiya001/Meta-global-ai-developer-hackathon](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon) (ClauseTrace) | MIT ("Copyright (c) 2026 Mvdodiya001") | 0 | 2026-11-05 | |
| [stanford-oval/WikiChat](https://github.com/stanford-oval/WikiChat) | Apache-2.0 | 1,629 | 2026-01-31 | |
| [princeton-nlp/ALCE](https://github.com/princeton-nlp/ALCE) | MIT | 533 | 2024-10-09 | |
| [data-privacy-stack/presidio](https://github.com/data-privacy-stack/presidio) (redirected from microsoft/presidio) | MIT | 12,000 | 2026-11-22 | moved to community org |
| [houfu/redlines](https://github.com/houfu/redlines) | MIT | 162 | 2026-11-01 | |
| [google/diff-match-patch](https://github.com/google/diff-match-patch) | Apache-2.0 | 8,129 | 2024-05-22 | **archived** |
| [rapidfuzz/RapidFuzz](https://github.com/rapidfuzz/RapidFuzz) | MIT | 4,215 | 2026-11-09 | |
| [openai/openai-cookbook](https://github.com/openai/openai-cookbook) | MIT | 77,374 | 2026-11-22 | |
| [opendatalab/MinerU](https://github.com/opendatalab/MinerU) | Apache-2.0 **plus additional terms** (commercial license required above usage thresholds) | 84,147 | 2026-11-22 | |

- MinerU's LICENSE.md: "MinerU is licensed under Apache License 2.0 and is subject to the additional terms below… if you and your Affiliates… meet either of the following thresholds, you must obtain a separate commercial license" — [MinerU LICENSE.md](https://github.com/opendatalab/MinerU/blob/master/LICENSE.md)
- EmbedPDF LICENSE: "The Apache License 2.0 below applies only to the portions identified as Apache-2.0 in LICENSING.md. It does not apply to cloudpdf/server, which is licensed under the Fair Core License, FCL-1.0-ALv2" — [embed-pdf-viewer LICENSE](https://github.com/embedpdf/embed-pdf-viewer/blob/main/LICENSE)
- Presidio "has completed its transition from a Microsoft-owned project to an independent, community-governed open source project under the GitHub organization Data Privacy Stack… continues to be open source under the MIT license" — [Presidio project_transition.md](https://github.com/data-privacy-stack/presidio/blob/main/docs/project_transition.md)
- Latest PyPI releases (checked 2026-11-23): docling 2.151.1 (2026-11-19, MIT, py>=3.10), docling-core 2.108.0 (MIT), pymupdf 2.1 (2026-11-02, "Dual Licensed - GNU AFFERO GPL 3.0 or Artifex Commercial"), pymupdf4llm 2.1, pdfplumber 0.11.11, lettucedetect 0.2.3 (MIT, py>=3.11), langextract 1.7.2 (Apache-2.0), rapidfuzz 3.14.6, bm25s 0.3.16, FlagEmbedding 1.4.2, rerankers 0.10.0 (2025-05-22), sentence-transformers 6.3.0, redlines 0.6.2, presidio-analyzer 2.2.366 (py>=3.11,<3.15), paper-qa 2026.8.12 (py>=3.11), tantivy 0.27.0, rank-bm25 0.2.2 (2022-02-16), diff-match-patch 20241021 — [PyPI JSON API](https://pypi.org/pypi/docling/json) (same endpoint per package)

### Inferences
- For a student hackathon repo, MIT/Apache code can be copied into `backend/third_party/<name>/` with the original LICENSE file and a header comment `# Adapted from <repo>@<commit>, <license>`; Apache-2.0 §4 also wants a note that files were modified.
- Python minimum across the stack is 3.11 (lettucedetect, presidio, paper-qa, pymupdf, tantivy). Standardize the backend on Python 3.11 or 3.12.
- Libraries whose last release is ≥1 year old (rank_bm25, rerankers, AlignScore, react-pdf-highlighter*) are usable but should not be on the critical path without a fallback.

### Gaps
- Star counts and push dates are a snapshot; they change daily.
- I did not read every repo's NOTICE file; Apache-2.0 repos that ship a NOTICE (none observed in the trees I listed, except ClauseTrace's NOTICE.md, which is a source log, not a license notice) would need it reproduced.

## 2. Ingestion: Docling, PyMuPDF (AGPL), pdfplumber, RAGFlow DeepDoc

### Takeaway
Import Docling + docling-core as libraries (MIT) and use `HybridChunker`/`HierarchicalChunker` directly; use pdfplumber (MIT) instead of PyMuPDF for exact span bboxes unless the team is comfortable publishing the full app source under AGPL. RAGFlow DeepDoc is no longer a convenient Python lift on `main` (the codebase is now mostly Go); borrow only ideas.

### Cited Findings
**Docling / docling-core**
- `pip install docling`; "The Docling codebase is under MIT license. For individual model usage, please refer to the model licenses found in the original packages." Supports VLMs such as GraniteDocling (`ibm-granite/granite-docling-258M`) via `docling --vlm-model granite_docling` — [Docling README](https://github.com/docling-project/docling)
- Chunkers live in docling-core under `docling_core/transforms/chunker/`: `hierarchical_chunker.py`, `hybrid_chunker.py`, `page_chunker.py`, `line_chunker.py`, `chunk_expander.py`, `doc_chunk.py`, and tokenizer adapters `tokenizer/huggingface.py` and `tokenizer/openai.py` — [docling-core tree](https://github.com/docling-project/docling-core/tree/main/docling_core/transforms/chunker)
- `HybridChunker(BaseChunker)` has fields `max_tokens` ("The maximum number of tokens per chunk") and `merge_peers: bool = True` ("Whether to merge undersized chunks sharing same relevant metadata"), wraps an inner `HierarchicalChunker`, and has `contextualize(chunk=...)` which serializes the chunk with its heading/metadata context (the code estimates "the token overhead that contextualize() adds to the chunk text") — [hybrid_chunker.py](https://github.com/docling-project/docling-core/blob/main/docling_core/transforms/chunker/hybrid_chunker.py)
- Docling items carry provenance `ProvenanceItem(bbox=..., charspan=..., page_no=...)` in `docling_core/types/doc/document.py` — [document.py](https://github.com/docling-project/docling-core/blob/main/docling_core/types/doc/document.py)

**PyMuPDF / pymupdf4llm (AGPL)**
- "PyMuPDF and MuPDF are now available under both, open-source AGPL and commercial license agreements"; "Artifex is the exclusive commercial licensing agent for MuPDF" — [PyMuPDF docs: About](https://pymupdf.readthedocs.io/en/latest/about.html)
- PyMuPDF's COPYING file is the GNU AGPL v3; its §13 "Remote Network Interaction" says that if you modify the Program, "your modified version must prominently offer all users interacting with it remotely through a computer network… an opportunity to receive the Corresponding Source" — [PyMuPDF COPYING](https://github.com/pymupdf/PyMuPDF/blob/main/COPYING)
- pymupdf4llm repo license is also AGPL-3.0 (GitHub API) — [pymupdf4llm](https://github.com/pymupdf/pymupdf4llm)

**pdfplumber (MIT alternative for exact bboxes)**
- `.chars` gives "one dictionary for each such object", each char with `x0`, `top`, `x1`, `bottom`; `.extract_words(..., return_chars=True)` "Returns a list of all word-looking things and their bounding boxes" and adds each word's constituent characters; `.crop((x0, top, x1, bottom))` — [pdfplumber README](https://github.com/jsvine/pdfplumber)
- `Page.search(...)` exists in `pdfplumber/page.py` (line ~509) — [page.py](https://github.com/jsvine/pdfplumber/blob/stable/pdfplumber/page.py)

**RAGFlow DeepDoc**
- RAGFlow `main` tree now contains ~3,389 `.go` files vs ~167 `.py` files; DeepDoc lives at `internal/deepdoc/native/*.go` (`det.go`, `dla.go`, …) and citations at `internal/agentic_rag/citations.go`, `internal/agent/component/prompts/citation.go`, plus `internal/rag/prompts/citation_prompt.md`; the old top-level Python `deepdoc/` folder is absent on `main` — [ragflow tree](https://github.com/infiniflow/ragflow)

### Inferences
- **AGPL implication for a hackathon:** using PyMuPDF unmodified inside a FastAPI app that judges access over the network is the gray zone AGPL was written for; the safe reading is that the whole served application must be offered under AGPL-compatible terms with source available. For a public GitHub hackathon repo this is easy to satisfy (license the repo AGPL-3.0 or simply publish source), but it blocks any later closed/commercial use without an Artifex license. If the team wants an MIT repo, use pdfplumber for char-level bboxes and Docling for structure — both MIT. Not legal advice.
- Practical bbox recipe with pdfplumber: for each verified quote, find it in the page text (RapidFuzz alignment), map the char offsets back to `page.chars[i]` boxes, merge per line into rectangles, and send `{page, rects:[x0,top,x1,bottom], page_width, page_height}` to the frontend. Docling `prov.bbox` is good enough for block-level (clause/table cell) highlights; pdfplumber is for sentence/number-level highlights.
- `tokenizer/openai.py` in docling-core means chunk sizes can be measured in the same tokenizer family as the OpenAI embedding/LLM models.
- To borrow RAGFlow's Python DeepDoc, one would need an older release tag (pre-Go-rewrite); not worth it in 36 h when Docling already does layout + TableFormer.

### Gaps
- I did not verify Docling's model download size, first-run latency, or CPU throughput; these should be measured on the team's laptops on day 0.
- I did not confirm which RAGFlow tag last shipped Python `deepdoc/`.
- Cross-page table stitching: I found no off-the-shelf Docling function for merging tables that continue across pages; this remains custom code (compare header rows / column counts of consecutive `TableItem`s).

## 3. Retrieval: BM25 + embeddings + reranker

### Takeaway
Import, don't copy: `bm25s` (or SQLite FTS5 `bm25()`) for lexical, OpenAI or bge-m3 embeddings for dense, RRF in ~10 lines of your own code, and `FlagEmbedding.FlagReranker('BAAI/bge-reranker-v2-m3')` (0.6B, Apache-2.0) or the `rerankers` wrapper for the cross-encoder.

### Cited Findings
- bm25s: "no dependencies on Java or Pytorch - all you need is Numpy"; `pip install bm25s` / `bm25s[full]`; API `bm25s.tokenize(corpus, stopwords="en", stemmer=stemmer)`, `retriever = bm25s.BM25(); retriever.index(...)`, `results, scores = retriever.retrieve(query_tokens, k=2)`, `BM25.load(..., load_corpus=True)`; benchmarks QPS vs rank-bm25 and Elasticsearch on BEIR datasets, with a numba backend giving "around 2x speedup for larger datasets" — [bm25s README](https://github.com/xhluca/bm25s)
- rank-bm25 last PyPI release 0.2.2 was 2022-02-16 — [PyPI rank-bm25](https://pypi.org/pypi/rank-bm25/json)
- bge-reranker-v2-m3: license apache-2.0, 0.6B params; `FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=True)`, `compute_score([[q,p],...], normalize=True)` ("will apply sigmoid function to the score"); transformers example uses `max_length=512`; evaluated by reranking top-100 on BEIR, CMTEB-retrieval, MIRACL (numbers only in images) — [HF model card](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- FlagEmbedding: `pip install -U FlagEmbedding`; README lists bge-reranker-v2-m3 as "a lightweight cross-encoder model, possesses strong multilingual capabilities, easy to deploy, with fast inference" — [FlagEmbedding README](https://github.com/FlagOpen/FlagEmbedding)
- rerankers (AnswerDotAI): `pip install "rerankers[transformers]"`; unified `Reranker('cross-encoder')`, `Reranker('<hf-model>', model_type='cross-encoder')`, `Reranker('flashrank')`, plus API rerankers (cohere, jina, pinecone) and `rankgpt` — [rerankers README](https://github.com/AnswerDotAI/rerankers)
- tantivy (Python) 0.27.0 MIT, py>=3.11 — [PyPI tantivy](https://pypi.org/pypi/tantivy/json); PaperQA2 uses tantivy for its full-text index — [paper-qa README](https://github.com/Future-House/paper-qa)
- SQLite FTS5 provides a built-in `bm25()` ranking function — [SQLite FTS5 docs](https://www.sqlite.org/fts5.html)
- Kotaemon's reranker module ships Cohere, VoyageAI, and TEI-fast-rerank backends (`libs/kotaemon/kotaemon/rerankings/{cohere,voyageai,tei_fast_rerank}.py`) plus an LLM-scoring ranker (`libs/kotaemon/kotaemon/indices/rankings/llm_scoring.py`) — [kotaemon tree](https://github.com/Cinnamon/kotaemon)

### Inferences
- Since the graph and version tables already live in SQLite, FTS5 `bm25()` avoids a second index and supports `WHERE status='in_force'` filters in the same query; bm25s is the better choice if the team wants stemming and Python-side control. Either is <1 h.
- bge-reranker-v2-m3 at 0.6B in fp32 is ~2.3 GB of weights (0.6B × 4 bytes; inference, not measured); on CPU, rerank only the top 20-30 RRF hits. `FlagReranker` and `sentence_transformers.CrossEncoder` both load it; `rerankers` adds a uniform interface but its last release is May 2025.
- RRF is short enough to write (score = Σ 1/(60 + rank)); no library needed.

### Gaps
- No published CPU latency for bge-reranker-v2-m3 was found; measure it.
- No benchmark numbers for bge-reranker-v2-m3 could be extracted as text (image-only on the card).

## 4. Verifiers: MiniCheck, HHEM-2.1-Open, LettuceDetect, AlignScore (+ RapidFuzz)

### Takeaway
Use **HHEM-2.1-Open** as the default local entailment gate (0.1B, Apache-2.0, ~1.5 s per 2k-token input on CPU, no length cap) and **LettuceDetect** when you want character spans of unsupported text to paint red in the "faithfulness draft-vs-final" view. MiniCheck-Flan-T5-Large is a good second opinion but must be installed from git (the PyPI name `minicheck` is a different project). Skip AlignScore (old PyTorch pin, needs manual checkpoint download).

### Cited Findings
**HHEM-2.1-Open (Vectara)**
- License apache-2.0; usage `AutoModelForSequenceClassification.from_pretrained('vectara/hallucination_evaluation_model', trust_remote_code=True)` then `model.predict(pairs)` (pairs = (premise, hypothesis)); for the pipeline API you must use the prompt `"<pad> Determine if the hypothesis is true given the premise?\n\nPremise: {text1}\n\nHypothesis: {text2}"` with the `google/flan-t5-base` tokenizer; supports transformers 4.x and 5.x — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- "unlimited context length" (HHEM-1.0 was capped at 512 tokens); ~1.5 s for a 2k-token input on a modern x86 CPU; 0.1B params, <600 MB RAM at fp32 — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- Balanced accuracy, HHEM-2.1-Open vs GPT-4 (06-13, zero-shot): AggreFact-SOTA 76.55% vs 73.78%; RAGTruth-Summ 64.42% vs 62.62%; RAGTruth-QA 74.28% vs 74.11%. F1: 66.77 / 44.83 / 60.00. The card notes AggreFact-SOTA covers older summarizers (T5, BART, Pegasus). HHEM-2.3 is commercial-only — [HF model card](https://huggingface.co/vectara/hallucination_evaluation_model)

**LettuceDetect (KRLabs)**
- `pip install lettucedetect -U`; `HallucinationDetector(method="transformer", model_path="KRLabsOrg/lettucedect-base-modernbert-en-v1")`, `detector.predict(context=[...], question=..., answer=..., output_format="spans")` returns spans with start/end char offsets, confidence, text; also `method="llm"` (LLM-judge mode) and a FastAPI-style server via `pip install lettucedetect[api]` (`client.detect_spans(contexts, question, answer)`) — [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect)
- v0.2.0 (2026-06-22) added code/tool/agentic models, typed spans, "automatic context chunking"; 0.2.2 (2026-07-05) fixed `method="llm"` confidence validation; new models `lettucedect-v2-mmbert-base` (encoder) and `lettucedect-v2-qwen-2b` (generative, typed spans + reasons) — [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect)
- Results (authors): on the unified 10,698-example v2 test set, Qwen-2B 0.689 span-F1, mmBERT-base 0.642; on the RAGTruth slice 0.574 vs 0.528 — [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect)
- v1 model card: MIT, 0.1B params (card text inconsistently says "Large model based on ModernBERT-large"), up to 8192-token context; lettucedetect-large-v1 example-level F1 79.22% on RAGTruth vs GPT-4 prompt 63.4%, Luna 65.4%, fine-tuned LLaMA-2-13B 78.7%, fine-tuned LLaMA-3-8B 83.9%; no latency figures — [HF lettucedect-base-modernbert-en-v1](https://huggingface.co/KRLabsOrg/lettucedect-base-modernbert-en-v1)
- Pitfall: EuroBERT variants "load remote code that is not yet compatible with transformers 5.x… install `transformers>=4.48.3,<5`" (issue #33); ModernBERT models unaffected — [LettuceDetect README](https://github.com/KRLabsOrg/LettuceDetect)
- Source paths: `lettucedetect/models/inference.py` (HallucinationDetector), `lettucedetect/detectors/{transformer,llm,rag_fact_checker,factory}.py`, `demo/streamlit_demo.py` — [LettuceDetect tree](https://github.com/KRLabsOrg/LettuceDetect)

**MiniCheck**
- Install from git: `pip install "minicheck @ git+https://github.com/Liyan06/MiniCheck.git@main"` (`[llm]` extra pulls vLLM, Linux only); `MiniCheck(model_name='flan-t5-large', cache_dir='./ckpts')`, `pred_label, raw_prob, _, _ = scorer.score(docs=[...], claims=[...])`; model choices `roberta-large`, `deberta-v3-large`, `flan-t5-large`, `Bespoke-MiniCheck-7B`; "MiniCheck(document, sentence) -> [0, 1] is a sentence-level fact-checking model… the claim should first be broken up into sentences" — [MiniCheck README](https://github.com/Liyan06/MiniCheck)
- **Pitfall verified:** the PyPI package named `minicheck` (0.4.0, 2026-07-30) is described as "An explicit-state model checker in ~2900 lines" — an unrelated project. The real MiniCheck's `pyproject.toml` declares `name = "minicheck"`, version 0.1.0, deps torch, transformers, datasets, nltk, pandas, numpy, openai — [PyPI minicheck](https://pypi.org/pypi/minicheck/json); [MiniCheck pyproject.toml](https://github.com/Liyan06/MiniCheck/blob/main/pyproject.toml)
- Paper: MiniCheck-FT5 (770M) "reaches GPT-4 accuracy" on LLM-AggreFact at ~400x lower cost — [arXiv 2404.10774](https://arxiv.org/abs/2404.10774); model card: MIT license, ~500 docs/min on the benchmark test set "depending on hardware" — [HF lytang/MiniCheck-Flan-T5-Large](https://huggingface.co/lytang/MiniCheck-Flan-T5-Large)
- Bespoke-MiniCheck-7B: 29K LLM-AggreFact test set in 30 min (with prefix caching) vs 55 min (without) on one A6000 48 GB; "Please contact company@bespokelabs.ai for commercial use" — [MiniCheck README](https://github.com/Liyan06/MiniCheck)
- Repo files: `minicheck/minicheck.py`, `minicheck/inference.py`, `minicheck/utils.py` — [MiniCheck tree](https://github.com/Liyan06/MiniCheck)

**AlignScore**
- Not on PyPI; install by cloning + `pip install .`, then `python -m spacy download en_core_web_sm`; "trained and evaluated using PyTorch 1.12.1"; `AlignScore(model='roberta-base', batch_size=32, device='cuda:0', ckpt_path=..., evaluation_mode='nli_sp')`; AlignScore-large (RoBERTa-l 355M) avg 59.3 Spearman on SummEval/QAGS vs base 54.8 — [AlignScore README](https://github.com/yuh-zha/AlignScore)

**RapidFuzz** — MIT, 3.14.6; README mentions `partial_ratio` (and fixes to its implementation) — [RapidFuzz README](https://github.com/rapidfuzz/RapidFuzz)

### Inferences
- Recommended verifier stack: (1) RapidFuzz `fuzz.partial_ratio_alignment` / exact substring for verbatim quotes (threshold ≥ 95 after whitespace/ligature normalization), (2) regex number normalizer for exact numbers, (3) HHEM-2.1-Open per (evidence-span, claim-sentence) pair with threshold ~0.5 tuned on 20 hand-labeled pairs, (4) LettuceDetect spans for the red-underline UI. MiniCheck-FT5 optional as tiebreaker. All CPU-viable.
- Load all models once at FastAPI startup (`lifespan`) and run them in a thread pool (`run_in_threadpool`) to avoid blocking the event loop.
- None of these numbers transfer to Indian regulatory circulars with numeric thresholds; numeric contradictions should be caught deterministically, not by NLI.

### Gaps
- No CPU latency published for LettuceDetect or MiniCheck-FT5; measure.
- MiniCheck's per-model LLM-AggreFact balanced accuracies are only in images on the card; the paper abstract gives no number.

## 5. Citation / answer / extraction pipelines worth lifting

### Takeaway
Copy small, self-contained pieces: kotaemon's `find_text`/`find_start_end_phrase` span-matcher and its inline-citation prompt idea; PaperQA2's `contracrow.json` 11-level contradiction label scale and prompt; WikiChat's claim-splitting prompt; ALCE's citation recall/precision logic (swap its T5-XXL NLI for HHEM). Use LangExtract as a library with OpenAI for value-tuple/amendment extraction with char offsets.

### Cited Findings
**kotaemon — what is separable from the Gradio app**
- Library code is split from the UI: `libs/kotaemon/` (pipelines) vs `libs/ktem/` (Gradio app). Citation code: `libs/kotaemon/kotaemon/indices/qa/citation.py` (`CiteEvidence`, `CitationPipeline`), `citation_qa.py`, `citation_qa_inline.py` (`InlineEvidence`, `AnswerWithInlineCitation` with `answer_to_citations`, `replace_citation_with_link`, `match_evidence_with_context`; prompt asks the LLM to "output 2 phrase to mark start and end of the relevant span"; computes `qa_score = np.exp(np.average(logprobs))` as a confidence), `format_context.py`, `utils.py` — [kotaemon tree](https://github.com/Cinnamon/kotaemon)
- `libs/kotaemon/kotaemon/indices/qa/utils.py` contains pure-stdlib `find_text(search_span, context, min_length=5)` and `find_start_end_phrase(start_phrase, end_phrase, context, min_length=5, max_excerpt_length=300)` built on `difflib.SequenceMatcher` (thresholds 0.25/0.35 of sentence length) — [utils.py](https://github.com/Cinnamon/kotaemon/blob/main/libs/kotaemon/kotaemon/indices/qa/utils.py)
- PDF highlighting in kotaemon is done by `libs/ktem/ktem/assets/js/pdf_viewer.js`, which embeds `<pdfjs-viewer-element … phrase="true">` (the prebuilt pdf.js viewer downloaded by `scripts/download_pdfjs.sh`) and fuzzy-matches text with an LCS `matchRatio` — i.e., text-search highlighting, not bbox overlays — [pdf_viewer.js](https://github.com/Cinnamon/kotaemon/blob/main/libs/ktem/ktem/assets/js/pdf_viewer.js)
- `libs/ktem/ktem/utils/visualize_cited.py` (`CreateCitationVizPipeline`) plots UMAP projections of cited vs retrieved chunk embeddings with plotly — [kotaemon tree](https://github.com/Cinnamon/kotaemon)

**PaperQA2 / ContraCrow**
- `pip install paper-qa>=5` (Python 3.11+); bundled settings include `src/paperqa/configs/contracrow.json` and `wikicrow.json`; uses OpenAI embeddings/models by default and tantivy for full-text search; Docling reader available as `packages/paper-qa-docling` — [paper-qa README](https://github.com/Future-House/paper-qa)
- `contracrow.json` `qa` prompt: "Determine if the claim below is contradicted by the context below… Respond with… `<response><reasoning>…</reasoning><label>…</label></response>`" with 11 labels from "explicit contradiction" through "lack of evidence" to "explicit agreement"; `summary_json_system` asks for `{"summary", "relevance_score"}` (integer out of 10); defaults `evidence_k: 30`, `answer_max_sources: 15`, `chunk_chars: 7000`, `overlap: 250`; config `llm` is `claude-3-5-sonnet-20240620`, agent `gpt-4o-2024-08-06` — [contracrow.json](https://github.com/Future-House/paper-qa/blob/main/src/paperqa/configs/contracrow.json)

**WikiChat** (Apache-2.0)
- Prompt files under `pipelines/prompts/`: `generate_split_claims.prompt` (claims must be "self-contained, meaning it does not use pronouns and includes all the context necessary"), `draft_w_citation.prompt`, `filter_irrelevant_info.prompt`, `refine.prompt`, `refine_w_feedback.prompt`, `rerank_listwise.prompt`, `rerank_pointwise.prompt`; benchmark prompts include `split_claim_for_eval.prompt`, `scale_factuality.prompt` — [WikiChat tree](https://github.com/stanford-oval/WikiChat)

**ALCE** (MIT)
- `eval.py` defines `compute_autoais` (citation recall/precision) and `compute_claims`, both loading `AUTOAIS_MODEL="google/t5_xxl_true_nli_mixture"` with `device_map="auto"`; `_run_nli_autoais(passage, claim)` is the per-pair NLI call; also `compute_str_em`, `compute_qa`, `compute_mauve`; `post_hoc_cite.py` adds citations post hoc — [ALCE eval.py](https://github.com/princeton-nlp/ALCE/blob/main/eval.py)

**Google LangExtract** (Apache-2.0)
- Supports OpenAI: `pip install langextract[openai]`, `lx.extract(..., model_id="gpt-4o")` "Automatically selects OpenAI provider"; "The OpenAI provider uses structured outputs or JSON mode and auto-determines fence behavior — leave `fence_output` and `use_schema_constraints` unset"; `output_schema` supported; OpenAI Batch API option — [LangExtract README](https://github.com/google/langextract)
- Grounding: "extractions that cannot be located in the source text will have `char_interval = None`. Filter these out with `[e for e in result.extractions if e.char_interval]`"; few-shot via `lx.data.ExampleData` / `lx.data.Extraction`; `lx.io.save_annotated_documents(...)` and `lx.visualize("extraction_results.jsonl")` produce a self-contained HTML review page — [LangExtract README](https://github.com/google/langextract)

**OpenAI cookbook** (MIT)
- Relevant notebooks: `examples/Structured_Outputs_Intro.ipynb`, `examples/Structured_outputs_multi_agent.ipynb`, `examples/Developing_hallucination_guardrails.ipynb`, `examples/File_Search_Responses.ipynb`, `examples/evaluation/Evaluate_RAG_with_LlamaIndex.ipynb`, and `examples/partners/AWS/evidence_grounded_aml_agent_with_bedrock.ipynb` — [openai-cookbook tree](https://github.com/openai/openai-cookbook)

### Inferences
- kotaemon is not separable as a package for this stack (its `kotaemon` lib is built around its own `BaseComponent` pipeline framework), but `find_text`/`find_start_end_phrase` are ~80 lines of stdlib and can be copied verbatim (Apache-2.0) as a fallback quote locator; the "start/end phrase" trick is a cheap way to make the LLM point at evidence without reproducing long quotes. Its `qa_score` from logprobs maps to the "low-relevance warning".
- PaperQA2 as a library would pull its own agent loop, LiteLLM, and paper-centric metadata (DOIs, MLA citations); reuse only the ContraCrow label scale + prompt text as the contradiction-card classifier, rewritten as an OpenAI Structured Outputs enum.
- LangExtract is the best fit for "value tuples" (entity, attribute, value, unit, effective_date, source_char_interval) and amendment metadata (amends_circular_id, clause_ref, effective_from), because the char_interval check is a built-in anti-hallucination gate; map char offsets → pdfplumber boxes for highlights.
- ALCE metrics are the right offline eval for the demo slide ("citation recall X%, precision Y% on our 30-question set"), but the 11B T5-XXL NLI is too heavy; substitute HHEM in `_run_nli_autoais`.
- OpenAI Structured Outputs pattern to implement directly: response schema `{claims:[{text, evidence_ids:[int], quote: str, numbers:[str]}], unanswerable: bool, missing_evidence:[str]}` with `strict: true`; restrict `evidence_ids` to the numbered set passed in.

### Gaps
- I did not open the cookbook notebooks' contents; I only verified they exist by path.
- No OpenAI-official "citations with structured outputs" cookbook specifically titled as such was found in the tree.

## 6. Domain-specific reuse: ClauseTrace, redlines/diffs, Presidio

### Takeaway
ClauseTrace (MIT, a Nov-2026 hackathon project on India's DPDP Act) is the closest prior art: a FastAPI modular monolith with a pure-Python deterministic checker, provision version diff + in-force check, and amendment→stale impact traversal. Copy its error-code taxonomy and `diff_versions`/`in_force`/`apply_version` patterns. Use `difflib` (stdlib) or `redlines` (MIT) for the redline view; Presidio (MIT) for PII masking.

### Cited Findings
**ClauseTrace**
- README: "When a law changes, ClauseTrace finds which legal conclusions depended on it, re-checks only those"; backend "Python 3.12, FastAPI… modular monolith" with modules `verification`, `law` (sources, legal tests, diff), `impact` (amendment → stale → re-verify, what-if), `intake`, `evidence`; SQLite locally / Postgres; FalkorDB dependency traversal with SQL fallback; frontend React 18 + Vite; LLM is Meta "Muse Spark"; "every citation is pinned to (source_version_id, provision_id, span, sha256) and checked verbatim against the stored snapshot"; statuses FOLLOWS / RULED_OUT / UNKNOWN / REQUIRES_REVIEW / CONFLICTING; "History is never overwritten… append-only" — [ClauseTrace README](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- `backend/checker/verify.py`: "Pure Python: no `app.agent`, no network, no LLM client"; validates schema, step order, premise trust, citation integrity ("provision exists, span in range, sha256 matches the snapshot"); error codes include `CITATION_HASH_MISMATCH`, `CITATION_VERSION_MISMATCH`, `VERSION_SUPERSEDED`, `PROVISION_NOT_IN_FORCE`, `COMPARE_FAILED`, `QUOTE_NOT_FOUND`, `CONCLUDE_MISMATCH`; functions `_check_citation`, `_is_current`, `_in_force_on`, `_check_in_force`, `_check_compare`, `_check_evidence`, `verify(...)` — [verify.py](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon/blob/main/backend/checker/verify.py)
- `backend/app/modules/law/diff.py`: "version diff by provision key + hash, and as-of applicability" with `VersionDiff` dataclass, `diff_versions(session, old_id, new_id)`, `in_force(provision, as_of)`; `backend/app/modules/impact/impact.py`: "impact engine — amendment diff, AFFECTS, STALE, report" with `diff_provisions`, `snapshot`, `apply_version(session, new_version_id)`; `backend/app/modules/evidence/retrieval.py`: deterministic token/IDF ranking `search_provisions`, `expand_tokens`, `current_version_ids`; also `backend/checker/proplogic.py`, `backend/app/modules/impact/counterfactual.py` (what-if), and ~70 pytest files under `backend/tests/` — [ClauseTrace tree](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon)
- NOTICE.md is a source/retrieval log of DPDP Act/Rules gazette URLs (including a deliberate "Unrelated Decoy Source"), not a license notice — [NOTICE.md](https://github.com/Mvdodiya001/Meta-global-ai-developer-hackathon/blob/main/NOTICE.md)

**Redlines / diff**
- `redlines` (MIT, 0.6.2): `Redlines(old, new)`, `.output_markdown`, `.output_json(pretty=True)`, `markdown_style="none"`; extras `redlines[pdf]`, `redlines[nupunkt]` (sentence boundaries handling abbreviations/citations, Py 3.11+), `redlines[levenshtein]`; `WholeDocumentProcessor` default is "5-6x faster" — [redlines README](https://github.com/houfu/redlines)
- google/diff-match-patch is archived (last push 2024-05-22); PyPI `diff-match-patch` last release 20241021 — [GitHub](https://github.com/google/diff-match-patch); [PyPI](https://pypi.org/pypi/diff-match-patch/json)

**Presidio**
- MIT, community-owned (moved from Microsoft); `presidio-analyzer` 2.2.366 requires Python >=3.11,<3.15 — [transition doc](https://github.com/data-privacy-stack/presidio/blob/main/docs/project_transition.md); [PyPI](https://pypi.org/pypi/presidio-analyzer/json)

### Inferences
- ClauseTrace maps almost 1:1 onto the "new circular → impact alert" feature: `diff_versions` (provision key + content hash) → `apply_version` (mark dependent findings STALE, keep old rows) → re-verify queue. Copying `verify.py`'s error-code constants and the `in_force(provision, as_of)` helper saves ~2-3 h and gives judges a familiar "deterministic checker, model can't set status" story. Credit it in the README (MIT requires the copyright notice). Do not copy the DPDP corpus or Meta-specific LLM gateway.
- Note: copying another team's hackathon code may raise originality questions with organizers; borrowing patterns with attribution is safer than lifting whole modules.
- For the amendment timeline redline, stdlib `difflib.SequenceMatcher(...).get_opcodes()` on word tokens is enough and has zero deps; `redlines.output_json` is a convenient JSON for a React renderer if desired.
- Presidio pulls spaCy models; for a 36 h demo on public regulatory circulars (which rarely contain PII) it is optional — include only if the problem statement scores privacy. Masking must be reversible (map placeholders back) or the verbatim-quote check will fail on masked text.

### Gaps
- I did not verify Presidio's spaCy model download size or default recognizers list from primary docs in this session.
- I did not run ClauseTrace's tests or check its code quality beyond reading the file/function structure.

## 7. Frontend PDF highlighting in Next.js App Router (Next 16.4.6 / React 19.3.1 current)

### Takeaway
Use `react-pdf` (wojtekmaj, MIT, v11.1.0, peer React 19, pdfjs-dist 6.5.438) loaded with `next/dynamic` `{ ssr: false }` and draw your own absolutely-positioned highlight `<div>`s from backend bbox rects (scaled by page width). The dedicated highlighter libs are stale and pinned to React 18 / pdfjs 4.4; `@react-pdf-viewer` is archived and custom-licensed.

### Cited Findings
- npm (2026-11-23): `next` 16.4.6, `react` 19.3.1; `react-pdf` 11.1.0 (modified 2026-11-14) peerDependencies `react ^19.0.0`, depends on `pdfjs-dist 6.5.438` — [npm react-pdf](https://www.npmjs.com/package/react-pdf)
- react-pdf README: set `pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`; "The `workerSrc` must be set in the **same module** where you use React-PDF components"; "In Next.js, make sure to skip SSR when importing the module… [App Router](https://nextjs.org/docs/app/guides/lazy-loading#skipping-ssr)"; extra `next.config.js` changes only needed for Next.js prior to v15 — [react-pdf README](https://github.com/wojtekmaj/react-pdf)
- `react-pdf-highlighter` latest npm 8.0.0-rc.0 (modified 2024-09-14), depends on `pdfjs-dist 4.4.168` (pinned), peer `react >=18.0.0` — [npm](https://www.npmjs.com/package/react-pdf-highlighter)
- `react-pdf-highlighter-extended` 8.1.0 (modified 2024-07-05), peer `react ^18.3.1`, `pdfjs-dist ^4.4.168`; exposes `viewportToScaled` "Convert a highlight position to platform agnostic coords" — [npm](https://www.npmjs.com/package/react-pdf-highlighter-extended); [README](https://github.com/DanielArnould/react-pdf-highlighter-extended)
- `react-pdf-highlighter-plus` 1.3.1 (2026-07-05, MIT) also peers `react ^18.3.1`, `pdfjs-dist ^4.4.168` — [npm](https://www.npmjs.com/package/react-pdf-highlighter-plus)
- `@react-pdf-viewer/core` / `highlight` 3.12.0 last modified 2023-03-21, peer `pdfjs-dist ^2.16.105 || ^3.0.279`, license URL `https://react-pdf-viewer.dev/license`; repo archived — [npm](https://www.npmjs.com/package/@react-pdf-viewer/core)
- `@embedpdf/react-pdf-viewer` 2.15.1 (MIT, peer react >=17) and `@embedpdf/core` 3.3.0 (Apache-2.0, 2026-11-16) are actively maintained — [npm](https://www.npmjs.com/package/@embedpdf/react-pdf-viewer)
- `pdfjs-viewer-element` 4.2.0 (MIT, 2026-10-16) is the web component kotaemon uses for phrase-search highlighting — [npm](https://www.npmjs.com/package/pdfjs-viewer-element); [kotaemon pdf_viewer.js](https://github.com/Cinnamon/kotaemon/blob/main/libs/ktem/ktem/assets/js/pdf_viewer.js)

### Inferences
- With Next 16 / React 19, the react-pdf-highlighter family will raise peer-dependency conflicts (`npm install --legacy-peer-deps` may work but is untested and pins an old pdfjs); for a read-only "show me the evidence" highlight you don't need their selection/annotation features.
- Minimal pattern (~1-2 h): `<Document file={url}><Page pageNumber={p} width={w} renderTextLayer /></Document>` inside a client component imported with `dynamic(() => import('./PdfPane'), { ssr: false })`; overlay `rects.map(r => <div style={{left: r.x0*scale, top: r.top*scale, width:(r.x1-r.x0)*scale, height:(r.bottom-r.top)*scale}} className="bg-yellow-300/40 absolute"/>)` where `scale = w / page_width_pts`. pdfplumber's `top` origin is the page top-left, matching CSS; Docling `BoundingBox` may be bottom-left origin and need flipping (check `coord_origin`).
- Fallback with zero coordinate math: react-pdf's `customTextRenderer` to wrap matching text-layer spans in `<mark>` (kotaemon-style phrase highlight).

### Gaps
- I did not test any of these packages in a live Next 16 build; `customTextRenderer` was not re-verified in the v11 README grep.
- EmbedPDF (PDFium/WASM) maturity for highlight overlays was not evaluated.

## 8. Recommended reuse bill of materials and hours saved

### Takeaway
Import ~12 libraries, copy ~4 small MIT/Apache snippets with attribution, and borrow 5 ideas/prompts; this plausibly saves ~25-35 person-hours versus writing equivalents, most of it in parsing, verification models, and extraction grounding.

### Cited Findings
- (Sources for each item are in §§1-7 above.)

### Inferences
**Import as library (pip/npm)**
| Component | Package | Why | Est. hours saved |
|---|---|---|---|
| Layout/tables/chunking | `docling`, `docling-core` (`HybridChunker`, `contextualize`) | MIT; structure + tables + heading context | 6-8 |
| Exact char bboxes | `pdfplumber` (`.chars`, `extract_words(return_chars=True)`, `search`) | MIT; avoids AGPL | 1-2 |
| Lexical retrieval | SQLite FTS5 `bm25()` or `bm25s` | zero/numpy-only deps | 1 |
| Reranker | `FlagEmbedding` → `FlagReranker('BAAI/bge-reranker-v2-m3')` (or `sentence-transformers` `CrossEncoder`) | Apache-2.0 model, 0.6B | 1 |
| Quote check | `rapidfuzz` | MIT, C++ speed | 0.5 |
| Entailment | HHEM-2.1-Open via `transformers` (`trust_remote_code=True`) | 0.1B, CPU ~1.5 s/2k tokens | 3-4 |
| Span hallucination UI | `lettucedetect` (ModernBERT model) | char spans for red underlines | 2-3 |
| Value tuples / amendment metadata | `langextract[openai]` | char_interval grounding + HTML review | 3-4 |
| Redline | stdlib `difflib` (or `redlines`) | | 1 |
| PII (optional) | `presidio-analyzer`, `presidio-anonymizer` | | 1 |
| PDF render | `react-pdf` v11 + custom overlay | React 19 compatible | 2-3 |

**Copy with attribution (keep LICENSE + header comment)**
- kotaemon `libs/kotaemon/kotaemon/indices/qa/utils.py` → `find_text`, `find_start_end_phrase` (Apache-2.0) — fallback quote locator (~0.5-1 h).
- ClauseTrace `backend/checker/verify.py` error-code constants + `_in_force_on`/`_is_current` pattern; `backend/app/modules/law/diff.py` `diff_versions` + `in_force`; `impact.py` `apply_version` flow (MIT) — adapt to provision_versions/value-tuples tables (~2-3 h).
- PaperQA2 `contracrow.json` 11-label contradiction scale + prompt text (Apache-2.0) → OpenAI Structured Outputs enum (~0.5-1 h).
- WikiChat `pipelines/prompts/generate_split_claims.prompt` (Apache-2.0) → claim splitter before per-sentence NLI (~0.5 h).
- ALCE `eval.py` `compute_autoais` logic (MIT) with HHEM swapped in for T5-XXL → offline citation precision/recall numbers for the pitch (~1-2 h).

**Borrow idea only**
- kotaemon: LLM emits start/end phrases instead of full quotes; logprob-based `qa_score` as low-confidence banner; UMAP citation viz (skip).
- RAGFlow: citation insertion and DeepDoc layout ideas (code now Go; don't port).
- MiniCheck: sentence-level decomposition before checking; keep MiniCheck-FT5 as optional second verifier (install from git, not PyPI `minicheck`).
- ClauseTrace: "model drafts, deterministic checker decides status"; append-only versions; decoy-document test proving impact alerts don't over-fire.
- OpenAI cookbook `Developing_hallucination_guardrails.ipynb` / `Structured_Outputs_Intro.ipynb` for schema patterns.

**Avoid**
- PyMuPDF/pymupdf4llm unless the repo is AGPL-licensed; `@react-pdf-viewer/*` (archived, custom license); AlignScore (PyTorch 1.12-era, manual checkpoints); MinerU (extra license terms, heavy); Bespoke-MiniCheck-7B (GPU/vLLM, commercial-use restriction); PaperQA2 as a dependency (paper-centric agent loop).

**Hours-saved estimate:** summing the table midpoints gives roughly 22-29 h from libraries plus ~5-8 h from copied snippets/prompts, i.e. ~25-35 person-hours — about one full person-day-and-a-half for a 2-4 person team over 36 h. This is an engineering estimate, not a measured figure.

**Install-weight summary (from cited figures):** HHEM 0.1B (<600 MB RAM), LettuceDetect base 0.1B, bge-reranker-v2-m3 0.6B, MiniCheck-FT5 770M; all CPU-feasible. Docling also downloads layout/table models on first run (size unverified). Pre-download all HF models in a `make models` step before the hackathon starts to avoid venue Wi-Fi failures.

### Gaps
- Hour estimates are judgment, not measured.
- Docling model download size and first-run time, Presidio/spaCy model size, and LettuceDetect/MiniCheck CPU latency were not found in primary sources during this session.
