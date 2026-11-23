"""Code-side rule application: compare the user's case facts with a tuple's conditions.

The spike showed an entailment model cannot verify "₹40 lakh is within 'up to ₹50 lakh'" or "March 2026 is on or
after 1 January 2026". So this comparison is done here, deterministically, and shown as its own verified step."""
from datetime import date

ENTITY_OK = {
    "any": lambda p: True,
    "ucb_any": lambda p: p["entity"] == "ucb",
    "ucb_tier3": lambda p: p["entity"] == "ucb" and p.get("ucb_tier") == 3,
    "ucb_tier4": lambda p: p["entity"] == "ucb" and p.get("ucb_tier") == 4,
    "commercial_bank": lambda p: p["entity"] == "commercial_bank",
}


def _d(s):
    try:
        return date.fromisoformat(s) if s else None
    except ValueError:
        return None


def evaluate(cond, case, profile):
    """Returns (verdict, reasons, unknown_facts). verdict in APPLIES | DOES_NOT_APPLY | UNKNOWN."""
    reasons, unknown, fail = [], [], []

    def check(name, ok, why):
        if ok is None:
            unknown.append(name)
        elif ok:
            reasons.append(why)
        else:
            fail.append(why)

    if cond.get("entity", "any") != "any":
        check("bank_profile", ENTITY_OK.get(cond["entity"], lambda p: None)(profile),
              f"bank is {profile['label']} (rule: {cond['entity']})")
    for key in ("rate_type", "purpose", "facility"):
        want = cond.get(key, "any")
        if want != "any":
            have = case.get(key)
            check(key, None if not have else have == want, f"{key.replace('_', ' ')}: {have} (rule: {want})")
    want_b = cond.get("borrower", "any")
    if want_b != "any":
        have = case.get("borrower")
        ok = None if not have else (have == want_b or (want_b == "individual_or_mse" and have in ("individual", "mse")))
        check("borrower", ok, f"borrower: {have} (rule: {want_b})")
    amt = case.get("amount_inr")
    if cond.get("amount_max_inr"):
        check("amount_inr", None if amt is None else amt <= float(cond["amount_max_inr"]),
              f"amount ₹{amt:,.0f} {'≤' if amt is not None and amt <= float(cond['amount_max_inr']) else '>'} ₹{float(cond['amount_max_inr']):,.0f}" if amt is not None else "")
    if cond.get("amount_min_inr"):
        check("amount_inr", None if amt is None else amt >= float(cond["amount_min_inr"]),
              f"amount ₹{amt:,.0f} vs minimum ₹{float(cond['amount_min_inr']):,.0f}" if amt is not None else "")
    sd = _d(case.get("sanction_date"))
    if _d(cond.get("sanction_from")):
        check("sanction_date", None if sd is None else sd >= _d(cond["sanction_from"]),
              f"sanctioned {sd} {'≥' if sd and sd >= _d(cond['sanction_from']) else '<'} {cond['sanction_from']}" if sd else "")
    if _d(cond.get("sanction_before")):
        check("sanction_date", None if sd is None else sd < _d(cond["sanction_before"]),
              f"sanctioned {sd} {'<' if sd and sd < _d(cond['sanction_before']) else '≥'} {cond['sanction_before']}" if sd else "")
    if fail:
        return "DOES_NOT_APPLY", fail, unknown
    if unknown:
        return "UNKNOWN", reasons, unknown
    return "APPLIES", reasons, []


def conditions_overlap(a, b):
    """True if two condition dicts can both hold for some loan (missing / 'any' = wildcard)."""
    for key in ("rate_type", "purpose", "facility"):
        x, y = a.get(key, "any"), b.get(key, "any")
        if x != "any" and y != "any" and x != y:
            return False
    xb, yb = a.get("borrower", "any"), b.get("borrower", "any")
    if "any" not in (xb, yb) and xb != yb:
        if not ({xb, yb} & {"individual_or_mse"} and ({xb, yb} - {"individual_or_mse"}) <= {"individual", "mse"}):
            return False
    xe, ye = a.get("entity", "any"), b.get("entity", "any")
    if "any" not in (xe, ye) and xe != ye and "ucb_any" not in (xe, ye):
        return False
    lo = max(float(a.get("amount_min_inr") or 0), float(b.get("amount_min_inr") or 0))
    hi = min(float(a.get("amount_max_inr") or 1e18), float(b.get("amount_max_inr") or 1e18))
    if lo > hi:
        return False
    start = max(_d(a.get("sanction_from")) or date.min, _d(b.get("sanction_from")) or date.min)
    end = min(_d(a.get("sanction_before")) or date.max, _d(b.get("sanction_before")) or date.max)
    return start < end


PRODUCTS = {"microfinance": r"micro\s?finance", "gold loan": r"gold|silver collateral", "deposit": r"\bdeposit",
            "credit card": r"credit card", "locker": r"locker", "vehicle loan": r"vehicle loan",
            "education loan": r"education loan", "cash credit / overdraft": r"cash credit|overdraft"}


def product_scope(text):
    """Product a clause is limited to (from its breadcrumb/text), or None for general lending rules."""
    import re
    for name, pat in PRODUCTS.items():
        if re.search(pat, text or "", re.I):
            return name
    return None


def product_mismatch(scope_text, question):
    """True if the rule is limited to a product the question is not about."""
    import re
    prod = product_scope(scope_text)
    return bool(prod) and not re.search(PRODUCTS[prod], question or "", re.I)
