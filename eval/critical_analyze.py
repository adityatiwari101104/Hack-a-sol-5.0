"""Critical eval report ($0): reads the capture files and writes eval/reports/critical/summary.json + critical_evals.md.

Inputs (all in eval/reports/critical/):
  capture.pkl.gz         dev/test/fresh through service.ask (replay; items whose draft is not cached are ERROR rows)
  <live captures>.pkl.gz  e.g. devtest_live, redteam_live (merged: a live row replaces an ERROR row with the same id)
  retrieval.json, ablation.json, judge.json, support.json (optional)
Usage: .venv/bin/python eval/critical_analyze.py [capture names...]
"""
import gzip
import json
import math
import pickle
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
from app.service import is_refusal  # noqa: E402

OUT = HERE / "reports" / "critical"
ABSTAIN_TYPES = {"unanswerable_missing", "out_of_scope", "prompt_injection_in_pdf", "hindi_out_of_scope"}
LIST_PRICE = {"gpt-5.4-mini": (0.75, 4.50), "gpt-5.4-nano": (0.20, 1.25)}  # USD / 1M tokens, no margin


def wilson(k, n, z=1.96):
    if n == 0:
        return (None, None)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (round(c - h, 3), round(c + h, 3))


def pct(xs, q):
    xs = sorted(xs)
    if not xs:
        return None
    return xs[min(len(xs) - 1, int(round(q * (len(xs) - 1))))]


def load(names):
    rows = {}
    for n in names:
        p = OUT / f"{n}.pkl.gz"
        if not p.exists():
            continue
        with gzip.open(p, "rb") as fh:
            d = pickle.load(fh)
        for r in d["rows"]:
            r["source"], r["mode"] = n, d["mode"]
            key = r["item"]["id"]
            if key not in rows or (rows[key]["error"] and not r["error"]) or (not r["error"] and n != "capture"):
                rows[key] = r
    return list(rows.values())


def should_abstain(it):
    return it["type"] in ABSTAIN_TYPES or it["outcome"] == ["ABSTAIN"]


def cost_of(calls):
    c = 0.0
    for x in calls:
        if not x.get("usage"):
            continue
        pin, pout = next(v for k, v in LIST_PRICE.items() if x["model"].startswith(k))
        c += x["usage"]["prompt_tokens"] / 1e6 * pin + x["usage"]["completion_tokens"] / 1e6 * pout
    return c


def gold_match(c, cites):
    return any(c.get("doc_id") == d and (c.get("clause") or "").replace(" ", "").startswith(g) for d, g in cites)


def split_metrics(rows):
    ok = [r for r in rows if not r["error"]]
    n = len(ok)
    if not n:
        return {"n": 0, "n_error": len(rows)}
    lab = Counter(r["grade"]["label"] for r in ok)
    sa = [r for r in ok if should_abstain(r["item"])]
    ans = [r for r in ok if not should_abstain(r["item"]) and r["item"]["type"] != "false_premise"]
    pred = [r for r in ok if r["result"]["outcome"] == "ABSTAIN"]
    tp = sum(r["result"]["outcome"] == "ABSTAIN" for r in sa)
    P = tp / len(pred) if pred else None
    R = tp / len(sa) if sa else None
    # "effective" abstention: an answer whose every core sentence is a refusal counts as an abstention
    def eff(r):
        core = [s for s in r["result"]["sentences"] if s.get("core")]
        return r["result"]["outcome"] == "ABSTAIN" or (core and all(is_refusal(s["text"]) for s in core))
    epred = [r for r in ok if eff(r)]
    etp = sum(eff(r) for r in sa)
    # abstention as a correct outcome for unanswerable items (Accurate label), regardless of the ABSTAIN flag
    sa_ok = sum(r["grade"]["label"] == "Accurate" for r in sa)
    quotes = [c for r in ok for s in r["result"]["sentences"] for c in s.get("citations", []) if "eid" in c]
    rows_c = [r for r in ok if r["item"].get("cites") and r["result"]["outcome"] != "ABSTAIN"]
    cit_any = sum(any(gold_match(c, r["item"]["cites"]) for s in r["result"]["sentences"] for c in s.get("citations", []))
                  for r in rows_c)
    cit_rec = [len({i for i, (d, g) in enumerate(r["item"]["cites"]) for s in r["result"]["sentences"] for c in s.get("citations", [])
                    if c.get("doc_id") == d and (c.get("clause") or "").replace(" ", "").startswith(g)}) / len(r["item"]["cites"])
               for r in rows_c]
    gdocs = [(r, {d for d, _ in r["item"]["cites"]}) for r in rows_c]
    allc = [(c, docs) for r, docs in gdocs for s in r["result"]["sentences"] for c in s.get("citations", [])]
    f = [r["result"]["faithfulness"] for r in ok if r["result"].get("faithfulness", {}).get("draft_total")]
    lat = [r["wall_ms"] for r in ok]
    costs = [cost_of(r["llm_calls"]) for r in ok]
    return {
        "n": n, "n_error": len(rows) - n, "labels": dict(lab),
        "accurate_rate": round(lab["Accurate"] / n, 3), "accurate_ci95": wilson(lab["Accurate"], n),
        "hallucinated": lab["Hallucinated"],
        "abstain_should": len(sa), "abstain_pred": len(pred),
        "abstention_precision": round(P, 3) if P is not None else None,
        "abstention_recall": round(R, 3) if R is not None else None,
        "abstention_f1": round(2 * P * R / (P + R), 3) if P and R else None,
        "effective_abstention_precision": round(etp / len(epred), 3) if epred else None,
        "effective_abstention_recall": round(etp / len(sa), 3) if sa else None,
        "unanswerable_handled_correctly": f"{sa_ok}/{len(sa)}",
        "over_refusal": round(sum(r["result"]["outcome"] == "ABSTAIN" for r in ans) / len(ans), 3) if ans else None,
        "over_refusal_effective": round(sum(bool(eff(r)) for r in ans) / len(ans), 3) if ans else None,
        "quotes": len(quotes), "quotes_not_located": sum(not c.get("located") for c in quotes),
        "citation_hit_items": f"{cit_any}/{len(rows_c)}",
        "citation_recall_mean": round(statistics.mean(cit_rec), 3) if cit_rec else None,
        "citation_doc_precision": round(sum(c.get("doc_id") in d for c, d in allc) / len(allc), 3) if allc else None,
        "draft1_pass_rate": round(sum(x["draft_pass"] for x in f) / sum(x["draft_total"] for x in f), 3) if f else None,
        "pre_gate_pass_rate": round(sum(x.get("draft_pass", 0) + x.get("repair_pass", 0) for x in f) /
                                    sum(x["draft_total"] + x.get("repair_total", 0) for x in f), 3) if f else None,
        "repair_used": sum(bool(x.get("repair_used")) for x in f),
        "blocked_sentences": sum(x.get("blocked", 0) for x in f),
        "wall_p50_s": round(pct(lat, .5) / 1000, 2), "wall_p95_s": round(pct(lat, .95) / 1000, 2),
        "cost_mean_usd": round(statistics.mean(costs), 5), "cost_p95_usd": round(pct(costs, .95), 5),
        "by_type": {t: f"{sum(r['grade']['label'] == 'Accurate' for r in ok if r['item']['type'] == t)}/"
                       f"{sum(r['item']['type'] == t for r in ok)}" for t in sorted({r['item']['type'] for r in ok})},
    }


