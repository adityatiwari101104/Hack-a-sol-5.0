# Proof-or-Silence: zero-guessing document AI for a co-operative bank (Hackasol 5.0 · AIML-02)

A backend that answers compliance questions across RBI circulars, Master Directions and a bank's own loan
documents **only with verified evidence**. It works out which version of a rule applied on a given date, flags
contradictions between the bank's documents and RBI rules, and says *"I don't have proof"* instead of guessing.

> **Core principle:** OpenAI only drafts and extracts. Our code decides what the user sees.

Persona: the compliance officer of *Example Urban Co-operative Bank Ltd.*, a **fictional** Tier 3 UCB. All bank
documents in `corpus/synthetic/` are fictional and are watermarked as such. RBI documents are © Reserve Bank of
India. They are not committed; `corpus/MANIFEST.csv` lists their URLs and checksums.

Status: the backend pipeline is complete and tested. There is no UI yet (by request).

## What is distinctive

The individual pieces already exist elsewhere (citations, PDF highlighting, abstention, a faithfulness score,
hybrid search; see the research report). What is distinctive here:

1. **Date-aware verification.** A cited quote must be *in force on the as-of date*, not merely present in the PDF.
   The version chain is rebuilt from RBI's own footnotes ("Substituted vide … for 'shall' (w.e.f. October 1, 2025)"),
   repeal annexes and withdrawal circulars. Every graph edge carries a verbatim, located quote.
2. **Code-side applicability.** The user's loan facts (tier, borrower, purpose, amount, sanction date) are compared
   with each rule's conditions in code. Examples: "₹40 lakh ≤ ₹50 lakh", "sanctioned 2026-03-15 ≥ 2026-01-01".
   The code also detects gaps, e.g. no paragraph covers a loan sanctioned on **31 Dec 2025**.
3. **Contradiction triage.** Each pair of rules is classified as a *conflict*, an *amendment (supersession)*, a
   *different condition* or *consistent*. Typed value tuples are compared in code, not by asking the LLM.
4. **Impact alert.** Given a circular and a bank profile, the system lists which of the bank's own clauses now
   conflict. It produces a draft fix marked "needs human approval", maker-checker review, and a hash-chained audit log.

## Architecture (backend/app)

```
PDF ─ ingest.py (pdfplumber words+bboxes; clause tree 261(2)(ii) with inherited lead-in; footnotes;
      │          cross-page table stitching; hidden-text flag; RBI 'Withdrawn' stamp + header/footer removal)
      ├ extract.py  glossary · footnote amendment versions · repeal/withdrawal edges · REFERS_TO ·
      │             value tuples (gpt-5.4-nano, quote-checked) + second-opinion audit (gpt-5.4-mini)
      └ pipeline.py → SQLite: documents, chunks, provision_versions (valid_from/valid_to), edges, value_tuples
question ─ service.ask:
  understand (nano: sub-queries, subjects, case facts, Hindi→English)
  → retrieve.py hybrid BM25 + bge-small dense, RRF; sentence-level evidence; REFERS_TO + withdrawal expansion
  → status_at(as_of) per version (computed, never stored) · applicability.py (code) · rule findings R1..Rn
  → draft (gpt-5.4-mini, Structured Outputs; cites E/R ids only; never computes; PII redacted first)
  → calc.py (Decimal EMI / APR-IRR / interest / charge) → verify.py per sentence:
      (a) ids (b) status in force (c) quote located on page (d) every number/date in evidence|question|calc
      (e) coverage ≥0.8 with matching negation | HHEM-2.1 ≥0.5 | code rule | code calc  (f) conflict triage
  → one repair round if the core claim was blocked → gates → ANSWER | PARTIAL | ABSTAIN | CONFLICT
  → audit.py hash-chained trace (egress manifest, redaction-map hash)
impact.py · contradict.py · privacy.py · api.py (FastAPI)
```

## Run it

```bash
python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
# put the RBI PDFs in ~/Downloads (links in corpus/sources.csv), then:
.venv/bin/python corpus/tools/build_manifest.py ~/Downloads
cd backend && ../.venv/bin/python -m app.pipeline --reset      # ingest (~2 min; ≈$0.25 first time, cached after)
../.venv/bin/uvicorn app.api:app --reload                      # http://127.0.0.1:8000/docs
```

The LLM key is read from `LLM_KEY_FILE` (default `~/Janmitra/.env`). Every call is cached in `eval/cassettes/`.
`LLM_MODE=replay` runs entirely from cache, and `SPEND_CAP_USD` (default $3.50) hard-stops spending.
`LLM_BASE_URL` switches to any OpenAI-compatible endpoint, for example an open-weight model.

Main endpoints:
- `POST /ask` `{question, as_of, bank_profile}`
- `POST /impact` `{doc_id, bank_profile}`
- `GET /conflicts`
- `GET /provisions/{chunk_id}/timeline`
- `GET /review-queue`
- `POST /review/{id}` (maker-checker)
- `GET /trace/verify-chain`
- `POST /incidents`
- `GET /obligations` (obligation register)
- `GET /health`

## Tests and evaluation (numbers measured on 2026-11-23)

