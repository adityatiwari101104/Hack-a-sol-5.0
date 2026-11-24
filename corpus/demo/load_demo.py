#!/usr/bin/env python3
"""Load the demo sets through the same upload pipeline a user's PDF goes through.

    python corpus/demo/load_demo.py insurance        # pre-load the fictional insurance set (collection 'insurance',
                                                     # source 'demo': searchable with collection=insurance, not deletable)
    python corpus/demo/load_demo.py record-upload    # ingest the demo circular once (records the model calls, so the
                                                     # live demo upload replays at $0), print its report, then delete it
Run live once (LLM_MODE=live, SPEND_CAP_USD set); afterwards replay is enough."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "backend"))
from app import llm, uploads  # noqa: E402

INSURANCE = [("INS-POLICY", "insurance/policy.pdf", "Suraksha Health Insurance Policy Wording (FICTIONAL)", "2025-04-01"),
             ("INS-ENDORSE-1", "insurance/endorsement-1.pdf",
              "Endorsement No. 1 to the Suraksha Health Insurance Policy Wording (FICTIONAL)", "2026-04-01"),
             ("INS-FAQ", "insurance/claim-faq.pdf", "Suraksha Health Claim FAQ (FICTIONAL)", "2026-05-01")]
UPLOAD = HERE / "upload" / "EUCB-circular-2026-07.pdf"


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else ""
    t0 = llm.spent()
    if what == "insurance":
        from app import db
        for doc_id, *_ in reversed(INSURANCE):  # reload cleanly (demo documents are otherwise protected from delete)
            if db.connect().execute("SELECT 1 FROM documents WHERE doc_id=?", (doc_id,)).fetchone():
                uploads.delete(doc_id, actor="demo-loader", allow_demo=True)
        for doc_id, rel, title, eff in INSURANCE:
            st = uploads.submit((HERE / rel).read_bytes(), Path(rel).name, doc_kind="other", title=title,
                                effective_date=eff, collection="insurance", source="demo", doc_id=doc_id, wait=True)
            st = uploads.status(st["doc_id"]) or st
            print(doc_id, st.get("status"), json.dumps(st.get("counts")), st.get("warnings"))
            if st.get("report"):
                print("  links:", [(l["type"], l["target"]) for l in st["report"].get("links", [])])
                print("  conflicts:", [(c["verdict"], c["subject"], c["a"]["value"], c["b"]["value"])
                                       for c in st["report"].get("conflicts", [])][:6])
    elif what == "record-upload":
        st = uploads.submit(UPLOAD.read_bytes(), UPLOAD.name, doc_kind="bank_policy", wait=True)
        st = uploads.status(st["doc_id"]) or st
        print(json.dumps({k: st.get(k) for k in ("doc_id", "status", "counts", "warnings")}, indent=1))
        for c in (st.get("report") or {}).get("conflicts", []):
            print(" ", c["verdict"], c["subject"], "|", c["a"]["title"], c["a"]["clause"], "vs", c["b"]["title"], c["b"]["clause"])
        if "--keep" not in sys.argv:
            print(uploads.delete(st["doc_id"], actor="demo-recorder"))
    else:
        print(__doc__)
        return
    print(f"spend this run ${llm.spent() - t0:.4f}; ledger ${llm.spent():.4f}")


if __name__ == "__main__":
    main()
