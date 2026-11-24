# Landing page and graph visualisation research: Proof-or-Silence

Research date: 24 Nov 2026. Scope: the marketing landing page and the interactive graphs (landing and dashboard). This note builds on `ui_research.md`, `ui_pinterest_refs.md`, `ui_mobbin_flows.md` and the UI section of `reports/Proof or Silence next steps.md`, and does not repeat them. Those notes cover the app screens (citations, withheld tray, as-of scrubber, review queue). This one covers the page that sells the app, plus the graphs.

Labels:
- **Observed**: I saw it on the page or in the shot image.
- **Inferred**: my own recommendation.

## Method and access

- **Browser**: the built-in browser pane, browse and read only. Dribbble shot images were fetched by shot URL and laid out side by side in my own tab, for viewing only.
- **Dribbble**: public; about 120 shots scanned over 22 searches, 15 opened at full size.
- **Pinterest**: blocked by a login modal in the built-in browser, so I redid it in the user's **signed-in Chrome** (a new tab, closed afterwards; read only, no saves or follows). I ran 8 searches and pulled about 112 pins. Results are in section 1D.
- **Mobbin**: the built-in browser got `403 Forbidden`. In signed-in Chrome, Mobbin **Sites** opened, but the account is on the free plan, which shows only the 2 most popular examples per section, with "Get Pro" beyond that. I did not get around the paywall. I viewed the Hero, How It Works and Stats sections. Results are in section 1D.
- **Live sites visited**: Harvey, Hebbia and Legora (legal AI); YC companies Vulcan Technologies, Crimson, Cardamon and Kalinda; graph and dev tools Obsidian, Kumu, Neo4j and Linear, with Vercel used for section order.
- **Data**: graph specs use real data. I read a scratch copy of `backend/data/aiml02.sqlite`, since deleted, and `GET /conflicts` on the running local API (read-only).
- **Library facts**: sizes come from the bundlephobia API and licences from the npm registry, both checked 24 Nov 2026.

**Stack correction.** The brief says Next.js, but `frontend/` is **Vite 8 + React 19.3 + TypeScript**, with `@fontsource/ibm-plex-sans`, `-sans-devanagari`, `-serif` and `-mono` already installed. Every recommendation below works in either stack. The landing page can be the `/` route of the same Vite app, with the dashboard under `/app`.

---

## TL;DR

1. **Hero**: a full-bleed photo of warm reading-room light (direction A). The left 45% of the image is calm, so a paper-coloured scrim can sit under the headline. A product card overlaps the bottom edge of the image, showing one proven sentence with its citation chip and one **withheld** sentence. This is the Harvey "framed product over a textured image" composition (ref 1) combined with Meadow's "floating evidence cards joined by hairlines" (ref 9).
2. **Headline**: "Proof, or silence." Subline: "Ask about RBI rules and your own loan policies. Every sentence you see points to the exact clause, on its PDF page, in force on the date you choose. Anything we can't prove, we don't show."
3. **Signature section** (section 5a): "The law, as of any date." This is an SVG **swimlane time graph** of 12 real nodes (RBI circulars above, Example UCB clauses below). Dragging an as-of slider fades withdrawn circulars and lights up the real conflict between the RBI Master Direction ¶261(1) and Example UCB policy cl. 7.4. Build it in hand-written SVG with `d3-scale`, not a graph library.
4. **Section order**: hero → mono proof ticker → "every sentence earns its place" → as-of graph → "your policy vs the regulator" → how it works (5 steps) → numbers with confidence intervals → tamper-evident audit chain → built for a Tier 3 UCB → CTA. With no customers to show, the measured numbers and the live demo stand in for a logo wall.
5. **Dashboard graphs**: clause history timeline (SVG), conflict map (bipartite in `@xyflow/react`, with a matrix toggle), impact graph (`@xyflow/react` + `@dagrejs/dagre`, left→right), and the audit hash chain (plain HTML/SVG linked list).
6. **Libraries**: use `@xyflow/react` (MIT, 86 KB gz), `d3-scale`/`d3-time`, `d3-force` (ISC, 5.7 KB gz) if we need a corpus view, and `@dagrejs/dagre` (MIT, 15.5 KB gz). **Avoid** `elkjs` (EPL-2.0/GPL, 437 KB gz), `cytoscape` (136 KB gz, React wrapper inactive), `sigma` (WebGL, overkill for 69 edges) and `reagraph` (WebGL/3D). Lazy-load every graph so the hero image and headline are the LCP.
7. **One backend gap**: no endpoint returns the whole edge list. The landing graph should use a static fixture (exported below). The dashboard would benefit from `GET /graph?as_of=`. That is for the backend session, not this one.

---

## 1. References: what to copy from each

Fifteen visual references, then the graph and pipeline references, then a Pinterest and Mobbin pass (refs 16–23 and a Mobbin table). Each entry has a link, what I saw, and what to copy.

### A. Full-bleed or textured image heroes (live products)

**1. Harvey: harvey.ai**
- **Observed**:
  - Warm off-white page. A large serif headline, "Build a Frontier Legal Organization", on the left; a one-line subline and a black "Request a Demo" button on the right.
  - Below that, a product screenshot (dark sidebar, "Command Center", charts) inside a frame. The frame sits on a grey **ink-wash / dry-brush texture** image that fills the band edge to edge.
  - Section order: hero → "3,500+ Legal Organizations" → one platform → new release → product innovation → client impact → enterprise security.
- **Copy**: the composition. Headline and CTA on paper, then the product framed on a textured image band. It is the most restrained "background image" hero in the category and matches our palette. Swap the dry-brush grey for our ink-blue wash (direction B) or reading-room light (direction A).

**2. Hebbia: hebbia.com**
- **Observed**:
  - A full-bleed dusk city photo seen through vertical window blinds, with a dark gradient at the bottom.
  - A centred serif small-caps line, "INSTITUTIONAL INTELLIGENCE", one sans subline and one CTA.
  - Section order: hero → knowledge at work → product → how institutions use it → "built for the most demanding institutions".
- **Copy**:
  - The restraint: one line, one subline, one button over the photo.
  - The **blinds**: foreground occlusion gives depth without 3D. A reading-room window with shutters or a jaali (direction C) gives the same effect.

**3. Legora: legora.com**
- **Observed**: a full-bleed cinematic skyline at golden hour. A transparent nav floats over it, and the headline animates in.
- **Copy**: the transparent nav over the image (white text, a hairline under the nav once scrolled).
- **Avoid**: the skyline. It is the category cliché, and it says "big law firm", not "co-operative bank".

**4. Vulcan Technologies (YC S25, AI for government regulation): vulcan.ai**
- **Observed**:
  - A washed-out photo of **marble drapery / classical statuary**, low contrast, behind dense text.
  - A green serif headline. Two product paragraphs (JUSTINIAN, TRAJAN) on the left, a "Deployed in government" grid of agency names on the right, and Government / Commercial cards below.
- **Copy**: a classical image at about 15% contrast under a paper scrim, so dense paragraphs stay readable on top of it. It is the closest YC analogue to a "regulator's reading room": regulation-heavy, text-heavy, image as atmosphere.
- **Inferred**: our "Deployed in" grid becomes "Covers", with the RBI documents listed by circular number in Plex Mono.

