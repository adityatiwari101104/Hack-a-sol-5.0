"""Capture run for the critical evals: every gold item (dev 50, test 30, fresh 34) through service.ask, with
instrumentation, in replay mode by default ($0). Saves everything the offline evals need:
  - the full /ask result + the grader's label (same grade() as run_eval.py)
  - per-stage wall time (plan, retrieve+evidence, rules, draft, verify, repair, ...)
  - every LLM call (name, model, tokens, cached?) -> cost per question at list price
  - every sentence handed to the verifier, with the exact inputs (pack, rules, facts) -> offline ablations

Usage:  LLM_MODE=replay .venv/bin/python eval/critical_capture.py [--sets dev,test,fresh] [--out NAME] [--gold FILE]
Output: eval/reports/critical/<NAME>.pkl.gz  (default NAME=capture)
"""
import gzip
import json
import os
import pickle
import sys
import time
from pathlib import Path

os.environ.setdefault("LLM_MODE", "replay")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
sys.path.insert(0, str(HERE))
from app import llm, service  # noqa: E402
from run_eval import grade  # noqa: E402

OUT = HERE / "reports" / "critical"
_cur = {}  # the item being run (one worker: no thread juggling)


def _timed(mod, name, label=None):
    fn = getattr(mod, name)

    def wrap(*a, **k):
        t = time.perf_counter()
        try:
            return fn(*a, **k)
        finally:
            if _cur:
                key = label or name
                if name == "draft" and k.get("feedback") is not None:
                    key = "repair_draft"
                if name == "_verify_all" and _cur.get("_n_verify", 0) >= 2:
                    key = "repair_verify"
                st = _cur.setdefault("stages", {})
                st[key] = st.get(key, 0.0) + (time.perf_counter() - t) * 1000
    setattr(mod, name, wrap)
    return fn


_orig_verify_all = service._verify_all


def _capture_verify_all(sentences, cards, pack, rules, qfacts, calc_facts, glossary, conflict_chunks):
    shown, blocked = _orig_verify_all(sentences, cards, pack, rules, qfacts, calc_facts, glossary, conflict_chunks)
    if _cur:
        attempt = _cur.get("_n_verify", 0) + 1
        _cur["_n_verify"] = attempt
        verdicts = {id(x): x for x in shown + blocked}
        _cur.setdefault("verify_calls", []).append({
            "attempt": attempt, "sentences": [dict(s) for s in sentences], "cards": cards, "pack": pack,
            "rules": rules, "qfacts": set(qfacts), "calc_facts": set(calc_facts), "glossary": glossary,
            "conflict_chunks": set(conflict_chunks),
            "results": [{k: x.get(k) for k in ("text", "verdict", "reason", "checks", "score", "type", "core", "cites")}
                        for x in shown + blocked]})
    return shown, blocked


_orig_structured = llm.structured


def _capture_structured(model, system, user, schema, name, reasoning_effort="low"):
    t = time.perf_counter()
    err = None
    try:
        out, meta = _orig_structured(model, system, user, schema, name, reasoning_effort)
        return out, meta
    except Exception as e:
        err = type(e).__name__
        meta = None
        raise
    finally:
        if _cur:
            _cur.setdefault("llm_calls", []).append({
                "name": name, "model": model, "ms": (time.perf_counter() - t) * 1000, "error": err,
                "cached": meta["cached"] if meta else None, "usage": meta["usage"] if meta else None,
                **({"user": user[:4000]} if os.environ.get("CAPTURE_PROMPTS") else {})})


def install():
    for n in ("understand", "build_evidence", "rule_findings", "draft", "run_calcs", "_conflicts_for"):
        _timed(service, n)
    service._verify_all = _capture_verify_all
    _timed(service, "_verify_all")
    llm.structured = _capture_structured


def load_items(sets, gold=None):
    items = []
    if gold:
        items = [json.loads(l) for l in Path(gold).read_text().splitlines() if l.strip()]
        for it in items:
            it.setdefault("split", Path(gold).stem)
        return items
    g = [json.loads(l) for l in (HERE / "gold.jsonl").read_text().splitlines() if l.strip()]
    f = [json.loads(l) for l in (HERE / "fresh_test.jsonl").read_text().splitlines() if l.strip()]
    for it in f:
        it["split"] = "fresh"
    return [i for i in g + f if i["split"] in sets]


def run(items, label=""):
    install()
    rows = []
    for n, it in enumerate(items, 1):
        it = dict(it)
        it["question"] = it.pop("q")
        _cur.clear()
        _cur["id"] = it["id"]
        t = time.perf_counter()
        try:
            r = service.ask(it["question"], it["as_of"], it["profile"],
                            **{k: it[k] for k in ("collection", "upload_ids", "history", "slots") if it.get(k)})
            err = None
        except Exception as e:
            err = f"{type(e).__name__}: {str(e)[:200]}"
            r = {"outcome": "ERROR", "sentences": [], "blocked": [], "missing": [], "conflicts": [], "faithfulness": {},
                 "latency_ms": 0, "error": err}
        wall = (time.perf_counter() - t) * 1000
        g = grade(it, r)
        rows.append({"item": it, "result": r, "grade": g, "error": err, "wall_ms": wall,
                     "stages": _cur.get("stages", {}), "llm_calls": _cur.get("llm_calls", []),
                     "verify_calls": _cur.get("verify_calls", [])})
        print(f"[{label}{n}/{len(items)}] {it['id']} {g['label']:<12} {r['outcome']:<8} {wall/1000:5.1f}s"
              + (f"  ERR {err}" if err else ""), flush=True)
    return rows


def main():
    args = sys.argv[1:]
    sets = args[args.index("--sets") + 1].split(",") if "--sets" in args else ["dev", "test", "fresh"]
    name = args[args.index("--out") + 1] if "--out" in args else "capture"
    gold = args[args.index("--gold") + 1] if "--gold" in args else None
    items = load_items(sets, gold)
    print(f"{len(items)} items, LLM_MODE={os.environ['LLM_MODE']}, ledger ${llm.spent():.4f}", flush=True)
    t0 = llm.spent()
    rows = run(items)
    OUT.mkdir(parents=True, exist_ok=True)
    with gzip.open(OUT / f"{name}.pkl.gz", "wb") as fh:
        pickle.dump({"rows": rows, "mode": os.environ["LLM_MODE"], "spend": llm.spent() - t0,
                     "ts": time.strftime("%Y-%m-%d %H:%M")}, fh)
    print(f"saved {OUT / (name + '.pkl.gz')}; spend this run ${llm.spent() - t0:.4f}; ledger ${llm.spent():.4f}")


if __name__ == "__main__":
    main()
