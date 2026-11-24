// Typed client for the Docuhelp FastAPI backend (backend/app/api.py, service._result).
// Fields marked optional may not exist yet in the backend; every screen degrades when they are missing.

export type Outcome = 'ANSWER' | 'PARTIAL' | 'CONFLICT' | 'ABSTAIN' | 'NEEDS_INFO'
export type ClauseStatus = 'IN_FORCE' | 'SUPERSEDED' | 'NOT_YET_IN_FORCE' | string

export type BBoxes = Record<string, [number, number, number, number][]>

export interface Citation {
  eid?: string
  rid?: string
  doc_id: string
  title?: string
  clause: string
  page: number
  pages?: number[]
  text: string
  status: ClauseStatus
  applicability?: string
  version_id?: string
  valid_from?: string | null
  valid_to?: string | null
  reconstructed?: boolean
  located?: boolean
  bboxes?: BBoxes
  lead_in_used?: boolean
  ocr?: boolean
  uploaded?: boolean
  statement?: string
  breadcrumb?: string
  context?: string
}

export interface Sentence {
  text: string
  cites: string[]
  type: 'fact' | 'chain' | 'calc' | 'conflict' | 'refusal' | string
  core: boolean
  verdict: 'PASS' | 'CONTESTED' | 'BLOCKED' | string
  reason: string
  checks: string[]
  score?: number
  citations: Citation[]
  attempt?: number
  text_hi?: string | null
  support_from_lead_in?: boolean
}

export interface Faithfulness {
  draft_total?: number
  draft_pass?: number
  repair_used?: boolean
  repair_total?: number
  repair_pass?: number
  pre_gate_rate?: number
  shown?: number
  shown_drafted?: number
  blocked?: number
  code_statements?: number
  final_pass?: number
  final_total?: number
}

export interface CalcCard {
  formula: string
  hypothetical?: boolean
  shown?: boolean
  inputs: Record<string, number | string>
  cites?: string[]
  result: {
    display: string
    formula_text?: string
    value?: number | string
    working?: Record<string, string | number>[]
    problems?: string[]
  }
  problems?: string[]
}

export interface Rule {
  rid: string
  verdict: string
  permitted?: string
  doc_id: string
  clause: string
  chunk_id?: string | null
  quote: string
  page: number
  verified?: boolean
  subject?: string
  condition?: Record<string, string>
  statement: string
}

export interface Missing {
  slot: string
  searched?: string
  closest?: Citation[]
}

export interface TupleSide {
  doc_id: string
  title?: string
  clause: string
  chunk_id?: string
  page: number
  quote: string
  permitted?: string
  value?: string
  condition?: Record<string, string>
  bboxes?: BBoxes
}

export interface Conflict {
  verdict: string
  subject: string
  a: TupleSide
  b: TupleSide
  why?: string
}

export interface Version {
  version_id: string
  valid_from: string
  valid_to: string | null
  op: string
  text: string
  amended_by: string | null
  source_quote: string | null
  status: ClauseStatus
  clause_key?: string
  chunk_id?: string
  doc_id?: string
}

export interface Plan {
  english_question?: string
  lang?: string
  sub_queries?: string[]
  subjects?: string[]
  case?: Record<string, string | number>
  premises?: string[]
  asks_calculation?: boolean
}

export interface AskResult {
  query_id: string
  /** follow-up resolution (backend: `followup.resolved_question`) */
  followup?: { resolved_question?: string; [k: string]: unknown } | null
  /** verified summary (`query_class: summary_request`): sentences are the key points, `blocked` the withheld ones */
  summary?: boolean | null
  summary_of?: { doc_id: string; title?: string }[] | null
  /** summaries: e.g. "5 key points from 9 sections; 2 withheld" */
  coverage?: string | { proven?: number; total?: number; note?: string; [k: string]: unknown } | number | null
  /** smalltalk: the fixed reply and example questions */
  help?: { text?: string; examples?: string[] } | null
  /** smalltalk: fixed reply + example questions (field names hedged until docs/API_CHANGES.md lands) */
  reply?: string | null
  message?: string | null
  examples?: (string | { q?: string; question?: string; as_of?: string; profile?: string; collection?: string })[] | null
  outcome: Outcome
  question: string
  as_of: string
  bank_profile: string
  sentences: Sentence[]
  blocked: Sentence[]
  faithfulness: Faithfulness
  calc: CalcCard[]
  rules: Rule[]
  missing: Missing[]
  conflicts: Conflict[]
  timeline: { clause: string; versions: Version[] }[]
  plan: Plan
  gate_reason: string | null
  evidence_count: number
  latency_ms: number
  model_ids: string[]
  best_sim?: number
  // not yet in every backend build:
  timings?: Record<string, number>
  answer_hi?: string[] | null
  translation?: Translation | null
  lang?: string
  collection?: string
  upload_ids?: string[]
  // "Backend final pass" (docs/API_CHANGES.md). Shapes are read defensively until that file documents them.
  query_class?: string | null
  flagged_sources?: FlaggedSource[] | null
  premise_check?: PremiseCheck[] | PremiseCheck | null
  needs?: Need[] | null
  needs_info?: boolean
  notices?: Notice[] | null
  confidence?: Confidence | null
  text_hi?: string | null
  domain?: string | null
}

