"""Interactive terminal Q&A over the corpus.  Run:  .venv/bin/python ask.py

Type a question and press Enter. Commands:
  /date 2025-09-15        set the as-of date (default 2026-11-23)
  /profile ucb_tier4      ucb_tier3 | ucb_tier4 | commercial_bank
  /debug                  toggle full verifier detail
  /quit                   exit
"""
import os
import readline  # noqa: F401  (arrow keys + history in input())
import sys
import warnings

os.environ.setdefault("TRANSFORMERS_VERBOSITY", "error")
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TQDM_DISABLE", "1")
warnings.filterwarnings("ignore")
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))
from app import service  # noqa: E402

B, D, G, Y, R, C, X = "\033[1m", "\033[2m", "\033[32m", "\033[33m", "\033[31m", "\033[36m", "\033[0m"
COLOR = {"ANSWER": G, "PARTIAL": Y, "CONFLICT": R, "ABSTAIN": C}
PROFILES = ("ucb_tier3", "ucb_tier4", "commercial_bank")


def render(r, debug):
    f = r["faithfulness"]
    print(f"\n{COLOR.get(r['outcome'], '')}{B}{r['outcome']}{X}  "
          f"{D}{service.faithfulness_line(f)} · {r['latency_ms']} ms · as of {r['as_of']} · {r['bank_profile']}{X}\n")
    if r.get("gate_reason"):
        print(f"  {D}{r['gate_reason']}{X}")
    retried = any(s.get("attempt") == 2 for s in r["sentences"] + r["blocked"])
    if retried:
        print(f"  {D}Draft 1 was rejected by the verifier; this is Draft 2 (one retry, same evidence, same checks).{X}")
    for s in r["sentences"]:
        print(f"  {s['text']}")
        for c in s["citations"]:
            quote = (c.get("text") or "").strip().replace("\n", " ")
            print(f"    {D}└ {c['doc_id']} p.{c['page']} {c.get('clause', '')} [{c['status']}]{X}"
                  + (f"  {D}\"{quote[:140]}{'…' if len(quote) > 140 else ''}\"{X}" if quote else ""))
        if debug:
            print(f"    {D}checks: {s.get('checks')}{X}")
    for c in r["calc"]:
        res = c['result'] if isinstance(c['result'], dict) else {}
        print(f"\n  {B}Calculation (code){X} {c['formula']} {c['inputs']} → {B}{res.get('display', c['result'])}{X}")
    for c in r["conflicts"][:4]:
        print(f"\n  {R}{B}CONFLICT{X} {c['subject']}: {c['a']['doc_id']} {c['a']['clause']} "
              f"({c['a']['permitted']} {c['a']['value'] or ''}) vs {c['b']['doc_id']} {c['b']['clause']} "
              f"({c['b']['permitted']} {c['b']['value'] or ''})")
    seen = set()
    for t in r["timeline"][:3]:
        if t["clause"] in seen:
            continue
        seen.add(t["clause"])
        print(f"\n  {B}Timeline{X} {t['clause']}: " + "  →  ".join(
            f"{v['valid_from']}..{v['valid_to'] or 'now'} {v['status']}" for v in t["versions"]))
    for m in r["missing"]:
        print(f"\n  {Y}Not found in the documents:{X} {m['slot']}")
    if r["blocked"]:
        print(f"\n  {D}{len(r['blocked'])} drafted sentence(s) withheld by the verifier"
              + (":" if debug else " (/debug to see)") + X)
        if debug:
            for s in r["blocked"]:
                print(f"    {D}✗ [Draft {s.get('attempt', 1)}] {s['text']}  — {s['reason']}{X}")
    if r.get("gate_reason"):
        print(f"\n  {D}gate: {r['gate_reason']}{X}")
    print()


def main():
    as_of, profile, debug = "2026-11-23", "ucb_tier3", False
    print(f"{B}Proof-or-Silence{X} — ask about the RBI + bank documents. /date, /profile, /debug, /quit")
    print(f"{D}First question loads the local models (30–60 s); later ones take ~5–10 s.{X}")
    while True:
        try:
            q = input(f"{C}[{as_of} · {profile}]{X} ❯ ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if not q:
            continue
        if q in ("/quit", "/exit", "/q"):
            return
        if q.startswith("/date"):
            as_of = q.split(maxsplit=1)[1] if " " in q else as_of
            continue
        if q.startswith("/profile"):
            p = q.split(maxsplit=1)[1] if " " in q else ""
            if p in PROFILES:
                profile = p
            else:
                print(f"  profiles: {', '.join(PROFILES)}")
            continue
        if q == "/debug":
            debug = not debug
            print(f"  debug {'on' if debug else 'off'}")
            continue
        try:
            render(service.ask(q, as_of, profile), debug)
        except Exception as e:  # keep the session alive (e.g. spend cap reached)
            print(f"  {R}error:{X} {type(e).__name__}: {e}\n")


if __name__ == "__main__":
    main()
