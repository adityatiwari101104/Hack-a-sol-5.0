# UI/UX research: Proof-or-Silence, a citation-verified, contradiction-checking compliance Q&A product

Research date: 23 Nov 2026. Method: Claude in Chrome (a new tab of my own, browse/read only, closed when done) on Dribbble, Behance, Pinterest, Mobbin, Godly and Land-book, plus web search and fetches of vendor help docs. Each "Cited Findings" bullet is something I observed or that a source states. Each "Inferences" bullet is my own design recommendation.

Access notes, observed:
- **Dribbble**: the reachable Chrome profile was not logged in, but shots are public, so I could still read them.
- **Pinterest**: logged in (in.pinterest.com). Results for UI-pattern queries were generic AI-chat mood images, mostly re-pins of Dribbble.
- **Mobbin**: the search URL redirected to the logged-out marketing home page (https://mobbin.com/), so no Mobbin flows could be inspected.
- **Godly**: godly.website redirected to recent.design.
- **Land-book**: search returned no extractable results.
- **Behance**: public pages, readable.

---

## Q1. How do leading products present citations and verification?

### Takeaway
The industry standard is a three-step "progressive disclosure" of evidence:
1. **Inline marker**: a number or chip next to the sentence.
2. **Hover/tap preview**: the quoted passage, with surrounding context greyed out.
3. **Click-through**: the source opens in a side pane, scrolled to the passage and highlighted.

The best products add a validity signal on each citation (Shepard's/KeyCite flags in legal tools) and say openly when a citation could not be pinned down. None of the products surveyed shows the user which sentences were *withheld* by a verifier. That is Proof-or-Silence's opening.

### Cited Findings
**Hover previews and click-through to the passage**
- NotebookLM citations are direct quotes from sources. Hovering a citation shows the full quoted text, and clicking opens the source at that passage. — [Google NotebookLM Help](https://support.google.com/notebooklm/answer/16179559?hl=en); [Google NotebookLM Help](https://support.google.com/notebooklm/answer/14276569?hl=en)
- **Glean** (official developer guide):
  - The citation popover shows the snippet highlighted, with the text before and after it muted/grey, plus a page number when one is available.
  - Deep-linking appears only "when the LLM confidently matches a snippet". Otherwise the citation falls back to document level. — [Glean Developers: Deep Linked Citations](https://developers.glean.com/guides/chat/deep-linked-citations); [Glean docs](https://docs.glean.com/user-guide/assistant/glean-chat/glean-chat-citations/deep-linked-citations)
- **Glean wording conflict**: Glean's marketing page claims sentence-level citations, which is broader than its docs describe. — [Glean perspectives](https://www.glean.com/perspectives/top-ai-assistants-for-accurate-source-citations)
- **Adobe Acrobat AI Assistant**:
  - Each response section carries clickable citations with metadata: doc title, section, page.
  - Multi-citation links open a reference list and jump to the cited section, with the document name and page highlighted.
  - Adobe warns that attributions can occasionally be wrong. — [Adobe Help: View citations](https://helpx.adobe.com/sg/acrobat/desktop/explore-pdf-spaces/view-citations.html); [Adobe gen-AI guidelines](https://helpx.adobe.com/gr_el/acrobat/using/gen-ai-user-guidelines.html)
- **AlphaSense**:
  - Cites the exact snippet behind each answer, then runs "a subsequent evaluation to confirm that each cited snippet contains supporting information". This is a post-hoc verifier, similar to ours.
  - Selecting a summary opens the source document with the passage highlighted, beside a condensed answer view.
  - Citations survive copy-paste into email and documents. — [AlphaSense blog: combat hallucination](https://www.alpha-sense.com/blog/product/combat-generative-ai-hallucination/); [AlphaSense Help](https://help.alpha-sense.com/hc/en-us/articles/41666587181203-Interacting-with-Generative-Search)

**Panels and grids (Harvey, Hebbia)**
- **Harvey**:
  - Sources panel redesign (Nov 2025): source icons, in-panel search, and sources that follow the current thread view.
  - Clickable .docx citations jump to highlights in the source document, with resizable answer and document views.
  - Review tables gained sentence-level citations (Apr 2026). — [Harvey release note: improved sources](https://eu.help.harvey.ai/release-notes/improved-sources-experience); [Harvey: in-document citations](https://help.harvey.ai/release-notes/in-document-citations); [Harvey Review Tables](https://www.harvey.ai/platform/review-tables)
- **Hebbia Matrix** is a grid of documents × questions. Clicking a cell shows where in the document the answer came from, plus a step-by-step breakdown. Citation previews show source data "without disrupting your workflow". This comes from a third-party profile and vendor release notes; I could not inspect the actual highlight rendering. — [Contrary Research: Hebbia](https://research.contrary.com/company/hebbia); [Hebbia Disclosure Dec 2025](https://www.hebbia.com/blog/the-disclosure-december-2025)

**Validity signals on citations (legal research)**
- **Lexis+ AI**:
  - Every citation is checked against Shepard's, and citations that cannot be linked are flagged for manual validation.
  - Since Aug 2025, an orange "at risk" indicator marks cases that relied on later-overruled law.
  - Lexis tells users to treat linked citations as the *start* of research, not its conclusion. — [LexisNexis: citation integrity](https://www.lexisnexis.com/community/insights/legal/b/thought-leadership/posts/legal-ai-citation-integrity); [LexisNexis Aug 2025](https://www.lexisnexis.com/community/amp-insights/82/how-lexisnexis-is-building-trust-in-ai-for-legal-research-with-shepard-s-citation-validation-enhancements)
- **Lexis "hallucination-free" claim disputed**: Lexis's own "hallucination-free" marketing was disputed by a Stanford-affiliated study. — [arXiv 2405.20362](https://arxiv.org/html/2405.20362v1)
- **Thomson Reuters CoCounsel / Westlaw AI-Assisted Research**:
  - Answers carry hyperlinked inline citations with bracketed reference numbers, plus KeyCite flags. Yellow means negative treatment; red means no longer good law on at least one point.
  - Deep Research "Verify" re-checks a generated report against authority. — [TR Help: AI-Assisted Research](https://thomsonreuters.com/en-us/help/cocounsel/skills/ai-assisted-research); [TR blog: Deep Research](https://legal.thomsonreuters.com/blog/what-is-deep-research-the-ai-research-assistant-that-thinks-like-a-legal-expert/); [TR: "If you can't verify it you can't sign it"](https://www.thomsonreuters.com/en-us/posts/innovation/if-you-cant-verify-it-you-cant-sign-it/)

**Per-sentence verification colours (Gemini)**
- Gemini "Double-check response" highlights *individual statements*:
  - **Green**: Search found similar content.
  - **Orange**: Search found different content or nothing relevant.
  - **Unhighlighted**: not enough information, or not a factual claim. — [Google Gemini Help](https://support.google.com/gemini/answer/14143489)

**Stance labels: supporting vs contrasting (Scite, Consensus, Elicit)**
- **Scite Smart Citations** label each citing statement *supporting / contrasting / mentioning*, show the sentence in context, show confidence, and let users flag errors. — [scite.ai](https://scite.ai/); [JMLA review](https://jmla.pitt.edu/ojs/jmla/article/view/1331/1396)
- **Consensus Meter** aggregates per-paper *yes / no / possibly* for yes/no questions, with verbatim passages shown for each label. — [Consensus blog](https://consensus.app/home/blog/introducing-the-consensus-meter/)
- **Elicit**: clicking an extracted answer shows the supporting quotes. "High accuracy" columns mark confident vs uncertain answers and explain how the quotes led to the answer.
  - An independent study found weak quote matching (10%). — [Elicit support: High Accuracy Columns](https://support.elicit.com/en/articles/597825); [EcoEvoRxiv evaluation](https://ecoevorxiv.org/repository/object/9909/download/18365)

**Answer-engine chips (Perplexity, ChatGPT)**
- **Perplexity**: superscript numbered markers, plus a hover card (title, domain, date, excerpt) and a sources list/panel. Teardowns disagree on whether the panel is a right rail or a top carousel; the layout has changed over time. — [ai-design-patterns teardown](https://ai-design-patterns.pages.dev/teardowns/perplexity/how-output-and-refinement-work); [aiuxplayground teardown](https://aiuxplayground.com/teardowns/perplexity/citations)
- **ChatGPT**: publisher chips, claim popovers with 1/N paging, and a Sources sidebar (per aiuxplayground). — [aiuxplayground: citations pattern](https://aiuxplayground.com/pattern/citations)

**Citation data shape (Claude API)**
- Claude's citations API returns a `cited_text` plus a location: character range (text), page (PDF) or content-block. Responses are split into text blocks, each a claim with its supporting citations. This maps 1:1 to "sentence + quote + page" UI. — [Claude docs: Citations](https://platform.claude.com/docs/build-with-claude/citations)

**Pattern libraries and research**
- **Shape of AI "Citations" pattern**:
  - Variants: inline highlights (best for PDFs), direct quotations, multi-source references, lightweight links.
  - Guidance: match specificity to intent; offer a hover preview plus a click-through; "make broken or missing citations explicit".
  - Pitfalls: citations lend *unearned credibility* to hallucinated text, and filler in place of missing sources erodes trust more than an honest empty state. — [Shape of AI](https://www.shapeof.ai/patterns/citations)
- **aiuxplayground anti-patterns**: footnote-only lists; anonymous numbered markers with no title; opening a new tab for every check; hiding sources behind "+N". On mobile, replace hover with tap or a bottom sheet. — [aiuxplayground](https://aiuxplayground.com/pattern/citations); [shadcn inline-citation component](https://www.shadcn.io/ai/inline-citation)
- **"Attribution Gradients" (research prototype)**:
  - How it works: splits sentences into atomic claims and shows colour-coded *supporting and contradictory* excerpts for each claim. Clicking an excerpt opens the PDF with the passage highlighted.
  - Results (n=20, vs a ChatDOC + Elicit baseline): users reached a source faster (103 s vs 152 s), opened more papers, and produced better revised answers.
  - Caveat: the excerpt pipeline was only 52.5% relevant. — [arXiv 2510.00361](https://arxiv.org/html/2510.00361v1)

### Inferences
- **Copy the 3-step evidence funnel exactly**: inline chip → hover card (verbatim quote with muted context, Glean-style) → right pane with PDF bbox highlight. This is now what judges expect, so missing any step will read as unfinished.
- **Make each citation chip carry more than a number**: `RBI MD-KFS §5.2 · p.7` plus a status pip (IN_FORCE green / SUPERSEDED struck-grey). This is our KeyCite flag. Lexis and Westlaw show that validity status *on the citation itself* is the legal-grade differentiator.
- **Make the hover card a verbatim quote** with greyed context before and after, the page number, and the valid_from–valid_to dates. When the bbox match is uncertain, say "page-level match" (Glean's honest fallback). Do not fake a highlight.
- **Borrow Gemini's per-sentence colouring, but invert the purpose.** Gemini colours *after* the answer, on request. We should show by default that every sentence on screen *passed*, and show what was *withheld* behind a "Show rejected (2)" toggle with strike-through. Nobody in the survey does this; it is the brand.
- **Avoid "confidence %"** (the Juristify-style "74% grounding", see Q3). A binary verified/withheld with a reason is more defensible for a compliance officer and matches the product's thesis.

### Gaps
- I could not inspect live UIs of Harvey, CoCounsel, Lexis+ AI, Hebbia, Glean or AlphaSense (enterprise logins). Findings come from vendor docs and release notes, not screenshots.
- Mobbin web/iOS flows for Perplexity, ChatGPT, Claude and NotebookLM could not be viewed (not logged in in the reachable Chrome profile).
- No primary source describes exactly where KeyCite flags sit beside AI-Assisted Research citations.

---

## Q2. Patterns for abstention, conflict/diff, version timelines, compliance dashboards, impact alerts, audit logs and review queues

### Takeaway
Each of these surfaces has a mature non-AI precedent to borrow from:
- **Version timelines and point-in-time views**: legal publishers (legislation.gov.uk, eCFR).
- **Diffs**: redline strike-and-insert.
- **Audit logs**: vertical activity timelines.
- **Dashboards**: GRC tools (big % compliant, plus failed/exception counts and a top-risks list).

Abstention is the weakest-designed area across the industry. Most products either fall back silently or say nothing.

### Cited Findings
**Abstention / "cannot verify"**
- **Gemini** leaves claims it can't evaluate unhighlighted and marks unsupported ones orange. Neither state blocks the text. — [Gemini Help](https://support.google.com/gemini/answer/14143489)
- **Glean** silently falls back to document-level citations when unsure. — [Glean Developers](https://developers.glean.com/guides/chat/deep-linked-citations)
- **Lexis** flags unlinkable citations "for manual validation". — [LexisNexis](https://www.lexisnexis.com/community/insights/legal/b/thought-leadership/posts/legal-ai-citation-integrity)
- **Shape of AI** recommends explicit gaps and honest empty states over filler. — [Shape of AI](https://www.shapeof.ai/patterns/citations)
- **Shape of AI catalog**: lists "Caveat", "Verification", "Footprints" and "Stream of Thought" (auditability) as trust/governor patterns. — [shapeof.ai](https://www.shapeof.ai/)

**Conflict / diff**
- **eCFR "Compare Dates"** compares any two dates of a regulation, with changes shown as red/green or purple/orange (the latter is a colour-blind-friendlier option). — [GWU Law guide](https://law.gwu.libguides.com/federalregulatory/updating)
- **Redline pattern (observed, Dribbble "Contract Editor – Version History", ChainCore)**: deleted text in red strike-through, inserted text in teal brackets inline, next to a left rail of version entries with check-circles. — [Dribbble 25391262](https://dribbble.com/shots/25391262-Contract-Editor-Version-History)
- **Supporting vs contrasting evidence shown side by side**: Scite (supporting/contrasting/mentioning) and Attribution Gradients (colour-coded supporting vs contradictory excerpts for each claim). — [scite.ai](https://scite.ai/); [arXiv 2510.00361](https://arxiv.org/html/2510.00361v1)

**Version timeline / as-of date**
- **legislation.gov.uk**:
  - Offers "Latest available (Revised)" plus point-in-time URLs (e.g. `/section/79/2023-03-10`) and a "Show Timeline of Changes" toggle that adds navigation by change date.
  - Older point-in-time pages state they have been superseded.
  - Changes not yet applied appear in a separate "Changes to Legislation" box. — [legislation.gov.uk example](https://www.legislation.gov.uk/ukpga/1991/22/section/79/2023-03-10)
- **eCFR**:
  - Point-in-time browsing back to Jan 2017, plus a Timeline utility.
  - A filter hides entries with no content change.
  - Notes that most amendments have *future* effective dates. — [eCFR timeline filtering](https://www.ecfr.gov/reader-aids/ecfr-recent-updates/introducing-timeline-filtering); [eCFR reader aids](https://www.ecfr.gov/reader-aids)
- **Version-list patterns (observed, Dribbble)**:
  - Version list with nested minor versions (3.0 → 2.3 → 2.2/2.1), each with date and author, next to an Activity feed: "X changed status from Draft to In Progress". — [Dribbble 26274293](https://dribbble.com/shots/26274293-Version-History-with-Activity-Timeline)
  - Version chips (v6.0 dark = current, v5.0 grey = past) on a vertical rule, each with a one-line change summary, author and relative time. — [Dribbble 23007691](https://dribbble.com/shots/23007691-Version-History-Audit-Log)

**Audit trail**
- **Observed, Dribbble "Audit Trail" (ELSRT)**: a tab beside "Batch details / Samples". Vertical timeline with an icon for each event; each row reads "<object> <action> [status pill: Approved / Initiated] by <person> at <org>" with a timestamp. — [Dribbble 26340864](https://dribbble.com/shots/26340864-Audit-Trail)
- **More audit log references (Dribbble)**: [Audit Logs 15140952](https://dribbble.com/shots/15140952-Audit-Logs), [Audit Logs UI 23296636](https://dribbble.com/shots/23296636-Audit-Logs-UI)

**Compliance dashboards**
- **Observed, Behance "iliPro – DORA Compliance"**:
  - Big "82% Compliant" gauge with monthly trend bars.
  - KPI tiles: Total Policies 243, Failed 23 (red), Exceptions 12.
  - Upcoming audit schedule with date tiles, "Top Risks" rows with red "Critical" pills, and a risk-trend line chart by entity. — [Behance 207686223](https://www.behance.net/gallery/207686223/iliPro-Web-App-DORA-Compliance-Dashboard)
- **Observed, Dribbble "Incubus – Dashboard for Governing AI Agent Actions"**:
  - Hourly stacked bars of policy decisions by outcome: Allowed 10,433 (green) / Escalated 358 (amber) / Denied 372 (red).
  - A spike is flagged with an alert icon on the x-axis, and a tooltip gives the exact count. — [Dribbble 27892161](https://dribbble.com/shots/27892161-Incubus-Dashboard-for-Governing-AI-Agent-Actions)
- **Other compliance dashboard shots (Dribbble)**: [Portfolio Compliance Dashboard Cards 26707490](https://dribbble.com/shots/26707490-Portfolio-Compliance-Dashboard-Cards), [FinSight AI Ops & Compliance 26852406](https://dribbble.com/shots/26852406-FinSight-AI-Ops-Compliance-Dashboard), [Lienmark Contractor Compliance 27895977](https://dribbble.com/shots/27895977-Lienmark-Contractor-Compliance-Dashboard)

**Review queue / correction loop**
- **Observed, Behance "Juristify AI" trust case study (Ofnav, published 29 Oct 2026)**:
  - "Flag as Wrong" with Undo under each answer.
  - A "Correction Log" with Flagged / Under Review / Resolved statuses and an original-vs-corrected side-by-side view.
  - A Source Review side panel where users pick or override sources.
  - "Trust & Review Policy" settings (Conservative / Balanced / Exploratory) that route low-score answers to review.
  - The authors note outcomes were not measured. — [Behance 257574913](https://www.behance.net/gallery/257574913/Beyond-Confident-Answers-Building-Trustworthy-AI-Agent)

### Inferences
**Abstention: make ABSTAIN a first-class, dignified state, not an error.**
- Use a calm slate/blue card, not red: "Cannot answer with proof".
- Show three facts:
  1. What was searched: N docs, as-of date, bank profile.
  2. Closest clauses found, each with its *reason for rejection*: "talks about NBFCs, not UCBs" or "superseded on 2021-04-01".
  3. What would unblock it: "Upload your board-approved KYC policy" or "ask about Tier 4".
- This is the "Silence" in the product's name. Make it look deliberate.

**PARTIAL.** Show the answered sentences normally. Then add a dashed "gap" row saying what part of the question is unproven.

**CONFLICT card.** Split the card in two with a word-level diff between the two clauses:
- **Left**: "Your policy — Clause 4.3 (Board-approved 2023-06)".
- **Right**: "RBI — Master Direction §X (IN_FORCE since 2024-…)".
- Show the specific delta as tokens (e.g. **60 days** vs **90 days**).
- Add a verdict line: "Bank clause is *less strict* than RBI → non-compliant".
- Actions: "Send to review", "Open both PDFs".
- Use the eCFR's colour-blind-safe purple/orange or blue/orange for diff, not red/green.

**Clause version timeline.** Combine legislation.gov.uk and Git:
- A horizontal timeline per clause, with each version as a node (valid_from → valid_to bar), amendment circulars as labelled ticks, and "SUPERSEDED" versions struck through.
- Selecting two nodes gives an inline redline (ChainCore-style strike/insert).
- The global as-of date picker draws a vertical "you are here" line across every timeline.

**Audit trail.** Use an ELSRT-style vertical timeline with a status pill on each row, plus a right-aligned monospace hash column (`prev_hash → hash`, truncated). The header button "Verify chain" checks each block and ticks it in turn (see Q5).

**Overview dashboard.** Copy Incubus: outcome distribution over time as stacked bars (ANSWER / PARTIAL / CONFLICT / ABSTAIN), with KPI tiles such as "% answers fully proven", "open conflicts", "pending reviews", "circulars awaiting impact review". Skip decorative gauges; one big number is enough.

**Review queue.** A Juristify-like table: item, outcome, maker, created, SLA, status (Pending checker / Approved / Returned). The detail view puts the original answer beside the checker's annotation. Enforce maker ≠ checker visibly: the "Approve" button is disabled with the tooltip "You created this item".

### Gaps
- I found no published UI for a "hash-chain verification" view in a commercial compliance product. The pattern recommended above is my own proposal.
- I found no primary source for how RBI-focused Indian regtech vendors present impact alerts. Only generic "regulatory change management" marketing exists, and I did not inspect any.

---

## Q3. Strongest gallery references (Dribbble / Behance / Pinterest / Mobbin / Godly / Land-book)

### Takeaway
About 20 usable references, almost all from Dribbble and Behance. The most relevant are:
- Graceview's regulatory-obligations chat (Australian, APRA-regulated context).
- The "Citation Highlights" report.
- TalkPDF's split chat + PDF layout.
- The ChainCore redline.
- The iliPro and Incubus compliance dashboards.
- The Juristify trust case study.

Landing-page galleries (Godly, Land-book) are not useful for this app-UI problem.

### Cited Findings
Each entry gives the reference and what I observed in the screenshot or text, followed by what to copy.

**Chat with citations**
1. **"AI Chat Collection: Citation Highlights" (Damian Skotzke)**. Observed: a report-style answer with a provenance line ("From 32 articles in Threat Hunting feed · 12:34 · 18 Jan 2024"), inline entity chips (CVE IDs with colour dots) and small numbered citation chips at the end of sentences. **Copy**: the provenance header and the tiny end-of-sentence chips. — https://dribbble.com/shots/25508476-AI-Chat-Collection-Citation-Highlights
2. **"Legal AI Chat Interface" (Never Before Seen for Graceview)**. Observed:
   - Welcome text reads "Graceview can help find obligations"; the user ticks which matched obligations to include (e.g. "1309 Corporations Act 2001", "9910 Life Insurance Act 1995").
   - The answer about "APRA CPS 230" carries numbered citations 1 2 3 and a hover "Reply" on a highlighted span.
   - **Copy**: obligation cards with checkboxes (scope the corpus before answering) and span-level highlight with numbered chips. — https://dribbble.com/shots/26274650-Legal-AI-Chat-Interface
3. **"Legal AI Chat Interface Redesign" (Evatt.AI, Vishwajeet Lakra)**. Observed:
   - A context strip ("Matter • Jurisdiction • Confidence") above the thread.
   - Answer structured as Conclusion / Key Rule / Application / Authorities, with superscript footnotes.
   - Left rail of Matters → Research Thread / Draft / Documents.
   - **Copy**: the context strip (ours: As-of • Bank profile • Language) and the structured answer headings. — https://dribbble.com/shots/27389614-Legal-AI-Chat-Interface-Redesign
4. **"AI Chat | AI Document Chat" (Mohammad Azad)**. Observed: three columns (document list / chat / "Status" checklist with green ticks and red warnings per heading), shown split diagonally into light and dark themes. **Copy**: a right-rail checklist of verified/failed items; the light + dark pairing. — https://dribbble.com/shots/26534692-AI-Chat-AI-Document-Chat
5. **"TalkPDF Dashboard – Chat with Documents" (Caliber)**. Observed: the PDF on the left with the cited phrase highlighted in cyan; chat on the right; search history in a dark sidebar. **Copy**: the split PDF + chat layout with the answer driving the highlight. — https://dribbble.com/shots/24448287-TalkPDF-Dashboard-Chat-with-Documents
6. **Resarc (research assistant) series**. AI research assistant / citation generator / report dashboards. — https://dribbble.com/shots/26903868-Resarc-Citation-Generator-Dashboard ; https://dribbble.com/shots/26890463-Resarc-Research-Report-Dashboard

**Legal AI dashboards**
7. **Legal AI dashboard/redesign shots**: case and deadline management, MVP redesign. Generic, but useful for left-nav density. — https://dribbble.com/shots/26620919-Legal-AI-SaaS-Platform-MVP-UI-UX-Redesign ; https://dribbble.com/shots/27877509-FlowFunds-Legal-AI-Dashboard-for-Case-and-Deadline-Management ; https://dribbble.com/shots/27798424-Zavri-Legal-AI-Powered-Legal-Dashboard-UI-UX-Design

**Version history and diff**
8. **"Contract Editor – Version History" (ChainCore)**. Redline strike/insert next to a version rail (see Q2). **Copy** for the clause diff. — https://dribbble.com/shots/25391262-Contract-Editor-Version-History
9. **"Version History with Activity Timeline" (Never Before Seen)**. Nested versions plus an activity feed (see Q2). — https://dribbble.com/shots/26274293-Version-History-with-Activity-Timeline
10. **"Version History – Audit Log" (Ankur for Lyearn)**. Version chips on a vertical rule (see Q2). — https://dribbble.com/shots/23007691-Version-History-Audit-Log
11. **More version/diff shots**, not inspected in detail: "Workflow Version History Timeline" and "AI Workflow Builder Version History" (tagged diff). — https://dribbble.com/shots/26891797-Workflow-Version-History-Timeline ; https://dribbble.com/shots/27078905-AI-Workflow-Builder-Version-History

**Audit trail**
12. **"Audit Trail" (ELSRT)**. Status-pill timeline (see Q2). — https://dribbble.com/shots/26340864-Audit-Trail

**Compliance and governance dashboards**
13. **"Incubus – Dashboard for Governing AI Agent Actions"**. Outcome-stacked bars (see Q2). There is also a companion branding shot. — https://dribbble.com/shots/27892161-Incubus-Dashboard-for-Governing-AI-Agent-Actions ; https://dribbble.com/shots/27892333-Giving-AI-Agents-Guardrails-The-Incubus-Brand-Interface
14. **"iliPro – DORA Compliance Management Platform" (Behance)**. Compliance KPIs and top risks (see Q2). — https://www.behance.net/gallery/207686223/iliPro-Web-App-DORA-Compliance-Dashboard
15. **"Compliance Dashboard UI" (Outcrowd)**. Observed: a marketing-style compliance site (SOC2 cards, "Achieve and Maintain Compliance"). Good for a landing hero; weak for app UI. — https://dribbble.com/shots/27319815-Compliance-Dashboard-UI
16. **"Portfolio Compliance Dashboard Cards" (Alan Tippins)**. Observed in the thumbnail: three score cards (e.g. 8.7 / 4.9 / 5.5) with status chips. **Copy** for per-policy-area compliance cards. — https://dribbble.com/shots/26707490-Portfolio-Compliance-Dashboard-Cards

**Trust case study**
17. **"Beyond Confident Answers" / Juristify AI (Ofnav, Behance, Oct 2026)**. The richest written rationale for trust UI:
   - confidence badge, "Why this answer?", source cards with match %
   - Flag as Wrong, Correction Log, Trust & Review Policy settings. — https://www.behance.net/gallery/257574913/Beyond-Confident-Answers-Building-Trustworthy-AI-Agent

**Regtech and banking visual language**
18. **RegTech visual language**: Westpac CRP RegTech platform and "RegTech Dashboard". Observed thumbnails: green-on-white and deep-navy palettes typical of the category. — https://dribbble.com/shots/15012003-Westpac-CRP-RegTech-Platform ; https://dribbble.com/shots/19525261-RegTech-Dashboard ; https://dribbble.com/shots/20894869-RegTech-platform
19. **Banking dashboards on Behance**: Banking Transaction Monitoring & Fraud Risk Analysis (dark, ₹-style figures), AI Banking KYC Automation Platform. — https://www.behance.net/gallery/256607113/Banking-Transaction-Monitoring-Fraud-Risk-Analysis ; https://www.behance.net/gallery/252431693/AI-Banking-KYC-Automation-Platform
20. **Fintech light + dark pair**. — https://dribbble.com/shots/27171922-Fintech-Dashboard-UI-Dark-Light-Theme

**Pattern libraries (not galleries, but stronger than any shot)**
21. **Shape of AI** and **aiuxplayground** citations patterns. — https://www.shapeof.ai/patterns/citations ; https://aiuxplayground.com/pattern/citations

### Inferences
- **The three most transferable references**: Graceview (#2) for "scope the regulation first, then answer with span-level citations", TalkPDF (#5) for layout, and ChainCore (#8) for the clause diff.
- **The best checklist for our trust features is Juristify (#17).** But it uses confidence percentages, which I recommend we *not* copy. Proof-or-Silence's stance is "proven or withheld", not "74% sure".
- **Gallery shots skew decorative.** Gradients, 3D blobs and glassmorphism are not appropriate for a bank compliance officer. Borrow structure from Dribbble and visual restraint from Lexis- and Westlaw-style tools.

### Gaps
- No Mobbin flows inspected (logged out). Mobbin would have given real Perplexity, ChatGPT and NotebookLM web/iOS citation screens.
- Pinterest searches returned only generic AI-chat imagery; I recorded no specific pins as references.
- Godly (redirects to recent.design) and Land-book returned nothing relevant for in-app compliance UI.

---

## Q4. Indian banking UI sensibilities, accessibility, Hindi/English, dark/light

### Takeaway
The only formal Indian design standard I found is GIGW 3.0, written for government sites but a sensible bar for a regulator-facing tool. It requires bilingual UI with a prominent language switch, Unicode text, tested Hindi fonts, and WCAG 2.1 AA. Everything else about "Indian banker sensibilities" below is my inference: dense tables, Indian number formatting, DD-MM-YYYY dates, print/export.

### Cited Findings
- **GIGW 3.0 bilingual checkpoint**: a site must be bilingual, with a prominent language-selection link, and use Unicode. — [GIGW 3.0 checkpoint](https://guidelines.india.gov.in/?p=9990)
- **GIGW 3.0 font testing**: Hindi and regional-language fonts must be tested on popular browsers for layout breakage. — [GIGW 3.0](https://guidelines.india.gov.in/?p=9790)
- **GIGW 3.0 accessibility baseline**: conforms to WCAG 2.1 Level AA. Documents should be provided in HTML or other accessible formats. — [GIGW 3.0 scope](https://guidelines.india.gov.in/scope-and-objective/)
- **Accessibility share (secondary source)**: Digit reports that accessibility makes up more than half of GIGW 3.0's checkpoints. — [Digit](https://www.digit.in/features/general/what-is-gigw-3-0-indian-govts-design-guidelines-for-official-websites-and-apps.html)
- **Hindi typeface option**: IBM Plex Sans Devanagari is on Google Fonts. It has 7 static weights under OFL-1.1, and the Plex family is designed for UI. It pairs with IBM Plex Sans and IBM Plex Mono. — [Google Fonts METADATA](https://raw.githubusercontent.com/google/fonts/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/ibmplexsansdevanagari/METADATA.pb); [IBM Plex](https://www.ibm.com/design/language/typography/typeface)
- **Hover doesn't work on touch**: hover cards fail on touch devices, so citations need tap or bottom-sheet fallbacks. — [shadcn](https://www.shadcn.io/ai/inline-citation); [aiuxplayground](https://aiuxplayground.com/pattern/citations)
- **Colour-blind-safe diff colours**: eCFR offers purple/orange as an alternative to red/green diff colouring. — [GWU guide](https://law.gwu.libguides.com/federalregulatory/updating)

### Inferences
**Language**
- Answer in the question's language, but **never translate verbatim quotes**. Show the English source quote as the evidence, with an optional Hindi gloss labelled "अनुवाद (सत्यापित नहीं)" (translation, not verified).
- A Hindi answer must still point to the English clause and bbox. This shows judges that proof survives translation.

**Typography**
- **Mixed-script text**: IBM Plex Sans + IBM Plex Sans Devanagari, so Latin and Devanagari share metrics.
- **Verbatim quotes in a serif** (e.g. Source Serif or Noto Serif), so "law text" and "AI text" are visually different at a glance.
- **IDs and hashes** in IBM Plex Mono (clause IDs, circular numbers like RBI/2024-25/xx, hashes).

**Banker conventions**
- Indian number grouping (₹12,34,567.00; lakh/crore toggle in the EMI view).
- DD-MMM-YYYY dates, unambiguous (e.g. 01-Apr-2025).
- Compact table density by default.
- Keyboard shortcuts.
- "Export to PDF / print" on every answer, with the citation list and the hash of the audit entry. Officers file evidence on paper or as PDF attachments.

**Themes**
- Light theme by default: documents and PDFs are white, and banking back-offices are bright rooms.
- Dark theme as a toggle for the demo projector.
- Status must never rely on colour alone: icon + label + colour on every outcome badge, to meet WCAG 2.1 AA.

**Accessibility**
- Every citation chip is a real `<button>` with `aria-describedby` pointing to the quote.
- Strike-through rejected sentences also carry a "Rejected: reason" text label.
- Visible focus rings.
- Contrast of at least 4.5:1, including the muted context text in hover cards.

### Gaps
- I found no published design system from an Indian bank or from RBI (e.g. an RBI or SBI design system) to cite.
- I found no user research on Indian compliance officers' UI preferences. The density and print recommendations are unverified assumptions.

---

## Q5. What would make judges remember the demo, and the recommended UI

### Takeaway
No surveyed product *shows the verifier working*. Gemini comes closest with per-sentence colouring after the fact. The memorable demo moment is watching sentences get **proven or struck out live**, then **dragging the as-of date** and watching the answer and clause statuses change.

### Cited Findings
- **Per-sentence colouring exists, but only after the answer and only on request.** Gemini's double-check colours statements green or orange, and it is a separate button press. — [Gemini Help](https://support.google.com/gemini/answer/14143489)
- **Point-in-time law views are a known, credible pattern.** Both legislation.gov.uk and eCFR support viewing law as of a date and comparing dates. — [legislation.gov.uk](https://www.legislation.gov.uk/ukpga/1991/22/section/79/2023-03-10); [eCFR](https://www.ecfr.gov/reader-aids/ecfr-recent-updates/introducing-timeline-filtering)
- **Showing supporting vs contradicting evidence per claim measurably helped users** reach sources faster and produce better answers (n=20). — [arXiv 2510.00361](https://arxiv.org/html/2510.00361v1)
- **Showing "Stream of Thought" / "Footprints" builds auditability trust.** — [Shape of AI](https://www.shapeof.ai/)
- **AlphaSense verifies citations post-hoc but does not visualise that step.** — [AlphaSense blog](https://www.alpha-sense.com/blog/product/combat-generative-ai-hallucination/)

### Inferences: design recommendations

**A. Wow moments, ranked by impact per build hour**
1. **"Proof or Silence" live verify, the signature moment.**
   - The draft answer streams in grey, one sentence per line.
   - A scan line passes through, and each sentence then either:
     - snaps to full ink with its citation chip, or
     - gets a red strike-through and slides into a collapsed tray: "2 sentences withheld — no supporting clause".
   - A **Proof Meter** in the header counts up: "4/4 sentences proven · 2 withheld".
   - The final outcome badge stamps in: ANSWER / PARTIAL / CONFLICT / ABSTAIN.
   - Clicking the tray reveals each rejected sentence with *why* (verifier reason).
   - This literally visualises the product name, and nobody in the survey does it.
2. **Time-travel as-of slider.**
   - A horizontal date scrubber in the header, with ticks at every circular in the corpus (e.g. 2014 circular → KFS directions → 2026).
   - Dragging re-runs the query: citation pips flip IN_FORCE ↔ SUPERSEDED, and the answer text changes.
   - The clause timeline's "you are here" line moves.
   - Demo line: "Same question, 2019 vs today — different law, different answer, both proven."
3. **Conflict X-ray.**
   - Ask a question where the bank policy contradicts RBI.
   - The CONFLICT card splits open into a two-column word diff, with only the conflicting tokens highlighted (purple vs orange).
   - Verdict: "Bank policy is less strict than RBI MD §… → action required".
   - One click: "Send to checker".
4. **Tamper-evident audit.**
   - Click "Verify chain": blocks tick green one by one in about 1.5 s.
   - Then, on stage, edit one stored audit row (a pre-scripted dev endpoint) and re-verify. The chain breaks at row N in red, with the expected vs actual hash.
   - Bankers and judges understand this immediately.
5. **Impact alert.**
   - Drop in a "new circular" PDF.
   - The feed card reads "New RBI circular affects 3 bank clauses", with mini conflict cards for each affected clause and "Create review tasks (3)".
6. **Hindi question, English proof.** Type the question in Hindi. The answer comes back in Hindi, with English verbatim quotes and the same PDF highlights.
7. **Calculation proof.** EMI answer with a "Show working" accordion: formula with values substituted, then an amortisation table (tabular numerals, ₹ Indian grouping). A badge reads "Computed by code, not by the model".

**B. Screen list (build order for the hackathon)**
1. **Ask / Answer workspace** (hero; 60% of demo time). Three panes, described in C.
2. **Evidence viewer**: the right pane, which can expand to full screen.
   - PDF.js rendering with the bbox overlay; previous/next citation navigation.
   - Clause metadata header: doc, page, clause, status, valid_from–valid_to.
3. **Clause detail**: version timeline (horizontal bars per version, amendment ticks), plus a redline diff of any two versions, plus "answers that cited this clause".
4. **Conflicts board**: list or kanban of open conflicts (bank clause ↔ RBI clause, severity, owner, status).
5. **Impact alerts feed**: new circular → affected clauses → create review tasks.
6. **Review queue (maker-checker)**: table, then a detail view with the original answer, checker notes and an Approve / Return pair. Self-approval is disabled with an explanation.
7. **Audit trail**: vertical timeline, hash column, "Verify chain" button, per-entry JSON drawer.
8. **Overview**: KPI tiles and an outcome-stacked bar chart, Incubus-style. Optional; build it last.
9. **Settings / profile**: bank tier (Tier 3 / Tier 4 UCB), default as-of, language, theme.

**C. Answer workspace layout (desktop, 1440 px)**
- **Top bar**: product mark · question input · **As-of** date picker/scrubber · **Bank profile** chip ("UCB · Tier 3") · EN/हिं toggle · theme toggle.
- **Left rail (240 px)**: past questions grouped by day, each with a small outcome dot. Below that, nav items: Conflicts, Alerts, Reviews, Audit.
- **Centre (flexible, max 720 px for reading)**:
  - outcome badge and Proof Meter
  - the answer as a stack of sentence rows, each followed by its citation chip(s)
  - a "Withheld (n)" tray
  - calculation accordion(s)
  - actions: Send for review, Export PDF, Copy with citations
- **Right pane (480 px, resizable)**: evidence for the selected citation:
  - the PDF page with bbox highlight
  - the verbatim quote in serif
  - status pip, valid dates and "View clause history →"
  - for CONFLICT, the pane switches to the two-column clause comparison
- **Mobile/tablet**: the right pane becomes a bottom sheet, and hover becomes tap.

**D. Component inventory**

*Answer components*
- `OutcomeBadge` (4 variants, each with icon + label + colour).
- `ProofMeter` (fraction + segmented bar).
- `SentenceRow` with states: verifying / proven / rejected (strike-through + reason) / computed.
- `CitationChip`: short doc code + clause + page + status pip; keyboard-focusable.
- `CitationHoverCard`: verbatim quote, muted context before and after, page, valid dates, and "page-level match" fallback text.
- `WithheldTray`.
- `AbstainCard`: searched scope / nearest clauses with rejection reasons / what would unblock.
- `PartialGapRow`.
- `CalcPanel`: formula, inputs, amortisation table.

*Evidence components*
- `ConflictCard`: two columns, token diff, verdict, actions.
- `PdfViewer` + `BboxHighlight` (animated pulse when a citation is selected).

*Time and history components*
- `AsOfScrubber`: date input and a tick track of circular dates.
- `ClauseTimeline`: version bars, amendment ticks, as-of cursor.
- `RedlineDiff`: inline or side-by-side, purple/orange.
- `ImpactAlertCard`.

*Operations components*
- `ReviewQueueTable` and `MakerCheckerBar`.
- `AuditTimeline` + `HashCell` + `ChainVerifyButton` (progress plus a broken-link state).
- `BankProfileChip`, `LangToggle`.

**E. Visual style**
- **Tone**: "regulator's reading room", not "AI startup". Restrained, paper-like, high-contrast text. Avoid gradients, 3D orbs and glassmorphism, which are common on Dribbble but wrong for this audience.

*Colour*
- **Base**: neutral slate greys on a warm off-white page (#FAFAF7-ish).
- **Accent**: one deep ink blue for interaction.
- **Outcome colours**:
  - ANSWER: green, check icon.
  - PARTIAL: amber, half-circle icon.
  - CONFLICT: magenta/red-violet, two-arrows icon.
  - ABSTAIN: slate-blue, hand/shield icon. Abstaining is a *correct* outcome, so it must not look like an error.
- **Clause status**: IN_FORCE is a solid green pip; SUPERSEDED is a hollow grey pip with the label struck through.
- **Diffs**: purple (bank) / orange (RBI), colour-blind-safe.

*Type*
- IBM Plex Sans + IBM Plex Sans Devanagari for the UI.
- A serif (Source Serif 4 / Noto Serif Devanagari) for quotes.
- IBM Plex Mono for IDs and hashes.
- Tabular numerals for all figures.

*Density and motion*
- **Density**: 13–14 px body in tables, 15–16 px in answer prose; 8 px spacing grid; 6 px radius; hairline borders rather than shadows.
- **Motion**: used only for meaning:
  - the verify scan (~150 ms per sentence)
  - strike-through draw
  - bbox pulse
  - chain-tick sequence
- Respect `prefers-reduced-motion`; show final states instantly.

**F. Things to do better than the references**
- **Show the negative space.** Withheld sentences, with reasons, can be inspected. No surveyed product exposes this.
- **Make status part of the citation**, so a superseded source can't look as authoritative as a current one. Lexis and KeyCite flags do this for case law; nobody does it for regulations as of a chosen date.
- **Use one global as-of date** that drives answers, timelines and conflict checks together, instead of a separate "compare" mode buried in a menu as in eCFR.
- **Give every abstention a constructive next step** instead of a dead end.
- **Make the audit trail tamper-evident and visibly verifiable**, not just a log.

---

### Gaps (overall)
- Live enterprise UIs (Harvey, CoCounsel, Lexis+ AI, Hebbia, Glean, AlphaSense) and Mobbin flows were not viewable. Their descriptions rely on vendor docs and third-party teardowns.
- The recommendations in Q5 are untested design hypotheses, with no user testing with compliance officers.
