# DocuHelp: 3-minute talk track

Deck: `DocuHelp-pitch.pptx` (9 slides; the same text is in each slide's speaker notes). Backup for judge Q&A: `DocuHelp-appendix.pptx` (9 slides, not presented).
Live demo wordings, dates and fallbacks: `docs/DEMO_SCRIPT.md`. **A** narrates and **B** drives the app (replay mode).

| Time | Slide | Who | Say (short form) |
|---|---|---|---|
| 0:00–0:15 | 1 Hook | A | "A bank can't act on an answer it can't prove. DocuHelp answers only with proof, or it stays silent." |
| 0:15–0:40 | 2 Problem | A | RBI penal-charges circular RBI/2023-24/53 was withdrawn on 28-Nov-2025, but the PDF still exists. Plain RAG said "Yes, the current rule to cite"; ours said no. Stanford measured 17–33%; loans are the top Ombudsman ground; 18% keep audit logs. |
| 0:40–1:00 | 3 Product | A | Walk callouts 1–4, then read the coverage strip: "all six must-haves, all three bonuses, both deliverables." **Switch to the app.** |
| 1:00–1:45 | 4 Live demo | B drives | (1) EMI reset at **2025-09-15**, then **2025-10-15**: "shall" becomes "may, at its option". (2) Clause 9.3 conflict. (3) Upload `corpus/demo/upload/EUCB-circular-2026-07.pdf` as *Bank policy*. (4) Summary, then the Hindi summary. If the app fails: narrate slide 4. |
| 1:45–2:00 | 5 Bonus + beyond | A | Three bonuses: PDF highlight, Hindi, calculations by code. Beyond the brief: upload check, impact alerts, maker-checker (409), audit chain, clause history, insurance. |
| 2:00–2:20 | 6 How it works | A | "The AI only drafts; code decides." Five checks per sentence; pass is shown, fail is withheld. Ablation: without the in-force check, 18 wrong sentences get through. |
| 2:20–2:38 | 7 Results | A | 85% vs 50%; 22/22 vs 10/22; 2.8% vs 10.6%. 89.5% on 114, 0/375 fabricated, top-8 retrieval 92% → 99%, contradictions 0.93/0.81. "Where we lose: 12 incomplete, none invented." |
| 2:38–2:50 | 8 Different + practical | A | No one we surveyed does all four together. PII redacted first, checks on a laptop CPU, an on-prem path. |
| 2:50–3:00 | 9 Close | A | "Proof, or silence." Plan: shadow, then assist, then own it. Ask: one co-op bank compliance desk for a shadow pilot. |

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
| Is it fast enough? Will it scale? | A6 |
| What doesn't work yet? | A7 |
| Retrieval quality? Precision, recall, MRR? Refusal trade-off? | A9 (and `METRICS_GUIDE.md`) |
| Can it refuse? Calculate? Work beyond banking? Audit? | A8 |
