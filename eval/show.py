"""Pretty-print /ask results for quick inspection: python eval/show.py "question" [as_of] [profile]"""
import json
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parents[1] / "backend"))
from app import service  # noqa: E402


def show(r):
    print(f"\n=== {r['question']}\n    as_of={r['as_of']} profile={r['bank_profile']}  OUTCOME={r['outcome']}  "
          f"faithfulness draft {r['faithfulness'].get('draft_pass','-')}/{r['faithfulness'].get('draft_total','-')}  "
          f"latency {r['latency_ms']}ms  case={r['plan']['case']}")
    for s in r["sentences"]:
        cites = ", ".join(f"{c.get('eid', c.get('rid'))}:{c['doc_id']} p.{c['page']} {c.get('clause','')} [{c['status']}]" for c in s["citations"])
        print(f"  [Draft {s.get('attempt', 1)} {s['verdict']}] {s['text']}\n           <- {cites}  {s.get('checks')}")
    for s in r["blocked"]:
        print(f"  [Draft {s.get('attempt', 1)} BLOCKED] {s['text']}\n           reason: {s['reason']}")
    for m in r["missing"]:
        print(f"  MISSING: {m['slot']} | searched: {m['searched'][:160]}")
    for c in r["conflicts"][:4]:
        print(f"  CONFLICT[{c['verdict']}] {c['subject']}: {c['a']['doc_id']} {c['a']['clause']} ({c['a']['permitted']} {c['a']['value'] or ''}) vs {c['b']['doc_id']} {c['b']['clause']} ({c['b']['permitted']} {c['b']['value'] or ''})")
    for c in r["calc"]:
        print(f"  CALC {c['formula']} {c['inputs']} -> {c['result']} {c['problems']}")
    for t in r["timeline"][:2]:
        print("  TIMELINE", t["clause"], [(v["valid_from"], v["valid_to"], v["status"]) for v in t["versions"]])
    if r.get("gate_reason"):
        print("  GATE:", r["gate_reason"])


if __name__ == "__main__":
    show(service.ask(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "2026-11-23",
                     sys.argv[3] if len(sys.argv) > 3 else "ucb_tier3"))
