// Upload a PDF and watch it become evidence (docs/API_CHANGES.md §4): POST /documents → poll GET /documents/{id}/status
// about every second → the ingest report (links it found, conflicts with RBI side by side, impact link for circulars).
// Stages are shown only as the server reports them done; nothing is predicted. Every error the API can return
// (413, 415, 403, 400, duplicate, failed) gets a plain sentence and a next step.
import { useEffect, useRef, useState } from 'react'
import { api, ApiError, type UploadStatus } from '../api'
import { docShort, fmtDate } from '../lib/format'
import { DEMO_UPLOAD_ID, REHEARSED, type Rehearsed } from '../lib/rehearsed'
import { useApp, useRoute } from '../state'
import { ConflictCard } from './answer'
import { ICheck, IDoc, IUpload, IX } from './Icons'
import { Spinner } from './primitives'

export const DOC_KINDS: { id: string; label: string; note: string }[] = [
  { id: 'bank_policy', label: 'Bank policy or circular', note: 'Your bank’s own rules; checked against RBI' },
  { id: 'rbi_circular', label: 'RBI circular', note: 'A new RBI text; shows which bank clauses it affects' },
  { id: 'loan_agreement', label: 'Loan agreement', note: 'A signed agreement with a borrower' },
  { id: 'kfs_or_sanction', label: 'KFS or sanction letter', note: 'Key Facts Statement or sanction terms' },
  { id: 'other', label: 'Other document', note: 'Any PDF; answered on its own, without banking rules' },
]
export const kindLabel = (k?: string) => DOC_KINDS.find((d) => d.id === k)?.label ?? k ?? ''

const STAGE_LABEL: Record<string, string> = {
  saved: 'Saved', parsing: 'Reading the text', ocr: 'OCR on scanned pages', redacting: 'Redacting personal data',
  extracting: 'Extracting values and clauses', indexing: 'Indexing for search', linking: 'Linking to other documents',
  scanning: 'Checking for conflicts', ready: 'Ready',
}
const DEMO_FILE = '/demo-files/EUCB-circular-2026-07.pdf'

/** Fetch the demo PDF (served by the Vite dev server from corpus/demo/upload/). */
export async function demoFile(): Promise<File> {
  const r = await fetch(DEMO_FILE)
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('pdf')) throw new Error('The demo file is served by the dev server (npm run dev). It was not found at ' + DEMO_FILE + '.')
  return new File([await r.blob()], 'EUCB-circular-2026-07.pdf', { type: 'application/pdf' })
}

function errText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 413) return `Too large. A PDF may have at most 40 pages and 20 MB. (${e.message})`
    if (e.status === 415) return 'That file is not a PDF. Upload a .pdf file.'
    if (e.status === 403) return 'Uploads are switched off on this server (UPLOADS_ENABLED=0). The shipped corpus still answers.'
    if (e.status === 400) return `The server refused the details: ${e.message}. Check the document type and the date (YYYY-MM-DD).`
    if (e.status === 409) return 'This upload is still being processed. Try again when it is ready.'
    if (e.status === 0) return e.message
    return `${e.status}: ${e.message}`
  }
  return (e as Error).message
}

/** Poll a job about every second until it is ready, failed or a duplicate. */
function useJob(docId: string | null, initial: UploadStatus | null) {
  const [st, setSt] = useState<UploadStatus | null>(initial)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    setSt(initial)
    if (!docId) return
    let alive = true
    let t: number | undefined
    const tick = async () => {
      try {
        const s = await api.docStatus(docId)
        if (!alive) return
        setSt(s)
        if (s.status === 'running') t = window.setTimeout(tick, 1000)
      } catch (e) { if (alive) setErr(errText(e)) }
    }
    if (!initial || initial.status === 'running' || initial.status === 'duplicate' || !initial.report) t = window.setTimeout(tick, initial?.status === 'running' ? 1000 : 0)
    return () => { alive = false; window.clearTimeout(t) }
  }, [docId, initial])
  return { st, err }
}

/** Reveal done stages one after another (~160 ms apart) so a 1-second ingest is still readable. Only stages the
 *  server reported done are ever ticked. */
