"""Deterministic loan arithmetic with Decimal. The LLM only extracts cited inputs; it never computes."""
from decimal import ROUND_HALF_UP, Decimal, getcontext

getcontext().prec = 40
PAISE = Decimal("0.01")


def D(x):
    return Decimal(str(x).replace(",", "").replace("₹", "").replace("%", "").strip())


def emi(principal, annual_rate_pct, months):
    """EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annual/1200. Returns unrounded Decimal."""
    p, r, n = D(principal), D(annual_rate_pct) / Decimal(1200), int(D(months))
    if r == 0:
        return p / n
    f = (1 + r) ** n
    return p * r * f / (f - 1)


def money(x):
    return Decimal(x).quantize(PAISE, rounding=ROUND_HALF_UP)


def apr_irr(net_disbursed, instalment, months, periods_per_year=12):
    """Annualised rate i·12 solving net_disbursed = Σ instalment/(1+i)^t (RBI KFS Annex B method). Percent, Decimal."""
    nd, inst, n = D(net_disbursed), D(instalment), int(D(months))
    lo, hi = Decimal(0), Decimal(1)
    for _ in range(200):
        mid = (lo + hi) / 2
        pv = sum(inst / (1 + mid) ** t for t in range(1, n + 1))
        lo, hi = (mid, hi) if pv > nd else (lo, mid)
    return (lo + hi) / 2 * periods_per_year * 100


def total_interest(principal, annual_rate_pct, months):
    return emi(principal, annual_rate_pct, months) * int(D(months)) - D(principal)


def prepay_charge(amount, rate_pct):
    return D(amount) * D(rate_pct) / 100


FORMULAS = {
    "EMI": (["principal", "annual_rate_pct", "months"], lambda a: money(emi(**a)), "P·r·(1+r)^n / ((1+r)^n − 1), r = annual rate / 1200"),
    "TOTAL_INTEREST": (["principal", "annual_rate_pct", "months"], lambda a: money(total_interest(**a)), "EMI × n − P"),
    "APR_IRR": (["net_disbursed", "instalment", "months"], lambda a: apr_irr(**a).quantize(PAISE, rounding=ROUND_HALF_UP),
                "solve net disbursed = Σ EMI/(1+i)^t; APR = 12·i"),
    "PREPAY_CHARGE": (["amount", "rate_pct"], lambda a: money(prepay_charge(**a)), "amount × rate / 100"),
}


def run(formula, inputs):
    """inputs: {name: value}. Returns {value, display, formula_text} or raises ValueError."""
    if formula not in FORMULAS:
        raise ValueError(f"formula {formula} not whitelisted")
    names, fn, text = FORMULAS[formula]
    missing = [n for n in names if n not in inputs]
    if missing:
        raise ValueError(f"missing inputs {missing}")
    value = fn({n: inputs[n] for n in names})
    display = f"{value}%" if formula == "APR_IRR" else f"₹{value:,.2f}"
    return {"value": str(value), "display": display, "formula_text": text}
