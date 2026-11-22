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
| *(optional)* List of the 9,445 withdrawn circulars | Source for WITHDRAWS edges and the 9,445 count | **There is no PDF.** The circular's "Annex" link goes to the [Circulars Withdrawn web page](https://www.rbi.org.in/Scripts/NotificationUserWithdrawnCircular.aspx), a tabbed HTML table. Click the **"Department of Regulation"** tab and save the page (Cmd+S, "Web Page, HTML only") into `corpus/real/rbi/`. Use it as data for edges, not as a citable PDF. Printing it captures only the default RRA 2.0 tab. |

The UCB Directions now come from RBI's official PDF (128 pages), replacing the earlier browser print.

## Verified content worth knowing

- **UCB RBC Directions (RBI/DOR/2025-26/292), paras 260 (p.80) and 261 (p.81)**:
  - The 31-Dec-2025 gap exists for co-op banks too: para 260 covers loans "sanctioned before December 31, 2025", and para 261 covers loans "sanctioned or renewed on or after January 1, 2026".
  - The Tier 3 vs Tier 4 rule for business loans to individuals and MSEs: a Tier 4 UCB may not levy pre-payment charges; a Tier 3 UCB may not levy them on loans up to ₹50 lakh.
- **KFS Annex B** contains the APR illustration (₹20,000, EMI ₹970, interest ₹3,274, net disbursed ₹19,600, APR 17.07%). **Annex C** has the 24-row repayment schedule.
- **KFS Annexes A–C and the 2014 circular** were saved through the browser's PDF viewer (producer "PDFium"). The text is intact. A teammate who downloads the original files gets different checksums, so either share these copies or re-run the script.

RBI content is © Reserve Bank of India; cite RBI as the source wherever these documents are shown.
