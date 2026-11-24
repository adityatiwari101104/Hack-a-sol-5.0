# Chat-with-PDF landscape, backend→UI showcase map, and banking features: Proof-or-Silence

Research date: 24 Nov 2026. Method: web search and fetches of vendor pages, help centres, press releases and third-party write-ups, plus a read of `HANDOFF.md`, the AIML-02 section of `Hackasol_5.0_Problem_Statement.pdf`, `backend/app/api.py`, `backend/app/service.py` (the `ask` path and `_result`), `verify.py`, `impact.py` and `audit.py`.

This note does **not** repeat `ui_research.md`, `ui_mobbin_flows.md`, `saas_landscape.md` or the UI section of `reports/Proof or Silence next steps.md`. Those cover citation patterns (chip → hover → highlighted pane), the Proof Meter and Withheld tray, the as-of scrubber, the visual style, Harvey/Lexis/Westlaw validity flags, RegTech obligation mapping and the Indian legal-AI landscape. This note adds three things: the general chat-with-PDF and finance tools, a field-by-field map from our API to UI components, and new banking features.

Labels used:
- **[claim]**: a vendor's own marketing, help or press text.
- **[3rd-party]**: a review site, aggregator, analyst or competitor page.
- **[docs]**: the vendor's help or developer documentation, describing its behaviour.
- **Observation** sections report what sources say. **Recommendation** sections are my proposals.

---

## Takeaway

**Observation.**
1. Every chat-with-PDF product now cites. The citation forms are:
   - a clickable chip that scrolls to the passage (ChatPDF, Humata, NotebookLM, AlphaSense);
   - a "References" list (Copilot in Word);
   - an API pointer (Claude citations).
2. None of the 20+ products surveyed publicly claims any of these:
   - **per-sentence verification before display.** AlphaSense's blog only mentions a vague "multi-step filtering process" and "multi-LLM approach"; Gemini's "Double-check" runs after the answer, against Google Search, on request.
   - **abstention with reasons.** The closest are NotebookLM's "can't answer this question" and AlphaSense's "says so when nothing is found".
   - **as-of / in-force versioning.**
   - **cross-document contradiction triage.** Acrobat Studio claims to help "identify … contradictions", but only as a free-form prompt.
3. Anthropic's own docs are explicit that a citation API guarantees only "valid pointers to the provided documents". A valid pointer is not proof that the sentence is supported, and that gap is exactly the one Proof-or-Silence closes.
4. Finance tools compete on data breadth, grids and agents, not on proof:
   - AlphaSense and Bloomberg: licensed content.
   - Hebbia: a document×question grid.
   - Rogo: banker workflows.
5. Contract tools compete on clause extraction and playbook review:
   - Kira: 1,400+ trained fields **[claim]**.
   - Luminance: playbooks.

**Recommendation.**
1. Judges will have used ChatGPT, NotebookLM or Acrobat. So the UI must make visible the four things those products cannot show:
   - **checks per sentence**;
   - **what was withheld and why**;
   - **which version was in force on the as-of date**;
   - **a conflict shown with both quotes side by side**.
2. On the banking side, the strongest additions reuse endpoints we already have and cost $0:
   - an **inspection-ready evidence pack**;
   - a **code-only rule simulator**, Tier 3/4 × amount × borrower;
   - an **impact-alert → maker-checker** flow;
   - an **AI-governance page** mapped to RBI's FREE-AI report and the June 2026 draft model-risk guidance.
3. Hindi answers are a stated PS bonus. They are the one new feature worth a few cents of live spend.

---

## Product comparison table

Legend:
- ✓ = documented.
- ~ = partial, or via a workaround.
- ✗ = not documented anywhere I found. Absence of documentation is not proof the feature is absent.
- (C) = vendor claim.
- (3P) = third-party source only.

"Verify" means each claim is checked against its source before it is shown. "Abstain" means a designed refusal that says what is missing.

| Product | Multi-doc | Citation style | Page jump / highlight | Tables / OCR | Languages | Compare docs | Summaries | Export / share | Audit | Pricing tier | Verify | Abstain | Versions / as-of | Contradictions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ChatPDF | ✓ folders (C) | clickable citation "anchors" (C) | scrolls to source (C) | ✗ / ✗ | "any language" (C) | ✗ | ✓ | share link, revocable (C) | ✗ | free 2 docs/day; Plus price not on page (3P: $5–20/mo) | ✗ | ✗ | ✗ | ✗ |
| NotebookLM / Gemini Notebook | ✓ 50 sources (300 on Pro) | inline numbered quotes | hover = full quote; click = quote in context | ~ | multi (not stated on page) | ~ by prompt | ✓ source guide, audio | save to note keeps citations | ✗ | free / Google AI Pro | ✗ | ~ "can't answer this question" | ✗ | ✗ |
| Adobe Acrobat AI Assistant / Studio | ✓ mixed file types | "attribution engine" citations (C) | click → source | ✓ (Acrobat OCR) | ✓ | ~ "identify … contradictions" (C) | ✓ | copy; chat saved with docs | ✗ | add-on from US$4.99/mo at launch; Studio $35/mo early access (3P) | ✗ | ✗ | ✗ | ~ prompt-level (C) |
| Humata | ✓ unlimited docs (C) | highlighted citations (C) | links into source (C) | OCR on Team (C) | ✗ | ✓ (C) | ✓ | embed in webpage (C) | role-based security (C) | Free 60 pp; Expert $9.99; Team $49/user (C) | ✗ | ✗ | ✗ | ✗ |
| AskYourPDF | ✓ paid tiers (3P) | source references (3P) | ✗ | ✗ | translation (C) | ✗ | ✓ | share conversations; API (C) | ✗ | 3P: ~$10–15/mo | ✗ | ✗ | ✗ | ✗ |
| PDF.ai | ~ | citations (3P) | ✗ | OCR / layout API (3P) | ✗ | ✗ | ✓ | parse/extract API (C) | ✗ | 3P: ~$15–35/mo | ✗ | ✗ | ✗ | ✗ |
| Claude (Projects / file chat / API) | ✓ RAG up to ~10× context (docs) | API: `page_location` + `cited_text` (docs) | API gives page range; UI rendering not documented | visual ≤100 pp, text to 1,000 pp (docs) | multi | ~ by prompt | ✓ | ✗ | ✗ | Free/Pro/Max/Team | ~ pointer validity only | ✗ | ✗ | ✗ |
| ChatGPT file uploads | ✓ 25–40 project files (docs) | not described in FAQ | ✗ | text and charts in PDFs; spreadsheets via Data Analysis (docs) | multi | ~ | ✓ | ✗ | Enterprise retention (docs) | Free → Enterprise | ✗ | ✗ | ✗ | ✗ |
| Perplexity Spaces / Projects | ✓ (limits conflict; 3P) | numbered web-style chips | ✗ for files | ✗ | multi | ~ | ✓ | share Space | ✗ | Free / Pro / Enterprise | ✗ | ✗ | ✗ | ✗ |
| Microsoft Copilot (Word, Edge PDF reader) | ~ | Word: "References" in summaries (docs) | ✗ | via Word conversion (3P) | multi | ✗ | ✓ auto-summary | ✗ | M365 compliance | M365 Copilot / Copilot Pro | ✗ ("doesn't always provide citations to later content") | ✗ | ✗ | ✗ |
| Gemini in Google Drive | ~ "@" other files | not documented | ✗ | ✗ | some features English-only (docs) | ✗ | ✓ auto summary cards | ✗ | Workspace admin | Workspace / Google AI tiers | ✗ (Double-check is web-based, Gemini app) | ✗ | ✗ | ✗ |
| UPDF AI | online only (3P) | page-level answers (3P) | ✗ | ✓ editor OCR | page translation (3P) | ✗ | ✓ | ✗ | ✗ | ~$8–15/mo (C, promos vary) | ✗ | ✗ | ✗ | ✗ |
| Kami | ✗ (classroom) | ✗ | ✗ | annotation | Explain/Summarize, 100+ read-aloud languages (C) | ✗ | ✓ | LMS | opt-in AI (3P) | edu licences | ✗ | ✗ | ✗ | ✗ |
| AlphaSense Gen Search | ✓ licensed + internal | citation per insight (docs) | opens source, passage highlighted (docs) | ✓ | ✓ | ✓ | ✓ earnings | copy keeps citations (docs) | ✗ | 3P est. $10–20k/seat/yr | ~ "multi-step filtering" (C) | ~ says when nothing is found (docs) | ✗ | ✗ |
| Hebbia Matrix | ✓ grid of docs × questions | per-cell source (3P) | click cell → passage + derivation steps (3P) | ✓ | ✓ | ✓ grid | ✓ | ✗ | ✗ | 3P est. ~$10k/seat/yr | ✗ | ✗ | ✗ | ✗ |
| Rogo | ✓ | response-level, not sentence-level (competitor 3P) | ✗ | ✓ Excel | ✓ | ✓ comps | ✓ | Excel / PPT | ✗ | enterprise | ✗ | ✗ | ✗ | ✗ |
| Bloomberg (Doc Search & Analysis; ASKB; BloombergGPT) | ✓ Bloomberg + firm docs (C) | "extract cited text … direct links" (C) | summaries side by side with transcript (C) | ✓ | ✓ | ✓ comparative insights (C) | ✓ earnings / news | Terminal | ✗ | Terminal subscription | ~ AI safety team review (C) | ✗ | ✗ | ✗ |
| Kira (Litera) | ✓ projects | extracted field → clause | ✓ clause highlight | ✓ | 40+ areas (C) | ✓ across contracts | ✓ | Excel/workflow | GenAI on/off per project (C) | enterprise | ✗ (90%+ accuracy, C) | ✗ | ✗ | ✗ |
| Luminance | ✓ | clause-level | ✓ | ✓ | ✓ | vs playbook (C) | ✓ | Word add-in (3P) | ISO 27001 / SOC 2 (C) | enterprise | ~ "Panel of Judges" (C) | ✗ | ✗ | ~ deviation from playbook |
| India: NYAI, TeamLease RegTrack, TaxTMI | ✓ | NYAI "citation-backed" (C); RegTrack = checklists | ✗ | ✓ OCR monitoring (RegTrack C) | Hindi/Marathi (NYAI C) | ✗ | TaxTMI "AI text" summaries | ✗ | evidence of compliance (RegTrack C) | enterprise | ✗ | ✗ | ✗ (circular feeds only) | ✗ |
| **Proof-or-Silence (ours)** | ✓ 16 RBI + 7 bank PDFs, hybrid retrieval + graph expansion | sentence → E/R ids → doc, clause, page, verbatim quote, **bboxes**, **status** | ✓ bboxes per page (UI pending) | ✓ cross-page tables / ✗ OCR (scanned PDF → 0 chunks) | EN; Hindi question → English answer (Hindi answer pending) | ✓ code-side contradiction triage (CONFLICT / NEEDS_REVIEW / DIFFERENT_CONDITION / SUPERSESSION) | ✗ by design (no unverified summaries) | impact report `.md`; trace JSON | ✓ **hash-chained**, verify endpoint, maker ≠ checker | ≈ $0.0045/question at list price | ✓ quote → number → HHEM → MiniCheck → judge, per sentence | ✓ ABSTAIN / PARTIAL with `missing[].searched` + `closest` | ✓ `provision_versions`, IN_FORCE / SUPERSEDED / NOT_YET_IN_FORCE at as-of | ✓ both quotes, plus bank-vs-RBI impact |

