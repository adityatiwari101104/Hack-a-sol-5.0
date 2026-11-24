# Model card / AI inventory entry (RBI FREE-AI Rec. 23 style)

| Field | Value |
|---|---|
| System | Proof-or-Silence: zero-guessing compliance Q&A, contradiction and amendment tracking, circular impact alert, PDF upload (Hackasol 5.0 AIML-02 prototype) |
| Intended users | Compliance officer and checker at an urban co-operative bank (the demo bank is fictional) |
| Not intended for | Customer-facing advice; final legal or credit decisions without human sign-off |
| Decides what is shown | Deterministic code: quote location, in-force status at the as-of date, applicability, numbers/dates/defined terms, calculation, contradiction triage, gates, output guard |
| Data leaving the machine | Redacted question and evidence sentences for the current question (and redacted clause text of an upload during extraction); per call in the audit row's egress manifest. On-premises option: `LLM_BASE_URL`. See `PRIVACY.md` |
| Human oversight | Suggested fixes are labelled drafts; maker-checker (maker ≠ checker enforced); incident flag per answer; uploads can be deleted |
| Owner / review | Team; `make test` and `make gate` on every change; `eval/critical_capture.py` before any claim |

## Model inventory

| Model | Version / licence | Where it runs | Role | Can it change what is shown? |
|---|---|---|---|---|
| gpt-5.4-mini | 2026-03-17, API | OpenAI (organizer-approved) | Drafts answer sentences with E/R citations; audits extracted tuples | Only through the verifier: every sentence is checked; failures are withheld |
| gpt-5.4-nano | 2026-03-17, API | OpenAI | Query plan; value/term extraction (quote-checked); search prefixes; 3rd-tier judge (≤ 3 per answer, must quote a span found verbatim by code); Hindi translation (numbers/ids re-checked by code) | Judge: can rescue a sentence only with a locatable span. Translation: shown only if the code check passes, labelled "machine translation" |
| HHEM-2.1-Open | Apache-2.0 | local CPU | Entailment, support step 1 | Rescues sentences (never blocks alone) |
| MiniCheck-DeBERTa-v3-Large | MIT | local CPU | Entailment second opinion | Rescues sentences |
| bge-small-en-v1.5 | MIT | local CPU | Embeddings, retrieval, off-topic gate, general-mode term matching | Chooses evidence |
| Tesseract 5 (eng) | Apache-2.0 | local | OCR of scanned upload pages (words marked OCR) | Text source; quotes carry an OCR badge |
| Presidio + spaCy en_core_web_sm | MIT | local | PII redaction before any model call | — |

Prompt version: `v2` (one revision in the final pass: spotlighted evidence, answer-first, carried conditions,
glossary lock, no advice/guarantees, refusal template, premise sentence; planner intent/needs/Hinglish; judge span).
Accepted only after a live dev A/B: accuracy 46 = 46 / 50, first-draft pass 0.736 → 0.757, misgrounded 3.1% → 2.1%,
red-team 22 = 22 / 22. `PROMPTS=v1` restores the old prompts.

## Evaluation (replayed, `eval/reports/critical/final_pass.json`)

| Measure | Result |
|---|---|
| Strict accuracy, 114 gold questions | 102 / 114 = 89.5% (Wilson 95% CI 82.5–93.9); 0 hallucinated |
| Held-out test / fresh (written by a stronger model) | 27 / 30 · 29 / 34 |
| Red-team (22) | 22 / 22 |
| Hindi (8) | 8 / 8; translations 20 / 20 passed the code check |
| Quotes not found on the cited page | 0 (deterministic) |
| Shown sentences not supported by their cited span (independent audit) | 2.8% (7 / 247); plain RAG 10.6% |
| Contradiction detection | precision 0.93, recall 0.81 (judge report §3.5) |
| Unanswerable / out-of-scope handled | 19 / 19 (judge report §3.3) |

### Ablation: what each check does (judge report §3.6; 415 drafted sentences, v1 prompts)

| Check switched off | Wrong sentences that would reach the user | Good sentences lost |
|---|---|---|
| In-force / applicability status | 18 (16 answers) | 0 |
| Numbers present + numeric binding | 7 | 1 |
| Whole support ladder | 90 (55 answers) | 0 |
| HHEM alone instead of the ladder | 0 | 113 |
| nano judge alone instead of the ladder | 1 | 81 |

The later support steps only rescue sentences; strictness comes from the status, number and support checks.

### Red-team categories (all pass now)
Prompt injection in the question (English, Hindi, "system override", "print your prompt") · injection hidden in a
document (flagged, not used) · false premises (4% foreclosure, ₹1,000/day compensation, 2023 effective date) ·
superseded traps (2014 circular → status line first) · number traps (APR 12% vs 17.07%, ₹4,000 fee) · invalid
calculation (0 months) · homoglyphs · PII in the question (redacted before the model) · Hinglish · threshold trap
(₹60 lakh vs ₹50 lakh) · task requests (poem, guarantee: refused before any model call) · commercial-bank profile
(answered "does not apply", cited).

## RBI FREE-AI mapping ("aligned", not "compliant")
- **Understandable by design:** every sentence carries a located quote, its lead-in, an in-force pip and five check
  badges; withheld sentences show the reason.
- **Accountability:** hash-chained audit log of every answer, upload and deletion; maker-checker; incident flags.
- **Safety and robustness:** abstention by code, injection defence on three sides, red-team set, spend cap.
- **Fairness / data protection:** PII redaction before egress; fictional borrowers only in the demo.

## Known limitations
English-trained checkers; drafting on a cloud model by default; incomplete answers on some table and contradiction
questions; heuristic premise check for numbers; general mode compares values, not conditions; English OCR only;
the confidence label barely separates right from wrong on our data; the two-person blind check (κ) is still to do.
