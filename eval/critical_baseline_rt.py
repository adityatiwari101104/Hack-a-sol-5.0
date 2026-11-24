"""Plain-RAG baseline (eval/baseline_naive_rag.py) on the red-team + Hindi sets, graded with the same grader.
Usage: SPEND_CAP_USD=5.50 .venv/bin/python eval/critical_baseline_rt.py  -> eval/reports/critical/baseline_rt.json"""
import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
sys.path.insert(0, str(HERE))
from app import llm  # noqa: E402
from baseline_naive_rag import ask  # noqa: E402
from run_eval import grade  # noqa: E402

items = [json.loads(l) for f in ("redteam.jsonl", "hindi.jsonl") for l in (HERE / f).read_text().splitlines() if l.strip()]
start, rows = llm.spent(), []
for it in items:
    it = dict(it, question=it.pop("q"))
    r = ask(it["question"])
    g = grade(it, r)
    rows.append(g)
    print(it["id"], g["label"], g["forbid_hit"], g["answer"][:160], flush=True)
summ = {s: dict(Counter(r["label"] for r in rows if r["split"] == s)) for s in ("redteam", "hindi")}
summ["fabricated_quotes"] = sum(r["fabricated"] for r in rows)
summ["quotes"] = sum(r["n_quotes"] for r in rows)
summ["spend"] = round(llm.spent() - start, 4)
(HERE / "reports" / "critical" / "baseline_rt.json").write_text(json.dumps({"summary": summ, "rows": rows}, indent=1, ensure_ascii=False))
print(json.dumps(summ))
