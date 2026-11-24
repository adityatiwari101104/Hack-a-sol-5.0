PY=.venv/bin/python
setup:      ; python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt && .venv/bin/python -m spacy download en_core_web_sm
manifest:   ; $(PY) corpus/tools/build_manifest.py ~/Downloads
synthetic:  ; $(PY) corpus/synthetic/build_pdfs.py
ingest:     ; cd backend && ../$(PY) -m app.pipeline --reset
serve:      ; cd backend && ../.venv/bin/uvicorn app.api:app --reload
test:       ; cd backend && ../$(PY) -m pytest -q tests
gate:       ; LLM_MODE=replay $(PY) -m pytest -q eval/test_gate.py
eval-dev:   ; $(PY) eval/run_eval.py dev
audit-reset: ; cd backend && ../$(PY) -m app.audit reset --yes
eval-test:  ; $(PY) eval/run_eval.py test && $(PY) eval/run_eval.py test --baseline
.PHONY: setup manifest synthetic ingest serve test gate eval-dev eval-test audit-reset
