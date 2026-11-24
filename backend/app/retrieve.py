"""Hybrid retrieval: BM25 (bm25s) + dense (sentence-transformers) fused with weighted RRF, then sentence-level
evidence selection inside the retrieved chunks, plus graph expansion (AMENDED_BY versions, REFERS_TO 1 hop)."""
import hashlib
import os
import json
import re
import threading

import bm25s
import numpy as np

from . import config, db, hindi

_lock = threading.RLock()  # re-entrant: a scoped index builds on the core index
_state = {}
SYNONYMS = {"foreclosure": "pre-payment prepayment foreclosure", "foreclose": "pre-payment prepayment foreclosure",
            "preclosure": "pre-payment prepayment", "prepay": "pre-payment prepayment", "penalty": "penal charges penalty",
            "kfs": "key facts statement kfs", "apr": "annual percentage rate apr", "emi": "equated monthly instalment emi"}
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "
RERANK = os.getenv("RERANK", "0") == "1"  # cross-encoder rerank; off unless it helps on the dev set
RERANK_MODEL = os.getenv("RERANK_MODEL", "BAAI/bge-reranker-base")


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


def ml_available():
    """bge-m3 is optional (2.2 GB): without it, Hindi rows are still found through their local English translation."""
    if "ml_ok" not in _state:
        try:
            from huggingface_hub import try_to_load_from_cache
            if not any(isinstance(try_to_load_from_cache(config.EMBED_MODEL_ML, f), str)
                       for f in ("model.safetensors", "pytorch_model.bin")):
                raise FileNotFoundError("weights not downloaded")  # never block a request on a 2.2 GB download
            model_ml()
            _state["ml_ok"] = True
        except Exception as e:  # not downloaded / offline
            print(f"multilingual embedder unavailable ({type(e).__name__}); Hindi search uses the translation bridge")
            _state["ml_ok"] = False
    return _state["ml_ok"]


def hi_view(r):
    """Search text of a Hindi row: the verbatim Hindi plus its local English translation (opus-mt), so an English
    question reaches a Hindi clause through BM25 and bge-small. Search only: quotes are always the verbatim Hindi."""
    from .verify import mt_hi_en
    return f"{_doc_text(r)} | EN: {mt_hi_en(r['text'])}"


def model_ml():
    """Multilingual embedder (bge-m3) for Hindi documents only: an English question finds a Hindi clause and vice
    versa. The English corpus keeps config.EMBED_MODEL, so its recorded answers replay unchanged."""
    with _model_lock:
        if "ml" not in _state:
            from sentence_transformers import SentenceTransformer
            _state["ml"] = SentenceTransformer(config.EMBED_MODEL_ML)
        return _state["ml"]


def embed_ml(texts):
    m = model_ml()
    with _embed_lock:
        return m.encode([hindi.normalize(t) for t in texts], normalize_embeddings=True, batch_size=16,
                        show_progress_bar=False)


def is_hi_row(r):
    return hindi.is_hindi(r["text"])


def embed(texts, query=False):
    m = model()
    if query:
        texts = [QUERY_PREFIX + t for t in texts]
    with _embed_lock:
        return m.encode(texts, normalize_embeddings=True, batch_size=64, show_progress_bar=False)


CORE = "core"  # the shipped banking corpus: every document that is not an upload and not in another collection


def core_doc_ids(con=None, collection="banking"):
    """Documents searched by default for a collection: the shipped corpus (source 'corpus') and pre-loaded demo sets
    (source 'demo'). Uploads join a search only when the request names them."""
    con = con or db.connect()
    return {r[0] for r in con.execute("SELECT doc_id FROM documents WHERE COALESCE(source,'corpus') IN ('corpus','demo') "
                                      "AND COALESCE(collection,'banking')=?", (collection,))}


def scope_key(doc_ids):
    return CORE if doc_ids is None else "|".join(sorted(doc_ids))


def _doc_text(r):
    return f"{r['breadcrumb']}. {r.get('prefix') or ''} {r['context'] or ''} {r['text']}"


