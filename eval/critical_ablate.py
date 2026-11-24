"""Offline verifier ablation. Re-runs the per-sentence verifier ladder on the sentences captured by
critical_capture.py, with one check switched off at a time, and counts verdict flips against the full ladder.

The ladder below mirrors backend/app/verify.verify_sentence step by step (same helpers, same thresholds), with
switches. A sanity run with nothing switched off must reproduce the captured verdicts exactly; the script prints
the agreement and refuses to report ablations if it is below 100%.

LLM judge: replay-only by default; a sentence that reaches the judge with inputs it never saw gets
"judge unavailable" (fail closed), which is what the live system does when the judge is down. With --live-judge
the nano judge may be called live (only claim_judge; every other call stays replay-only).

Usage: .venv/bin/python eval/critical_ablate.py [capture-name] [--live-judge]
Output: eval/reports/critical/ablation.json and ablation_flips.md
"""
import contextvars
import gzip
import json
import os
import pickle
import sys
from collections import Counter
from pathlib import Path

os.environ.setdefault("LLM_MODE", "replay")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
sys.path.insert(0, str(HERE))
from app import config, llm, service, verify  # noqa: E402
from app.normalize import facts, implied  # noqa: E402

OUT = HERE / "reports" / "critical"

# the same (premise, claim) pairs recur across conditions: score each once
import functools  # noqa: E402
verify.entail = functools.lru_cache(maxsize=None)(verify.entail)
verify.minicheck = functools.lru_cache(maxsize=None)(verify.minicheck)

CONDITIONS = {
    "full": set(),
    "no_status": {"status"},
    "no_quote_locate": {"quote"},
    "no_numbers": {"numbers", "binding"},
    "no_numeric_binding": {"binding"},
    "no_coverage_lexical_shortcut": {"coverage"},
    "no_hhem": {"hhem"},
    "no_minicheck": {"minicheck"},
    "no_llm_judge": {"judge"},
    "no_rule_fallback": {"rule"},
    "no_entailment_tier": {"entail"},
    "entailment_only": {"status", "quote", "numbers", "binding"},
    "hhem_only_tier_e": {"coverage", "minicheck", "judge", "rule"},
    "judge_only_tier_e": {"coverage", "hhem", "minicheck", "rule", "judge_unlimited"},
}

_budget = contextvars.ContextVar("abl_budget", default=3)


