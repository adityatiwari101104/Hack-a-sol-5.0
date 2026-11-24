# Team note: what to say to judges (24 Nov 2026)

Full detail: `reports/Banking judge critique and evals.md`.

**Say this**
- "The AI writes; our code decides. Every shown sentence has a quote we found on the page, valid on the date you ask
  about, or it is withheld."
- "88.6% accurate on 114 questions, 0 hallucinated, 0 of 375 quotes fabricated. Plain RAG on the same fresh questions:
  50%."
- "Take out our in-force check and 18 sentences stating superseded RBI text as current law reach the user. Plain RAG
  told our red-team that the withdrawn 2023 penal-charges circular is 'the current rule to cite'."
- "We publish our failures": red-team 16/22, the 3 hand-check misses, abstention 0.71/0.53.
- "Under half a rupee per answer; personal identifiers are redacted before anything leaves the bank."

**Don't say**
- "100% faithful" or "zero hallucination". Say "no unverified sentence is shown".
- The old 85% fresh / 0.50 abstention numbers: they came from recordings the current code cannot replay (a thread race, now fixed).
- "Real-time": a live answer takes 7–15 s. Stream it and pre-record demo questions.
- "FREE-AI compliant": say "aligned with FREE-AI's explainability and audit sutras".

**Before the demo**
1. Repair audit row 889 or archive `trace_log` and start a fresh chain: verify-chain is red today (user decision).
2. Pre-record every demo question (and each as-of date) so the demo runs from replay.
3. Do not ask "write a poem" or "guarantee": both still get an answer (fix #4 in the report).

**Spend:** ledger $3.99 of the $6 budget (this round ≈ $1.19 counted the way the ledger counts). The code cap is 3.50
in `config.py`; run with `SPEND_CAP_USD=5.50`.
