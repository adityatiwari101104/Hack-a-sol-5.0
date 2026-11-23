"""Fast unit tests (no network, no models)."""
from datetime import date
from decimal import Decimal

from app import applicability, calc, privacy
from app.extract import FN_SUB, footnote_versions, locate
from app.normalize import facts, norm_text
from app.service import status_at

TIER3 = {"label": "Tier 3", "entity": "ucb", "ucb_tier": 3}
TIER4 = {"label": "Tier 4", "entity": "ucb", "ucb_tier": 4}


def test_emi_and_apr_ground_truth():
    assert calc.money(calc.emi(2500000, "8.5", 240)) == Decimal("21695.58")
    e = calc.emi(20000, 15, 24)
    assert calc.money(e) == Decimal("969.73") and round(e) == 970          # KFS Annex B shows ₹970
    assert round(calc.apr_irr(19600, e, 24), 2) == Decimal("17.07")        # RBI's 17.07% uses the unrounded EMI
    assert round(calc.apr_irr(19600, 970, 24), 2) == Decimal("17.10")      # the rounded EMI gives 17.10%
    assert calc.run("EMI", {"principal": "25,00,000", "annual_rate_pct": "8.5", "months": "240"})["display"] == "₹21,695.58"


def test_calc_rejects_unknown_formula():
    try:
        calc.run("eval('1+1')", {})
        assert False
    except ValueError:
        pass


def test_normalise_rbi_quirks_and_money():
    assert norm_text("RBI /2024-25/18 Co -operative pre- payment") == "RBI/2024-25/18 Co-operative pre-payment"
    f = facts("A Tier 3 UCB shall not levy charges on loans up to ₹50 lakh sanctioned on or after January 1, 2026; 2% p.m.")
    assert {"rs:5000000", "date:2026-01-01", "pct:2pm"} <= f
    assert "rs:4000000" in facts("Rs 40 lakh loan") and "rs:2500000" in facts("₹25,00,000")


def test_status_at_is_computed_not_stored():
    assert status_at("2023-08-18", "2025-10-01", date(2025, 9, 15)) == "IN_FORCE"
    assert status_at("2023-08-18", "2025-10-01", date(2025, 10, 1)) == "SUPERSEDED"   # valid_to is exclusive
    assert status_at("2025-10-01", None, date(2025, 9, 30)) == "NOT_YET_IN_FORCE"


def test_applicability_tier_amount_and_date_gap():
    rule_t3 = {"rate_type": "floating", "borrower": "individual_or_mse", "purpose": "business", "entity": "ucb_tier3",
               "amount_max_inr": "5000000", "sanction_from": "2026-01-01"}
    case = {"rate_type": "floating", "borrower": "mse", "purpose": "business", "amount_inr": 4000000, "sanction_date": "2026-03-15"}
    assert applicability.evaluate(rule_t3, case, TIER3)[0] == "APPLIES"
    assert applicability.evaluate(rule_t3, dict(case, amount_inr=8000000), TIER3)[0] == "DOES_NOT_APPLY"
    assert applicability.evaluate(rule_t3, case, TIER4)[0] == "DOES_NOT_APPLY"
    assert applicability.evaluate(rule_t3, dict(case, sanction_date=None), TIER3)[0] == "UNKNOWN"
    before = {"rate_type": "floating", "borrower": "individual", "purpose": "non_business", "sanction_before": "2025-12-31"}
    after = {"rate_type": "floating", "borrower": "individual", "purpose": "non_business", "sanction_from": "2026-01-01"}
    gap = {"rate_type": "floating", "borrower": "individual", "purpose": "non_business", "sanction_date": "2025-12-31"}
    assert applicability.evaluate(before, gap, TIER3)[0] == "DOES_NOT_APPLY"
    assert applicability.evaluate(after, gap, TIER3)[0] == "DOES_NOT_APPLY"   # the 31 Dec 2025 gap


def test_conditions_overlap_different_condition():
    corporate = {"borrower": "non_individual"}
    rbi_individual = {"rate_type": "floating", "borrower": "individual", "purpose": "non_business"}
    assert not applicability.conditions_overlap(corporate, rbi_individual)
    assert applicability.conditions_overlap({"facility": "term_loan"}, rbi_individual)  # 'all term loans' overlaps


def test_footnote_reconstruction_of_amended_text():
    text = "(ii) At the time of reset of interest rates, REs 2[may, at its option], provide 3[a choice] to the borrowers."
    fns = {"2": "2 Substituted vide Reserve Bank of India (Interest Rate on Advances) (Amendment Directions), 2025 dated "
                "September 29, 2025 f or “shall” (w.e.f. October 1, 2025)",
           "3": "3 Substituted vide Reserve Bank of India (Interest Rate on Advances) (Amendment Directions), 2025 dated "
                "September 29, 2025 f or “the option” (w.e.f. October 1, 2025)"}
    original, amended, wef, quote, _ = footnote_versions(text, fns)
    assert "REs shall, provide the option to" in original
    assert "REs may, at its option, provide a choice to" in amended
    assert wef == date(2025, 10, 1) and FN_SUB.search(fns["2"])


def test_quote_locator_tolerates_pdf_spacing():
    page = "RBI /2024-25/18 ... All Primary (Urban) Co -operative Banks shall not levy pre- payment charges."
    assert locate("Co-operative Banks shall not levy pre-payment charges", page)
    assert not locate("shall levy pre-payment charges of 5%", page)


def test_redaction_roundtrip():
    red, mapping, h = privacy.redact(["Borrower PAN ABCPS1234K, IFSC EXUC0001234, mobile 9876543210, A/c No. 004512345678"])
    assert "ABCPS1234K" not in red[0] and "EXUC0001234" not in red[0] and "9876543210" not in red[0]
    assert "004512345678" not in red[0] and h
    assert privacy.rehydrate(red[0], mapping).count("ABCPS1234K") == 1


def test_coverage_check_and_negation_guard():
    from app.verify import _neg_agrees, coverage
    prem = "(ii) Although no upper limit / cap for penal charges has been prescribed, the bank shall keep in mind"
    assert coverage("No upper limit or cap for penal charges has been prescribed.", prem) >= 0.8
    assert _neg_agrees("No upper limit or cap for penal charges has been prescribed.", prem)
    assert not _neg_agrees("A Tier 3 UCB may levy pre-payment charges.", "A Tier 3 UCB shall not levy pre-payment charges.")
