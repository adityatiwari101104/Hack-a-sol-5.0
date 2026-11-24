"""Retrieval metrics on the gold sets ($0: query plans come from the cassettes, retrieval is local).

For every item with gold citations (doc_id, clause prefix): rank chunks for the main (English) query with
hybrid (BM25 + bge-small, RRF k=60), BM25-only and dense-only, and report hit@k, recall@k, precision@k and MRR.
Also "multi-query candidate recall": the union of top-8 over the plan's queries, which is what the system uses
before graph expansion and sentence selection.

Usage: LLM_MODE=replay .venv/bin/python eval/critical_retrieval.py  -> eval/reports/critical/retrieval.json
"""
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("LLM_MODE", "replay")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
sys.path.insert(0, str(HERE))
from app import config, retrieve, service  # noqa: E402
from critical_capture import load_items  # noqa: E402

KS = (1, 3, 5, 8, 20, 50)
MODES = {"hybrid": (1.0, 1.0), "bm25": (1.0, 0.0), "dense": (0.0, 1.0)}


def match(row, cites):
    return [i for i, (d, c) in enumerate(cites) if row["doc_id"] == d and (row["clause_key"] or "").replace(" ", "").startswith(c)]


def main():
    items = [i for i in load_items(["dev", "test", "fresh"]) if i.get("cites")]
    per = {m: [] for m in MODES}
    multi = []
    for it in items:
        try:
            plan, _ = service.understand(it["q"])
        except Exception as e:
            print("plan miss", it["id"], type(e).__name__)
            continue
        cites = [tuple(c) for c in it["cites"]]
        for m, (wb, wd) in MODES.items():
            hits = retrieve.search(plan["english_question"], k=50, w_bm25=wb, w_dense=wd)
            ranks = [match(h["row"], cites) for h in hits]
            first = next((n + 1 for n, r in enumerate(ranks) if r), None)
            rec = {"id": it["id"], "split": it["split"], "type": it["type"], "first_rank": first}
            for k in KS:
                found = {i for r in ranks[:k] for i in r}
                rec[f"hit@{k}"] = int(bool(found))
                rec[f"recall@{k}"] = len(found) / len(cites)
                rec[f"precision@{k}"] = sum(bool(r) for r in ranks[:k]) / k
            per[m].append(rec)
        queries = [plan["english_question"]] + plan["sub_queries"][:3]
        union = {}
        for q in queries:
            for h in retrieve.search(q, k=config.TOP_K_CHUNKS):
                union[h["row"]["chunk_id"]] = h["row"]
        found = {i for r in union.values() for i in match(r, cites)}
        multi.append({"id": it["id"], "split": it["split"], "n_queries": len(queries), "n_cand": len(union),
                      "hit": int(bool(found)), "recall": len(found) / len(cites)})
    summ = {}
    for m, rows in per.items():
        n = len(rows)
        s = {"n": n, "MRR@50": round(sum(1 / r["first_rank"] for r in rows if r["first_rank"]) / n, 3)}
        for k in KS:
            for met in ("hit", "recall", "precision"):
                s[f"{met}@{k}"] = round(sum(r[f"{met}@{k}"] for r in rows) / n, 3)
        s["by_split_hit@8"] = {sp: f"{sum(r['hit@8'] for r in rows if r['split'] == sp)}/{sum(r['split'] == sp for r in rows)}"
                               for sp in ("dev", "test", "fresh")}
        summ[m] = s
    summ["multi_query_union_top8"] = {"n": len(multi), "hit": round(sum(r["hit"] for r in multi) / len(multi), 3),
                                      "recall": round(sum(r["recall"] for r in multi) / len(multi), 3),
                                      "mean_candidates": round(sum(r["n_cand"] for r in multi) / len(multi), 1)}
    out = HERE / "reports" / "critical"
    out.mkdir(parents=True, exist_ok=True)
    (out / "retrieval.json").write_text(json.dumps({"summary": summ, "per_item": per, "multi": multi}, indent=1))
    print(json.dumps(summ, indent=1))


if __name__ == "__main__":
    main()
