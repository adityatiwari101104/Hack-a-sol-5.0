# Colour theory and a checked palette for the Proof-or-Silence pitch deck

Scope: a cited colour guide plus a final, computed palette for a LIGHT deck (and a dark title/close variant) that stays inside the product's existing tokens (`frontend/src/styles/tokens.css`, `frontend/DESIGN.md`: paper, slate, one ink-blue accent, IBM Plex, hairlines, no gradients).

How to read the evidence labels: "Cited Findings" were seen in a fetched page or search result this session. "Inferences" are my own reasoning or my own computation (the Python script described at the end). Things I know from general knowledge but could not source are listed under "Gaps", not presented as fact.

---

## 1. Colour harmony for slides (analogous / complementary, 60-30-10, OKLCH, tinted neutrals)

### Takeaway
The product is already a "tinted-neutral + one accent" system, which is the structure that survives projection best. The sourced evidence I found covers colour-blind-safe palettes and WCAG, not the 60-30-10 rule or OKLCH guidance, so those parts of the guide are my reasoning, labelled as such.

### Cited Findings
- The product's design rule is paper + slate neutrals + ONE ink-blue accent, hairlines, no gradients, with colour kept "only as text colour where it means something" and tinted pills/filled badges removed after user review ("remove the vibecoded elements") — `frontend/DESIGN.md` (Principles table and "Plainness rules"), read locally.
- Okabe & Ito's guidance: use thick, large elements, because "thin lines and small symbols are hard to distinguish by color"; prefer darker blue and orange to sky blue and yellow for thin lines and small text; alternate warm and cool colours, and when two warm (or two cool) colours are used make brightness or saturation clearly different — [Okabe & Ito, Color Universal Design (jfly.uni-koeln.de/color)](https://jfly.uni-koeln.de/color/)
- Paul Tol's four qualitative schemes (Bright, High-contrast, Vibrant, Muted) are all described as colour-blind safe; his warning is that "yellow/green, blue/violet and cyan/pink/grey combinations can be problematic"; for the High-contrast scheme the recommended order is blue, yellow, red — [Paul Tol, Colour schemes](https://sronpersonalpages.nl/~pault/)
- Tol's High-contrast set: #004488, #DDAA33, #BB5566; Bright set: #4477AA, #EE6677, #228833, #CCBB44, #66CCEE, #AA3377, #BBBBBB; Muted includes #882255 (wine), #117733 (green), #44AA99 (teal), #CC6677 — [Paul Tol](https://sronpersonalpages.nl/~pault/)

### Inferences
- 60-30-10 mapped onto the product tokens: about 60% paper `#f7f5ef` (plus surface `#fffefb` for cards), about 30% ink `#1b1e22` / ink-2 `#474c54` (text and rules), about 10% ink-blue `#1f3a5f` as the single accent. State colours are a fourth, rationed layer: they appear only on the slide that is about that state, never as a rainbow legend.
- Large fills vs small marks: big areas should stay low-chroma (paper, `#f1eee6`, the 10% tints), because a saturated large fill on a projector blooms and raises the veil on the whole screen. High chroma and low lightness belong to small marks (state words, icons, 2 px rules). That matches the existing product ("colour as text colour only").
- Harmony relationships already in the product: bank purple vs RBI orange is a near-complementary pair (hue difference about 130 to 150 degrees in OKLCH); accent blue vs amber highlighter is also near-complementary. Ok green / abstain blue / accent navy are analogous cool tones, which is why green-vs-blue is easy to read while green-vs-brick-red is not (section 3).
- Tinted neutrals: the product's paper (`#f7f5ef`) is a warm neutral and ink (`#1b1e22`) a cool slate neutral, a warm/cool pairing that keeps pure white and pure black off a projector. I computed the tint fills at only 4 to 8 ΔE2000 from paper (table in section 7), so a tint must always be backed by a 1.5 px state-colour border; tints alone can vanish under ambient light.

### Gaps
- I did not find or fetch a primary source for the 60-30-10 rule, for OKLCH lightness/chroma guidance, or for IBM Carbon / Material semantic-colour documentation (not fetched within the tool budget). Treat those as reasoning, not citations.

---

## 2. Contrast on projectors: margin above WCAG, APCA, light vs dark in lit rooms

### Takeaway
No source I found gives a projector-specific contrast target. What is documented is that ambient light adds a veil that crushes real on-screen contrast, and WCAG numbers describe a screen, not a projected image. My recommended margin is derived from a simple veiling-light model (Inferences): body text at least 7:1, state labels and graphics at least 5.5:1, with large type and redundant cues.

