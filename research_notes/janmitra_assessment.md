# Janmitra assessment (read-only, 2026-11-24)

Repo: ~/Janmitra (git: chiman45/Janmitra, author Chiman, IIIT-NR). Method: README, pyproject, claude files/*, docs/*, pdftotext/pdfinfo on documents. No .env read.

## 1. What it is
- Purpose: "P&RD Citizen Assistant": RAG Q&A for Chhattisgarh Panchayat & Rural Development schemes. Users: villagers, panchayat staff (Flutter app `mobile/`, FastAPI `src/janmitra_api`, voice via Sarvam STT). Real department engagement (department-questions, SBM/NRLM/PMAY/PMGSY offices sent the data).
- Stack: Python 3.12, uv, PyMuPDF/pymupdf4llm + Docling, Postgres+pgvector (+FTS), Redis, FastAPI, OpenAI embeddings, Gemini for answer writing/checking and OCR of scans, bge-reranker-v2-m3 (optional), Flutter.
- NOT English-only: corpus is formal Hindi + English, many scans and legacy-font (Kruti/APS-DV) Hindi. PARSING.md: ~70% of pages need non-standard parsing (4 lanes: clean / legacy-font mapping / scan OCR-VLM / XLSX).
- Retrieval: hybrid (FTS + vector) with RRF fusion, then rerank; tenant_id/status as SQL pre-filters; only `active` docs retrievable (`superseded/repealed/expired` excluded, `orphaned` only with era label).
- Chunking: clause-level with stable clause_path + parent_chunk_id ("retrieve small, read big, cite small").
- Citation: every claim cites chunk_ids, verified to be in the retrieved set; unverified => drop claim or abstain. Mobile app opens the cited PDF.
- Abstention: score floor, no context => no LLM call, returns `abstained` + routing (helpline); LLM `in_scope` report; "quote criteria, never apply them" (no "you are eligible").
- Conflicts: authority order Act > Scheme/Gazette > Circular > FAQ; answer from higher and flag lower disagreement (design rule R13). Lifecycle statuses incl. orphaned/expired.
- Evals: docs/critic-eval (persona critic + judge, per-scheme question JSONs: vbg, pmay, pmgsy, sbm, nrlm, panchayat, res, sird, socialaudit, smalltalk), artifacts/eval_retrieval*.json. Notably Janmitra already has much of our design; its remaining pain is parsing quality and Hindi, not architecture.

## 2. Documents
Totals: `AI Chat Bot Data 2/` 69 files, 412 MB; `SBM/` 8 files, 12 MB (plus Data/ folders absent). Mostly PDFs; ~6 .docx are only URL lists / FAQ; 4 SBM .doc files. Many byte-duplicates (audit: docs/data-gap-audit-2026-10-14.md).

Notable files (path under ~/Janmitra/"AI Chat Bot Data 2" unless noted; pages by pdfinfo):
| File | Type / lang | Pages | Topic |
|---|---|---|---|
| VB-G-RAM-G/VB G RAM G Act 21 Dec 2025.pdf | clean digital, English | 31 | Viksit Bharat G RAM G Act 2025 (replaces MGNREGA): 125-day guarantee, 60 peak-season days, unemployment allowance |
| VB-G-RAM-G/State Scheme VB G RAM G Date 25.06.2026.pdf | Hindi/English | 40 | CG State scheme (dup copy "State rule ...") |
| VB-G-RAM-G/Agriculture Peak Session 2026-27 Notification ... RULE-801_88_2026.pdf | Hindi, broken glyphs | 5 | Annual peak-season notice (expiring; ~45 of 60 days) |
| VB-G-RAM-G/VB - G RAM G 318 Works-1.pdf | English, big table | 17 | 4 categories, 29 sub-categories, 318 permitted works |
| VB-G-RAM-G/FAQ .docx | Hindi | - | FAQ says 125 days max, contradicting Act "not less than" |
| PMGSY-IV/PMGSY-IV Guidelines by MoRD.pdf | English, scan-ish OCR text ("50%o") | 40 | Eligibility by population (500+/250+ ST/SC), tables |
| PMGSY-IV/PMGSY-I, -II, -III Guidelines | English | 48/52/44 | Earlier versions (2000/2013/2019), thresholds differ => versioning |
| PMGSY-IV/Revised approved ... as on 03.06.2026.pdf | English | 37 | Annexure of active letter |
| PMGSY-IV/PM-JANMAN Guideline and Criteria.pdf | English slides | 11 | Roads/housing for PVTGs, Rs 24,104 cr outlay |
| PMGSY-IV/MMGSY GUIDLINE.pdf, नियमावली.pdf | Hindi legacy font / scan | 5 / 8 | State road scheme letter |
| PMAY/PMAYG-Guidelines-English_Book_Final.pdf | English | 158 | PMAY-G framework 2022 (tables, annexures) |
| PMAY/SOP Awaas Plus 2024 (+Mobile Survey) | English, scan-ish | 12 / 7 | Survey SOPs |
| SBM/swm rule 2026.pdf (= Gazzate Notified SWM Rules-2026) | English gazette, clean | 144 | Solid Waste Management Rules 2026 (bulk generator: 20,000 sq m / 40,000 L/day / 100 kg/day) |
| SBM/Faq on Solid waste & plastic waste mgmt.pdf | SCANNED, ~20 chars of text | 20 | Villager Q&A booklet |
| SBM/Best Practices for GOI By Chhattisgarh.pdf | English narrative | 5 | WASH digital reforms; Swachhta Prahari income Rs 20-25k vs JOSH.doc Rs 25-30k |
| SBM/ AI_Chatbot letter from SBM-G (07.08.2026) | scan-ish, mixed | 554 | Embeds Phase-II guidelines + SWM Rules twice |
| SBM(G) Phase-2 Guidelines - Hindi.pdf | Hindi | 132 | |
| NRLM/1-16 (Bank Mitra, BC Sakhi, Pashu Sakhi, goat rearing, viability, Finance Admin Manual...) | English/Hindi, many scans | 1-49 each | NRLM livelihood policies; Bank Mitra 2018-19 honorarium revision |
| Panchayat Directorate/.../act scanned/*.pdf (6 files) | SCANNED Hindi | 20-58 each | CG Panchayat Raj Act sections 1-132, ~25 MB each |
| Panchayat .../Pesa Rule CG, Niyam 2024, 15th Finance untied fund guideline, Samgra guideline 2025 | mixed | 7-29 | Rules, funds |
| Social Audit/Social audit..pdf | scan | 31 | |

Public vs private: bulk is public government material (Acts, gazettes, MoRD/MoPR guidelines, SWM Rules published in Gazette of India). BUT parts are internal departmental correspondence supplied by officials for the chatbot (e.g. "AI_Chatbot _letter from SBM-G", "gouravpath.pdf", "New Doc 08-10-2026", file named with an officer's name "Renu Pille mam", RES, SIRD, "AI Chatbot Final"). Provenance unclear; the corpus was received under a department engagement and is gitignored (`AI Chat Bot Data 2` is ignored). Treat anything not an Act/Gazette/MoRD guideline as NOT redistributable.

Versions / contradictions present (documented in Janmitra's own audit):
- FAQ: 125 days maximum vs Act/State Scheme "not less than 125".
- MGNREGA-era 65/40/30 water-works rule is orphaned (parent Act repealed) with savings clause.
- Peak-season notification: Act allows 60 days, state notified ~45 (Kharif omitted), annual validity.
- PMGSY I/II/III/IV: habitation thresholds change by generation and census (2001 vs 2011); IV revised guideline "as on 03.06.2026".
- Swachhta Prahari income Rs 20-25k (Best Practices) vs Rs 25-30k (JOSH.doc).
- Bank Mitra honorarium Rs 1,500 probation then Rs 2,500 from 1 July 2018; later revision absent (a built-in unanswerable).
- Duplicates: SWM Rules 2026 appears twice (identical bytes) plus embedded in the 554-page letter.

## 3. Value for our hackathon
(a) Phase G second-domain "public policy" demo set: YES, strong. Real, Indian, government, English-first: VB-G RAM G Act, SWM Rules 2026, PMGSY guidelines. Contradiction/amendment/lifecycle material is already catalogued by Janmitra's team.
(b) Upload/OCR test: YES, strong and free: scanned FAQ booklet (20 p, no text layer), scanned Panchayat Act sections (53-58 p, Hindi), PMGSY-IV guidelines (OCR-ish noise "50%o"), 318-works table (17-page table), gazette with broken glyphs (peak season notice). Caveat: Hindi scans test OCR language support beyond English.
(c) Extra eval questions: YES, but our eval harness gold sets must be authored by us (Janmitra's critic-eval questions JSONs exist in docs/critic-eval/questions/ and could be inspired from, not copied blindly).

Recommended 3-6 documents (smallest/cleanest first):
1. VB G RAM G Act 21 Dec 2025.pdf (31 p, clean) - core Act.
2. VB - G RAM G 318 Works-1.pdf (17 p) - table-heavy.
3. Agriculture Peak Session 2026-27 notification (5 p, Hindi, glyph-broken) - expiry/as-of; also the "FAQ .docx" for contradiction (use only if shareable).
4. PMGSY-I (2000-era) vs PMGSY-IV Guidelines (40 p) - version/threshold changes, tables.
5. swm rule 2026.pdf (144 p) - long gazette; multi-page definitions (bulk generator).
6. SBM Faq (scanned, 20 p) - OCR-only test.

Example test questions:
1. "How many days of guaranteed work does the Act promise a rural household?" -> 125; Act is "not less than"; flag FAQ ("maximum") disagreement. (contradiction)
2. "For how many days in a year can the state suspend works for peak agricultural seasons, and how many did Chhattisgarh notify for 2026-27?" -> Act: aggregating sixty days; state notice covers fewer (verify exact figure in the notice). (amendment/expiry, as-of)
3. "Which building size, daily water use or daily waste makes an entity a bulk waste generator under the 2026 SWM Rules?" -> 20,000 sq m / 40,000 L/day / 100 kg/day, any one criterion (multi-page definition).
4. "What is the minimum population of a plains habitation eligible for PMGSY-IV, and how did this differ in PMGSY-I?" -> 500+ (Census 2011) vs 500/250 in 2000 era under Census 2001 (versioning). Verify page numbers before gold.
5. "Is a farm pond/check dam among permitted G RAM G works?" -> answer from the 318 works table, category Water Security, sub-category 1 (table lookup).
6. "What is the current monthly honorarium of a Bank Mitra?" -> latest document sent is 2018-19 (Rs 1,500 -> Rs 2,500); abstain / flag "later revision not provided". (unanswerable/stale)
7. "How much does a Swachhta Prahari earn?" -> conflict between two sources (Rs 20-25k vs Rs 25-30k). Needs JOSH.doc too.
8. "Will my household get unemployment allowance if work is not given within 15 days?" -> quote Section on allowance (15 days), do NOT apply to the person (R10-style eligibility).
9. Unanswerable: "What is the PMAY-G unit assistance for 2030?" -> abstain.

Licence/privacy flags:
- Acts, Gazette, MoRD/MoPR guidelines are public (Govt of India, generally reusable with attribution; Government Open Data License is common but check each). State-department letters and files received for the chatbot may be internal; do not commit or publish them in our repo or demo. Gitignored in Janmitra; keep out of our git (large, 412 MB). Janmitra's .env key must not be used for our project (separate $4 budget).
- Some PDFs contain officer names, phone/email, signatures (scanned letters). PII risk for our Presidio/redaction demo - and for the hackathon public recording.
- Get Chiman's / department's OK before using non-public material in a competition demo. Safer: only the Act, SWM Rules (Gazette), PMGSY guidelines, PM-JANMAN slides.

## 4. What Proof-or-Silence would add to Janmitra
- Verifier chain (NLI/MiniCheck + number/date calculation checks): Janmitra verifies that cited chunk_ids were retrieved, but not that the claim text is entailed by the clause; our entailment + code-side numeric check catches wrong figures (e.g. 125 vs 60 days, Rs amounts).
- Bbox citations: Janmitra cites clause/PDF only (viewer opens document); our page+bbox highlight lets villagers/auditors see the exact line on scanned and table pages (the 318-works table, Hindi scans).
- Contradiction triage with explicit surfacing: Janmitra encodes a fixed authority rule (R13); our pairwise detector with scoped evidence can discover unlisted conflicts (FAQ vs Act, JOSH vs Best Practices) automatically instead of hand-curation.
- As-of / version queries: Janmitra only serves "active" docs; as-of lets users ask "what did the rule say on 2025-06-01" and handles expired annual notifications and orphaned MGNREGA rules without hiding them.
- Abstention calibration + eval harness: our measured abstain/precision on gold with cassettes (cheap, repeatable) would give Janmitra the regression gate it lacks; its score-floor abstention is not evaluated against unanswerable gold.
