# High-Precision Retrieval and Parsing over Dense Financial, Legal and Regulatory PDFs (Beyond Basic RAG)

Scope note: research done on 2026-11-23. Items marked **[verified this session]** were read from the primary page during this research. Items marked **[prior knowledge, not re-verified]** come from well-known papers and model cards that I did not re-open in this session. Check them before quoting in a pitch.

## 1. PDF parsing that keeps page numbers, bounding boxes and tables (including tables split across pages)

### Takeaway
No parser wins on everything. Use a **two-layer approach**:
- **Fast, coordinate-exact text layer:** PyMuPDF/pymupdf4llm, or pdfplumber for character-level boxes. This is what drives citation highlighting.
- **Structure layer:** Docling (MIT license, keeps page number and bbox on every item) for layout, reading order and tables. Add MinerU only if VLM-grade accuracy is needed on scanned or complex pages and a GPU is available.

All the open-source layout parsers do poorly on table **cell values** in dense financial tables. Always keep the original page crop and coordinates so an answer can be traced back and checked.

### Cited Findings
- **OmniDocBench (CVPR 2025)** is the de facto parsing benchmark. On its end-to-end leaderboard MinerU2.5-Pro scores 95.75 overall and Marker 78.44. Docling is listed among evaluated pipelines but is not in the main results table. — [OmniDocBench GitHub](https://github.com/opendatalab/OmniDocBench) [verified this session, via search summary]
- **Marker's self-reported numbers:** 80.5 on its own "OmniParseBench" vs 67.5 for Docling, and about 31x faster than MinerU 2.5-Pro. These are vendor claims. — [marker-pdf on PyPI](https://pypi.org/project/marker-pdf/) [verified this session, via search summary]
- **Community aggregator, OmniDocBench-style edit distance (lower is better):** MinerU 0.133, Marker 0.296, Docling 0.589. Some cells are flagged as unreliable. — [dantetemplar/pdf-extraction-agenda](https://github.com/dantetemplar/pdf-extraction-agenda)
- **Reliability on OmniDocBench's 1,355 pages:** MinerU failed on 1 page and Docling on 13. — [arXiv 2604.00500](https://arxiv.org/pdf/2604.00500)
- **Practitioner benchmark** (one 17-page financial document, about 20 tables, 42 tools; CPU tools run on an Apple M2) [verified this session] — [needl.ai](https://needl.ai/technical-notes/benchmarking-pdf-extraction-tools)

  | Tool | Text similarity | Coverage | Table cell accuracy | Time per page |
  |---|---|---|---|---|
  | pymupdf4llm | 0.50 | 0.93 | 0.26 | about 1.7 s |
  | Docling (RapidOCR, CPU) | 0.63 | 0.82 | 0.36 | about 11 s |
  | Marker (CPU) | 0.74 | 0.85 | 0.36 | about 108 s |
  | MinerU (CPU) | 0.61 | 0.54 | 0.32 | not reported |
  | olmOCR-2-7B | 0.85 | — | 0.51 | — |
  | Qwen3-VL-235B | 0.87 | — | 0.86 | — |

  - Frontier proprietary VLMs scored highest on table cells (one reached 1.00 cell accuracy).
  - The authors' conclusion: Docling, Marker and MinerU "find tables but score only 0.32–0.36 on cell accuracy", and plain-text tools (Tika, markitdown, Mistral OCR) score 0 on tables.
  - The report has **no multi-page table results**. It is a single document, so treat it as indicative only.
- **Docling timings:** median 0.32 s/page on an M3 Max CPU (0.26 s at p5, 6.48 s at p95) and median 114 ms/page on an Nvidia L4 GPU. TableFormer (fast) takes about 0.4 s per table on an L4 GPU and about 1.74 s on an x86 CPU. TableFormer predictions are matched back to the PDF's own text cells, so text is not re-OCRed. — [Docling paper arXiv 2501.17887](https://arxiv.org/pdf/2501.17887); [Docling Technical Report arXiv 2408.09869](https://arxiv.org/html/2408.09869v5) [verified this session, via search summary]
- **ParseBench (2026, LlamaIndex):** about 2,000 human-verified enterprise pages (insurance, finance, government) across 5 dimensions: tables, charts, content faithfulness, semantic formatting, and visual grounding. 14 methods were tested. LlamaParse Agentic (hosted, paid) was top at 84.9%. Finding: "no method is consistently strong across all five dimensions." — [arXiv 2604.08538](https://arxiv.org/abs/2604.08538) [verified this session]
- **Per-span coordinates for highlighting** [prior knowledge, not re-verified]:
  - **PyMuPDF:** `page.get_text("dict"/"rawdict")` returns blocks, lines, spans (and characters in rawdict), each with a `bbox`. `page.search_for(text)` returns rectangles for highlight annotations. `page.find_tables()` gives table cells with bboxes. pymupdf4llm `to_markdown(page_chunks=True)` returns per-page dictionaries with page metadata. License is AGPL-3.0 (commercial license available). — [PyMuPDF docs](https://pymupdf.readthedocs.io/en/latest/app1.html)
  - **pdfplumber:** character, word and line objects with x0/top/x1/bottom, plus configurable table extraction. MIT license. **Camelot** has lattice mode (ruled tables) and stream mode (whitespace tables) and returns a per-table bbox. Neither does OCR. — [pdfplumber](https://github.com/jsvine/pdfplumber), [Camelot](https://camelot-py.readthedocs.io/)
  - **Docling:** every `DoclingDocument` item carries `prov` (page_no, bbox, charspan). Exports to Markdown, JSON and DocTags. MIT license. — [Docling GitHub](https://github.com/docling-project/docling)
  - **Unstructured** (`hi_res` strategy): elements carry `metadata.page_number` and `metadata.coordinates`. Apache-2.0. — [Unstructured docs](https://docs.unstructured.io/)
  - **Marker:** JSON output gives a block tree with polygons and bboxes. Code is GPL-3.0 and weights have a revenue-restricted licence. — [Marker GitHub](https://github.com/datalab-to/marker)
  - **MinerU:** `middle.json` / `content_list.json` include `page_idx` and bbox per block. AGPL-3.0. — [MinerU GitHub](https://github.com/opendatalab/MinerU)
  - **LlamaParse:** hosted, with a JSON mode that includes per-item bboxes. Not usable if the rule is no paid API.
- A FinanceBench parsing study (Kim et al., ICLR 2025 FinAI workshop) found that **restructuring documents into Markdown** was the best of the preprocessing options it tested. — [arXiv 2503.15191](https://arxiv.org/pdf/2503.15191v1) [via search summary]

### Inferences
- **Highlighting stack:** parse with Docling for structure and tables. Store `(doc_id, page_no, bbox)` for every chunk. At answer time, re-locate the cited sentence with PyMuPDF `search_for()` on that page to get tight span rectangles for the UI. This avoids depending on any one parser's bbox granularity.
- **Tables split across pages:** none of the cited benchmarks score this. A practical heuristic, built on Docling or PyMuPDF `find_tables` output, is to merge table T on page p with table T' at the top of page p+1 when all of these hold:
  - T ends within about 10% of the page bottom.
  - T' starts within about 15% of the page top.
  - Column count and x-positions of column boundaries match within a tolerance.
  - T' has no header row, or repeats T's header.

  Store the merged table as one unit that lists all its pages and bboxes.
- **Time budget:** for a hackathon corpus of hundreds of pages, Docling on CPU (about 0.3–1 s/page) is fine. Marker and MinerU on CPU are too slow; run them only with a GPU.
- **Scanned Hindi pages:** Docling's OCR backends (EasyOCR, Tesseract, RapidOCR) support Devanagari through their language packs. VLM OCRs (olmOCR, Qwen2.5/3-VL) are more accurate but need a GPU.

### Gaps
- I found no published benchmark that scores multi-page table stitching for any of these tools. I saw MinerU release notes mention cross-page table merging but did not verify it.
- No head-to-head speed benchmark for all of PyMuPDF, Docling, Unstructured, Marker, MinerU and Camelot on the same hardware and corpus. The needl.ai single-document numbers are the closest.
- No Hindi or Devanagari-specific parsing benchmark found.

## 2. Chunking for legal and regulatory text: structure-aware, parent-child, contextual retrieval, late chunking, table-as-unit

### Takeaway
The single best-documented gain is **Anthropic's Contextual Retrieval**, which prepends a 50–100-token document-situating context to each chunk before embedding and BM25 indexing:
- Top-20 retrieval failure falls by 35% with contextual embeddings alone.
- It falls by 49% when contextual BM25 is added.
- It falls by 67% when reranking is added on top.

This works with an open-weight local LLM in place of Claude Haiku. **Late chunking** is free (no LLM calls) and gives about 1.8 points of nDCG on average. Neither naive fixed-size nor recursive splitting is uniformly better on legal text. Structure-aware chunking on section and clause numbers is the sensible default, but I found no published number isolating it.

### Cited Findings
- **Anthropic Contextual Retrieval** [verified this session] — [Anthropic blog](https://www.anthropic.com/news/contextual-retrieval)
  - Top-20 retrieval failure rate (1 − recall@20), averaged across domains, with Gemini text-embedding-004:

    | Configuration | Failure rate | Reduction vs baseline |
    |---|---|---|
    | Baseline | 5.7% | — |
    | Contextual embeddings | 3.7% | −35% |
    | Contextual embeddings + contextual BM25 | 2.9% | −49% |
    | Same, plus reranking | 1.9% | −67% |

  - Setup:
    - Reranking retrieved the top 150 chunks and kept the top 20, using Cohere rerank.
    - Top-20 beat top-5 and top-10.
    - Voyage and Gemini embeddings were the strongest tested.
    - The cost estimate assumes 800-token chunks and 8k-token documents.
    - Generated context is usually 50–100 tokens.
    - One-time cost is $1.02 per million document tokens with prompt caching.
  - Prompt: the whole document goes in `<document>` tags and the chunk in `<chunk>` tags. The model is asked for "a short succinct context to situate this chunk within the overall document", answering only with that context.
- **Late chunking (Jina, arXiv 2409.04701)** [verified this session] — [arXiv 2409.04701](https://arxiv.org/html/2409.04701)
  - Method: embed the whole document (up to 8192 tokens) with a long-context, mean-pooling embedder, then pool token embeddings per chunk span.
  - Average nDCG@10 across 3 models and 4 BEIR datasets: 52.2 → 54.0 with 256-token fixed chunks (about +1.8 absolute, +3.5% relative).
  - With sentence boundaries: +1.9 absolute (52.4 → 54.3).
  - Selected jina-embeddings-v3 results: FiQA (financial QA) 46.3 → 47.6, TREC-COVID 73.0 → 77.2, NFCorpus 35.6 → 36.7.
  - Nomic's gains were smaller, and sometimes zero.
  - No training is needed. Long late chunking with overlapping macro-chunks handles documents longer than 8192 tokens.
  - bge-m3 was not evaluated.
- **LegalBench-RAG** (6,858 queries over 714 documents, about 79.7M characters; mini version has 776 queries over 72 documents) [verified this session] — [arXiv 2408.10343](https://arxiv.org/html/2408.10343v1)
  - Setup: OpenAI text-embedding-3-large on LegalBench-RAG-mini, comparing naive 500-character chunks with RecursiveCharacterTextSplitter (RCTS).

    | Configuration | Precision@1 | Recall@64 |
    |---|---|---|
    | Naive, no reranker | 2.40 | 76.39 |
    | RCTS, no reranker | 6.41 | 62.22 |
    | RCTS + Cohere rerank-english-v3.0 | 6.13 | 61.06 |

  - Cohere rerank generally *lowered* scores on legal text.
  - The hardest subset was MAUD (merger agreements): Precision@1 2.65%, Recall@64 28.28%.
  - The paper's tables have internal inconsistencies (duplicate rows, differing query counts).
- **FinanceBench page-level study** [verified this session] — [arXiv 2602.17981](https://arxiv.org/html/2602.17981v1)
  - **Parent-child retrieval did badly** in this setup: DocRec@5 0.31 and PageRec@5 0.13, against 0.88 and 0.34 for plain BGE-M3 dense retrieval.
  - Structure helps only if the parent unit is right.
- **Metadata-enriched contextual chunks on FinanceBench** (RAGChecker scores, 150 questions) [verified this session] — [arXiv 2510.24402](https://arxiv.org/html/2510.24402v1)
  - Hybrid retrieval with standard chunks: F1 30.4. With contextual chunks: 37.6.
  - Hybrid + Cohere rerank with contextual chunks: F1 44.1, against 32.9 for naive dense RAG.
  - The chunk-level metadata was: parent clusters, entities, 3–10 "answered_questions", and retrieval nuggets. It was generated offline by an LLM over 1000-token chunks with 100-token overlap.

### Inferences
- **Recommended default for circulars, regulations and contracts:**
  1. Parse to a heading and clause tree (Docling section headers, plus regex on numbering such as `^\d+(\.\d+)*`, `^\([a-z]\)`, `^Clause \d+`, `^Chapter [IVX]+`).
  2. Make the leaf clause the retrieval unit, about 200–500 tokens.
  3. Prepend a breadcrumb such as "Doc title > Chapter 3 > Para 3.2(b)", plus a contextual-retrieval sentence generated by a local LLM (e.g. Qwen3-8B or Llama-3.1-8B served with vLLM; prefix caching keeps per-document cost low).
  4. Index the contextualised text in both BM25 and dense.
  5. Return the parent section (or neighbouring clauses) to the LLM only after reranking ("small-to-big").
- **Tables as units:** keep each table (or stitched multi-page table) as one chunk. Serialise it as Markdown with a caption, units and its page range. Also create row-level "fact" chunks, e.g. "FY2023 | Net revenue | ₹1,234 cr | Table 4, p.37", because BM25 matches numeric and row-label queries far better on these.
- Late chunking pairs naturally with jina-embeddings-v3, but that model is non-commercial licensed (see section 4). With bge-m3 it is untested in the literature I found.

### Gaps
- No published recall number isolating "clause/section-aware chunking vs fixed-size" on regulatory corpora such as RBI or SEBI circulars.
- Anthropic's numbers use proprietary Claude, Gemini, Voyage and Cohere models. I found no replication with fully open-weight models.
- No published ablation for table-as-unit chunking on FinanceBench was located. MimirRAG claims it helps (see section 7) but I did not read its ablation table.

## 3. Hybrid retrieval (BM25 + dense with RRF) and rerankers

### Takeaway
Hybrid BM25 + dense with RRF plus a cross-encoder reranker is the standard, high-return upgrade. Combined with contextual chunks it cuts retrieval failures by about two-thirds (Anthropic). Two cautions:
- Naive hybrid can *hurt* when BM25 is weak on a corpus. On FinanceBench page retrieval, BM25 alone scored DocRec@5 0.32 vs 0.88 for dense. Weight the fusion and evaluate it.
- Some rerankers hurt out of domain (Cohere on LegalBench-RAG).

The open-weight rerankers to use are **bge-reranker-v2-m3** (multilingual, about 568M parameters) and **Qwen3-Reranker** (0.6B, 4B, 8B). Qwen reports its rerankers clearly ahead of bge-reranker-v2-m3.

### Cited Findings
- **Anthropic:** adding contextual BM25 to contextual embeddings moved the failure rate from 3.7% to 2.9%. Adding a reranker (top-150 reranked to top-20) moved it to 1.9%. — [Anthropic](https://www.anthropic.com/news/contextual-retrieval) [verified this session]
- **FinanceBench, k=5, 150 questions** [verified this session] — [arXiv 2602.17981](https://arxiv.org/html/2602.17981v1)

  | Method | DocRec@5 | PageRec@5 |
  |---|---|---|
  | BGE-M3 dense | 0.88 | 0.34 |
  | BM25 | 0.32 | 0.07 |
  | SPLADE | 0.50 | 0.16 |
  | Hybrid BM25 + BGE-M3 | 0.61 | 0.23 |
  | BGE-M3 + reranker | 0.87 | 0.41 |
  | BGE-M3 + Multi-HyDE + reranker | 0.93 | 0.46 |
  | Learned page scorer (proposed) | 0.95 | 0.55 |

  - The oracle-document bound for PageRec is 0.60.
  - Conclusion: finding the right filing is easy, but **finding the right page is the bottleneck**.
- **Metadata-driven FinanceBench RAG:** naive dense scored F1 32.9. Hybrid with standard chunks *dropped* to 30.4, and hallucination rose from 18.5% to 26.0%. Hybrid + Cohere rerank scored 38.9, with the best faithfulness (81.7) and lowest hallucination (12.2). — [arXiv 2510.24402](https://arxiv.org/html/2510.24402v1) [verified this session]
- **LegalBench-RAG:** Cohere rerank-english-v3.0 lowered Precision@1 and Recall@64 against no reranker. — [arXiv 2408.10343](https://arxiv.org/html/2408.10343v1) [verified this session]
- **A 2026 parsing and chunking study for financial QA** found that sparse+dense hybrid gave the best overall balance across text and table queries. Dense was better on narrative text and late-interaction (ColBERT-style) models were better on tables. — [arXiv 2604.12047](https://arxiv.org/pdf/2604.12047) [search snippet only; full text returned 404]
- **Qwen3 rerankers on MMTEB-R:**

  | Reranker | MMTEB-R |
  |---|---|
  | bge-reranker-v2-m3 | 58.36 |
  | Qwen3-Reranker-0.6B | 66.36 |
  | Qwen3-Reranker-4B | 72.74 |
  | Qwen3-Reranker-8B | 72.94 |

  All rerank the top-100 candidates from Qwen3-Embedding-0.6B. These are Qwen's own runs, not independently replicated. Apache-2.0. — [Qwen3 Embedding blog](https://qwenlm.github.io/blog/qwen3-embedding); [arXiv 2506.05176](https://arxiv.org/html/2506.05176v3) [verified this session, via search summary]
- **ColPali (ICLR 2025):** embeds page images directly with late interaction. On ViDoRe it "significantly outperforms all other retrieval systems". A secondary blog reports about 0.81 nDCG@5 vs about 0.66 for an OCR (Tesseract) text pipeline; I did not confirm this against the paper tables. Critics note that ViDoRe is mostly clean, born-digital pages. — [ColPali arXiv 2407.01449](https://arxiv.org/html/2407.01449v5); [blog](https://gyuhoshim.github.io/blog/retrieval-in-vision-space.html); [arXiv 2505.05666](https://arxiv.org/pdf/2505.05666)
- **RRF:** score = Σ 1/(k + rank_i) with k = 60. It needs no score normalisation and outperformed individual rankers and Condorcet fusion. — [Cormack, Clarke and Buettcher, SIGIR 2009](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) [prior knowledge, not re-verified]
- **bge-reranker-v2-m3:** a cross-encoder built on bge-m3 (about 568M parameters), multilingual, Apache-2.0. — [HF model card](https://huggingface.co/BAAI/bge-reranker-v2-m3) [prior knowledge, not re-verified]
- **BGE-M3** emits dense, sparse (lexical weights) and ColBERT multi-vector outputs from one forward pass. This gives a "free" hybrid without a separate BM25 index. — [BGE-M3 HF card](https://huggingface.co/BAAI/bge-m3) [prior knowledge, not re-verified]

### Inferences
- **Recipe:**
  1. Retrieve the top 50–150 from both BM25 (on contextualised text, with a tokenizer that keeps tokens like "RBI/2024-25/45", "₹" and "Section 12A") and dense bge-m3 or Qwen3-Embedding.
  2. Fuse with RRF (k = 60). Use a weighted RRF and tune the weight on 30–50 hand-labelled questions.
  3. Cross-encoder rerank to the top 10–20 with bge-reranker-v2-m3 (fast) or Qwen3-Reranker-4B (more accurate, GPU).
  4. Expand each hit to its parent section and page.
- **Why BM25 still matters on regulatory text:** exact identifiers such as circular numbers, section numbers and defined terms are where dense models fail. The Anthropic result (contextual BM25 adding 14 points of failure reduction on top of embeddings) supports keeping it even when, as in FinanceBench, BM25 is weak overall.
- **Measure page recall@k, not just chunk or document recall.** The FinanceBench data shows a large document→page gap.
- **ColPali / ColQwen** is a strong fallback for scanned or chart-heavy pages. Its index is a page-level image index, so it fits "show the page" UX, but it gives no sentence-level highlighting by itself.

### Gaps
- No independent head-to-head of bge-reranker-v2-m3 vs Qwen3-Reranker vs Cohere on finance or legal corpora was found.
- No verified ColQwen2 vs OCR-pipeline numbers. Check the ViDoRe leaderboard on Hugging Face.

## 4. Multilingual (Hindi + English) open-weight embeddings

### Takeaway
**BGE-M3** (MIT, 8192 tokens, dense + sparse + multi-vector) is the safest open-weight default for Hindi + English. It has the best published Hindi retrieval numbers among the classic options (MIRACL-hi nDCG@10 about 59, Hindi-BEIR average 46.18 vs 44.37 for mE5-large). **Qwen3-Embedding** (0.6B, 4B, 8B; Apache-2.0) is the newer, stronger option on MMTEB if a GPU is available. **jina-embeddings-v3** is CC-BY-NC (non-commercial), so it is a weaker pick despite late-chunking synergy.

### Cited Findings
- **Hindi-BEIR** (15 datasets), average nDCG@10: BGE-M3 46.18, multilingual-e5-large 44.37, multilingual-e5-base 40.57. — [Hindi-BEIR arXiv 2408.09437](https://arxiv.org/pdf/2408.09437); [arXiv 2409.05401](https://arxiv.org/pdf/2409.05401) [verified this session, via search summary]
- **BGE-M3 MIRACL-Hindi nDCG@10:** 59.3 reported, 58.9 reproduced, according to a third-party Hindi model card. — [prithivida/miniMiracle_hi_v1](https://huggingface.co/prithivida/miniMiracle_hi_v1) [secondary source]
- **Qwen3-Embedding-8B** scored 70.58 on MTEB Multilingual (#1 as of 5 June 2025), above Gemini-Embedding's 68.37. It comes in 0.6B, 4B and 8B sizes with matching rerankers, Apache-2.0. — [Qwen blog](https://qwenlm.github.io/blog/qwen3-embedding); [arXiv 2506.05176](https://arxiv.org/html/2506.05176v3) [verified this session, via search summary]
- **Qwen3-VL-Embedding-8B** (January 2026) reports an MMTEB mean of 67.9 and handles page images as well as text. — [arXiv 2601.04720](https://arxiv.org/pdf/2601.04720)
- **Model facts** [prior knowledge, not re-verified]:
  - multilingual-e5-large / -large-instruct: 560M parameters, 512-token limit, MIT. — [HF card](https://huggingface.co/intfloat/multilingual-e5-large-instruct)
  - jina-embeddings-v3: 570M parameters, 8192 tokens, task LoRA adapters, Matryoshka dimensions, **CC BY-NC 4.0**. — [HF card](https://huggingface.co/jinaai/jina-embeddings-v3)
  - BGE-M3: XLM-R-based, 568M parameters, 8192 tokens, 100+ languages, MIT. — [HF card](https://huggingface.co/BAAI/bge-m3)

### Inferences
- For a corpus that mixes Hindi and English circulars:
  - Use BGE-M3 dense + sparse, with bge-reranker-v2-m3 (same multilingual backbone). This runs on CPU for small corpora.
  - With a GPU, try Qwen3-Embedding-0.6B or 4B with Qwen3-Reranker-0.6B or 4B.
  - Pick using a 30-question Hindi/English cross-lingual dev set: Hindi query → English document and the reverse.
- **BM25 on Hindi:** use a Unicode-aware tokenizer (e.g. Indic NLP library, or a simple whitespace + punctuation split that keeps Devanagari), plus transliteration-insensitive matching for numbers (Devanagari digits ०-९ → 0-9).
- Bilingual RBI/SEBI documents often have Hindi and English versions of the same circular. Deduplicate or link them by circular number so retrieval does not waste top-k slots.

### Gaps
- I found no Hindi MIRACL or Hindi-BEIR number for jina-embeddings-v3 or Qwen3-Embedding specifically.
- No Hindi legal or financial retrieval benchmark was found.

## 5. Query decomposition, multi-hop and iterative retrieval, query rewriting, HyDE

### Takeaway
On financial QA, **HyDE / Multi-HyDE + reranking** is the best-evidenced single query-side trick. On FinanceBench page recall@5 it scores 0.46 vs 0.34 for plain dense. For answers split across pages or documents, use **decompose → retrieve per sub-question → merge**, or **interleaved retrieval with chain-of-thought (IRCoT)**. IRCoT reported up to +21 points retrieval and +15 points QA on multi-hop benchmarks. Plain LLM query expansion can *hurt*: on FinanceBench it scored 0.68 DocRec@5 vs 0.88 for no expansion.

### Cited Findings
- **FinanceBench @5** (DocRec / PageRec): BGE-M3 0.88 / 0.34; query expansion 0.68 / 0.27; HyDE 0.86 / 0.40; Multi-HyDE 0.85 / 0.42; BGE-M3 + Multi-HyDE + reranker 0.93 / 0.46. A learned "page-then-chunk" scorer reaches 0.95 / 0.55, and raises numeric-match answer accuracy to 0.30 vs 0.12 for the best baseline. — [arXiv 2602.17981](https://arxiv.org/html/2602.17981v1) [verified this session]
- **Filter + rewrite on FinanceBench:** LLM-based file filtering plus query rewriting, on top of hybrid + Cohere rerank with contextual chunks, gave the best F1 (44.4) vs naive RAG's 32.9. Claim recall fell (42.3 vs 48.2 without filtering), so aggressive filtering trades recall for precision. — [arXiv 2510.24402](https://arxiv.org/html/2510.24402v1) [verified this session]
- **HyDE:** an LLM writes a hypothetical answer document, which is embedded and used for retrieval. Unsupervised, it beat Contriever and was comparable to fine-tuned retrievers across tasks and languages. — [Gao et al., arXiv 2212.10496](https://arxiv.org/abs/2212.10496) [prior knowledge, not re-verified]
- **IRCoT:** interleaving retrieval with chain-of-thought steps improves retrieval by up to 21 points and downstream QA by up to 15 points on HotpotQA, 2WikiMultihopQA, MuSiQue and IIRC. — [Trivedi et al., arXiv 2212.10509](https://arxiv.org/abs/2212.10509) [prior knowledge, not re-verified]
- **Kim et al. (KAIST)** combined query expansion, Markdown preprocessing, hybrid retrieval with fine-tuned embedders, and a DPO-trained reranker for financial QA. — [arXiv 2503.15191](https://arxiv.org/pdf/2503.15191v1) [via search summary; numbers not extracted]

### Inferences
- **Practical 36-hour design:**
  1. A local LLM classifies the query: single-hop lookup, comparison, multi-period, or cross-document.
  2. For multi-part queries, decompose into 2–4 sub-queries with explicit entities and periods, e.g. "FY23 net NPA ratio" and "FY24 net NPA ratio".
  3. Run hybrid + rerank per sub-query.
  4. Union the results with per-sub-query quotas, so one sub-question cannot crowd out the others.
  5. Let the generator answer only from cited spans.
  6. Add one "self-check" loop: if a sub-question has no supporting span with reranker score above a threshold, issue a rewritten or HyDE query once, then abstain.
- Generate HyDE passages in the corpus's register ("As per RBI circular …") and in the query's language. For Hindi queries, generate both a Hindi and an English hypothetical passage (cross-lingual Multi-HyDE).
- Cap iterative or agentic loops at about 2–3 retrieval rounds. The cited works show gains, but latency and error compounding grow quickly with an 8B local model.

### Gaps
- No finance- or legal-specific published numbers for explicit query decomposition (as opposed to HyDE) were found.
- No numbers found for agentic retrieval frameworks (e.g. Self-RAG, ReAct-style agents) on FinanceBench or LegalBench-RAG with open-weight models.

## 6. Metadata extraction (circular number, issue/effective date, amends/supersedes) for temporal filtering

### Takeaway
Metadata-filtered retrieval is shown to help on FinanceBench (filter + rewrite + rerank gave the best F1, 44.4 vs 32.9 naive). I found **no published benchmark** for regulatory-circular metadata extraction such as amends/supersedes graphs. Treat it as an engineering task:
- Regex plus a small LLM with JSON-schema-constrained output, then store the fields as vector-DB payload filters.
- Build an amendment graph to answer "what is in force on date X?".

### Cited Findings
- **Metadata-driven RAG on FinanceBench** [verified this session] — [arXiv 2510.24402](https://arxiv.org/html/2510.24402v1)
  - Offline LLM extraction at two levels:
    - Document level: one-liner, summary, 5–20 thematic clusters, stored in a JSON master index.
    - Chunk level: parent clusters, entities, 3–10 answered questions, retrieval nuggets.
  - Stored as Qdrant payload for filtering, with Docling used for parsing.
  - Best F1: 44.4 with filtering, rewriting and contextual chunks; 32.9 for naive.
  - The authors' custom metadata reranker (F1 43.2) did not beat Cohere rerank (44.4).
- **MimirRAG:** reports 89.3% accuracy on FinanceBench using structure-preserving parsing, table-aware chunking, hybrid search and a multi-agent workflow. Its ablation credits metadata integration, table-aware chunking and the agentic workflow. — [arXiv 2605.25030](https://arxiv.org/html/2605.25030v1) [search snippet only; not read in full]

### Inferences
- **Fields to extract per regulatory document:**
  - `issuer` (RBI, SEBI, MCA, IRDAI…), `circular_no`, `doc_type` (master direction, circular, notification, FAQ)
  - `issue_date`, `effective_date`, `sunset/withdrawn_date`
  - `addressees`, `subject`
  - `amends[]`, `supersedes[]`, `repeals[]`, `refers_to[]` (lists of circular numbers or titles)
  - `sections_affected[]`, `language`
- **Extraction method:**
  1. Run regex on page 1 and the header block first. Circular numbers in these documents typically follow patterns like `RBI/20xx-yy/NNN`, `DOR.XXX.REC.No.NN/...`, `SEBI/HO/XXX/.../P/CIR/20xx/NNN`. Dates appear as "dated", "w.e.f.", "with effect from", "shall come into force".
  2. Run a local 7–8B instruct model with grammar- or JSON-schema-constrained decoding (vLLM guided decoding, Outlines) on the first page, the last page and any sentence matching `supersed|amend|in partial modification|repeal|withdrawn`.
  3. Validate: dates must parse, and referenced circular numbers must exist in the corpus.
- **Temporal retrieval:**
  - Store `valid_from` / `valid_to` on every chunk, propagated from the document plus the amendment graph.
  - Default filter: `valid_from ≤ as_of_date < valid_to`.
  - When a retrieved chunk's document has a successor, attach a "superseded by X on date" warning, or auto-retrieve the successor clause. This is a strong "zero-guessing" feature for a demo.
- Keep extracted metadata with provenance (page and bbox of the source string) so the UI can highlight *why* the system believes the circular was superseded.

### Gaps
- No published dataset or benchmark for extracting circular numbers, effective dates or amendment relations from Indian regulatory documents (RBI, SEBI) was found.
- No published accuracy for open-weight LLMs on such extraction.
- The regex patterns above are inferences, not verified against a corpus.

## 7. Finance and legal document QA benchmarks: key numbers

### Takeaway
**FinanceBench** is the canonical "naive RAG fails" result. GPT-4-Turbo with a shared vector store got only 19% correct, vs 79% with long context and 85% with oracle evidence. Strong 2026 pipelines claim about 89%. The legal analogue, **LegalBench-RAG**, shows very low Precision@1 (2–6%) even with good recall@64, so precise snippet retrieval in law remains unsolved. Page-level recall, not document recall, is the binding constraint.

### Cited Findings
- **FinanceBench** (Patronus AI, 2023) [verified this session] — [arXiv 2311.11944](https://arxiv.org/html/2311.11944)
  - 10,231 questions over filings from 40 public companies:
    - 25 domain-relevant
    - 1,323 novel-generated
    - 7,983 metrics-generated
  - The open sample has 150 cases.
  - Human-evaluated results on the 150 cases:

    | Model | Configuration | Correct | Incorrect | Refused |
    |---|---|---|---|---|
    | GPT-4-Turbo | Closed book | 9% | — | 88% |
    | GPT-4-Turbo | Single (per-document) vector store | 50% | 11% | 39% |
    | GPT-4-Turbo | Shared vector store | 19% | 13% | 68% |
    | GPT-4-Turbo | Long context | 79% | 17% | — |
    | GPT-4-Turbo | Oracle | 85% | — | — |
    | Claude 2 | Long context | 76% | — | — |
    | Llama 2 | Single vector store | 41% | 54% | — |
    | Llama 2 | Shared vector store | 19% | 70% | — |

  - Headline: GPT-4-Turbo with retrieval "incorrectly answered or refused to answer 81% of questions".
- **FinanceBench, later systems:**
  - Page recall@5 is 0.34 for BGE-M3 and 0.55 for a learned page scorer, with oracle-document page recall 0.60. — [arXiv 2602.17981](https://arxiv.org/html/2602.17981v1) [verified this session]
  - Metadata-driven RAG: RAGChecker F1 44.4 vs 32.9 naive. — [arXiv 2510.24402](https://arxiv.org/html/2510.24402v1) [verified this session]
  - MimirRAG claims 89.3% accuracy. — [arXiv 2605.25030](https://arxiv.org/html/2605.25030v1) [snippet only]
- **LegalBench-RAG** [verified this session] — [arXiv 2408.10343](https://arxiv.org/html/2408.10343v1)
  - 6,858 queries over 714 documents. Sub-datasets: ContractNLI, CUAD, MAUD, PrivacyQA.
  - Best overall: Precision@1 about 6.4%, Recall@64 about 62–76%.
  - Best subset: PrivacyQA, P@1 14.38, R@64 84.19. Worst: MAUD, P@1 2.65, R@64 28.28.
- **CUAD:** 510 commercial contracts, 41 clause categories, 13,000+ expert annotations (Atticus Project). — [Hendrycks et al., arXiv 2103.06268](https://arxiv.org/abs/2103.06268) [prior knowledge, not re-verified]
- **ContractNLI:** 607 NDAs × 17 hypotheses, labelled entail, contradict or not-mentioned, with evidence-span identification. — [Koreeda and Manning, arXiv 2110.01799](https://arxiv.org/abs/2110.01799) [prior knowledge, not re-verified]
- **DocVQA:** about 50k questions on 12k+ document images, scored with ANLS. — [Mathew et al., arXiv 2007.00398](https://arxiv.org/abs/2007.00398) [prior knowledge, not re-verified]
- **FinQA:** about 8.3k numerical-reasoning QA pairs over earnings-report text and tables. Original FinQANet execution accuracy was about 61% vs about 91% for human experts. — [Chen et al., arXiv 2109.00122](https://arxiv.org/abs/2109.00122) [prior knowledge, not re-verified]
- **TAT-QA:** about 16.5k questions over 2,757 table + text contexts from 182 financial reports. Baseline TagOp scored about 50 EM / 58 F1 vs humans about 84 EM / 91 F1. — [Zhu et al., arXiv 2105.07624](https://arxiv.org/abs/2105.07624) [prior knowledge, not re-verified]

### Inferences
- **Suggested evaluation for the hackathon:**
  - Build a 40–60 question gold set from the actual corpus, each labelled with (doc, page, bbox or quote). Include about 30% Hindi or cross-lingual questions, about 20% multi-page or table questions, and about 10% unanswerable questions to test abstention.
  - Report document recall@k, **page recall@5/10**, MRR, answer exact or numeric match, citation precision (does the cited span support the claim?), and abstention accuracy.
  - FinanceBench's open 150 questions are a ready public sanity check for the finance side.
- **36-hour priority order by expected gain per hour:**
  1. Docling parse with page and bbox provenance, plus table-as-unit chunks.
  2. Hybrid BM25 + bge-m3 with RRF.
  3. bge-reranker-v2-m3 or Qwen3-Reranker on the top 50–150.
  4. Contextual chunk prefixes generated by a local LLM.
  5. Metadata filters (issuer, date, validity) and a supersession warning.
  6. HyDE or decomposition for multi-part queries.
  7. Abstain when the top reranker score is below a threshold.
  8. Optional: ColQwen page retrieval for scanned or chart pages.
- The FinanceBench gap between shared vector store (19%) and per-document vector store (50%) argues strongly for **filtering to the right document(s) first** (via metadata or document routing), then retrieving within them.

### Gaps
- No current (2026) public leaderboard for FinanceBench using only open-weight models was found. MimirRAG's 89.3% model mix was not verified.
- CUAD, ContractNLI, DocVQA, FinQA and TAT-QA figures are from memory of the original abstracts and were not re-opened in this session. Current state-of-the-art numbers were not collected.
