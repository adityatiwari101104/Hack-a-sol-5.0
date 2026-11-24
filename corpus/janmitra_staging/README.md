# Janmitra staging set: two public schemes, English, parked (not yet ingested)

These were copied on 24 Nov 2026 from `~/Janmitra/AI Chat Bot Data 2/`. They are kept here for later use as a
second-domain ("public policy") test set. They are **not ingested**: no LLM spend, and the demo database is
untouched. The PDFs are gitignored. Page counts and the first 16 hex characters of each sha256 are in
`SHA256_PAGES.tsv`. Background notes: `research_notes/janmitra_assessment.md`.

Only public Government of India material was copied: MoRD guidelines, an Act and a Gazette notification. Not copied:
internal department letters, files carrying officer names, legacy-font Hindi scans, and the Hindi FAQ.

## 1. PMGSY (Pradhan Mantri Gram Sadak Yojana): versions and contradictions (5 files, 221 pages)
| File | Pages | Why |
|---|---|---|
| PMGSY-I Guidelines by MoRD | 48 | Original (2000 era, Census 2001 thresholds) |
| PMGSY-II Guidelines by MoRD | 52 | Second phase |
| PMGSY-III Guidelines by MoRD | 44 | Third phase (2019) |
| PMGSY-IV Guidelines by MoRD | 40 | Current phase (Census 2011 thresholds); OCR-ish text noise ("50%o"), a good parser test |
| Revised approved PMGSY-IV Guidelines as on 03.06.2026 | 37 | Latest revision, so as-of answers apply |

Candidate tests (verify pages before using as gold):
- Eligible habitation population (plains vs hilly/ST/SC) changes between phases. This is the amendment chain:
  "which applies today?"
- The revised IV text (03.06.2026) vs the original IV guideline: what changed.
- Tables: cost norms and fund-sharing ratios.

## 2. VB-G RAM G (Viksit Bharat Rozgar aur Ajeevika Guarantee Mission, Gramin; replaces MGNREGA): 3 files, 50 pages
| File | Pages | Why |
|---|---|---|
| VB G RAM G Act 21 Dec 2025 | 31 | Core Act: "not less than 125 days" guarantee, up to 60 peak-season days, unemployment allowance |
| VB - G RAM G 318 Works | 17 | One long table: 4 categories, 29 sub-categories, 318 permitted works |
| Gazette Notification 23 Sep 2025 (bilingual Gazette of India) | 2 | Earlier notification, an amendment/date-chain test |

Candidate tests:
- "How many days of guaranteed work?" → "not less than 125" (Act).
- "Is a check dam a permitted work?" → table lookup.
- "Unemployment allowance if work isn't given in 15 days?" → quote the section; don't decide eligibility.
- "Unit cost of a work in 2030?" → abstain.

**Known contradictions that live in documents we did NOT copy (Hindi):** the FAQ says 125 days is a *maximum*, and
the state peak-season notice covers fewer than 60 days. Add those only if the team decides to include Hindi documents.