def ladder(sent, pack, rules, question_facts, calc_facts, glossary, conflict_chunks, off):
    tau = config.TAU_ENTAIL
    cites = sent.get("cites") or []
    if not cites:
        return "BLOCKED", "no citation", "a"
    if [c for c in cites if c not in pack and c not in rules]:
        return "BLOCKED", "unknown id", "a"
    evs = [pack[c] for c in cites if c in pack]
    rls = [rules[c] for c in cites if c in rules]
    if "status" not in off and sent.get("type") in ("fact", "calc") and evs:
        stale = [e for e in evs if e["status"] != "IN_FORCE"]
        if stale:
            return "BLOCKED", f"cites {stale[0]['status']} text as a current fact", "b"
        bad_app = [e for e in evs if e.get("applicability") == "DOES_NOT_APPLY"]
        if bad_app and len(bad_app) == len(evs) and not rls and not verify.NONAPP.search(sent["text"]):
            return "BLOCKED", "cites only rules that do not apply", "b"
    if "quote" not in off:
        for e in evs:
            if not e.get("located"):
                return "BLOCKED", "quote not located", "c"
    premise = " ".join(((e.get("context") or "") + " " + e["text"]).strip() for e in evs)
    rule_text = " ".join(r["statement"] for r in rls)
    if "numbers" not in off:
        allowed = implied(facts(premise) | facts(rule_text) | question_facts | calc_facts)
        allowed |= {"rs:" + f[2:] for f in allowed if f.startswith("n:") and f[2:].replace(".", "").isdigit()}
        missing = {f for f in facts(sent["text"]) if f not in allowed and not f.startswith("n:")}
        missing |= {f for f in facts(sent["text"]) if f.startswith("n:") and f not in allowed and
                    not any(f[2:] in x for x in allowed)}
        if missing:
            return "BLOCKED", f"number/date not in evidence {sorted(missing)}", "d"
    if "binding" not in off:
        own = {f for f in facts(sent["text"]) if not f.startswith(("n:", "year:"))} - question_facts - calc_facts
        for f in own:
            homes = [e for e in evs if f in implied(facts((e.get("context") or "") + " " + e["text"])) |
                     {"rs:" + x[2:] for x in facts(e["text"]) if x.startswith("n:")}]
            if homes and not rls and max(verify.coverage(sent["text"], (h.get("context") or "") + " " + h["text"] + " " +
                                                         h.get("breadcrumb", "")) for h in homes) < 0.3:
                return "BLOCKED", f"{f} not bound to the claim's subject", "d2"
    if sent.get("type") == "conflict" and len(evs) >= 2 and {e["chunk_id"] for e in evs} <= set(conflict_chunks):
        return "PASS", "e:triage", "e"
    if "entail" in off:
        return "PASS", "entailment off", "e"
    full_premise = (premise + " " + rule_text).strip()
    meta_words = " ".join(e.get("title", "") + " " + e.get("breadcrumb", "") for e in evs)
    cov = verify.coverage(sent["text"], full_premise + " " + meta_words)
    matched = [((e.get("context") or "") + " " + e["text"]) for e in evs
               if verify.coverage(sent["text"], (e.get("context") or "") + " " + e["text"] + " " + e.get("title", "")) >= 0.4] + \
              [r["statement"] for r in rls]
    if sent.get("type") == "calc" and facts(sent["text"]) & calc_facts and cov >= 0.5:
        return "PASS", "e:calc", "e"
    if "coverage" not in off:
        if cov >= 0.8 and verify._neg_agrees(sent["text"], " ".join(matched) or full_premise):
            return "PASS", f"e:coverage {cov:.2f}", "e"
        lex = verify.lexical_support(sent["text"], full_premise)
        if lex >= config.TAU_LEXICAL:
            return "PASS", f"e:lexical {lex:.0f}", "e"
    h = verify.expand_abbr(sent["text"], glossary)
    p = verify.expand_abbr(full_premise, glossary)
    score = mc = 0.0
    if "hhem" not in off:
        score = verify.entail(p[-3000:], h)
        if score >= tau:
            return "PASS", f"e:hhem {score:.2f}", "e"
    if "minicheck" not in off:
        mc = verify.minicheck(p[-2500:], h)
        if mc >= 0.5:
            return "PASS", f"e:minicheck {mc:.2f}", "e"
    if "judge" not in off:
        unlimited = "judge_unlimited" in off
        if unlimited or _budget.get() > 0:
            ok, why = verify.llm_judge(p, h)
        else:
            ok, why = False, "budget"
        _budget.set(_budget.get() - 1)
        if ok:
            return "PASS", "e:llm-judge", "e"
        if why == "judge unavailable":
            unavailable.append(1)
    if "rule" not in off and rls and all(r["verified"] for r in rls) and verify._polarity_ok(sent["text"], rls):
        return "PASS", "e:rule", "e"
    return "BLOCKED", f"not supported (hhem {score:.2f}, minicheck {mc:.2f})", "e"


unavailable = []


def run_condition(rows, off):
    out = []
    for r in rows:
        _budget.set(3)
        for vc in r["verify_calls"]:
            for s in vc["sentences"]:
                s2 = dict(s, text=service.fill_calc(s["text"], vc["cards"]))
                if "[calculation blocked]" in s2["text"]:
                    v, why, step = "BLOCKED", "calculation inputs not verified", "calc"
                else:
                    v, why, step = ladder(s2, vc["pack"], vc["rules"], vc["qfacts"], vc["calc_facts"], vc["glossary"],
                                          vc["conflict_chunks"], off)
                out.append({"id": r["item"]["id"], "split": r["item"]["split"], "type": r["item"]["type"],
                            "attempt": vc["attempt"], "text": s2["text"], "stype": s.get("type"), "core": s.get("core"),
                            "cites": s.get("cites"), "verdict": v, "why": why, "step": step,
                            "evidence": " || ".join(f"{c}: [{vc['pack'][c]['status']}] {vc['pack'][c]['text'][:300]}"
                                                    for c in (s.get("cites") or []) if c in vc["pack"])
                            + " || ".join(f"{c}: {vc['rules'][c]['statement'][:300]}" for c in (s.get("cites") or [])
                                          if c in vc["rules"])})
    return out


