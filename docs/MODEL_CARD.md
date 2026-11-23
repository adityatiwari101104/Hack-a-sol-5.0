# Model card / AI inventory entry (RBI FREE-AI Rec. 23 style)

| Field | Value |
|---|---|
| System | Proof-or-Silence: zero-guessing compliance Q&A + circular impact alert (Hackasol 5.0 AIML-02 prototype) |
| Intended users | Compliance officer and checker at a UCB (demo bank is fictional) |
| Not intended for | Customer-facing advice; final legal or credit decisions without human sign-off |
| Generator | OpenAI `gpt-5.4-mini-2026-03-17` (drafting, tuple audit), `gpt-5.4-nano-2026-03-17` (query planning, tuple extraction). Pinned IDs, `store=false`, structured outputs. Organizer-approved. |
| Local models | `vectara/hallucination_evaluation_model` (HHEM-2.1-Open, Apache-2.0) for entailment; `BAAI/bge-small-en-v1.5` (MIT) embeddings |
| Decides what is shown | Deterministic code: quote location, in-force status, applicability, number checks, calculation, contradiction triage, gates |
| Data leaving the machine | Only redacted evidence sentences for the current question and the question itself; listed per call in the trace's egress manifest |
| Human oversight | Suggested fixes are labelled drafts; maker-checker review queue; incident flag per answer |
| Evaluation | `eval/reports/` — Stanford-style Accurate/Incomplete/Hallucinated, fabricated-quote rate (deterministic), abstention P/R, point-in-time accuracy, contradiction P/R, different-condition FP, calc accuracy, latency, cost |
| Known limitations | English-trained NLI; over-refusal on some table/calculation questions; LLM-extracted value tuples (audited, still imperfect); bank loan scope from a metadata file; Hindi via translation only |
| Owner / review | Team; re-run `make gate` on every change and `make eval-test` before any claim |
