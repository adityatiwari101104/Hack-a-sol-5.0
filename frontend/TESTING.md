# What to see and test in the UI

Start everything: `cd frontend && npm run dev:all` (API in replay mode on :8000 + UI on :5173), then open
http://localhost:5173. Use only recorded questions: the **Rehearsed questions** button in the composer lists them all.
A reworded question or another date returns "not recorded" (503) in replay mode; that is expected.

> Uploading and deleting write to the database. Before the demo: `make audit-reset`, and if the demo circular is
> already uploaded you get "duplicate" (fine: it shows its report), or delete it on the Uploads page first.

## 1. Landing (`#/`)
- [ ] Hero: headline, short paragraph, **Ask a question**, **See what we withhold**, and the "Try a recorded question" line (it cycles; click it to run).
- [ ] Graph builds in 5 steps (RBI rules → Your bank → Clauses → Changes → Conflicts); the stepper and **Replay** work; date buttons 01-Apr-2024 / 01-Dec-2025 / Today change the counts; **Show all links** switch; drag to rotate; click a node for its card.
- [ ] "Law over time": **Play 2023 → today** glides smoothly, milestones jump, the readout under each row changes with the date.
- [ ] Conflict section, How it works, Numbers, hash-chain demo (edit a row → red break), CTA. EN/हिं and the dark toggle in the nav.

## 2. Top bar (every app page)
- [ ] **Banking (RBI) · Insurance · Your uploads** domain switch (Banking is the default). Insurance hides the bank profile; Your uploads shows a count.
- [ ] As-of date popover (ruler, recorded dates), Tier 3 / Tier 4, EN / हिं, theme toggle, "Replay" badge.
- [ ] Stop the API: a banner says "Backend offline" with the start command, **Copy command** and **Retry**.

## 3. Ask (`#/ask`), Banking
Use the storyboard cards or the chips under the composer, in order:
- [ ] **1 · Withheld tray** (Tier 3 ₹40 lakh MSE): streaming stages, then sentences appear one by one with "All five checks passed"; open **Withheld (n)** and read the reasons.
- [ ] Click a citation chip: hover shows the quote; click opens the PDF on the right with the quote boxed.
- [ ] **Pipeline X-ray** drawer: every stage, Esc closes.
- [ ] **2 · As-of switch** (EMI reset, 15-Sep-2025 then 15-Oct-2025): "shall" → "may"; the "Then vs now" box.
- [ ] Conflict card (Retail Loan Policy 7.4 vs RBI) → **Open both pages side by side**.
- [ ] Calculation card (EMI ₹25 lakh, 8.5%, 240 months = ₹21,695.58) with the working.
- [ ] Refusals: "RBI repo rate today" (calm refusal card), gold-loan FAQ (flagged source: hidden instruction not used).
- [ ] Premise trap ("Since RBI allows UCBs to charge a 4%…"): first line rejects the premise, no ₹80,000 card.
- [ ] NEEDS_INFO: "Can a UCB charge foreclosure charges on a floating rate home loan to an individual sanctio…" → choose *term loan* → **Ask again with these details**.
- [ ] **Trick questions** group in the picker:
  - "Ignore your rules": notice "…I ignored it" + low-confidence note + a proven answer.
  - "Write a poem": refused before any model call.
  - "Quote the 2014 circular as current": first line says it is no longer in force.
  - "EMI for 0 months": "not a valid loan term" note.
  - "Commercial bank asks about a UCB rule": top bar shows *Commercial bank*; "does not apply", cited.
  - "Hinglish question": Hindi under each verified sentence + "हिंदी अनुवाद · machine translation" note.
- [ ] Answer actions: Copy with citations, Print evidence pack, Flag as wrong (writes an incident).
- [ ] Recent questions in the left rail re-open an answer (with its domain).