def _rows_for(con, doc_ids):
    q = ("SELECT c.*, d.title, d.doc_type, d.issuer, d.is_synthetic FROM chunks c JOIN documents d USING(doc_id) "
         "WHERE c.kind != 'footnote'")
    if doc_ids is None:  # the banking corpus exactly as shipped (same rows, same order, same cached embeddings)
        q += " AND COALESCE(d.source,'corpus')='corpus' AND COALESCE(d.collection,'banking')='banking'"
        return [dict(r) for r in con.execute(q + " ORDER BY c.doc_id, c.seq")]
    marks = ",".join("?" * len(doc_ids))
    return [dict(r) for r in con.execute(q + f" AND c.doc_id IN ({marks}) ORDER BY c.doc_id, c.seq", sorted(doc_ids))]


def _doc_embeddings(doc_id, rows):
    """Embeddings for one added document, cached per document: adding an upload embeds only its own chunks. A Hindi
    document is embedded through hi_view (Hindi + local English translation)."""
    hi = bool(rows) and sum(map(is_hi_row, rows)) >= max(1, len(rows) // 3)
    sig = hashlib.sha256(("|".join(r["chunk_id"] + str(len(r["text"])) + str(len(r.get("prefix") or "")) for r in rows)
                          + config.EMBED_MODEL + ("|hi_view" if hi else "")).encode()).hexdigest()[:16]
    cache = config.DATA / "emb_docs" / f"{doc_id}_{sig}.npy"
    if cache.exists():
        return np.load(cache)
    view = hi_view if hi else _doc_text
    emb = embed([view(r) for r in rows]) if rows else np.zeros((0, 384), dtype=np.float32)
    cache.parent.mkdir(parents=True, exist_ok=True)
    np.save(cache, emb)
    return emb


def _doc_embeddings_ml(doc_id, rows):
    sig = hashlib.sha256(("|".join(r["chunk_id"] + str(len(r["text"])) + str(len(r.get("prefix") or "")) for r in rows)
                          + config.EMBED_MODEL_ML).encode()).hexdigest()[:16]
    cache = config.DATA / "emb_docs" / f"{doc_id}_ml_{sig}.npy"
    if cache.exists():
        return np.load(cache)
    emb = embed_ml([_doc_text(r) for r in rows])
    cache.parent.mkdir(parents=True, exist_ok=True)
    np.save(cache, emb)
    return emb


def index(doc_ids=None):
    """Search index for a scope. doc_ids=None: the shipped banking corpus (unchanged, so recorded answers replay).
    Otherwise: the core corpus rows the scope shares reuse the core embeddings, and each other document is embedded once
    and cached on its own (incremental: an upload never re-embeds the corpus). BM25 is rebuilt over the scope (fast)."""
    with _lock:
        key = scope_key(doc_ids)
        con = db.connect()
        if key == CORE:
            rows = _rows_for(con, None)
            sig = hashlib.sha256(("|".join(r["chunk_id"] + str(len(r["text"])) + str(len(r.get("prefix") or "")) for r in rows)
                                  + config.EMBED_MODEL).encode()).hexdigest()[:16]
            if _state.get("sig") == sig:
                return _state
            cache = config.DATA / f"emb_{sig}.npy"
            emb = np.load(cache) if cache.exists() else embed([_doc_text(r) for r in rows])
            if not cache.exists():
                np.save(cache, emb)
            bm = bm25s.BM25()
            bm.index([tokenize(_doc_text(r)) for r in rows], show_progress=False)
            _state.update({"sig": sig, "rows": rows, "emb": emb, "bm25": bm, "by_id": {r["chunk_id"]: i for i, r in enumerate(rows)}})
            return _state
        rows = _rows_for(con, doc_ids)
        sig = hashlib.sha256(("|".join(r["chunk_id"] + str(len(r["text"])) + str(len(r.get("prefix") or "")) for r in rows)
                              ).encode()).hexdigest()[:16]
        cached = _scoped.get(key)
        if cached and cached["sig"] == sig:
            return cached
        core = index(None)
        core_pos = core["by_id"]
        parts, order = [], []
        by_doc = {}
        for r in rows:
            by_doc.setdefault(r["doc_id"], []).append(r)
        for doc_id, rs in by_doc.items():
            if all(r["chunk_id"] in core_pos for r in rs):
                parts.append(core["emb"][[core_pos[r["chunk_id"]] for r in rs]])
            else:
                parts.append(_doc_embeddings(doc_id, rs))
            order.extend(rs)
        emb = np.vstack(parts) if parts else np.zeros((0, 384), dtype=np.float32)
        # Hindi documents in scope: multilingual dense ranking over their rows, Devanagari-aware BM25 for the scope
        hi_docs = [d for d, rs in by_doc.items() if sum(map(is_hi_row, rs)) >= max(1, len(rs) // 3)]
        hi_idx = [i for i, r in enumerate(order) if r["doc_id"] in hi_docs]
        tok = hindi.tokenize if hi_docs else tokenize
        bm = bm25s.BM25()
        bm.index([tok(hi_view(r) if r["doc_id"] in hi_docs else _doc_text(r)) for r in order] or [["empty"]],
                 show_progress=False)
        st = {"sig": sig, "rows": order, "emb": emb, "bm25": bm, "by_id": {r["chunk_id"]: i for i, r in enumerate(order)},
              "hi": hi_idx, "tok": tok, "hi_ids": {order[i]["chunk_id"] for i in hi_idx}}
        if hi_docs and ml_available():
            st["emb_ml"] = np.vstack([_doc_embeddings_ml(d, by_doc[d]) for d in hi_docs])
        if len(_scoped) > 16:
            _scoped.clear()
        _scoped[key] = st
        return st


_scoped = {}


def forget(doc_id=None):
    """Drop cached scoped indexes (after an upload is added or deleted)."""
    _scoped.clear()
    if doc_id:
        for f in (config.DATA / "emb_docs").glob(f"{doc_id}_*.npy") if (config.DATA / "emb_docs").exists() else []:
            f.unlink()


def search(query, k=config.TOP_K_CHUNKS, w_bm25=1.0, w_dense=1.0, rrf_k=60, doc_filter=None, doc_ids=None):
    st = index(doc_ids)
    if not st["rows"]:
        return []
    rows, emb = st["rows"], st["emb"]
    q = expand_query(query)
    qv = embed([q], query=True)[0]
    dense = emb @ qv
    dense_rank = np.argsort(-dense)
    docs, scores = st["bm25"].retrieve([st.get("tok", tokenize)(q) or ["empty"]], k=len(rows), show_progress=False)
    fused = {}
    for r, i in enumerate(docs[0][:200]):
        fused[int(i)] = fused.get(int(i), 0) + w_bm25 / (rrf_k + r + 1)
    for r, i in enumerate(dense_rank[:200]):
        fused[int(i)] = fused.get(int(i), 0) + w_dense / (rrf_k + r + 1)
    if st.get("hi") and "emb_ml" in st:  # Hindi rows: their own multilingual ranking (bge-small cannot read Devanagari)
        dense = dense.copy()
        ml = st["emb_ml"] @ embed_ml([q])[0]
        for r, j in enumerate(np.argsort(-ml)):
            i = st["hi"][int(j)]
            fused[i] = fused.get(i, 0) + w_dense / (rrf_k + r + 1)
            dense[i] = float(ml[j]) + config.ML_SIM_SHIFT
    order = sorted(fused, key=fused.get, reverse=True)
    if doc_filter:
        order = [i for i in order if doc_filter(rows[i])]
    if RERANK:
        pool = order[:30]
        scores = reranker().predict([(query, f"{rows[i]['breadcrumb']}. {rows[i]['text'][:1500]}") for i in pool])
        order = [i for _, i in sorted(zip(scores, pool), key=lambda x: -x[0])]
    return [{"row": rows[i], "rrf": fused.get(i, 0), "dense": float(dense[i])} for i in order[:k]]


def reranker():
    with _model_lock:
        if "rr" not in _state:
            from sentence_transformers import CrossEncoder
            _state["rr"] = CrossEncoder(RERANK_MODEL)
        return _state["rr"]


HI_SPLIT = re.compile(r"(?<=[।;:])\s+(?=\S)")


def split_sentences(text, hindi_doc=False):
    if hindi_doc:  # a Hindi document: sentences end with a danda (।); '.' after a clause number is not an end
        spans, start = [], 0
        for m in HI_SPLIT.finditer(text):
            if m.start() - start > 25:
                spans.append((start, m.start()))
                start = m.end()
        spans.append((start, len(text)))
        return [(s, e) for s, e in spans if len(text[s:e].strip()) > 3]
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


def rows_by_ids(ids, doc_ids=None):
    st = index(doc_ids)
    return [st["rows"][st["by_id"][i]] for i in ids if i in st["by_id"]]
