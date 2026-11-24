# Proof-or-Silence: 3-minute talk track

Deck: `Proof-or-Silence-pitch.pptx` (8 slides; the same text is in each slide's speaker notes). Backup for judge Q&A: `Proof-or-Silence-appendix.pptx` (8 slides, not presented).
Live demo wordings, dates and fallbacks: `docs/DEMO_SCRIPT.md`. **A** narrates and **B** drives the app (replay mode, $0).

| Time | Slide | Who | Say (short form) |
|---|---|---|---|
| 0:00–0:15 | 1 Hook | A | "A bank can't act on an answer it can't prove. Proof-or-Silence answers only with proof, or it stays silent: five code checks, a quote, page and date on every sentence, and a Withheld tray for what fails." |
| 0:15–0:40 | 2 Problem | A | RBI penal-charges circular RBI/2023-24/53 was withdrawn on 28-Nov-2025, but the PDF still exists. Plain RAG (the same model, no checks) said "Yes, the current rule to cite"; ours said no. Stanford measured 17–33%; loans are the top Ombudsman ground; 18% keep audit logs. |
| 0:40–1:00 | 3 Product | A | Walk callouts 1–4: chip with in-force pip, five checks, proof meter (honest faithfulness), PDF highlight. **Switch to the app.** |
| 1:00–1:50 | 4 Live demo | B drives | (1) EMI-reset question at **2025-09-15**, then **2025-10-15**: "shall" becomes "may, at its option". (2) Clause 9.3 conflict, both quotes side by side. (3) Upload `corpus/demo/upload/EUCB-circular-2026-07.pdf` as *Bank policy*; the report flags RBI 261(1). (4) "Summarise this document", then the Hindi summary. If the app fails: stay on slide 4 and narrate the tiles. |
| 1:50–2:15 | 5 How it works | A | "The model only drafts; code decides." Plain RAG has no check between writing and showing. Ours: parse, search, rules in code, redact, draft, then five checks per sentence. Pass is shown, fail is withheld. Only the dashed box calls OpenAI (organizer-approved). |
| 2:15–2:35 | 6 Results | A | 85% vs 50% on the same 34 fresh questions; 22/22 vs 10/22 red-team; 2.8% vs 10.6% unsupported sentences. 89.5% on 114 questions, 0 hallucinated, 0 of 375 quotes fabricated. "Where we lose: 12 incomplete. We trade a guess for a gap." |
| 2:35–2:50 | 7 Different + practical | A | No one we surveyed does all four together. About ₹0.38 an answer, PII redacted first, an on-prem path, open source everywhere else. |
| 2:50–3:00 | 8 Close | A | "Proof, or silence." Plan: shadow, then assist, then own it. Ask: one co-op bank compliance desk for a shadow pilot. |

## How this maps to `docs/DEMO_SCRIPT.md`
The 3½-minute demo script is the long version. This track keeps its rows 0:15 (proven answer, shown as a screenshot on slide 3), 0:55 (as-of switch), 1:20 (upload), the conflict card, the Hindi summary and the closing numbers. It cuts impact and maker-checker, refusals, trick questions, insurance and audit for time; each of those has a screen in appendix A8 or a row in `DEMO_SCRIPT.md` if a judge asks.

## Words to use and avoid
- Say "no unverified sentence is shown". Never say "100% faithful" or "zero hallucination".
- Say "aligned with RBI FREE-AI", not "compliant".
- Say "the organizer allowed OpenAI for drafting; every other model is open source".
- Don't type new questions live: a live answer takes 7–15 s and costs money. Use the recorded chips.
- Never claim "real-time".

## Likely judge questions → appendix slide
| Question | Slide |
|---|---|
| How did you measure? Which grader? | A1 |
| Why three checkers? Does each check matter? | A2 |
| What exactly blocks a sentence? | A3 |
| How do you know which version applies? | A4 |
| What data leaves the bank? Which models? Can it run on-prem? | A5 |
| What does it cost? Is it fast enough? | A6 |
| What doesn't work yet? | A7 |
| Can it refuse? Calculate? Work beyond banking? Audit? | A8 |
| Sentence 1 on slide 3 shows "AI judge (3rd tier) 0.05": what is that? | The judge rescued the sentence by quoting a span that code found verbatim; that score is not a confidence. See A2–A3. |
