"""Retrieval A/B without LLM drafting: is a gold (doc, clause) in the evidence pack? Reranker on vs off.
Uses cached query plans (LLM_MODE=replay)."""
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("LLM_MODE", "replay")
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app import config, retrieve, service  # noqa: E402

items = [json.loads(l) for l in (Path(__file__).with_name("gold.jsonl")).read_text().splitlines() if l.strip()]
items = [i for i in items if i["split"] == "dev" and i["cites"]]


def hit(pack, cites):
    return any(e["doc_id"] == d and e["clause"].replace(" ", "").startswith(c) for e in pack.values() for d, c in cites)


def run(rerank):
    retrieve.RERANK = rerank
    h = 0
    for it in items:
        plan, _ = service.understand(it["q"])
        pack, _, _ = service.build_evidence(plan, it["q"], __import__("datetime").date.fromisoformat(it["as_of"]),
                                            config.BANK_PROFILES[it["profile"]])
        h += hit(pack, it["cites"])
    return h, len(items)


if __name__ == "__main__":
    for rr in (False, True):
        print("rerank" if rr else "no rerank", run(rr))
