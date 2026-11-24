# Pinterest UI references for Proof-or-Silence (targeted pass)

Research date: 24 Nov 2026. Companion to `ui_research.md`, which had no usable Pinterest pins.

Labels used below:
- **Observed**: what I saw in the pin image or read on the pin page.
- **Inferred**: my own reading or recommendation.

Hex values are never sampled from the images. Colours are described in words, and any hex given is an approximate suggestion (Inferred).

---

## Method

**Setup.** Claude in Chrome, in a new tab I created on in.pinterest.com (logged in). I browsed and read only: no saves, pins, boards, follows or comments. I closed the tab at the end. About 43 browser actions.

**Extraction.** For each opened pin I read three things from the pin page:
- the pin ID;
- the title and description;
- the outbound "Visit site" link, as host and path only.

I zoomed into the pin image to read the layout and copy.

**Queries run** (`in.pinterest.com/search/pins/?q=…`):
- citation ui design
- ai answer with sources citations ui
- source highlight pdf viewer ui
- document comparison diff ui
- redline contract review ui
- audit log ui timeline
- compliance dashboard regtech ui
- legal tech ai ui dashboard
- contract review ai clause ui
- fact check ui design
- editorial serif web app ui
- government website india ui design
- UX4G india government design system
- hindi english bilingual app ui
- paper texture minimal web app ui off-white
- approval workflow ui maker checker
- risk alert card ui notification
- empty state ui minimal no results
- chat with pdf ui split view highlight
- ai research assistant footnotes sources panel ui
- version history compare changes ui
- document annotation comments sidebar ui legal
- timeline scrubber date range slider ui
- banking dashboard india rupee ui light
- kanban board issues severity minimal ui
- blockchain explorer transaction hash ui light minimal
- serif landing page saas legal minimal
- policy update changelog feed ui minimal
- devanagari typography ui design app
- ai uncertainty low confidence answer ui pattern

**What worked.** Concrete component words: "diff", "scrubber", "annotation sidebar", "empty state", "activity timeline", "status pill".

**What failed.** Category words ("legal tech", "compliance dashboard", "regtech", "AI uncertainty", "blockchain") returned dark neon dashboards or stock imagery. "citation ui" returned quote-card graphics (quotations, not source citations).

---

## References by screen

The format follows the brief: pin URL, original source, observed, inferred, then "Copy:".

### Ask / Answer workspace

**1. Scite Assistant: answer with a References panel**
- **Pin**: https://in.pinterest.com/pin/318277898684281208/
- **Source**: https://scite.ai/ (the pin links to the product home, not a specific page)
- **Observed**:
  - User question in a grey bubble. The answer sits in a pale-blue panel, with bracketed numeric citations inline (`[6]`, `[1]`, `[2]`) at the end of sentences.
  - A right-hand "References" panel holds cards: "Reference #1", a bold paper title, authors as blue links, journal and year.
  - Each card has a row of small count icons: mentions, a ✓ supporting count, a ⊘ contrasting count and a ? count.
  - Each card also has an excerpt paragraph and two text links: "View full text" and "Add to Dashboard".
  - The composer reads "Ask a follow up question…".
- **Inferred**: This is the closest real product to our answer and evidence split. The per-reference stance counters are what we can reuse for clause status.
- **Copy**: A right-rail card per cited clause: "Ref #1 · RBI MD-KYC §16 · p.7", then a status-pip row (IN_FORCE ●, cited-by-N answers), then the verbatim excerpt, then "Open in PDF".

**2. MindPalace "Ask a Question" (designer: Fran Milla)**
- **Pin**: https://in.pinterest.com/pin/198439927327391838/
- **Source**: none on the pin (no outbound link).
- **Observed**:
  - Warm sage/cream "paper" surfaces with black text and one orange accent: a round lightning button, plus an orange "HIGH IMPACT" tag on a card.
  - A large, light grotesk heading reads "Ask a Question_", with a typing-cursor underscore.
  - A "PAST / FUTURE →" segmented toggle sits under "Get Started".
  - Example-prompt cards have small icons.
  - The left rail holds Home / Invites / Integrations, then a dated journal list grouped by month ("JUNE 2024", "MAY 2024") with snippets.
- **Inferred**: The PAST/FUTURE toggle is the nearest visual analogue to our as-of date. The month-grouped history matches our left rail of past questions.
- **Copy**: An empty-state hero, "Ask a compliance question_", with an "As of: Today ▾ / Past date" segmented control. Below it go 3 example cards, each tagged by outcome type (e.g. "CONFLICT demo").