def main():
    args = sys.argv[1:]
    names = [a for a in args if not a.startswith("--")] or ["capture", "devtest_live", "redteam_live"]
    if "--live-judge" in args:
        orig = llm.structured

        def guarded(model, system, user, schema, nm, reasoning_effort="low"):
            prev = config.LLM_MODE
            config.LLM_MODE = "live" if nm == "claim_judge" else "replay"
            try:
                return orig(model, system, user, schema, nm, reasoning_effort)
            finally:
                config.LLM_MODE = prev
        llm.structured = guarded
    from critical_analyze import load
    rows = [r for r in load(names) if not r["error"]]
    start = llm.spent()
    # sanity: the mirrored ladder must reproduce the captured verdicts
    full = run_condition(rows, set())
    cap = []
    for r in rows:
        for vc in r["verify_calls"]:
            by_text = Counter((x["text"], "PASS" if x["verdict"] in ("PASS", "CONTESTED") else "BLOCKED") for x in vc["results"])
            cap.append(by_text)
    agree = total = 0
    i = 0
    for r in rows:
        for vc in r["verify_calls"]:
            want = Counter((x["text"], "PASS" if x["verdict"] in ("PASS", "CONTESTED") else "BLOCKED") for x in vc["results"])
            got = Counter((x["text"], x["verdict"]) for x in full[i:i + len(vc["sentences"])])
            i += len(vc["sentences"])
            agree += sum((want & got).values())
            total += sum(want.values())
    print(f"sanity: mirrored ladder reproduces {agree}/{total} captured verdicts")
    res = {"sanity_agree": agree, "sanity_total": total, "n_sentences": len(full), "conditions": {}}
    flips_md = ["# Ablation flips (sentences whose verdict changes when one check is off)", "",
                "BLOCKED→PASS rows are sentences the full verifier withheld that would have reached the user.", ""]
    base = [x["verdict"] for x in full]
    for cname, off in CONDITIONS.items():
        unavailable.clear()
        got = full if cname == "full" else run_condition(rows, off)
        b2p = [g for b, g in zip(base, got) if b == "BLOCKED" and g["verdict"] == "PASS"]
        p2b = [g for b, g in zip(base, got) if b == "PASS" and g["verdict"] == "BLOCKED"]
        items_b2p = sorted({g["id"] for g in b2p})
        res["conditions"][cname] = {
            "off": sorted(off), "pass": sum(g["verdict"] == "PASS" for g in got), "blocked": sum(g["verdict"] == "BLOCKED" for g in got),
            "blocked_to_pass": len(b2p), "pass_to_blocked": len(p2b), "items_with_new_pass": len(items_b2p),
            "judge_unavailable": len(unavailable),
            "b2p_by_step_in_full": dict(Counter(f["step"] for f, g in zip(full, got) if f["verdict"] == "BLOCKED" and g["verdict"] == "PASS")),
        }
        print(cname, res["conditions"][cname], flush=True)
        if cname != "full" and (b2p or p2b):
            flips_md += [f"## {cname} (off: {', '.join(sorted(off))}) — {len(b2p)} BLOCKED→PASS, {len(p2b)} PASS→BLOCKED", ""]
            for g in b2p[:60]:
                f = next(x for x in full if x["id"] == g["id"] and x["text"] == g["text"])
                flips_md.append(f"- **{g['id']}** a{g['attempt']} [{g['stype']}] \"{g['text'][:260]}\"  \n  full verdict: {f['why'][:140]}  \n  evidence: {g['evidence'][:420]}")
            for g in p2b[:25]:
                flips_md.append(f"- (PASS→BLOCKED) **{g['id']}** \"{g['text'][:200]}\" → {g['why'][:120]}")
            flips_md.append("")
    res["blocked_in_full_by_step"] = dict(Counter(x["step"] for x in full if x["verdict"] == "BLOCKED"))
    res["pass_in_full_by_rule"] = dict(Counter(x["why"].split(" ")[0] for x in full if x["verdict"] == "PASS"))
    try:
        res["spend"] = llm.spent() - start
    except Exception:
        res["spend"] = None
    (OUT / "ablation.json").write_text(json.dumps(res, indent=1))
    (OUT / "ablation_flips.md").write_text("\n".join(flips_md))
    (OUT / "ablation_full_sentences.json").write_text(json.dumps(full, indent=0, ensure_ascii=False))
    print(json.dumps({k: v for k, v in res.items() if k != "conditions"}, indent=1))


if __name__ == "__main__":
    main()
