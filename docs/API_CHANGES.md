# API changes for the UI (backend final pass, 24 Nov 2026)

Everything here is **additive**: no field was removed or renamed, and `outcome` keeps its four values
(`ANSWER | PARTIAL | ABSTAIN | CONFLICT`). Older UI code keeps working; new fields can be wired in one by one.

## 1. `POST /ask`: new fields on every result

| Field | Type | What to show |
|---|---|---|
| `query_class` | string | One calm, specific card per class. `compliance_question` (normal answer) · `task_request` (poem, story, guarantee, prediction: refused before any model call) · `meta_instruction` (the message only tried to change how the assistant works) · `out_of_domain` (retrieval / off-topic gate) · `profile_mismatch` (e.g. a commercial bank asking about the UCB directions: answered "does not apply", cited) · `bad_input` (e.g. a 0-month EMI) · `missing_facts` (NEEDS_INFO, see `needs`) · `false_premise` / `number_trap` (see `premise_check`) · `general_question` (a non-banking collection, see §4) |
| `notices[]` | `{kind, text, matched[]}` | Show above the answer. Today one kind: `instruction_ignored` → text *"Your message contained an instruction to change how I work; I ignored it."* `matched` lists the phrases that were removed. The rest of the question is still answered. |
| `flagged_sources[]` | `{doc_id, title, chunk_id, clause, page, quote, matched, hidden_text, reason, bboxes}` | Sentences in the documents that address an AI or give it commands. They were **not used** as evidence and never sent to the model. Demo line: *"1 passage in Gold Loan FAQ p.1 looked like an instruction to the AI and was not used"* (it is white-on-white hidden text, `hidden_text: true`, so `bboxes` is empty). |
| `premise_check[]` | `{premise, verdict, text, citation}` | Put the first `contradicted` / `not_found` item as the **first line** of the answer card. `verdict` ∈ `contradicted` (an applicable in-force rule finding says otherwise; `citation` has the rule's quote) · `not_found` (the figure the question assumes is not in the evidence of the source it names; `citation` is the closest passage or null) · `supported`. Code only, no model call. Only claims about what a document or RBI says are checked, not case facts. |
| `needs[]` | `{key, label, question, input, options[], subjects[]}` | Case facts the answer depends on (a rule could decide the case, but applicability is UNKNOWN). `key` is a `slots` key: `sanction_date` (input `date`), `amount_inr` (`number`), `borrower` / `rate_type` / `purpose` / `facility` (`choice`, see `options`). |
| `needs_info` | bool | **NEEDS_INFO**: true when `needs` is non-empty and the outcome is `PARTIAL` or `ABSTAIN`. Show fill-in chips from `needs`, then re-ask the same question with `slots: {key: value, ...}`. `plan.case_from_slots` lists the keys the user filled. |
| `confidence` | `{level, draft_pass_rate, cut, passed, drafted, note}` or null | `level: "low"` when fewer than 1 in 3 drafted sentences survived verification (`cut` 0.34). Such an `ANSWER` is returned as `PARTIAL`. Show `note`, e.g. *"low confidence: only 1 of 4 drafted sentences could be proven"*. Null on gated/abstained answers. |
| `lang`, `translation` | see §5 | Hindi. |
| `sentences[].support_from_lead_in` | bool | The sentence leans on the clause lead-in (e.g. "for loans sanctioned on or after 1 January 2026 …"). Show the citation's `context` next to the quote. |
| `sentences[].citations[].lead_in_used` | bool | Same, per citation. |
| `sentences[].citations[].ocr` / `.uploaded` | bool (only when true) | Quote comes from OCR text ("OCR text, check the page image") / from an uploaded document. |
| `sentences[].type` | string | New code-sentence types besides `fact/chain/conflict/calc/scope`: `status` (put first when the question names an instrument that is no longer in force, e.g. "Under RBI's May 2014 circular…": *"… is no longer in force: it was withdrawn/repealed by … with effect from …"*). |
| `blocked[].reason` | string | New reason: *talks about the assistant or its internals ("as an AI"), not the documents* (output guard). |

`slots` (request) are now cleaned: unknown keys are ignored, `amount_inr` accepts `"40,00,000"` or a number.

## 2. `POST /ask/stream` (new): server-sent events

Same request body as `/ask`. Response `text/event-stream`. Events, in order:

| Event | Data | Notes |
|---|---|---|
| `stage` | `{stage, label, ...}` | `understanding` → `searching` (`sub_queries`) → `evidence` (`n`, `flagged`) → `rules` (`n`) → `drafting` → `verifying` (`n` drafted sentences) → optional `repair` |
| `verdict` | `{n, of, verdict, core}` | One per drafted sentence, **verdict only, no text** ("checking sentence 2 of 4 … verified / withheld"). A retry produces a second series. |
| `sentence` | `{n, of, sentence}` | Only after **all** verdicts are final: each shown sentence, same object as `result.sentences[i]`. |
| `withheld` | `{n, reasons[]}` | Count of blocked sentences for the Withheld (n) tray. |
| `translation` | `{lang, label, sentences[]}` | Hindi only (§3), after the English sentences. |
| `result_ready` | `{outcome, query_class}` | |
| `result` | full `/ask` JSON | Use this as the source of truth. |
| `error` | `{status, message}` | 429 budget cap, 503 replay miss, 500 other. |
| `done` | `{}` | Stream end. |

Gated questions (task gate, instruction gate, off-topic) emit only `stage`, `result_ready`, `result`, `done`.
Unverified text is never streamed.

## 3. Uploads (new)

| Endpoint | What |
|---|---|
| `POST /documents` (multipart) | Fields: `file` (PDF, ≤ 40 pages, ≤ 20 MB), `doc_kind` ∈ `rbi_circular`, `bank_policy`, `loan_agreement`, `kfs_or_sanction` (collection `banking`) or `other` (collection `general`, general mode), optional `title`, `effective_date` (YYYY-MM-DD; otherwise read from the text: "with effect from …", "dated …"). Returns **202** with the job status (below). The same file again → `status: "duplicate"` with the existing `doc_id` (nothing re-ingested). Errors: 415 not a PDF, 413 too big / too many pages, 400 bad `doc_kind` or date, 403 uploads switched off (`UPLOADS_ENABLED=0`). |
| `GET /documents/{id}/status` | `{doc_id, filename, doc_kind, collection, stage, status, progress (0–1), stages[{stage, done}], counts, warnings[], report, error}`. `stage`: `saved → parsing → ocr (only for scanned pages) → redacting → extracting → indexing → linking → scanning → ready`, or `failed` (`error` says why; nothing is left half-written). `status`: `running · ready · failed · duplicate`. Poll every ~1 s; ingest takes ~10–60 s. |
| `counts` | `pages, chunks, ocr_pages, redacted` (personal identifiers replaced **before** any text went to the model) `, redacted_by_type, value_tuples` (banking) `/ terms` (general) `, prefixes, extraction_cost_usd, indexed_chunks, links, conflicts, impact_items`. |
| `warnings[]` | e.g. *"2 page(s) had no text layer and were read by OCR …"*, *"model extraction skipped (CacheMiss) …"* (replay mode / budget: the document is still searchable). |
| `report` | `{title, effective_date, collection, links[{type: REFERS_TO / WITHDRAWS / AMENDED_BY, target, by, quote, page, effective_date}], conflicts[{verdict, subject, a, b}], impact{report_id, items, conflicts} (rbi_circular only), as_of}`. `conflicts[].a/b` have the same shape as `/conflicts` items (quote, clause, page, `bboxes`), RBI-vs-upload conflicts first. For an `rbi_circular` the full impact report is at `GET /impact/{report_id}`. |
| `GET /documents?source=upload` | "My uploads": `[{doc_id, title, doc_kind, collection, source, effective_date, n_pages, ingested_at, ocr_pages[], status, stage}]` (also failed / running jobs). `GET /documents` (no params) is unchanged: the shipped corpus only. Also `?source=demo&collection=insurance`, `?source=all`. Every row now has `source`, `collection`, `doc_kind`. |
| `DELETE /documents/{id}?actor=…` | Uploads only (corpus and demo sets → 403; running job → 409). Removes chunks, tuples, edges, index rows and the file, undoes any validity change the upload made, writes an `upload_deleted` audit row. Returns `{deleted, removed{chunks, value_tuples, provision_versions, edges}, validity_restored}`. |

**Asking about an upload:** uploads are never searched unless named, so the shipped demo answers do not change.
`POST /ask` (and `/ask/stream`) take `upload_ids: ["UP-…"]` (searched together with the collection's corpus) and
`collection` (default `banking`). The result echoes `collection` and `upload_ids`. Unknown id or wrong collection → 400.
Citations from an upload carry `uploaded: true`; from OCR pages `ocr: true`. Everything else (quotes, bboxes via
`/documents/{id}/pdf` and `/pages`, verification, withheld tray, conflicts) works the same.
`GET /conflicts` also takes `upload_ids=UP-a,UP-b` and `collection`.

Audit: every ingest stage is an `upload` row in the hash chain; deletion is `upload_deleted`.

## 4. General mode (beyond banking) and the insurance demo set

- `collection: "insurance"` searches the pre-loaded **fictional** insurance set: `INS-POLICY` (Suraksha Health policy
  wording, 1 Apr 2025: pre-existing-disease waiting period 48 months), `INS-ENDORSE-1` (Endorsement No. 1, w.e.f.
  1 Apr 2026: clause 4.2 substituted, 36 months), `INS-FAQ` (claim FAQ, 1 May 2026: says 24 months).
- `collection: "general"` searches only the `other` uploads named in `upload_ids`.
- In general mode there are no banking rules, profiles or rule findings (`rules` has only document-status rows;
  `bank_profile` is ignored); `query_class` is `general_question`. Retrieve → draft → verify → withhold → audit are the
  same.
- Amendment chain: the endorsement ends clause 4.2's validity on 1 Apr 2026 (`GET /provisions/INS-POLICY:4.2/timeline`
  shows `valid_to` and the `AMENDED_BY` edge with the endorsement's sentence). As of 2026-02-01 the answer is 48 months;
  as of today 36 months.
- Contradictions: `GET /conflicts?collection=insurance&as_of=2026-11-24` → `CONFLICT` endorsement 36 vs FAQ 24 (both
  quotes, bboxes), `SUPERSESSION` policy 48 vs the others. Items have `a/b.term, value, unit, valid_from, valid_to,
  in_force`. General mode uses verdicts `CONFLICT | SUPERSESSION | CONSISTENT` (it does not judge conditions).
- UI suggestion from the plan: a domain switch "Banking (RBI) · Insurance · Upload your own".

## 5. Hindi answers

- `lang` on the result: `hi` when the question is in Hindi (Devanagari) or romanised Hindi (Hinglish, detected by the
  planner and by a code check), or when the request sends `lang: "hi"`; else `en`.
- When `lang == "hi"`: `translation = {lang, label, checked_by, model, sentences[{n, text, text_hi, check}], passed,
  error, abstain_text?}` and each `sentences[i].text_hi` (null when the check failed). `label` is
  *"हिंदी अनुवाद · machine translation of the verified answer"*. Only the **verified English sentences** are
  translated (one nano call); quotes stay in English (the RBI text is English).
- Code check: every number, date, ₹ amount, percentage and clause id in the Hindi must match the English
  (`check: "ok"` or `"mismatch: missing [...] extra [...]"`); on a mismatch that sentence is shown in English only.
- Abstentions in Hindi: no model call; `translation.abstain_text` is a fixed bilingual line.
- `/ask/stream` sends a `translation` event after the English sentences.
- The proof is always the English sentence + its quote; show the Hindi beside it with the label.

## 6. Added after the freeze: verified summaries, follow-ups, small talk

| Addition | Request | Result |
|---|---|---|
| **Verified summary** (`query_class: "summary_request"`) | Detected in code (EN, Hindi, Hinglish): "summarise / summary / key points / overview / what is this document about / TL;DR / सारांश / saaransh". Target: the chosen `slots: {"doc_id": …}`, else the single `upload_ids` entry, else a document named in the question, else the only document in scope. | `summary: true`, `summary_of: [{doc_id, title}]`, `coverage: "6 key points from 5 sections; 0 withheld"`, the usual `sentences` (one key point each, every one verified), `blocked`, `faithfulness`, `confidence`. Outcome `ANSWER` (≥ 3 points, few withheld) / `PARTIAL` / `ABSTAIN` (nothing proven). Hindi translation applies. |
| Summary target unclear | e.g. "hey tell me what is the summary of this" with several documents in scope | NEEDS_INFO: `needs_info: true`, `needs: [{key: "doc_id", label: "Document", question, input: "choice", options: [doc ids], option_labels: [titles]}]`. Re-ask the same question with `slots: {"doc_id": "<chosen>"}` (or `upload_ids: [one id]`). No model call. |
| **Follow-ups** (`followup`) | `history: [{question, answer_summary?, query_id?}]` (last 1–3 turns) **or** `previous_query_id` (an answer from this server). | When the new question is elliptical ("what about Tier 4?", "and on 15 Oct 2025?", "uske liye?", "same for MSE?"), one nano call rewrites it into a standalone question; then the normal pipeline answers it. `followup: {resolved_question, original_question, from_query_id, bank_profile?, as_of?}`; **show `resolved_question`** so the user sees what was answered. A tier / "commercial bank" named in the follow-up switches `bank_profile`; a date in a short "and on <date>?" moves `as_of` (the result's `bank_profile` / `as_of` show the values used: update the profile switch and as-of banner). Full questions skip the rewrite (no cost); `followup` is null. The previous answer text is never used as evidence. |
| **Small talk** (`query_class: "smalltalk"`) | "hi", "hello", "help", "what can you do", "namaste", "नमस्ते" … (the whole message) | `outcome: "ABSTAIN"`, `help: {text, examples[]}`: a fixed reply plus 3–4 example questions for the active collection or upload (all recorded). No model call. |

All new fields are present on every result (`summary` false, `help` and `followup` null when not used).
`/ask/stream` accepts the same `history` / `previous_query_id`.