**3. Tidychat chat layout** (supporting, structure only)
- **Pin**: https://in.pinterest.com/pin/1027454102510639644/
- **Source**: https://www.behance.net/gallery/220040273/Search-Page-UI-Design-Clean-Intuitive-Layouts/ (the pin description credits Emre Kaya on Dribbble)
- **Observed**:
  - Left rail: "+ New Chat", a search box, then FOLDERS, then TODAY and LAST 7 DAYS groups.
  - Model picker at the top right.
  - Footer disclaimer: "Tidychat can make mistakes. Consider checking important information."
- **Inferred**: This is a generic chat layout, useful only as a left-rail skeleton. Its disclaimer is the opposite of our stance.
- **Copy**: Replace the disclaimer with a proof line: "Every sentence shown is backed by a quoted clause. Unproven sentences are withheld."

### Evidence / PDF viewer

**4. Unriddle: PDF on the left, chat on the right**
- **Pin**: https://in.pinterest.com/pin/1083326885409164996/
- **Source**: https://www.behance.net/gallery/251601621/Where-Design-Meets-Function/
- **Observed**:
  - Left pane: a scanned two-column journal page in serif type, with a "1 of 25" page counter and a "135%" zoom control.
  - Right pane: chat, with a topic dropdown ("Liquid drop model"), Share and "+ New chat".
  - Suggestions appear as orange-bulb chips.
  - The answer has a bold "Basic Concept" sub-heading.
  - The composer shows attached-context chips: a quoted excerpt chip ("In accordance with the…") and a file chip, with a character counter and "Upload files".
- **Inferred**: The quoted-excerpt chip in the composer is a cheap feature for us: select text in the PDF, then "Ask about this clause".
- **Copy**: A page counter and zoom in the evidence pane header. Selecting text in the PDF adds a "“…clause text…” · p.7" chip to the question box.

**5. "Generative Research Transcripts" / Research Analysis Tool**
- **Pin**: https://in.pinterest.com/pin/353251164540246889/
- **Source**: https://dribbble.com/shots/5438605-Research-Analysis-Tool
- **Observed**:
  - Three side-by-side columns, one per source (Brandon / Courtney / Madeleine), each with a coloured initial avatar.
  - Body text is set in a **serif**; the UI chrome is in a sans.
  - Verbatim spans are highlighted in **pale amber**.
  - The right filter rail has Sources (coloured dots), Analysis (Favorites / Comments / Hidden), Sentiment (Positive / Negative) and Emotions.
  - A toolbar sits at the top, with a "Patterns" button.
- **Inferred**: This is the best observed proof that "serif for source text + sans for UI + amber span highlight" reads calm and scholarly. The multi-column layout transfers directly to a conflict comparison.
- **Copy**: Set verbatim quotes in a serif with a pale-amber highlight on the cited span. In CONFLICT mode, show the bank policy and the RBI clause as two serif columns with headers like these.

**6. Two-page book reader (designer: Nugraha Jati Utama)**
- **Pin**: https://in.pinterest.com/pin/635429828711721220/
- **Source**: https://dribbble.com/nugrahajatiutama (profile only; no shot link on the pin)
- **Observed**:
  - Cream page background and a typewriter-mono two-page spread, with page numbers at the foot.
  - A yellow search header.
  - A vertical tool column on the right: pointer, a **translate icon (文A)**, and a highlighted "T" text tool.
  - An orange audio-player bar at the bottom.
- **Inferred**: The colour is too loud for a bank. The useful part is the small floating tool column on the document, including a translate tool.
- **Copy**: A 3-button floating tool column on the PDF pane: Select → Ask, a translate gloss toggle (EN ⇄ हिं, labelled "अनुवाद (सत्यापित नहीं)"), and Copy citation.

### Clause history / diff

**7. Draftable side-by-side document compare**
- **Pin**: https://in.pinterest.com/pin/1038853839015988675/
- **Source**: https://draftable.com/compare (a real product)
- **Observed**:
  - Two PDF panes side by side, each with its own page counter ("9 of 9" vs "10 of 11") and zoom ("125%").
  - Numbered clauses (8.1, 8.2, 8.3 … 8.7) in a serif.
  - Deleted or changed text has a **pink/red tint** on the left; inserted text has a **green tint** on the right. A changed word in the new version is boxed in blue.
  - A **change minimap** (coloured tick marks) runs down the scrollbar gutter of each pane.
  - The header reads "Document comparison powered by Draftable", with a blue Share button.
