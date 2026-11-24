# Designing diagrams for a Proof-or-Silence pitch deck (1920x1080, 5-second read, editable in PowerPoint)

Research notes. Sourcing caveat: many search results were secondary summaries. Items marked "Inference" are my own design proposals, not sourced claims. Items I could not verify are in Gaps. I did not test any code or PowerPoint behaviour myself.

## 1. What makes an architecture/pipeline diagram readable at a glance

### Takeaway
Treat each diagram as a billboard: one point, three seconds, few boxes (aim for 4 to 6 groups, hard cap about 8), left-to-right, one highlighted path, grouping by enclosure/colour for trust boundary. The sourced evidence supports "few chunks, one point, no low-level detail"; the exact numeric box caps and the colour scheme are my inferences.

### Cited Findings
- Duarte's Glance Test: the audience should grasp a slide's main point in three seconds or less; its goals include one clear point per slide, design elements that support that point, contrast and whitespace to emphasise key information. — [Duarte Glance Test](https://www.duarte.com/resources/guides-tools/the-glance-test/)
- Duarte frames slides as "glance media", like a billboard. If viewers cannot say what the slide was about after a 3-second look, it has too much information. — [Duarte Presentation Principles / glance test summary (search result)](https://www.duarte.com/resources/slide-glance-test/)
- The glance test was developed with Glenn Hughes (KLA Tencor) and uses a signal-to-noise framing (secondary description). The link to the book Slide:ology is unverified. — [Duarte](https://www.duarte.com/resources/slide-glance-test/)
- Working-memory capacity is about 4 chunks on average (Cowan 2001), revising Miller's 7±2; it is debated (task-dependent, one 2024 study estimates 5). — [Cowan, BBS 2001](https://memory.psych.missouri.edu/assets/doc/articles/2001/cowan-bbs-2001.pdf); [Journal of Cognition 2024 (DOAJ)](https://doaj.org/article/619ffe84957b4a59ab138951e5a36daf)
- C4 system-context diagram (Simon Brown): scope is a single system shown as a box in the centre, with the people and directly connected external systems around it; focus on people and systems, not technologies or protocols; "Detail isn't important here"; audience is everyone, technical or not. — [c4model.com system context](https://c4model.com/diagrams/system-context)
- C4 guidance on titles: each diagram should have a title stating its type and scope (via InfoQ summary of Brown's approach). — [InfoQ, C4 architecture model](https://www.infoq.com/articles/c4-architecture-model/)
- C4 tailors diagrams to audiences (different zoom level per audience) rather than one all-in-one picture. — [O'Reilly, The C4 Model](https://www.oreilly.com/library/view/the-c4-model/9798341660113/)
- Gestalt: proximity groups by spacing; similarity groups by shared colour/shape/size; enclosure (a border) groups objects inside it; connection (a line) groups linked elements. One source claims connection is the strongest cue (single-source view, not settled). Choose proximity when there is space, enclosure when tight or overlapping. — [Data School: Gestalt for dataviz](https://www.thedataschool.co.uk/sid-saythongphet/using-gestalt-principles-to); [FlowingData](https://flowingdata.com/2015/04/03/gestalt-principles-for-visualization/)
- General flowchart guidance (secondary blogs): consistent top-to-bottom or left-to-right direction, avoid crossing lines, inconsistent spacing; every element should help the reader grasp the logic faster, else remove it. — [Nulab flowchart rules](https://nulab.com/learn/design-and-ux/keep-it-simple-follow-flowchart-rules-for-better-diagrams); [Miro diagram design](https://miro.com/blog/diagram-design/)
- Good public exemplar of one-pattern-per-figure: Anthropic's "Building effective agents" shows the augmented LLM, prompt chaining (with a programmatic "gate" between steps), routing, parallelisation, orchestrator-workers, evaluator-optimizer as separate, progressively more complex figures, and states "find the simplest solution possible, and only increase complexity when needed". I could read only captions/text, not the images, so colours and box counts are unverified. — [Anthropic engineering](https://www.anthropic.com/engineering/building-effective-agents)
- RAG explainers commonly use a two-phase layout (offline indexing; online query -> retrieve -> generate) with 5-ish components (loader, embedding model, vector DB, retriever, LLM). I did not see the official LangChain or LlamaIndex diagrams. — [Scaler RAG architecture](https://www.scaler.com/topics/rag-architecture-daigram/); [LlamaIndex RAG docs](https://developers.llamaindex.ai/python/framework/understanding/rag/)

### Inferences
- Rules for the deck (derived from the above):
  1. One message per diagram, stated as the slide title (a sentence, e.g. "Every sentence is checked by code before you see it").
  2. 4 to 6 top-level shapes; group sub-steps inside one enclosure instead of adding boxes. Hard cap about 8 visible nodes.
  3. Flow strictly left to right; no arrow crossings; no back-edges on the main slide.
  4. One highlighted path (accent colour + thicker line); everything else grey. Highlight = the thing the slide claims.
  5. Trust-boundary grouping by enclosure plus a single colour per role, not logos: e.g. "LLM drafts" (outlined, neutral/warm), "local models" (cool tint), "Code decides" (the strongest, solid colour). Colour alone is not enough on a projector, so also use a text label on the band and different fill style (outline vs solid) for colour-blind safety.
  6. Label nodes with nouns of 1 to 3 words; label arrows only when the arrow carries a different thing (e.g. "draft sentences", "verdict"), otherwise leave arrows unlabelled.
  7. Type sizes for 1920x1080: node text >= 24 px (about 18 pt on a 13.33 in slide), title >= 40 px, nothing under 18 px; anything smaller belongs in an appendix/notes, not on the projected slide. (My rule of thumb; not sourced.)
  8. Use C4 "context" thinking: show Proof-or-Silence as one box in the middle of user, bank policy docs, RBI rules, OpenAI, before any internal detail; only zoom into internals on the next slide.
- Copy: Anthropic's one-pattern-per-figure and "gate" element; C4's central-box context view; RAG's two-lane split. Avoid: AWS-style reference architectures with service icons, VPC boxes and numbered callouts (dense by design), and vendor "logo soup" slides. (The AWS and Stripe/Cloudflare points are from general knowledge; I did not fetch them.)

### Gaps
- Could not fetch NN/g material on diagrams (search returned no NN/g article); no NN/g citation.
- Did not retrieve Stripe, Cloudflare, OpenAI, LangChain or AWS reference diagrams to analyse; no sourced "what to copy/avoid" for those.
- No source found for a numeric "max boxes per slide" rule; the 4 to 6 / cap-8 numbers are my inference from Cowan plus the glance test.
- Tufte not consulted.

## 2. Progressive disclosure across slides

### Takeaway
Prefer "same diagram, one part lit" across consecutive slides (identical layout, positions, sizes; only the highlight/colour changes) over in-slide click animations, because it is robust across PowerPoint, Keynote, Google Slides and PDF export, and survives a code-generated deck. Sourced evidence for this specific pattern is thin; this is mostly design reasoning built on the cited C4 and Anthropic examples.

### Cited Findings
- C4 deliberately uses different zoom levels for different audiences (context -> container ...), i.e. progressive disclosure by zoom rather than one dense picture. — [c4model.com system context](https://c4model.com/diagrams/system-context); [O'Reilly](https://www.oreilly.com/library/view/the-c4-model/9798341660113/)
- Anthropic's article builds from the simplest building block up to complex patterns, one figure each. — [Anthropic engineering](https://www.anthropic.com/engineering/building-effective-agents)
- Keynote and Google Slides are not guaranteed to carry over PowerPoint embedded fonts, so animated, font-dependent builds are a compatibility risk. — [iSpring on embedding fonts](https://www.ispringsolutions.com/blog/how-to-embed-fonts-in-powerpoint); [allthings.how](https://allthings.how/how-to-embed-fonts-in-microsoft-powerpoint)

### Inferences
- Pattern: build the diagram once as a function `draw(highlight)`; emit 3 slides: (a) all neutral grey + faint, (b) lit = the lane being discussed, (c) lit = the verify gate. Everything else at 25% opacity or grey. Keep coordinates identical so the eye sees only the colour change (works like a "morph" without needing Morph).
- Build-up (appear) animations are fine for presenters live but fail on PDF export, judges' offline review, and Google Slides import; use sparingly and always make the final state a complete, readable slide.
- Order for this product: slide 1 "plain RAG" (grey, with the red hole "no check"); slide 2 same lane with the verify gate inserted and lit; slide 3 zoom into the gate (the ladder). This is C4-like zoom.
- For a 2-to-6 slide hackathon deck, budget: at most 2 pipeline diagrams, 1 timeline, 1 side-by-side, 1 results chart.

### Gaps
- No source found that evaluates "repeat-with-highlight" vs build-animations empirically.
- Morph transition behaviour in PowerPoint/Keynote/Google Slides not checked.

## 3. Specific diagram patterns (layouts and per-diagram specs)

### Takeaway
Each of the four diagrams has a single dominant visual: (1) a lane with an inserted gate, (2) a short vertical ladder with a reject drop-off, (3) a time axis with a date cursor and version cards, (4) two facing cards with underlined deciding terms and a verdict bar. Time-travel UIs on legislation.gov.uk and eCFR validate the "as-of date selects the version" mental model. Layouts and specs below are my design proposals.

### Cited Findings
- legislation.gov.uk point-in-time pages show a header with the date text is shown as of, with views "Latest available (Revised)" and "Original (As enacted)"; superseded provisions are flagged and point to a later version; changes appear as annotations; pending changes are excluded from a point-in-time view. — [legislation.gov.uk example (point-in-time page)](https://www.legislation.gov.uk/ukpga/2018/16/schedule/8/part/4/2024-01-01?timeline=false) (via search-result description; I could not render the page itself to inspect the timeline control)
- eCFR provides a Timeline utility to see all changes to content, a Compare Dates function (any two dates, red/green or purple/orange highlighting), and a date field to view content as it appeared at a past date. I found no evidence of a "date slider". — [eCFR reader aids](https://www.ecfr.gov/reader-aids); [GWU Law guide](https://law.gwu.libguides.com/federalregulatory/updating); [eCFR timeline filtering](https://www.ecfr.gov/reader-aids/ecfr-recent-updates/introducing-timeline-filtering)
- Anthropic's prompt-chaining figure uses an explicit programmatic "gate" between steps (precedent for a verify-gate glyph). — [Anthropic engineering](https://www.anthropic.com/engineering/building-effective-agents)
- Basic RAG is shown as index -> retrieve -> generate (precedent for the "plain RAG" baseline lane). — [Scaler](https://www.scaler.com/topics/rag-architecture-daigram/)
- Westlaw/Git-history UI: not sourced; see Gaps.

### Inferences

Colour roles used below (define once in the deck, reuse everywhere):
- DRAFT (LLM, "OpenAI drafts"): white fill, dark-grey outline, dashed outline to suggest "untrusted".
- LOCAL (local models: HHEM, MiniCheck, Presidio): light blue-grey fill, mid-blue outline.
- CODE (deterministic, "code decides"): solid dark navy/teal fill, white text. This is the hero colour.
- PASS: green; WITHHELD/FAIL: red (always paired with an icon/word, not colour only).
- NEUTRAL/INPUT/OUTPUT: grey.
- Highlight path: accent colour line 4 to 6 pt; non-highlight 1.5 pt grey.

#### Diagram 1: Plain RAG vs ours (one lane, inserted gate) - recommended over side-by-side
Show two stacked lanes sharing identical positions so only the extra element differs; the difference is the verify gate (single glance).

```
TOP (grey, 60% opacity)   "Plain RAG"
 [Question] -> [Retrieve] -> [LLM answer] ------------------------------> [Answer shown]
                                                  (red tag: "wrong sentences also pass")

BOTTOM (full colour)      "Proof-or-Silence"
 [Question] -> [Retrieve] -> [LLM drafts] -> |==== CODE VERIFIES EACH SENTENCE ====| -> [Verified answer]
                              (DRAFT)         |   (CODE navy block, taller)       |  \-> [Withheld + reason]
```
Alternative: single lane with a dashed "gap" in plain RAG that the gate fills (animated as slide 1 -> 2 using the same-diagram pattern).

Spec D1:
- Boxes (max 6 in the lit lane): Question; Retrieve (local); LLM drafts (DRAFT); Verify gate (CODE, biggest, label "Code checks every sentence"); Verified answer (PASS); Withheld + reason (FAIL, small, below/right of gate).
- Top lane is 4 boxes, all grey; add one small red label "no check".
- Arrow labels: none, except optional "sentences" between drafts and gate.
- Max words: title <= 10 words; each box <= 3 words; gate label <= 5 words; one caption line <= 12 words.
- Colour: gate = CODE colour; accent line follows the lit lane only.

#### Diagram 2: The verification ladder (per sentence) and failure
A vertical or horizontal ladder of gates; a sentence enters at top; failing at any rung exits to a "Withheld: <reason>" bin. Group rungs by who decides: code rungs (navy) vs model rungs (local blue) and a final LLM judge (DRAFT-style outline).

```
 sentence --> [1 ids exist] --> [2 in force on date] --> [3 quote found verbatim + page]
                  |                   |                         |
                  v                   v                         v
              withheld:           withheld:                 withheld: quote
              unknown id          superseded                not found
          --> [4 numbers match] --> [5 support: HHEM -> MiniCheck -> LLM judge] --> SHOWN
                  |                          (escalate only if unsure, cheap first)
              withheld: number
```
Preferred projected form (cleaner): one horizontal row of 5 rungs (ids | in force | quote+page | numbers | support), rung 5 containing a mini-stack of three small pills (HHEM, MiniCheck, LLM judge) labelled "cheap first". Below the row, a single red rail labelled "Any fail: withheld with reason" with small reason chips; the pass path is the thick green line to the right.

Spec D2:
- Boxes: 5 rungs + SHOWN + WITHHELD rail = 7 shapes; the 3 pills are sub-elements inside rung 5.
- Colour: rungs 1 to 4 = CODE; HHEM and MiniCheck pills = LOCAL; LLM judge pill = DRAFT outline; SHOWN = green; WITHHELD = red.
- Labels: rung names <= 3 words ("Ids exist", "In force", "Quote + page", "Numbers", "Supported?"); reason chips <= 3 words each; arrows unlabelled.
- Max words total on slide: about 45 excluding title; title <= 10 words.
- Show one example failing sentence as a caption (optional): quote + red "withheld: number mismatch" (<= 12 words).

#### Diagram 3: Amendment chain / as-of timeline
Horizontal time axis; version cards per amendment (A original, B amends A, C amends B); a vertical date cursor (draggable in concept) that selects the version in force; the card in force is solid, superseded ones faded with strikethrough-light. Mirror the legislation.gov.uk idea of "point in time" and "superseded, see later version".

```
 time ------------------------------------------------------------------------------>
   2019-04            2023-06 (B amends A)        2025-10 (C amends B)
   [A: original]      [B: ...]                     [C: ...]
   ===================|===========================|=============================
                                     ^ cursor: 2025-09  -> in force: B  "shall reset EMI"
                                                  ^ cursor: 2025-10 -> in force: C "may, at its option"
 bracket under axis: "C amends B amends A"  (chain arrows going right-to-left, thin)
```
Two-state variant (clearer for slides): two stacked copies of the same timeline, cursor at 2025-09 and at 2025-10, with the clause text appearing in one callout: "shall" (struck/faded at the later date) vs "may, at its option". Use the same-diagram-one-part-lit pattern.

Spec D3:
- Shapes: 3 version cards, 1 axis, 1 cursor with a date chip, 1 callout for the text in force = about 7.
- Labels: card = id + date only ("B  2023-06"); callout shows the deciding words only, underlined: "shall" vs "may, at its option" (<= 8 words); one arrow chain labelled "amends" (the only labelled arrow).
- Colour: in-force card = CODE solid; superseded cards = grey with lower opacity; cursor = accent colour; the changed words highlighted in amber/accent.
- Max words: <= 35 on the slide plus title <= 10.
- Use real example: EMI reset "shall" until 2025-09, "may, at its option" from 2025-10 (as given by the team; not verified by me).

#### Diagram 4: Contradiction side-by-side (bank policy vs RBI rule)
Two equal-size cards facing each other with a central verdict badge; header tags show source, doc, page, and in-force date; the deciding phrases are underlined and linked by one thin line to the verdict.

```
 +------------------------------+      +------------------------------+
 | BANK POLICY  p.12  (in force |      | RBI RULE  para 5  (in force  |
 |  2025-04)                    |  vs  |  2025-10)                    |
 | "...the lender _may_         |      | "...the lender _shall_       |
 |  _revise rate at its option_"|      |  _reset only on_ benchmark   |
 |                              |      |  change..."                  |
 +--------------\---------------+      +---------------/--------------+
                 \________  CONFLICT: RBI prevails  ____/
                         (verdict bar: 1 line, <= 8 words)
```
Spec D4:
- Shapes: 2 cards, 1 verdict bar, 2 header chips = 5 to 7.
- Content per card: <= 25 words of quote (shortened with ellipsis, the deciding terms underlined and bold), plus header chip (source, page, as-of date).
- Verdict bar: red for conflict (with icon), <= 8 words, e.g. "Conflict: RBI rule overrides bank clause" (verdict logic is the product's; not verified by me).
- Colour: bank card = neutral/CODE-light border; RBI card = LOCAL/regulator tint; underlines in accent; verdict = red/amber.
- Max words on slide: <= 70 total; type >= 22 px for quotes.

#### Diagram 5 (brief): Results vs baseline bar pairs
- Grouped horizontal or vertical bars: baseline (grey) vs ours (hero colour), max 3 to 4 metric groups (e.g. unsupported-claim rate, withheld-correctly rate); value labels at bar end; delete gridlines and legend by direct-labelling; y-axis from zero; one headline number in the slide title; footnote with n and dataset (the team's eval, not verified by me). Use a native PowerPoint chart (PptxGenJS supports charts) so it stays editable.

### Gaps
- Could not render or inspect the actual legislation.gov.uk timeline control or eCFR Compare UI; descriptions are from search-result text and help pages. No screenshots reviewed.
- Westlaw versions UI and Git-style history UIs not researched.
- Real quotes for the bank/RBI example and the actual eval numbers come from the team, not this research.

## 4. Tools for crisp, EDITABLE diagrams in PowerPoint (and a recommendation)

### Takeaway
For a code-generated deck, draw diagrams as native PowerPoint shapes in PptxGenJS (or python-pptx). Official PptxGenJS (4.0.1 is the latest release I saw) has no connector API but does support arrowheads on line shapes (`beginArrowType`/`endArrowType`, since v3.3.0); python-pptx has real connectors with experimental glue and needs a small XML patch for arrowheads. SVG import is vector but only becomes editable shapes via Convert to Shape on Microsoft 365 for Windows and is sometimes flaky; Mermaid/draw.io/Excalidraw paths add friction.

### Cited Findings
- PowerPoint SVG: Insert > Pictures > This Device. Convert to Shape (to colour parts separately) currently requires Office for Microsoft 365 on Windows; on Mac/iOS/Android a fill colour applies to the whole image; iOS cannot insert SVGs. — [Microsoft Support](https://support.microsoft.com/en-us/topic/69f29d39-194a-4072-8c35-dbe5e7ea528c)
- Jan 2026 Microsoft Q&A: a user on build 2511 lost "Convert to Shape"; the accepted cause was an old Office 2016 MSI install, fixed by moving to Microsoft 365; the EMF workaround ungroups but yields parts not editable as individual shapes. — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5693861/convert-svg-image-to-shape-powerpoint-2025-2026)
- Community reports that SVG inserted from draw.io-style tools arrives as a Picture (non-editable) unless converted; EMF round trip via Inkscape is a common workaround (user posts, not official). — [Microsoft Q&A: error importing SVG](https://learn.microsoft.com/en-us/answers/questions/4456747/an-error-occurred-when-importing-an-svg)
- draw.io can embed diagram data in exported PNG/SVG/PDF so the file reopens in the editor; native SVG text option avoids foreignObject issues. — [draw.io export docs](https://www.drawio.com/docs/manual/export/); [draw.io SVG export text problems](https://www.drawio.com/docs/manual/export/svg-export-text-problems/)
- Mermaid SVGs put labels in `foreignObject`, which many non-browser consumers do not render; workaround is `htmlLabels: false` (reports it may not fully work). — [mermaid-cli issue 691](https://www.github.com/mermaid-js/mermaid-cli/issues/691); [librsvg issue 1082](https://gitlab.gnome.org/GNOME/librsvg/-/issues/1082)
- mmd2pptx (Apache-2.0, v0.2.4, early) converts Mermaid to editable PPTX; modes: Smart (native connectors bound to nodes), Faithful (freeform paths), Exact (embedded SVG, less editable); detailed support documented only for flowcharts. — [mmd2pptx](https://github.com/LJAYi/mmd2pptx)
- svg2ooxml claims SVG shapes/text/gradients convert to editable PowerPoint objects (unverified by me). — [svg2ooxml on PyPI](https://pypi.org/project/svg2ooxml/0.7.3/)
- PptxGenJS official docs: about 200 shape types via `ShapeType` (rect, ellipse, line, etc.); `line` options include `color`, `width`, `dashType`; `rotate`, `flipH`, `flipV`; the shapes docs page does not mention a connector API or arrowheads. — [PptxGenJS shapes docs](https://gitbrent.github.io/PptxGenJS/docs/api-shapes/)
- PptxGenJS type definitions: `ShapeLineProps` has `width`, `dashType`, `beginArrowType`, `endArrowType` (values none, arrow, diamond, oval, stealth, triangle; since v3.3.0), plus `color`/`transparency` from fill props; ShapeType list includes line, rightArrow, chevron, homePlate etc.; no bentConnector. — [PptxGenJS types/index.d.ts](https://raw.githubusercontent.com/gitbrent/PptxGenJS/master/types/index.d.ts)
- PptxGenJS releases: 4.0.1 latest (fixes table repair issue), 4.0.0 added `textDirection` and `exports` field, 3.12.0 fixed a repair dialog caused by SVG on slide master; no release notes mention connectors or arrowheads (release years not shown on the page I read). — [PptxGenJS releases](https://github.com/gitbrent/PptxGenJS/releases)
- A fork, `@shbernal/pptxgenjs`, documents a `ConnectorProps` API (x1,y1,x2,y2, type straight/elbow/curved, bends, adj, startShape/endShape binding with connection-site index, begin/endArrowType, dashType, objectName); it is a fork, not official PptxGenJS. — [shbernal ConnectorProps docs](https://shbernal.github.io/PptxGenJS/reference/api/index/interfaces/ConnectorProps)
- python-pptx: `add_connector(MSO_CONNECTOR.STRAIGHT/ELBOW/CURVE, x1,y1,x2,y2)`; `begin_connect`/`end_connect` are experimental and work properly only with rectangular shapes (connection point index, e.g. 3 = right-centre, 1 = left in the docs example); arrowheads are not a high-level property and require adding `<a:tailEnd type="arrow"/>` inside `<a:ln>` (private `_get_or_add_ln()`; schema order matters). Connection data lives in `stCxn`/`endCxn`; moving the target shape moves a glued connector but the endpoint does not snap. — [python-pptx connector source](https://python-pptx.readthedocs.io/en/latest/_modules/pptx/shapes/connector.html); [python-pptx connector analysis](https://python-pptx.readthedocs.io/en/latest/dev/analysis/shp-connector.html); [Stack Overflow answer on arrowheads (via search)](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/58792955/changing-format-of-connector-to-an-arrow-one-in-python-pptx)
- Fonts: embedding works in PowerPoint for Microsoft 365 Mac, 2021 and 2019 Mac (not 2016 Mac, which only displays embedded fonts); some fonts cannot be embedded; embedded fonts are not reliably honoured by Keynote and Google Slides; Mac embedded fonts sometimes lost after saving (Q&A reports). — [Microsoft Support: embedding fonts](https://support.microsoft.com/article/cb3982aa-ea76-4323-b008-86670f222dbc); [iSpring](https://www.ispringsolutions.com/blog/how-to-embed-fonts-in-powerpoint); [Microsoft Q&A (Mac loses fonts)](https://learn.microsoft.com/en-us/answers/questions/5653309/powerpoint-for-mac-keeps-losing-embedded-fonts-aft)

### Inferences
- Survival table (my synthesis; behaviours for Excalidraw, Figma, Lucidchart, Napkin are not verified):

| Route | Result in PowerPoint | Editable as shapes? |
|---|---|---|
| PptxGenJS/python-pptx native shapes | native DrawingML | yes, fully |
| Mermaid -> mmd2pptx Smart | native shapes + bound connectors (flowcharts only, early version) | yes |
| Mermaid/draw.io/Excalidraw -> SVG -> insert | vector picture | only via Convert to Shape (365 Windows), else no |
| Any -> PNG | raster | no, blurry at 1920x1080 projectors |
| Any -> EMF | vector picture | ungroup only, parts often not clean shapes |
| Figma/Napkin/Lucidchart | not verified; typically SVG/PNG/PDF export | likely picture |

- Arrow drawing with official PptxGenJS (untested): use `addShape(pres.ShapeType.line, {x, y, w, h, line:{color, width:2.5, endArrowType:'triangle'}})`. For leftward or upward lines use `flipH`/`flipV`. Keep layouts orthogonal: straight horizontal arrows between boxes in a lane, and for elbows use 2 or 3 separate line segments with the arrowhead only on the last segment (no true elbow connector without the fork or XML patching). A line shape is not glued to boxes, so generate coordinates from the same layout function that places the boxes (gap constant, box centres) so everything stays aligned.
- Arrow drawing with python-pptx (untested): `add_connector(MSO_CONNECTOR.ELBOW, ...)`, `begin_connect(box, idx)`/`end_connect(box2, idx)` for rectangles, then append `a:tailEnd` to `ln` for the arrowhead. Glued elbow connectors stay attached if someone drags a box in PowerPoint: a real editability advantage over PptxGenJS.
- If staying in Node, either use the `@shbernal/pptxgenjs` fork (connector API, but fork maintenance risk) or post-process the saved PPTX XML to inject `stCxn`/`endCxn`; I would not do this under hackathon time pressure.
- Compatibility: native shapes plus a system-installed font (or a safe font) import cleanly in Keynote and Google Slides; avoid exotic custom geometry, text on connectors (connectors have no text frame), shadows/glows. Export a PDF backup for judging because embedded fonts are not honoured everywhere.

#### One-paragraph tool recommendation
Generate every diagram as native shapes from a single layout function in code, not as images: for a team already on Python, use python-pptx (real connector shapes with `begin_connect`/`end_connect` for rectangles, elbow connectors, and a 3-line helper to add `<a:tailEnd type="triangle"/>` for arrowheads); for a team on Node, use official PptxGenJS 4.x (line shapes with `endArrowType`, flips for direction, orthogonal layouts, native charts for the results slide) and accept that arrows are not glued to boxes, or use the connector-capable fork only if glue matters. Define roles (DRAFT, LOCAL, CODE, PASS, FAIL) as a colour/style dictionary and render "same diagram, one part lit" slides by calling `draw(highlight)` repeatedly, so positions never drift. Use Mermaid/draw.io only for rough sketching, and use mmd2pptx only if a flowchart-shaped Mermaid diagram is unavoidable; avoid SVG import for the final deck because "Convert to Shape" works only on Microsoft 365 for Windows and has reported flakiness, and avoid PNG because it blurs on a projector. Use a safe font (or embed one in PowerPoint on Windows) and ship a PDF export alongside the PPTX.

### Gaps
- Did not verify how Excalidraw, Figma, Lucidchart or Napkin.ai exports behave in PowerPoint (search returned nothing relevant for Excalidraw; others not searched).
- Did not verify Google Slides/Keynote behaviour with SVG or connectors specifically.
- Could not confirm whether the official PptxGenJS line shape supports glued connectors (it does not appear to) nor test that `endArrowType` renders correctly in current PowerPoint; the fork's docs give no version number and I did not check its maintenance status.
- PptxGenJS release years were not shown on the page I read; I cannot state 4.0.1's date.
- The python-pptx arrowhead approach uses a private API and was only seen in a Stack Overflow answer via a mirror.
- svg2ooxml and mmd2pptx are small third-party projects; claims were not tested.

## 5. Common diagram mistakes in hackathon decks

### Takeaway
The main failures are too many boxes, tiny text, arrows everywhere, and logos in place of ideas. Sourced support exists for the principle (billboard slides, simplicity, remove elements that do not aid understanding); specific hackathon-deck failure lists are my inference.

### Cited Findings
- Slides must be understandable at a glance (three seconds); otherwise they carry too much information. — [Duarte](https://www.duarte.com/resources/guides-tools/the-glance-test/)
- Crossing lines, inconsistent spacing and overuse of specialised symbols or images reduce flowchart readability; split complex charts instead of growing them. — [Nulab](https://nulab.com/learn/design-and-ux/keep-it-simple-follow-flowchart-rules-for-better-diagrams); [Miro: diagram pitfalls](https://miro.com/blog/avoid-mistakes-make-diagram/)
- NN/g-attributed finding (relayed by a Medium post, not read at source): users look at images carrying task-relevant information and skip decorative ones. — [Medium summary](https://medium.com/@knut_20009/flow-charts-are-o-n-2-complex-so-dont-go-over-100-connections-9f1795b515bc)
- Anthropic: add complexity only when it demonstrably improves outcomes. — [Anthropic engineering](https://www.anthropic.com/engineering/building-effective-agents)
- C4: omit technologies and protocols at the context level. — [c4model.com](https://c4model.com/diagrams/system-context)

### Inferences
Checklist (my synthesis):
1. 15-box architecture: collapse into 4 to 6 groups; move detail to an appendix slide.
2. Logo soup (OpenAI, Hugging Face, Presidio, Postgres logos): replace with a role label ("LLM drafts", "local models", "code decides"); name tools in a small caption only where they differentiate (HHEM, MiniCheck).
3. Tiny text (below about 18 px at 1920x1080): cut words, not size.
4. Arrows everywhere: one highlighted path; others grey/unlabelled; no crossings; no bidirectional arrows unless truly needed.
5. Colour with no meaning: each colour = a role from the legend; never decoration; add a text label because projectors wash out colours and 8 percent of men are colour-blind (general knowledge, not sourced here).
6. Diagram that restates the text: the slide title should be the conclusion and the diagram the proof.
7. Inconsistent positions across slides: use one layout function; do not hand-nudge boxes.
8. Rasterised screenshots of a draw.io canvas: blurry and uneditable; build native.
9. Ending on architecture: end the diagram sequence with the outcome (withheld-with-reason example), because the product's differentiator is silence over guessing.

### Gaps
- No empirical data on hackathon-deck diagram failures; these items are judgement.
- The Medium post is a secondary source for the NN/g claim; the NN/g original was not fetched.