### Cited Findings
- WCAG 2.2 SC 1.4.3: 4.5:1 for normal text, 3:1 for large text; large = 18 pt or 14 pt bold or larger (about 24 px / 18.5 px); computed values must not be rounded, so 4.499:1 fails; text in logos is exempt — [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- The same page treats charts, diagrams and symbols under SC 1.4.11 (non-text contrast), whose worked example is "just above 3:1" — [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Projector search results (snippets only; the full Live Design article returned HTTP 403 when fetched): even 2 foot-candles of ambient light on the screen can drop a front-projected image's ratio below 10:1; spec-sheet contrast is not what the viewer sees; in elevated ambient light a higher contrast ratio does not help much, and lumens become the main factor; ALR screens improve black levels — [Live Design, "Maximizing Environmental Dynamic Range"](https://www.livedesignonline.com/display-killer-projected-images), [RTINGS](https://www.rtings.com/projector/tests/picture-quality/contrast), [BenQ, "the myth of high contrast"](https://www.benq.com/en-us/knowledge-center/knowledge/the-myth-of-high-contrast.html)
- APCA (Myndex) use-case levels: Lc 75 minimum for columns of body text (Lc 90 preferred); Lc 60 minimum for non-body content text; Lc 45 minimum for headlines at 36 px normal or 24 px bold and for larger heavy text; Lc 30 minimum for solid icons, Lc 45 for fine outline icons, Lc 15 absolute minimum for dividers — [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)
- APCA says WCAG 2 "overstates contrast for dark colors", that 4.5:1 can be functionally unreadable near black, and that WCAG 2 contrast cannot guide dark-mode design — [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)
- Presentation accessibility guidance found: do not rely on colour alone (use bold, underline); aim for at least 4.5:1 on slide content with a checker; make text readable from the back of the room; preview in black and white to see if the slide still works — [Newcastle University](https://www.ncl.ac.uk/learning-and-teaching/digital-technologies/digital-accessibility/accessible-presentations/), [Smashing Magazine](https://smashingmagazine.com/2018/11/inclusive-design-accessible-presentations), [University of Washington DO-IT](https://www.washington.edu/doit/how-can-you-make-your-presentation-accessible), [Princeton Keller Center](https://kellercenter.princeton.edu/accessibility-best-practices-presentations)
- A 2014 WebAIM list thread asked whether WCAG screen checks hold for stage-projected slides; the retrieved excerpt did not answer it — [WebAIM list archive](https://webaim.org/discussion/mail_message?id=26429)

### Inferences
- Veiling-light model (mine, not from a source): add ambient fraction `a` (ambient luminance as a share of screen-white luminance) to both colours in the WCAG ratio, `eff = (Y1 + 0.05 + a) / (Y2 + 0.05 + a)`. Computed results for the light deck (nominal ratio in brackets, then effective at a = 0, 0.05, 0.10, 0.20):
  - ink on paper (15.3): 15.3, 9.0, 6.5, 4.4
  - ink-2 on paper (7.9): 7.9, 5.9, 4.8, 3.6
  - ink-3 `#686d75` (4.8): 4.8, 4.0, 3.5, 2.9
  - accent `#1f3a5f` (10.5): 10.5, 7.2, 5.6, 4.0
  - a state colour at 5.5 to 5.9 (proven / abstain / rbi): about 5.2 to 5.9 nominal, falling to about 3.7 to 4.0 at a = 0.10 and about 3.0 to 3.2 at a = 0.20
  - To stay at or above 4.5:1 effective at a = 0.10 a nominal ratio of at least 7.07 is needed; to stay at or above 3:1 at a = 0.10 a nominal ratio of at least 3.79; at a = 0.20 these become 16.5 and 5.1.
- Resulting rules for the deck: body text and any small text at least 7:1 (ink and ink-2 only; ink-2 is 7.93); state words and large labels (24 pt or more, bold) at least 5.5:1 so they keep at or above 3:1 effective even at a = 0.20; non-text marks (arrows, rules, icons) at least 4.5:1 and at least 2 px; hairlines (`line`, `line-strong`) are decoration only and must never carry meaning. Do not use ink-3 `#686d75` or ink-4 `#767a82` for text (4.78 and 3.95); where a grey caption is needed use `#5c6169` (5.72) at 20 pt or larger.
- Light vs dark in a lit room: in my model both polarities lose contrast by almost the same ratio (ink on dark `#121416` goes 15.1 to 6.1 at a = 0.10, versus 15.3 to 6.5 for ink on paper), because the veil is additive on both colours. The practical difference is perceptual, not arithmetic: a large dark field is rendered as the projector's black level plus the veil (a grey rectangle), WCAG ratios overstate dark-colour contrast (APCA source above), and dark slides depend on dimming the room. Recommendation: light body slides, with a dark variant only for the title and close slides, where the room can be dimmed or the screen is just a backdrop. This is a heuristic; the sources found do not directly compare slide polarities. Test on the venue projector before the event.
- APCA second opinion on the final light palette: ink Lc 98, ink-2 Lc 84, accent Lc 90, all five state colours Lc 74 to 86 on paper (the 24 px bold headline floor is Lc 45; body floor Lc 75). State colours at Lc 74 to 75 are just under the body-text floor, which is consistent with using them only as large bold labels, not as running text. The dark-slide state colours are Lc 60 to 66 on `#121416` (at or above the Lc 60 non-body floor, below the body floor, so again labels only).

### Gaps
- No source for Microsoft or Apple keynote colour guidance; no controlled study comparing light vs dark slides when projected in lit rooms; no stated projector-specific WCAG margin anywhere. The 7 / 5.5 / 4.5 rules above are derived, not quoted.
- Live Design article was fetchable only as a search snippet (HTTP 403 on fetch), so the "2 foot-candles" figure is second-hand.

---

## 3. Colour-blind safety of the semantic colours

### Takeaway
Two product pairs are genuinely unsafe for deutan/protan viewers: proven green vs withheld red-brown (ΔE2000 only 6.6 deutan / 8.8 protan) and the rbi orange vs partial amber (1.6 deutan). A third is a near-collision under protan: conflict magenta vs abstain blue (6.9). Fixes: shift proven to a bluish green, darken withheld, and give every state a glyph and a word. Bank purple vs RBI orange is safe (ΔE above 48 for every simulated type).

### Cited Findings
- Okabe & Ito: do not convey information in colour only; use shape, position, line type, symbols or hatching; label directly instead of using a key; avoid red-green pairs; differ in brightness or saturation, not only hue; dark red can look almost black to protanopes, so avoid red text on dark backgrounds; the palette names are vermilion, reddish purple, bluish green, sky blue, blue, yellow, orange — [Okabe & Ito](https://jfly.uni-koeln.de/color/)
- Paul Tol: Bright, High-contrast, Vibrant and Muted are colour-blind safe; combinations to treat with caution: yellow/green, blue/violet, cyan/pink/grey — [Paul Tol](https://sronpersonalpages.nl/~pault/)
- Presentation guidance: colour must not be the only distinguishing factor (use bold, underline) — [Newcastle University](https://www.ncl.ac.uk/learning-and-teaching/digital-technologies/digital-accessibility/accessible-presentations/); [University of Washington DO-IT](https://www.washington.edu/doit/how-can-you-make-your-presentation-accessible)
- Simulation method: Machado, Oliveira and Fernandes (2009), IEEE TVCG 15(6) 1291-1298, with precomputed matrices per severity (1.0 = dichromacy); the Python `colour` library notes its tritanomaly handling is only an approximation — [UFRGS project page](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html), [colour.blindness.machado2009 source](https://colour.readthedocs.io/en/v0.4.7/_modules/colour/blindness/machado2009.html)

### Inferences (all numbers computed by me, CIEDE2000 on simulated colours; n = normal vision, D = deuteranopia, P = protanopia, T = tritanopia; around 10 or more is a comfortable difference, below about 10 means "do not rely on colour")
- Product tokens, as shipped:
  - ok `#2b6a3e` vs withheld `#8a3b2a`: n 46.7, D 6.6, P 8.8, T 50.1. Collides for red-green deficiency. The sim turns them into two similar olive-browns.
  - conflict `#962a66` vs abstain `#3b5a80`: n 32.5, D 13.0, P 6.9.
  - conflict `#962a66` vs bank `#6a40a3`: n 18.4, D 19.3, P 11.7, T 23.6. Only moderately different even for normal vision; do not put them adjacent without words.
  - rbi `#a85300` vs partial `#85570a`: n 10.4, D 1.6, P 5.6. Orange and amber-brown collapse for deutan.
  - bank `#6a40a3` vs rbi `#a85300`: n 48.0, D 52.4, P 54.4, T 26.4. Safe (blue-ish vs olive-yellow after simulation), the classic Okabe-style pair.
  - ok `#2b6a3e` vs inforce `#2e7a49`: ΔE about 5; they are the same family on purpose.
- Proposed fixes and the result (final light palette, section 7):
  - proven `#2b6a3e` to `#14704f` (greener to bluish green): proven vs withheld now D 13.9, P 16.2; proven vs conflict D 12.3, P 29.6; proven vs abstain D 27.0, P 30.6.
  - withheld `#8a3b2a` to `#7a2a1a` (darker, redder): contrast on paper 8.86 (also better for projection); vs conflict D 24.9, P 31.2; vs abstain D 40.5.
  - abstain `#3b5a80` to `#3f6590` (slightly lighter, a touch more teal, so it separates from the darker accent and from conflict): abstain vs conflict now D 14.1, P 11.1; abstain vs accent n 14.7 (still readable as a different tone, but both are blues, so abstain is always paired with a glyph and a word).
  - rbi `#a85300` to `#964a00`: only to reach 5.88 contrast (was 4.94); the partial amber is not used in the deck, and the highlighter amber is used only as a fill behind dark text, so the rbi-vs-amber collapse is avoided by rule (never put rbi-coloured text on the highlighter).
  - superseded `#8b8f96` (2.98 on paper, fails 3:1) to a grey text colour `#5c6169` (5.72) for words, and `#7a7e86` (3.74) for hatched bars and graphics.
- Residual collisions that colour cannot fix (rely on non-colour cues): conflict `#962a66` vs superseded grey `#5c6169` under deuteranopia collapse (D 1.5, because deutan simulation turns the magenta into grey); proven vs conflict under deuteranopia is 12.3. Tritanopia (simulated approximately): proven vs abstain 6.3, withheld vs conflict 8.0.
- Redundant cues to enforce on every slide (state word always printed; glyph; line style), consistent with the product's own rule "icon + label + colour, never colour alone" (`tokens.css` comment, `DESIGN.md`):
  - PROVEN: check mark glyph, solid 2 px underline or left rule.
  - WITHHELD: cross or empty-bracket glyph, struck-through sentence text, dashed outline.
  - CONFLICT: not-equal or two-arrow glyph, two columns, deciding words underlined.
  - SUPERSEDED: struck-through text, hollow pip, diagonal hatching on bars (the product already draws superseded as a hollow struck-through grey pip and hatched provision bars).
  - ABSTAIN: open-circle or filing-cabinet glyph, the word "ABSTAIN", slate-blue card, never red (product rule).
  - bank vs RBI: purple solid line vs orange dashed line, "Your bank" / "RBI" written beside each, not only coloured.
- Matrices used (Machado 2009, severity 1.0, applied in linear sRGB): protan [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]; deutan [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]]; tritan [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]. Every row sums to 1.0 (a self-consistency check I ran), but see Gaps.

### Gaps
- The matrices were entered from my memory of the published values; the UFRGS page and the `colour` library both returned unparseable or uninstalled results in this environment, so I could not cross-check them line by line (pip/numpy unavailable). They pass the row-sum check and produce plausible results, but treat the ΔE values as approximate (a few units).
- Tritan results rely on a model the library itself calls an approximation. Tritanopia is rare; do not over-weight those numbers.
- I did not find the full Okabe-Ito hex list in a fetched source (the page shows it as an image). From memory the commonly published values are #E69F00, #56B4E9, #009E73, #F0E442, #0072B2, #D55E00, #CC79A7 and black; this is unverified here.
- ΔE thresholds ("about 10 is comfortable") are my rule of thumb, not from a cited standard.

---

## 4. Semantic colour conventions, including legal citator flags

### Takeaway
Legal research tools use a two-step severity ladder: red means a hard stop (overruled, repealed, superseded, "no longer good law") and yellow means caution (negative history, not struck down); blue means history or neutral information, green means "has citing references, no negative history". The product's superseded = grey and conflict = magenta already avoid the stop/caution confusion with proven/withheld, and the guide below keeps that.

### Cited Findings
- KeyCite (Thomson Reuters): red flag = for cases "no longer good law for at least one of the points of law it contains"; for statutes and regulations it signals amendment, repeal, supersession, or unconstitutionality/preemption in whole or part; yellow flag = "some negative history, but hasn't been reversed or overruled" (for statutes, renumbering, pending legislation, reinstatement, or doubts about validity); blue striped flag = appealed; blue H = has history; green C = citing references with no direct negative history; red U = unverified citation — [Thomson Reuters, KeyCite status flags](https://www.thomsonreuters.com/en-us/help/drafting-assistant/westcheck/keycite-status-flags.html)
- Shepard's (LexisNexis): red stop-sign signal = strong negative history (overruled, reversed); yellow = history or treatment that may significantly hurt your case (limited, criticised); blue "A" = neutral treatment (explained); Shepard's assigns a signal to most cases, whereas KeyCite left 77.3 percent of cases without a flag in one comparison — that comparison is by LexisNexis, which has a commercial interest — [LexisNexis Shepard's comparison study](https://www.lexisnexis.com/community/insights/legal/b/thought-leadership/posts/shepards-comparison-study), [University of Cincinnati law library guide](https://www.law.uc.edu/academics-career/library/marx-markings-blog/2025-blog-archives/understanding-keycite-and-shepard-s-symbols.html), [LexisNexis Shepard's signal indicators](https://www.lexisnexis.com/en-us/support/lexis/faqs/shepards-signal-indicators.page)
- In both systems the absence of a flag does not guarantee good law; the citator only reports what it has recorded — [University of Cincinnati law library guide](https://www.law.uc.edu/academics-career/library/marx-markings-blog/2025-blog-archives/understanding-keycite-and-shepard-s-symbols.html)
- Product precedent: "Validity sits on the citation itself: a solid green pip for in force, a hollow struck-through grey pip for superseded", which cites KeyCite/Shepard's as the reference; abstain "uses a slate-blue card, never red" — `frontend/DESIGN.md` (Principles table).

### Inferences
- Mapping that keeps conventions: PROVEN = green (verified, "good law"); WITHHELD = red-brown (blocked, stop); CONFLICT = magenta/purple (a distinct "two sources disagree" state, deliberately not the stop red and not the caution yellow, so it cannot be misread as either); SUPERSEDED = grey with strike-through (outdated; KeyCite would use a red flag for "superseded", but the product chooses grey because the clause was once valid and is not an error); ABSTAIN = slate blue (neutral and informational, like the blue "A" / blue H of the citators, a calm "no answer is a correct outcome").
- Because KeyCite uses yellow for caution, use the amber highlighter only as the evidence-quote fill (as in the product); do not use amber as a state colour, so the audience never reads the highlight as "warning".

### Gaps
- I did not find Carbon or Material semantic-colour documentation in this session (not fetched). Conventions "green = success, red = error, amber = warning, blue = info" are widely used, but I have no citation here.

---

## 5. Trust colours for Indian banking/finance and cultural pitfalls

### Takeaway
Indian bank palettes are dominated by blue (SBI, HDFC blue-and-red) and red (HDFC, Kotak) with orange or maroon in ICICI; the product's ink-blue accent sits comfortably in that family, while saffron/green/white combinations should be avoided to prevent tricolour or communal-symbol readings. I found no official RBI hex, and third-party hexes for the banks disagree, so none of the bank hex values below should be used as brand matches.

### Cited Findings
- Official hex values for RBI, SBI, HDFC, ICICI and Kotak were not found; third-party colour sites disagree. Reported values (unofficial): SBI midnight blue `#292075` and picton blue `#00B5EF`; HDFC red `#ED232A` or `#ED1C24` and blue `#004B8D` (blue appears on one site only); ICICI `#B02A30`, `#F99D27`, `#005B75` on one site vs maroon `#6E1E24` and orange `#F58220` on another; Kotak red `#ED1C24` (the same value another site gives HDFC, so suspicious) — [BrandColorCode: SBI](https://www.brandcolorcode.com/state-bank-of-india), [Coloropedia: SBI](https://coloropedia.com/?p=9482), [BrandColorCode: HDFC](https://www.brandcolorcode.com/hdfc-bank), [color.codes.in: HDFC](https://color.codes.in/brands/hdfc-bank), [BrandPalettes: ICICI](https://brandpalettes.com/icici-bank-logo-colors/), [color.codes.in: ICICI](https://color.codes.in/brands/icici-bank), [color.codes.in: Kotak](https://color.codes.in/brands/kotak)
- NPCI publishes brand guidelines per product (RuPay, UPI, BHIM, Bharat BillPay); the RuPay Business logo lists an orange at RGB 217,120,45, and primary colours are taken from the NPCI palette; the extracted text of the other guideline PDFs was too garbled to read reliably — [NPCI brand centre](https://www.npci.org.in/npci-in-news/brand-centre), [RuPay brand guidelines](https://npci.org.in/PDF/npci/brand-center/RuPay-Brand-Guidelines.pdf)
- Search for an RBI hex returned only Bank of India values (`#017DC7`, `#FA7F22`, `#F33F26`), which are a different bank; no RBI palette — [BrandPalettes: Bank of India](https://brandpalettes.com/bank-of-india-boi-logo-colors/)
- Flag-colour meanings: the Congress adopted the saffron-white-green tricolour in 1931 and declared the colours carried no communal meaning; saffron is read as courage and sacrifice, white as truth and peace, green as prosperity; however, saffron is also associated with a political organisation (the RSS) and in 1921 Gandhi's red and green stood for Hindu and Muslim communities — [GKToday colour symbolism](https://www.gktoday.in/colour-symbolism-in-indian-culture-festivals-and-national-identity/), [World Economic Forum, history of India's flag](https://www.weforum.org/stories/geographies-in-depth/the-secret-history-of-indias-flag/), [Quartz India](https://qz.com/india/1056914/the-long-forgotten-histories-of-the-colours-in-the-indian-tricolour)
- Cultural meanings: red = marital auspiciousness, fertility, sindoor, bridal wear; saffron = renunciation and sacred use; green is also a revered colour in Islam; white means purity and peace but is often associated with death and mourning (traditionally widows wore white); practices vary by region (for example Deccani brides wear green) — [GKToday](https://www.gktoday.in/colour-symbolism-in-indian-culture-festivals-and-national-identity/), [Color-meanings.com](https://www.color-meanings.com/color-meanings-indian-culture), [Aza Fashions](https://www.azafashions.com/blog/the-colors-of-india-symbolism-in-fashion-and-culture/)
- A UX source notes that many Indian digital interfaces use modern, neutral palettes following international design standards, so saffron-and-green is not the default for Indian products — [Uxcel](https://app.uxcel.com/lessons/cultural-differences-in-color-perception-986/vivid-colors-in-india-4226)
- Some popular colour-meaning pages include poorly established claims (for example planetary associations); cross-check before using — the same search results.

### Inferences
- Deep ink-blue as the one accent is on-category for Indian banking trust (SBI and HDFC both use blue) while staying distinct from any single bank's brand, which matters for a product that sits between the bank and the regulator.
- Avoid on the slides: saffron + white + green in sequence (reads as the flag or a party); a large saffron or orange field (the rbi orange `#964a00` is a deep burnt orange, used only as a thin line and word, never a large field); white-as-mourning is not a risk for a warm off-white paper background, but avoid pure white backgrounds with black bands, which read funereal; and do not use red as celebratory or "success" (red means danger in UI and auspicious in weddings; both readings are in play, so use red-brown "withheld" only with the word and an X glyph).
- Do not claim or imitate any bank's or RBI's brand colour; the product deliberately uses its own neutral identity. Do not use RBI's logo or emblem colours.

### Gaps
- No official brand guidelines with hex for RBI, SBI, HDFC, ICICI, Kotak; brandfetch pages returned HTTP 403. SEBI palette not searched. NPCI guideline PDFs were not read in full (garbled extraction).
- The cultural sources are tourism, fashion and generalist sites rather than scholarly ones; I did not find a design-research study on colour semantics in Indian fintech UI.

---

## 6. Method and computed checks (what was actually run)

### Takeaway
Everything numeric in this file comes from one small Python script (WCAG 2.x relative luminance, APCA 0.0.98G style Lc, OKLab distance, CIEDE2000, Machado 2009 CVD simulation). It is kept in the session scratchpad and is easy to reproduce from the formulas below.

### Cited Findings
- WCAG relative luminance and ratio rules (no rounding) — [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- APCA level definitions used for the second opinion — [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)
- CVD model — [Machado et al. 2009 project page](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html)

### Inferences
- Script location (session scratchpad, may be cleared): `/private/tmp/claude-501/-Users-gaurav-Hack-a-sol-5-0/01e249b1-3dbd-4726-8389-d155fd2f7c2c/scratchpad/lib.py` and `final.py`.
- Sanity checks that passed: white on black = 21.0:1; every CVD matrix row sums to 1.0; the product's own comment "ink-4 at least 3.9:1 on paper" reproduces as 3.95, and "#8b8f96 was 2.98:1" reproduces as 2.98.
- APCA was implemented from memory of the published 0.0.98G constants (not fetched); values are approximate and used only as a second opinion.

### Gaps
- No second implementation (such as the `colour` library or the official Myndex package) was available to cross-check CVD matrices and APCA.

---

## 7. FINAL DECK PALETTE (deliverable)

### Takeaway
Seven product tokens stay unchanged, five change (proven, withheld, abstain, rbi, superseded text), and nothing is added except a text-safe grey and a stronger border rule for tints. Every text pair passes at least 5.5:1 and every neutral body pair passes 7:1. All values below are computed (WCAG 2.x ratios; APCA Lc as a second opinion).

### Cited Findings
- WCAG targets used: 4.5:1 text, 3:1 large text and graphics — [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); product source tokens — `frontend/src/styles/tokens.css`, read locally.

### Inferences

Deck thresholds (derived in section 2): body or small text at least 7:1; state words and 24 pt+ bold labels at least 5.5:1; non-text marks at least 4.5:1 and at least 2 px; tints are decorative and always edged.

**A. Light deck (default for all content slides)**

| Token | Hex | Role | Where used | Contrast vs its background (WCAG / APCA Lc) | Result |
|---|---|---|---|---|---|
| paper | `#f7f5ef` | Slide background (about 60%) | Every content slide | n/a | unchanged from product |
| surface | `#fffefb` | Cards, evidence panels, screenshots frame | Callout cards | ink on surface 16.59 | unchanged |
| surface-2 | `#f1eee6` | Quiet band, table zebra | Footers, table rows | ink on surface-2 14.43; ink-2 7.45 | unchanged |
| ink | `#1b1e22` | Titles, body | All text | 15.34 on paper (Lc 98) | PASS (7:1 body) |
| ink-2 | `#474c54` | Secondary text, captions at 20 pt+ | Subheads, notes | 7.93 on paper (Lc 84); 7.45 on surface-2 | PASS (7:1 body), unchanged |
| ink-3 caption | `#5c6169` | Grey captions at 20 pt or larger only (CHANGED from `#686d75` at 4.78) | Footnotes, source lines | 5.72 on paper; 5.38 on surface-2 | PASS (5.5:1 large), changed so it clears the projector margin |
| accent (ink blue) | `#1f3a5f` | The single accent: headlines emphasis, links, primary shapes | Title word, key numbers, buttons | 10.53 on paper (Lc 90); 9.57 on accent-tint | PASS, unchanged |
| accent-tint | `#e5ebf3` | Soft fill behind accent content | Highlight panels | accent on it 9.57 | PASS, unchanged |
| highlighter | `#f9e3a2` | Amber quote fill, always behind dark text, never as text | Evidence quote marks | ink on it 13.17; ink-2 6.81; accent 9.04; fill vs paper ΔE 17.4 | PASS; border `#d29a12` is 2.30 vs paper so it is decoration, never meaning |
| line | `#e3dfd4` | Hairlines | Dividers | 1.22 vs paper | decoration only (WCAG does not require; never carries meaning) |
| line-strong | `#cdc8ba` | Card outlines | Frames | 1.53 vs paper | decoration only |
| PROVEN | `#14704f` (CHANGED from `#2b6a3e`) | Verified sentence | Word, check glyph, 2 px rule | 5.57 on paper (Lc 74); 5.13 on its tint | PASS (5.5:1 large) |
| PROVEN tint | `#e3efe5` | Fill (unchanged) | Sentence background plus 1.5 px border `#91b9a7` | tint vs paper ΔE 7.0 | decoration |
| WITHHELD | `#7a2a1a` (CHANGED from `#8a3b2a`) | Blocked sentence | Word, struck text, X glyph | 8.86 on paper (Lc 86); 8.08 on tint | PASS (7:1) |
| WITHHELD tint | `#f6e8e3` | Fill (unchanged) | Withheld tray | tint vs paper ΔE 6.2 | decoration |
| CONFLICT | `#962a66` (unchanged) | Two sources disagree | Word, not-equal glyph | 6.83 on paper (Lc 79); 6.06 on tint | PASS |
| CONFLICT tint | `#f5e3ec` | Fill (unchanged) | Conflict card | tint vs paper ΔE 11.6 | decoration |
| SUPERSEDED text | `#5c6169` (CHANGED from `#8b8f96` at 2.98) | Outdated clause words | Struck text, hollow pip | 5.72 on paper (Lc 75); 5.18 on its tint | PASS |
| SUPERSEDED hatch/graphic | `#7a7e86` | Hatched bars, hollow pip outline | Timeline bars | 3.74 on paper | PASS as a graphic at 3:1; always with strike-through or hatching |
| SUPERSEDED tint | `#eceae4` | Fill | Struck row | tint vs paper ΔE 2.3 | decoration; the strike-through carries meaning |
| ABSTAIN | `#3f6590` (CHANGED from `#3b5a80`) | No-answer outcome | Word, open-circle glyph, slate card | 5.54 on paper (Lc 74); 5.08 on tint | PASS (5.5:1 large) |
| ABSTAIN tint | `#e6ecf3` | Fill (unchanged) | Abstain card | tint vs paper ΔE 7.1 | decoration |
| BANK | `#6a40a3` (unchanged) | "Your bank" side | Column rule (solid line), word | 6.70 on paper (Lc 79); 6.11 on tint | PASS |
| BANK tint | `#efe8f8` | Fill (unchanged) | Bank column | tint vs paper ΔE 11.7 | decoration |
| RBI | `#964a00` (CHANGED from `#a85300` at 4.94) | "RBI" side | Column rule (dashed line), word | 5.88 on paper (Lc 75); 5.46 on tint | PASS |
| RBI tint | `#fbeadb` | Fill (unchanged) | RBI column | tint vs paper ΔE 6.9 | decoration |

Justification for each change:
1. proven `#2b6a3e` to `#14704f`: the product pair proven/withheld had ΔE2000 6.6 (deutan) and 8.8 (protan); the new greener-bluer, slightly lighter green makes it 13.9 / 16.2 while contrast stays at 5.57. Needed for about 8 percent of men.
2. withheld `#8a3b2a` to `#7a2a1a`: darker and redder, contrast 7.03 to 8.86 (extra projector margin) and further from the new proven.
3. abstain `#3b5a80` to `#3f6590`: separates it from the darker accent (n ΔE 14.7) and from conflict under protan (6.9 to 11.1); contrast moves 6.51 to 5.54, still above 5.5.
4. rbi `#a85300` to `#964a00`: the product value was 4.94, below the 5.5 deck floor; the new value is 5.88.
5. superseded `#8b8f96` to `#5c6169` for text and `#7a7e86` for graphics: the product value is 2.98:1 and fails 3:1; the words need text contrast and the hatch needs 3:1. Meaning is carried by strike-through or hatching, never grey alone.
6. ink-3 `#686d75` to `#5c6169` for captions: 4.78 to 5.72; use at 20 pt or larger only.
7. Tint borders: tints are only 2 to 12 ΔE2000 from paper, so each tinted card gets a 1.5 px border using a 45 percent mix of its state colour over paper (computed: `#91b9a7` proven, `#bf9a8f` withheld, `#cb9ab1` conflict, `#a4b4c4` abstain, `#b1b2b3` superseded, `#b8a4cd` bank, `#cba883` RBI); these are 1.9 to 2.3 against paper, so use 2 px if the border must be seen from the back.

Unchanged and not recommended for the deck: partial `#85570a` and future (amber) states, inforce `#2e7a49` (4.82; use proven instead), focus `#2f6fd6` (4.41, fails 4.5 on paper; UI-only), ink-4 `#767a82` (3.95, not for text).

CVD distance check for the final light set (CIEDE2000; D = deuteranopia, P = protanopia, T = tritanopia, approximate)

| Pair (must be distinguishable) | Normal | D | P | T | Verdict |
|---|---|---|---|---|---|
| proven vs withheld | 50.0 | 13.9 | 16.2 | 53.7 | OK (was 6.6 / 8.8 in the product) |
| proven vs conflict | 62.7 | 12.3 | 29.6 | 55.9 | OK |
| proven vs abstain | 31.5 | 27.0 | 30.6 | 6.3 | OK except tritan (rare) |
| proven vs superseded | 24.5 | 12.8 | 17.1 | 17.3 | OK |
| withheld vs conflict | 24.0 | 24.9 | 31.2 | 8.0 | OK except tritan |
| withheld vs abstain | 38.7 | 40.5 | 37.3 | 49.3 | OK |
| conflict vs abstain | 34.6 | 14.1 | 11.1 | 55.3 | OK (was 6.9 protan) |
| conflict vs superseded | 25.5 | 1.5 | 13.0 | 19.9 | FAIL for deutan: rely on glyph, strike-through and the word |
| abstain vs superseded | 12.9 | 13.4 | 12.9 | 15.5 | marginal: glyph and word required |
| abstain vs accent | 14.7 | 13.8 | 14.7 | 14.8 | marginal: never place side by side without labels |
| conflict vs bank | 18.4 | 19.3 | 11.7 | 23.6 | OK, still label |
| bank vs RBI | 46.7 | 52.4 | 51.1 | 24.7 | OK |
| withheld vs rbi | 15.7 | 11.3 | 12.8 | 8.8 | marginal: they never share a slide region |

Simulated hex under deutan / protan for reference: proven `#635f51` / `#6e674d`; withheld `#544b17` / `#403918`; conflict `#5a5c64` / `#3b4968`; abstain `#495f8f` / `#536792`; superseded `#5d6069` / `#5f6169`; bank `#1f56a1` / `#0356a6`; rbi `#736500` / `#615400`.

**B. Dark variant (title and close slides only)**

Background: product dark paper `#121416` (also valid: deep ink-blue `#14263d`, brand-tied, numbers below). Surface `#181b1e`, line `#3a3f45` (1.74 vs bg, decoration only).

| Token | Hex | Role | Contrast on `#121416` (WCAG / APCA Lc) | On navy `#14263d` | Result |
|---|---|---|---|---|---|
| ink | `#ebe8e2` | Title, body | 15.10 (Lc 92) | 12.50 | PASS (7:1) |
| ink-2 | `#c0bcb4` | Subtitle | 9.75 (Lc 66) | 8.07 | PASS (7:1) |
| ink-3 | `#9a968e` | Small footer, 20 pt+ | 6.27 (Lc 45) | 5.19 | PASS on `#121416` for large; on navy only 5.19, so do not use there |
| accent-light | `#9dbbe2` | The accent on dark | 9.35 (Lc 64) | 7.74 | PASS |
| highlighter amber | `#e2b765` | Amber fill (dark ink `#121416` on it 9.84) or amber word | 9.84 (Lc 66) | 8.15 | PASS |
| PROVEN | `#5fd0ae` (CHANGED from `#84c69a`) | Verified | 9.78 (Lc 66) | 8.09 | PASS |
| WITHHELD | `#f2a58e` (CHANGED from `#e3a796`) | Blocked | 9.27 (Lc 63) | 7.67 | PASS |
| CONFLICT | `#e59cc4` | Disagree | 8.69 (Lc 60) | 7.19 | PASS (unchanged) |
| ABSTAIN | `#a7bfdc` | No answer | 9.78 (Lc 66) | 8.10 | PASS (unchanged) |
| SUPERSEDED | `#9a968e` | Outdated, with strike-through | 6.27 | 5.19 | PASS on `#121416` as large text |
| BANK | `#c1a2f0` | Bank side | 8.52 (Lc 59) | 7.05 | PASS (unchanged) |
| RBI | `#f0a764` | RBI side | 9.16 (Lc 63) | 7.58 | PASS (unchanged) |

Dark-variant changes: proven moved from `#84c69a` to the bluer, more saturated `#5fd0ae` and withheld from `#e3a796` to `#f2a58e`, because the product's dark pair was only 3.7 (deutan) / 5.1 (protan) ΔE; the new pair is 13.6 (deutan) / 6.8 (protan). The protan figure is still low, so on dark slides each state must carry its glyph and word, and ideally one state per slide. Conflict vs abstain in dark remains 7.6 (deutan) / 5.7 (protan), so never place them as the only cue.

A deep-navy background gives the same states 7.05 to 8.15, which keeps them above 7:1 but loses the neutral match with the product's dark theme; ink-3 falls to 5.19. Recommend `#121416` for title and close, and a thin accent-light `#9dbbe2` rule as the single accent.

Projector note for dark slides: my veil model puts ink-on-dark at 8.5 effective (a = 0.05), 6.1 (a = 0.10), 4.1 (a = 0.20) (vs light 9.0, 6.5, 4.4); state colours on dark at about 5.4 (a = 0.05) and 4.0 (a = 0.10), so keep dark slides to large headline type, and use them only if the room can be dimmed.

### Gaps
- The palette has not been checked on a real projector or in the venue; do a 30-second test by displaying a paper-and-ink-2 slide and the five state labels from the back row, and fall back to the 2 px borders and heavier weights if tints disappear.
- Any slide that puts the highlighter amber behind accent or state-coloured text should be rechecked; I verified only ink (13.17), ink-2 (6.81) and accent (9.04) on `#f9e3a2`, not the state colours.
- I did not verify the Plex font weights at slide size; the thresholds assume 24 pt bold or larger for state labels. Plex Sans Regular at 24 pt is borderline on thin strokes; use Medium (500) or SemiBold.
