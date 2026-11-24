# Privacy and data protection ("DPDP-ready by design", not "DPDP-compliant")

**Documents stay on the bank's machine. Only redacted snippets go to the language model, and that path can be
switched to an on-premises model.** This is the honest version: with the default OpenAI setting, redacted evidence
sentences and the redacted question *do* leave the machine.

## What leaves the machine, per call

| Call (model) | What is sent | Redaction before sending |
|---|---|---|
| Query plan (nano) | The question, with any instruction to the assistant removed | PAN, Aadhaar, phone, e-mail, IFSC, account numbers → `<Q_IN_PAN_1>` … (structured identifiers only: the name detector misfires on question text) |
| Draft (mini) | The question + up to 18 evidence sentences + code rule findings | Full Presidio pass over the evidence (names too) + the always-on PAN/Aadhaar regex |
| AI judge (nano, ≤ 3 per answer) | One drafted sentence + its cited evidence | Same as the draft |
| Hindi translation (nano) | The verified English sentences only | They were built from redacted text and re-hydrated locally; quotes are not sent |
| Upload extraction (nano / mini) | Clause text of an uploaded PDF, for value/term extraction and search prefixes | **Full Presidio pass on every chunk before any call** (Phase U); the stored text stays original and local |

Everything else never calls a model: parsing, OCR (Tesseract, local), embeddings and search (bge-small, local),
entailment (HHEM-2.1 and MiniCheck, local), version and as-of resolution, applicability, contradiction triage,
arithmetic, the Hindi number check and the audit chain.

## Controls

1. **Redact first** (`backend/app/privacy.py`). Microsoft Presidio with its Indian recognisers (PAN, Aadhaar, voter
   ID, passport, GSTIN), plus our IFSC and account-number recognisers, plus an always-on PAN/Aadhaar regex (the
   red-team found one PAN that Presidio scored too low; it is now caught). Placeholders are re-hydrated locally. Only
   a hash of the redaction map is logged.
2. **Uploads are redacted before extraction.** `POST /documents` runs redaction on every chunk before the extraction
   and prefix calls. The upload status shows how many identifiers were replaced (`counts.redacted`, by type).
3. **Minimum necessary.** Each call sends only the evidence sentences for that question. The audit row's
   `egress_manifest_json` lists every chunk id and size that left the machine.
4. **Instructions in documents are not obeyed or forwarded.** Sentences that address an AI (including hidden
   white-on-white text) are excluded from the evidence and listed to the user as `flagged_sources`.
5. **Provider controls.** OpenAI API data is not used for training by default; requests use `store=false`.
   Zero-data-retention and India data residency need OpenAI's approval and configuration; check OpenAI's current
   data-controls page before claiming either.
6. **On-premises path.** `LLM_BASE_URL` points the same code at any OpenAI-compatible server (e.g. vLLM or Ollama
   serving an open-weight model inside the bank). Set `LLM_MODEL_DRAFT` / `LLM_MODEL_EXTRACT` to its model names.
   Then nothing leaves the bank. We did not measure answer quality on an open-weight model.
7. **Demo with no network.** `LLM_MODE=replay` answers recorded questions from `eval/cassettes/` only.
8. **Audit-ready.** The question is stored redacted (full Presidio) in a hash-chained trace log
   (`GET /trace/verify-chain` detects any edit); uploads and deletions are logged; human sign-off on conflicts
   (maker ≠ checker is enforced).

DPDP Rules were notified on 13 Nov 2025 with most duties from May 2027. The bank is the data fiduciary and the LLM
provider a processor that needs a contract. The demo uses fictional borrowers and fictional bank and insurance
documents only.
