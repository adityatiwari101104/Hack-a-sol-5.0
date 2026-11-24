# Proof-or-Silence UI: design notes

Each screen below names the research reference that shaped it. Sources:
- **NS**: `reports/Proof or Silence next steps.md` (the UI section and both 24 Nov addenda)
- **UR**: `research_notes/Proof or Silence next steps/ui_research.md`
- **MB**: `ui_mobbin_flows.md`
- **PN**: `ui_pinterest_refs.md`
- **CP**: `chatpdf_landscape_and_showcase.md` (the Backend→UI showcase map and the 3-minute storyboard)

## Principles

| Rule | Why (source) |
|---|---|
| Only verified text is ever animated. While the request runs, stage names pulse. When the answer arrives, placeholder rows ("Verifying sentence 2 of 3…") resolve one by one into proven sentences. | NS: streaming the draft in grey would put unverified text on screen. CP: "Never stream draft text". |
| An abstention is shown as a correct outcome. It uses a slate-blue card, never red. | NS "dignified, designed state"; MB 3a (Intercom Copilot); PN #14 (filing-cabinet line art). |
| Every outcome badge has an icon, a label and a colour. | UR Q4 (WCAG 2.1 AA). |
| Validity sits on the citation itself: a solid green pip for in force, a hollow struck-through grey pip for superseded. | UR Q1 (KeyCite / Shepard's flags); NS move 2. |
| One global as-of date drives answers, timelines, conflicts and impact. | NS move 4; UR F. |
| Paper, slate and one ink-blue accent. Hairlines, a 6 px radius, no gradients or glass. Light by default with a dark toggle. | NS style paragraph; PN "Visual direction"; avoid list: "dark neon regtech". |
| Type: IBM Plex Sans + Plex Sans Devanagari for the UI, Plex Serif for verbatim law text, Plex Mono for IDs and hashes. Tabular numerals throughout. | NS; UR Q4; PN typography (serif for source text, sans for chrome). |
| Quote highlights are pale amber. Diffs are purple (bank / inserted) against orange (RBI / deleted), and always carry strike or underline, never colour alone. | PN #3 (Research Analysis Tool); NS (eCFR purple/orange). |
| Dates are DD-MMM-YYYY. Rupees use Indian grouping (₹25,00,000). | UR Q4 banker conventions. |
| `prefers-reduced-motion` turns every animation off. Hover cards also open on focus. | NS; UR Q4. |
| No footnote-only source lists. Every sentence carries its own chips. | NS addendum "Avoid" (Grok "Key Citations"). |

## Screens

1. **Ask / Answer workspace** (`pages/AskPage.tsx`): three panes (rail · answer · evidence), the hero screen of the storyboard.
   - **Top bar:** an as-of chip whose popover has a ruler of circular dates (PN "timeline scrubber") plus the recorded presets; a segmented bank-profile control; EN/हिं (GIGW 3.0: prominent language switch). The context chips are repeated inside the composer (MB 5a Granola).
   - **"Viewing law as of … · Back to today" bar**: MB 5d (Lovable "Viewing: version · Back to latest").
   - **Proof Meter** "drafted → passed (%) → shown · withheld" with a segmented bar: NS move 1; CP #4. It is the honest faithfulness from `faithfulness{}`, not the tautological 100%.
   - **Provenance line** "n quoted clauses from n documents · n evidence · as of · s": MB 1b (ChatGPT provenance line).
   - **Sentence rows** with citation chips (doc · clause · page · pip), a hover/focus card holding the verbatim quote in serif with its validity dates (UR Q1, the three-step funnel), and **five check badges** (ids · in force · quote · numbers · support) with the support model named ("HHEM-2.1 0.71", "AI judge (3rd tier)"): CP #1 and its honesty note. The badges use the backend's `badges` when present and are otherwise derived from `checks`.
   - **Draft 1 / Draft 2** tags and a repair line: CP #3.
   - **Withheld (n) tray**: struck text, the reason in plain words, the badge row showing which gate failed. NS move 1 ("show the negative space"); MB 3 (per-row ✓/⚠ with footer count).
   - **ABSTAIN card**: where I looked (sub-queries), why I stopped (gate + similarity), what would unblock it, and "n nearest clauses (not sufficient) →". MB 3a Intercom; PN #14 cabinet line art; UR Q2. The gold-loan question adds the injected-text tile (CP #20).
   - **PARTIAL gap rows** (dashed): UR Q2 "PartialGapRow"; CP #12.
   - **Calc card**: result, input chips, formula, amortisation table, "Computed by code (Python Decimal)", and the hypothetical-arithmetic flag. UR A7; CP #13.
   - **Conflict card**: two columns (bank purple / RBI orange), deciding terms underlined, a verdict line, "Open both pages side by side". UR Q2; PN #3; CP #14. RBI-vs-bank conflicts are listed before bank-vs-bank ones.
   - **Then vs now strip**: changing the as-of date (or tier) re-asks, and the previous and current first sentences are shown with the deciding words marked. CP storyboard 1:10 (EMI reset: "shall" → "may, at its option").
   - **Rules checked by code**: R1… with APPLIES / DOES NOT APPLY and the compared facts as chips (CP #9).
   - Actions: copy with citations, print evidence pack (print CSS), flag as wrong (`POST /incidents`; UR Juristify "flag-as-wrong").
   - **Rehearsed-questions picker**: all 80 recorded gold questions, each with its recorded date and profile, so a demo never misses the cassette (NS "rehearsed questions mode"). A replay miss shows a calm card listing the dates that are recorded.
2. **Evidence viewer** (`components/Evidence.tsx`, `PdfView.tsx`): tabs Evidence (n) · Withheld (n) · Audit entry (MB 1a ChatGPT sheet plus a third Withheld tab).
   - A metadata key-value panel (MB 6d Intercom Details), the breadcrumb and inherited lead-in in grey, then the quote in serif with an amber mark (PN #3).
   - react-pdf 11 page with merged line boxes from the citation `bboxes`. They are scaled by `/documents/{id}/pages` width (pdf.js size as fallback), pulsed once, and scrolled into view (NS technical note).
   - A "page-level match" fallback when no boxes exist (UR Q1, Glean's honest fallback); no box is ever faked.
   - The Audit tab shows the row hash, the corpus hash and "what left this machine" (the egress manifest, CP #10).
3. **Pipeline X-ray drawer** (`components/Xray.tsx`): numbered stages tagged OpenAI / local model / code, with per-stage `timings` bars and expandable payloads: plan, case facts, premises, support tiers used, the gate that failed. MB 4 (Rox step header, Perplexity status lines); CP #19. It says "replayed from recorded model calls" in replay mode (CP honesty note).
4. **Clause history / diff** (`pages/HistoryPage.tsx`): a version card per version (MB 6a Plane checkbox list), a "Comparing v1 vs v2" strip, two synced serif panes with struck/underlined tints and a change minimap between them (PN #1 Draftable), and the RBI footnote that proves the change. A rulebook timeline below has the as-of cursor (legislation.gov.uk point-in-time, NS).
5. **Conflicts board** (`pages/ConflictsPage.tsx`): columns Conflict / Needs review / Different condition / Supersession with counts, mono IDs (CF-001), an amber banner on the conflict column, and a click-through modal with the side-by-side card and PDF. PN #9 (Beamline).
6. **Impact alerts** (`pages/ImpactPage.tsx`): an amber inline alert "<circular> affects N bank clauses" with an underlined "REVIEW N ITEMS" action (PN #10, Inara alerts). Items carry both quotes, a severity, effective-for, condition chips and the AI fix as a redline labelled DRAFT. Switching Tier 3 ↔ Tier 4 marks the clauses the tier switch puts in conflict (CP #15, storyboard 1:35). Export .md.
7. **Review queue** (`pages/ReviewPage.tsx`): tabs with counts (To decide · To sign off · Signed off), ⚠ on conflicts, and status pills (MB 7a Deputy). The detail shows both quotes, the DRAFT fix and a submitted → decided → signed-off lifecycle (PN #11 Control review). "Acting as" switches maker and checker. Self sign-off is disabled with "You made this decision". "Try anyway" shows the server's own 409, so judges see it is enforced, not cosmetic (CP #16).
8. **Audit trail** (`pages/AuditPage.tsx`): a monochrome vertical timeline. Each row is a sentence with a bold verb ("System **answered** '…' → ANSWER") plus a mono `prev → row` hash column (PN #13 Activity Timeline; MB 6e Discord row grammar). Event-type filters. "Verify chain" ticks rows in turn, then shows the server verdict. Dev Tamper/Restore turns the chain red at the first bad row (CP #17). Expanding a row shows its JSON.
9. **AI governance** (`pages/GovernancePage.tsx`): an upfront disclosure that the organiser allowed OpenAI; live tiles (kill switch = replay mode, spend vs cap, audit chain, corpus hash); the model inventory; the seven FREE-AI sutras and six pillars, each mapped to a concrete feature with a "See it →" link; known limits, stated. CP F4; saas_landscape §3; backend_gaps Q4 ("FREE-AI-aligned", not certified).
10. **Rule simulator** (`pages/RulesPage.tsx`, extra): `POST /rules`, code only, 0 model calls. Slide ₹40 → ₹80 lakh or flip the tier and the findings change live (CP F2).

## Judge-report alignment (reports/Banking judge critique and evals.md)

- **Demo order:** the landing and the one-click chip row under the composer follow the report's order:
  1. Withheld tray (q028)
  2. As-of switch (q022 / q023)
  3. Conflict (f025 / f022)
  4. Citation chip with lead-in (q001)
  5. Refusal (r08, q052)
  6. Calculation (q018, r05 hypothetical)
  7. Audit verify, which stays off the landing until the chain is re-anchored
- **Free text is marked as live:** a typed question that is not recorded shows "Live question · not recorded" and the button reads "Ask live".
- **Hindi and upload are not presented as working:** Hindi questions sit in the picker under "answer comes back in English", and there is no upload control.
- **Numbers are the report's §7 safe set only:** 88.6% (CI 81.5–93.2), 0 hallucinated and 0/375 fabricated, 3.6% vs 10.6%, 19/19, P 0.93 / R 0.81, plain RAG 50% / 10-of-22, ≈ ₹0.38. There is no "100% faithful" anywhere; the guarantee is worded "no unverified sentence is shown". The Proof Meter says "x of y passed every check" rather than a percentage.
- **Audit:** a disclosed re-link (`rechain`) and any archive/genesis marker row render as an honest banner plus a divider row in the timeline.

## Landing page and graphs (research_notes/Proof or Silence next steps/landing_page_research.md, "LP")

The landing page is the default route (`#/`), with no app shell; the app starts at `#/ask`. Its section order follows LP §2.

| Section | Reference that drove it |
|---|---|
| Floating translucent nav bar (rounded, backdrop blur), segmented EN/हिं, pill "Open the demo" | `landing_hero_inspection.md`: LandingAI's floating nav and Glean's pill CTAs, plus the user's iOS/macOS request |
| **Hero v2 (replaces the reading-room hero, at the user's request)** | `landing_hero_inspection.md`. A sans headline "Every sentence, proven." with an italic-serif second line "Or nothing said." (LandingAI, Reducto). A faint hairline grid behind it (Extend). Two pill CTAs. A macOS search field that cycles through the recorded storyboard questions and opens the demo on click. |
| **`StickGraph`: interactive 3D stick graph of the real corpus** | The user asked for "an interactive graph made of sticks"; the corner-bracket frame follows Graphify. Details below the table. |
| Stats row under the hero (88.6% · 0/375 · 19/19 · ≈₹0.38) | The judge report's safe numbers, laid out as the Graphify/Glean stat row; it replaces the mono ticker. |
| "Every sentence has to earn its place" | LP §2 row 3. The recorded draft resolves sentence by sentence into ✓ + chip or struck + reason; no unverified text is ever unmarked. |
| **"The law, as of any date": `AsOfClauseGraph`** | LP §5a and its precedents (Graphie hover-for-text, Neo4j Bloom ▶ play, SSO timeline): swimlanes, a piecewise time axis with 2014–22 compressed, node states, edges that draw in, conflicts only while both ends are in force, presets, keyboard stepping, an aria-live caption and a "View as table" toggle. Clicking an edge shows its own verified quote. |
| "Your policy, against the regulator" | LP §3 conflict card: Retail Loan Policy 7.4 vs RBI ¶261(1), real quotes, reusing the app's `ConflictCard`. |
| How it works: 5 numbered chapters | LP ref "Linear" (lifecycle chapters), plus the Zep Graphiti line "nothing is deleted". The jaali line-art watermark at 7% opacity is LP §4 C and ref 14. |
| Numbers table with footnotes | LP §3 numbers block, the judge report's safe set. |
| "A record no one can quietly edit" | LP §5b(d) local simulation: 8 blocks hashed with real SHA-256 in the browser. Tamper turns #5–#8 red; Restore fixes them. |
| Built for a Tier 3 UCB · CTA · footer disclaimer | LP §2 rows 9–10 and the LP §3 footer text. Hindi is described as "questions understood, answers in verified English", per the judge report. |

**`StickGraph` details:**
- **Data:** 22 document hubs (RBI ring above, Example UCB ring below) and 173 clause satellites. The sticks are real: contains, 61 REFERS_TO, 2 AMENDED_BY, 6 WITHDRAWS, plus the CONFLICT pairs from `contradict.scan` at the chosen date.
- **Interaction:** drag to rotate; hover or select a node for a frosted popover with its verbatim text; the graph pauses while a node is in focus. A segmented control sets the as-of date: 01-Apr-2024 has 4 RBI texts in force and 0 conflicts; Today has 9 in force and 27 conflicts.
- **Build:** canvas 2D with a hand-written perspective projection; no 3D library. The fixture is `src/data/corpus-graph.json`, exported from a read-only database copy. Clauses whose PDF text extracted as garbled Devanagari were dropped.

**Controls (iOS/macOS, at the user's request):**
- the system font for chrome;
- 8 px rounded buttons with a filled accent primary and an iOS grey-fill secondary; pill CTAs;
- segmented controls with a white thumb on a grey track;
- grey-fill inputs with a 3.5 px focus ring;
- a translucent app toolbar and popovers with a 14 px radius.

Verbatim law text stays in serif and IDs stay in mono. Reference sites inspected in the browser (Graphify, Reducto, Extend, Hebbia, LandingAI, Glean): `research_notes/Proof or Silence next steps/landing_hero_inspection.md`. No assets were copied; every illustration is our own.

### Dashboard graphs (LP §5b)

| Graph | Where | Built from |
|---|---|---|
| **Conflict map** (bipartite: RBI clauses by subject ↔ bank clauses by document) with a **Matrix** toggle (subject × bank document, worst verdict) | Conflicts → Map | GET /conflicts |
| **Impact graph** (circular → obligations with counted groups, LP ref 15 → bank clauses with a review-state badge; top 30 by severity) | Impact alerts → Graph | POST /impact (idempotent, stored fixes) |
| **Hash-chain strip** (last 12 rows as linked blocks; snapped red links at a break; dashed genesis block) | Audit trail | GET /trace, verify-chain |
| **Provision timeline** (version bars, hatched when superseded, ✕ at the end of validity, ◆ amendment marker, as-of cursor; click a bar to compare) | Clause history | GET /provisions/{id}/timeline |

**Deviations from LP, and why:**
- LP §6 recommends `@xyflow/react` + `@dagrejs/dagre` for the conflict map and impact graph. Our layouts are fixed columns with fewer than 120 nodes, so they are hand-written SVG, for the same reason LP §5a gives for the landing graph: stable positions and exact paper styling. No graph library was added.
- The hero image is drawn as an SVG illustration of LP §4 direction A (window light through shutters, teak table, buff folders, ink-blue ledger), not a stock photo. That avoids licence tracking (LP "Gaps": no final asset chosen) and follows the theme (dusk in dark mode). A licensed photo can replace `ReadingRoom.tsx` later.
- LP §5 notes there is no `GET /graph` endpoint. The landing graph therefore uses a static fixture, `src/data/landing-graph.json`, exported once from a read-only copy of the database. Its conflict snapshots at each event date come from the same `contradict.scan` code that `GET /conflicts` uses. The hero and "earn its place" text is the recorded q028 answer (`src/data/hero-answer.json`). The landing page makes no live calls.

## macOS glass controls and paper texture (user review, Apple HIG "Buttons")

Buttons follow the HIG push button, as Liquid Glass renders it:
- **Primary:** an accent fill under a specular sheen (bright upper half, a hard break at 50%), a 0.5 px light rim on top, a darker hairline below, and a soft contact shadow.
- **Secondary:** raised white or graphite with the same sheen.
- **Pressed:** the button sinks (inset shadow, 0.985 scale).
- **Segmented controls:** a recessed track with a glossy raised thumb. The iOS switch has a glossy knob.

There are no frosted blur panels. Pages carry a static paper grain (an inline SVG noise filter plus a faint laid-line), tuned separately for dark mode.

## "The law, as of any date", redesigned (`LawOverTime`, replaces the swimlane graph)

User review: the swimlane "does not solve the purpose of understanding by a glance". The section is now three plain questions, one row each:
- Can a UCB charge for pre-paying a floating-rate loan?
- At an EMI reset, must the lender offer a switch to a fixed rate?
- Is our Retail Loan Policy 7.4 allowed?

How each row works:
- **Bar:** a thin bar for each text that governed the question. The governing text is highlighted, and the bank clause is hatched red where it conflicts.
- **Readout:** says in one sentence what applied on the chosen date and quotes the clause verbatim, with its lead-in.
- **Date control:** one cursor across all rows, moved by a slider, by clickable milestones, or by "Play 2023 → today".
- **Smooth motion** (user: "the progress transition should be smooth"): the cursor glides with easing, play sweeps at a constant visual speed, bar highlights fade, and readouts crossfade. All of it is instant under reduced motion.

Data comes from `landing-graph.json`. The Pre-payment Directions and 2014-circular quotes are their operative clauses (5(i) and "banks will not be permitted…"), not the letterhead.

## Plainness rules (user review: "remove the vibecoded elements")

Removed everywhere:
- tinted, filled pills and badges (outcome, verdict, status, source type, tags, counts);
- coloured left-rule tinted callout panels (the "Your bank says / RBI says" boxes, abstain, gap, alert, disclosure, as-of bar);
- UPPERCASE letter-spaced micro-labels;
- underlined "key terms";
- icon-prefixed headings;
- rows of five filled check chips, now one quiet line: "✓ All five checks passed", or "Failed at …", with the details in the tooltip;
- the radial glow behind the hero.

What carries hierarchy instead: type weight, hairlines and spacing. Colour stays only as text colour where it means something (in force, withdrawn, conflict, withheld). Conflict cards are two plain columns divided by a hairline. Verbatim quotes keep their serif and the amber evidence mark.

## Hero graph: build-up in phases (user: "one by one … so the judge understands")

`StickGraph` assembles itself in five captioned phases on first view:
1. RBI documents appear and close into a ring polygon.
2. The bank's documents form a second ring, strutted to the first, so the whole corpus reads as one wireframe solid.
3. Their clauses.
4. Amendments and withdrawals draw in, and withdrawn texts fade.
5. The 8 RBI-vs-bank conflicts.

Sticks draw in from one end and nodes scale in. A stepper lets anyone jump to a phase (stopping at phase 3 gives the simplest view) or replay it. Under reduced motion it starts complete.

The default view is compact: the 22 documents, only the clauses that are conflict or amendment endpoints (plus two per document), and RBI-vs-bank conflicts only. "Show all links" (an iOS switch) adds the 61 REFERS_TO links and the 19 bank-vs-bank inconsistencies.

## Backend final pass (docs/API_CHANGES.md), as wired

| Field / endpoint | UI |
|---|---|
| `POST /ask/stream` | Used when present. Live stage labels plus "checking sentence n of m: x verified · y withheld" (verdicts only, never text). Falls back to `/ask`; 503/429 errors are shown. |
| `premise_check[]` | The first contradicted / not_found item is the answer's first line. |
| `notices[]` | One plain line above the answer. |
| `query_class` | A one-line note for task_request, meta_instruction, profile_mismatch, bad_input and general_question. |
| `needs[]` + `needs_info` | A fill-in card (segmented choices or a date/number field) that re-asks the same question with `slots`. |
| `flagged_sources[]` | "n passages looked like an instruction to the AI and were not used". This replaces the old hard-coded gold-loan tile. |
| `confidence.level == "low"` | A note under the Proof Meter. |
| `citations[].lead_in_used / ocr / uploaded` | Notes in the citation hover card. |
| `sentences[].text_hi`, `translation` | A Hindi line under each verified sentence, labelled as a machine translation (waits for API_CHANGES §3). |
| Upload (`POST/GET/DELETE /documents`, status) | Client code is in place (`api.upload`, `docStatus`, `deleteDoc`); there is no screen yet, pending the API_CHANGES write-up. |

## Layering and backend status

- **Popovers:** every popover (as-of date, recorded-questions picker, citation hover cards) uses one `Popover` component. It renders in a portal on `document.body`, is positioned against its anchor, flips above or below and shifts to stay inside the viewport, re-positions on scroll and resize, and closes on Esc or an outside click.
- **One z-index scale** (`tokens.css`): `--z-raised` 4, `--z-header` 40, `--z-drawer` 60, `--z-popover` 80, `--z-toast` 90, `--z-tooltip` 100. Page content never goes above `--z-raised`.
- **The bug this fixed:** the translucent top bar uses `backdrop-filter`, which creates a stacking context, so its as-of popover was painted under the question composer.
- **Backend status banner:**
  - for the first 45 s of failed `/health` checks, "Connecting to the backend… loads its local models, about 15 seconds", polling every 2 s;
  - after that, "The backend is not running" with the exact start command, Copy, and Retry;
  - feature detection re-runs when the backend first answers.
- **Start-up:** `npm run dev:all` (`scripts/dev-all.mjs`) starts the replay API and Vite together without touching backend code.

## Responsive

- **≥ 1440 px:** full rail with recent questions.
- **≤ 1280 px:** the rail collapses to icons and the evidence pane takes 42%.
- **≤ 980 px:** the evidence pane stacks under the answer.
- Print hides the chrome and keeps the answer, the withheld tray and the rules (the evidence pack).

## Degrades gracefully when the backend lacks a field

| Missing | What the UI does |
|---|---|
| `timings` | The X-ray shows counts and says timings need the field. |
| `badges` | Badges are derived from `checks`. |
| `/documents/{id}/pages` | Page size comes from pdf.js. |
| `GET /trace` | The audit timeline is rebuilt from this session's query ids. |
| `/dev/tamper` | The buttons are hidden; a 404 says to restart with `DEV_TAMPER=1`. |
| `/rules` | The simulator shows an empty state. |
| `translation` (Hindi answers) | The Hindi toggle switches the UI labels only and says the answer stays in verified English. |

## Uploads, domains and the real-answer pass (docs/API_CHANGES.md §3–§5, docs/DEMO_SCRIPT.md)
- **Domain switch** (top bar): Banking (RBI) · Insurance · Your uploads. Banking is the default. Insurance sends `collection=insurance` on `/ask` and `/conflicts` and hides the bank profile; Your uploads sends `upload_ids` (and the uploads' collection). Switching domain puts the current answer away (it stays in Recent); a recorded question sets its own domain.
- **Upload dialog** (`components/Upload.tsx`): file (drop or choose), document type as five labelled radio cards (the type decides what it is checked against, so each says so), optional title and in-force date, a plain note on redaction and the audit chain. Client-side checks mirror the server's 415/413 limits; 403/400/409/duplicate/failed each get a sentence and a next step.
- **Progress**: the server reports stages; the UI ticks only stages reported done, 160 ms apart, so a 1-second ingest is still readable (the "animate only verified content" rule). OCR is shown only when pages were OCR'd. Counts drop "conflicts found" (it counted every flagged pair) in favour of the report's de-duplicated "n conflicts with documents in force", so the dialog never shows two different conflict numbers.
- **Report**: links as "Clause 1 refers to Retail Loan Policy §7.4" with the quote; conflicts reuse `ConflictCard`, which now names sides "Your upload" / "Your bank" / "RBI, in force", or by document title when neither side is RBI (insurance endorsement vs claim FAQ). Value-only tuples read "says 36 months" instead of "n/a".
- **My uploads** (`#/uploads`): a table with a "Use in answers" checkbox, Ask, Report, Delete (inline confirm, then what was removed). Demo sets the API lists as uploads are filtered out (they are read-only).
- **Citations** from uploads carry an "uploaded" tag, OCR text an "OCR" tag (plain text after a hairline, not a pill).
- **Recorded questions**: added the insurance and upload questions from `eval/demo_extra.jsonl` and a "Trick questions" group from `eval/redteam.jsonl` (r01, r10, r11, r15, r18, r20), each replay-checked. The bank-profile control shows "Commercial bank" only when r18 sets it.
- **As-of bar**: 24-Nov (the real today, when the insurance/upload answers were recorded) is not shown as time travel; the banking recordings stay pinned to 23-Nov.

## Landing hero, de-crowded (user review: "text on left side … too crowded")
Six stacked blocks became five with more air: sentence-case eyebrow (all-caps tracked labels break the plainness rule), headline tracking loosened from −0.035em to −0.022em and slightly smaller, a two-sentence paragraph capped at 30em, and the second search box replaced by one quiet "Try a recorded question, $0: …" line (the CTA already opens Ask).
