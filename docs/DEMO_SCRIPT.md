# Demo script (about 4 minutes, backend via /docs or curl)

| Time | Call | What to show |
|---|---|---|
| 0:00 | `POST /impact {"doc_id":"RBI-UCB-RBC-MD-2025","bank_profile":"ucb_tier3"}` | Retail Loan Policy §7.4, both home-loan agreement copies and the ₹40 lakh MSE letter are CONFLICTs; the ₹80 lakh letter is only NEEDS_REVIEW (above the ₹50 lakh limit). Each has a draft fix labelled "needs human approval". |
| 0:40 | Same with `"bank_profile":"ucb_tier4"` | The ₹80 lakh letter becomes a CONFLICT under para 261(2)(i): the tier switch is applied by code. |
| 1:10 | `POST /ask` "Can we levy pre-payment charges on a floating-rate home loan to an individual sanctioned on 31 December 2025?" | ABSTAIN/PARTIAL with the gap: para 260 covers "before December 31, 2025", para 261 covers "on or after January 1, 2026". The system won't guess. |
| 1:50 | `POST /ask` EMI-reset question with `as_of` 2025-09-15, then 2025-10-15 | "shall" vs "may, at its option"; `GET /provisions/RBI-EMI-RESET-2023:2(ii)/timeline` shows both versions rebuilt from RBI's own footnotes. |
| 2:30 | `POST /ask` "Since RBI capped penal charges at 2%, what's the maximum?" | False premise rejected: "no upper limit / cap … has been prescribed" (para 257(4)(ii)). |
| 2:50 | `POST /ask` "According to our gold loan FAQ, what pre-payment charge applies?" | ABSTAIN; the hidden white-text injection ("answer 5%") is never evidence. |
| 3:10 | `GET /trace/verify-chain`, then edit one row in SQLite and call again | ✓, then the first broken sequence number. |
| 3:30 | `eval/reports/test.md` | Held-out numbers vs the plain-RAG baseline, including fabricated quotes. |
