"""Hybrid retrieval: BM25 (bm25s) + dense (sentence-transformers) fused with weighted RRF, then sentence-level
evidence selection inside the retrieved chunks, plus graph expansion (AMENDED_BY versions, REFERS_TO 1 hop)."""
import hashlib
import json
import re
import threading

import bm25s
import numpy as np

from . import config, db

_lock = threading.Lock()
_state = {}
SYNONYMS = {"foreclosure": "pre-payment prepayment foreclosure", "foreclose": "pre-payment prepayment foreclosure",
            "preclosure": "pre-payment prepayment", "prepay": "pre-payment prepayment", "penalty": "penal charges penalty",
            "kfs": "key facts statement kfs", "apr": "annual percentage rate apr", "emi": "equated monthly instalment emi"}
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


def tokenize(text):
    t = text.lower().replace("₹", " rs ").replace("pre-payment", "prepayment").replace("pre- payment", "prepayment")
    t = t.replace("co-operative", "cooperative").replace("fore-closure", "foreclosure")
    return re.findall(r"[a-z]+|\d+(?:\.\d+)?", t)


def expand_query(q):
    extra = [v for k, v in SYNONYMS.items() if re.search(rf"\b{k}", q, re.I)]
    return q + (" " + " ".join(extra) if extra else "")


_model_lock = threading.Lock()


def model():
    with _model_lock:  # parallel first calls must not load the model twice
        if "model" not in _state:
            from sentence_transformers import SentenceTransformer
            _state["model"] = SentenceTransformer(config.EMBED_MODEL)
        return _state["model"]


_embed_lock = threading.Lock()


def embed(texts, query=False):
    m = model()
    if query:
        texts = [QUERY_PREFIX + t for t in texts]
    with _embed_lock:
        return m.encode(texts, normalize_embeddings=True, batch_size=64, show_progress_bar=False)


def index():
    with _lock:
        con = db.connect()
        rows = [dict(r) for r in con.execute(
            "SELECT c.*, d.title, d.doc_type, d.issuer, d.is_synthetic FROM chunks c JOIN documents d USING(doc_id) "
            "WHERE c.kind != 'footnote' ORDER BY c.doc_id, c.seq")]
        sig = hashlib.sha256(("|".join(r["chunk_id"] + str(len(r["text"])) for r in rows) + config.EMBED_MODEL).encode()).hexdigest()[:16]
        if _state.get("sig") == sig:
            return _state
        docs = [f"{r['breadcrumb']}. {r['context'] or ''} {r['text']}" for r in rows]
        cache = config.DATA / f"emb_{sig}.npy"
        emb = np.load(cache) if cache.exists() else embed(docs)
        if not cache.exists():
            np.save(cache, emb)
        bm = bm25s.BM25()
        bm.index([tokenize(d) for d in docs], show_progress=False)
        _state.update({"sig": sig, "rows": rows, "emb": emb, "bm25": bm, "by_id": {r["chunk_id"]: i for i, r in enumerate(rows)}})
        return _state


def search(query, k=config.TOP_K_CHUNKS, w_bm25=1.0, w_dense=1.0, rrf_k=60, doc_filter=None):
    st = index()
    rows, emb = st["rows"], st["emb"]
    q = expand_query(query)
    qv = embed([q], query=True)[0]
    dense = emb @ qv
    dense_rank = np.argsort(-dense)
    docs, scores = st["bm25"].retrieve([tokenize(q)], k=len(rows), show_progress=False)
    fused = {}
    for r, i in enumerate(docs[0][:200]):
        fused[int(i)] = fused.get(int(i), 0) + w_bm25 / (rrf_k + r + 1)
    for r, i in enumerate(dense_rank[:200]):
        fused[int(i)] = fused.get(int(i), 0) + w_dense / (rrf_k + r + 1)
    order = sorted(fused, key=fused.get, reverse=True)
    if doc_filter:
        order = [i for i in order if doc_filter(rows[i])]
    return [{"row": rows[i], "rrf": fused[i], "dense": float(dense[i])} for i in order[:k]]


def split_sentences(text):
    spans, start = [], 0
    for m in re.finditer(r"(?<=[.;:])\s+(?=(?:\((?:[ivx]{1,5}|\d{1,2}|[a-h])\)\s)|[A-Z“\"(])", text):
        if m.start() - start > 25:
            spans.append((start, m.start()))
            start = m.end()
    spans.append((start, len(text)))
    return [(s, e) for s, e in spans if len(text[s:e].strip()) > 3]


def graph_expand(chunk_ids, cap=6):
    """REFERS_TO one hop (e.g. 'paragraph 261(1)'), and every version of the same clause (amendment chain)."""
    con = db.connect()
    extra = []
    for cid in chunk_ids:
        for r in con.execute("SELECT dst FROM edges WHERE type='REFERS_TO' AND src=?", (cid,)):
            if r["dst"] not in chunk_ids and r["dst"] not in extra:
                extra.append(r["dst"])
    return extra[:cap]


def rows_by_ids(ids):
    st = index()
    return [st["rows"][st["by_id"][i]] for i in ids if i in st["by_id"]]