- **Inferred**: This is the real pattern for "two versions of a regulation". The minimap gutter is a cheap, high-signal addition. Swap red/green for the colour-blind-safe purple/orange already recommended in `ui_research.md`.
- **Copy**: A `RedlineDiff` with two synced serif panes, independent page counters, tinted changed clauses, a tick-mark minimap in the gutter, and the clause number kept in the left margin.

**8. Version History – Audit Log** (repinned by Ken Baldwin)
- **Pin**: https://in.pinterest.com/pin/569494315399008108/
- **Source**: https://dribbble.com/shots/23007691-Version-History-Audit-Log (already listed in `ui_research.md`; confirmed here)
- **Observed**:
  - A modal titled "Version History".
  - Major versions appear as chips on a vertical rule: `v6.0` is a black filled chip; `v5.0` and `v4.0` are grey outline chips.
  - **Minor edits between majors are bare grey dots with no chip.**
  - Each row has a one-line summary, then author · relative time ("1 hour ago", "Yesterday", "5 days ago").
- **Copy**: Clause timeline rows. Each circular gets a chip (e.g. `2024-25/17`), the current one filled. Corrigenda and minor amendments are plain dots. Each row reads "Para 5.2 amended · RBI/2024-25/17 · 01-Apr-2025".

### Conflicts board

**9. Beamline kanban: "A kanban board with limits that warn."**
- **Pin**: https://in.pinterest.com/pin/1140958886884787346/
- **Source**: https://beamline.io/
- **Observed**:
  - A dark page. The headline pairs a sans line ("A kanban board") with an **italic serif** line ("with limits that warn.").
  - Columns have counts ("Backlog 2", "Todo 3 / 6"). An over-limit column gets an **orange outline and an "Over limit" banner**.
  - Cards carry a mono ID (`ENG-231`), a title, label chips (Bug, Billing), a red "⚠ Overdue · Oct 8", a priority bars icon and owner avatars.
  - A footer stat row reads "5 columns / WIP limits / Cards", with mono sub-captions.
- **Inferred**: The structure transfers well. The italic-serif headline pairing is the strongest typographic idea seen in this pass for the pitch page. Use it in light mode.
- **Copy**:
  - Conflicts board columns: Open / Sent to checker / Bank policy amended / Closed.
  - Cards: a mono ID (`CF-012`); "Bank KYC policy §4.3 ↔ RBI MD-KYC §38"; a severity chip; "Due 15-Dec-2026"; the owner.
  - The column turns amber when an SLA is breached.

### Impact alerts

**10. Alert Components (Inara Studio)**
- **Pin**: https://in.pinterest.com/pin/339669996912429734/
- **Source**: https://dribbble.com/shots/21487667--Alert-Components
- **Observed**:
  - Two sets: "Inline" and "Toast".
  - Each alert is a soft-tinted pill: success green, "Pro tip" white with an outline, warning amber, error pink, plus a "Dark alert" variant.
  - Each has a leading circle icon, a bold title, a one-line body and a × close.
  - Toasts add an underlined uppercase "ACTION" link.
- **Copy**: An `ImpactAlertCard` as an amber inline alert: "New RBI circular affects 3 bank clauses", with an underlined "REVIEW 3 CLAUSES" action. A neutral outline variant for "No clauses affected".

### Review queue (maker-checker)

**11. "Control review" timeline** (pinned by Satvik Tolani)
- **Pin**: https://in.pinterest.com/pin/702209766938336196/
- **Source**: none on the pin.
- **Observed**:
  - A warm off-white panel titled "Control review": "Control has been successfully reviewed and ap[proved]… no additional actions needed at this time."
  - A vertical event list:
    1. "You submitted for review · week ago" (grey check)
    2. "Changes requested by **Oliver Brown** · 4 days" (orange cycle icon), with an indented comment card showing avatar, name and the comment text
    3. "You resubmitted for review · 4h ago"
    4. "Approved by **Oliver Brown** · just now" (green check)
  - An outline "Request changes" button sits below.
  - A left card shows a red-dot "Failing" status.
- **Inferred**: The vocabulary ("Control", "Failing", "evidence") suggests a GRC/compliance-automation product. That is unverified.
- **Copy**: The review detail pane exactly: submitted → returned with checker comment → resubmitted → approved. The checker's buttons are "Approve" and "Return with comment". Disable both for the maker, with "You created this item".

