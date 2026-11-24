#!/usr/bin/env node
// One command for the demo: starts the API and the Vite dev server together. Ctrl+C stops both.
//
//   npm run dev:all   replay API on :8000 + UI on :5173. $0: every answer comes from eval/cassettes; a question that
//                     was not recorded gets a calm "not recorded" card. DEV_TAMPER=1 (audit-tamper demo) by default.
//   npm run dev:live  live API on :8001 + UI on :5174. Recorded questions still come free from the cassettes
//                     (cache-first); only new questions call the model and spend. SPEND_CAP_USD (default 5.50) is
//                     enforced by the server. DEV_TAMPER=0. The two stacks can run side by side.
//
// Uses the backend exactly as documented (no backend code is changed). Env: API_PORT, UI_PORT, SPEND_CAP_USD,
// SKIP_API=1 (start only the UI).
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const live = process.argv.includes('--live')
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const backend = resolve(root, 'backend')
const uvicorn = resolve(root, '.venv', 'bin', 'uvicorn')
const port = process.env.API_PORT ?? (live ? '8001' : '8000')
const uiPort = process.env.UI_PORT ?? (live ? '5174' : '5173')
const cap = process.env.SPEND_CAP_USD ?? '5.50'
const kids = []

function run(name, cmd, args, opts, color) {
  const p = spawn(cmd, args, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] })
  const tag = `\x1b[${color}m[${name}]\x1b[0m `
  const pipe = (stream, out) => stream.on('data', (b) => String(b).split('\n').filter(Boolean).forEach((l) => out.write(tag + l + '\n')))
  pipe(p.stdout, process.stdout)
  pipe(p.stderr, process.stderr)
  p.on('exit', (code) => { console.log(`${tag}exited with ${code}`); shutdown(code ?? 0) })
  kids.push(p)
  return p
}

let stopping = false
function shutdown(code) {
  if (stopping) return
  stopping = true
  kids.forEach((k) => { try { k.kill('SIGTERM') } catch { /* already gone */ } })
  setTimeout(() => process.exit(code), 300)
}
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

if (process.env.SKIP_API !== '1') {
  if (!existsSync(uvicorn)) {
    console.error(`Cannot find ${uvicorn}. Run "make setup" in the repository root first.`)
    process.exit(1)
  }
  const env = live
    ? { ...process.env, LLM_MODE: 'live', SPEND_CAP_USD: cap, DEV_TAMPER: '0' }
    : { ...process.env, LLM_MODE: 'replay', DEV_TAMPER: process.env.DEV_TAMPER ?? '1' }
  console.log(live
    ? `Starting the LIVE API on :${port} (recorded questions are free; new ones spend, capped at $${cap})…`
    : `Starting the replay API on :${port} ($0; models load in about 15 s, the UI shows "starting" until then)…`)
  run('api', uvicorn, ['app.api:app', '--port', port], { cwd: backend, env }, 36)
}
console.log(`UI on http://localhost:${uiPort}`)
run('ui', 'npx', ['vite', '--port', uiPort, '--strictPort'], { cwd: resolve(here, '..'), env: { ...process.env, API_URL: `http://127.0.0.1:${port}` } }, 35)