```bash
make test     # 14 unit + API tests   (see Makefile for setup / ingest / serve / gate / eval)
cd .. && LLM_MODE=replay .venv/bin/python -m pytest -q eval/test_gate.py   # 13 canaries, $0
.venv/bin/python eval/run_eval.py dev|test|canary [--baseline]
```

The gold set is 80 hand-written questions (`eval/build_gold.py`): 50 dev and 30 held-out test, stratified across
11 types. The original 21 test items kept their split when the set grew. Labels follow the Stanford legal-RAG
study. A citation counts as fabricated if its quote is not found on the cited page by a deterministic check.

| Run | n | Accurate | Incomplete | Hallucinated | Fabricated quotes | Abstain P / R | Over-refusal |
|---|---|---|---|---|---|---|---|
| Ours, dev (tuned on; final, with MiniCheck + Presidio) | 50 | 43 (86%, CI 74–93%) | 7 | **0** | **0 / 114** | 0.60 / 0.67 | 8% |
| **Ours, test (held out)** | 30 | **25 (83%, CI 66–93%)** | 5 | **0** | **0 / 70** | 0.50 / 0.60 | 13% |
| Plain RAG baseline, test | 30 | 17 (57%, CI 39–73%) | 10 | 3 | **2 / 51** | – / 0.00 | 0% |

On the held-out test set:
- point-in-time accuracy 1.0
- contradiction recall 1.0
- different-condition false positives 0
- calculation accuracy 0.67

The impact alert's Tier 3 → Tier 4 switch is correct. All 5 test misses are *Incomplete* (three table questions
abstained, one calculation, one false-premise answer missing the key word); there are no wrong answers. The baseline's
2 fabricated quotes are real. One of its 3 "hallucinated" labels is a grader artifact (it matched "who **won**").

The test split was run twice in total: once with 21 items, then once after the declared fixes and the gold-set
expansion. Both runs are logged in `eval/reports/eval_runs.csv`. Latency is about 4.8 s at p50 and 8.1 s at p95.
Cost is under $0.006 per question (upper-bound pricing). Total project spend so far is $1.83 of the $4 budget. The test numbers above are from
the second (final) test run. The later changes — refusal-only answers count as ABSTAIN, MiniCheck second opinion,
code-side calculations from question inputs, Presidio redaction — were measured on dev only (calculation accuracy on
dev 1.0), to keep the test split honest.

## Known limitations (honest list)

- **Over-refusal on tables and calculations.** This is the main gap; see the test-set misses in `eval/reports/test.md`.
- **Entailment checking.** HHEM-2.1 (English, 0.1B) produces false negatives on legal phrasing, so the verifier also
  asks MiniCheck-DeBERTa-v3-Large (second opinion) and a deterministic coverage check. Both models still miss some
  concessive sentences ("Although no upper limit … has been prescribed").
- **Value tuples** are LLM-extracted (nano) and then audited (mini), which corrected 31 of 99. Some noise remains.
  Rules limited to a special situation or product (microfinance, deposits) are filtered by code.
- **Bank documents' loan scope** (borrower, amount, sanction date) comes from `corpus/synthetic/scope.json`, which
  stands in for core-banking data.
- **Withdrawals.** The mapping of withdrawn circulars to Master Directions comes from RBI's "Circulars Withdrawn" list
  and is curated in `corpus/registry.json`. Each claim is quote-verified in the withdrawal circular.
- **Hindi** is supported by translating the question to English (one dev item passes). Hindi source documents are
  not ingested. Embeddings use `bge-small-en`; `bge-m3` is a config switch.
- **Deviations from the plan:**
  - No Docling; pdfplumber only.
  - Reranker implemented but off: on dev it found the gold paragraph 28/32 times with or without it
    (`eval/retrieval_ab.py`), so it only added latency. `RERANK=1` turns it on.
  - Modules are grouped into fewer files than the plan's layout.

## Models and credits

| Component | What | Licence |
|---|---|---|
| OpenAI `gpt-5.4-mini-2026-03-17`, `gpt-5.4-nano-2026-03-17` | drafting, extraction, tuple audit (organizer-approved) | API |
| `vectara/hallucination_evaluation_model` (HHEM-2.1-Open) | entailment check | Apache-2.0 |
| `BAAI/bge-small-en-v1.5` | embeddings | MIT |
| `lytang/MiniCheck-DeBERTa-v3-Large` | second-opinion entailment | see model card |
| Microsoft Presidio + spaCy `en_core_web_sm` | PII redaction (+ our IFSC/account recognizers) | MIT |
| pdfplumber, pypdf, bm25s, rapidfuzz, sentence-transformers, FastAPI | parsing, retrieval, matching, API | MIT / BSD / Apache-2.0 |
| Ideas adapted (no code copied) | ClauseTrace (MIT) checker/impact patterns; ALCE citation metrics; LongCite sentence-ID citations; CRAG retrieval gate; Stanford legal-RAG labels | — |

Research and plan: `reports/`, `plans/AIML-02 build plan.md`, `research_notes/`. Spend ledger: `eval/spend_ledger.json`.
