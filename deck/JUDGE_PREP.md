# DocuHelp: prep for the final evaluation

Judge we expect: **Omkar Palika**. Read from his public LinkedIn profile on 24 Nov 2026. He announced he is judging Hack-A-Sol 5.0 and that this is his first time judging; he has organised hackathons before.

## 1. Who he is, and what that means for us

| What his profile shows | What he will look for | How we meet it |
|---|---|---|
| Headline: **National Compliance**. Builds AI products full-stack and ships many solo projects. | Does this fit how compliance actually works? | Talk in compliance terms: circulars, in-force dates, maker-checker, audit trail, FREE-AI. |
| Article: *"Why AI confidence is becoming the new fake confidence."* | An AI that sounds sure is not evidence. | This is our thesis. Open with it: "A polished answer is not proof. DocuHelp shows the proof, or says nothing." |
| Sitescan AI post, "the honest part": the UI looked precise but was "mostly an educated guess"; *"before trusting an AI tool's output, check what it was actually given."* | Which parts are computed and which are guessed? What did the model actually receive? | Open **Pipeline X-ray** live. Every stage is tagged as AI, local or code. Quotes, dates, numbers and the EMI are computed by code, never by the AI. Each audit row lists exactly what left the machine. |
| ARC-AGI post: *"Posting the 4% because it's the real number."* Duo-puzzle post: 95 generated levels "load, but most don't make sense". | Real numbers, failures shown, scepticism about generated test data. | Say "where we lose" yourself (§3). Volunteer that the fresh set was AI-written, then read once more and checked by a second, independent grader; the scores are listed in §2. |
| pgvector benchmark: a filtered search "can return zero rows and report that it succeeded"; ground truth from an exact scan. | Silent failures and how we measured. | Our silent failure is a citation that is real but does not prove the sentence (Stanford's "misgrounding"). Plain RAG's quotes were all real, yet 10.6% did not support their sentence. Ours: 2.8%. |
| NEETly: a NEET tutor that answers only from NCERT (embed, retrieve top-3, answer from those). Veritas AI: claims go through search grounding. | He has built plain RAG himself, so he knows its limits. | Never put plain RAG down. Say: "Retrieval grounding is step one. Two failures remain: the passage may no longer be in force, and it may not prove the sentence. We check both per sentence." |
| *Temporalizing Confidence* project: checks AI confidence step by step. | He will ask about our confidence score. | Be honest: our confidence label barely separates right from wrong on our data. We gate on checks, not on confidence. |
| MSME 360 startup: Udyam/GST help for MSMEs, **English and Hindi** ("an English-only tool is a closed door"). | MSMEs, Hindi, real users in India. | Our hero question is a **₹40 lakh MSE loan**: RBI bars a Tier 3 UCB from charging pre-payment on it. Show Hindi beside the proof. |
| Post on hidden delivery-app fees, GST on fees, CCI, the Rapido fine. | Consumer protection and hidden charges. | Our demos are about **illegal pre-payment and foreclosure charges on borrowers**. "A bank clause charging 2% that RBI forbids is a hidden fee; we catch it before a branch applies it." |
| GATE Prep: "extract once, don't call the AI every time". RL post: "start with the version that can be wrong today." | Cost awareness and honest scope. | ≈ ₹0.38 per answer. Values are extracted once at ingest. Recorded answers replay at $0. We built one real persona deeply instead of a broad platform. |
| screenpet: OCR and the language model run locally, and screen text is redacted. | Privacy and on-device processing. | Personal data is redacted on the machine before anything is sent. Checks, search and OCR run locally, and drafting can be pointed at a server inside the bank. |

The problem statement contains no published scoring rubric. Assume the usual criteria: innovation, technical depth, a working demo, impact and feasibility, and presentation.

## 2. Our scores: what each one means and why it matters

| Number | What it measures | Why it matters (to him) | Likely follow-up → answer |
|---|---|---|---|
| **89.5%** (102/114, 95% CI 82.5–93.9) | Strict accuracy on all 114 questions: right outcome, facts and citation | The headline. The CI shows we know the sample is small. | "Is it good?" → Stanford measured commercial legal AI at 65% (Lexis+) and 41% (Westlaw) on a different corpus, so the comparison is directional only. |
| **0** hallucinated answers · **0 of 375** quotes fabricated | No invented facts; every quote is found verbatim on its page by a string check | Answers his "fake confidence" point. | "Ever?" → In these tests, yes. Never say "zero hallucination"; say "no unverified sentence is shown." |
| **85% vs 50%** (29/34 vs 17/34) | Same 34 fresh questions, ours vs plain RAG with the same AI and no checks | Shows the checks are doing the work. | "Who wrote the fresh questions?" → An AI wrote them; they were run once. A second, independent grader scored 31/34. Plain RAG is deliberately weak (top-5, one prompt). |
| **22/22 vs 10/22** | Red-team: prompt injection (in the question and hidden in a document), false premises, superseded-rule traps, PII, homoglyphs | Safety; his Sitescan and AgentiQA work is about how AI behaves under stress. | Show the gold-loan FAQ with hidden white text: it is flagged and not used. |
| **2.8% vs 10.6%** | Shown sentences not supported by their cited quote | The silent-failure metric (his pgvector point). | "Who judged support?" → An independent AI audit: an opinion, not ground truth. We report it anyway. |
| **19/19** | Unanswerable or out-of-scope questions refused correctly | "Silence" is a feature. | "Over-refusal?" → 4.6% of answerable questions were refused in the last full measurement. We say so. |
| **P 0.93 / R 0.81** | Contradiction detection on labelled conflict pairs | Must-have from the brief. | "What do you miss?" → Conflicts that need conditions rather than values; we compare values. |
| **18** | Wrong "current law" sentences that would reach users if the in-force check were switched off | Proves the time logic matters (ablation). | Appendix A2. |
| **8/8** Hindi · 20/20 translations pass the number check | Hindi questions answered, with Hindi beside the English proof | MSME 360 values Hindi. | "Is the Hindi verified?" → The numbers, dates and clause ids are re-checked by code; the wording is labelled "machine translation". |
| **≈ ₹0.38 per answer** · ~7–15 s live | Cost and speed | Feasibility for a co-op bank. | "Real-time?" → No. Back-office speed. The demo replays recorded answers. |
| 28/32 retrieval recall (dev) · 48 tests · 14/14 canaries | Engineering hygiene | He benchmarks things. | A reranker gave no gain (28/32 either way), so it is off. |

## 3. "Where we lose" (say these before he finds them)
- 12 of 114 answers are **incomplete**, never invented. Tables and conflicts with conditions are the weak spots.
- The confidence label is weak; the checks, not the confidence, decide what is shown.
- Live answers take 7–15 s.
- Our checkers are English-trained. Hindi is translated from the verified English, not checked on its own.
- We have not done a two-person blind check yet (Cohen's κ). Our two graders agreed poorly with each other (κ 0.17), so we report all three numbers.
- The fresh questions are AI-written. That is why we also report the 80-item gold set and the red-team set.

## 4. Unique points (one line each)
1. **Proof or silence, per sentence.** The AI drafts; code shows only sentences whose quote is found on the page, was in force on the date asked, has its numbers in the evidence and supports the claim.
2. **The negative space is visible.** A Withheld tray shows each blocked sentence and which check failed. No surveyed tool shows this.
3. **Law as of any date.** Versions are rebuilt from RBI's own footnotes ("shall" → "may, at its option" on 01-Oct-2025), and status is computed for the date asked.
4. **Contradictions with both quotes side by side**, including a new upload being checked against RBI the moment it arrives.
5. **Code does the maths.** EMI and APR are computed in Python Decimal with the working shown; false premises get only a "hypothetical arithmetic" label.
6. **Built for an Indian co-op bank:** Tier 3 rules, Hindi, a hash-chained audit log, maker-checker enforced (409 on self sign-off), and alignment with RBI FREE-AI.
7. **Reproducible.** Every number replays from recorded answers at $0.

## 5. Demo changes for this judge (still within 3 minutes)
- On the hero answer, click **Pipeline X-ray** for about 5 seconds: "Here is exactly what the AI received and what code decided." This is his Sitescan lesson.
- For the Withheld-tray beat, use the **EMI-reset question at 15-Sep-2025**. The ₹40 lakh question now withholds nothing.
- Say "MSE" and "hidden charge" out loud on the conflict and upload moments.
- Keep Hindi in. Mention "English-only is a closed door" only if he raises it.
- Do not type new questions live; use the recorded chips (`docs/DEMO_SCRIPT.md`).

## 6. Questions he is likely to ask
| Question | Answer (≤ 20 s) |
|---|---|
| "Which models do you use? The brief says open-source only." | Be straight: "The organizers allowed us an API model for drafting. Checking, search, OCR and redaction run on open-source models locally, and drafting can point at a server inside the bank." The deck leaves models out, so prepare this answer. |
| "What exactly does the AI see?" | Only the redacted question and the evidence sentences for that question. Each audit row lists it. Show the X-ray. |
| "How is this different from RAG with citations?" | Citations can be real and still not prove the sentence, or can quote superseded law. We check both, per sentence, and block failures. |
| "How do you know which version applies?" | Typed edges (amends, withdraws) with a located proof quote, and status computed at the date you ask. Appendix A4. |
| "What if every sentence fails?" | One retry with the reasons, same evidence, same bar; then "I can't prove an answer", with what it searched. |
| "Would a bank use it?" | Plan: shadow one compliance desk read-only, then assist inside maker-checker, then move drafting on-prem. ≈ ₹0.38 per answer. |
| "What did you learn?" | The checks matter more than the prompt: switching off the in-force check lets 18 wrong "current law" sentences through. |

## 7. Words
- **Use:** "no unverified sentence is shown"; "aligned with RBI FREE-AI"; "the real number".
- **Avoid:** "100% faithful", "zero hallucination", "real-time", "FREE-AI compliant", "revolutionise".

Sources: his public LinkedIn profile (posts, articles and projects as listed on 24 Nov 2026); our numbers from `eval/reports/critical/final_pass.json`, `reports/Banking judge critique and evals.md` and `docs/MODEL_CARD.md`.
