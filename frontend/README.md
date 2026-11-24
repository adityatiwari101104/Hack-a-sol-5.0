# DocuHelp UI

Vite + React + TypeScript. react-pdf 11 renders the evidence viewer. IBM Plex fonts are bundled through @fontsource.

**One command** (API + UI together; Ctrl+C stops both). Two flavours, which can run side by side:

```bash
cd frontend && npm install && npm run dev:all      # REPLAY: UI on http://localhost:5173, API on :8000, $0
```

```bash
cd frontend && npm run dev:live                    # LIVE: UI on http://localhost:5174, API on :8001
```

| | `dev:all` (replay) | `dev:live` |
|---|---|---|
| Recorded questions | answered from `eval/cassettes`, $0 | still answered from the cassettes, $0 (cache-first) |
| New questions, other dates | "not recorded" card | call the model and spend |
| Spend cap | none needed | `SPEND_CAP_USD` (default 5.50), enforced by the server; the top bar shows "Live · $x of $y" |
| Audit-tamper demo | on (`DEV_TAMPER=1`) | off (`DEV_TAMPER=0`) |
| Ports | API 8000, UI 5173 | API 8001, UI 5174 (`API_PORT`, `UI_PORT` override) |

Use replay for rehearsals, tests and screenshot sweeps (they never spend); use live only to take a judge's new question.

The API loads its local models first (about 15 s). Until then the UI shows "Connecting to the backend…". If the API isn't running, the UI shows a banner with the command to start it and a Retry button.

Or start them separately:

```bash
# 1. API in replay mode ($0; DEV_TAMPER=1 turns on the live audit-tamper demo)
cd backend && LLM_MODE=replay DEV_TAMPER=1 ../.venv/bin/uvicorn app.api:app --port 8000
# 2. UI (Vite proxies /api → http://127.0.0.1:8000, so no backend change is needed)
cd frontend && npm install && npm run dev      # http://localhost:5173
```

- **Rehearsed questions** (in the composer) lists all 80 recorded questions. Each one is set to its recorded date and profile, so it replays from the cassettes.
- A question that was not recorded, or a recorded question at a new date, returns a calm "not recorded" card, never an error page.
- Design rationale, with the research reference behind each screen, is in [DESIGN.md](DESIGN.md). Screenshots are in `screenshots/`.