function useStagger(n: number, reduced: boolean) {
  const [shown, setShown] = useState(reduced ? n : 0)
  useEffect(() => {
    if (reduced) { setShown(n); return }
    if (shown >= n) { if (shown > n) setShown(n); return }
    const t = window.setTimeout(() => setShown((s) => Math.min(n, s + 1)), 160)
    return () => window.clearTimeout(t)
  }, [n, shown, reduced])
  return shown
}

function Stages({ st }: { st: UploadStatus }) {
  const { reducedMotion } = useApp()
  // OCR runs only for scanned pages; the server marks the stage done either way, so show it only when it did work
  const ocrPages = typeof st.counts?.ocr_pages === 'number' ? (st.counts.ocr_pages as number) : 0
  const stages = (st.stages ?? []).filter((s) => s.stage !== 'ocr' || st.stage === 'ocr' || ocrPages > 0)
  const nDone = stages.filter((s) => s.done).length
  const shown = useStagger(nDone, reducedMotion)
  const failed = st.status === 'failed'
  return (
    <ol className="upl-stages">
      {stages.map((s, i) => {
        const done = s.done && i < shown
        const now = !done && (i === shown) && !failed
        return (
          <li key={s.stage} className={`upl-stage ${done ? 'done' : ''} ${now ? 'now' : ''} ${failed && s.stage === st.stage ? 'bad' : ''}`}>
            <span className="upl-dot" aria-hidden="true">{done ? <ICheck size={11} /> : failed && s.stage === st.stage ? <IX size={11} /> : now ? <Spinner /> : null}</span>
            <span>{STAGE_LABEL[s.stage] ?? s.stage}</span>
          </li>
        )
      })}
    </ol>
  )
}

const ALWAYS = ['pages', 'passages']

function Counts({ c }: { c: UploadStatus['counts'] }) {
  if (!c) return null
  const n = (k: string) => (typeof c[k] === 'number' ? (c[k] as number) : null)
  const items: [string, number | null][] = [
    ['pages', n('pages')], ['passages', n('chunks')], ['values extracted', n('value_tuples')], ['personal data redacted', n('redacted')],
    ['pages read by OCR', n('ocr_pages')], ['links found', n('links')], ['bank clauses affected', n('impact_items')],
  ]
  return (
    <dl className="upl-counts">
      {items.filter(([k, v]) => v != null && (v > 0 || ALWAYS.includes(k))).map(([k, v]) => (
        <div key={k}><dt className="tnum">{v}</dt><dd>{k}</dd></div>
      ))}
      {typeof c.extraction_cost_usd === 'number' && <div><dt className="tnum">{(c.extraction_cost_usd as number) === 0 ? '$0' : `$${(c.extraction_cost_usd as number).toFixed(4)}`}</dt><dd>model cost{(c.extraction_cost_usd as number) === 0 ? ' (replayed)' : ''}</dd></div>}
    </dl>
  )
}

const LINK_WORDS: Record<string, string> = { REFERS_TO: 'refers to', WITHDRAWS: 'withdraws', AMENDED_BY: 'is amended by', AMENDS: 'amends' }