---

## Per-product notes

Each entry lists **features / UI layout / what it does not do**. All are observations; the inferences are marked.

**ChatPDF** ([chatpdf.com](https://www.chatpdf.com/))
- Features **[claim]**:
  - citations are "built-in" and "anchor responses to PDF references";
  - clicking one scrolls to the exact source;
  - folders give multi-file chat;
  - a PDF can be in any language and the chat in another;
  - revocable share links that work without an account;
  - Word, PowerPoint and Markdown files are accepted;
  - queries are routed between GPT-4o and GPT-4o-mini.
- Layout: chat on one side, PDF on the other.
- Pricing: the free plan is 2 documents a day. The page does not give the Plus price, and third-party listings range from $5 to $20 a month ([Webtures](https://www.webtures.com/insights/what-is-chatpdf/)).
- Does not do: OCR or table handling are not mentioned. Nothing on verification, refusal, versions or contradictions.

**NotebookLM, renamed Gemini Notebook in July 2026 (rename reported by a third party, [Tech Insider](https://tech-insider.org/how-to-use-notebooklm-2026/))**
- Citations **[docs]** ([Use chat](https://support.google.com/notebooklm/answer/16179559?hl=en)):
  - responses use "direct quotes, text, and images from your sources as citations";
  - "hover over any citation" to get the full quoted text;
  - selecting a citation navigates "to the quote … in context";
  - "Save to note" keeps the clickable citations.
- When the sources lack the information, it says "can't answer this question", and Google warns it "can make mistakes".
- Limits **[docs]**: 50 sources per notebook, 300 on Pro ([Upgrade](https://support.google.com/notebooklm/answer/16213268?hl=en)).
- Layout: three panes (Sources | Chat | Studio). Clicking a source opens a "Source guide" summary card ([Computerworld](https://www.computerworld.com/article/3712691/google-notebooklm-generative-ai-notes-app.html)).
- Does not do:
  - no per-claim verification;
  - no notion of a superseded source. A 2026 guide warns that a citation does not prove a source is current ([Tech Insider](https://tech-insider.org/how-to-use-notebooklm-2026/));
  - no contradiction view.

**Adobe Acrobat AI Assistant / Acrobat Studio**
- "custom attribution engine" for citations **[claim]** ([Adobe newsroom](https://news.adobe.com/news/news-details/2024/adobe-brings-conversational-ai-to-trillions-of-pdfs-with-the-new-ai-assistant-in-reader-and-acrobat)).
- Multi-file chat over PDF, PPT, Word and text. You click a citation to "see where a generated answer came from", and copy output with a button ([Adobe tutorial](https://www.adobe.com/learn/acrobat/web/ai-assistant-multiple-documents)).
- The business page claims you can "compare content across multiple documents … to identify patterns, contradictions" **[claim]** ([Adobe business](https://business.adobe.com/in/products/acrobat-business/acrobat-studio/faster-insights.html)).
- Pricing:
  - launch add-on US$4.99/mo, explicitly an early-access rate ([CNBC](https://www.cnbc.com/2024/04/15/adobe-releases-acrobat-ai-assistant-starting-at-4point99-a-month.html));
  - Studio $35/mo or $300/yr at review time ([Macworld](https://www.macworld.com/article/2960950/adobe-acrobat-studio-review.html)).
- Layout: AI Assistant panel to the right of the PDF.
- Does not do: contradiction finding is prompt-driven, with no typed verdicts and no paired quotes. No abstention design, no versions.

**Humata** ([humata.ai](https://www.humata.ai/)) **[claim]**
- Features:
  - "Highlights citations" with "cited links into your source files";
  - "compare documents";
  - OCR on the Team plan;
  - embed in a webpage;
  - role-based security and folder permissions.
- Pricing: Free (60 pages / 10 answers), Expert $9.99, Team $49 per user, with per-page overage.
- Does not do: no verification, abstention or versions.

**AskYourPDF** ([askyourpdf.com](https://askyourpdf.com/))
- Features **[claim]**: multi-document chat, a document library, shared conversations, an API, PDF translation, and "GDPR compliant".
- Citation style is not on the homepage. Third parties say answers carry source references and that multi-doc chat is on paid tiers ([TopAI](https://topai.tools/t/ask-your-pdf)).
- Does not do: no verification, abstention or versions.

**PDF.ai**
- The site title is "Chat with PDFs & PDF API (parse, extract, split)" ([pdf.ai](https://pdf.ai/)).
- Third parties list citations and an OCR/layout API ([TopAI](https://topai.tools/t/pdf-ai)). Pricing figures conflict.
- Does not do: nothing documented beyond chat and parsing.

**Claude (Projects, file chat, API)**
- File handling **[docs]**:
  - visual PDF analysis up to 100 pages, text-only from 101 to 1,000 pages ([Claude help](https://support.claude.com/en/articles/8241126-upload-files-to-claude));
  - Projects switch to RAG automatically and expand capacity "by up to 10x" ([RAG for Projects](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)).
- The API Citations feature returns:
  - `page_location` citations with `cited_text`;
  - citations "guaranteed to contain valid pointers to the provided documents";
  - `cited_text` that "does not count toward output tokens" ([Claude API docs](https://platform.claude.com/docs/en/build-with-claude/citations)).
- *Inference:* the pointer is guaranteed, the support is not. That is the cleanest external statement of the gap our entailment checks fill.

**ChatGPT file uploads** **[docs]** ([File uploads FAQ](https://help.openai.com/en/articles/8555545-file-uploads-faq))
- Limits: 512 MB per file, 2M tokens per text file, 80 files every 3 hours, and 5/25/40 project files depending on plan.
- It handles "text and images in PDFs, including charts and diagrams". Project files and GPT knowledge are handled differently ([Visual retrieval FAQ](https://help.openai.com/en/articles/10416312-visual-retrieval-with-pdfs-faq)).
- The FAQ does not describe how citations to files appear.
- Does not do: no as-of, verification or contradiction features are documented.

**Perplexity Spaces (possibly renamed Projects; not confirmed)**
- Spaces hold files and custom instructions. Connector files count toward Space limits ([Spaces help](https://intercom.help/perplexity-ai/en/articles/10352961-spaces)).
- Projects: 10,000 files, 5 GB, 100 MB per file ([Enterprise file limits](https://www.perplexity.ai/help-center/en/articles/12009761-enterprise-file-limits)).
- Layout: the web-answer pattern (numbered chips, Sources tab), already covered in `ui_mobbin_flows.md`.
- Does not do: no page highlight for uploaded files is documented.

**Microsoft Copilot (Word, Edge)**
- Word **[docs]**: the auto summary has a "References" toggle that shows citations from inside the document. Microsoft notes it "doesn't always provide citations to later document content" ([MS Support](https://support.microsoft.com/en-us/office/create-a-summary-of-your-document-with-copilot-79bb7a0a-3bf7-41fe-8c09-56f855b669bf)). Citations in Word chat responses were announced later ([Windows Central](https://www.windowscentral.com/artificial-intelligence/microsoft-copilot/microsoft-gave-copilot-in-word-something-ai-desperately-needs-sources)).
- Edge:
  - Copilot can "summarize your open tabs, videos, or PDFs" ([MS Support](https://support.microsoft.com/en-us/Microsoft-Copilot/getting-started-with-copilot-in-microsoft-edge));
  - a roadmap item adds "Summarize"/"Explain" to the PDF reader's Ask Copilot menu ([M365 roadmap mirror](https://mc.merill.net/message/RM498641)).
- Does not do: no page-level PDF citation is confirmed officially.

**Gemini in Google Drive**
- The side panel auto-summarizes a PDF on open, answers questions, and pulls in other Drive files with "@". Some features are English-only ([Workspace Updates](https://workspaceupdates.googleblog.com/2024/07/gemini-in-side-panel-of-google-drive-pdf-viewer.html); [Drive help](https://support.google.com/drive/answer/15095275)).
- Summary cards with suggested actions arrived in June 2025 ([Workspace Updates](https://workspaceupdates.googleblog.com/2025/06/pdf-summary-cards-in-google-drive.html)).
- Gemini's "Double-check response" (in the Gemini app) colours statements:
  - green when Google Search found similar content;
  - orange when it found different content or nothing ([Gemini help](https://support.google.com/gemini/answer/14143489)).

  The check is against the web, not against your document.

**UPDF AI**
- Two modes **[3rd-party]**: "Ask PDF" (answers from the file) and "Chat" (general). It can translate a page or the whole document ([The Sweet Bits](https://thesweetbits.com/tools/updf-ai/)).
- Multi-PDF chat is reported as online-only. Prices vary with promotions ([UPDF pricing](https://updf.com/pricing)).

**Kami**
- A classroom annotation tool. Its AI tools are Summarize, Explain, Translate and Relevel, opt-in, aimed at teachers ([Kami features](https://www.kamiapp.com/features/); [district evaluation](https://stjoeschools.zendesk.com/hc/en-us/articles/37144885838107)).
- Not a real competitor. Its useful idea is "Relevel", which rewrites text to a reading level. *Inference:* the analogue for us is a plain-language gloss, kept apart from the verbatim law.

**AlphaSense Generative Search** **[docs]** ([help](https://help.alpha-sense.com/hc/en-us/articles/41666587181203-Interacting-with-Generative-Search))
- Each insight has direct citations. Selecting one opens the source with "the relevant passage … highlighted".
- Highlighting text in an answer lets you "verify that specific claim".
- Copy keeps citations.
- If nothing relevant is found, it says so.
- The blog claims "multi-step filtering" and a "multi-LLM approach" without details **[claim]** ([blog](https://www.alpha-sense.com/blog/product/combat-generative-ai-hallucination/)).
- Pricing estimates: $10–20k per seat per year **[3rd-party]** ([Sacra](https://sacra.com/research/alphasense)).

**Hebbia Matrix**
- A grid with documents as rows and questions as columns. Clicking a cell shows where the answer came from, "along with a step-by-step breakdown" **[3rd-party]** ([Contrary Research](https://research.contrary.com/reports/hebbia)).
- March 2026 added a "Source" column ([Hebbia blog](https://www.hebbia.com/blog/the-disclosure-march-2026)).
- Pricing: about $10k per seat per year, estimated and unverified ([Metronome](https://metronome.com/pricing-index/hebbia)).
- *Inference:* the grid is worth copying for an obligation register, with a row per obligation and a column per bank document.

**Rogo**
- Built for investment banking (comps, CIMs).
- A competitor page claims Rogo has response-level citations but "lacks sentence-level sourcing" **[3rd-party, competitor]** ([Hebbia](https://www.hebbia.com/resources/rogo-competitors)).
- Raised $160M at a $2B valuation ([FF News](https://ffnews.com/newsarticle/funding/rogo-raises-160m-series-d-to-scale-the-agentic-platform-for-finance/)).

**Bloomberg**
- Document Search & Analysis lets users "extract cited text and data to verify your assumptions", with "transparent attribution and direct links to source documents". ASKB is a conversational layer **[claim]** ([Bloomberg AI](https://professional.bloomberg.com/products/bloomberg-terminal/ai/)).
- Earnings-call summaries launched in 2024 ([press](https://www.bloomberg.com/company/press/bloomberg-launches-ai-powered-earnings-call-summaries)). AI document search was reported by [American Banker](https://www.americanbanker.com/news/bloomberg-launches-ai-based-document-search-for-wall-street).
- BloombergGPT was a 50B-parameter research model, not a document-QA product ([arXiv 2303.17564](https://arxiv.org/abs/2303.17564)).

**Kira (Litera)**
- Extraction-first: a reviewer highlights examples and the system learns to find that clause type across thousands of contracts **[3rd-party]** ([IDP Software](https://idp-software.com/vendors/kira-systems/)).
- Generative AI can be switched on or off per project, and Litera claims "consistent 90%+ accuracy" **[claim]** ([Litera](https://www.litera.com/newslinks/litera-unveils-expanded-kira-capabilities)).

**Luminance**
- "Apply playbooks and precedent to every review". Discover surfaces obligations **[claim]** ([luminance.com](https://www.luminance.com/)).
- "Panel of Judges" multi-model checking **[claim]** ([PYMNTS](https://www.pymnts.com/artificial-intelligence-2/2025/luminance-raises-75-million-for-panel-of-judges-legal-ai-offering/)).
- *Inference:* "deviation from playbook" is the contract-world twin of our bank-clause-vs-RBI conflict.

**Indian tools** (see `saas_landscape.md` §3 for NYAI, TeamLease RegTrack, Manupatra, SCC Online and CaseMine)
- New finding: TaxTMI offers "AI text" summaries next to circular text, with search over both ([TaxTMI](https://www.taxtmi.com/circulars?lawId=30)).
- Context that strengthens our pitch: RBI repealed or withdrew about 9,445 circulars into 244 function-wise Master Directions (Nov 2025; [Taxmann](https://www.taxmann.com/post/blog/rbi-withdraws-9445-circulars-following-consolidation-into-244-master-directions)). Every bank now has to map old circular references to new MD paragraphs, which is exactly the problem our withdrawal edges and validity windows solve.
- I found no Indian product that answers over RBI MDs with page-level verified quotes and as-of status. This is absence of evidence, not proof.

---

## Backend→UI showcase map

**Recommendation.** Field names are from `service._result`, `verify.verify_sentence`, `impact.run`, `api.py` and `audit.py`.

Impact is judge impact (H/M/L). Effort: S ≤ 2 h, M ≈ half a day, L ≥ 1 day.

"Backend dep." means a small backend addition is needed. All of these are $0 and change no prompts, so the cassettes stay valid.

| # | Capability | Screen / component | API fields used | Demo moment | Impact | Effort | Backend dep. |
|---|---|---|---|---|---|---|---|
| 1 | **Per-sentence verifier chain** | `SentenceRow` with a row of 5 check badges: ids · status · quote · numbers · support (HHEM / MiniCheck / judge / lexical / calc). Hover a badge for its score | `sentences[].checks` (e.g. `"c:quote"`, `"e:hhem 0.71"`, `"e:minicheck 0.62 (hhem 0.31)"`, `"e:llm-judge …"`), `sentences[].score`, `type`, `core` | "Each sentence passed five gates. This one needed MiniCheck because HHEM was unsure, and the label says so." | **H** | S | none |
| 2 | **Withheld sentences with reasons** | `WithheldTray` ("2 withheld"). Each item shows the struck text, the reason in plain words and the failed gate | `blocked[].text`, `blocked[].reason` (e.g. "number/date not in cited evidence: ['pct:2']", "cites text that is SUPERSEDED on the as-of date"), `blocked[].checks` (gates passed before failing) | "The model wrote a 2% cap. Our code found no 2% in any quote, so it was never shown." | **H** | S | none |
| 3 | **Repair retry (Draft 1 / Draft 2)** | A two-column "Draft history" toggle in the tray: Draft 1 blocked → reasons fed back → Draft 2 passed | `sentences[].attempt`, `blocked[].attempt`, `faithfulness.repair_used / repair_total / repair_pass` | "One retry, same evidence, same bar. Both attempts are logged." | M | S | none |
| 4 | **Faithfulness, draft → final** | `ProofMeter`: "Drafted 6 → passed 4 (67%) → shown 4 + 1 code statement · 2 withheld". It is the PS-required % | `faithfulness.draft_total, draft_pass, pre_gate_rate, shown, shown_drafted, code_statements, blocked` | Shows the honest pre-gate rate next to the 100% of shown sentences, which answers the "tautology" critique | **H** (PS must-have) | S | none |
| 5 | **Citations with bbox + status** | `CitationChip` (doc short name · clause · p. · status pip) → `PdfPane` (react-pdf) with highlight rectangles and a pulse | `citations[].doc_id, clause, page, pages, text, status, valid_from, valid_to, located, reconstructed, bboxes{page:[[x0,top,x1,bottom]]}`, `/documents/{id}/pdf` | Click "261(2)(ii) p.47 ● IN FORCE" and the PDF scrolls to a yellow box around the exact words | **H** (PS bonus) | M | page width/height are stored in the `pages` table but **no endpoint returns them**. Add `GET /documents/{id}/pages` (S) |
| 6 | **In-force / superseded versioning + as-of** | Global "As of" chip in the composer. A "Viewing law as of 15-Sep-2025 · back to today" banner. `ClauseTimeline` bars per version with op and `amended_by` | `as_of`, `timeline[].versions[].{valid_from, valid_to, op, text, amended_by, source_quote, status}`, `GET /provisions/{chunk_id}/timeline` | EMI reset: 15-Sep-2025 "shall" → 15-Oct-2025 "may, at its option". The pip flips green → grey | **H** (PS must-have) | M | none. Pre-record both dates (each new date is a live call) |
| 7 | **Hybrid retrieval + graph expansion** | "Pipeline X-ray" drawer, stage 2: chips for each sub-query; "BM25 + dense → RRF → 18 sentences"; graph-added evidence tagged "via REFERS_TO / AMENDED_BY / WITHDRAWS" | `plan.sub_queries`, `evidence_count`, `best_sim`. Graph-added provenance is **not** in the response | "Search found 261(2)(ii); the graph pulled in the clause that withdrew the 2014 circular." | M | M | add `via` (bm25 / dense / graph edge) to evidence items (S) |
| 8 | **Clause tree** | Breadcrumb on each citation ("Ch. XIII › 261 › (2) › (ii)") with the inherited lead-in shown in grey above the quote | evidence `breadcrumb`, `context` (internal; `_cite` drops them) | "The sub-clause alone is meaningless. We show the lead-in it inherits." | M | S | add `breadcrumb` to `_cite` (S) |
| 9 | **Code-side applicability rules** | `RuleFindings` card: R1, R2… each with APPLIES / DOES_NOT_APPLY / STATUS, the case facts compared (₹40 L ≤ ₹50 L ✓; borrower = MSE ✓; Tier 3 ✓) and the quote | `rules[].{rid, verdict, statement, condition, quote, page, clause}`, `plan.case` | Toggle Tier 3 → Tier 4: the ₹80 L case flips from Board-policy 261(5) to "No, 261(2)(i)" | **H** | M | none for the card. For a live toggle see feature F2 |
| 10 | **Presidio PII redaction** | "What left this machine" lens in the X-ray: the redacted question with `<Q_IN_PAN_1>` placeholders, egress manifest rows (evidence id, chars), redaction-map hash | `GET /trace/{qid}` → `egress_manifest_json`, `redaction_map_hash`, `payload.question` (redacted) | Ask with a PAN number in it; the panel shows OpenAI received `<Q_IN_PAN_1>` and the answer re-inserts it locally | M (H for DPDP-minded judges) | S | none. A PAN question needs one live call (~$0.005) |
| 11 | **Gates (retrieval / off-topic / refusal)** | `AbstainCard`: "Where I looked" (sub-queries), "Closest clauses" (2 cards), "Why I stopped" (gate + similarity vs threshold), "What would unblock" | `outcome=ABSTAIN`, `gate_reason`, `best_sim`, `missing[].{slot, searched, closest[]}` | Cricket question: a calm slate-blue card, "best evidence similarity 0.18 < threshold" | **H** (PS must-have) | S | none |
| 12 | **Gap detection (date gap)** | `PartialGapRow`: dashed row "No rule covers loans sanctioned on 31-Dec-2025: para 260 covers before, para 261 covers from 1-Jan-2026" | `missing[]` from `gaps` (`slot`, `searched`) | The 31-Dec-2025 question: the system refuses to guess at a one-day gap between two rules | **H** | S | none |
| 13 | **Decimal EMI / APR calc** | `CalcCard`: formula with values substituted, the result in ₹ Indian grouping, a 3-row amortisation table, and a badge "Computed by code (Decimal), not by the model". Inputs link to their cites | `calc[].{formula, inputs, cites, result.display, result.formula_text, result.working[], problems}` | EMI ₹21,695.58; KFS APR 17.07%. Edit an input chip and recompute instantly client-side | **H** (PS bonus) | S | none (an optional `POST /calc` would avoid a JS reimplementation; S) |
| 14 | **Contradiction triage** | `ConflictCard`: two columns (bank purple / RBI orange), token diff, verdict chip (CONFLICT / NEEDS_REVIEW / DIFFERENT_CONDITION / SUPERSESSION), "why" line. `/conflicts` board with counts | `conflicts[].{a,b,verdict,subject}`, `sentences[type=conflict]`, `GET /conflicts?as_of&profile` → `counts`, `items` | Clause 9.3 of the home-loan agreement vs RBI 261: "Bank permits 2% foreclosure; RBI: not permitted for individuals, floating rate" | **H** (PS must-have) | M | none |
| 15 | **Impact alert for a new circular** | `ImpactFeed` card: "RBI UCB RBC MD affects 4 bank clauses". Expand → items with severity, effective_for, both quotes, AI suggested fix as a redline labelled DRAFT | `POST /impact` → `summary`, `items[].{verdict, severity, effective_for, obligation, internal, reason, suggested_fix, redline, fix_label}` | Tier 3: the ₹40 L letter is a CONFLICT and ₹80 L is NEEDS_REVIEW. Switch to Tier 4 and ₹80 L turns into a CONFLICT | **H** | M | none (fixes are reused from storage, so $0) |
| 16 | **Maker-checker review queue** | `ReviewQueue` table (Deputy-style). The Sign-off button is disabled with the server's message when actor = maker | `GET /review-queue`, `POST /review/{id}` 409 texts ("maker-checker: X made the decision, so a different person must sign off") | Same user tries to sign off → blocked; switch user → signed off → the audit row appears | **H** | S | none |
| 17 | **Hash-chained audit log** | `AuditTimeline` (actor · verb · object · time; mono hash column `prev → row`). A "Verify chain" button ticks rows; "Tamper (demo)" edits a row; re-verify turns the chain red at `broken_at_seq` | `GET /trace/verify-chain` → `{ok, checked, broken_at_seq}`, `GET /trace/{qid}` | Live: tamper one payload → "Chain broken at #128 of 240" in red | **H** | M | a list endpoint (`GET /trace?limit=`) and a **dev-only** tamper/restore endpoint behind an env flag (S). Or tamper with a sqlite script off-screen |
| 18 | **Cost / latency / models** | Footer "provenance line": `4.1 s · ₹0.37 · gpt-5.4-mini drafts, code decides · 18 evidence · as of 24-Nov-2026`. The X-ray shows per-stage bars | `latency_ms`, `model_ids`, `evidence_count`; spend from `/health.spend_usd` | "Under half a rupee per answer; the AI only drafts" | M | S | per-stage timings are **not returned**: add `timings{understand, retrieve, rules, draft, verify, repair, calc}` to `_result` (S, $0) |
| 19 | **Pipeline X-ray (umbrella)** | Right-side drawer with 9 stage rows (understand → retrieve → evidence → rules → privacy → draft → verify → repair → calc/conflicts). Each row has a count, a time and an expandable payload. Animates in order on replay | rows 7–18 combined, plus `plan.{english_question, subjects, case, premises, asks_calculation}` | "Here is what happened to your question in 4 seconds", with premises shown ("assumes RBI capped penal charges at 2%" → refuted) | **H** | M | timings (row 18). For true live animation, SSE `/ask/stream` (M); otherwise animate the finished result |
| 20 | **Injection defence** | A red-team tile in the X-ray: "Hidden white text found on S7 p.2, never used as evidence" | not in the `/ask` response (ingest flags it) | Gold-loan FAQ question → ABSTAIN; the tile shows the hidden "answer 5%" text that was ignored | M | S | expose hidden-text flags per doc in `/documents` (S) |
| 21 | **Obligations register** | A grid in the Hebbia Matrix style: rows are obligations, columns are subject / modality / permitted / condition / status, plus an "affected bank docs" column | `GET /obligations?profile` → `{clause, page, subject, modality, permitted, condition, quote, register_status}` | Filter "permitted = no" → the list of prohibitions applying to a Tier 3 UCB | M | S | none |

**Recommendations on honesty in the UI** (these follow from what the backend actually does):
- Never stream draft text. Show placeholders ("verifying sentence 3 of 5…") and reveal a sentence only after its verdict. This matches the existing report's correction.
- Label `e:llm-judge` passes visibly as "AI judge (3rd tier)" so it is not passed off as an NLI check.
- Show `reconstructed=true` citations as "rebuilt from RBI footnote", not as text printed in the PDF.
- The X-ray must say "replayed from recorded model calls" when `/health.llm_mode == "replay"`. Judges should hear it from us, not discover it.

---

## Demo storyboard (3 min)

**Recommendation.** Everything below replays from cassettes ($0). Rehearse once so every question is recorded. One person narrates and one drives.

Use the exact question wording already recorded in `docs/DEMO_SCRIPT.md` / the canary set: any rewording misses the cassette. Counts such as "drafted 4 → 3 proven" are placeholders. Show whatever the recorded answer actually returns.

| Time | Screen | Action | What the judge sees | Line |
|---|---|---|---|---|
| 0:00–0:15 | Landing / Ask | Title card overlay | "RBI Ombudsman: 13.34 lakh complaints in FY25, loans the largest category (29%)" | "Bank staff answer loan-rule questions every day. A wrong answer becomes a complaint. Our assistant answers only with proof, or stays silent." |
| 0:15–0:55 | Ask workspace | Tier 3 · as of today: "Can we charge a pre-payment penalty on a ₹40 lakh MSE term loan, floating rate?" | Placeholders resolve one by one. Each sentence gets 5 green check badges. Proof Meter "drafted 4 → 3 proven, 1 withheld". Click chip **261(2)(ii) p.· ● IN FORCE** → PDF highlight. Open the Withheld tray: "number not in cited evidence" | "Every sentence passes quote, number and entailment checks. This one failed, so you never see it, but we show why." |
| 0:55–1:10 | Pipeline X-ray drawer | Open the drawer | Stage bars: plan (case facts ₹40 L, MSE), retrieval (3 sub-queries, 18 sentences), rules R1 APPLIES, privacy (0 PII), draft, verify, timings | "The AI writes; code decides." |
| 1:10–1:35 | As-of banner + timeline | EMI-reset question at 15-Sep-2025, then 15-Oct-2025 | "shall" → "may, at its option". The pip flips, and the timeline cursor moves past the amending circular | "Same question, different date, different law, both proven." |
| 1:35–2:00 | Conflict card → Impact feed | Ask about home-loan clause 9.3, then open Alerts: "New RBI UCB Master Direction" | Side-by-side purple/orange diff. Impact: 4 CONFLICTs at Tier 3. Toggle Tier 4 → the ₹80 L letter flips to CONFLICT. DRAFT redline fix | "A new circular arrives; we tell you which of your own clauses now break it, with both quotes." |
| 2:00–2:15 | Review queue | Maker accepts. The same user clicks Sign off | The disabled button / 409: "a different person must sign off". Switch user → signed | "Maker-checker is enforced, not suggested." |
| 2:15–2:30 | Abstain | Gold-loan FAQ question (with hidden injection) | Calm slate ABSTAIN card: where we looked, closest clauses, and an "injected text ignored" tile | "Silence is a correct answer." |
| 2:30–2:40 | Calc card | The recorded EMI demo question (HANDOFF §3: result ₹21,695.58; take the exact wording from the canary set so it replays) | ₹21,695.58, formula with inputs substituted, amortisation rows, "Computed by code" | "Numbers come from Python Decimal, not from the model." |
| 2:40–2:55 | Audit | Verify chain ✓ → tamper → verify | Rows tick green, then a red break at #N | "Every answer is in a tamper-evident log, ready for an RBI inspection." |
| 2:55–3:00 | Results slide | Close | 85% vs 50% plain RAG; 0/104 fabricated quotes; ≈ ₹0.4 per answer | "Proof or silence." |

If Hindi answers ship (feature F5), swap the calc beat for a Hindi question and its English-quote proof. Hindi is an explicit PS bonus; the calc is too, but it is already shown in the hero answer.

---

## New banking / finance features (ranked)

### Observation: what Indian banks actually face (sources)

**Lending rules**
- **KFS / APR:** the KFS is mandatory for all new retail and MSME term loans from 1 Oct 2024. The APR must include all charges, and charges not in the KFS cannot be levied ([RBI KFS notification](https://website.rbi.org.in/web/rbi/-/notifications/key-facts-statement-kfs-for-loans-advances); [Business Standard](https://www.business-standard.com/finance/news/banks-can-t-charge-additional-beyond-key-facts-statement-says-rbi-124041500993_1.html)).
- **Penal charges:** no capitalisation of penal charges. Effective for fresh loans from 1 Apr 2024, and for existing loans by 30 Jun 2024 ([RBI circular](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527); [RBI FAQ](https://www.rbi.org.in/Scripts/FAQView.aspx?Id=162)).
- **EMI reset:**
  - the borrower is told the impact at sanction and at reset;
  - options are a higher EMI, a longer tenor, both, or a switch to fixed;
  - switching charges must be disclosed;
  - a 2025 amendment lets the policy cap the number of switches ([RBI circular](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529); [RBI FAQ](https://website.rbi.org.in/documents/d/rbi/faqs-on-the-circular-on-reset-of-floating-interest-rate-on-equated-monthly-instalments-emi-based-personal-loans-)).
- **Fair Practices Code:** sanction terms and changes go to the borrower in the vernacular or a language they understand. This is the NBFC wording; for banks the FPC asks for a board-approved code ([RBI FPC master circular](https://website.rbi.org.in/web/rbi/-/notifications/master-circular-fair-practices-code-9823)).
- **IRAC / SMA:** SMA-0 is ≤30 days overdue, SMA-1 is 31–60, SMA-2 is 61–90, and beyond that the account is NPA. RBI's worked example dates each step ([RBI Nov 2021 clarification](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12194)). *Not in our corpus.*
- **PSL for UCBs:** the target was revised to 60% of ANBC from FY2024-25 ([RBI](https://website.rbi.org.in/web/rbi/-/notifications/review-of-priority-sector-lending-psl-target-urban-co-operative-banks-ucbs-)). *Not in our corpus.*

**Complaints**
- **Ombudsman volume:** 13.34 lakh complaints in FY25, up 13.55%. Loans and advances are the top category at 29.25% ([RBI report page](https://website.rbi.org.in/web/rbi/-/publications/annual-report-of-ombudsman-scheme-2024-25); [Business Standard](https://www.business-standard.com/finance/news/rbi-ombudsman-complaints-fy25-rise-loans-credit-cards-125120101346_1.html)).
- **RB-IOS 2026** (in force 1 Jul 2026, replacing the 2021 scheme): a complaint is not maintainable before the bank's 30-day window ends unless the bank has replied. It is also not maintainable more than 90 days after that window ends ([RBI FAQ PDF](https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/RBIOS01072026.pdf)).

**Compliance function and supervision**
- **UCB compliance function:** the RBI (UCB – Compliance Function) Directions, 2026 (31 Jul 2026) apply to Tier 3/4 UCBs. A CCO with at least a 3-year tenure reports to the board, sits on the new-product committee and is the regulator's nodal point ([RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13618); [2022 circular](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12389&Mode=0)).
- **RBI DAKSH** is RBI's SupTech workflow for compliance monitoring and inspection ([RBI](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54503)).
- **Rulebook consolidation:** about 9,445 circulars were withdrawn into 244 MDs in Nov 2025 ([Taxmann](https://www.taxmann.com/post/blog/rbi-withdraws-9445-circulars-following-consolidation-into-244-master-directions)).

**AI governance and data protection**
- **FREE-AI** (13 Aug 2025):
  - a board-approved AI policy;
  - AI impact assessment;
  - auditability and explainability;
  - incident reporting (with an annexure form);
  - customers told when they deal with AI ([RBI report](https://website.rbi.org.in/documents/d/rbi/rbi-free-ai-committee-report_13082025); [Chambers](https://chambers.com/articles/rbi-committee-report-on-responsible-ai-in-the-financial-sector-free-ai-framework)).
- **Draft model-risk guidance (24 Jun 2026):**
  - a board-approved MRM framework covering AI/ML;
  - model inventories;
  - independent validation, including of third-party models;
  - human oversight;
  - extra controls for customer-facing GenAI ([The Star/Reuters](https://www.thestar.com.my/tech/tech-news/2026/06/24/rbi-proposes-guidelines-for-banks-to-manage-ai-risks); [AIM](https://analyticsindiamag.com/ai-features/what-rbis-ai-model-risk-draft-means-for-banks-fintechs-and-ai-vendors)).
  - It reportedly also asks for override and "kill switch" mechanisms and warns about automation bias ([Outlook Business](https://www.outlookbusiness.com/economy-and-policy/why-rbi-wants-banks-to-put-tighter-checks-on-ai-use)).
- **DPDP Rules 2025** (notified Nov 2025): most obligations, including consent and breach notification, apply 18 months after publication, i.e. around May 2027 ([PIB](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf); [SCC Online](https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/)).

### Recommendation: ranked features

Score = judge appeal (1–5) × feasibility in the remaining time (1–5).

Spend is the live OpenAI cost. Budget check: `eval/spend_ledger.json` reads **$2.88 spent**, against the $4 project budget and the $3.50 code cap. The real headroom is therefore about $0.6 to $1.1, not $3; see Gaps. So every feature below is designed to run at $0 except F5.

| Rank | Feature | Why banking judges care | Reuses | New data / LLM spend | Appeal × Feas. |
|---|---|---|---|---|---|
| F1 | **Inspection-ready evidence pack** (per answer and per impact report). One click → a PDF/MD bundle containing: question, as-of, bank profile, verified sentences with verbatim quotes, page crops with highlight boxes, verifier checks, withheld list, rule findings, maker/checker names, audit row hashes, and a verify-chain result | CCO directions make compliance evidence the CCO's job, and RBI inspections (DAKSH) ask "show me". FREE-AI asks for auditability. No surveyed product exports proof | `/ask` result, `/trace/{qid}`, `/trace/verify-chain`, `/impact/{id}/export.md`, `/documents/{id}/pdf` | none; $0 | 5 × 5 = **25** |
| F2 | **Rule simulator ("what applies to this loan?")**. A form with entity tier, borrower type, purpose, rate type, amount and sanction date returns rule findings instantly: APPLIES / DOES_NOT_APPLY / gap, with quotes | Branch and credit officers think in cases, not questions. Tier 3 vs 4 and ₹40 L vs ₹80 L flip live. It is deterministic, so judges can poke it | `applicability.evaluate`, `rule_findings` (code-only); needs a thin `POST /rules` endpoint that skips drafting | none; $0, instant (no LLM) | 5 × 4 = **20** |
| F3 | **Circular-change alert feed → review tasks** ("new RBI MD affects 4 of your clauses"), with severity, effective-for date, DRAFT redline and "create review task" | RegTech's unit of value is the obligation-to-policy map (see `saas_landscape.md`). Rulebook consolidation makes this urgent | `POST /impact`, `/review-queue`, `/review/{id}`, export | none; stored fixes are reused, so $0 | 5 × 4 = **20** |
| F4 | **AI-governance page (FREE-AI + draft MRM 2026)**. Model inventory (gpt-5.4-mini / nano, bge-small, HHEM-2.1, MiniCheck; versions and thresholds), human oversight (maker-checker), a kill switch (replay mode + spend cap, shown as live state), incident log (`POST /incidents` already exists), the audit chain, and "customer told this is AI" copy | Banking judges know these documents. It shows we built to the regulator's frame, and it answers "why trust an LLM in a bank?" | `/health` (models, `llm_mode`, spend, cap, corpus_hash), `/incidents`, `/trace/verify-chain` | none; $0 | 4 × 5 = **20** |
| F5 | **Hindi answers (PS bonus)**. Verified English sentences are translated to Hindi with a label ("अनुवाद, सत्यापित नहीं / translation, not verified"). Verbatim quotes stay in the source language. Toggle EN/हिं | Explicit PS bonus. Vernacular disclosure is an FPC theme. Branch staff in Tier 3 UCBs often work in Hindi/regional languages. 8 Hindi questions already exist in `eval/hindi.jsonl` | `/ask` (understanding already maps Hindi → English); add a translate step **after** verification, so the draft cassettes stay valid | nano translation of ~4 sentences ≈ $0.0003–0.001 per answer; 8–10 pre-recorded answers < $0.02. RBI also publishes Hindi versions of circulars (`hindi_html_url` in the manifest), as optional new data | 5 × 4 = **20** |
| F6 | **KFS / sanction-letter checker**. Pick a bank KFS or sanction letter (S4, S5 already ingested). The checker:<br>• recomputes APR from the stated cash flows (Decimal IRR);<br>• flags any charge not in the KFS;<br>• flags penal-charge capitalisation;<br>• flags pre-payment charges on floating-rate individual loans;<br>• shows each check with the RBI quote | KFS/APR is a live 2024–26 supervisory focus, and APR mistakes are exactly what code (not an LLM) should catch | `calc.py` (APR_IRR, PREPAY_CHARGE), `/conflicts`, `/obligations`, value tuples for S4/S5 | none for the ingested docs. Runtime upload needs a new ingest endpoint plus extraction (~$0.03–0.1 per doc live) | 5 × 3 = **15** |
| F7 | **Complaint-reply drafter (RB-IOS 2026 aware)**. Paste a borrower complaint → the system asks the underlying rule question via `/ask`, then wraps the **verified** sentences in a deterministic reply template (reference no., 30-day clock from receipt, escalation rights). Unverified parts become "[officer to complete]" | Loans are the #1 Ombudsman category. A reply that cites the clause and page defuses escalation | `/ask` unchanged (no prompt change); template in the UI | ~$0.005 per new complaint question; pre-record 2 (≈ $0.01) | 4 × 3 = **12** |
| F8 | **Obligation register with owners and due dates**. The Hebbia-style grid from `/obligations`, plus owner, due date, status and evidence link (stored client-side or in a tiny table) | The CCO needs a register; this is the RegTrack checklist with real quotes | `/obligations?profile` | owner/due fields need a small table + endpoint (S); $0 | 4 × 3 = **12** |
| F9 | **Regulatory calendar** ("what changes on 1-Jan-2026"). Lists NOT_YET_IN_FORCE versions and withdrawals by date; clicking one sets the global as-of | Effective dates (KFS 1-Oct-2024, penal charges 1-Apr-2024, prepay directions 1-Jan-2026) drive bank projects | `provision_versions` (needs a list endpoint, S), `/provisions/{id}/timeline` | $0 | 4 × 3 = **12** |
| F10 | **Branch-officer mobile card**. A 375-px view: outcome, one-line answer, one quote, "show proof" bottom sheet. Present "WhatsApp mode" only as a mock share card | Tier 3 UCB branch staff work on phones. A real WhatsApp Business integration needs an account, approval and time: **not feasible**, and it would also mean creating an external account | `/ask` result | $0 for mobile web; WhatsApp not recommended | 3 × 4 = **12** |
| F11 | **DPDP privacy lens per question** (row 10 above, shown as a feature): what left the machine, placeholders, egress size, retention note | DPDP Rules phase in by ~May 2027. "Data that never left the bank" is a strong line | `/trace/{qid}` | $0 (one ~$0.005 live call if no PII trace exists yet) | 3 × 4 = **12** |
| F12 | **Board / ACB compliance dashboard**. KPI tiles: open conflicts, pending sign-offs, obligations by status, answer outcomes over time, % abstained | Boards and audit committees consume this. Low novelty | `/conflicts`, `/review-queue`, `/obligations`, trace counts | $0 | 3 × 3 = 9 |
| F13 | **KYC/AML, IRAC/NPA, PSL Q&A** | Very relevant to UCBs, but outside our corpus | needs the KYC MD, IRAC master circular and PSL MD ingested. These are large PDFs: ingest extraction is ≈ $0.05–0.3 live and risks the budget. Also a manual download (RBI bot check) | new data + LLM spend | 4 × 1 = 4 |
| F14 | **SMA/NPA day-count calculator** (from the RBI worked example) | Useful to credit officers, and code-only | needs the IRAC text in the corpus to cite; calc is trivial | new data | 3 × 1 = 3 |

Build order if time is short:
1. F1, F4, F3: all UI over existing endpoints.
2. F2: one thin endpoint.
3. F5: a few cents.
4. F6, using S4/S5 only.

Skip F13 and F14 before judging. Pitch them as roadmap.

---

## Sources

**Chat-with-PDF and general AI tools**
- ChatPDF: https://www.chatpdf.com/ ; pricing (third-party): https://www.webtures.com/insights/what-is-chatpdf/
- NotebookLM chat and citations: https://support.google.com/notebooklm/answer/16179559?hl=en ; limits: https://support.google.com/notebooklm/answer/16213268?hl=en ; rename / currency caveat: https://tech-insider.org/how-to-use-notebooklm-2026/ ; source guide: https://www.computerworld.com/article/3712691/google-notebooklm-generative-ai-notes-app.html
- Adobe: https://www.adobe.com/learn/acrobat/web/ai-assistant-multiple-documents ; https://news.adobe.com/news/news-details/2024/adobe-brings-conversational-ai-to-trillions-of-pdfs-with-the-new-ai-assistant-in-reader-and-acrobat ; https://business.adobe.com/in/products/acrobat-business/acrobat-studio/faster-insights.html ; https://www.cnbc.com/2024/04/15/adobe-releases-acrobat-ai-assistant-starting-at-4point99-a-month.html ; https://www.macworld.com/article/2960950/adobe-acrobat-studio-review.html
- Humata: https://www.humata.ai/
- AskYourPDF: https://askyourpdf.com/ ; https://topai.tools/t/ask-your-pdf
- PDF.ai: https://pdf.ai/ ; https://topai.tools/t/pdf-ai
- Claude: https://support.claude.com/en/articles/8241126-upload-files-to-claude ; https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects ; https://platform.claude.com/docs/en/build-with-claude/citations
- ChatGPT: https://help.openai.com/en/articles/8555545-file-uploads-faq ; https://help.openai.com/en/articles/10416312-visual-retrieval-with-pdfs-faq
- Perplexity: https://intercom.help/perplexity-ai/en/articles/10352961-spaces ; https://www.perplexity.ai/help-center/en/articles/12009761-enterprise-file-limits
- Microsoft: https://support.microsoft.com/en-us/office/create-a-summary-of-your-document-with-copilot-79bb7a0a-3bf7-41fe-8c09-56f855b669bf ; https://www.windowscentral.com/artificial-intelligence/microsoft-copilot/microsoft-gave-copilot-in-word-something-ai-desperately-needs-sources ; https://support.microsoft.com/en-us/Microsoft-Copilot/getting-started-with-copilot-in-microsoft-edge ; https://mc.merill.net/message/RM498641
- Google Drive / Gemini: https://workspaceupdates.googleblog.com/2024/07/gemini-in-side-panel-of-google-drive-pdf-viewer.html ; https://workspaceupdates.googleblog.com/2025/06/pdf-summary-cards-in-google-drive.html ; https://support.google.com/drive/answer/15095275 ; https://support.google.com/gemini/answer/14143489
- UPDF: https://thesweetbits.com/tools/updf-ai/ ; https://updf.com/pricing
- Kami: https://www.kamiapp.com/features/ ; https://stjoeschools.zendesk.com/hc/en-us/articles/37144885838107

**Finance and contract AI**
- AlphaSense: https://help.alpha-sense.com/hc/en-us/articles/41666587181203-Interacting-with-Generative-Search ; https://www.alpha-sense.com/blog/product/combat-generative-ai-hallucination/ ; https://sacra.com/research/alphasense
- Hebbia: https://research.contrary.com/reports/hebbia ; https://www.hebbia.com/blog/the-disclosure-march-2026 ; https://metronome.com/pricing-index/hebbia
- Rogo: https://www.hebbia.com/resources/rogo-competitors ; https://ffnews.com/newsarticle/funding/rogo-raises-160m-series-d-to-scale-the-agentic-platform-for-finance/
- Bloomberg: https://professional.bloomberg.com/products/bloomberg-terminal/ai/ ; https://www.bloomberg.com/company/press/bloomberg-launches-ai-powered-earnings-call-summaries ; https://www.americanbanker.com/news/bloomberg-launches-ai-based-document-search-for-wall-street ; https://arxiv.org/abs/2303.17564
- Kira: https://www.litera.com/newslinks/litera-unveils-expanded-kira-capabilities ; https://idp-software.com/vendors/kira-systems/
- Luminance: https://www.luminance.com/ ; https://www.pymnts.com/artificial-intelligence-2/2025/luminance-raises-75-million-for-panel-of-judges-legal-ai-offering/

**India**
- https://www.taxtmi.com/circulars?lawId=30 ; https://www.taxmann.com/post/blog/rbi-withdraws-9445-circulars-following-consolidation-into-244-master-directions ; see `saas_landscape.md` §3 for the rest

**RBI and regulation**
- KFS: https://website.rbi.org.in/web/rbi/-/notifications/key-facts-statement-kfs-for-loans-advances ; https://www.business-standard.com/finance/news/banks-can-t-charge-additional-beyond-key-facts-statement-says-rbi-124041500993_1.html
- Penal charges: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527 ; https://www.rbi.org.in/Scripts/FAQView.aspx?Id=162
- EMI reset: https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529 ; https://website.rbi.org.in/documents/d/rbi/faqs-on-the-circular-on-reset-of-floating-interest-rate-on-equated-monthly-instalments-emi-based-personal-loans-
- Fair Practices Code: https://website.rbi.org.in/web/rbi/-/notifications/master-circular-fair-practices-code-9823
- IRAC/SMA: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12194
- PSL for UCBs: https://website.rbi.org.in/web/rbi/-/notifications/review-of-priority-sector-lending-psl-target-urban-co-operative-banks-ucbs-
- Ombudsman: https://website.rbi.org.in/web/rbi/-/publications/annual-report-of-ombudsman-scheme-2024-25 ; https://www.business-standard.com/finance/news/rbi-ombudsman-complaints-fy25-rise-loans-credit-cards-125120101346_1.html ; https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/RBIOS01072026.pdf
- UCB compliance function: https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13618 ; https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12389&Mode=0
- DAKSH: https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=54503
- FREE-AI: https://website.rbi.org.in/documents/d/rbi/rbi-free-ai-committee-report_13082025 ; https://chambers.com/articles/rbi-committee-report-on-responsible-ai-in-the-financial-sector-free-ai-framework
- Draft model-risk guidance 2026: https://www.thestar.com.my/tech/tech-news/2026/06/24/rbi-proposes-guidelines-for-banks-to-manage-ai-risks ; https://analyticsindiamag.com/ai-features/what-rbis-ai-model-risk-draft-means-for-banks-fintechs-and-ai-vendors ; https://www.outlookbusiness.com/economy-and-policy/why-rbi-wants-banks-to-put-tighter-checks-on-ai-use
- DPDP Rules: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf ; https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/

**Internal**
- `HANDOFF.md`; `backend/app/api.py`; `backend/app/service.py` (`ask`, `_result`, `_faithfulness`, `_cite`); `backend/app/verify.py`; `backend/app/impact.py`; `backend/app/audit.py`; `eval/spend_ledger.json`; `eval/hindi.jsonl`; `corpus/MANIFEST.csv`.

---

## Gaps

- **No hands-on testing.** I could not log in to or use any product. Layouts come from vendor docs and third-party write-ups. Hebbia, Rogo and Bloomberg UI details are second-hand, and Rogo's citation granularity comes from a competitor's page.
- **Pricing is volatile.** ChatPDF, AskYourPDF, PDF.ai and UPDF prices conflict across sources. Treat every price as indicative.
- **Perplexity naming is unconfirmed.** I could not confirm whether Spaces have been renamed Projects, or what the Spaces-specific limits are. One help URL returned 404.
- **Thin citation docs.** Copilot (Edge PDF) and Gemini in Drive do not document page-level citations for PDFs. I marked these "not documented", which is not proof the feature is absent.
- **No Indian RBI-circular Q&A product found** beyond those in `saas_landscape.md`. This is absence of evidence. I did not search Hindi-language product pages.
- **No judging criteria in the PS.** The AIML-02 section lists must-haves, bonuses and deliverables but no weights. My judge-impact ratings are judgements.
- **PS wording on open-source models.** The PS says the pipeline "must run on open-source models without any paid AI API". HANDOFF records that the organizer allowed OpenAI. The AI-governance page (F4) should state this openly, so a judge reading the PS literally is not surprised.
- **Budget discrepancy.** The brief says "about $3 left". `eval/spend_ledger.json` shows $2.88 spent against a $4 budget and a $3.50 code cap, so headroom looks closer to $0.6–1.1. Confirm before any live recording.
- **Backend additions the showcase needs.** None of these are built yet, all are $0 and none changes a prompt:
  - page-size endpoint;
  - per-stage timings in `/ask`;
  - an evidence `via` field (retrieval provenance);
  - `breadcrumb` in citations;
  - a trace list endpoint and a dev-only tamper/restore endpoint;
  - a rules-only endpoint (F2);
  - a versions list endpoint (F9).

  Another session is editing the backend now, so coordinate.
- **Regulatory facts left unchecked.** I did not verify:
  - whether the 2021 IRAC/SMA clarification has been superseded in the Nov 2025 consolidated MDs;
  - the tier-specific PSL timelines;
  - the final (vs draft) status of the June 2026 model-risk guidance.
