# Mobbin flows and screens: UI research for Proof-or-Silence

Research date: 24 Nov 2026. This note fills the Mobbin gap left by `ui_research.md`, which was written while Mobbin was logged out.

Labels used below:
- **Observed**: I saw it in a Mobbin screenshot.
- **Inferred**: my own reading or recommendation.

---

## Method

### Setup
- **Browser**: Claude in Chrome, the user's own profile, signed in to Mobbin.
- **My tab**: I opened one new tab and closed it at the end.

### Tab mix-up with the Pinterest agent
- My first call went to the tab the tool returned as the only tab in the group. That tab turned out to be the Pinterest agent's tab.
- One `navigate` call targeted it. The navigation "ended without loading a page", and the tab stayed on its Pinterest search.
- After that I used only my own new tab.

### Actions
- About 60 browser actions.
- Browse and read only.
- No saves, likes, collections, "Get Pro" clicks or settings changes.

### Blocker: the Mobbin account is on the free plan
- The account shows a "Get Pro" button. Each app page shows the banner "Upgrade for full access to Perplexity and 1,000 other apps and sites".
- **Web app pages**: only the **first 2 screens** are visible. Perplexity web shows "435 screens", but everything after screen 2 sits behind the wall "Access all 709,616 screens… from ₹800/month".
- **Flows tab**: only the **first flow** plays (for Perplexity, "Onboarding", 12 screens). Everything else is blurred, including the flows I needed most: "Chatting with AI", "Source", "Exporting a thread".
- **Older versions**: the "Latest ▾" version picker (e.g. NotebookLM's Jul 2025 version) only gives 2 more free screens. For NotebookLM these were the landing page and Google sign-in.
- **Text-in-screenshot search**: shows **2 free results on Web** and **5 free results on iOS** per query. This was the most productive route.
  - URL pattern: `https://mobbin.com/search/apps/{web|ios}?content_type=screens&sort=popularity&text_in_screenshot=<text>`
- **Net effect**: I could not walk the citation-hover or source-viewer *flows* of Perplexity, ChatGPT, Claude or NotebookLM. The findings below come from single free screens and from text-search hits across other apps.

### App search
- Mobbin lists **Perplexity** (web + iOS), **Gemini Notebook** (this is NotebookLM, renamed on Mobbin), **Elicit** (it appeared as an app suggestion for "citation") and **ChatGPT / Claude** (iOS hits).
- I did not open Elicit's app page; I was out of action budget.
- I did not check Harvey, Hebbia, Glean or Consensus.

---

## Findings by pattern

### 1. Inline citation markers and source preview

**1a. ChatGPT iOS, deep-research report with a Sources sheet**
- Mobbin: https://mobbin.com/search/apps/ios?content_type=screens&sort=popularity&text_in_screenshot=Citations (result 1)
- Observed:
  - A bottom sheet over the report has two segmented tabs, **"Sources"** and **"Activity · 15m"**, and a close ✕.
  - Under them, a count line reads **"Citations · 23"**.
  - Each source row has a small **index number**, the **domain with favicon** above it (ourworldindata.org, oecd.org), a bold title ("Fertility Rate – Our World in Data") and a two-line grey excerpt.
  - Rows are grouped under their domain.
- **Copy for Proof-or-Silence:** an evidence sheet with two tabs, "Sources (n)" and "Activity". Group rows by circular, and give each row its number, clause title and a two-line verbatim excerpt.

**1b. ChatGPT iOS, completed report header**
- Mobbin: same search (result 3)
- Observed:
  - The provenance line reads "Research completed in 15m · 23 citations · 0 searches".
  - Below it sits a report card with a doc icon, the title "Global Fertility Trends and Dr…", and download and expand icons.
  - The body uses inline superscript markers after figures ("2.3 in 2023 ¹").
- **Copy for Proof-or-Silence:** a provenance line above every answer: "Verified 6/8 sentences · 5 citations · 3 circulars · as of 01-Apr-2025". Then superscript markers right after the claim token.

**1c. Grok iOS, "Key Citations" list**
- Mobbin: same search (result 5)
- Observed:
  - The answer ends with a bold heading **"Key Citations"**, followed by a bulleted list of blue underlined source titles (e.g. "Pew Research Center Electric Vehicle Charging Infrastructure in the U.S.").
  - Action icons below.
- **Copy for Proof-or-Silence:** avoid this as the only citation UI. It is the footnote-only anti-pattern, with no link between claim and quote. It is acceptable only as an "All citations" footer for export or print.

**1d. Superpower iOS, citation count on a card**
- Mobbin: same search (result 4)
- Observed: an insight card row reads **"1 Citations ›"**, a chevron row that opens the evidence, sitting under "What's causing this? · 9 Key Biomarkers".
- **Copy for Proof-or-Silence:** in list views (history, review queue), show a compact "3 citations ›" count chip per item rather than the full chips.

**1e. Granola iOS, bracketed numeric citations in green**
- Mobbin: https://mobbin.com/search/apps/ios?content_type=screens&sort=popularity&text_in_screenshot=Thought%20for (result 4)
- Observed:
  - Bullet answers end with **[1]** markers in green.
  - A trailing provenance sentence reads: "These action items came from your phone call with John earlier tonight."
- **Copy for Proof-or-Silence:** a colour-coded marker (green = IN_FORCE) plus a one-line plain-language provenance sentence under the answer.

### 2. Sources panel and source-document viewer

**2a. Perplexity web, current thread view**
- Mobbin: https://mobbin.com/apps/perplexity-web-d0c6a94e-4988-41bd-acc3-0fc652b28b61/15fda1d9-94dd-4255-bfa9-769f689a051c/screens (free screen 2)
- Observed:
  - Right rail with collapsible rows: **"Artifacts 1 ›"**, **"Sources ›"**, **"Usage 1m 22s ›"**.
  - Thread title in the top bar, with "…", a pane toggle and a dark **"Share"** button.
  - The answer body is set in a **serif** typeface; the UI chrome is sans-serif.
  - The left nav lists Computer, Spaces, Artifacts, Customize, History.
- **Copy for Proof-or-Silence:** a right rail of collapsible sections, "Evidence (n) ›", "Withheld (n) ›", "Audit entry ›". Add a serif for verbatim quotes (Perplexity already separates the reading text from the chrome).

**2b. Perplexity iOS, answer tabs**
- Mobbin: https://mobbin.com/search/apps/ios?content_type=screens&sort=popularity&text_in_screenshot=Sources (result 3)
- Observed:
  - Under the serif title "Pumpkin spice latte recipe" sits a tab row: **"Perplexity | Images | Sources"**. The Sources tab shows stacked favicons.
  - The answer is prose; the composer reads "Ask follow up…".
- **Copy for Proof-or-Silence:** on mobile or narrow views, make "Answer | Evidence | Withheld" peer tabs rather than a side pane.

**2c. NotebookLM (Gemini Notebook) web, three-pane workspace**
- Mobbin: https://mobbin.com/apps/gemini-notebook-web-8be03a3f-5496-45b2-89ae-4e1a7586d338/4315ecce-dd65-5dd9-89f7-51b91443f9ca/screens (free screen 2)
- Observed:
  - Three panes with collapse toggles: **Sources | Chat | Studio**.
  - The Sources pane has "+ Add sources" and a web-search box with "Web ▾" and "Fast Research ▾" pickers.
  - Its empty state reads "Saved sources will appear here. Click Add source above to add PDFs, websites, text, videos, or audio files…".
  - The chat composer shows a live **"0 sources"** counter beside the send button.
  - A footer disclaimer reads "NotebookLM can be inaccurate; please double check its responses."
- **Copy for Proof-or-Silence:** put a scope counter in the composer ("Searching 42 circulars · UCB Tier 3 · as of 01-Apr-2025"). Replace the generic disclaimer with our stronger guarantee: "Unproven sentences are withheld."

**2d. Meta AI iOS, inline source card**
- Mobbin: iOS "Sources" search (result 4)
- Observed: under the answer list sits a small source card (Bing favicon, "restaurant recommend…", "bing.com"), then a grey **"Sources"** pill label above media cards.
- Inferred: this is weaker than numbered markers because the claim-to-source link is lost.

**2e. Not observed (blocked)**
- The Perplexity "Source" flow, the NotebookLM citation hover, and any split view with a highlighted passage were all behind the paywall.
- The split-view recommendation in `ui_research.md` (TalkPDF, Glean docs) still stands, but Mobbin did not verify it.

### 3. "I don't know", refusal and empty states

**3a. Intercom Copilot, the best abstention example found**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=couldn%27t%20find (result 2)
- Observed:
  - In the right-hand "Copilot" tab, the user asked "Give me one actionable insight about how to engage this customer better."
  - Reply: "Copilot **couldn't find** an answer in your team's knowledge hub or conversation history. Please rephrase or **add content** to help Copilot answer more questions."
  - "add content" is a link.
  - Below the reply is a link: **"1 sources that might help →"**.
  - Neutral styling, no red.
- **Copy for Proof-or-Silence:** the ABSTAIN card should say:
  1. where we looked ("RBI corpus + your bank policy, as of …"),
  2. what to do (rephrase / upload policy),
  3. "2 nearest clauses (not sufficient) →".
  Keep it neutral, never red.

**3b. Mobbin's own empty search**
- Observed: a centred bold "No results found", with a grey subline "Try searching for something else."
- **Copy for Proof-or-Silence:** keep the two-line structure, but make the second line specific, never generic.

**3c. NotebookLM empty Sources pane** (see 2c)
- Observed: an icon, the line "Saved sources will appear here", and a sentence explaining how to add sources.
- **Copy for Proof-or-Silence:** an empty Evidence pane should say "Select a citation to see the clause and its page highlight."

**3d. HubSpot import mapping**
- Mobbin: same "couldn't find" search (result 1)
- Observed:
  - Header "Step 2 of 3 — Match your data to our contact properties".
  - Copy: "If we couldn't find a match for a column, you can choose or create a property."
  - Rows show a green check per mapped column and an orange marker for unmapped.
  - Footer: "You have 1 unmapped column" with a checkbox "Don't import data in unmapped column".
- **Copy for Proof-or-Silence:** per-row ✓ / ⚠ plus a footer count is a good model for the Withheld tray: "2 sentences withheld", with a reason on each row.

### 4. Answer-in-progress, streaming and step status

**4a. Rox web, agent steps with a progress bar**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Searching%20the%20web (both results)
- Observed:
  - A header reads **"Step 3 of 3"** (or "Step 1 of 7") with a thin green progress bar and a right-aligned **"2 min left"** / "3 min left".
  - Below it, a vertical list of steps, each with a status icon. Done steps are greyed.
  - Each step has sub-action chips in grey pills, e.g. a magnifier icon + "Searching the web for 'Google Alphabet revenue by quarter…'", or "Get Company Document Metadata".
- **Copy for Proof-or-Silence:** a pipeline header reading "Step 2 of 4 · Verifying sentences". Sub-chips: "Retrieved 14 clauses", "Checked 6 sentences against quotes", "Checked supersession as of 01-Apr-2025".

**4b. Perplexity web, "Computer" answer**
- Mobbin: Perplexity web free screen 2 (URL in 2a)
- Observed:
  - Between prose paragraphs, small grey **status lines with icons and a ›**: "Loading skill media", "Generating a short cat clip with a meow sound ›", "Extracting the meow audio into an MP3 file ›", "Sharing cat_meow.mp3 ›".
  - The prose continues between them.
  - The composer shows mode "Computer ▾" and the model name.
- **Copy for Proof-or-Silence:** interleave expandable step lines in the answer ("Checked against RBI/2023-24/xx ›"), so the verifier's work stays inspectable after streaming ends.

**4c. ChatGPT iOS, deep-research progress card**
- Mobbin: iOS "Sources" search (result 5)
- Observed:
  - The assistant message reads "I'll let you know as soon as the research is ready."
  - An inline card shows **"Mapping out data sources"** with the live count **"29 sources"** (highlighted), a progress bar, and a **"Details"** button.
- **Copy for Proof-or-Silence:** a live-counting card: "Verifying… 4/6 sentences proven · 1 withheld", with a progress bar and "Details".

**4d. Linktree Insights, AI side panel**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Sources (result 2)
- Observed:
  - Above the structured answer sits an "Analysis" block with ticked steps: "Loading your links", "Fetching your analytics".
  - The answer is headed "Linktree Summary & Insights (Last 7 Days)", with sub-headings (Links Overview, Traffic & Engagement) and bullets.
- **Copy for Proof-or-Silence:** put the analysis steps in a collapsed block *above* the answer and restate the scope in the answer heading ("KYC re-verification — as of 01-Apr-2025, UCB Tier 3").

**4e. Grok, Meta AI and Bevel iOS, collapsible reasoning**
- Mobbin: iOS "Thought for" search (results 1–3, 5)
- Observed:
  - Grok: a chip **"Thought for 67 seconds ˅"** expands to the reasoning text. Above it, a "25 pages" chip with overlapping source avatars.
  - Meta AI: "Thought for 5.9 sec" as a small inline label.
  - Bevel: "Thought for 5 seconds", with sub-steps that each have a ›: "Considering Health Query Handling ›", "Refining Redirection Strategy ›".
- **Copy for Proof-or-Silence:** a collapsed "Verified in 3.2 s · 14 clauses read ˅" chip that expands to the verification log. The "N pages" avatar stack becomes "3 circulars" with document-type icons.

### 5. Settings and context bars (scope, date, profile)

**5a. Granola iOS, scope chip in the composer**
- Mobbin: iOS "Thought for" search (result 4)
- Observed: the composer placeholder reads "Chat with all your meetings". Below it is a **"Last week ˄"** time-scope chip and a second chip with a picker caret.
- **Copy for Proof-or-Silence:** the closest observed analogue to our as-of picker. Put "As of 01-Apr-2025 ˄" and "UCB Tier 3 ˄" chips inside the composer.

**5b. NotebookLM source-search pickers** (see 2c)
- Observed: "Web ▾" and "Fast Research ▾" picker chips inside the search field.
- **Copy for Proof-or-Silence:** the same inline-chip style for corpus scope ("RBI + Bank policy ▾").

**5c. Perplexity web composer**
- Observed:
  - Start screen: "+", "Search ▾" mode, an attachment icon, and the model picker "Gemini 3.1 Pro Thinking ▾" on the right.
  - Top-right: a "Scheduled ▾" chip.
  - Top nav tabs: Discover · Finance · Health · Academic · Patents (vertical scopes).
- **Copy for Proof-or-Silence:** mode and scope pickers are chips inside the composer, not a separate settings page.

**5d. Lovable, "Viewing:" banner for a past state**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Restore%20this%20version (result 2)
- Observed: top bar reads **"Viewing: [Add dark mode toggle]"** (a highlighted chip naming the version) with **"Back to latest"** on the left.
- **Copy for Proof-or-Silence:** when the as-of date is not today, show a persistent banner, "Viewing law as of 01-Apr-2019", with "Back to today". This is the clearest time-travel affordance found.

### 6. Version history, diff and audit logs

**6a. Plane web, Compare versions, the best diff found**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Compare%20versions (result 1)
- Observed:
  - The header strip reads **"Comparing  Aug 25, 2026 5:02 PM  vs  Current version"**.
  - The right panel, "Compare versions", has a "today" group of **checkbox rows**: "Current version", "Aug 25, 2026, 6:48 PM", "Aug 25, 2026, 5:02 PM", each with an author avatar and name. Two rows are ticked.
  - The body shows additions on a **pink/magenta tint** and removed paragraphs as **struck-through text on a hatched background**.
  - Footer link: "Back to version history".
- **Copy for Proof-or-Silence:** the clause-history diff. Tick two versions (e.g. "MD-KYC 2016 as amended 2023" vs "as amended 2025"), show a "Comparing A vs B" strip, and use purple/orange tints instead of pink.

**6b. Productboard, "Restore previous version" modal**
- Mobbin: same "Restore this version" search (result 1)
- Observed:
  - The modal has the content preview on the left and **"Saved versions"** on the right, grouped by "TODAY".
  - The top row reads "1 minute ago · **Latest version**", then timestamped rows (4:29 PM, 4:28 PM, …), each with the author "Alex Smith".
  - Footer: "Cancel" and "Restore this version".
- **Copy for Proof-or-Silence:** a version list for each clause, with valid_from as the timestamp, the amending circular in place of the author, and an "IN_FORCE" badge in place of "Latest version".

**6c. Lovable, inline revert card in chat**
- Observed: the card reads "**Revert to this version?** This will revert your project to how it looked on Dec 29 at 1:51 PM. Recent changes after this point stay in the chat and can be reapplied anytime." It has "Cancel" / "Revert" buttons and a "Preview version ↗" link.
- **Copy for Proof-or-Silence:** explain consequences in one sentence on the as-of switch: "Answers will use rules in force on 01-Apr-2019. Later amendments are shown as SUPERSEDED-in-future."

**6d. Intercom Knowledge, article Details panel**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Version%20history (result 1)
- Observed:
  - The right "Details" panel lists key-value rows: Type "Public article", Status "Draft", Article ID, Language, Created, Created by, Written by, Last updated, Last updated by. Each person has an avatar.
  - Then a **"Show version history"** link.
  - Header actions: Cancel · Save as draft · **Publish** (green).
- **Copy for Proof-or-Silence:** a clause metadata panel: Circular no., Clause, Status IN_FORCE, valid_from, valid_to, Superseded by, Source PDF p.7, then "Show version history".

**6e. Discord web, Audit Log**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Audit%20log (result 2)
- Observed:
  - Title "Audit Log", with filters top-right: **"Filter by User: All ▾"** and **"Filter by Action: All ▾"**.
  - Each row has an action-type icon, an avatar, and the sentence "alex_smith.mbn **updated roles for** json_mithe" with "Today at 2:59 PM" below, plus a › chevron.
  - The expanded row shows the field change: "Set the server verification level to **Low**".
- **Copy for Proof-or-Silence:** the audit trail rows read "officer.rao **asked** 'KYC re-KYC period' → ANSWER · 10:42". Expanded, they show the JSON fields plus `prev_hash → hash`. Add User and Action (ASK / APPROVE / RETURN / INGEST) filters.

**6f. Zendesk Admin Center**
- Same "Audit log" search (result 1)
- Observed: the Account card copy reads "Billing, security, audit log, and other account essentials". The audit log is buried in settings.
- Inferred: the anti-pattern for us. The audit trail should be a first-class nav item.

### 7. Review and approval queues (maker-checker)

**7a. Deputy web, Timesheets approval, the best queue found**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Approve (result 1)
- Observed:
  - Status tabs with counts: **All 13 · Pending 11 · Approved 2 · Discarded 0**.
  - Rows are grouped by person ("Alex Smith · 6 timesheets · 17.92h · $403.40").
  - Each row has a **status pill** (Pending amber, Absent red, Approved green), details, and a **per-row "Approve" button** on the right, plus "…".
  - Anomalies get a **red warning triangle** and red times.
  - The toolbar has a date range ("Wed 25 Feb – Tue 03 Mar"), "Group by team member ▾" and "View options ▾".
- **Copy for Proof-or-Silence:** the review queue: tabs "Pending checker 5 · Approved · Returned", rows grouped by maker, an outcome pill, an inline Approve that is disabled on your own items, and ⚠ on CONFLICT items.

**7b. Acctual web, Bills**
- Mobbin: same search (result 2)
- Observed:
  - Lifecycle tabs with count badges: **Draft 1 · Approve 0 · Ready for payment 4 · Paid 1**. "Approve" is highlighted.
  - A table follows: Vendor/Pay to, Amount, Method, Due date, Invoice #, Memo.
- **Copy for Proof-or-Silence:** model the lifecycle as tabs: Draft → Pending checker → Approved → Filed.

**7c. Airwallex web, dashboard**
- Mobbin: https://mobbin.com/search/apps/web?content_type=screens&sort=popularity&text_in_screenshot=Pending%20approval (result 1)
- Observed:
  - Cards for Bills, Reimbursements and Card Expenses, each with a status row: **"Pending approval 0 · To pay 1 · Overdue 1"** (Bills), plus "View all" and "+".
  - The Transfers card shows "Transfers pending approval 0" and "Batch transfers pending approval 0".
- **Copy for Proof-or-Silence:** an overview card per work type (Answers / Conflicts / Impact alerts), each showing "Pending checker · Open · Overdue SLA" counts.

**7d. Evernote Admin**
- Same search (result 2)
- Observed: a stat row of circles: 2 USERS · 0 **PENDING APPROVAL** · 0/2 SEATS REMAINING · 1 ADMINS. The left nav includes "Activity History" under Security.
- Inferred: lower value; it confirms that "Activity History" sits under Security in admin consoles.

**7e. Peec AI web, Sources (adjacent: source-type labelling)**
- Mobbin: web "Sources" search (result 1)
- Observed:
  - A "Top Domains" table with columns Domain, Used %, Avg. Citations, and a **Type pill** (UGC, Reference, Competitor, Institutional, Other) in distinct colours.
  - A "Domain types" bar list.
- **Copy for Proof-or-Silence:** label each source by type with a coloured pill: "RBI Master Direction", "RBI Circular", "Bank Policy (Board-approved)", "FAQ (non-binding)".

---

## Top 10 things to copy

1. **Intercom Copilot's abstention copy** (3a): say where we looked, what would help, and offer "nearest clauses →". Use neutral styling.
2. **Plane's Compare versions** (6a): "Comparing A vs B" strip, a checkbox version list, tinted inserts and struck deletions. Use this for the clause-history diff.
3. **Lovable's "Viewing: … / Back to latest" banner** (5d): a persistent "Viewing law as of DD-MMM-YYYY · Back to today" bar whenever the as-of date isn't today.
4. **Deputy's approval queue** (7a): count tabs, rows grouped by maker, status pills, inline Approve, and ⚠ anomaly markers. Self-approval disabled.
5. **ChatGPT's Sources/Activity sheet** (1a): two tabs, "Citations · n", rows grouped by source with number, title and excerpt. This is our evidence pane, plus a third "Withheld" tab.
6. **Rox's step header** (4a): "Step 2 of 4 · Verifying" with a progress bar, and grey sub-action chips that stay inspectable after completion.
7. **ChatGPT's provenance line** (1b): "Verified 6/8 · 5 citations · 3 circulars · as of …" above every answer.
8. **Granola's scope chip in the composer** (5a): "As of ▾" and "Bank profile ▾" chips inside the input, not in a settings page.
9. **Discord's audit log row grammar and filters** (6e): an "actor verb object · time" sentence, an expandable field change, and User/Action filters. Add our hash column.
10. **Intercom's Details panel** (6d): key-value clause metadata with "Show version history". Also use Perplexity's serif-for-content and sans-for-chrome split (2a) for verbatim quotes.

---

## Gaps

- **Paywall.** The free plan exposed only 2 screens per web app, the first flow per app, and 2 web / 5 iOS text-search hits per query. I could not open:
  - Perplexity's "Chatting with AI" and "Source" flows;
  - NotebookLM's chat, citation hover or source viewer;
  - any Claude web/iOS answer screen (only Claude's Max-plan paywall screen appeared in a hit; it reads "Use Research mode to generate thorough reports with citations").
- **Hover citation previews.** No hover or citation-popover screen was observed. Pattern 1's hover card is still supported only by the docs cited in `ui_research.md`.
- **Split view with a highlighted passage.** Not observed on Mobbin.
- **Apps not checked.** I did not check Harvey, Hebbia, Glean or Consensus. I did not open Elicit's app page, although Mobbin lists it.
- **Mobbin UI-element category filters** ("UI Elements ▾" in search) were not tried. Text-in-screenshot search was used instead.
- **Inferences need checking.** All "Copy for Proof-or-Silence" lines are my design inferences from single static screens. Interaction details (hover, animation, what expands) were not observed.
- **Unblocking.** A Mobbin Pro session (₹800/month, the user's decision) would unlock the Perplexity "Source" flow and the NotebookLM citation flows. Those were the highest-value targets I could not reach.
