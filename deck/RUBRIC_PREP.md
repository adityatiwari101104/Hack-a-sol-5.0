# DocuHelp: prep for the official AI-ML scoring sheet (Hack-A-Sol 5.0 final)

**The official sheet** (each evaluator marks on their own; the team's score is the average):

| Criterion | Max | Share | Where it shows in the deck |
|---|---|---|---|
| **Innovation & originality** | 25 | 25% | slides 1, 3, 5, 8 |
| **Technical execution** | 25 | 25% | slides 6, 7 (+ appendix A1–A4) |
| **Impact & relevance** | 20 | 20% | slides 2, 8, 9 |
| **Track fit** | 15 | 15% | slide 3 (coverage strip), slide 5 (bonus + beyond) |
| **Presentation & demo** | 15 | 15% | slide 4 + the live app |
| **Total** | **100** | | |

Our team is **Insiders** (row 8, AIML-02). Ten teams on this sheet chose AIML-02, so we compete directly with nine others on the same brief.

**What the weights tell us**
- **Half of the marks (50/100) are innovation plus technical execution.** Spend most of the talk on "why this is new" and "how it is built and proven".
- **Track fit (15)** is the easiest marks to collect: tick every AIML-02 requirement, out loud and on screen.
- **Presentation & demo is only 15**, so a flashy demo can't rescue weak substance. A broken demo still costs trust in every other column, though, so rehearse it.

Every slide now has a tag in its top-right corner naming the criterion it serves.

---

## 1. Innovation & originality (25)
**What earns marks:** a new idea, not "ChatGPT plus PDFs", and a twist the judge can see.

| Our evidence | Say it like this |
|---|---|
| Proof or silence, checked per sentence | "Every sentence must pass five code checks, or it is withheld. Not one citation per answer: one proof per sentence." |
| The Withheld tray | "We show what the AI drafted and we blocked, and why. None of the tools we surveyed shows the negative space." |
| Time-aware law | "Same question, different date, different law: ‘shall’ became ‘may, at its option’ on 01-Oct-2025, rebuilt from RBI's own footnote." |
| Typed contradictions | "Conflict, needs review, different condition, supersession: not just ‘contradiction’." |
| Gap table (slide 8) | "None of the tools we surveyed does all four together." Never say "no one else does this". |

**Likely probe:** "Isn't this just RAG with citations?"
→ "A citation can be real and still not prove the sentence. Plain RAG's quotes all existed, yet 10.6% didn't support their sentence. A citation can also quote withdrawn law. We check both, per sentence."

## 2. Technical execution (25)
**What earns marks:** a real, working system; a sound method; proof that it works; awareness of its limits.

| Our evidence | Number |
|---|---|
| Five-gate verifier (ids → in force → quote on page → numbers → support ladder) | 2.8% vs 10.6% of shown sentences unsupported; 0 of 375 quotes fabricated |
| Ablation: switch off one check at a time | in-force off → 18 wrong sentences; number checks off → 7; support check off → 90 |
| Evaluation: 114 questions, frozen splits, Wilson CIs | 89.5% (CI 82.5–93.9); test 27/30; fresh 29/34 |
| Plain-RAG baseline on the same questions | 85% vs 50%; red-team 22/22 vs 10/22 |
| Search quality | right clause in the top 8: 92%, rising to 99% across sub-queries |
| Engineering | Decimal EMI/APR; three-sided injection defence; redaction; hash-chained audit; 48 tests, 14 canaries; record-replay at $0 |

**How to max it**
- Open **Pipeline X-ray** for about 5 seconds in the demo.
- Say the ablation line.
- Name one limit yourself: "the confidence label is weak, so the checks decide".

**Likely probes**
- "Why not let the AI judge itself?" → "On a public RBI RAG project, an AI judge scored faithfulness 0.95 where an entailment model scored the same answers 0.21. Code comes first; extra AI steps can only rescue a sentence."
- "How do you know which version applies?" → "Typed AMENDED_BY / WITHDRAWS edges, each with a located proof quote; status is computed at the date asked."

## 3. Impact & relevance (20)
**What earns marks:** a real user with a real problem, impact you can measure, and a credible path to adoption.

| Our evidence | Say it like this |
|---|---|
| The user: a compliance officer at a Tier 3 urban co-operative bank (1,457 UCBs in India) | "Small banks can't afford Harvey at about $1,000 a seat; we cost about ₹0.38 an answer." |
| The pain: 13.34 lakh RBI Ombudsman complaints in FY25, loans the top ground (29.25%) | "A wrong answer about a loan charge becomes a complaint." |
| The withdrawn-circular trap (slide 2) | "Plain RAG called a circular withdrawn in 2025 ‘the current rule to cite’." |
| Borrower protection | "A 2% clause RBI forbids is a hidden charge. We catch it before a branch applies it." This speaks to the judge's consumer-protection and MSME interests. |
| Privacy and governance | Redacted before sending; everything except drafting runs locally; maker-checker; hash-chained audit; aligned with RBI FREE-AI |
| Adoption plan (slide 9) | Shadow, then assist, then own it. Ask: one co-op bank compliance desk for a shadow pilot. |

**Likely probe:** "Is it fast enough?" → "7–15 seconds live: back-office speed, not chat."

## 4. Track fit (15): the easiest marks
**What earns marks:** solving AIML-02 as written, and being clearly an AI-ML project.

Slide 3 has a coverage strip. Read it out: **"All six must-haves, all three bonuses, both deliverables."**

| AIML-02 requirement | Where we show it | Proof |
|---|---|---|
| Multi-document evidence retrieval (tables, multi-page) | Any answer: "n quoted clauses from n documents" | tables stitched across pages; 22 documents |
| Exact citations: document, page, verbatim quote | Citation chip, then the PDF opens with the quote boxed | 0 of 375 quotes unlocatable |
| Contradiction detection, both quotes side by side | Conflict card (clause 9.3 vs RBI 261(1)) | precision 0.93 · recall 0.81 |
| Amendment chains: which version applies today | As-of switch; Clause history page | versions rebuilt from RBI footnotes |
| Zero-guessing abstention, saying what is missing | Withheld tray; refusal card | 19/19 unanswerables refused |
| Faithfulness score as a percentage | Proof meter (drafted → passed → shown) | honest ratio, not 100% by construction |
| Bonus: highlight on the PDF page | Chip → page with the box | — |
| Bonus: Hindi questions and answers | Hindi answer and Hindi summary | 8/8; 20/20 number check |
| Bonus: calculations with working | EMI card | ₹21,695.58, computed by code |
| Deliverable: web app with Q&A, contradictions, amendments, abstention | The live app | — |
| Deliverable: README section on the pipeline and models | `README.md` pipeline diagram | — |

**The one track-fit risk:** the brief says "entirely on open-source models".
- Have this answer ready: "The organizers allowed us an API model for drafting. Checking, search, OCR and redaction run on open-source models locally, and the drafting step can point at a server inside the bank."
- Say it plainly; hiding it costs more than it saves.

## 5. Presentation & demo (15)
**What earns marks:** clarity, time control, a demo that works, and confident answers.

- **3:00 timing:** hook 0:15 → problem 0:40 → product 1:00 → live demo 1:50 → how it works 2:15 → results 2:35 → why us 2:50 → close 3:00.
- **Before the round:**
  - switch to replay mode (`npm run dev:all`; the screen showed Live $5.22 of $5.50);
  - run `make audit-reset`;
  - delete the VoyageHack and "आवेदन" uploads;
  - select Banking (RBI), as of 24-Nov-2026, Tier 3.
- **Demo order:**
  1. Withheld tray (EMI reset at 15-Sep-2025)
  2. As-of 15-Oct-2025
  3. Conflict on clause 9.3
  4. Upload the EUCB circular as a Bank policy
  5. Summary, then the Hindi summary
  6. If there's time: Pipeline X-ray, then Review queue "Try anyway" → 409
- **Rules:** recorded chips only; one person drives and one narrates; if the app fails, fall back to slide 4.
- **Q&A:** answer in under 20 seconds, then point to the appendix slide.
- **Words:** say "no unverified sentence is shown" and "aligned with FREE-AI". Never say "100%", "zero hallucination", "real-time" or "compliant".

## Points plan (where a few extra marks come from)
| Criterion | Cheap extra marks |
|---|---|
| Track fit | Read the coverage strip aloud; tick every requirement by name. |
| Innovation | Show the Withheld tray within the first minute. |
| Technical | The ablation line, plus 5 seconds of X-ray. |
| Impact | The borrower-protection line and the pilot ask. |
| Presentation & demo | Finish on time; replay mode, so nothing breaks. |

## Technical vocabulary (use only what you can explain in one line)

He is a builder who dislikes "fake confidence". Use a term only if you can explain it the next second.

### Retrieval and grounding
| Term | Means | Where it is in DocuHelp |
|---|---|---|
| **RAG** (retrieval-augmented generation) | Search documents first, then let the AI answer from what was found | The base pattern. We add a verification gate after it. |
| **Grounding / attribution** | Each claim is tied to a source span | Every sentence carries a doc · clause · page chip. |
| **Hybrid retrieval** | Keyword search plus semantic (vector) search, combined | BM25 + dense vectors. |
| **Reciprocal rank fusion (RRF)** | Merges two ranked lists without tuning weights | Combines the keyword and semantic results (k = 60). |
| **Structure-aware / clause-level chunking** | Split documents by their own clauses, not every 500 tokens | 261(2)(ii) keeps its parent lead-in. |
| **Contextual chunk headers** | A short header added to each chunk so it is searchable out of context | Applied to 1,923 chunks. |
| **Graph expansion** | After search, follow links to related clauses | REFERS_TO one hop, plus all versions and the withdrawing clause. |

### Verification
| Term | Means | How it is calculated in DocuHelp | Significance in the product |
|---|---|---|---|
| **Faithfulness** | Is each sentence supported by its source? | **Proof meter:** sentences drafted → sentences that passed all five gates → sentences shown, with the withheld count (for example, "3 drafted › 3 passed › 3 shown · 0 withheld"). Computed per answer from the verifier's verdicts. | Honest by design: we show the drafted-to-passed ratio, not a "100%" that holds by construction. A blocked sentence is never shown, so every shown sentence is verified. |
| **Hallucination** | An answer states something false or invented | **Strict grader:** an answer is labelled *Hallucinated* if any quote cannot be located on its cited page, or if it matches a forbidden pattern (a known wrong fact). Run over all 114 questions. | **0 of 114** answers hallucinated, **0 of 375** quotes fabricated: the core promise in numbers. |
| **Misgrounding** | The citation is real, but it does not support the sentence | An independent AI audit reads each shown sentence against only the span it cites and labels it supported, partly supported or not supported. **7 of 247** shown sentences (2.8%) were not supported; for plain RAG, **5 of 47** (10.6%). | The silent failure in legal AI. Plain RAG's 5 bad quotes all existed verbatim, so a "quote exists" check alone would have passed them. This is why we check support, not just existence. |
| **NLI / textual entailment** | Does text A logically support claim B? | Gate 5, the support step: an entailment classifier scores (quote → sentence). A score of **≥ 0.5** passes. | Catches sentences that cite a real clause but claim more than it says. |
| **Verification ladder / cascade** | Cheap checks first, costlier ones only when needed | Per sentence, in order:<br>1. Word coverage ≥ 0.8 passes at once.<br>2. Otherwise an entailment model, ≥ 0.5.<br>3. Otherwise a second entailment model, ≥ 0.5.<br>4. Otherwise an AI judge (at most 3 per answer). The judge must quote a span that code then finds verbatim.<br>Later steps can only **rescue** a sentence, never wave a failing one through. | Keeps strictness and avoids silence. In the ablation, the first entailment model alone would have withheld **113** more good sentences; the ladder rescues them without letting wrong ones through. |
| **Deterministic guardrails** | Rules in code, not in the prompt | **Gates 1–4, all code:**<br>1. Every evidence id the sentence cites exists in this answer's evidence pack.<br>2. The cited text is **IN_FORCE** on the as-of date (computed from valid_from / valid_to).<br>3. The quote is found on its page, exactly or with fuzzy match **≥ 95**.<br>4. Every number and date appears in the evidence or question, or comes from a code calculation. | The AI cannot talk its way past these. Switching off the in-force gate alone lets **18** wrong "current law" sentences through. |
| **Numeric binding** | A number must belong to the clause it cites | Each number in a sentence is matched to the number extracted from the cited clause, with its subject and conditions (for example, ₹50 lakh belongs to 261(2)(ii), the Tier 3 MSE limit). | Stops a correct number from being attached to the wrong rule. Removing the number checks lets **7** wrong sentences through. |
| **Structured outputs / JSON schema** | Force the AI to answer in a fixed shape | The drafter must return a list of at most 4 sentences, each with the evidence ids it relies on. Numbers it would compute appear as `{{calc:N}}` placeholders that code fills in. | Makes every sentence checkable on its own, and keeps the AI from doing arithmetic. |

### Time, conflicts and answers
| Term | Means | Where it is in DocuHelp |
|---|---|---|
| **Temporal validity / point-in-time query** | Which version of a rule was valid on date X | valid_from / valid_to, with status computed at the as-of date. |
| **Typed knowledge graph (lightweight)** | Nodes linked by named relations | WITHDRAWS / AMENDED_BY / REFERS_TO edges, each with a proof quote. Say "typed edges", not "GraphRAG". |
| **Contradiction triage** | Classify a clash, don't just detect it | Conflict · needs review · different condition · supersession. |
| **Structured outputs / JSON schema** | Force the AI to answer in a fixed shape | Each sentence comes with its evidence ids, so it can be checked. |
| **Abstention / selective answering** | Refusing when evidence is insufficient | 19/19 unanswerable questions refused, with the reason. |
| **Over-refusal** | Refusing something answerable | 4.6% in the last full measurement. |

### Evaluation
| Term | Means | How it is calculated in DocuHelp | Significance in the product |
|---|---|---|---|
| **Strict accuracy** | Is the whole answer right? | An answer is *Accurate* only if all of these hold, by code (regex) against the answer key:<br>• the outcome matches (ANSWER / ABSTAIN / CONFLICT …);<br>• every required key fact appears;<br>• it cites the expected document and clause;<br>• nothing forbidden is said;<br>• no quote is fabricated.<br>Otherwise *Incomplete*, or *Hallucinated*. **102 of 114 = 89.5%.** | The headline number. Strict means we lose points for a missing date or wording, not just for wrong facts. |
| **Ablation study** | Remove one part and measure the damage | 415 drafted sentences were captured from real runs, then re-run offline through the verifier with one check switched off at a time, counting sentences that flip from blocked to shown. The offline copy reproduces **414 of 415** live verdicts. | Proves each check earns its place: in-force off → **18** wrong sentences (16 answers); number checks off → **7**; support ladder off → **90** (55 answers). |
| **Held-out / frozen splits** | Test data never used for tuning | 114 questions in three splits, fixed before scoring:<br>• dev, 50 (used for tuning);<br>• test, 30 (never tuned on);<br>• fresh, 34 (written by a separate, stronger AI and run once). | Shows the score isn't tuned to the test. **Test 27/30 · fresh 29/34.** |
| **Baseline** | The simple version to compare against | Plain RAG with the same drafting AI: semantic top-5 passages, one prompt ("answer and quote your sources"), no gates, versions or rules. Graded with the same metrics. | The fair comparison: **85% vs 50%** on fresh questions, **22/22 vs 10/22** on red-team. The gap is what our checks add. |
| **Wilson confidence interval** | An honest error bar for a percentage on a small sample | Wilson score interval at 95% (z = 1.96) on successes / n. For 102 / 114 the range is **82.5–93.9%**. | With only 114 questions, the true accuracy could be anywhere in that band. Showing it signals we aren't overclaiming. |
| **Precision / recall (contradictions)** | Of what we flagged, how much was right? Of what exists, how much did we find? | 16 questions whose correct answer is a conflict (positives), 68 where a conflict is wrong (negatives). TP 13, FP 1, FN 3 → precision 13/14 = **0.93**, recall 13/16 = **0.81**. | Contradiction detection is a must-have in the brief. The one false alarm confused penal *charge* with penal *interest*; the misses are conflicts that depend on conditions. |
| **Recall@k (retrieval)** | Did the right clause reach the top k results? | 75 questions with a known correct clause. The keyword + semantic hybrid finds it in the top 8 for **92%**; combining the 2–4 sub-queries raises that to **99%**. A re-ranker gave no gain (28/32 either way), so it is off. | Search isn't the bottleneck; evidence selection after search is. That's why effort went into the gates, not into a bigger retriever. |
| **Abstention / over-refusal** | Refusing when evidence is missing / refusing when it shouldn't | **Abstention:** unanswerable or out-of-scope questions handled correctly, **19 / 19**. **Over-refusal:** answerable questions that were refused anyway / all answerable questions, **4.6%**. | "Silence" is a feature only if it is accurate. We report both sides. |
| **LLM-as-judge bias** | An AI grader can be wrong or lenient | We ran an AI judge next to the strict grader and read its disagreements. It wrongly marked a correct "₹5,000 per day" as hallucinated, and called correct "withdrawn" statements unsupported. | Why code checks come first, and why the slide quotes the strict grader. |
| **Inter-annotator agreement (Cohen's κ)** | Do two graders agree beyond chance? | κ = (observed agreement − chance agreement) / (1 − chance agreement), strict grader vs AI judge. Fresh set: **73% agreement, κ 0.17**; red-team **κ 0.46**. A further careful reading of every fresh answer gave **31/34**. | Low agreement means one metric isn't enough, so we report all three. The next step is a two-person human blind check. |
| **Record-replay (cassettes)** | Save AI responses and replay them exactly | Each AI request is hashed (SHA-256 of model, prompt, schema and input) and its response saved under `eval/cassettes/`. Replay mode serves only from these files. | Every number re-scores at **$0** and is deterministic, and the demo can't break or overspend. Any prompt change invalidates the recordings, so prompts are frozen. |
| **p50 / p95 latency** | Typical vs worst-case speed | Per-stage timers on every answer; the median (p50) and 95th percentile (p95) across runs. Warm local work: **p50 1.1 s, p95 3.0 s**. The drafting call adds most of the rest: **~7–15 s** end to end live. | Honest framing: back-office speed, not chat. Replay is about 4 s. |
| **Red-team pass rate** | Share of attacks handled correctly | 22 attacks, each with an expected outcome and forbidden patterns, graded like the gold set. Covers injection in the question and in documents, false premises, superseded-rule traps, number traps, PII, look-alike characters and off-task requests. **22 / 22**; plain RAG **10 / 22**. | Safety under adversarial input, which is what a bank fears most. |

### Security and governance
| Term | Means | Where it is in DocuHelp |
|---|---|---|
| **Red-teaming** | Attacking your own system on purpose | 22 attacks, 22 handled. |
| **Prompt injection (direct / indirect)** | Instructions hidden in the question / in a document | The gold-loan FAQ's hidden white text is flagged, not obeyed. |
| **PII redaction / NER** | Detecting and masking personal data | Before anything leaves the machine. |
| **Defence in depth** | Several independent safety layers | Question, document and output guards. |
| **Human-in-the-loop / maker-checker** | AI proposes, people approve | The server enforces checker ≠ maker. |
| **Tamper-evident (hash-chained) audit log** | Each row hashes the previous one | Verify chain; a tampered row turns red. |
| **Idempotent** | Running it twice gives the same result, no duplicates | Impact reports have deterministic ids. |

### Do not claim
- Fine-tuning (we did none).
- "Agentic" (it isn't an agent).
- "Calibrated confidence" (our confidence label is weak).
- GraphRAG (we use typed edges).
- "100% accurate" or "zero hallucination".