**12. Status pill set** (pinned by "The Dawn")
- **Pin**: https://in.pinterest.com/pin/338755203245312745/
- **Source**: none on the pin.
- **Observed**: Rounded pills with a tinted background, plus an icon and label in the same hue:
  - Pending: amber, ⚠
  - In progress: blue, dashed circle
  - Submitted: violet, send arrow
  - In review: amber, refresh-search icon
  - Success: green, ✓
  - Failed: red, ⊗
  - Expired: grey, clock
- **Copy**: The pill grammar for all statuses:
  - "Pending checker", "Returned", "Approved".
  - **SUPERSEDED** as the grey clock pill, like "Expired".
  - **IN_FORCE** as a green ✓ pill.
  - Icon + label + colour every time, never colour alone.

### Audit trail

**13. Activity Timeline (Jackie Angel)**
- **Pin**: https://in.pinterest.com/pin/350577152261051850/
- **Source**: https://dribbble.com/shots/18725094-Activity-Timeline
- **Observed**:
  - Monochrome. One sentence per event with a **bold verb**: "Stripe **completed** the payment transfer. › 27.4.2022", "Magid **triggered** the payment transfer event.", "The landlord … **connected** their bank account."
  - Small black line icons (✓✓, ✓, bank, comment) sit on a thin vertical rule.
  - An inline grey comment bubble appears under "Magid **commented**".
  - A failed event is **greyed with a × icon**: "Payment transfer **failed** due to missing connected bank account."
  - A "›" chevron after each date suggests expandable details.
- **Inferred**: The calmest audit-log style seen. It fits the paper aesthetic far better than the coloured-pill timelines in `ui_research.md`.
- **Copy**:
  - Rows like "Officer A **asked** 'KYC re-verification period for low-risk…' › 24-11-2026 14:02".
  - "Verifier **withheld** 2 sentences".
  - "Checker B **approved** answer #A-0192".
  - A right-aligned mono `hash 3f9c…a1` in each row, and "›" to open a JSON drawer.
  - A broken chain row uses the greyed × style, but in red.

### Abstain state

**14. "No data yet" filing-cabinet empty state**
- **Pin**: https://in.pinterest.com/pin/866380047090243445/
- **Source**: https://x.com/zedsxyz/status/2064640699396702396
- **Observed**:
  - A monochrome line drawing of a filing cabinet with one **drawer pulled open and empty**.
  - Title "No data yet". Grey body: "Your data will appear here once you create or import your first records".
  - One black pill button: "+ Add Data".
- **Inferred**: A filing cabinet with an open empty drawer is the right metaphor for a banker ("I looked in the file; it isn't there"). It is dignified and not an error. Tint the line art slate-blue for ABSTAIN.
- **Copy**: The `AbstainCard` hero:
  - Line-art cabinet.
  - Title: "I can't prove an answer".
  - Body: "Searched 42 RBI circulars as of 24-Nov-2026 and your bank policy. No clause supports an answer."
  - One action: "Upload the relevant policy". The nearest-clauses list goes below it.

### Clause history / as-of control

**15. Timeline scrubber (pinned by Denis Zinin)**
- **Pin**: https://in.pinterest.com/pin/16747829843373311/
- **Source**: none on the pin (from a "UI→Date & Time" board).
- **Observed**:
  - A horizontal **ruler with major and minor ticks**.
  - A grey-filled region at the left (unavailable or past).
  - A **yellow-highlighted window** between "5 AM" and "8 AM".
  - A navy vertical cursor with a dot, topped by a pill label "‹ 11:30 AM ›" with step arrows.
  - In the second state the cursor sits inside the yellow window, and the pill turns yellow with a small "?" badge.
- **Inferred**: This maps almost exactly onto the `AsOfScrubber`:
  - ticks = circular dates;
  - highlighted window = the validity range of the selected clause version;
  - pill = the as-of date with ‹ › stepping to the previous or next circular;
  - pill state change = "this date falls inside a superseded period".
- **Copy**: A ruler scrubber with a "‹ 01-Apr-2025 ›" pill. ‹ › jump to the previous or next circular. The selected clause's valid_from→valid_to range is shaded.

### Landing / pitch and overall style

