"""Run the gold set through /ask (in-process) and grade it.

Usage:  python eval/run_eval.py [dev|test|canary|all] [--baseline] [--workers N]
Writes eval/reports/<split>[_baseline].json and .md, and appends to eval/reports/eval_runs.csv.
Labels follow the Stanford legal-RAG study: Accurate / Incomplete / Hallucinated.
"""
import csv
import json
import math
import re
import statistics
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
from app import llm, service  # noqa: E402

ABSTAIN_TYPES = {"unanswerable_missing", "out_of_scope", "prompt_injection_in_pdf"}


def shown_text(r):
    return " ".join(s["text"] for s in r["sentences"])


def cited(r):
    out = []
    for s in r["sentences"]:
        for c in s["citations"]:
            out.append((c["doc_id"], c.get("clause") or ""))
    for c in r.get("conflicts", []):
        out += [(c["a"]["doc_id"], c["a"]["clause"]), (c["b"]["doc_id"], c["b"]["clause"])]
    return out


def grade(item, r):
    text = shown_text(r)
    outcome_ok = r["outcome"] in item["outcome"]
    facts_ok = all(re.search(f, text, re.I) for f in item["facts"]) if item["facts"] else True
    forbid_hit = [f for f in item["forbid"] if re.search(f, text, re.I)]
    cites = cited(r)
    cite_ok = (not item["cites"]) or any(d == gd and (not gc or c.replace(" ", "").startswith(gc)) for d, c in cites
                                         for gd, gc in item["cites"])
    quotes = [c for s in r["sentences"] for c in s["citations"] if "eid" in c]
    fabricated = [c for c in quotes if not c.get("located")]
    missing_ok = (not item.get("expect_missing")) or bool(r["missing"])
    conflict_flag = r["outcome"] == "CONFLICT" or bool(r.get("conflicts"))
    if item.get("no_conflict"):
        outcome_ok = outcome_ok and r["outcome"] != "CONFLICT"
    if fabricated or forbid_hit:
        label = "Hallucinated"
    elif outcome_ok and facts_ok and cite_ok and missing_ok:
        label = "Accurate"
    else:
        label = "Incomplete"
    return {"id": item["id"], "type": item["type"], "split": item["split"], "canary": item.get("canary", False),
            "label": label, "outcome": r["outcome"], "expected": item["outcome"], "outcome_ok": outcome_ok,
            "facts_ok": facts_ok, "cite_ok": cite_ok, "missing_ok": missing_ok, "forbid_hit": forbid_hit,
            "n_quotes": len(quotes), "fabricated": len(fabricated), "conflict_flag": conflict_flag,
            "faith": r["faithfulness"], "latency_ms": r["latency_ms"], "question": item["question"] if "question" in item else item["q"],
            "answer": text[:600], "blocked": [(b["text"][:160], b.get("reason")) for b in r["blocked"]][:4],
            "query_id": r.get("query_id")}


def wilson(k, n, z=1.96):
    if n == 0:
        return (0, 0)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (round(c - h, 3), round(c + h, 3))