export function UploadReport({ st, onAsk, onClose }: { st: UploadStatus; onAsk?: (st: UploadStatus) => void; onClose?: () => void }) {
  const [, , go] = useRoute()
  const [all, setAll] = useState(false)
  const r = st.report
  if (!r) return null
  const conflicts = (r.conflicts ?? []).filter((c) => c.verdict === 'CONFLICT')
  // RBI-vs-upload first (the server already orders them); then one card per distinct pair of clauses.
  const seen = new Set<string>()
  const uniq = conflicts.filter((c) => { const k = `${c.a.doc_id}:${c.a.clause}|${c.b.doc_id}:${c.b.clause}`; if (seen.has(k)) return false; seen.add(k); return true })
  const shown = all ? uniq : uniq.slice(0, 2)
  return (
    <div className="upl-report">
      <div className="upl-title">{r.title ?? st.filename}</div>
      <div className="upl-meta">
        {kindLabel(st.doc_kind)}{r.effective_date && <> · in force from <b className="tnum">{fmtDate(r.effective_date)}</b></>} · <span className="mono">{st.doc_id}</span>
      </div>
      {(st.warnings ?? []).length > 0 && (
        <ul className="upl-warn">{st.warnings!.map((w, i) => <li key={i}>{w}</li>)}</ul>
      )}
      {(r.links ?? []).length > 0 && (
        <section className="upl-sec">
          <h3 className="upl-h">It mentions {r.links!.length} other document{r.links!.length === 1 ? '' : 's'}</h3>
          <ul className="upl-links">
            {r.links!.map((l, i) => (
              <li key={i}><span className="upl-link-what">Clause <span className="mono">{l.by?.split(':')[1] ?? '—'}</span> {LINK_WORDS[l.type] ?? l.type.toLowerCase()} <b>{docShort(l.target.split(':')[0])}</b>{l.target.includes(':') && <> <span className="mono">§{l.target.split(':')[1]}</span></>}</span>
                {l.quote && <blockquote className="serif">“{l.quote}”{l.page != null && <span className="upl-page"> · p.{l.page}</span>}</blockquote>}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="upl-sec">
        <h3 className="upl-h">{uniq.length ? `${uniq.length} conflict${uniq.length === 1 ? '' : 's'} with documents in force` : 'No conflicts with documents in force'}{r.as_of && <span className="upl-asof"> · as of {fmtDate(r.as_of)}</span>}</h3>
        {shown.map((c, i) => <ConflictCard key={i} c={c} />)}
        {uniq.length > 2 && <button type="button" className="btn btn-quiet" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${uniq.length}`}</button>}
      </section>
      {r.impact && (
        <section className="upl-sec">
          <h3 className="upl-h">Impact on the bank’s documents</h3>
          <p className="upl-p">{r.impact.items} bank clause{r.impact.items === 1 ? '' : 's'} checked, {r.impact.conflicts} in conflict.</p>
          <button type="button" className="btn btn-quiet" onClick={() => { onClose?.(); go(`impact/${st.doc_id}`) }}>Open the impact report →</button>
        </section>
      )}
      {onAsk && (
        <div className="upl-actions">
          <button type="button" className="btn btn-primary" onClick={() => onAsk(st)}>Ask about this upload</button>
          {onClose && <button type="button" className="btn btn-quiet" onClick={onClose}>Done</button>}
        </div>
      )}
    </div>
  )
}

/** The upload dialog: form → progress → report. `preset` pre-fills it (the demo button). */
export function UploadDialog({ open, onClose, preset, onAsk, showDocId }: {
  open: boolean
  onClose: () => void
  preset?: { file: File; doc_kind: string } | null
  onAsk: (st: UploadStatus) => void
  showDocId?: string | null
}) {
  const [file, setFile] = useState<File | null>(null)
  const [kind, setKind] = useState('bank_policy')
  const [title, setTitle] = useState('')
  const [eff, setEff] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [job, setJob] = useState<{ id: string; initial: UploadStatus | null; dup?: boolean } | null>(null)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const { st, err: pollErr } = useJob(job?.id ?? null, job?.initial ?? null)

  useEffect(() => {
    if (!open) return
    setErr(null); setBusy(false); setTitle(''); setEff('')
    if (showDocId) { setJob({ id: showDocId, initial: null }); setFile(null) }
    else { setJob(null); setFile(preset?.file ?? null); setKind(preset?.doc_kind ?? 'bank_policy') }
    window.setTimeout(() => box.current?.focus(), 0)
  }, [open, preset, showDocId])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null

  const pick = (f: File | undefined | null) => {
    setErr(null)
    if (!f) return
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') { setErr('That file is not a PDF. Upload a .pdf file.'); return }
    if (f.size > 20 * 1024 * 1024) { setErr(`Too large: ${(f.size / 1048576).toFixed(1)} MB. A PDF may have at most 20 MB and 40 pages.`); return }
    setFile(f)
  }
  const submit = async () => {
    if (!file) return
    if (eff && !/^\d{4}-\d{2}-\d{2}$/.test(eff)) { setErr('Use the date format YYYY-MM-DD.'); return }
    setBusy(true); setErr(null)
    try {
      const s = await api.upload(file, { doc_kind: kind, title: title.trim() || undefined, effective_date: eff || undefined })
      setJob({ id: s.doc_id, initial: s.status === 'duplicate' ? null : s, dup: s.status === 'duplicate' })
    } catch (e) { setErr(errText(e)) } finally { setBusy(false) }
  }

  const phase = !job ? 'form' : st?.status === 'ready' || (job.dup && st && st.status !== 'running') ? 'ready' : st?.status === 'failed' ? 'failed' : 'running'
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Upload a PDF">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="modal upl-modal" ref={box} tabIndex={-1}>
        <header className="modal-head">
          <span className="upl-head"><IUpload size={14} /> {phase === 'form' ? 'Upload a PDF' : phase === 'ready' ? 'Ready to answer from' : phase === 'failed' ? 'Upload failed' : 'Reading the document…'}</span>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Close"><IX /></button>
        </header>

        {phase === 'form' && (
          <form className="upl-form" onSubmit={(e) => { e.preventDefault(); submit() }}>
            <div className={`upl-drop ${drag ? 'drag' : ''} ${file ? 'has' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}>
              {file ? (
                <span className="upl-file"><IDoc size={16} /> <b>{file.name}</b> <span className="tnum">{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" className="linkbtn" onClick={() => setFile(null)}>Change</button></span>
              ) : (
                <>
                  <span>Drop a PDF here or</span>
                  <button type="button" className="btn btn-quiet" onClick={() => input.current?.click()}>Choose a file</button>
                  <span className="upl-lim">Up to 40 pages and 20 MB. Scanned pages are read by OCR.</span>
                </>
              )}
              <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
            </div>
            <fieldset className="upl-kinds">
              <legend>What is it?</legend>
              {DOC_KINDS.map((k) => (
                <label key={k.id} className={`upl-kind ${kind === k.id ? 'on' : ''}`}>
                  <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} />
                  <span className="upl-kind-l">{k.label}</span><span className="upl-kind-n">{k.note}</span>
                </label>
              ))}
            </fieldset>
            <div className="upl-row">
              <label className="upl-field"><span>Title <i>optional</i></span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Read from the document if empty" /></label>
              <label className="upl-field"><span>In force from <i>optional</i></span><input className="input" type="date" value={eff} onChange={(e) => setEff(e.target.value)} /></label>
            </div>
            <p className="upl-note">Personal data (PAN, Aadhaar, account numbers, phone numbers) is redacted before anything is stored or sent to a model. Uploads are searched only when you choose them, and every step is written to the audit chain.</p>
            {err && <div className="errnote" role="alert">{err}</div>}
            <div className="upl-actions">
              <button type="submit" className="btn btn-primary" disabled={!file || busy}>{busy ? 'Uploading…' : 'Upload'}</button>
              <button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}

        {job && (
          <div className="upl-job" aria-live="polite">
            {job.dup && <div className="upl-dup">This exact file is already in the library as <span className="mono">{job.id}</span>{job.id === DEMO_UPLOAD_ID ? ' (the demo circular)' : ''}. Nothing was ingested again; here is its report.</div>}
            {st ? (
              <>
                {!job.dup && <div className="upl-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((st.progress ?? 0) * 100)}><span style={{ width: `${(st.progress ?? 0) * 100}%` }} /></div>}
                <div className="upl-cols">
                  {!job.dup && <Stages st={st} />}
                  <Counts c={st.counts} />
                </div>
                {st.status === 'failed' && <div className="errnote" role="alert">{st.error ?? 'The upload failed.'} Nothing was left half-written; you can upload it again.</div>}
                {phase === 'ready' && <UploadReport st={st} onAsk={onAsk} onClose={onClose} />}
              </>
            ) : pollErr ? <div className="errnote" role="alert">{pollErr}</div> : <div className="upl-wait"><Spinner /> Checking the status…</div>}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- "Ask about this document": specific questions built from an upload's own report (no model call) ---------- */
// The verifier answers specific questions (a charge, a date, a clause), not "summarise this document". These chips turn
// what the ingest report already found (title, in-force date, the subjects it conflicts on, the clauses that refer to
// other documents) into questions it can prove. Recorded wordings replay at $0; the rest need the live stack.
const SUBJECT_WORDS: Record<string, string> = {
  prepayment_charge: 'pre-payment or foreclosure charge', penal_charges: 'penal charge for a delayed EMI', penal_interest: 'penal interest',
  penal_capitalisation: 'capitalisation of penal charges', fees_not_in_kfs: 'fees not shown in the KFS', fixed_rate_switch_offer: 'switch to a fixed rate at reset',
  apr_disclosure: 'APR disclosure',
}
export interface DocQuestion { q: string; recorded?: Rehearsed; /** ask with only this upload (summaries) */ ids?: string[] }

export function useUploadQuestions(ids: string[]): { title: string; questions: DocQuestion[] }[] {
  const [out, setOut] = useState<{ title: string; questions: DocQuestion[] }[]>([])
  const key = ids.join(',')
  useEffect(() => {
    let alive = true
    Promise.all(ids.map((id) => api.docStatus(id).catch(() => null))).then((sts) => {
      if (!alive) return
      setOut(sts.filter((s): s is UploadStatus => !!s && !!s.report).map((st) => {
        const r = st.report!
        const title = r.title ?? st.filename ?? st.doc_id
        const ref = title.match(/[A-Z]{2,}[/\-][A-Z0-9/\-]{4,}/)?.[0] // e.g. EUCB/CR/2026/07
        const name = ref ? `the new circular ${ref}` : `“${title.length > 60 ? title.slice(0, 58) + '…' : title}”`
        const recorded = REHEARSED.filter((x) => x.upload_ids?.includes(st.doc_id)).map((x) => ({ q: x.q, recorded: x }))
        const sum = recorded.find((x) => x.q === 'Summarise this document')
        const qs: DocQuestion[] = [sum ?? { q: 'Summarise this document', ids: [st.doc_id] }, ...recorded.filter((x) => x !== sum)]
        const subjects = [...new Set((r.conflicts ?? []).map((c) => c.subject))]
        subjects.slice(0, 3).forEach((s) => qs.push({ q: `What ${SUBJECT_WORDS[s] ?? s.replace(/_/g, ' ')} does ${name} set, and is it allowed under RBI rules?` }))
        if (r.effective_date) qs.push({ q: `From what date does ${name} come into force?` })
        const clauses = [...new Set((r.links ?? []).map((l) => l.by?.split(':')[1]).filter(Boolean))] as string[]
        clauses.slice(0, 2).forEach((c) => qs.push({ q: `What does clause ${c} of ${name} require?` }))
        const seen = new Set<string>()
        return { title, questions: qs.filter((x) => (seen.has(x.q) ? false : (seen.add(x.q), true))).slice(0, 6) }
      }))
    })
    return () => { alive = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return out
}

/** Chips for the selected uploads. Recorded ones run; in replay mode the others only fill the composer. */
export function UploadAskChips({ ids, replay, onRecorded, onDraft, onAsk }: {
  ids: string[]; replay: boolean; onRecorded: (r: Rehearsed) => void; onDraft: (q: string) => void; onAsk: (q: string, ids?: string[]) => void
}) {
  const docs = useUploadQuestions(ids)
  if (!docs.length) return null
  return (
    <div className="docq">
      {docs.map((d) => (
        <div key={d.title} className="docq-doc">
          <div className="docq-h">Ask about this document <span>· {d.title}</span></div>
          <div className="docq-chips">
            {d.questions.map((x) => (
              <button key={x.q} type="button" className="docq-chip" title={x.recorded ? 'Recorded: replays at $0' : replay ? 'Not recorded: fills the box; needs the live stack (npm run dev:live) to answer' : 'Calls the model (live)'}
                onClick={() => (x.recorded ? onRecorded(x.recorded) : replay ? onDraft(x.q) : onAsk(x.q, x.ids))}>
                {x.q}{x.recorded ? <span className="docq-tag">recorded</span> : replay ? <span className="docq-tag">live only</span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