**5. Crimson (YC S25, litigation AI): crimson.law**
- **Observed**:
  - A full-bleed night photo of a bridge and skyline. "Case intelligence for litigation teams."
  - Capability headings: "Know the case on day one", "Plead from the evidence", "**Spot the inconsistencies**", "Have the answer ready".
  - A differentiator line: "**Most legal AI is built for deals. Crimson is built for disputes.**"
  - The rest of the order: whole case file → practice areas → "Built for enterprise, secure by design" (SOC 2, GDPR).
- **Copy**: the differentiator sentence pattern, e.g. "Most legal AI drafts an answer and adds citations. Proof-or-Silence checks every sentence and withholds what it can't prove." Also the short imperative capability headings.

**6. Cardamon (YC W25, AI compliance for regulated finance): cardamon.ai**
- **Observed**:
  - A dark gradient hero: "Launch. Expand. Stay Compliant." with "10X faster" in red. A partner logo row.
  - Named agents: Horizon Scanning, Obligation Mapping, Gap Analysis, AI Reg Search Agent. Then "95% faster", a regulation coverage catalogue, "Built to be loved", integrations, dashboards.
- **Copy**: **name the capabilities as jobs a compliance officer already has**. Ours map one to one:

  | Their job name | Our feature |
  |---|---|
  | Horizon scanning | Impact of a new circular |
  | Obligation mapping | Obligations |
  | Gap analysis | Conflicts |
  | Reg search | Ask |

- **Avoid**: the dark-gradient SaaS look, and unmeasured "10X / 95% faster" claims. Every number we show is measured.

### B. Dribbble concepts with image or paper heroes

**7. Aequa: AI Legal Navigator (Odama)**: https://dribbble.com/shots/27844156-Aequa-AI-Legal-Navigator-Landing-Page
- **Observed**:
  - Cream paper. "The law, read closely. **Explained plainly.**" with the second phrase in a muted gold.
  - An **engraving/halftone illustration** of Lady Justice bleeding off the right edge.
  - A 3-stat row under the CTA ("€0", "<60s", "3 langs"). Then a full-width near-black band, numbered "01 · 02 · 03" steps, and an FAQ headed "Asked often. Answered plainly."
- **Copy**:
  - The paper + engraving-texture image.
  - The **stat row directly under the hero CTA**.
  - The two-part headline with the second half tinted.
- **Avoid**: Lady Justice. Use an Indian institutional motif (ref 14) or reading-room light instead.

**8. Clause: AI Legal Tech Website (André Ahlert)**: https://dribbble.com/shots/27849574-Clause-AI-Legal-Tech-Website
- **Observed**:
  - A big serif "Contracts reviewed in minutes, not weeks."
  - A product card (document view + "Liability cap missing" alert + risk score) floating over a still-life photo: leather-bound books stamped CONTRACTS / RISK / COMPLIANCE on marble, with a fountain pen.
  - A trust row of three icons under the CTA.
- **Copy**: a **product card over a still-life photo**.
- **Inferred**: our still life is a stack of buff-coloured file folders tied with tape, or a cloth-bound ledger (bahi-khata style) beside a printed circular. It reads Indian banking without logos.

**9. Meadow: SaaS research concept**: https://dribbble.com/shots/27892093-Meadow-Saas-Research
- **Observed**:
  - "Read, check, and cite with confidence." Engraving-style hands and flowers.
  - Floating UI cards (a chat box, image cards) joined by **thin hairline connectors with small node dots**, so the hero is itself a little graph.
  - Second section: "**Answers you can check, down to the exact sentence.**"
- **Copy**: the closest message match in the whole search. Copy the **hairline connectors between floating evidence cards** in the hero: answer sentence → chip → quote card → PDF page thumbnail. They tie the hero to the graph section and need no 3D.

**10. "flux": AI Native Compliance Platform (Mostafijur Rahman)**: https://dribbble.com/shots/27142498-AI-Native-Compliance-Platform
- **Observed**:
  - A full-bleed **Chinese-ink-wash misty mountain** landscape in pale greys and greens.
  - "Redefining compliance for the modern era" top-left with an email field and CTA.
  - Two dark stat cards ("10.6x Faster onboarding", "Future-proof compliance") overlapping the image bottom-right, and a round "START VIDEO" play button.
- **Copy**: an **ink-wash image with stat cards anchored onto it** (direction B). It proves a calm painterly background can carry hard numbers.

**11. Factly: accuracy-first fact-checking (Mike Taylor)**: https://dribbble.com/shots/27015009-Factly-Platform-Accuracy-First-Reporting-Verification-UI
- **Observed**:
  - Painted classical arches and ruins in warm light at the bottom, fading to white at the top.
  - A centred headline "Empowering reporters with real-time fact-checking tools" and a logo row.
- **Copy**: **the image fades into the paper colour at the top**. The headline sits on paper and the image rises beneath it, so contrast is never a problem. It is the safest way to put text on an aesthetic image.

**12. "Ledger": AI CFO platform**: https://dribbble.com/shots/27726868-AI-CFO-Platform-Landing-Page
- **Observed**: gilded baroque architecture under three dark dashboard cards. "Every business deserves a Chief Financial Officer" with the single word "business" in orange.
- **Copy**: **one accent word in the serif headline**. Ours: "Proof, or *silence*." with *silence* in ink-blue italic.

**13. Bonsai: Legal AI concept (Pablo Fernando Caprio)**: https://dribbble.com/shots/27762186-Bonsai-Legal-AI-Landing-Page-Concept
- **Observed**:
  - Near-black, with one lit object (a bonsai). "Cultivated *Legal Intelligence.*" in serif with an italic accent.
  - A spec list in mono beside the image, and a **mono ticker strip** along the bottom edge of the hero.
- **Copy**: the **mono ticker strip at the bottom of the hero**, carrying our measured numbers (section 2).

**14. Ahmedabad Heritage (brand mark)**: https://dribbble.com/shots/24923793-Ahmedabad-Heritage
- **Observed**: the Sidi Saiyyed mosque "tree of life" **jaali as fine gold line art** inside an arch, on dark brown, with a spaced serif wordmark.
- **Copy**: **an Indian motif as line art, not a photo**. Use a jaali or lattice as a 1px ink-blue SVG watermark at 6–8% opacity, behind the "how it works" band and in the footer (direction C). It says Indian institution without any real emblem.

**15. Knowledge-graph UX (Federal Decree-Law)**: https://dribbble.com/shots/27513527-Knowledge-Graph-UX
- **Observed**: one law node ("Federal Decree-Law No. 45 of 2021") fans out through curved hairlines to **counted category cards**: "18 Services", "3 Entities", "22 Related Federal Laws" (highlighted), "22 KPIs".
- **Copy**: the **fan-out-to-counted-groups** structure for the impact graph. A new circular → "7 obligations" → "12 Example UCB clauses hit, 3 conflicts".
- **Avoid**: the glass cards and glow.

### C. Graph, pipeline and time references

