"""Canary gate: runs the canary items in REPLAY mode (cached LLM responses, $0, deterministic) and enforces the
non-negotiables. Run: LLM_MODE=replay python -m pytest -q eval/test_gate.py   (cassettes come from a live eval run)."""
import json
import os
import sys
from pathlib import Path

import pytest

os.environ.setdefault("LLM_MODE", "replay")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))
sys.path.insert(0, str(HERE))
from app import llm, service  # noqa: E402
from run_eval import ABSTAIN_TYPES, grade  # noqa: E402

CANARIES = [json.loads(l) for l in (HERE / "gold.jsonl").read_text().splitlines() if l.strip() and '"canary": true' in l]
for c in CANARIES:
    c["question"] = c.pop("q")


@pytest.mark.parametrize("item", CANARIES, ids=[c["id"] for c in CANARIES])
def test_canary(item):
    try:
        r = service.ask(item["question"], item["as_of"], item["profile"])
    except llm.CacheMiss:
        pytest.skip("no cassette yet: run eval/run_eval.py live once")
    g = grade(item, r)
    assert g["fabricated"] == 0, "a shown quote was not found on its page"
    assert all(s["verdict"] in ("PASS", "CONTESTED") for s in r["sentences"]), "an unverified sentence was shown"
    assert not g["forbid_hit"], f"forbidden content shown: {g['forbid_hit']}"
    if item["type"] in ABSTAIN_TYPES:
        assert r["outcome"] in item["outcome"], f"should abstain, got {r['outcome']}"
    if item["type"] == "contradiction_different_condition":
        assert r["outcome"] != "CONFLICT", "different-condition pair flagged as a conflict"
    if item["type"] == "amendment_point_in_time":
        assert g["label"] == "Accurate", f"point-in-time canary failed: {g}"
