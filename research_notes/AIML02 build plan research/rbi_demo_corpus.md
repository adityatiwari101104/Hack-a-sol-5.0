# Real Indian Regulatory Demo Corpus for AIML-02 (amendment chains, supersession, as-of-date, tables, contradictions, Hindi)

Research date: 23 Nov 2026. Primary pages were read directly on www.rbi.org.in (HTML notification pages, which hold the full circular text). Anything taken only from secondary sources is marked **[secondary]**. Anything not confirmed is marked **[UNVERIFIED]**.

**Access notes for the team (read before building the ingestion step):**
- `website.rbi.org.in/...` links (RBI's newer site, which often shows up in Google results) now return **301 to the www.rbi.org.in homepage**. Do not use them. Tested 23 Nov 2026, for example on `website.rbi.org.in/documents/87730/39710850/Final+Circular+-+Penal+Charges...pdf`.
- `rbidocs.rbi.org.in/...PDF` links answer scripted clients (curl, WebFetch) with an **HTML bot-challenge page** (HTTP 200, Content-Type text/html, ~48 KB, image code challenge) instead of the PDF. Download the PDFs **by hand in a normal browser** and commit them to the repo. Do not script around the challenge.
- `https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=<n>&Mode=0` and `.../BS_ViewMasDirections.aspx?id=<n>` returned the **full text as HTML, tables included**, to a plain HTTP GET. This is the easiest ingestion path, and it also gives you the "Updated as on" metadata and the footnotes recording each substitution.

---

## Q1. Prepayment / foreclosure-charge chain (2012 → 2014 → 2019 → Directions 2025 → Nov 2025 Master Direction)

### Takeaway
This is the best as-of-date demo. Eight circulars from 2012–2019 are repealed by the **RBI (Pre-payment Charges on Loans) Directions, 2025** (RBI/2025-26/64, 2 Jul 2025), which apply to loans **sanctioned or renewed on or after 1 Jan 2026**. On 28 Nov 2025 those Directions were themselves withdrawn and folded verbatim into the **Commercial Banks – Responsible Business Conduct (RBC) Directions, 2025**, Chapter VIII, Section E, paras 352–353. The text there has a real **31 Dec 2025 gap** that makes a good "zero-guessing" demo.

### Cited Findings
- **Pre-payment Charges Directions, 2025:** RBI/2025-26/64, DoR.MCS.REC.38/01.01.001/2025-26, dated **July 2, 2025**. PDF (905 KB): https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT642A32A71F06D649B78A9622FB82B8C438.PDF — [RBI notification page](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- Para 3(ii), verbatim: "These Directions shall be applicable to all loans and advances sanctioned or renewed on or after January 1, 2026." — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- **Para 5(i):** for loans "granted for purposes other than business to individuals, with or without co-obligant(s), an RE shall not levy pre-payment charges". — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- **Para 5(ii)(a):** no pre-payment charges on floating-rate business loans to individuals and MSEs by "A commercial bank (excluding Small Finance bank, Regional Rural bank and Local Area bank), a Tier 4 Primary (Urban) Co-operative bank, an NBFC-UL, and an All India Financial Institution". — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- **Para 5(ii)(b):** SFBs, RRBs, Tier 3 UCBs, StCBs, CCBs and NBFC-ML may not levy charges "on loans with sanctioned amount/ limit up to ₹50 lakh". — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- **Other paragraphs** (read on the RBI page, with taxguru used as a cross-check):
  - Para 5(iii) applies the rule without any minimum lock-in period.
  - Para 5(iv) covers dual-rate loans, which depend on "whether the loan is on floating rate at the time of pre-payment".
  - Para 6 says other cases follow the RE's board policy. Term-loan charges are based on the amount prepaid, and CC/OD charges are levied on an amount not exceeding the sanctioned limit.
  - Para 8: no charges when the RE initiates the prepayment.
  - Para 9: disclosure is required in the sanction letter, the loan agreement and the KFS: "No pre-payment charges which have not been disclosed ... shall be charged".
  - Para 10: no retrospective levy of charges that were waived earlier.
  - Sources: [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0); [TaxGuru](https://taxguru.in/rbi/reserve-bank-india-pre-payment-charges-loans-directions-2025.html)
- **Para 11, repeal and saving:** "the instructions contained in the circulars/ Master Directions mentioned in Annex ... shall stand repealed from the effective date of these Directions. All the repealed circulars shall be deemed to have been in force during the relevant periods, prior to the coming into effect of these instructions." — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- **Annex: the 10 repealed instruments**, which form the amendment chain. Sources: [TaxGuru reproduction of Annex](https://taxguru.in/rbi/reserve-bank-india-pre-payment-charges-loans-directions-2025.html); RBI page lists ten items.
  1. DBOD.No.Dir.BC.107/13.03.00/2011-12, 5 Jun 2012 (home loans, foreclosure charges)
  2. RPCD.CO.RCBD.BC.No.84/03.03.01/2011-12, 15 Jun 2012
  3. RPCD.CO.RRB.BC.No.85/03.05.033/2011-12, 18 Jun 2012
  4. UBD.BPD.(PCB)CIR.No.41/12.05.001/2011-12, 26 Jun 2012
  5. **DBOD.Dir.BC.No.110/13.03.00/2013-14, 7 May 2014** (floating-rate term loans)
  6. UBD.CO.BPD.PCB.Cir.No.64/12.05.001/2013-14, 26 May 2014
  7. RPCD.CO.RCBD.RRB.BC.No.102/07.51.013/2013-14, 27 May 2014
  8. **DBR.Dir.BC.No.08/13.03.00/2019-20, 2 Aug 2019**
  9. HFC Master Direction 2021, para 85.7
  10. NBFC-SBR Master Direction 2023, para 45.7.4
- **URLs for the older circulars:**
  - The 7 May 2014 circular has a common-man PDF at https://www.rbi.org.in/commonman/Upload/English/Notification/PDFs/DBC070514DF.pdf and an HTML page at https://www.rbi.org.in/commonman/english/scripts/Notification.aspx?Id=1381 — both surfaced in search; I did not open them. [UNVERIFIED content]
  - The 2019 circular appears with notification Id 11646 on the defunct new-site slug "levy-of-foreclosure-charges-pre-payment-penalty-on-floating-rate-term-loans-11646". The likely live URL is https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11646&Mode=0, but I built it from that Id and did not test it. [UNVERIFIED]
- **Rationale from the draft (21 Feb 2025):** "Reserve Bank's supervisory reviews have indicated divergent practices amongst REs ... lead to customer grievances and disputes" and "certain REs have been found to include restrictive clauses in loan contracts/ agreements" meant to stop borrowers switching lenders. — [RBI draft](https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=4609)
- **Folded into the Master Direction (concrete mapping):** the **RBI (Commercial Banks – Responsible Business Conduct) Directions, 2025**, RBI/2025-26/170, DOR.MCS.REC.No.89/01-01-032/2025-26, dated 28 Nov 2025 and currently "Updated as on October 1, 2026". **Chapter VIII "Responsible Lending Conduct", Section E "Pre-payment Charges on Loans", paras 352–353.** MD PDF (1,079 KB): https://rbidocs.rbi.org.in/rdocs/notification/PDFs/170MD.PDF — [RBI MD page](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
  - Para 352, verbatim: "In case of existing floating rate term loans sanctioned before December 31, 2025 for purposes other than business to individual borrowers with or without co-obligant(s), a bank shall not charge pre-payment charges."
  - Para 353, verbatim: "...loans and advances (term loans as well as demand loans) sanctioned or renewed on or after January 01, 2026."
  - Para 353(2): "For all floating rate loans granted for business purpose to individuals and MSEs ... a bank shall not levy any pre-payment charges". There is no ₹50 lakh threshold here, because "Commercial Banks" in this MD exclude SFBs, Payments Banks and LABs (para 3).
  - Source for all three: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
- **Withdrawal record:** the Pre-payment Directions appear as S.No. 32 in the Department of Regulation's withdrawn-circulars list (DoR.MCS.REC.38/01.01.001/2025-26, 2 Jul 2025). — [RBI Circulars Withdrawn](https://www.rbi.org.in/Scripts/NotificationUserWithdrawnCircular.aspx)
- **RBC Directions also exist for other entity types**, each "Updated as on" Jul or Oct 2026. Notification ids:
  - SFBs: 13108
  - Payments Banks: 13089
  - LABs: 13063
  - RRBs: 13039
  - UCBs: 13013
  - Rural Co-op: 12987
  - AIFIs: 12968
  - NBFCs: 12942
  - Source: [RBI Master Directions list](https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx?did=401)
- **Conflicting secondary claim:** a Legal500 summary says the Directions "will come into effect from 1 April 2027". That contradicts the RBI text (1 Jan 2026) and should be treated as wrong. — [Legal500](https://www.legal500.com/intelligence/india/finance-and-banking/rbi-notifies-rbi-pre-payment-charges-on-loans-directions-2025)

### Inferences
- **The 31 Dec 2025 gap:** para 352 covers loans sanctioned "before December 31, 2025" and para 353 covers loans "on or after January 01, 2026". A loan sanctioned **on 31 Dec 2025** is literally covered by neither paragraph. This is an ideal "zero-guessing / flag the ambiguity" demo. The likely intent is continuity with the 2014/2019 regime, but the system should surface the gap and not guess.
- **Different-condition demo:** the original July 2025 Directions cap SFB/RRB coverage at ₹50 lakh, while the CB RBC Directions have no cap. That is because the two documents apply to different entity types. It is not a contradiction. The SFB RBC Directions (id 13108) should carry the ₹50 lakh limit, but I did not open them. [UNVERIFIED]
- Section E of the CB RBC Directions shows no "Updated" footnotes, so the pre-payment text should be identical across all four versions (28 Nov 2025, 1 Apr 2026, 1 Jul 2026, 1 Oct 2026). Spot-check before the demo.

### Gaps
- I could not open the 2012, 2014 and 2019 circular texts themselves; their numbers and dates come from the 2025 Annex. The full scope wording of the 2 Aug 2019 circular is not verified. From memory it covered floating-rate term loans to individuals for non-business purposes with co-obligants, but treat that as unverified.
- Page counts are unknown because the PDFs are behind the bot-check. File sizes come from the RBI pages.
- I found no Hindi version of the Pre-payment Directions 2025 (searched Hindi ids 8040–8199).

---

## Q2. Penal charges ("Fair Lending Practice – Penal Charges in Loan Accounts") and its timeline extension

### Takeaway
The original circular dated 18 Aug 2023 said the regime starts 1 Jan 2024. A 29 Dec 2023 circular **moved it to fresh loans from 1 Apr 2024**, with existing loans switching **by 30 Jun 2024 at the latest**. That gives a crisp three-version timeline. The circular bans "penal interest" added to the rate and bans capitalisation of penal charges, which makes it ideal for a synthetic loan agreement that contradicts it.

### Cited Findings
- **Original circular:** RBI/2023-24/53, DoR.MCS.REC.28/01.01.001/2023-24, **August 18, 2023**. PDF (1,617 KB): https://rbidocs.rbi.org.in/rdocs/Notification/PDFs/FAIRLENDINGPRACTICE1B9DBE75410B4DA881E6EF953304B6F7.PDF — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **Para 3(i), verbatim:** "Penalty, if charged, for non-compliance of material terms and conditions of loan contract by the borrower shall be treated as 'penal charges' and shall not be levied in the form of 'penal interest' that is added to the rate of interest charged on the advances. There shall be no capitalisation of penal charges i.e., no further interest computed on such charges." — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **Other key paragraphs:**
  - Para 3(v): for individual non-business loans, penal charges may not exceed those applicable to non-individual borrowers.
  - Para 3(vi): the amount must be disclosed in the loan agreement and the MITC/KFS, and on the website.
  - Para 5: the circular does not apply to "Credit Cards, External Commercial Borrowings, Trade Credits and Structured Obligations".
  - Source: [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **Para 3(viii), the original timeline:** "These instructions shall come into effect from January 1, 2024 ... In the case of existing loans, the switchover to new penal charges regime shall be ensured on next review or renewal date or six months from the effective date of this circular, whichever is earlier." — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **Real-world justification for synthetic contradictions** (RBI's own words): "It has been observed that many REs use penal rates of interest, over and above the applicable interest rates ... supervisory reviews have indicated divergent practices amongst the REs ... leading to customer grievances and disputes." — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **The Annex is a multi-row "Existing Section | Amended Section" table** amending five Master Directions. Example: in the MD on Interest Rate on Advances, 2016, para 5 ("Banks shall formulate a Board approved policy for charging penal interest...") becomes **"deleted"**. Sections are also inserted into the NBFC MDs at para 29. This is a good table-parsing test and a good amendment-chain test. — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **Extension circular:** RBI/2023-24/102, DoR.MCS.REC.61/01.01.001/2023-24, **December 29, 2023**. Verbatim: "REs shall ensure that the instructions are implemented in respect of all the fresh loans availed from April 1, 2024 onwards. In the case of existing loans, the switchover to new penal charges regime shall be ensured on the next review/ renewal date falling on or after April 1, 2024, but not later than June 30, 2024." PDF: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/PENALCHARGES26A3A63141764128942EDBA48A78A491.PDF — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12585&Mode=0)
- **FAQs (15 Jan 2024):** no upper limit or cap is prescribed. The penal-charge structure must be uniform within a loan or product category, and the circular does not apply to the ECB / Trade Credit / Structured Obligations MD. — [RBI FAQ Id 162](https://www.rbi.org.in/Scripts/FAQView.aspx?Id=162) [secondary via search summary; FAQ page not opened directly]
- **Now consolidated** in CB RBC Directions 2025, Ch VIII **Section D, para 351**. Verbatim: "...all the fresh loans availed from April 1, 2024 onwards. In case of existing loans, the switchover to new penal charges regime shall be applicable from June 30, 2024. These instructions shall be applicable to all credit facilities ... including cash credit, overdraft, securitisation and co-lending portfolios ... shall not apply to credit cards, external commercial borrowings, trade credits ... and structured obligations ... as also other foreign currency loans." — [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
- **The MD folds the FAQ answers into the text:**
  - Para 351(1)(iii): "Additional / fresh penal charges shall not be levied on the earlier outstanding amount of penal charges."
  - Para 351(4)(ii): "no upper limit / cap for penal charges has been prescribed".
  - Para 351(1)(vi) covers reversal of penal charges for NPA accounts.
  - Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)

### Inferences
- **Consolidation paraphrase drift:** the 2023 extension says existing loans switch "on the next review/renewal date falling on or after April 1, 2024, but not later than June 30, 2024". The 2025 MD says the switchover "shall be applicable from June 30, 2024". These are not the same rule, because the original allows an earlier switch on the review date. This is a real example of "restatement vs contradiction" that the checker should classify as a *restatement with lost condition*, not a new rule. (My analysis.)
- **Three as-of states for one existing loan:**
  - before 1 Jan 2024: old penal-interest policy applies
  - 1 Jan 2024 – 31 Mar 2024: old policy still lawful because the start was deferred
  - 1 Apr 2024 – 30 Jun 2024: switch at the review date
  - after 30 Jun 2024: only penal charges are allowed

### Gaps
- I found **no published RBI enforcement order** (monetary penalty) that names a bank specifically for penal interest or foreclosure charges after 2023. Searches returned only policy commentary. Justify synthetic contradictions with the RBI quotes above, which come from RBI's own supervisory findings.

---

## Q3. Key Facts Statement (KFS) circular, 15 Apr 2024: supersession plus APR/EMI tables

### Takeaway
The KFS circular is a clean **partial-repeal / supersession** example: three earlier paragraph-level provisions are repealed, effective for loans sanctioned **on or after 1 Oct 2024**. Its APR illustration (₹20,000, 24 months, 15%, APR 17.07%) and its 24-row repayment schedule are verifiable ground truth for EMI and APR calculations. The schedule also contains a built-in ₹6 rounding discrepancy, which makes a good test.

### Cited Findings
- **Circular:** RBI/2024-25/18, **DOR.STR.REC.13/13.03.00/2024-25**, April 15, 2024. Note that the number is not "DoR.MCS.REC.06" as suggested in the brief.
  - Main PDF (919 KB): https://rbidocs.rbi.org.in/rdocs/notification/PDFs/CIRCULARKFS1504242AE2500BAF494C2A82442B0B642705C1.PDF
  - Annexes: https://rbidocs.rbi.org.in/rdocs/content/pdfs/CIRCULARKFS1504242_A.pdf (KFS format), `_B.pdf` (APR illustration), `_C.pdf` (repayment schedule)
  - Source: [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0)
- **Para 11 (effective date):** "all new retail and MSME term loans sanctioned on or after October 1, 2024, including fresh loans to existing customers". Until then, the existing KFS/factsheet provisions under the Digital Lending, Microfinance and Display-of-Information instructions stay in force. — [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0)
- **Para 13, repealed provisions:**
  1. Para 2(b) of DBR.Leg.No.BC.64/09.07.005/2014-15, 22 Jan 2015 (Display of Information by Banks)
  2. Paras 6.3–6.5 of the Microfinance Loans MD, DoR.FIN.REC.95/03.10.038/2021-22, 14 Mar 2022
  3. Paras 5.1 and 5.2 of the Digital Lending Guidelines, DOR.CRE.REC.66/21.07.001/2022-23, 2 Sep 2022
  - Source: [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0)
- **Now in** CB RBC Directions 2025, Ch VIII **Section B, para 348**, with the KFS format in **Annex XIII**.
  - Para 348(5): "Any fees, charges, etc. which are not mentioned in the KFS, cannot be charged by the bank to the borrower at any stage during the term of the loan, without explicit consent of the borrower."
  - Para 348(2): the KFS validity period is at least 3 working days for tenor ≥ 7 days, and 1 working day for tenor < 7 days.
  - Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
- **APR illustration**, verbatim values from para 348(3)(i) of the MD, which reproduces Annex B. Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)

  | Parameter | Value |
  |---|---|
  | Sanctioned amount | ₹20,000 |
  | Repayment | Monthly EPI ₹970 × 24 |
  | Commencement of repayment | 30 days after sanction |
  | Rate type | Fixed |
  | Rate of interest | 15% |
  | Total interest | ₹3,274 |
  | Fees | ₹400 (₹240 to bank + ₹160 to third party) |
  | Net disbursed | ₹19,600 |
  | Total payable | ₹23,274* |
  | APR | **17.07%** ("Computed on net disbursed amount using IRR approach and reducing balance method") |

  Footnote *: the schedule total is ₹23,280 (=970×24) against ₹23,274, a difference due to rounding.
- **Repayment schedule:** 24 rows. Row 1: outstanding 20,000, principal 720, interest 250. Row 24: outstanding 958, principal 958, interest 12. — [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
- **Hindi KFS annex PDF** surfaced in search at https://www.rbi.org.in/hindi1/Upload/content/PDFs/KFS15042024_AN2.pdf [not opened; UNVERIFIED content]

### Inferences
- **My own check (reproducible):** with r = 0.15/12 and n = 24, EMI = 20000·r(1+r)^n/((1+r)^n−1) ≈ ₹969.7, which rounds to ₹970, and total interest = 969.7×24 − 20000 ≈ ₹3,274. Solving 19,600 = 970·[1−(1+i)^−24]/i gives i ≈ 1.4225% per month, and ×12 ≈ **17.07%**. This matches RBI, so the calculator can be unit-tested against the official numbers.
- **Synthetic-contradiction idea:** a fictional sanction letter whose KFS lists ₹400 in fees, while the loan agreement later charges a ₹500 "documentation fee". That violates para 348(5) of the MD (and the KFS circular).

### Gaps
- I could not open the Annex PDFs to count pages. The RBI copy is behind the bot-check, and a third-party mirror (signzy) no longer hosts it.

---

## Q4. Floating-rate EMI reset circular (18 Aug 2023): borrower rights plus a real textual-substitution amendment

### Takeaway
RBI's "Updated as on October 1, 2025" version of this circular carries **footnoted word-level substitutions**: "shall" becomes "may, at its option", and "the option" becomes "a choice". Both come from the 29 Sep 2025 Amendment Directions and take effect from 1 Oct 2025. This is a perfect as-of-date wording demo: a bank's *duty* to offer a fixed-rate switch became *optional*.

### Cited Findings
- **Circular:** RBI/2023-24/55, DOR.MCS.REC.32/01.01.003/2023-24, August 18, 2023, "Reset of Floating Interest Rate on Equated Monthly Instalments (EMI) based Personal Loans" (Updated as on October 1, 2025). PDF: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/EMILOANCIRCULARBC3C67A8D4554B35BEDF51A6C10DF92C.PDF — [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0)
- **Current para 2(ii), verbatim:** "At the time of reset of interest rates, REs [may, at its option], provide [a choice] to the borrowers to switch over to a fixed rate as per their Board approved policy."
  - Footnote 2: "Substituted vide Reserve Bank of India (Interest Rate on Advances) (Amendment Directions), 2025 dated September 29, 2025 for 'shall' (w.e.f. October 1, 2025)".
  - Footnote 3: the same, "for 'the option'".
  - Source: [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0)
- **Other rights** still in the text:
  - Communicate the impact on EMI or tenor at sanction, and any increase "immediately".
  - Choice of EMI enhancement, tenor elongation or a combination, plus the right to prepay at any time.
  - No negative amortisation.
  - A **quarterly statement** with principal and interest recovered, EMI, EMIs left, and APR.
  - Para 4: extend these rights to existing and new loans "by December 31, 2023".
  - The rationale cites "several consumer grievances related to elongation of loan tenor and/or increase in EMI amount, without proper communication with and/or consent of the borrowers".
  - Source: [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0)
- **Amending instrument:** RBI (Interest Rate on Advances) (Amendment Directions), 2025, RBI/2025-26/83, DOR.CRE.REC.51/13.03.00/2025-26, **September 29, 2025**. Its operative phrases include:
  - "the following proviso shall be inserted after sub-paragraph 8 (e)" (in the Interest Rate on Advances MD, 2016)
  - "Paragraph 2 (ii) shall be modified as under"
  - "Answer (b) to FAQ No 3 shall be modified"
  - "FAQ Nos 4 and 5 shall be deleted"
  - "The above amendments shall come into force from October 1, 2025."
  - PDF: https://rbidocs.rbi.org.in/rdocs/Notification/PDFs/RATES29092025_83258C432DD8924756BD6EFFBD87167B33.PDF
  - Sources: [RBI index](https://www.rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx?Id=12902); [RBI notification](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12902&Mode=0)
- **FAQs on this circular:** [RBI FAQ Id 170](https://www.rbi.org.in/Scripts/FAQView.aspx?Id=170) (10 Jan 2025). FAQ 3(b) and FAQs 4–5 were amended or deleted by the circular above.
- **Now in** CB RBC Directions, Ch VIII **Section C, para 349**: "applicable to the existing as well as new personal loans with effect from January 1, 2024". Para 349(2) carries the substituted "may, at its option, provide a choice" wording. — [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)

### Inferences
- **Second consolidation drift:** the original says "by December 31, 2023", while the MD says "with effect from January 1, 2024". They are semantically near-equivalent, so the checker should classify this as *consistent restatement*, not a contradiction. This is a good negative test case.

### Gaps
- The FAQ page itself was not opened. Its contents are known only through the amendment's description.

---

## Q5. The 28 Nov 2025 consolidation: withdrawal circular, saving clause, 238/244 MDs, concrete mapping

### Takeaway
On 28 Nov 2025 RBI issued 244 Master Directions (238 from consolidation plus 7 new Digital Banking Channels MDs) and **withdrew 9,445 circulars** through RBI/2025-26/100, which carries an explicit saving clause. Every circular in Q1–Q4 is on the withdrawn list, and each maps to a numbered section of Chapter VIII of the CB RBC Directions.

### Cited Findings
- **Press release:** No. 2025-2026/1588, 28 Nov 2025, "Reserve Bank of India issues Consolidated Master Directions". It covers 244 MDs, including 7 new Digital Banking Channels Authorisation MDs, with 238 MDs across 11 types of regulated entities, and 9,445 circulars withdrawn. — [RBI PR](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=61705); PDF https://rbidocs.rbi.org.in/rdocs/PressRelease/PDFs/PR1588600516F0CE4041E6A547915AD19FD71D.PDF
- **Withdrawal circular:** **RBI/2025-26/100, DOR.RRC.REC.302/33-01-010/2025-26, November 28, 2025**, "Consolidation of Regulations – Withdrawal of circulars". PDF (178 KB): https://rbidocs.rbi.org.in/rdocs/notification/PDFs/100NTADBC8AC018BE437BBE70F8664031EB4A.PDF — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13170&Mode=0)
  - Para 3: "9445 circulars listed in the Annex ... are withdrawn by the Reserve Bank with immediate effect and are hereby repealed."
  - **Para 4 (saving clause):** "Notwithstanding such repeal, any action taken or purported to have been taken, or initiated under the repealed Directions, instructions, or guidelines shall continue to be governed by the provisions thereof."
- **Fuller saving clause in each MD:** CB RBC Directions, Ch X, **paras 464–465**. Para 465 adds that repeal "shall not in any way prejudicially affect" any of the following:
  - "(1) any right, obligation or liability acquired, accrued, or incurred thereunder"
  - "(2) any, penalty, forfeiture, or punishment incurred in respect of any contravention committed thereunder"
  - "(3) any investigation, legal proceeding, or remedy ... as if those directions, instructions, or guidelines had not been repealed."
  - Para 464 adds: "The Directions, instructions and guidelines repealed prior to the issuance of these Directions shall continue to remain repealed."
  - Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
- **Withdrawn-list entries** (Department of Regulation section; columns are S.No., Circular Number, Subject, Date):
  - S.No. 32: Pre-payment Directions 2025
  - S.No. 120: KFS, 15 Apr 2024
  - S.No. 147: Penal charges extension, 29 Dec 2023
  - S.No. 165: Penal charges, 18 Aug 2023
  - S.No. 166: EMI reset, 18 Aug 2023
  - The list has **no column mapping each withdrawn circular to its new MD**, so the team must build that mapping itself (see below).
  - Source: [RBI withdrawn list](https://www.rbi.org.in/Scripts/NotificationUserWithdrawnCircular.aspx)
- **Concrete withdrawn-circular → MD mapping** (verified by reading the MD sections). Target is the **RBI (Commercial Banks – Responsible Business Conduct) Directions, 2025**, RBI/2025-26/170, Chapter VIII. Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)

  | Withdrawn circular | Location in the RBC Directions |
  |---|---|
  | KFS 15 Apr 2024 | §B, para 348, plus Annex XIII |
  | EMI reset 18 Aug 2023 | §C, para 349 |
  | Penal charges 18 Aug 2023 + 29 Dec 2023 | §D, para 351 |
  | Pre-payment Directions 2 Jul 2025 | §E, paras 352–353 |
  | Fair Practices Code | §A, paras 326 onward |

- **RBI publishes versioned snapshots ("Previous Versions") of each MD.** This is ground truth for as-of-date questions. For the CB RBC Directions the snapshots are:
  - "Updated as on Nov 28, 2025": https://www.rbi.org.in/Scripts/NotificationPreVersion.aspx?id=13140&Histid=28
  - "Apr 01, 2026": `...&Histid=160`
  - "Jul 01, 2026": `...&Histid=286`
  - current "October 1, 2026"
  - Source: [RBI previous versions](https://www.rbi.org.in/Scripts/NotificationPreVersion.aspx?id=13140)
- **Supervisory consolidation (later phase):** separate from the Nov 2025 exercise, 628 supervisory circulars were consolidated into 64 MDs effective 8 Apr 2026. — [Whalesbook](https://www.whalesbook.com/news/English/bankingfinance/RBI-Consolidates-Rules-628-Circulars-Replaced-by-64-Master-Directions/6a6cc57b0f4505b5a03bd034) [secondary]

### Inferences
- The saving clause lets the demo answer a question like "A bank levied 2% penal interest in Aug 2024; RBI opens proceedings in 2026, after the circular was withdrawn. Which rule governs?" The answer: the repealed 18 Aug 2023 circular, as extended on 29 Dec 2023, under para 4 of RBI/2025-26/100 and para 465(2)–(3) of the RBC MD.

### Gaps
- Exact page counts for the MD PDF (1,079 KB) and the withdrawal circular were not obtained.

---

## Q6. Real textual-substitution amendment examples (verbatim, with URLs)

### Takeaway
RBI amendment instruments use "shall be inserted", "shall be substituted with", "shall be modified as under" and "shall be deleted". The consolidated MDs footnote each change with "Substituted/Inserted/Deleted with effect from <date> vide <instrument>". Three verified examples follow. I did not get a verbatim "for the words ... the words ... shall be substituted" sentence from a primary page; instead, the EMI-reset footnotes record word-for-word substitutions.

### Cited Findings
1. **RBI (Commercial Banks – Responsible Business Conduct) Amendment Directions, 2025**: RBI/2025-26/103, DOR.MCS.REC.No.310/01-01-032/2025-26, **December 04, 2025**. PDF: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT10336988E2D94C54EF7B2BD8AFF9DBC60A3.PDF — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13173&Mode=0)
   - Verbatim: "In paragraph 4, the following definition shall be inserted after sub-paragraph 4(10)" and "The paragraphs 86 to 92 shall be substituted with the instructions given below" (Basic Savings Bank Deposit account).
   - **Conditional commencement:** "These Directions shall come into effect on April 1, 2026 or on the date of adoption by the bank, whichever is earlier."
   - New para 86(8) says digital payments other than ATM transactions "shall not be counted as withdrawals".
2. **RBI (Commercial Banks – Responsible Business Conduct) Amendment Directions, 2026**: RBI/2026-27/46, DOR.STR.REC.35/21-04-048/2026-27, **April 29, 2026**. Verbatim: "In Chapter V – Financial Inclusion and Accessibility, part E shall be inserted as under" (paras 121A–121D, banking services in calamity areas), and "The above amendment shall come into force with effect from July 1, 2026." PDF: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT46BB3AE9CC38644D9A960F2017BA96D485.PDF — [RBI](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13410&Mode=0)
3. **RBI (Interest Rate on Advances) (Amendment Directions), 2025**: RBI/2025-26/83, 29 Sep 2025. Insert, modify and delete operations, with footnoted word substitutions "shall" → "may, at its option" and "the option" → "a choice" w.e.f. 1 Oct 2025 (see Q4). — [RBI](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0)
4. **MD footnote trail:** the CB RBC Directions record a long run of changes. Source: [RBI MD](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)
   - "Substituted with effect from October 1, 2026, consequent to Reserve Bank of India (Commercial Banks – Governance) Amendment Directions, 2026 dated July 14, 2026" (notification Id 13555)
   - "Inserted with effect from April 1, 2026 vide ... Amendment Directions, 2025 dated December 4, 2025"
   - "Deleted with effect from October 1, 2026 ..."
- **Other candidates found but not opened:** [secondary]
  - Non-Operative Financial Holding Company (Amendment) Directions, 2025, RBI/DOR/2025-26/139, 5 Dec 2025, which replaces paras 44–47: https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NT139913344E83AFA420D82385DBD5CF9B8AE.PDF
  - Credit Information Companies (Amendment) Directions, 2025, RBI/DOR/2025-26/119, 4 Dec 2025
  - Source: [search summary](https://taxguru.in/rbi/rbi-non-operative-financial-holding-company-amendment-directions-2025.html)

### Inferences
- **Example 1 is a strong demo** of an as-of-date question with a *bank-specific* effective date. "For Bank X, which had not adopted early, what BSBD free facilities applied on 15 Jan 2026?" The answer is the original paras 86–92 (snapshot of 28 Nov 2025). On 15 May 2026 the answer is the substituted text (snapshot of 1 Apr 2026). The system should say "depends on adoption date" if that date is unknown.

### Gaps
- I have no primary-page verbatim instance of "for the words '...' the words '...' shall be substituted". It probably exists in several 2025–26 amendment PDFs, but those sit behind the bot-check. Search the downloaded PDFs locally with grep.

---

## Q7. Hindi versions

### Takeaway
Yes. RBI publishes **full Hindi texts as HTML** on its Hindi site for circulars, at `https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=<hindi-id>&Mode=0`. **Hindi Ids are a separate number series from English Ids**, which I found by scanning. Hindi texts were confirmed for penal charges, the extension, EMI reset, KFS and the 2025 withdrawal circular. No Hindi text was found for the Pre-payment Directions 2025.

### Cited Findings
- **Verified Hindi pages** (scanned 23 Nov 2026; circular number and title read from each page):

  | Hindi Id | Circular | Hindi title |
  |---|---|---|
  | 7618 | RBI/2023-24/53 (penal charges) | "उचित उधार प्रथा - ऋण खातों में दंडात्मक शुल्क" |
  | 7672 | Extension of 29 Dec 2023 | "...अनुदेशों के कार्यान्वयन के लिए समय-सीमा का विस्तार" |
  | 7617 | RBI/2023-24/55 (EMI reset) | — |
  | 7826 | RBI/2024-25/18 (KFS) | — |
  | 8190 | RBI/2025-26/100 (withdrawal) | "विनियमों का समेकन - परिपत्रों को वापस लेना" |

  - Penal charges page: https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7618&Mode=0
  - Extension page: https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7672&Mode=0
  - EMI reset page: https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7617&Mode=0
  - KFS page: https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7826&Mode=0
  - Withdrawal page: https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=8190&Mode=0
  - Hindi circular index: [RBI Hindi index](https://www.rbi.org.in/hindi/scripts/IndexRBICircular.aspx)
  - Also found: Hindi Id 8087 is RBI/2025-26/17, which covers interest rate, foreclosure charges / prepayment penalty and EMI reset for housing loans. It is probably the Housing Finance Master Circular of Apr 2025 [title partially read].
- **Hindi para 3(viii) of the penal charges circular** (verbatim excerpt): "ये अनुदेश 1 जनवरी 2024 से लागू होंगे।" — [RBI Hindi 7618](https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7618&Mode=0)
- **Hindi para 3(i)** uses 'दंडात्मक शुल्क' for "penal charges" and 'दंडात्मक ब्याज' for "penal interest". "No capitalisation" is "कोई पूंजीकरण नहीं"; KFS is "मुख्य तथ्य विवरण (केएफएस)"; RE is "आरई". — [RBI Hindi 7618](https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=7618&Mode=0)
- The old URL pattern `hindi/Scripts/NotificationUser.aspx?Id=<english id>` returns an error page. — [tested](https://www.rbi.org.in/hindi/Scripts/NotificationUser.aspx?Id=12878&Mode=0)
- Hindi Master Directions list: the Hindi site navigation links `/hindi/scripts/MasterDirections.aspx`. I did not check whether the RBC MD has a Hindi version. [UNVERIFIED]

### Inferences
- **Bilingual demo:** ingest Hindi Id 7618 and English Id 12527 as a parallel pair. Ask "क्या बैंक दंडात्मक ब्याज लगा सकता है?" The answer: नहीं. Since 1 Apr 2024 (new loans), only दंडात्मक शुल्क may be charged, with no capitalisation. Cite Hindi para 3(i) plus the English extension circular.
- **Translation drift to watch:** RBI uses "शुल्क" for "charges" in the circular and "प्रभार" elsewhere, for example in the 2025 Hindi deceased-depositor text (Hindi Id 8189). The Hindi retrieval layer should treat them as synonyms.

### Gaps
- No Hindi version of the Pre-payment Directions 2025 was found in Hindi Ids 8040–8199. A search hit pointed to a Hindi prepayment file on the defunct new site (`website.rbi.org.in/documents/d/rbi/circularforprepaymentchargeshindi`), which now redirects.
- Whether Hindi PDFs (as opposed to HTML) exist for these items was not established. The Hindi HTML pages showed no notification PDF link.

---

## Q8. Multi-regulator breadth (IRDAI / SEBI master circulars)

### Takeaway
Two usable supersession examples were found, sourced from secondary material only. Add at most one of them, and verify it on irdai.gov.in or sebi.gov.in when downloading.

### Cited Findings
- **IRDAI Master Circular on Health Insurance Business:** 29 May 2024, ref **IRDAI/HLT/CIR/PRO/84/5/2024** (not "MISC"). It **repeals 55 earlier circulars**, is effective immediately except where dates are specified, and non-compliant existing products must be modified by 30 Sep 2024. Cashless authorisation must be decided within 1 hour. — [Deloitte](https://www2.deloitte.com/in/en/pages/tax/articles/tax-alert-insurance-regulator-releases-new-guidelines.html); [Lokmat](https://www.lokmattimes.com/national/new-health-insurance-guidelines-insurers-must-offer-products-to-cover-all-age-groups-and-ailments-says-irdai-a505); [JSA newsletter](https://jsalaw.com/wp-content/uploads/2024/07/Final-JSA-Insurance-Law-Newsletter-April-to-June-2024.pdf) [secondary]
- **SEBI Master Circular for Mutual Funds**, 27 Jun 2024:
  - It rescinded 16 more circulars, on top of 336 already rescinded.
  - It superseded the MC of 19 May 2023.
  - Clause 6.6 was later modified on 22 Oct 2024, and clause 2.6 was superseded on 26 Feb 2026.
  - It was **replaced by a new MC dated 20 Mar 2026, effective 1 Apr 2026**, alongside the SEBI (Mutual Funds) Regulations, 2026.
  - Sources: [SCC Online](https://www.scconline.com/blog/post/2024/07/02/sebi-issues-master-circular-for-mutual-funds-rescinding-16-previous-circulars-legal-news/); [Taxmann](https://www.taxmann.com/post/blog/sebi-revises-mutual-fund-scheme-categorisation-supersedes-clause-2-6-of-master-circular) [secondary]

### Inferences
- **SEBI MF Master Circular chain:** 2023 MC → 2024 MC → 2026 MC, plus clause-level circulars in between. It mirrors the RBI pattern and shows multi-regulator generality, which is useful for a single slide.

### Gaps
- Primary SEBI and IRDAI URLs and page counts were not verified.
- The 2024 SEBI circular number (SEBI/HO/IMD/IMD-PoD-1/P/CIR/2024/90) is from the brief and was not confirmed.

---

## Q9. Real-world contradiction candidates; PDF format; licensing

### Takeaway
RBI's own circulars document the lender practices the synthetic contradictions imitate: penal rates over and above the contracted rate, restrictive foreclosure clauses, and EMI or tenor elongation without consent. That is citable justification. I found no named-bank enforcement orders on these topics. Content on rbi.org.in is "© Reserve Bank of India. All Rights Reserved", and the disclaimer restricts linking to and framing of internal pages. Mirror only the PDFs the demo needs and cite RBI as the source.

### Cited Findings
- **RBI findings on penal charges:** "many REs use penal rates of interest, over and above the applicable interest rates" and "such charges are not meant to be used as a revenue enhancement tool". — [RBI 18 Aug 2023](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0)
- **RBI findings on foreclosure clauses:** "certain REs have been found to include restrictive clauses in loan contracts/ agreements" to stop borrowers switching lenders. — [RBI draft Feb 2025](https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=4609)
- **RBI findings on EMI reset:** "several consumer grievances related to elongation of loan tenor and/or increase in EMI amount, without proper communication with and/or consent of the borrowers". — [RBI 18 Aug 2023](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0)
- **Licensing:**
  - RBI disclaimer: "© Reserve Bank of India. All Rights Reserved."
  - Caching, linking and framing are restricted. Only the Home Page may be linked, after written notice, and internal pages need prior permission.
  - "In case of doubt, however please check the print versions."
  - RBI "accepts no responsibility for the accuracy or completeness".
  - The disclaimer does **not** say whether Hindi or English prevails.
  - Source: [RBI Disclaimer](https://rbi.org.in/Scripts/Disclaimer.aspx)
  - The old DBIE data site permits reproduction "provided an acknowledgement of the primary source is made". That covers data only. — [DBIE disclaimer](https://dbieold.rbi.org.in/DBIE/doc/disclaimer.html) [secondary snippet]
- **Format:**
  - RBI HTML pages hold the full text, including multi-row tables: the penal-charges Annex "Existing Section | Amended Section", the 24-row repayment schedule, and the KFS template in Annex XIII.
  - PDF file sizes per the RBI pages: Pre-payment 905 KB, KFS 919 KB, Penal charges 1,617 KB, Withdrawal 178 KB, RBC MD 1,079 KB.
  - Sources: [RBI 12878](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878&Mode=0), [12663](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0), [12527](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527&Mode=0), [13170](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13170&Mode=0), [MD 13140](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140)

### Inferences
- **Text-based PDFs:** RBI circular PDFs are born-digital, not scanned. Search-engine snippets of rbidocs PDFs show extractable text, including a garbled Devanagari bilingual letterhead ("भारतीय įरज़वर् बैंक"). That means the Hindi header text extracts with font-mapping noise. Prefer the HTML pages for Hindi. (Inference; I did not open the PDFs locally.)
- **Corpus framing for judges:**
  - Real documents: the circulars and MDs listed below.
  - Synthetic: only the "Fictional Bank loan agreement / sanction letter / KFS", built to break specific cited paragraphs.
  - Also include the two *real* consolidation drifts (penal charges switchover wording, EMI reset date wording) as non-synthetic "contradiction-or-restatement?" tests.

### Gaps
- No named Banking Ombudsman or RBI penalty order on penal interest or foreclosure charges was found.
- No exact PDF page counts. Download and run `pdfinfo` locally.

---

## Appendix: curated document list (16 real) and demo scenarios
(The appendix is included here to keep the corpus in one file. Every item is cited above.)

**Real documents (download HTML from the rbi.org.in page; PDFs by hand in a browser):**

| # | Document | Number | Date | Effective | English page | Hindi |
|---|---|---|---|---|---|---|
| 1 | Home loans: foreclosure charges | DBOD.No.Dir.BC.107/13.03.00/2011-12 | 5 Jun 2012 | — | (via 2025 Annex) | ? |
| 2 | Foreclosure charges on floating rate term loans | DBOD.Dir.BC.No.110/13.03.00/2013-14 | 7 May 2014 | immediate [secondary] | commonman Id 1381 [unverified] | ? |
| 3 | Foreclosure charges, floating rate term loans | DBR.Dir.BC.No.08/13.03.00/2019-20 | 2 Aug 2019 | — | Id 11646 [unverified] | ? |
| 4 | Penal Charges in Loan Accounts | RBI/2023-24/53; DoR.MCS.REC.28/01.01.001/2023-24 | 18 Aug 2023 | 1 Jan 2024 (as issued) | Id 12527 | H 7618 |
| 5 | Penal charges: timeline extension | RBI/2023-24/102; DoR.MCS.REC.61/01.01.001/2023-24 | 29 Dec 2023 | fresh loans 1 Apr 2024; existing loans ≤30 Jun 2024 | Id 12585 | H 7672 |
| 6 | Penal charges FAQs | — | 15 Jan 2024 | — | FAQ Id 162 | ? |
| 7 | EMI reset (Updated as on 1 Oct 2025) | RBI/2023-24/55; DOR.MCS.REC.32/01.01.003/2023-24 | 18 Aug 2023 | by 31 Dec 2023 | Id 12529 | H 7617 |
| 8 | Interest Rate on Advances (Amendment Directions), 2025 | RBI/2025-26/83; DOR.CRE.REC.51/13.03.00/2025-26 | 29 Sep 2025 | 1 Oct 2025 | Id 12902 | ? |
| 9 | KFS for Loans & Advances (+Annex A/B/C) | RBI/2024-25/18; DOR.STR.REC.13/13.03.00/2024-25 | 15 Apr 2024 | sanctions ≥1 Oct 2024 | Id 12663 | H 7826 (+ Hindi Annex PDF) |
| 10 | Pre-payment Charges on Loans Directions, 2025 | RBI/2025-26/64; DoR.MCS.REC.38/01.01.001/2025-26 | 2 Jul 2025 | sanctions/renewals ≥1 Jan 2026 | Id 12878 | not found |
| 11 | Draft: Levy of Foreclosure Charges (consultation) | draft | 21 Feb 2025 | — | bs_viewcontent Id 4609 | Hindi PR exists [unverified] |
| 12 | Consolidation – Withdrawal of circulars | RBI/2025-26/100; DOR.RRC.REC.302/33-01-010/2025-26 | 28 Nov 2025 | immediate | Id 13170 + withdrawn list | H 8190 |
| 13 | Press release: Consolidated MDs | PR 2025-2026/1588 | 28 Nov 2025 | — | prid 61705 | ? |
| 14 | CB – Responsible Business Conduct Directions, 2025 (4 dated versions) | RBI/2025-26/170; DOR.MCS.REC.No.89/01-01-032/2025-26 | 28 Nov 2025 | immediate (unless indicated) | MD id 13140 + PreVersion Histid 28/160/286 | ? |
| 15 | CB – RBC Amendment Directions, 2025 (BSBD) | RBI/2025-26/103; DOR.MCS.REC.No.310/01-01-032/2025-26 | 4 Dec 2025 | 1 Apr 2026 or adoption date if earlier | Id 13173 | ? |
| 16 | CB – RBC Amendment Directions, 2026 (calamity) | RBI/2026-27/46; DOR.STR.REC.35/21-04-048/2026-27 | 29 Apr 2026 | 1 Jul 2026 | Id 13410 | ? |
| (opt) | IRDAI Health Master Circular | IRDAI/HLT/CIR/PRO/84/5/2024 | 29 May 2024 | immediate | [secondary] | — |

English page = `https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=<Id>&Mode=0`.
Hindi page = `https://www.rbi.org.in/hindi/Scripts/Notifications.aspx?Id=<H>&Mode=0`.

**Scenario A: Prepayment as-of-date (docs 1–3, 10, 12, 14)**
- **Q:** Floating-rate home loan, individual, commercial bank, sanctioned 15 Mar 2026; can the bank charge 2% foreclosure?
  **A:** No. Pre-payment Directions 2025 para 5(i), and CB RBC MD para 353(1).
- **Q:** The same loan, but sanctioned 10 Aug 2015?
  **A:** No. 7 May 2014 circular for the period before 2026, and RBC MD para 352 now. The repealed circulars are "deemed to have been in force during the relevant periods" (2025 Directions para 11).
- **Q:** ₹80 lakh floating-rate MSE business loan from a Small Finance Bank, sanctioned Feb 2026?
  **A:** The July 2025 Directions para 5(ii)(b) bar covers only loans up to ₹50 lakh. Above that, para 6 applies: charges per board policy, based on the amount prepaid, and only if disclosed in the KFS and sanction letter (para 9).
- **Q:** Loan sanctioned on 31 Dec 2025?
  **A:** The system should **flag ambiguity**: RBC para 352 says "before December 31, 2025" and para 353 says "on or after January 01, 2026".

**Scenario B: Penal charges vs a synthetic loan agreement (docs 4–6, 14)**
- **Synthetic clause:** "Penal interest @ 2% p.a. over the contracted rate, compounded monthly", in a loan sanctioned 10 May 2024.
  **A: CONTRADICTION** with para 3(i) of the 2023 circular (penal interest banned, no capitalisation), applicable to fresh loans from 1 Apr 2024 under the 29 Dec 2023 circular, and with RBC para 351(1).
- **Q:** Same clause, loan sanctioned 15 Feb 2024?
  **A:** Not yet a violation at sanction, because the regime was deferred to 1 Apr 2024. The loan had to switch at the next review on or after 1 Apr 2024, and no later than 30 Jun 2024. Classify as **different condition (date)**, not a contradiction.
- **Q:** Is there a maximum penal charge?
  **A:** No cap is prescribed. The charge must be "reasonable and commensurate", per RBC para 351(4)(ii) and FAQ.
- **Q:** Credit-card late fee?
  **A:** Out of scope (para 5 / para 351).

**Scenario C: KFS tables and calculations (docs 9, 14)**
- **Q:** EMI for ₹20,000 at 15% over 24 months?
  **A:** ₹970 (KFS illustration).
- **Q:** APR?
  **A:** 17.07%, computed on the net disbursed ₹19,600.
- **Q:** Why does the schedule total ₹23,280 when "total amount to be paid" is ₹23,274?
  **A:** Rounding, per the footnote in RBC para 348(3).
- **Synthetic clause:** a ₹500 documentation fee absent from the KFS.
  **A:** Contradiction with para 348(5).
- **Q:** Which earlier provisions did the KFS circular repeal, and from when?
  **A:** Three provisions (2015, 2022, 2022); see Q3. Effective for sanctions on or after 1 Oct 2024.

**Scenario D: Word-level amendment (docs 7, 8)**
- **Q:** As of 15 Sep 2025, must a lender offer a fixed-rate switch at reset?
  **A:** Yes: "REs shall provide the option".
- **Q:** As of 15 Oct 2025?
  **A:** No. "may, at its option, provide a choice", substituted w.e.f. 1 Oct 2025 by RBI/2025-26/83.
- **Q:** How often must the lender send statements?
  **A:** Quarterly, with principal and interest recovered, EMI, EMIs left and APR.

**Scenario E: Consolidation and saving clause (docs 12–16)**
- **Q:** Is the 18 Aug 2023 penal charges circular in force on 1 Jan 2026?
  **A:** No. It was withdrawn 28 Nov 2025 (withdrawn list S.No. 165), and its content now sits in RBC MD Ch VIII §D para 351.
- **Q:** Which rule governs proceedings over a 2024 breach?
  **A:** The repealed circular, by para 4 of RBI/2025-26/100 and RBC para 465.
- **Q:** For a bank that has not adopted early, which BSBD rules apply on 15 Jan 2026 and on 15 May 2026?
  **A:** On 15 Jan 2026, original paras 86–92. On 15 May 2026, the substituted paras (in force from 1 Apr 2026).
- **Real drift test:** compare para 351's "switchover ... applicable from June 30, 2024" with the 29 Dec 2023 text.
  **Expected label:** "restatement with lost condition", not a new rule.

**Scenario F: Hindi Q&A (docs 4, 5, 7, 9, 12, Hindi pages)**
- **Q:** "क्या बैंक 1 मई 2024 के बाद नए ऋण पर दंडात्मक ब्याज लगा सकता है?"
  **A:** नहीं — केवल दंडात्मक शुल्क, बिना पूंजीकरण. Cite Hindi Id 7618 para 3(i) and Hindi Id 7672.
- **Q:** "केएफएस किन ऋणों पर लागू है?"
  **A:** 1 अक्टूबर 2024 को या उसके बाद स्वीकृत सभी नए खुदरा और एमएसएमई सावधि ऋण. Cite Hindi Id 7826 para 11.