**16. "Turn the evidence into a build contract." (X post screenshot)**
- **Pin**: https://in.pinterest.com/pin/245798092159744977/
- **Source**: https://x.com/Av1dlive/status/2112900538958540922
- **Observed**:
  - The content is an unrelated prompt-engineering cheat sheet; only its visual style is relevant.
  - Warm off-white paper. Bold black grotesk headline with **one phrase highlighted in pale red** ("build contract").
  - A subline with arrows: "Recover the rule → write the spec → rebuild → compare."
  - Mono small-caps section labels ("03 · RECOVER THE RULE", "06 · VALIDATE").
  - Numbered circle badges, and boxed mono steps joined by thin down-arrows.
  - Conditional steps are pale-red cards with **outlined red tags** ("ONLY IF rebuild: IS GIVEN").
  - The output vocabulary is **"CONFIRMED · INFERENCE (guess: … reason) · UNKNOWN"**, and a voice line reads "Flat. Claim, evidence, done."
- **Inferred**: This is the clearest example of the "paper + mono + one red highlight" look. The CONFIRMED / UNKNOWN vocabulary echoes our thesis.
- **Copy**: The pitch "How it works" strip, as mono-labelled boxed steps:
  - 01 · RETRIEVE → 02 · DRAFT → 03 · VERIFY EACH SENTENCE → 04 · SHOW PROVEN / WITHHOLD THE REST.
  - Highlight one phrase in the headline ("Proof **or Silence**").

**17. Law firm landing page "Localfirm" (Catalystco Studio)**
- **Pin**: https://in.pinterest.com/pin/968485094866735675/
- **Source**: https://elements.envato.com/law-firm-landing-page-MNFHWEZ (template listing)
- **Observed**:
  - A dark courtroom photo hero, "Precision Advocacy for Modern Legal Challenges", with stats "95% Client success" and "1,200+ Successful Cases".
  - Small brown underlined section labels ("About Us.", "Our Service.", "Our Advantage.").
  - Services in **numbered rows ("01. Corporate Advisory", "02. …") separated by hairlines**.
- **Inferred**: Skip the photo hero, which is too marketing-heavy. The underlined micro-labels and numbered hairline rows are useful for a restrained pitch page.
- **Copy**: Pitch sections as numbered hairline rows:
  - 01. Proven answers
  - 02. As-of time travel
  - 03. Policy ↔ RBI conflicts
  - 04. Tamper-evident audit

**18. GOV.UK Government Design Principles** (supporting)
- **Pin**: https://in.pinterest.com/pin/172122016999411960/
- **Source**: https://www.gov.uk/guidance/government-design-principles
- **Observed**: The pin card shows a plain text-first page: "Guidance / Government Design Principles", a dated "Published / Last updated" line and a numbered contents list.
- **Copy**: A "Published · Last updated" line on every clause header and answer export ("Circular dated 12-Apr-2024 · In force from 01-Jul-2024 · Viewed as of 24-Nov-2026").

**19. UX4G (India government UX design system) promo** (signal only)
- **Pin**: https://in.pinterest.com/pin/882775964473347285/
- **Source**: https://www.instagram.com/p/DPA7kENDfMb/ (social post by "a2z visualz")
- **Observed**:
  - Graphic: the Ashoka emblem, "UX4G", "India's Government", "Apps Are About To Get A Major UX Upgrade".
  - The description says the Government of India is pushing to improve its digital products.
- **Inferred**: UX4G is a better Indian reference than generic "government website" pins. I did not open UX4G itself, so check it before citing it in the pitch.
- **Copy**: Nothing visual yet. Mention "aligned with GIGW 3.0 / UX4G conventions" only after checking it.

---

## Visual direction (palette and typography actually seen)

