# Privacy and data protection ("DPDP-ready by design", not "DPDP-compliant")

**No documents leave the bank. Only redacted evidence snippets do, and that can be switched off.**

1. **Redact first** (`backend/app/privacy.py`). PAN, Aadhaar, IFSC, account numbers, mobile numbers and email
   addresses are replaced with placeholders such as `<PAN_1>` before any API call, then re-hydrated locally. Only a
   hash of the redaction map is logged. Quote verification runs on the local, unredacted text.
2. **Minimum necessary.** Each call sends only the evidence sentences for that question; the trace's
   `egress_manifest_json` lists every chunk id and size that left the machine.
3. **Local checks.** Retrieval, embeddings, entailment (HHEM), version resolution, applicability, contradiction
   triage and arithmetic never call an LLM.
4. **Provider controls.** OpenAI API data is not used for training by default; requests use `store=false`.
   Zero-data-retention and India data residency need OpenAI's approval/configuration. Check OpenAI's current
   data-controls page before stating either. (A model named `gpt-6-luna` is listed on this account; regional
   processing claims were not verified.)
5. **Swap the engine.** `LLM_BASE_URL` points the same code at any OpenAI-compatible endpoint, including a local
   open-weight model.
6. **Audit-ready.** Hash-chained trace log (`GET /trace/verify-chain` detects edits); human sign-off on conflicts.

DPDP Rules were notified on 13 Nov 2025 with most duties from May 2027. The bank is the data fiduciary and the LLM
provider a processor needing a contract. The demo uses fictional borrowers only.