def contradiction(rows):
    ok = [r for r in rows if not r["error"] and r["item"]["split"] in ("dev", "test", "fresh")]
    # positive: a conflict is the expected answer; negative: CONFLICT is not an allowed outcome;
    # items where CONFLICT is allowed but not expected (e.g. "what fee does the agreement list?") are left out
    pos = [r for r in ok if r["item"]["type"] == "contradiction_true" or r["item"]["outcome"][0] == "CONFLICT"]
    neg = [r for r in ok if "CONFLICT" not in r["item"]["outcome"] and r not in pos]
    flag = lambda r: r["result"]["outcome"] == "CONFLICT" or bool(r["result"].get("conflicts"))  # noqa: E731
    tp, fp = sum(flag(r) for r in pos), sum(flag(r) for r in neg)
    fn = len(pos) - tp
    diff = [r for r in ok if r["item"]["type"] == "contradiction_different_condition"]
    return {"positives": len(pos), "negatives": len(neg), "tp": tp, "fp": fp, "fn": fn,
            "precision": round(tp / (tp + fp), 3) if tp + fp else None, "recall": round(tp / len(pos), 3) if pos else None,
            "answer_level_recall_incl_text": round(sum(flag(r) or r["grade"]["label"] == "Accurate" for r in pos) / len(pos), 3) if pos else None,
            "different_condition_flagged": f"{sum(flag(r) for r in diff)}/{len(diff)}",
            "false_positive_items": [r["item"]["id"] for r in neg if flag(r)]}


