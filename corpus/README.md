# Demo corpus

```
corpus/
├─ sources.csv            hand-maintained metadata: download name → readable file name, title, circular no., role, URLs
├─ MANIFEST.csv           generated: + pages, sha256, circular no. and date found in the PDF text
├─ tools/build_manifest.py
├─ real/rbi/              real RBI PDFs (git-ignored) + SHA256SUMS (committed)
└─ synthetic/             our own documents: fictional co-op bank loan agreement, edited copies, injected-prompt PDF
```

## Getting the RBI PDFs

`rbidocs.rbi.org.in` serves a bot check to scripts, so **download each PDF by hand in a browser** using the
`pdf_url` column in `sources.csv`. Do not script around the check. The `html_url` pages carry the same text
(with paragraph numbers, no page numbers) and are the source for the Hindi bonus (`hindi_html_url`), since
Hindi text in these PDFs does not extract cleanly.

Then:

```bash
pip install pypdf
python corpus/tools/build_manifest.py ~/Downloads
cd corpus/real/rbi && shasum -a 256 -c SHA256SUMS
```

To add a document, append a row to `sources.csv` and re-run the script.

## Known extraction quirks (put these in verifier unit tests)

- Spaces appear around `/` and `-`: the KFS circular extracts as `RBI /2024-25/18` and `Co -operative`.
  Normalise these before quote matching.
- The Master Direction's number is `RBI/DOR/2025-26/170`, not `RBI/2025-26/170`.
- Hindi header text in the bilingual PDFs extracts as garbage; use the Hindi HTML pages instead.
- The press release says roughly 9000 circulars and 238 Master Directions; the 9,445 figure is not in
  either downloaded PDF. Check it against the withdrawal annex before putting it on a slide.

## Still to download

| Document | Why it matters | Where |
|---|---|---|
| KFS annexes A, B, C | Annex B has the APR illustration (EMI ₹970, APR 17.07%) for the calculator demo | Same pattern as Annex A: `https://rbidocs.rbi.org.in/rdocs/content/pdfs/CIRCULARKFS1504242_A.pdf` (swap `_A` for `_B`, `_C`) |
| Annex list of withdrawn circulars | Source for WITHDRAWS edges and the 9,445 count | Linked from the withdrawal circular's page (`html_url` in `sources.csv`) |
| Co-operative bank pre-payment directions (RBI id 13013) | Tier 3 vs Tier 4 demo | Not yet located; find it on rbi.org.in |
| *(optional)* 7 May 2014 foreclosure-charges circular | Shows the old rule in the amendment chain | `https://www.rbi.org.in/commonman/Upload/English/Notification/PDFs/DBC070514DF.pdf` (unverified) |

RBI content is © Reserve Bank of India; cite RBI as the source wherever these documents are shown.