### Palettes observed in the calm references
- **Warm off-white paper with black ink and one warm accent**:
  - MindPalace: sage/cream with orange.
  - "build contract" sheet: off-white with pale red.
  - Control review: off-white with orange and green status icons.

  This supports our planned light "paper" default. (Inferred: page around #F7F5EF, ink around #1A1A1A.)
- **Pale-amber span highlight on serif text**: Research Analysis Tool. This is the most readable verbatim-highlight treatment seen. Prefer it to the cyan seen in TalkPDF.
- **Tinted pill backgrounds with same-hue icon and text**: status pills, Alert Components. These are soft, never saturated fills.
- **Diff tints**: Draftable uses pink for removed and green for added, plus a blue box on the changed token. (Inferred: keep the tint idea, but use purple/orange for colour-blind safety.)
- **Monochrome icons on a hairline rule** for history: Activity Timeline, Version History.
- **Anti-palette (observed, across many result pages)**: "legal tech ai", "regtech", "blockchain explorer" and "ai uncertainty" searches returned mostly dark navy or black with neon blue/purple glow, 3D orbs and brain imagery. None of these fit.

### Typography observed
- **Serif for source text, sans for UI chrome**: Research Analysis Tool, and the PDF pages in Draftable and Unriddle. This confirms the plan: law text in serif, AI and UI text in IBM Plex Sans.
- **Sans headline plus italic-serif second line** (Beamline: "A kanban board / *with limits that warn.*"). A strong pitch and landing device. Inferred: "Every sentence proven. / *Or nothing said.*"
- **Mono small-caps labels and IDs**: Beamline (`ENG-231`) and the "build contract" sheet ("03 · RECOVER THE RULE"). Use IBM Plex Mono for circular numbers, clause IDs, hashes and section eyebrows.
- **Large light grotesk heading with a typing cursor** (MindPalace "Ask a Question_"). A cheap hero for the empty Ask screen.
- **Devanagari**: no in-app Devanagari UI was found. Results were posters, newspaper mastheads and app-language pickers with अ / A tiles. Inferred: the language picker's "अ | A" tile pairing could work as the EN/हिं toggle glyphs.

---

## Top 8 to copy

| # | Reference | Pin | Source | Copy into |
|---|---|---|---|---|
| 1 | Draftable compare | https://in.pinterest.com/pin/1038853839015988675/ | https://draftable.com/compare | `RedlineDiff`: synced serif panes, numbered clauses, change minimap in the gutter |
| 2 | Timeline scrubber | https://in.pinterest.com/pin/16747829843373311/ | not found | `AsOfScrubber`: ruler ticks per circular, shaded validity window, "‹ date ›" pill |
| 3 | Research Analysis Tool | https://in.pinterest.com/pin/353251164540246889/ | https://dribbble.com/shots/5438605-Research-Analysis-Tool | Serif quotes with pale-amber span highlight; two-column CONFLICT view |
| 4 | Scite Assistant | https://in.pinterest.com/pin/318277898684281208/ | https://scite.ai/ | Answer with `[n]` markers plus a right-rail reference card holding a status-counter row |
| 5 | Activity Timeline | https://in.pinterest.com/pin/350577152261051850/ | https://dribbble.com/shots/18725094-Activity-Timeline | `AuditTimeline`: bold-verb sentences, mono icons, greyed × failure row, plus a hash column |
| 6 | Control review | https://in.pinterest.com/pin/702209766938336196/ | not found | Maker-checker detail: submitted → changes requested (comment) → approved |
| 7 | "No data yet" cabinet | https://in.pinterest.com/pin/866380047090243445/ | https://x.com/zedsxyz/status/2064640699396702396 | `AbstainCard` hero: open-empty-drawer line art in slate-blue, one constructive action |
| 8 | Beamline kanban | https://in.pinterest.com/pin/1140958886884787346/ | https://beamline.io/ | Conflicts board (mono IDs, SLA-breach column banner); sans + italic-serif pitch headline |

Runners-up:
- Unriddle's quoted-excerpt chip in the composer (#4).
- The Version History major-chip / minor-dot rule (#8).
- The status pill grammar (#12).
- The "build contract" paper sheet for the pitch's how-it-works strip (#16).

---

## Gaps

- **No withheld-sentence UI.** No pin showed sentences struck out or withheld, or a per-sentence verified/rejected state. This remains our own design, which is good for novelty but has no visual precedent to borrow.
- **No pins for these patterns:**
  - an in-app hash-chain or "verify chain" view (the "blockchain explorer" queries returned only dark crypto dashboards);
  - an RBI- or Indian-bank-specific compliance UI;
  - an in-app bilingual Hindi/English data UI (only language pickers, posters and newspapers).
- **Regtech, compliance dashboard and legal-tech queries** were dominated by generic finance dashboards or dark neon "AI" shots. I recorded none of them.
- **Missing original sources**: 4 of the 19 pins had no outbound link (MindPalace, the timeline scrubber, Control review, status pills). The book reader links only to a designer profile; UX4G and the "build contract" sheet link to social posts.
- **Not verified**: I did not open any outbound Dribbble, Behance or product page. Observations come from the pin image and the pin page text only.
- **Pin IDs are not guaranteed stable**: Pinterest re-ranks results, so the same queries may surface different pins later.
- **Clicks that did not open a pin**: "Gazette news reader app" (editorial search), the "LAW" editorial landing page and the "मातृभूमि" masthead were seen in results but not opened. One click on the masthead after a back-navigation landed on the wrong spot, and that pin was not opened.
