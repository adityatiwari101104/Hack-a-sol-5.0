# Landing hero: document-AI sites inspected in the browser (24 Nov 2026)

Method: built-in browser, read-only, desktop viewport (1440 px). Fonts and sizes come from `getComputedStyle` on the live pages. I took no assets; everything is redrawn in our own components. Labels:
- **Observed**: seen on the page or read from the page.
- **Copy**: our inference about what to borrow.

| Site | Observed | Copy |
|---|---|---|
| **Graphify** (graphify.com; user-supplied screenshots) | White page with a near-black green ink (rgb 6,35,20). Geist + Geist Mono. The hero headline is mono, each line on a dark highlight block. Nav items are 1px *dashed* boxes with radius 0. "How it works" uses big mono headings as tabs: the active one is filled green (#118D4F) with white text, the inactive ones are at 40% ink. Corner-bracket frames hold isometric dotted/stick line art; a canvas sits in the hero. The bento grid is on a mint gradient. A floating "ask" input is pinned at the bottom. | **A stick graph made of nodes and thin lines**, interactive (the user asked for this). Corner brackets around the graph, mono labels, and a floating ask pill. *Not* the mono-on-black headline, which the user didn't like. |
| **Reducto** (reducto.ai) | A serif headline ("Reducto Serif" 84px) with **one mono accent word** in purple ("Turn documents into *data.*"). Warm off-white. A single filled CTA. Ten `<video>` product loops further down. | A serif + mono contrast for the key word. |
| **Extend** (extend.ai) | Warm grey page (lab 91). A **blueprint grid of hairlines with "+" crosshairs** at the intersections; mono uppercase nav (DM Mono 13px). Headline "Automate every document" in a grotesk at 62px. A code-install box under the CTAs. | A faint hairline grid with + marks behind the hero, to make it feel like an instrument. |
| **Hebbia** (hebbia.com) | A full-bleed dusk city video seen through blinds. Small-caps display serif "INSTITUTIONAL INTELLIGENCE". Buttons have a 4px radius and an indigo accent (rgb 70,91,255). | Restraint: one line, one CTA. (The skyline is a cliché; skip it.) |
| **LandingAI** (landing.ai) | **-apple-system** throughout. The headline is sans ("Accurate, Production-Ready AI") with an **italic serif second line** ("for Real-World Documents", Instrument Serif). The nav is a **floating rounded bar**; CTAs are small rounded rectangles (6px). The hero art is an isometric *exploded document layers* line drawing. Section copy: "Accuracy you can prove, not guess", "Results come with proof". | **A sans line plus an italic serif line**, the closest match to our message. A floating rounded nav bar. Apple-system controls, which matches the user's "iOS/macOS" request. |
| **Glean** (glean.com) | "Polysans" grotesk at 56px with a mono eyebrow. Every button is a **pill** (radius 64px): black primary, indigo secondary, ghost tertiary. A rolling-digit number animation. | Pill CTAs. |
| Harvey (seen in landing_page_research.md) | A serif headline on paper with the product framed over a texture. | — |

## What we build (decisions)

- **Hero**: a sans headline with an italic-serif second line (LandingAI, Reducto). Beside it, an **interactive 3D stick graph of the real corpus**, inside corner brackets (Graphify):
  - RBI and bank documents are hub nodes; their clauses are satellites.
  - The sticks are the real relations: contains, REFERS_TO, AMENDED_BY, WITHDRAWS and CONFLICT.
  - Drag to rotate; hover a node to see its clause; an as-of segmented control fades withdrawn texts and lights up conflicts.
  - A faint hairline grid with + crosshairs sits behind it (Extend).
- **Controls follow iOS/macOS**, at the user's request. This overrides the earlier "no glass" note for chrome only:
  - the system font for controls;
  - filled rounded buttons (radius 10) and pill CTAs;
  - segmented controls with a sliding white thumb on a grey track;
  - a translucent floating nav bar (backdrop blur);
  - a pill search field for the recorded questions.
- **Content stays paper-like**: serif for verbatim law text, mono for IDs. No skyline, statues or old-master art.