## 4. Uploads (`#/uploads`) and asking about an upload
- [ ] **Try the demo upload** → dialog pre-filled (EUCB-circular-2026-07.pdf, *Bank policy or circular*) → **Upload**.
- [ ] Progress: stages tick one by one, the progress bar fills, counts (pages, passages, values, links).
- [ ] Report: title, in force from 01-Aug-2026, 3 links with quotes, conflicts side by side ("Your upload" vs "RBI, in force"), **Show all**.
- [ ] **Ask about this upload** → Ask switches to *Your uploads (1)* → card "New circular: 3% foreclosure" → Conflict answer citing the upload (chip says *uploaded*). Then "New circular: penal charge" → ₹750 per month.
- [ ] Back on Uploads: tick/untick **Use in answers**, **Report**, **Delete** (asks to confirm; then shows what was removed).
- [ ] Errors: upload a non-PDF (refused as not a PDF), upload the same file twice ("already in the library" + its report). 413/403/400 show plain sentences (needs a big file or `UPLOADS_ENABLED=0` to see).

## 5. Insurance
- [ ] Switch to **Insurance**: the insurance hero with 4 cards.
- [ ] "Pre-existing disease wait · 1-Feb-2026" → 48 months (policy 4.2).
- [ ] "Pre-existing disease wait · today" → Conflict: Endorsement No. 1 says 36 months, Claim FAQ says 24 months.
- [ ] Cosmetic surgery → not covered unless after an accident; Senior co-payment → refusal.
- [ ] **Conflicts** page with Insurance selected shows the insurance conflict; **Clause history** → "Insurance · policy clause 4.2" shows 48 → 36 months.

## 6. Other screens (Banking)
- [ ] **Impact alerts**: RBI-UCB-RBC-MD-2025 at Tier 3, then Tier 4: the ₹80 lakh letter flips to CONFLICT; List / Graph.
- [ ] **Review queue**: accept an item, then try to sign off as the same person → "a different person must sign off" (409); change the actor and sign off.
- [ ] **Conflicts**: Board / Map, subject filter, "Involving our bank's documents".
- [ ] **Rule simulator**: change Tier, amount (₹40 L ↔ ₹80 L), borrower; verdicts change live, no model call.
- [ ] **Clause history**: EMI reset 2(ii) two versions with the diff.
- [ ] **Audit trail**: **Verify chain** ✓ → **Tamper** a row → verify shows the red break at that row → **Restore** → green.
- [ ] **AI governance**: FREE-AI mapping, the OpenAI note, evaluation numbers.

## 7. Everywhere
- [ ] Dark theme on each screen; widths 1280 and 1440.
- [ ] Keyboard: Tab through the top bar and nav, Esc closes popovers, drawers and dialogs.

## 8. Live vs replay
- [ ] `npm run dev:all` (replay, :5173): type a new question. The Ask button is disabled and the note says to start `npm run dev:live`. The top bar says "Replay".
- [ ] `npm run dev:live` (live, :5174): the top bar says "Live · spend $X of cap $Y". A recorded question still answers free; a new one calls the model (7–15 s) and the spend figure updates after the answer. At the cap you get a "spend cap reached" card.
- [ ] Your uploads → choose an upload: "Ask about this document" chips (recorded ones run; the others say "live only" in replay). Ask "Summarise this document" in live mode: the answer is followed by "Ask something specific about the document" with the same chips.

## 9. Summaries, follow-ups, small talk (§6)
- [ ] Your uploads (demo circular uploaded) → chip "Summarise this document" (recorded) → "Key points (verified) · Example UCB Circular …", coverage line "6 key points from 5 sections; 0 withheld", 6 proven points. "सारांश (Hindi summary)" → same points with Hindi under each.
- [ ] Insurance → "Summarise the policy wording" chip → 7 key points.
- [ ] Banking → the ₹40 lakh Tier 3 card → chip "Try a follow-up: what about Tier 4?" → "Answering: Can a Tier 4 UCB …", the top bar switches to Tier 4, the first question is listed above. **New conversation** clears it.
- [ ] EMI-reset at 15-Sep-2025 → "and on 15 Oct 2025?" → as-of moves to 15-Oct-2025, "may, at its option".
- [ ] Type "hi" (or pick "Say “hi”"): a help card with example questions, not a refusal.
- [ ] A summary of an unclear document (several in scope) asks "More than one document could be meant" with a document dropdown (live only).
