#!/usr/bin/env python3
"""Fictional demo PDFs for the final pass (all clearly marked FICTIONAL):

  upload/EUCB-circular-2026-07.pdf   a new internal circular of the fictional bank, for the "upload a PDF" demo moment.
                                     Planted conflict: 3% foreclosure on floating-rate home loans to individuals
                                     (RBI UCB Directions 261(1) says no pre-payment charge).
  insurance/policy.pdf               "Suraksha Health" policy wording: pre-existing disease waiting period 48 months.
  insurance/endorsement-1.pdf        Endorsement No. 1: clause 4.2 substituted, 36 months, w.e.f. 1 April 2026.
  insurance/claim-faq.pdf            Claim FAQ (May 2026): says 24 months (contradicts the in-force endorsement).

    python corpus/demo/build_demo_pdfs.py
Deterministic (reportlab invariant mode)."""
from pathlib import Path

from reportlab import rl_config

rl_config.invariant = 1
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import ParagraphStyle  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.pdfbase import pdfmetrics  # noqa: E402
from reportlab.pdfbase.ttfonts import TTFont  # noqa: E402
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer  # noqa: E402

HERE = Path(__file__).resolve().parent
FONT = "Helvetica"
GEORGIA = Path("/System/Library/Fonts/Supplemental/Georgia.ttf")
if GEORGIA.exists():  # has the ₹ glyph
    pdfmetrics.registerFont(TTFont("Body", str(GEORGIA)))
    FONT = "Body"
RS = "₹" if FONT == "Body" else "Rs. "

DOCS = {
    "upload/EUCB-circular-2026-07.pdf": (
        "Example UCB Circular EUCB/CR/2026/07: Revised charges on retail loans (FICTIONAL)",
        ["Example Urban Co-operative Bank Ltd. (fictional) – Circular No. EUCB/CR/2026/07 dated July 1, 2026",
         "To: All branches. Subject: Revised foreclosure and penal charges on retail loans.",
         "1. Purpose. This circular revises the charges in clause 7.4 of the Example UCB Retail Loan Policy v3 and "
         "comes into force on August 1, 2026.",
         "2.1 With effect from August 1, 2026, a foreclosure charge of 3% of the principal outstanding shall be levied "
         "on floating rate home loans to individuals for non-business purposes, including loans sanctioned on or after "
         "January 1, 2026.",
         "2.2 Foreclosure charges on fixed rate term loans shall be 2% of the amount prepaid.",
         f"3.1 Penal charges for delayed payment of an EMI shall be {RS}750 per month and shall not be added to the "
         "rate of interest.",
         "4.1 Branches shall disclose all these charges in the Key Facts Statement given to the borrower.",
         "Issued by the Chief Executive Officer (fictional). This document is fictional and for demo only."]),
    "insurance/policy.pdf": (
        "Suraksha Health Insurance Policy Wording (FICTIONAL)",
        ["Suraksha Health Insurance Policy Wording – Policy Wording No. SHP/2025/01 (fictional insurer, for demo only)",
         "Effective date: April 1, 2025.",
         "4. Waiting periods",
         "4.1 Initial waiting period: claims arising within 30 days of the first policy commencement date are not "
         "covered, except claims arising from an accident.",
         "4.2 Pre-existing diseases: expenses related to pre-existing diseases are covered only after a waiting period "
         "of 48 months of continuous coverage.",
         "4.3 Specified illnesses such as cataract, hernia and joint replacement are covered after a waiting period of "
         "24 months.",
         "5. Limits",
         "5.1 Room rent is covered up to 1% of the sum insured per day.",
         "6. Exclusions",
         "6.1 Cosmetic or plastic surgery is not covered unless it is needed to treat an injury from an accident.",
         "7. Claims",
         "7.1 A planned hospitalisation must be intimated to the insurer at least 48 hours before admission.",
         "8.1 A grace period of 30 days is allowed for renewal premium payment."]),
    "insurance/endorsement-1.pdf": (
        "Endorsement No. 1 to the Suraksha Health Insurance Policy Wording (FICTIONAL)",
        ["Endorsement No. 1 to the Suraksha Health Insurance Policy Wording (fictional insurer, for demo only)",
         "Dated: March 15, 2026.",
         "1. With effect from April 1, 2026, Clause 4.2 of the Suraksha Health Insurance Policy Wording shall be "
         "substituted to read: Pre-existing diseases: expenses related to pre-existing diseases are covered only after "
         "a waiting period of 36 months of continuous coverage.",
         "2. All other terms and conditions of the Suraksha Health Insurance Policy Wording remain unchanged."]),
    "insurance/claim-faq.pdf": (
        "Suraksha Health Claim FAQ (FICTIONAL)",
        ["Suraksha Health – Frequently asked questions on claims (fictional insurer, for demo only)",
         "Published: May 1, 2026.",
         "1. When are pre-existing diseases covered? Pre-existing diseases are covered after a waiting period of "
         "24 months of continuous coverage.",
         "2. How early must a planned hospitalisation be intimated? At least 48 hours before admission.",
         "3. Is room rent capped? Room rent is covered up to 1% of the sum insured per day."]),
}


def build():
    title_style = ParagraphStyle("t", fontName=FONT, fontSize=13, leading=17, spaceAfter=8)
    body = ParagraphStyle("b", fontName=FONT, fontSize=10.5, leading=14.5, spaceAfter=6)
    for rel, (title, paras) in DOCS.items():
        out = HERE / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        doc = SimpleDocTemplate(str(out), pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm, topMargin=24 * mm,
                                bottomMargin=24 * mm, title=title, author="fictional demo", subject="FICTIONAL")
        story = [Paragraph(title, title_style), Spacer(1, 4)] + [Paragraph(p, body) for p in paras]
        doc.build(story)
        print("wrote", out.relative_to(HERE.parent.parent))


if __name__ == "__main__":
    build()
