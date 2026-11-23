"""Per-sentence verifier. Cheapest checks first; the first failure decides.

(a) cited ids exist   (b) status allowed (fact must cite IN_FORCE; chain may cite SUPERSEDED)
(c) every quote located on its page (bboxes)   (d) every number/date in the sentence is in the evidence,
the user's question, the code-verified rule findings or a calculation   (e) entailment: near-verbatim (lexical)
or HHEM >= tau, with abbreviations expanded from the glossary   (f) conflict lookup -> CONTESTED
"""
import re
import threading

from rapidfuzz import fuzz

from . import config
from .normalize import facts, implied, norm_text

_nli = {}
_nli_lock = threading.RLock()


def nli_model():
    with _nli_lock:
        if "m" not in _nli:
            from transformers import AutoModelForSequenceClassification
            m = AutoModelForSequenceClassification.from_pretrained(config.NLI_MODEL, trust_remote_code=True,
                                                                   revision=config.NLI_REVISION)
            m.eval()
            _nli["m"] = m
        return _nli["m"]


def entail(premise, hypothesis):
    with _nli_lock:
        return float(nli_model().predict([(premise, hypothesis)])[0])


def expand_abbr(text, glossary):
    for abbr, full in glossary.items():
        text = re.sub(rf"\b{re.escape(abbr)}\b", f"{full} ({abbr})", text)
    return text


NONAPP = re.compile(r"does not (apply|cover|match)|not covered|outside|cannot (confirm|determine)|neither|only (applies|covers)|stated to apply", re.I)
NEG = re.compile(r"\b(not|no|nil|cannot|can't|prohibit|prohibited|shall not|may not|without|neither|nor)\b", re.I)


STOP = set("""a an the of to in on for and or by with is are be been was were shall may must can this that these those it its
as at from under per any all such which who whom whose than then there their our your we you i not no nor also only both
says say states state stated said rbi reserve bank directions direction evidence document documents according under
applicable rule rules para paragraph clause section yes case loan loans""".split())


def _content(text):
    return {w for w in re.findall(r"[a-z0-9₹]+", norm_text(text).lower().replace("-", " ")) if w not in STOP and len(w) > 1}


def coverage(sentence, premise):
    """Share of the sentence's content words found in the cited evidence (deterministic, inspectable)."""
    s, p = _content(sentence), _content(premise)
    return len(s & p) / len(s) if len(s) >= 3 else 0.0


def _neg_agrees(sentence, premise):
    """Strict: a positive sentence over a premise that contains a negation (or vice versa) goes to the NLI model."""
    return bool(NEG.search(sentence)) == bool(NEG.search(premise))


def lexical_support(sentence, premise):
    """Near-verbatim restatement of the evidence (token-set similarity), with matching negation."""
    a, b = norm_text(sentence).lower(), norm_text(premise).lower()
    if bool(NEG.search(a)) != bool(NEG.search(b)) and not NEG.search(b):
        return 0.0
    return fuzz.token_set_ratio(a, b)