export interface Translation {
  lang: string
  label?: string
  checked_by?: string
  model?: string
  sentences?: { n: number; text: string; text_hi: string | null; check: string }[]
  passed?: number
  error?: string | null
  abstain_text?: string
}

export interface UploadStatus {
  doc_id: string
  filename?: string
  doc_kind?: string
  collection?: string
  stage: string
  status: 'running' | 'ready' | 'failed' | 'duplicate' | string
  progress?: number
  stages?: { stage: string; done: boolean }[]
  counts?: Record<string, number | Record<string, number>>
  warnings?: string[]
  report?: {
    title?: string
    effective_date?: string
    collection?: string
    links?: { type: string; target: string; by?: string; quote?: string; page?: number; effective_date?: string }[]
    conflicts?: Conflict[]
    impact?: { report_id: string; items: number; conflicts: number } | null
    as_of?: string
  } | null
  error?: string | null
}

export interface UploadRow {
  doc_id: string
  title: string
  doc_kind: string
  collection: string
  source: string
  effective_date: string | null
  n_pages: number | null
  ingested_at: string | null
  ocr_pages?: number[]
  status: string
  stage: string
}

export interface Need {
  key: string
  label?: string
  question?: string
  input?: 'date' | 'number' | 'choice' | string
  options?: (string | { value: string; label?: string })[]
  /** labels for `options`, same order (e.g. document titles for a summary's doc_id choice) */
  option_labels?: string[]
  subjects?: string[]
}

export interface Notice { kind: string; text: string; matched?: string[] }
export interface Confidence { level: string; draft_pass_rate?: number; cut?: number; passed?: number; drafted?: number; note?: string }

export interface PremiseCheck {
  premise?: string
  text?: string
  verdict?: string
  status?: string
  reason?: string
  quote?: string
  citation?: Citation
}

export interface FlaggedSource {
  doc_id?: string
  title?: string
  chunk_id?: string
  clause?: string
  page?: number
  quote?: string
  matched?: string
  hidden_text?: boolean
  reason?: string
  bboxes?: BBoxes
}

export interface Health {
  ok: boolean
  llm_mode: 'replay' | 'live' | 'record' | string
  models: string[]
  embed_model: string
  nli_model: string
  spend_usd: number
  spend_cap_usd: number
  corpus_hash: string
  documents: number
  [k: string]: unknown
}

export interface DocumentRow {
  doc_id: string
  title: string
  issuer: string
  doc_type: string
  circular_no: string | null
  issue_date: string | null
  effective_date: string | null
  withdrawn_on: string | null
  n_pages: number
  is_synthetic: number
}

export interface ImpactItem {
  item_id: string
  report_id: string
  verdict: string
  triage?: string
  severity: string
  subject?: string
  effective_for?: string
  obligation: TupleSide & { title?: string }
  internal: TupleSide & { clause_text?: string }
  reason: string
  review_state: string
  decided_by: string | null
  signed_off_by: string | null
  suggested_fix: string | null
  fix_label?: string
  redline?: string[]
}

export interface ImpactReport {
  report_id: string
  doc_id: string
  bank_profile: string
  as_of: string
  summary: Record<string, number>
  items: ImpactItem[]
}

export interface ReviewRow {
  item_id: string
  report_id: string
  obligation_json: string
  internal_json: string
  verdict: string
  severity: string
  reason: string
  suggested_fix: string | null
  fix_is_draft?: number
  review_state: string
  decided_by: string | null
  signed_off_by: string | null
  [k: string]: unknown
}