| Ref | Observed | Copy |
|---|---|---|
| **Obsidian**: obsidian.md | The graph view appears only inside the hero product screenshot, as one pane next to a note. The headline "Sharpen your thinking." is about the outcome, not the graph. | Show the graph **inside a product frame**, with a clause card next to it, not as abstract decoration. |
| **Kumu**: kumu.io | The hero is a product screenshot: a document text panel on the left ("The Madison Initiative"), a relationship map on the right. | Text + graph split in one frame. Our landing graph shows the verbatim quote panel beside the graph. |
| **Linear**: linear.app | Sections follow the work's lifecycle: "Intake and integrations → Planning and monitoring → AI and automations → Build, review, and ship → Changelog". | Present our pipeline as **numbered chapters** (section 2, step 6). |
| **Vercel**: vercel.com | Hero left; a three-line "For… / To… / Automated by…" list on the right; logo strip; then one H2 per use case. | The three-line right-hand list next to the headline: "For Tier 3 UCBs / Over 16 RBI circulars + your policies / Checked in code, not by trust". |
| **Graphie**: UK legislation network, [arXiv 2210.02165](https://arxiv.org/abs/2210.02165) | A D3 network of provisions; nodes coloured by Part of the Act; hover shows provision text; a **time slider** moves between provision versions, "latest" or "as enacted". | The closest academic precedent for our as-of graph. Copy hover-for-text and the "as enacted ↔ latest" presets. |
| **Neo4j Bloom Slicer**: [Neo4j blog](https://neo4j.com/blog/developer/slice-and-dice-your-graph-data-with-neo4j-bloom/) | A histogram time slider under the graph that filters nodes by a date property, with a **playback mode** that animates the window. | A **▶ play** button on our as-of slider that steps through each circular's effective date. |
| **Singapore Statutes Online provision timeline**: [SSO guide](https://sso.agc.gov.sg/Help/SSO-Guide/Article/18/Document-Timeline-Provision-Timeline) | Each version is a dot with its in-force date; clicking opens that version. | The dashboard clause-history timeline (section 5b, a). |
| **Zep Graphiti**: [blog](https://blog.getzep.com/beyond-static-knowledge-graphs/) | Edges carry `valid_at` / `invalid_at`; old edges are invalidated, not deleted, so point-in-time queries work. | A vocabulary check: our `valid_from`/`valid_to` + `WITHDRAWS` is the same idea. One line in the "How it works" copy: "Nothing is deleted. Superseded law stays in the graph with the date it stopped applying." |

### D. Pinterest and Mobbin (signed-in Chrome pass)

**Pinterest.** Searches run: library reading room website hero · legal ai website hero image serif · ink wash texture website landing page · paper texture website hero serif · fintech landing page editorial photography · compliance software website hero · indian heritage website design · knowledge graph website hero.

**16. "The Reading Hour"**
- **Pin**: https://in.pinterest.com/pin/931189660502246084/
- **Source**: x.com/BardhylBytyqi/status/2052372021028213144 (an X post, "every library deserves a website like this")
- **Observed**:
  - A **reading room in warm afternoon light**: tall window at the left, dark wooden shelves and a library ladder at the right, a plain wall in the middle.
  - A serif title, "The Reading Hour", sits directly on the wall.
  - Books stand on the table in the foreground.
- **Copy**: this is direction A almost exactly. The window light and the empty wall are where the headline goes.
- **Avoid**: the floating 3D books.

**17. XINNOTION "Story Library"**
- **Pin**: https://in.pinterest.com/pin/730849845826557541/
- **Source**: www.xinnotion.com/en/work.html
- **Observed**:
  - Cream paper. A serif headline with an italic second line: "A little escape. *A world to return to.*"
  - A painted seascape in a framed card beside a book-cover card. Then a row of book covers.
  - A deep-green band, "Same time. *New chapter.*", with a numbered 01/02/03 list. A small centred serif sign-off.
- **Copy**: the italic-second-line headline rhythm ("Proof, *or silence.*"), and the **numbered list on a single dark band** for how-it-works.

**18. Holistic psychotherapy site (hellomagic.io)**
- **Pin**: https://in.pinterest.com/pin/197806608630593557/
- **Source**: hellomagic.io/holistic-psychotherapy-nyc
- **Observed**:
  - The hero is split: an olive panel with a centred serif line on the left, and a **fine-art landscape painting** on the right.
  - The whole page is framed like a printed document on a taupe background, with a cream body and a hairline-ruled pull quote.
- **Copy**: the hero as a **framed document page sitting on a darker background**. It is a calm alternative to full-bleed if the image budget is tight.

**19. "Rooted in Heritage. Designed for Tomorrow." (Dasthak, Indian heritage moodboard)**
- **Pin**: https://in.pinterest.com/pin/1102678290067171415/
- **Source**: none on the pin
- **Observed**:
  - Near-black and warm brown. A large serif headline on the left.
  - A **carved arched jaali window throwing warm light into a dark stone room** on the right.
  - Lower sections: fabric and stone texture tiles, "The Poetry of Space", a type specimen and a material palette.
- **Copy**: the **jaali-light photo** for direction C. It proves the motif reads as Indian and premium without any emblem.
- **Inferred**: use it in a light version (light falling on paper), not the dark luxury version.

**20. VYOMARC (Indian studio)**
- **Pin**: https://in.pinterest.com/pin/1082623198507385667/
- **Source**: www.vyomarctech.com
- **Observed**: a Mughal arch silhouette and a miniature-painting textile in terracotta and red. "Modern Websites. Rooted in Purpose."
- **Avoid**: as a counter-example. Dense ornament plus monuments reads as hospitality or tourism, not regulation. Keep Indian motifs to line art or light.

**21. "PINCODE" ink illustration site**
- **Pin**: https://in.pinterest.com/pin/607141593561110948/
- **Source**: instagram.com/dariusu.web
- **Observed**:
  - A black-and-white **ink illustration of forest and clouds that frames an empty paper clearing** in the middle, where the serif text sits ("…*self-realization has* become an integral *part of happiness*").
  - Below it, a thick progress bar labelled "Over time".
- **Copy**: direction B as a **vignette**. Ink wash at the edges, clean paper in the centre for text. The "Over time" bar is a ready-made look for our as-of slider.

**22. MAI "Approachable Intelligence"**
- **Pin**: https://in.pinterest.com/pin/929852654336734094/
- **Source**: no link
- **Observed**: **dappled leaf-shadow light on a peach wall**, a large white serif headline with an italic first word, and one line of sub-copy.
- **Copy**: a **light-and-shadow texture as the whole background**. A jaali shadow on off-white plaster (direction C) can carry the hero the same way.

**23. Axial.ai "Discover New Worlds and Build the Future"**
- **Pin**: https://in.pinterest.com/pin/1091982240927616513/
- **Source**: a payhip.com blog listing
- **Observed**: light grey, with **dot-matrix / ASCII hands** reaching in from the left and right and a centred headline.
- **Copy**: a dot-matrix rendering as a monochrome, very light image treatment. An alternative to photos for the "how it works" band.
- **Avoid**: the hands. They are the same "Creation of Adam" cliché as below.

**Also observed**:
- Several pins were Renaissance-painting heroes: "A New Kind of Intelligence – Human at Heart" (a Creation-of-Adam crop) and "The ideas worth *your inbox*" (painted face over a green field, from a Kimi K3 newsletter experiment).
- **Inferred**: this look is saturated in 2026 AI marketing. Prefer reading-room light or an Indian line-art motif over old-master paintings.

**Mobbin Sites (free plan: 2 examples per section).**

| Section | Example | Observed | Copy |
|---|---|---|---|
| Hero | **Giga** | A full-bleed **misty blue mountain photo**; a centred light serif headline "AI that talks like a human. Handles millions of calls."; one small pill CTA | Confirms the restrained "serif on a calm photo, one CTA" hero in a shipped product |
| Hero | **Dovetail** | Dark; a faint **hairline grid with small node dots and connecting lines** (graph-like) behind "Real-time customer intelligence"; "evidence-backed" in the subline; logo row | A **faint clause graph drawn as hairlines behind the hero text** (an alternative to the photo, or layered at 8% on it) |
| How it works | **Superpower** | 4 numbered photo cards (1–4), each with a UI overlay, a short title and one line ("Test your baseline → Results explained → Build your protocol → Access everything") | 5 numbered cards, each with a tiny real UI crop (chip, quote, as-of badge, withheld stub) |
| How it works | **Portrait** | 3 columns of UI thumbnails joined by a **single hairline under them** with two small CTAs | The hairline as the "pipeline" connector |
| Stats | **Apollo** | Cream paper. A customer quote at the left, a logo row at the right, then **3 white cards with one huge number each** (70%, 4×, 64%) and a small label + logo | Our numbers section as 3–4 big-number cards, with **the CI and n under each number** where Apollo puts the logo |
| Latest | **Huey Lightshop** | Editorial: cream paper, serif italic paragraph, a small **pen line-drawing**, and a dark product photo (a lamp) in a framed panel | Line drawing + framed photo on paper. A small pen sketch of a ledger or circular could sit beside the "Built for a Tier 3 UCB" section |

---

## 2. Section order

**Observed across sites.**

| Site | Order |
|---|---|
| Harvey | hero → customer count → platform → new release → innovation → client impact → security |
| Hebbia | hero → knowledge at work → product → institution use cases → "built for…" |
| Crimson | hero → value → 5 capabilities → differentiator → whole case file → practice areas → security |
| Cardamon | hero + partner logos → named agents → speed stat → coverage → UX → integrations |
| Linear | hero → thesis → lifecycle chapters → changelog → CTA |
| Aequa (concept) | hero + 3 stats → dark band → 01/02/03 steps → proof cases → FAQ |

The common pattern is hero → proof → how it works → capabilities → numbers → trust/security → CTA.

**Recommended (Inferred).** We have no customers, so the proof slot is the measured numbers plus a live demo moment.

| # | Section | Content | Interactive? |
|---|---|---|---|
| 0 | Nav (transparent over the image) | Wordmark · How it works · The law over time · Numbers · Audit · **EN / हिं** · button "Open the demo" | – |
| 1 | **Hero** (full-bleed image, direction A) | Eyebrow, headline, subline, 2 CTAs, and a product card overlapping the image's bottom edge: one proven sentence with a chip, one greyed **withheld** sentence ("withheld: no quote found") | The card's chip opens a quote popover |
| 2 | **Proof ticker** (mono strip on the hero's bottom edge, ref 13) | `88.6% ACCURATE · 114 QUESTIONS · 95% CI 81.5–93.2` · `0 OF 375 QUOTES FABRICATED` · `19/19 UNANSWERABLE HANDLED` · `PLAIN RAG: 50%` · `≈ ₹0.38 PER ANSWER` | Static, or a slow CSS marquee (off under reduced motion) |
| 3 | "Every sentence has to earn its place." | A draft of 6 sentences; on scroll, each gets ✓ + chip or fades to a "withheld" stub; ends at "4 shown · 2 withheld". Use a real cassette answer | Scroll-driven (IntersectionObserver), not scroll-jacked |
| 4 | **"The law, as of any date."** | The swimlane as-of graph (section 5a). Real data | Drag, play, hover, click |
| 5 | "Your policy, against the regulator." | A two-column clause comparison with the real conflict: Example UCB Retail Loan Policy cl. 7.4 vs RBI UCB RBC Directions 2025 ¶261(1) (quotes in section 3). A "CONFLICT" tag and the page numbers | Hover highlights the conflicting values (2% vs "shall not levy") |
| 6 | How it works (5 numbered chapters, Linear style) | 01 Retrieve → 02 Draft (the model only drafts) → 03 Locate the quote on its page → 04 Check it was in force on your date → 05 Show it, or withhold it | Each step lights as it enters view |
| 7 | Numbers (a table, not hero stats) | Accuracy with CI, fabricated quotes, unanswerable handled, contradiction P/R with n, plain-RAG baseline, cost. Each row links to the eval report | – |
| 8 | "A record no one can quietly edit." | A hash-chain strip of 8 blocks; a "Tamper with row #5" button turns #5–#8 red, "Restore" fixes them | A local simulation, no backend call |
| 9 | Built for a Tier 3 UCB | Hindi answers (Plex Sans Devanagari sample), bank-profile chip, maker-checker review, cost per answer; "Example UCB is a fictional bank" | – |
| 10 | CTA + footer | "Ask your first question" + footer disclaimers: fictional bank, not affiliated with or endorsed by RBI, not legal advice, the corpus list with circular numbers | – |

---

## 3. Copy

**Eyebrow** (Plex Mono, small caps): `FOR URBAN CO-OPERATIVE BANKS · RBI CIRCULARS + YOUR OWN POLICIES`

**Headline options** (IBM Plex Serif):
1. **"Proof, or silence."** Recommended. It is the product name as a promise, with *silence* in ink-blue italic.
2. "Every answer, on the record."
3. "The circular says so. Here's the page."

**Subline**: "Ask about RBI rules and your own loan policies. Every sentence you see points to the exact clause, on its PDF page, in force on the date you choose. Anything we can't prove, we don't show."

**CTAs**:
- Primary: "Ask a question". It opens `/app/ask` with a seeded question such as "Can we charge a foreclosure fee on a ₹30 lakh floating-rate home loan?"
- Secondary: "See what we withhold ↓". It scrolls to landing section 3 ("Every sentence has to earn its place").

**Three-line list beside the headline** (Vercel pattern):
- For Tier 3 urban co-operative banks
- RBI circulars and Master Directions + your own policies
- Checked in code, not taken on trust

**Differentiator line** (Crimson pattern): "Most compliance AI writes an answer and adds citations. Proof-or-Silence starts from the citations, and drops any sentence it can't prove."

**Section 5 conflict card** (real text from `GET /conflicts?as_of=2026-11-24`):
- RBI UCB Responsible Business Conduct Directions, 2025, ¶261(1), p. 81: "For all floating rate loans granted for purposes other than business to individuals, with or without co-obligant(s), a UCB shall not levy pre-payment charges."
- Example UCB Retail Loan Policy v3 (fictional), cl. 7.4, p. 3: "Foreclosure charges of 2% plus GST on the principal outstanding shall be levied on all term loans pre-closed by the borrower."
- Tag: **CONFLICT · as of 24-11-2026**.

**Numbers block**: exact wording, all from `reports/Banking judge critique and evals.md`.

| Say | Footnote |
|---|---|
| **88.6%** accurate on 114 questions | Strict grader; Wilson 95% CI 81.5–93.2% |
| **0** hallucinated answers | Strict grader, same 114 questions |
| **0 of 375** quotes fabricated | Every quote located on its PDF page |
| **19 / 19** unanswerable questions handled | Refused or flagged correctly |
| Contradictions: precision **0.93**, recall **0.81** | 16 positives, 68 negatives (small set) |
| Plain RAG on the same fresh questions: **50%** | Top-5 dense retrieval + one prompt |
| About **₹0.38** per answer | $0.00455 mean at list price |

**Never write**: "100% faithful", "zero hallucination", "guaranteed compliant", "RBI-approved", or any real bank's name or logo.

**Write instead**: "No unverified sentence is shown." "Every quote is located on its page."

**Footer disclaimer**: "Example UCB is a fictional bank created for this demo. RBI documents are public circulars. Not affiliated with or endorsed by the Reserve Bank of India. Not legal advice."

---

## 4. Background image directions

These apply to every direction:
- **Text never sits on raw image.** Use either the Factly fade (image rises from the bottom into paper) or a left-side paper scrim, `linear-gradient(90deg, var(--paper) 0 38%, color-mix(in oklab, var(--paper) 70%, transparent) 52%, transparent 70%)`. Headline contrast should be at least 4.5:1 (AA) against the scrim.
- **Grain**: an SVG `feTurbulence` overlay at 3–4% opacity so the paper doesn't look flat.
- **Export**: 2560×1440 AVIF + WebP at ≤ 350 KB, a 1280×1600 portrait crop for phones, and a 32 px blurred LQIP inline. `fetchpriority="high"` on the hero image.
- **No** parallax, glass, orbs or 3D. Under `prefers-reduced-motion`, nothing moves.
- **No** RBI seal, Ashoka emblem, banknotes, real bank logos or real bank buildings. Banknote imagery also has its own reproduction rules, so leave it out entirely.

### Direction A (recommended for the hero): "Reading-room light"

Late-afternoon light falls through a tall window across a long wooden reading table with stacked buff file folders, a closed cloth-bound ledger and a few loose printed pages. The left 40% is a quiet wall in warm off-white. Shadows are soft slate, not black.

**Image-generation prompt**:
> Editorial photograph, wide 16:9. A quiet institutional reading room in India in late afternoon. Warm sunlight enters through a tall wooden-shuttered window at the right and falls across a long teak table. On the table: a neat stack of buff manila file folders tied with cotton tape, a closed dark-blue cloth-bound ledger, a few loose printed A4 pages with unreadable small print, a brass paperweight. The left 40% of the frame is a plain warm off-white plaster wall in soft shadow, empty, for text. Muted palette: warm paper white, sand, slate grey, one deep ink-blue accent (the ledger). Soft film grain, shallow depth of field, calm and archival. No people, no faces, no logos, no legible text, no flags, no emblems, no computer screens, no 3D render look, no glass, no neon.

**Stock sources**:
- **Unsplash**: search "reading room window light", "archive files", "old ledger", "library desk sunlight". Licence: free for commercial use, attribution appreciated but not required; you may not compile images into a competing service. Note that the Unsplash *API* guidelines do require attribution. [Licence](https://unsplash.com/license)
- **Pexels**: the same search terms, under a similar free licence. Check the licence page before use.

### Direction B (for the "how it works" band and the Harvey-style product frame): "Ink-wash ledger"

An abstract deep ink-blue wash bleeding into heavy cotton paper. Faint ruled ledger lines and a hairline margin rule run under it, like a blotted account book. Nearly monochrome.

**Prompt**:
> Abstract macro photograph of deep indigo ink diffusing into thick off-white cotton rag paper, soft watercolour blooms and feathered edges, faint printed ruled ledger lines in pale grey and a single thin red margin rule running vertically, large areas of untouched paper on the left half. Flat lighting, high resolution texture, calm, minimal, no text, no symbols, no objects, no 3D, no glossy highlights.

**Stock sources**:
- Unsplash: search "ink in water texture", "watercolor indigo texture", "ledger paper". Licence as above.
- **Inferred**: generate this one. Stock ink textures skew toward saturated purple.

### Direction C (accent, never the hero photo): "Jaali light"

A carved sandstone lattice (jaali) casting a patterned shadow onto paper. Or, preferred, the lattice drawn as 1px ink-blue line art (ref 14), used as a watermark at 6–8% opacity behind landing section 6 (How it works) and in the footer.

**Prompt (photo variant)**:
> Top-down photograph of a sheet of warm off-white handmade paper on a desk, with soft geometric shadow patterns cast across it by sunlight passing through a carved Indian sandstone jaali lattice screen out of frame. Shadows in soft slate blue, light warm. Mostly empty paper, minimal, serene, high detail texture, no text, no people, no monuments visible, no logos, no 3D.

**Prompt (line-art variant)**:
> Seamless vector line-art pattern inspired by Mughal and Gujarati jaali stone lattice: interlocking eight-point stars and hexagons, single-weight 1px deep ink-blue lines on transparent background, geometric, precise, no fills, no shading, tileable.

**Sources and licences**:
- **Wikimedia Commons** has jaali photos and public-domain Indian manuscript scans. Licences vary by file: many are CC BY-SA, which needs attribution and share-alike; old manuscripts are often tagged PD-Art. Check each file page.
- **The Met Open Access** (CC0, 492k+ images; search with the "Open Access" filter): [policy](https://www.metmuseum.org/policies/image-resources).
- **Rijksmuseum** (CC0, about 700k works): [report](https://gigazine.net/gsc_news/en/20210122-paintings-from-rijksmuseum-free).
- **Inferred**: the line-art variant is safest to draw or generate ourselves as SVG. It is also tiny (< 3 KB) and themeable.

**Not recommended**:
- Renaissance oil paintings: saturated, and Western.
- City skylines: the category cliché.
- Lady Justice: cliché, and not Indian.
- Isometric 3D (Neo4j's style).

---

## 5. Graph component specs

### Data available today (read from the DB, 24 Nov 2026)

**Size of the graph:**
- 22 documents in the DB: **15 RBI** (circulars, Master Directions, annexes, a press release) and **7 fictional Example UCB** (EUCB-S1…S7), plus 2,312 clause versions. The brief says "16 RBI circulars"; check the count before it goes into copy.
- Edges: `REFERS_TO` 61, `WITHDRAWS` 6, `AMENDED_BY` 2.
- `GET /conflicts` computes conflicts live: at 2026-11-24, CONFLICT 27, NEEDS_REVIEW 46, DIFFERENT_CONDITION 46, SUPERSESSION 0. At 2025-06-01: CONFLICT 19, SUPERSESSION 43.

**The real chain to animate:**

| Date | Event |
|---|---|
| 07-05-2014 | RBI-FORECLOSURE-2014 issued |
| 18-08-2023 | RBI-PENAL-2023 (effective 01-04-2024) and RBI-EMI-RESET-2023 issued |
| 29-12-2023 | RBI-PENAL-EXT-2023: `AMENDED_BY` edge, "effective date extended" (edge date 01-04-2024) |
| 15-04-2024 | RBI-KFS-2024 issued (effective 01-10-2024) |
| 02-07-2025 | RBI-PREPAY-DIR-2025 issued; `WITHDRAWS` RBI-FORECLOSURE-2014 from 01-01-2026 (repeal annex) |
| 01-10-2025 | EMI-RESET clause 2(ii) substituted (`AMENDED_BY`, IRA-AMEND-2025) |
| 28-11-2025 | RBI-WITHDRAWAL-2025 `WITHDRAWS` PENAL-2023, PENAL-EXT-2023, EMI-RESET-2023, KFS-2024 and PREPAY-DIR-2025. Consolidated into RBI-UCB-RBC-MD-2025 (¶261) |
| From 28-11-2025 | MD ¶261(1) and ¶261(2)(ii) **CONFLICT** with Example UCB cl. 7.4 (EUCB-S1) and cl. 9.3 (EUCB-S2) on prepayment charges |

**Endpoints:**
- `GET /documents`: dates and `withdrawn_on`.
- `GET /provisions/{chunk_id}/timeline?as_of=`: versions with status, and edges for that clause.
- `GET /conflicts?as_of=&profile=`
- `POST /impact`, `GET /impact/{id}`
- `GET /trace`, `GET /trace/verify-chain`

**Gap**: no endpoint returns all edges or a doc-level graph. Suggested for the backend session (not done here): `GET /graph?as_of=` → `{nodes:[{id, kind:'rbi'|'bank', title, issue_date, effective_date, withdrawn_on, status}], edges:[{type, src, dst, effective_date, quote, quote_doc_id, quote_page}], conflicts:[{a_clause, b_clause, subject, verdict}]}`. Conflicts should be deduplicated to clause pairs.

### 5a. Landing: `AsOfClauseGraph`, "The law, as of any date."

**What it shows.** A **swimlane time graph**, not a force layout. The x-axis is time (2014 → 2026, log-ish compressed before 2023). There are two lanes:
- **RBI** (top): one node per circular, plus the MD ¶261 clauses.
- **Example UCB** (bottom): EUCB-S1 cl. 7.4, EUCB-S2 cl. 9.3, EUCB-S6 product note.

A vertical **as-of cursor** sits on the axis. That makes the slider meaningful: everything left of the cursor has happened.

**Nodes** (12 to 14, real): FORECLOSURE-2014 · PENAL-2023 · PENAL-EXT-2023 · EMI-RESET-2023 ¶2(ii) original and substituted · KFS-2024 · PREPAY-DIR-2025 · IRA-AMEND-2025 · WITHDRAWAL-2025 · UCB-RBC-MD-2025 ¶261(1) · ¶261(2)(ii) · EUCB-S1 7.4 · EUCB-S2 9.3 · EUCB-S6.

**Edges**: the real `WITHDRAWS` and `AMENDED_BY` edges above, and `CONFLICTS` from `/conflicts`. Hide `REFERS_TO` by default, or show it as a toggle with very faint dotted lines.

**States per node at date *d*:**

| State | Rule | Style |
|---|---|---|
| NOT YET | issue_date > d | Hidden; a 1px dotted outline appears when within 60 days ahead (a "coming" hint) |
| IN FORCE | effective ≤ d and not withdrawn by d | Paper card, ink-blue left rule, Plex Sans label + Plex Mono date |
| ISSUED, NOT EFFECTIVE | issue ≤ d < effective | Dashed border, "effective 01-04-2024" |
| SUPERSEDED / WITHDRAWN | withdrawn_on ≤ d, or a later version exists | 35% opacity, title struck through, tag "WITHDRAWN 28-11-2025 · by RBI/…" |

**States per edge:**
- `WITHDRAWS` / `AMENDED_BY`: drawn only once its effective date ≤ d. A solid slate line with an arrowhead and a 300 ms stroke-dashoffset "draw-in".
- `CONFLICTS`: a curved line in conflict red, slowly marching dashes, drawn **only when both ends are IN FORCE**. A pill sits at its midpoint: "2% vs not permitted".

**Interactions:**
- **Slider**: drag snaps to event dates; ← / → step events; Home/End jump to the ends.
- **▶ Play**: Bloom-style playback, about 900 ms per event.
- **Presets**: "Original (2014)", "01-Apr-2024", "01-Jun-2025", "28-Nov-2025", "Today".
- **Hover a node**: a popover with the verbatim quote in IBM Plex Serif, `doc · clause · p.N`, valid-from/valid-to.
- **Click an edge**: shows the **edge's own verified quote** (`edges.quote` and `quote_page` exist and are `verified=1`), e.g. "Listed as S.No. 165 in RBI's 'Circulars Withdrawn'".
- **Live caption** (aria-live): "As of 01-Dec-2025: 3 RBI documents in force · 6 withdrawn · 3 conflicts with Example UCB policy." The UI session should recompute these numbers from the fixture.

**Data**: a static `landing-graph.json` exported once from the DB and `/conflicts` at each preset date, so the landing page needs no backend. It is ~10 KB.

**Build**:
- Hand-written SVG in React. `d3-scale` (scaleTime + a piecewise domain) and `d3-time` for ticks. CSS transitions on opacity and stroke-dashoffset.
- No graph library: about 150 elements, fixed layout.
- Wrap in `React.lazy` so it loads after the hero.

**Mobile (< 768 px)**: rotate the lanes so time runs top→bottom and the lanes become columns. The slider becomes a sticky bottom bar.

**Accessibility**: each node is a `<button>` in tab order sorted by date. A "View as table" toggle renders the same data as a table. No animation under reduced motion (edges just appear).

**Why not force-directed for the hero**: with 14 nodes and a time story, positions must stay stable while the slider moves. Force layouts jiggle and lose the left-to-right "history" reading. Graphie's force-style network is good for exploring, but weak for telling a time story.

### 5b. Dashboard graphs

**(a) Clause history timeline: `ProvisionTimeline`.** Data: `GET /provisions/{chunk_id}/timeline?as_of=`.
- One horizontal track per clause key.
- **Version bars** span valid_from → valid_to: open-ended bars fade at the right edge; the current version is solid ink and superseded ones are hatched.
- **Event markers** sit on the track: ◆ AMENDED_BY (with the amending circular), ✕ WITHDRAWS.
- The shared as-of cursor runs through all tracks, synced with the global as-of control.
- Clicking a bar opens that version's text with a diff against the previous version. The diff pattern is in `ui_research.md`.
- Example: EMI-RESET ¶2(ii), original → substituted 01-10-2025 → document withdrawn 28-11-2025.
- **Build**: SVG with `d3-scale` / `d3-time`; `@visx/axis` is optional. No graph library.

**(b) Conflict map: `ConflictMap`.** Data: `GET /conflicts?as_of=`, deduplicated to clause pairs.

*Default view*: a **bipartite layout**.
- Left column: RBI clauses in force on the date, grouped by subject (prepayment_charge, penal_charges, fees_not_in_kfs, fixed_rate_switch_offer…).
- Right column: Example UCB clauses grouped by document (Retail Loan Policy, Home Loan Agreement, KFS, Sanction Letters, Product Note).
- Edges by verdict: CONFLICT is a red solid line, NEEDS_REVIEW amber dashed, DIFFERENT_CONDITION grey dotted and hidden by default.
- Selecting an edge opens the two-column clause comparison in the side pane.
- **Build**: `@xyflow/react` with fixed positions. Two columns are computed, no layout engine; custom nodes are memoised and pan/zoom is on.

*Toggle*: a **matrix** of subject × bank document, with cells coloured by the worst verdict and labelled with a count. It handles the 27 + 46 + 46 rows better than a hairball and is the default on small screens.

*Second tab*: "Internal inconsistencies", the bank-vs-bank conflicts. Example: EUCB-S1 vs EUCB-S3 on prepayment_charge exists at both dates.

**(c) Impact graph: `ImpactGraph`, "what does this new circular hit?"** Data: `POST /impact` → `impact_items` (obligation_json, internal_json, verdict, severity, review_state).
- Three columns, left → right:
  - **Circular** node: e.g. RBI-UCB-RBC-MD-2025.
  - **Obligation** nodes: counted, collapsible groups, as in ref 15 ("7 obligations").
  - **Example UCB clauses** hit.
- Edge colour = verdict. Node badge = `review_state` (open / accepted / signed off).
- Clicking a clause opens the maker-checker drawer.
- Collapsed groups show counts ("12 clauses · 3 conflicts") until expanded.
- **Build**: `@xyflow/react` + `@dagrejs/dagre` (rankdir LR). With ~150 impact items, show the top 30 by severity and expand on demand.

**(d) Audit hash chain: `HashChain`.** Data: `GET /trace` (seq, ts, event_type, prev_hash, row_hash), `GET /trace/verify-chain`.
- A horizontal **linked list of blocks**, newest on the right. Each block shows `#seq · event_type · time · row_hash[0:8]`. An arrow from each block's `prev_hash` points to the previous block's `row_hash` (show matching 8-char prefixes on hover).
- "Verify chain" sweeps a progress highlight left → right. A broken link renders as a **snapped chain** with a red gap and the message "#889 expects prev_hash 87e4… · row #888 missing". The current real state is red at #889, per the UI session note.
- Virtualise: show the last 30, plus a "jump to #seq" box.
- **Build**: HTML flex + absolutely positioned SVG arrows, no graph library.
- The landing section 8 version is a local 8-block simulation that uses the same component.

**(e) Optional: `CorpusGraph`** (Rules page).
- A document-level overview: 22 docs, 69 edges, `REFERS_TO` included.
- **Build**: `d3-force` in SVG (5.7 KB gz) with nodes pinned by lane (RBI / bank). It is small enough that no WebGL is needed.

---

## 6. Library choices

Sizes from bundlephobia (minified / gzip, 24 Nov 2026); licences and React peer ranges from the npm registry.

| Library | Version | Licence | Min / gz | React 19 | Verdict |
|---|---|---|---|---|---|
| **@xyflow/react** (React Flow) | 13.0.3 | MIT | 255.6 / **86.3 KB** | peer `>=18` ✓ | **Use** for the conflict map and impact graph. Custom React nodes make clause cards easy. Per [docs](https://reactflow.dev/learn/advanced-use/performance): memoise custom nodes and don't read the full nodes array in children. Fine at < 300 nodes. |
| **d3-scale + d3-time** | 4.x / 3.x | ISC | ~12 KB gz together (estimate) | n/a (pure) | **Use** for the landing graph and the timeline axes. |
| **d3-force** | 3.0.1 | ISC | 15.3 / **5.7 KB** | n/a | Use only for the optional corpus graph. |
| **@dagrejs/dagre** | 3.1.3 | MIT | 45.9 / 15.5 KB | n/a | **Use** for the impact graph LR layout. Synchronous, but instant at our size. |
| @visx/axis, @visx/shape | 4.0.0 | MIT | shape 10.5 KB gz | `^18 \|\| ^19` ✓ | Optional for axes; hand SVG is enough. |
| motion | 14.14.0 | MIT | 183.5 / 62.8 KB | ✓ | Skip. CSS transitions cover fades and draw-ins. |
| sigma + graphology + @react-sigma/core | 4.0.6 / 0.26 / 6.0 | MIT | 94.6 + 12.5 + 3.2 KB gz | `^18 \|\| ^19` ✓ | Skip. WebGL is for thousands of *connected* nodes; we have 22 docs / 69 edges. Canvas labels are hard to style as paper cards. |
| cytoscape (+ react-cytoscapejs) | 3.35.0 | MIT | 431.5 / 135.6 KB | wrapper last pushed Jan 2025, Snyk "inactive" | Skip. Heavy, and the wrapper is stale. |
| elkjs | 0.13.0 | **EPL-2.0 OR GPL-3.0** | 1,429 / **436.8 KB** | n/a | **Avoid**: a copyleft-family licence and huge. dagre is enough. |
| reagraph | 4.32.0 | Apache-2.0 | 1,347 / 376.3 KB | ✓ | Avoid: WebGL with 3D modes, against the "no 3D" rule. |
| react-force-graph-2d | 1.29.2 | MIT | 177 / 58.4 KB | peer `*` | Avoid: canvas, and the same family ships 3D/VR variants. |

**Total added for the dashboard**: about 110 KB gz (React Flow + dagre + d3 bits). The landing page adds only about 12 KB gz (d3-scale/time) plus our SVG. Load all graphs through `React.lazy` + `Suspense` with a paper-coloured skeleton.

---

## 7. ASCII wireframes

### Desktop (1440 px)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ◼ Proof-or-Silence   How it works  The law over time  Numbers  Audit   EN|हिं  [Open demo]│  ← transparent nav
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                         ▒▒▒▒▓▓▓▓ window light ▓▓▓▓▒▒▒▒▒▒▒▒│
│░ FOR URBAN CO-OPERATIVE BANKS ·                       ▒▒▓▓  stacked files, ledger  ▓▓▒▒│
│░ RBI CIRCULARS + YOUR POLICIES                        ▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒│
│░                                     For Tier 3 UCBs  ▒▒▒▒▒ (photo, direction A) ▒▒▒▒▒▒│
│░ Proof, or *silence*.                RBI rules + your own policies ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░ (serif, 88px)                       Checked in code, not on trust ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░ Ask about RBI rules and your own loan policies. Every sentence ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░ points to the exact clause… Anything we can't prove, we don't show.▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░ [ Ask a question ]   See what we withhold ↓  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░ paper scrim ░░░░░░░░░░ ┌──────────────────────────────────────────────┐ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░░░░░░░░░░░░░░░░░░░░░░░░ │ ✓ A Tier 3 UCB shall not levy any pre-payment│──● quote card │
│                         │   charges on loans up to ₹50 lakh. [RBI MD ¶261(2)(ii) p.81]│  │
│                         │ ░ withheld: "Most banks waive this fee." — no quote found │  │
│                         └──────────────────────────────────────────────┘    hairline   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ 88.6% ACCURATE · 114 Qs · CI 81.5–93.2 │ 0/375 QUOTES FABRICATED │ 19/19 UNANSWERABLE │ … │  ← mono ticker
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Every sentence has to earn its place.          draft ▸ ✓ ✓ ░ ✓ ░ ✓   → 4 shown · 2 withheld│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ The law, as of any date.                                    [Original][Apr-24][Today] ▶ │
│ RBI   ┤ FORECLOSURE-14 ─────────────────────────┐withdraws  ┊ MD ¶261(1) ●━━━━━━━━┓   │
│       ┤      PENAL-23 ─amended→ PENAL-EXT-23 ────┤          ┊ MD ¶261(2)(ii) ●━━━┓┃   │
│       ┤      EMI-RESET ¶2(ii) ──substituted 01-10-25 ─┤     ┊                     ┃┃   │
│       ┤              KFS-24 ─────────────────────┤ WITHDRAWAL-25 (28-11-25)        ┃┃   │
│ Bank  ┤ Retail Loan Policy cl.7.4 ●━━━━━━━━━━━━━━━━━━━━━━━━━┊━━━━ CONFLICT ━━━━━━━┛┃   │
│       ┤              Home Loan Agreement cl.9.3 ●━━━━━━━━━━━┊━━━━ CONFLICT ━━━━━━━━┛   │
│       └──2014────────2023──────2024──────2025──────────────┊as-of 01-12-2025──2026──   │
│ "As of 01-Dec-2025: 3 RBI docs in force · 6 withdrawn · 3 conflicts"     [View as table]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Your policy, against the regulator.   │ RBI MD ¶261(1) p.81 (serif) │ Example UCB 7.4 p.3 │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ How it works  01 Retrieve → 02 Draft → 03 Locate quote → 04 Check date → 05 Show/withhold │ ← jaali line-art watermark
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Numbers (table with CI + footnotes)     │  A record no one can quietly edit  [#1]→[#2]→…[#8]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Built for a Tier 3 UCB · हिंदी उत्तर · maker-checker · ≈ ₹0.38/answer                       │
│ [ Ask your first question ]      Example UCB is fictional · Not affiliated with RBI · …  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (375 px)

```
┌───────────────────────────┐
│ ◼ PoS          EN|हिं  ☰ │
│ ▓▓ photo (portrait crop) ▓│
│ ▓▓ fades to paper ↓      ▓│
│ Proof, or *silence*.      │
│ subline (3 lines)         │
│ [ Ask a question ]        │
│ ┌ proof card ───────────┐ │
│ │ ✓ sentence [chip]     │ │
│ │ ░ withheld stub       │ │
│ └───────────────────────┘ │
│ 88.6% · 0/375 · 19/19 …   │  ← ticker wraps to 2 lines
│ The law, as of any date   │
│ 2014 ┬ RBI │ Bank         │  ← time runs downward
│      ●     │              │
│ 2025 ●─────┼──● CONFLICT  │
│ [◀  01-12-2025  ▶] [▶]   │  ← sticky slider
└───────────────────────────┘
```

---

## 8. Visual tokens

These come from `ui_research.md`; there is no new palette here. Hex values are approximate suggestions, not sampled.
- **Paper**: ≈ `#F6F3EC`. **Ink text**: slate ≈ `#1F2933`. **One accent**: ink blue ≈ `#1E3A8A`.
- **Conflict red** ≈ `#B42318` and **review amber** ≈ `#B54708`: status only, never decoration.
- **Type**: IBM Plex Serif for the headline and verbatim law text (already installed in `frontend/`). IBM Plex Sans + Plex Sans Devanagari for the UI. Plex Mono for clause IDs, dates, hashes and the ticker.
- **Hairlines**: 1px slate at 20%. Card radius 6px. Shadows only on the overlapping hero card: one soft shadow, no blur-glass.

---

## Gaps

- **Mobbin** is on the free plan, which shows 2 examples per section. A Pro account would allow a fuller Hero / How It Works / Stats sweep.
- **Exact assets not chosen**: I did not choose a specific Unsplash or Commons image. Pick a final image (or generate one) and record its URL and licence in the repo with the asset.
- **Live numbers not computed**: the landing-graph caption numbers in the wireframe are illustrative. Compute them from the exported fixture.
- **Sizes**: bundle sizes are bundlephobia's (they include dependencies; tree-shaking may reduce them). The `d3-scale + d3-time` figure is my estimate.

## Sources

- Live sites: [Harvey](https://www.harvey.ai/), [Hebbia](https://www.hebbia.com/), [Legora](https://legora.com/), [Vulcan Technologies](https://vulcan.ai/), [Crimson](https://www.crimson.law/), [Cardamon](https://cardamon.ai/), [Kalinda](https://www.kalinda.ai/), [Obsidian](https://obsidian.md/), [Kumu](https://kumu.io/), [Linear](https://linear.app/), [Vercel](https://vercel.com/).
- YC directory: [YC Legal companies (Spring 2025–Winter 2026)](https://www.ycombinator.com/companies?industry=Legal), [YC Compliance](https://www.ycombinator.com/companies/industry/compliance), [YC Regtech](https://www.ycombinator.com/companies/industry/Regtech).
- Dribbble shots: as linked in section 1 (refs 7–15). Pinterest pins and Mobbin Sites: as linked in section 1D.
- Graph precedents: [Graphie, arXiv 2210.02165](https://arxiv.org/abs/2210.02165); [Neo4j Bloom Slicer](https://neo4j.com/blog/developer/slice-and-dice-your-graph-data-with-neo4j-bloom/); [Singapore SSO provision timeline](https://sso.agc.gov.sg/Help/SSO-Guide/Article/18/Document-Timeline-Provision-Timeline); [Zep Graphiti](https://blog.getzep.com/beyond-static-knowledge-graphs/).
- Libraries: [React Flow performance](https://reactflow.dev/learn/advanced-use/performance), [React Flow layouting](https://reactflow.dev/learn/layouting/layouting), [@xyflow/react on npm](https://www.npmjs.com/package/@xyflow/react), [sigma.js](https://www.sigmajs.org/), [react-cytoscapejs on Snyk](https://security.snyk.io/package/npm/react-cytoscapejs), [visx](https://airbnb.io/projects/visx); sizes from bundlephobia.com and licences from registry.npmjs.org (24 Nov 2026).
- Image licences: [Unsplash licence](https://unsplash.com/license), [Unsplash attribution help](https://help.unsplash.com/articles/2612337-do-i-have-to-give-credit-to-a-photographer-when-i-use-their-photo), [The Met image resources](https://www.metmuseum.org/policies/image-resources), [Rijksmuseum CC0 release](https://gigazine.net/gsc_news/en/20210122-paintings-from-rijksmuseum-free).
- Harvey teardown (opinion): [Landing Doctors](https://landingdoctors.com/teardowns/harvey-ai).
- Our numbers: `reports/Banking judge critique and evals.md`. Graph data: `backend/data/aiml02.sqlite` (read-only copy) and `GET /conflicts` on the local API.