def risk_coverage(rows):
    """Selective risk vs coverage. Each item: answered (non-ABSTAIN) or not; 'correct' = Accurate label.
    Confidence signals ranked high->low; at each cut, items below are treated as abstentions."""
    ok = [r for r in rows if not r["error"] and r["item"]["split"] in ("dev", "test", "fresh")]
    out = {}
    sig = {
        "best_sim": lambda r: r["result"].get("best_sim") or 0.0,
        "draft_pass_rate": lambda r: (r["result"]["faithfulness"].get("draft_pass", 0) / r["result"]["faithfulness"]["draft_total"])
        if r["result"].get("faithfulness", {}).get("draft_total") else 0.0,
        "min_core_score": lambda r: min([s.get("score") or 1.0 for s in r["result"]["sentences"] if s.get("core")] or [0.0]),
    }
    answered = [r for r in ok if r["result"]["outcome"] != "ABSTAIN"]
    for name, f in sig.items():
        xs = sorted(answered, key=f, reverse=True)
        pts, area = [], 0.0
        for k in range(1, len(xs) + 1):
            cov = k / len(ok)
            risk = 1 - sum(x["grade"]["label"] == "Accurate" for x in xs[:k]) / k
            pts.append((round(cov, 3), round(risk, 3), round(f(xs[k - 1]), 3)))
            area += risk / len(ok)
        out[name] = {"aurc": round(area, 4), "points": pts[::max(1, len(pts) // 12)] + [pts[-1]]}
    # operating point and the retrieval threshold sweep (only upwards: lower thresholds would need new drafts)
    out["operating_point"] = {"coverage": round(len(answered) / len(ok), 3),
                              "selective_risk": round(1 - sum(r["grade"]["label"] == "Accurate" for r in answered) / len(answered), 3),
                              "n": len(ok)}
    sweep = []
    for tau in (0.55, 0.60, 0.65, 0.70, 0.75, 0.80):
        def outcome_ok(r):
            gated = (r["result"].get("best_sim") or 0) < tau
            if gated:
                return should_abstain(r["item"]) or "ABSTAIN" in r["item"]["outcome"]
            return r["grade"]["label"] == "Accurate"
        ans = [r for r in ok if r["result"]["outcome"] != "ABSTAIN" and (r["result"].get("best_sim") or 0) >= tau]
        sweep.append({"tau_retrieval": tau, "coverage": round(len(ans) / len(ok), 3),
                      "selective_accuracy": round(sum(r["grade"]["label"] == "Accurate" for r in ans) / len(ans), 3) if ans else None,
                      "overall_accuracy": round(sum(outcome_ok(r) for r in ok) / len(ok), 3)})
    out["tau_retrieval_sweep"] = sweep
    return out


def latency(rows):
    st = defaultdict(list)
    llm_ms = defaultdict(list)
    for r in rows:
        if r["error"]:
            continue
        for k, v in r["stages"].items():
            st[k].append(v)
        for c in r["llm_calls"]:
            if c.get("cached") is False:
                llm_ms[c["name"]].append(c["ms"])
        local = r["wall_ms"] - sum(c["ms"] for c in r["llm_calls"])
        st["local_total_excl_llm"].append(local)
        st["wall_total"].append(r["wall_ms"])
    f = lambda xs: {"n": len(xs), "p50_ms": round(pct(xs, .5)), "p95_ms": round(pct(xs, .95))}  # noqa: E731
    return {"stages": {k: f(v) for k, v in st.items()}, "live_llm_calls": {k: f(v) for k, v in llm_ms.items()}}


def cost(rows):
    per_q, by_name = [], defaultdict(float)
    for r in rows:
        if r["error"]:
            continue
        per_q.append(cost_of(r["llm_calls"]))
        for c in r["llm_calls"]:
            by_name[c["name"]] += cost_of([c])
    tot = sum(by_name.values())
    return {"n": len(per_q), "mean_usd": round(statistics.mean(per_q), 5), "p50_usd": round(pct(per_q, .5), 5),
            "p95_usd": round(pct(per_q, .95), 5), "share_by_call": {k: round(v / tot, 3) for k, v in by_name.items()},
            "note": "list price, no safety margin; replayed calls are priced from the usage recorded when they ran live"}


def main():
    names = sys.argv[1:] or ["capture", "devtest_live", "redteam_live"]
    rows = load(names)
    by_split = defaultdict(list)
    for r in rows:
        by_split[r["item"]["split"]].append(r)
    core = [r for r in rows if r["item"]["split"] in ("dev", "test", "fresh")]
    summ = {"splits": {s: split_metrics(v) for s, v in sorted(by_split.items())},
            "dev_test_fresh": split_metrics(core),
            "contradiction": contradiction(rows), "risk_coverage": risk_coverage(rows),
            "latency_replay": latency([r for r in rows if r["mode"] == "replay"]),
            "latency_live": latency([r for r in rows if r["mode"] == "live"]),
            "cost": cost(core), "sources": names}
    for extra in ("retrieval", "ablation", "judge", "support"):
        p = OUT / f"{extra}.json"
        if p.exists():
            d = json.loads(p.read_text())
            summ[extra] = d.get("summary", {k: v for k, v in d.items() if k not in ("per_item", "rows", "items")})
    (OUT / "summary.json").write_text(json.dumps(summ, indent=1, ensure_ascii=False))
    print(json.dumps(summ, indent=1, ensure_ascii=False)[:12000])
    # per-item table for hand review
    md = ["| id | split | type | label | outcome | expected | answer (shown sentences) |", "|---|---|---|---|---|---|---|"]
    for r in sorted(rows, key=lambda r: (r["item"]["split"], r["item"]["id"])):
        g = r["grade"]
        md.append(f"| {r['item']['id']} | {r['item']['split']} | {r['item']['type']} | {g['label']} | {r['result']['outcome']} | "
                  f"{'/'.join(r['item']['outcome'])} | {(g['answer'] or r.get('error') or '')[:300].replace('|', '/')} |")
    (OUT / "items.md").write_text("\n".join(md))


if __name__ == "__main__":
    main()