export interface TraceRow {
  seq: number | string
  query_id: string
  ts: string
  actor: string
  event_type: string
  payload?: Record<string, unknown>
  model_id?: string | null
  corpus_hash?: string | null
  egress_manifest_json?: string | null
  redaction_map_hash?: string | null
  prev_hash: string
  row_hash: string
}

export interface ChainResult {
  ok: boolean
  checked: number
  broken_at_seq?: number | null
  [k: string]: unknown
}

export interface Turn { question: string; query_id?: string }
export interface AskExtra { collection?: string; upload_ids?: string[]; history?: Turn[] }
function cleanExtra(x?: AskExtra) {
  const o: Record<string, unknown> = {}
  if (x?.collection && x.collection !== 'banking') o.collection = x.collection
  if (x?.upload_ids?.length) o.upload_ids = x.upload_ids
  if (x?.history?.length) {
    o.history = x.history.slice(-3)
    const last = x.history[x.history.length - 1].query_id
    if (last) o.previous_query_id = last
  }
  return o
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

import { scrubResponse } from './lib/brandless'

const BASE = '/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let r: Response
  try {
    r = await fetch(BASE + path, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } })
  } catch {
    throw new ApiError(0, 'The API is not reachable. Start it with: cd backend && LLM_MODE=replay ../.venv/bin/uvicorn app.api:app --port 8000')
  }
  if (!r.ok) {
    let msg = r.statusText
    try {
      const j = await r.json()
      msg = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j)
    } catch {
      /* not json */
    }
    if (r.status === 502 || r.status === 504) msg = 'The API is not reachable (proxy error). Is uvicorn running on port 8000?'
    throw new ApiError(r.status, msg)
  }
  const ct = r.headers.get('content-type') ?? ''
  return (ct.includes('json') ? r.json().then((j) => scrubResponse(j)) : r.text()) as Promise<T>
}