def summarize(rows, spend):
    n = len(rows)
    lab = {k: sum(r["label"] == k for r in rows) for k in ("Accurate", "Incomplete", "Hallucinated")}
    should_abstain = [r for r in rows if r["type"] in ABSTAIN_TYPES]
    answerable = [r for r in rows if r["type"] not in ABSTAIN_TYPES and r["type"] != "false_premise"]
    pred_abs = [r for r in rows if r["outcome"] == "ABSTAIN"]
    tp = sum(r["outcome"] == "ABSTAIN" for r in should_abstain)
    pit = [r for r in rows if r["type"] == "amendment_point_in_time"]
    conf = [r for r in rows if r["type"] == "contradiction_true"]
    diff = [r for r in rows if r["type"] == "contradiction_different_condition"]
    calc_items = [r for r in rows if r["type"] == "calculation"]
    quotes = sum(r["n_quotes"] for r in rows)
    fab = sum(r["fabricated"] for r in rows)
    lat = sorted(r["latency_ms"] for r in rows)
    faith = [r["faith"]["draft_pass"] / r["faith"]["draft_total"] for r in rows if r["faith"].get("draft_total")]
    return {
        "n": n, "labels": lab, "accurate_rate": round(lab["Accurate"] / n, 3), "accurate_ci95": wilson(lab["Accurate"], n),
        "hallucinated_rate": round(lab["Hallucinated"] / n, 3),
        "fabricated_quotes": fab, "quotes_checked": quotes,
        "fabricated_upper95_rule_of_three": round(3 / quotes, 3) if quotes and fab == 0 else None,
        "abstention_precision": round(tp / len(pred_abs), 3) if pred_abs else None,
        "abstention_recall": round(tp / len(should_abstain), 3) if should_abstain else None,
        "answer_rate": round(sum(r["outcome"] != "ABSTAIN" for r in rows) / n, 3),
        "over_refusal": round(sum(r["outcome"] == "ABSTAIN" for r in answerable) / len(answerable), 3) if answerable else None,
        "point_in_time_accuracy": round(sum(r["label"] == "Accurate" for r in pit) / len(pit), 3) if pit else None,
        "contradiction_recall": round(sum(r["conflict_flag"] or r["facts_ok"] and r["outcome_ok"] for r in conf) / len(conf), 3) if conf else None,
        "different_condition_false_positive": round(sum(r["outcome"] == "CONFLICT" for r in diff) / len(diff), 3) if diff else None,
        "calc_accuracy": round(sum(r["facts_ok"] for r in calc_items) / len(calc_items), 3) if calc_items else None,
        "draft_faithfulness_mean": round(statistics.mean(faith), 3) if faith else None,
        "latency_p50_ms": lat[len(lat) // 2] if lat else None, "latency_p95_ms": lat[min(len(lat) - 1, int(len(lat) * 0.95))] if lat else None,
        "spend_usd_upper_bound": round(spend, 4), "cost_per_query_usd_upper_bound": round(spend / n, 5) if n else None,
        "by_type": {t: {k: sum(r["label"] == k and r["type"] == t for r in rows) for k in ("Accurate", "Incomplete", "Hallucinated")}
                    for t in sorted({r["type"] for r in rows})},
    }


def main():
    args = sys.argv[1:]
    split = next((a for a in args if a in ("dev", "test", "canary", "all")), "dev")
    workers = int(args[args.index("--workers") + 1]) if "--workers" in args else 4
    baseline = "--baseline" in args
    items = [json.loads(l) for l in (HERE / "gold.jsonl").read_text().splitlines() if l.strip()]
    for it in items:
        it["question"] = it.pop("q")
    if split == "canary":
        items = [i for i in items if i.get("canary")]
    elif split != "all":
        items = [i for i in items if i["split"] == split]
    if baseline:
        from baseline_naive_rag import ask as ask_fn
    else:
        ask_fn = service.ask
    start_spend = llm.spent()
    t0 = time.time()

    def one(it):
        try:
            r = ask_fn(it["question"], it["as_of"], it["profile"])
        except llm.BudgetExceeded:
            raise
        except Exception as e:  # a crash is graded as Incomplete, never silently dropped
            r = {"outcome": "ERROR", "sentences": [], "blocked": [], "missing": [], "conflicts": [],
                 "faithfulness": {}, "latency_ms": 0, "error": repr(e)[:200]}
        return grade(it, r)

    with ThreadPoolExecutor(workers) as ex:
        rows = list(ex.map(one, items))
    summ = summarize(rows, llm.spent() - start_spend)
    name = f"{split}{'_baseline' if baseline else ''}"
    out = HERE / "reports"
    out.mkdir(exist_ok=True)
    (out / f"{name}.json").write_text(json.dumps({"summary": summ, "rows": rows}, indent=1, ensure_ascii=False))
    md = [f"# Eval: {name} ({datetime.now():%Y-%m-%d %H:%M})", "", "```", json.dumps(summ, indent=1), "```", "",
          "| id | type | label | outcome | expected | facts | cites | answer |", "|---|---|---|---|---|---|---|---|"]
    for r in rows:
        md.append(f"| {r['id']} | {r['type']} | {r['label']} | {r['outcome']} | {'/'.join(r['expected'])} | "
                  f"{'✓' if r['facts_ok'] else '✗'} | {'✓' if r['cite_ok'] else '✗'} | {r['answer'][:140].replace('|', '/')} |")
    (out / f"{name}.md").write_text("\n".join(md))
    new = not (out / "eval_runs.csv").exists()
    with (out / "eval_runs.csv").open("a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["ts", "run", "n", "accurate", "incomplete", "hallucinated", "fabricated", "quotes", "abst_p", "abst_r",
                        "over_refusal", "pit_acc", "diffcond_fp", "spend"])
        L = summ["labels"]
        w.writerow([datetime.now().isoformat(timespec="seconds"), name, summ["n"], L["Accurate"], L["Incomplete"], L["Hallucinated"],
                    summ["fabricated_quotes"], summ["quotes_checked"], summ["abstention_precision"], summ["abstention_recall"],
                    summ["over_refusal"], summ["point_in_time_accuracy"], summ["different_condition_false_positive"],
                    summ["spend_usd_upper_bound"]])
    print(json.dumps(summ, indent=1))
    for r in rows:
        if r["label"] != "Accurate":
            print(f"- {r['id']} {r['type']} {r['label']}: outcome {r['outcome']} (want {r['expected']}) facts={r['facts_ok']} "
                  f"cites={r['cite_ok']} forbid={r['forbid_hit']} :: {r['answer'][:200]}")
    print(f"elapsed {time.time() - t0:.0f}s; total ledger ${llm.spent():.3f}")


if __name__ == "__main__":
    main()
