# Slide-level UI/UX patterns for a 1920x1080 projected hackathon pitch deck (AI document-verification product with real web UI)

Tags used: [RESEARCH] = peer-reviewed or controlled study; [PRACTITIONER] = published practitioner guidance/data (not peer-reviewed); [OPINION] = expert opinion/blog; [INFERENCE] = my inference for this deck.
Research effort note: ~16 tool calls; mostly search-result summaries, few full-page fetches. Numbers below are as reported by the cited pages; verify primary sources before quoting externally.

## 1. Visual hierarchy, text density, recall, cognitive load (assertion-evidence, Duarte, Tufte, Mayer)

### Takeaway
The best-supported rule is: sentence headline stating the claim + one visual as evidence, with extraneous material removed. Controlled studies favor this for comprehension of complex ideas and delayed recall, but NOT for short-term recall of simple facts. Mayer's coherence and spatial-contiguity principles have the strongest effect sizes; redundancy (on-screen text duplicating narration) is weakest but still advises against reading slides aloud.

### Cited Findings
- Assertion-evidence (Alley & Neeley, 2005) pairs a one-sentence assertion headline with visual evidence instead of topic-phrase headline + bullets. [RESEARCH origin] — [Penn State Scientific Presentations research page](https://writing.engr.psu.edu/research.html)
- ASEE study: 55 students saw topic-subtopic slides vs 56 with assertion-evidence; assertion-evidence group scored higher on complex-concept questions; topic-subtopic group did not significantly beat them on simple facts. [RESEARCH] — [PSU Pure record](https://pure.psu.edu/en/publications/assertion-evidence-slides-appear-to-lead-to-better-comprehension--2/)
- Companion summary: common-practice slides gave better short-term recall of simple statistics; assertion-evidence gave better long-term recall of key ideas. [RESEARCH] — [ASEE PEER](https://peer.asee.org/17510)
- Study of 110 engineering students: assertion-evidence group had better comprehension, fewer misconceptions, lower perceived cognitive load and stronger delayed recall. [RESEARCH] — [PSU Pure record](https://pure.psu.edu/en/publications/how-the-design-of-presentation-slides-affects-audience-comprehens/)
- Alley's experiments reportedly found students better recalled the main assertion with sentence headlines than phrase headlines+bullets. [PRACTITIONER report of research] — [Inc.](https://www.inc.com/sims-wyeth/the-simple-formula-for-better-power-points.html)
- A "32% retention gain" figure circulates in a CMU handout but I could not verify it; do not cite. — [CMU handout](https://www.andrew.cmu.edu/course/18-847F/lectures/power_point_presentation.pdf)
- Mayer effect sizes (note sources disagree): coherence 0.86 (23/23 tests in older Cambridge chapter; 18/19 in newer UNH table); signaling 0.41 (24/28, Cambridge) vs 0.70 (26/28, UNH); redundancy 0.10 (8/12, UNH; weakest, below Hattie's 0.40); spatial contiguity 0.82 (9/9, UNH) vs 1.10 (22/22, Chartered College summary). [RESEARCH] — [Mayer summary, UNH](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf); [Cambridge Handbook chapter](https://cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning/F29A19FCD34C542806F736E0661C05F5); [Chartered College](https://my.chartered.college/?p=6958)
- Duarte Glance Test: audience should grasp a slide's meaning in 3 seconds or less ("glance media"); focus each slide on one clear idea; use contrast and whitespace to emphasize the key item. Duarte's page sets no word limit. [PRACTITIONER] — [Duarte](https://www.duarte.com/resources/slide-glance-test/); [Duarte guide](https://www.duarte.com/resources/guides-tools/the-glance-test/); originally an HBR 2012 piece (per search summary) — [Small Wars Journal repost](https://smallwarsjournal.com/2012/10/22/do-your-slides-pass-the-glance-test/)
- Tufte: PowerPoint's default bullet style "suffocates" evidence; his analysis of a NASA/Boeing Columbia debris slide (key finding buried in small type at bottom of a six-bullet slide; "significantly" used with several meanings) was cited in the Columbia Accident Investigation Board report, which said a senior manager could read the slide without realizing the danger. [OPINION, but formally cited by CAIB] — [Tufte, Columbia evidence](https://www.edwardtufte.com/notebook/the-columbia-evidence/); [IEEE ProComm](https://procomm.ieee.org/engineering-by-powerpoint)
- Apple keynote style: one theme per slide; Gallo's count of a 2016-era keynote found most text slides had 1-2 words, average about 3 words; iPhone 6 keynote's first 10 slides had 9 words, 6 photos, 1 video. [PRACTITIONER commentary, not Apple guidelines] — [Gallo/Inc.](https://www.inc.com/carmine-gallo/ho-present-like-an-apple-executive.html); [Entrepreneur](https://www.entrepreneur.com/article/237457); [Medium: how Apple makes slides](https://medium.com/adventures-in-consumer-technology/this-is-how-we-make-slides-at-apple-b8a84352bf6d)
- Investor deck viewing time (DocSend, proprietary data, not peer-reviewed): ~3m44s average in 2015; ~4 min 2020; under 2 min for seed decks in 2023; investors spent 24% less time per deck in 2022 vs 2021. — [TechCrunch 2015](https://techcrunch.com/2015/06/08/lessons-from-a-study-of-perfect-pitch-decks-vcs-spend-an-average-of-3-minutes-44-seconds-on-them); [TechCrunch 2022](https://techcrunch.com/2022/09/22/science-of-pitch-decks/amp); [DocSend/Dropbox](https://www.dropbox.com/resources/docsend-pitch-deck-research). Relevance caveat: this is read-alone decks, not presented decks.

### Inferences
- [INFERENCE] For a 3-minute presented deck with ~5-7 slides, each slide gets ~15-30 s; the audience is listening, so any sentence beyond the headline competes with narration (Mayer redundancy/split-attention logic). Target: headline (<=12-15 words) + one visual + <=1 line of support.
- [INFERENCE] The assertion-evidence advantage is for complex/relational content and delayed recall - exactly what a judge must remember after seeing 20+ teams. Short-term simple-fact recall is not helped, so keep the one number you want remembered huge and alone.
- [INFERENCE] Tufte's Columbia lesson maps directly to "honest numbers": never bury a caveat (n, CI) in small gray text; put it on the slide in readable size.

### Gaps
- No peer-reviewed study found giving an optimal words-per-slide number; all numeric word limits (3 words Apple avg, 6x6, 10-20-30) are practitioner heuristics.
- Garr Reynolds/Presentation Zen specifics not fetched (only general knowledge); not cited.
- I did not verify Mayer's numbers against primary meta-analyses; sources conflict as noted.

## 2. Font sizes and words per slide for projected rooms

### Takeaway
Practitioner consensus: body text 24 pt is a bare floor, 28-32 pt is safe, titles 36-44+; on a 1920x1080 canvas PowerPoint's 13.33in x 7.5in slide maps 1 pt = 2 px-ish at 144 DPI, so check sizes in PowerPoint points not pixels.

### Cited Findings
- 8H/legibility rule: minimum legible text height from distance (back-row distance in inches / 400), a minimum not a comfort size. [PRACTITIONER] — [Packt](https://subscription.packtpub.com/book/business-and-other/9781839215339/2/ch02lvl1sec10/B15701_13.xhtml); [Waterloo guidelines](https://ece.uwaterloo.ca/~dwharder/Presentations/Guidelines/VisualAids/TextFormat/Size/)
- Screen-height rules: text >= 1/25 of screen height (~22 pt on a standard slide) or 1/20 (~27 pt). [PRACTITIONER] — [Waterloo](https://ece.uwaterloo.ca/~dwharder/Presentations/Guidelines/VisualAids/TextFormat/Size/)
- UF/IFAS: min 24-28 pt text and figures; 32-36 pt subtitles. [PRACTITIONER] — [UF IFAS WC104](https://edis.ifas.ufl.edu/publication/WC104/pdf)
- Microsoft/Kawasaki-style "10-20-30": no font below 30 pt; others suggest 30-34 pt for large halls; 24 pt cited as accessibility guideline. [OPINION/PRACTITIONER] — [BrightCarbon](https://www.brightcarbon.com/blog/presentation-font-size); [Beautiful.ai](https://www.beautiful.ai/blog/what-font-size-is-best-for-presentations)
- Quick test: if you can't comfortably read the slide from 6-10 ft with the laptop screen, it's too small. [OPINION] — [Beautiful.ai](https://www.beautiful.ai/blog/what-font-size-is-best-for-presentations)
- Footnotes and chart labels can be smaller than body, but main text should be well above the floor. — same sources.

### Inferences
- [INFERENCE] Proposed type scale (PowerPoint pt on 13.33x7.5 in slide): headline 36-44; hero number 120-200; body/support 24-28; chart labels 20-24; source/n footnote 14-16 (never below 14 for anything a judge must read; put caveats that matter at >=18).
- [INFERENCE] Budget for a 15-20 s look: ~25-35 total words including headline (reading ~200-250 wpm silent leaves 5-10 s for ~15-30 words while still glancing at the visual) and <=5-7 distinct objects. This is derived, not found in a source.
- [INFERENCE] Hackathon rooms/judge-table laptops vary; design for the projector case and the laptop case both by using >=24 pt.

### Gaps
- No controlled study on words readable in 15-20 s during a talk; reading-speed numbers are general knowledge, not sourced here.

## 3. Data-slide patterns (big number, vs-baseline bars, direct labels, CI/n, small multiples)

### Takeaway
One chart, one message, title states the finding, direct labels instead of legend, honest n and interval. For small n, show the raw points or a labeled interval rather than bare bars.

### Cited Findings
- Storytelling with Data / data-viz guides: replace legends with direct labels to remove back-and-forth look-up (extraneous load); but direct labeling can get messy when many series are close, so a legend is acceptable then. [PRACTITIONER] — [SWD data labels post](https://www.storytellingwithdata.com/blog/2012/06/drawing-attention-with-data-labels); [EU data viz guide: direct labelling](https://data.europa.eu/apps/data-visualisation-guide/direct-labelling); [Flourish](https://flourish.studio/learn/text/)
- SWD: labeling every point clutters; label selectively to draw attention. — [SWD](https://www.storytellingwithdata.com/blog/2012/06/drawing-attention-with-data-labels)
- FT (John Burn-Murdoch): titles, annotations and labels are what viewers remember; a cited study found people read chart title, then axes, then data, and the version with a strong narrative title plus several annotations did best. [PRACTITIONER citing a study I could not locate] — [GIJN](https://gijn.org/stories/data-visualization-storytelling-tips-john-burn-murdoch/)
- FT Visual Vocabulary: choose chart type by the relationship shown (e.g., deviation, ranking, correlation). — [FT chart-doctor repo](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)
- Uncertainty: bar+error-bar charts do not reliably convey uncertainty (Correll & Gleicher); audiences read CI limits as min/max and read non-overlapping bars as "significant"; with small n show individual data points (one source: overlay points when n<50) and state n; label what the bars mean (SD vs SE vs 95% CI). [RESEARCH + PRACTITIONER] — [Correll & Gleicher](https://vis.mit.edu/classes/6.859/readings/pdfs/Corell-ErrorBarsConsideredHarmful.pdf); [EU guide](https://data.europa.eu/apps/data-visualisation-guide/error-bars-and-the-cone-of-uncertainty); [small-samples chapter](https://mohammedalisharafuddin.github.io/quantitative-analysis-with-small-samples/chapters/part-d-reporting--chapter-18-visualising-uncertainty-and-presenting-results.html)
- Apple/Gallo: attach a single statistic to a photo/visual when you want it linked to a product. [OPINION] — [Gallo/Inc.](https://www.inc.com/carmine-gallo/ho-present-like-an-apple-executive.html)

### Inferences
- [INFERENCE] "Us vs plain baseline" slide: two or three horizontal bars max (baseline LLM / baseline RAG / ours), bars sorted, our bar in the single accent color and baselines in gray, value labels at bar ends, series names written at the bar (no legend), a 14-18 pt line "n = X questions, 95% CI [a, b], held-out set" directly under the chart, not in a footer. If n is small (e.g., tens), draw dots for per-item results or a whisker with CI text rather than a bare bar.
- [INFERENCE] Big-number slide: one number at 120-200 pt, a 24-28 pt noun phrase defining it, a 16-18 pt qualifier (n, date, split). Pair with a real screenshot crop where the number appears if possible.
- [INFERENCE] Small multiples are rarely worth it in a 3-minute deck; use only if the same metric across 3 document types shows a consistent pattern, max 3 panels.
- [INFERENCE] Do not truncate the y-axis on bar charts; start at 0 (standard practice; not sourced here).

### Gaps
- Did not fetch SWD book text; "direct label" guidance is from secondary summaries. No source found on confidence-interval presentation specifically for slides with n<100.

## 4. Before/after and competitor comparison slides

### Takeaway
Feature check-matrices are contested: some guides call them easiest to evaluate, others call the 10-row checkmark grid the most common round-killer. Credibility comes from honest criteria (including rows where you lose), few rows (3-5), and evidence rather than self-awarded ticks. 2x2s are also commonly misused when the founder is alone in the winning corner.

### Cited Findings
- 2x2 is the most common competition format and commonly misused; investors see through axes that flatter the founder (Hunter Walk via Homebrew, as summarized). [PRACTITIONER] — [Deckary](https://deckary.com/blog/competitive-landscape-slide); [Papermark](https://www.papermark.com/blog/competitor-analysis-pitch-deck)
- One guide: comparison table (rows = capabilities, columns = you + 3-5 competitors) is harder to game and easier to evaluate. — [Papermark](https://www.papermark.com/blog/competitor-analysis-pitch-deck)
- Another guide: skip the 10-row checkmark grid; use use-case-based comparison or a 2x2 with your two strongest differentiators; win-rate evidence beats feature comparison. — [WaveUp](https://waveup.com/blog/how-to-make-a-winning-competition-slide-for-your-pitch-deck/)
- Include dimensions where you do not win to look credible. — [Papermark](https://www.papermark.com/blog/competitor-analysis-pitch-deck); [echai](https://echai.ventures/startingup/pitch-deck/what-is-the-right-way-to-show-competition-without-either-ignoring-rivals-or-trashing-them)

### Inferences
- [INFERENCE] For this product: replace the check-matrix with a measured before/after on the same input: left = "plain LLM answer" (fluent, uncited, one claim wrong, highlighted in red), right = "ours" (each claim with a source span, one flagged as unsupported/abstained). Same document, same question, same crop size, identical layout so the eye diffs it. This is "evidence, not assertion" and avoids the self-scored grid.
- [INFERENCE] If a matrix is demanded: max 4 rows x 4 columns, rows are verifiable behaviors ("cites exact source span", "abstains when unsupported", "checks arithmetic in code", "works offline/on-prem"), at least one row where a competitor beats you, and highlight the "only us on all four" via one outlined row/column rather than a column of green ticks everywhere. Use text values ("quotes span" / "none") rather than bare check/cross.
- [INFERENCE] Always show baselines you actually ran (named, version) rather than generic competitor logos.

### Gaps
- No empirical study on which comparison format investors/judges trust more; all sources are blog/VC advice with mixed conclusions.

## 5. Showing a live product inside slides (screenshots, callouts, frames, builds, SaaS exemplars)

### Takeaway
Use real, cropped screenshots with <=3 numbered callouts in one color system, text outside the UI, zoom insets for small details, and build callouts progressively. Frames/browser chrome only when it adds context. Published SaaS-deck specifics (Linear, Stripe, Vercel, Notion, Glean, Harvey, Hebbia) were NOT verified in this research.

### Cited Findings
- Documentation style guides: keep callouts short (< one sentence); split when more than ~3-4 numbered actions; crop to the smallest area giving context; numbered labels for sequences; keep text outside the UI element, linked by arrow; use zoom-in insets for small controls; one consistent color/symbol system across the deck; blur/replace sensitive data; build callouts natively in PowerPoint so they can be animated. [PRACTITIONER] — [Dynatrace style guide](https://styleguide.dynatrace.com/docs/product-capture/screenshot-annotations/); [Zight](https://zight.com/blog/how-to-annotate-screenshots-for-clear-instructions); [New Relic](https://docs.newrelic.com/pt/docs/style-guide/images/image-annotations/); [Adobe](https://experienceleague.adobe.com/en/docs/authoring-guide/using/style-guide/screenshots)
- Apple keynotes lean on imagery over words (iPhone 6: 6 photos, 1 video, 9 words in first 10 slides). — [Entrepreneur](https://www.entrepreneur.com/article/237457)

### Inferences
- [INFERENCE] Screenshot size: product visual should occupy >=55-65% of slide area on a 1920x1080 canvas; a full-bleed or near-full-bleed crop beats a small framed window. Render screenshot at >=2x (capture the browser at 1920 wide, zoom UI to 125-150% so UI text is >=20 pt equivalent when placed on the slide).
- [INFERENCE] Frames: skip device mockups for a web app; a minimal 1px border + soft shadow (or no chrome at all) keeps it honest. Use browser chrome only on the single "this is real, live" slide with a visible localhost/real URL to prove it is not a mockup.
- [INFERENCE] Dark vs light: if the UI is dark on a light slide, add a thin neutral border and generous margin, or set that slide background dark; avoid bright-white screenshots on a dark slide (glare, and the eye leaves the headline). Match slide theme to the product theme where possible.
- [INFERENCE] Progressive build: 3 callouts appear one per click (or auto after-previous) while the speaker says one clause each; final state is the complete annotated image, so a late-viewing judge still sees everything. Avoid fly-in/spin animations; use fade/appear only.
- [INFERENCE] Real data only; no lorem ipsum; if sample documents are sensitive, use the demo corpus.

### Gaps
- Did not find primary examples/analyses of Linear, Stripe, Vercel, Notion, Glean, Harvey or Hebbia launch/investor decks; claims about their style are therefore omitted. A follow-up should open their public launch pages/keynote recordings directly.

## 6. Tells of AI-generated / template-made decks, and credible alternatives

### Takeaway
Reported tells: gradient backgrounds, generic icon sets (lightbulb/handshake/gear), identical flat line icons across slides, uniform bullet spacing and title format, vague copy that could appear in any startup's deck. Credible decks substitute specific content: real screenshots, real numbers, named baselines. Sources are mostly vendors, so treat as opinion.

### Cited Findings
- Gradient backgrounds, vague bullets, generic icons (lightbulb, handshake, gear) as typical AI-deck markers. [OPINION/vendor] — [Single Grain](https://www.singlegrain.com/blog-posts/ai-pitch-decks-generic/)
- Same-library flat line icons on every slide, identical bullet spacing and title format are giveaways; fix: replace some icons with a photo, chart or real screenshot. [OPINION/vendor; its "71%" study stat unverified] — [2Slides](https://2slides.com/blog/why-ai-slides-look-fake-and-how-to-fix)
- Remove any sentence that could appear in any startup's deck; generic output comes from generic inputs; add a human editing pass, real content and proof. — [The Recursive](https://www.therecursive.com/your-ai-pitch-deck-sounds-just-like-all-the-rest/); [Single Grain](https://www.singlegrain.com/blog-posts/ai-pitch-decks-generic/); [Fast Company](https://www.fastcompany.com/91591431/ai-generated-pitch-decks)

### Inferences
- [INFERENCE] Other widely observed tells not sourced here (treat as my opinion): emoji bullets; symmetric 3-4 card rows with icon+title+blurb; purple-to-blue gradient blobs; glassmorphism cards; "revolutionize/unlock/seamless/empower" copy; stock isometric illustrations; every slide the same layout.
- [INFERENCE] Counter-moves: asymmetric layouts; one type family (2 weights) and 1 accent color taken from the product's own UI; real screenshot as the hero on >=3 slides; numbers with units and n; a plain "what we do not do" line; named failure case from your own eval (a real error you caught) - specificity is the strongest anti-template signal.
- [INFERENCE] Vary slide structure on purpose (big number / full-bleed screenshot / split before-after / one chart), keep consistent grid, margins (>=64 px / ~0.45 in) and color roles.

### Gaps
- No rigorous study of whether judges penalize AI-looking decks; evidence is vendor and blog opinion.

## 7. Speaker notes and talk-track for a 3-minute pitch with live demo

### Takeaway
Consistent hackathon guidance: front-load problem+solution in ~30 s, give the demo the largest block, close with tech/impact/ask; separate speaker and demo driver; script and rehearse; have a recorded fallback.

### Cited Findings
- Timing: problem + solution in first ~30 s; demo roughly 0:30-2:00 (60-90 s); last minute for tech/what was hard + impact/ask; problem ~15-20 s. [PRACTITIONER] — [Reskilll](https://blogs.reskilll.com/hackathon-demo-presentation-tips-pitch-3-minutes-win-2026/); [Music Hack Space](https://musichackspace.org/blog/hackathon-presentation-tips)
- Assign one speaker and one demo driver; write a script of what you say and show; rehearse repeatedly; make the handoff smooth. — [Salesforce](https://developer.salesforce.com/blogs/2014/07/deliver-winning-pitch-hackathons); [AngelHack](https://angelhack.com/blog/10-tips-to-help-you-rock-your-next-hackathon-demo/)
- Use speaker notes as fallback, not to read from. Fallback for demo failure: recorded video, then screenshots, resume live if it recovers. — [Hawaii HACC workshop](https://hacc.hawaii.gov/wp-content/uploads/2023/11/Christopher-Nguyen-HACC-Pitch-Workshop.pdf); [Reskilll](https://blogs.reskilll.com/hackathon-demo-presentation-tips-pitch-3-minutes-win-2026/)

### Inferences
- [INFERENCE] Notes format per slide: (a) the one-sentence takeaway verbatim, (b) timing budget in seconds, (c) the exact transition cue/last words, (d) the click/build cue ("CLICK 1: callout 1"), (e) a fallback line if the demo fails. Keep each note <=60 words (~20 s at 150-170 wpm speech).
- [INFERENCE] Slide-to-demo transition: the last slide before the demo shows the exact screen the demo starts on (same crop of the real UI), with a headline that is the question the demo will answer; speaker says "let me show you" and Alt-Tab/full-screen browser (pre-opened, pre-zoomed 125-150%, notifications off, test doc pre-uploaded or one click away). Return slide after the demo should reuse the same crop with the result highlighted, so the audience re-anchors.
- [INFERENCE] Rough 180 s budget for ~6 slides: hook/problem 20 s; proof-in-one-number 25 s; product/how 20 s; live demo 75 s; eval honesty/limits 20 s; close 20 s. Slide dwell target: no slide >30 s except demo.

### Gaps
- Sources are blogs/vendor pages; no data linking notes format to win rate.

## Checklist: 18 rules for this deck

1. One idea per slide; headline is a full-sentence claim (<=15 words), not a topic label. [RESEARCH-backed: assertion-evidence]
2. Every slide passes the 3-second glance test: cover it after 3 s and state the point. [PRACTITIONER: Duarte]
3. Total on-slide words <=30 incl. headline; <=7 visible objects; hero-number slides <=12 words.
4. Type scale (PowerPoint pt): headline 36-44, body 24-28, chart labels >=20, source/n >=14 and any caveat that matters >=18; hero number 120-200.
5. No bullets as the main structure; if a list is unavoidable, <=3 items, <=6 words each, no sub-bullets. [OPINION: Tufte; RESEARCH: split-attention/redundancy]
6. Remove anything decorative (coherence principle, strongest Mayer effect). [RESEARCH]
7. Put labels next to what they describe: callout text beside the UI element, chart labels on bars (spatial contiguity). [RESEARCH]
8. Use signaling sparingly: one accent color/outline to point at the thing the speaker is discussing; everything else gray/neutral. [RESEARCH]
9. Don't duplicate narration verbatim on slide; the slide shows evidence, voice supplies the story. [RESEARCH: redundancy, weak effect]
10. Charts: <=3 bars, our bar in accent, baselines gray, direct labels, no legend, y from 0, title = the finding.
11. Print n, the split ("held-out", "fresh"), and CI/interval on the chart area in >=14-18 pt; if n is small show the points or say "n = X, small sample". [RESEARCH: Correll & Gleicher]
12. Show a baseline you actually ran, named, and one failure of your own system (honest limits beat a perfect-looking claim).
13. Replace the logo-grid/check-matrix with a same-input before/after; if a matrix is kept: <=4x4, includes one row you lose, text values not just ticks.
14. Product screenshots are real, cropped, >=55% of slide, <=3 callouts, numbered, one color system, text outside the UI, zoom inset for any tiny element.
15. Callouts build one per click; final frame shows all; use fade/appear only.
16. No device frames or gradient blobs; at most a hairline border/soft shadow; match screenshot theme to slide theme.
17. Visual identity from the product (its accent color + one type family, 2 weights); vary layouts across slides; avoid emoji bullets, 4-icon rows, "revolutionize/unlock/seamless". [OPINION]
18. Speaker notes: takeaway sentence, seconds, cue, click cue, fallback, <=60 words; rehearse the slide-to-demo handoff and keep a recorded demo backup. [PRACTITIONER]
19. Lead with the most important proof on slide 1-2; judges/investors spend little time (DocSend: <2-4 min per whole deck, and falling). [PRACTITIONER]

## Screenshot callout recipe (for the real web UI)

1. Capture: browser at 1920 px wide, UI zoom 125-150%, demo corpus data only, no bookmarks/tabs/notifications; PNG, retina if possible.
2. Crop: keep only the region proving the claim (typically the answer panel + the source/evidence pane). Aim to fill 60-70% of the slide; trim chrome unless proving "live".
3. Place: image left or center, headline above (sentence claim). Reserve a 280-360 px text gutter on one side for callout text, or place text outside image edges.
4. Callouts: max 3. Each = accent-colored numbered circle (~48-56 px, white numeral, 24 pt bold) sitting on the UI element's corner, plus a 1px accent leader line to a short label in the gutter (<=8 words, 24 pt). Number order = reading/speaking order. Same circle style on every slide.
5. Highlight: a 3-4 px accent outline around the target region; dim nothing else (or dim the rest 30% only on the focus slide).
6. Zoom inset: if a key element renders <20 pt equivalent (e.g., a citation chip, confidence flag), add a magnified inset (2-3x) with a thin connector, not a larger whole screenshot.
7. Build: image appears with headline; callouts 1, 2, 3 each appear (fade, 0.2 s) on click while you say one clause each; last state remains static.
8. Footer: one 14-16 pt line for provenance ("Live build, demo corpus, <date>"); no other decoration.
9. Check: squint test (blur 5 px: can you still see the numbered circles and headline?), glance test (3 s), distance test (read from ~2-3 m on a laptop / on projector), and contrast check of label text against background (>=4.5:1).
10. Before the demo: final slide uses the same crop as the demo's starting screen so the switch to the live app feels continuous.

## Overall research caveats
- Evidence quality varies: only the assertion-evidence and Mayer material is research-backed; font sizes, word counts, comparison formats and AI-tells are practitioner opinion. Numeric thresholds in "Inferences" are my synthesis, to be treated as defaults not findings.
- Not covered due to tool-call budget: Garr Reynolds primary text, Pitch.com/Figma Slides galleries, direct analyses of Linear/Stripe/Vercel/Notion/Glean/Harvey/Hebbia decks, Nielsen Norman Group.