export const api = {
  health: () => req<Health>('/health'),
  documents: () => req<DocumentRow[]>('/documents'),
  pdfUrl: (docId: string) => `${BASE}/documents/${encodeURIComponent(docId)}/pdf`,
  pages: (docId: string) => req<{ doc_id: string; pages: { page_no: number; width: number; height: number }[] }>(`/documents/${encodeURIComponent(docId)}/pages`),
  ask: (question: string, as_of: string, bank_profile: string, slots?: Record<string, unknown>, extra?: AskExtra) =>
    req<AskResult>('/ask', { method: 'POST', body: JSON.stringify({ question, as_of, bank_profile, ...(slots ? { slots } : {}), ...cleanExtra(extra) }) }),
  /** POST /ask/stream (SSE). Calls onEvent for every event; resolves with the final result. Falls back to /ask on any error. */
  askStream: async (question: string, as_of: string, bank_profile: string, slots: Record<string, unknown> | undefined,
    onEvent: (ev: { event: string; data: Record<string, unknown> }) => void, extra?: AskExtra): Promise<AskResult> => {
    const r = await fetch(BASE + '/ask/stream', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify({ question, as_of, bank_profile, ...(slots ? { slots } : {}), ...cleanExtra(extra) }) })
    if (!r.ok || !r.body) throw new ApiError(r.status, 'stream unavailable')
    const reader = r.body.getReader()
    const dec = new TextDecoder()
    let buf = ''
    let final: AskResult | null = null
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      let k: number
      while ((k = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, k)
        buf = buf.slice(k + 2)
        let event = 'message'
        const lines: string[] = []
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim()
          else if (line.startsWith('data:')) lines.push(line.slice(5).trim())
        }
        if (!lines.length) continue
        let data: Record<string, unknown>
        try { data = scrubResponse(JSON.parse(lines.join('\n'))) } catch { continue }
        if (event === 'error') throw new ApiError(Number(data.status ?? 500), String(data.detail ?? data.message ?? 'stream error'))
        const maybe = (data.result ?? data) as AskResult
        if (maybe && typeof maybe === 'object' && 'outcome' in maybe && 'sentences' in maybe && 'query_id' in maybe) final = maybe
        onEvent({ event, data })
      }
    }
    if (!final) throw new ApiError(500, 'stream ended without a result')
    return final
  },
  upload: async (file: File | Blob, meta: { doc_kind: string; title?: string; effective_date?: string; filename?: string }) => {
    const fd = new FormData()
    fd.append('file', file, meta.filename ?? (file as File).name ?? 'upload.pdf')
    fd.append('doc_kind', meta.doc_kind)
    if (meta.title) fd.append('title', meta.title)
    if (meta.effective_date) fd.append('effective_date', meta.effective_date)
    let r: Response
    try { r = await fetch(BASE + '/documents', { method: 'POST', body: fd }) } catch { throw new ApiError(0, 'The API is not reachable.') }
    if (!r.ok) { let m = r.statusText; try { const j = await r.json(); m = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j) } catch { /* */ } throw new ApiError(r.status, m) }
    return r.json().then((j) => scrubResponse(j)) as Promise<UploadStatus>
  },
  docStatus: (docId: string) => req<UploadStatus>(`/documents/${encodeURIComponent(docId)}/status`),
  uploads: () => req<UploadRow[]>('/documents?source=upload'),
  docsBySource: (source: 'upload' | 'demo' | 'all', collection?: string) => req<{ doc_id: string; title: string; collection: string; source: string }[]>(`/documents?source=${source}${collection ? `&collection=${collection}` : ''}`),
  deleteDoc: (docId: string, actor: string) => req<{ deleted: string; removed: Record<string, number>; validity_restored?: unknown }>(`/documents/${encodeURIComponent(docId)}?actor=${encodeURIComponent(actor)}`, { method: 'DELETE' }),
  timeline: (chunkId: string, as_of: string) =>
    req<{ chunk_id: string; versions: Version[]; edges: Record<string, unknown>[] }>(
      `/provisions/${chunkId.split('/').map(encodeURIComponent).join('/')}/timeline?as_of=${as_of}`,
    ),
  conflicts: (as_of: string, profile: string, collection = 'banking', upload_ids: string[] = []) =>
    req<{ as_of: string; counts: Record<string, number>; items: Conflict[] }>(`/conflicts?as_of=${as_of}&profile=${profile}${collection !== 'banking' ? `&collection=${collection}` : ''}${upload_ids.length ? `&upload_ids=${upload_ids.map(encodeURIComponent).join(',')}` : ''}`),
  impact: (doc_id: string, bank_profile: string, as_of: string) =>
    req<ImpactReport>('/impact', { method: 'POST', body: JSON.stringify({ doc_id, bank_profile, as_of }) }),
  exportImpact: (reportId: string) => req<string>(`/impact/${reportId}/export.md`),
  reviewQueue: () => req<ReviewRow[]>('/review-queue'),
  review: (itemId: string, action: string, actor: string, reason = '') =>
    req<{ item_id: string; review_state: string; decided_by: string | null; signed_off_by: string | null }>(`/review/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ action, actor, reason }),
    }),
  verifyChain: () => req<ChainResult>('/trace/verify-chain'),
  trace: (id: string) => req<TraceRow[]>(`/trace/${encodeURIComponent(id)}`),
  traceList: (limit = 60, beforeSeq?: number) => req<TraceRow[]>(`/trace?limit=${limit}${beforeSeq ? `&before_seq=${beforeSeq}` : ''}`),
  incident: (query_id: string, note: string) => req<{ ok: boolean }>('/incidents', { method: 'POST', body: JSON.stringify({ query_id, note }) }),
  obligations: (profile: string) => req<Record<string, unknown>[]>(`/obligations?profile=${profile}`),
  // dev-only demo endpoints; may not exist (UI hides the controls on 404)
  tamper: (seq: number) => req<{ tampered_seq: number; verify_chain: ChainResult }>(`/dev/tamper/${seq}`, { method: 'POST', body: '{}' }),
  restore: () => req<{ restored: number[]; verify_chain: ChainResult }>('/dev/restore', { method: 'POST', body: '{}' }),
  rules: (body: { case: Record<string, unknown>; bank_profile: string; as_of: string; subjects?: string[]; question?: string }) =>
    req<{ as_of: string; bank_profile: string; case: Record<string, unknown>; llm_calls: number; rules: Rule[]; gaps: Missing[] }>('/rules', { method: 'POST', body: JSON.stringify(body) }),
  openapi: () => req<{ paths: Record<string, unknown> }>('/openapi.json'),
}