def verify_sentence(sent, pack, rules, question_facts, calc_facts, glossary, tau=None, conflict_chunks=frozenset()):
    """sent: {text, cites, type}; pack: eid -> evidence; rules: rid -> rule finding.
    Returns dict(verdict, reason, checks, score)."""
    tau = config.TAU_ENTAIL if tau is None else tau
    cites = sent.get("cites") or []
    checks = []
    if not cites:
        return {"verdict": "BLOCKED", "reason": "no citation", "checks": checks}
    unknown = [c for c in cites if c not in pack and c not in rules]
    if unknown:
        return {"verdict": "BLOCKED", "reason": f"cites unknown id(s) {unknown}", "checks": checks}
    checks.append("a:ids")
    evs = [pack[c] for c in cites if c in pack]
    rls = [rules[c] for c in cites if c in rules]
    if sent.get("type") in ("fact", "calc") and evs:
        stale = [e for e in evs if e["status"] != "IN_FORCE"]
        if stale:
            return {"verdict": "BLOCKED", "reason": f"states a current fact but cites text that is {stale[0]['status']} on the "
                                                    f"as-of date ({stale[0]['eid']}); only type=chain may cite it", "checks": checks}
        bad_app = [e for e in evs if e.get("applicability") == "DOES_NOT_APPLY"]
        if bad_app and len(bad_app) == len(evs) and not rls and not NONAPP.search(sent["text"]):
            return {"verdict": "BLOCKED", "reason": "cites only rules that do not apply to this case", "checks": checks}
    checks.append("b:status")
    for e in evs:
        if not e.get("located"):
            return {"verdict": "BLOCKED", "reason": f"{e['eid']}: quote not located on page", "checks": checks}
    checks.append("c:quote")
    premise = " ".join(((e.get("context") or "") + " " + e["text"]).strip() for e in evs)
    rule_text = " ".join(r["statement"] for r in rls)
    allowed = implied(facts(premise) | facts(rule_text) | question_facts | calc_facts)
    missing = {f for f in facts(sent["text"]) if f not in allowed and not f.startswith("n:")}
    missing |= {f for f in facts(sent["text"]) if f.startswith("n:") and f not in allowed and
                not any(f[2:] in x for x in allowed)}
    if missing:
        return {"verdict": "BLOCKED", "reason": f"number/date not in cited evidence: {sorted(missing)}", "checks": checks}
    checks.append("d:numbers")
    own = {f for f in facts(sent["text"]) if not f.startswith(("n:", "year:"))} - question_facts - calc_facts
    for f in own:  # numeric binding: the number must sit in the same evidence unit that supports the claim
        homes = [e for e in evs if f in implied(facts((e.get("context") or "") + " " + e["text"]))]
        if homes and not rls and max(coverage(sent["text"], (h.get("context") or "") + " " + h["text"] + " " +
                                              h.get("breadcrumb", "")) for h in homes) < 0.45:
            return {"verdict": "BLOCKED", "reason": f"{f} appears in the evidence but not next to the claim's subject",
                    "checks": checks}
    if sent.get("type") == "conflict" and len(evs) >= 2 and {e["chunk_id"] for e in evs} <= set(conflict_chunks):
        checks.append("e:triage")  # the conflict itself was established by code-side tuple triage on located quotes
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": 1.0}
    full_premise = (premise + " " + rule_text).strip()
    meta_words = " ".join(e.get("title", "") + " " + e.get("breadcrumb", "") for e in evs)
    cov = coverage(sent["text"], full_premise + " " + meta_words)
    matched = [((e.get("context") or "") + " " + e["text"]) for e in evs
               if coverage(sent["text"], (e.get("context") or "") + " " + e["text"] + " " + e.get("title", "")) >= 0.4] + \
              [r["statement"] for r in rls]
    if sent.get("type") == "calc" and facts(sent["text"]) & calc_facts and cov >= 0.5:
        checks.append(f"e:calc {cov:.2f}")  # the number was computed by calc.py from cited inputs
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": round(cov, 3)}
    if cov >= 0.8 and _neg_agrees(sent["text"], " ".join(matched) or full_premise):
        checks.append(f"e:coverage {cov:.2f}")
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": round(cov, 3)}
    lex = lexical_support(sent["text"], full_premise)
    if lex >= config.TAU_LEXICAL:
        checks.append(f"e:lexical {lex:.0f}")
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": round(lex / 100, 3)}
    h = expand_abbr(sent["text"], glossary)
    p = expand_abbr(full_premise, glossary)
    score = entail(p[-3000:], h)
    if score >= tau:
        checks.append(f"e:hhem {score:.2f}")
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": round(score, 3)}
    if rls and all(r["verified"] for r in rls) and _polarity_ok(sent["text"], rls):
        checks.append(f"e:rule ({score:.2f})")
        return {"verdict": "PASS", "reason": "", "checks": checks, "score": round(score, 3)}
    return {"verdict": "BLOCKED", "reason": f"not supported by cited evidence (HHEM {score:.2f} < {tau})",
            "checks": checks, "score": round(score, 3)}


def _polarity_ok(text, rules):
    neg = bool(NEG.search(text))
    return all((r["permitted"] == "no") == neg for r in rules if r["permitted"] in ("yes", "no"))
