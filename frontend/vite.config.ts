import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// The UI talks to the FastAPI backend through this proxy, so the backend needs no CORS change.
// Start the API with:  cd backend && LLM_MODE=replay ../.venv/bin/uvicorn app.api:app --port 8000
const API = process.env.API_URL ?? 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), {
    // "Try the demo upload" fetches the demo circular from the repo (dev server only; nothing is copied).
    name: 'demo-files',
    configureServer(server) {
      server.middlewares.use('/demo-files/EUCB-circular-2026-07.pdf', async (_req, res) => {
        try {
          const buf = await readFile(fileURLToPath(new URL('../corpus/demo/upload/EUCB-circular-2026-07.pdf', import.meta.url)))
          res.setHeader('content-type', 'application/pdf')
          res.end(buf)
        } catch { res.statusCode = 404; res.end('demo file not found') }
      })
    },
  }],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, ''), timeout: 300_000, proxyTimeout: 300_000 },
    },
  },
})
