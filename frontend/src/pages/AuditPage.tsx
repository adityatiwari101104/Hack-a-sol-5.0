// Audit trail: monochrome Activity Timeline (bold verb per event, hairline rule) + Discord row grammar + a mono
// prev → row hash column; "Verify chain" ticks rows in turn; dev tamper/restore turns the chain red live.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, type ChainResult, type TraceRow } from '../api'
import { ICheck, IChain, IChevron, IX } from '../components/Icons'
import { Spinner } from '../components/primitives'
import { HashChainStrip } from '../components/HashChain'
import { fmtDateTime, shortHash } from '../lib/format'
import { useApp } from '../state'

const MARKER = /genesis|archive|anchor|rechain|epoch/i

/** Where the archived file / backup / earlier chain went, whatever the backend calls it. */
function markerWhere(p: Record<string, unknown>): string {
  const k = Object.keys(p).find((x) => /archive|backup|path|file/i.test(x))
  return k ? String(p[k]) : ''
}

function verb(r: TraceRow): [string, string] {
  const p = (r.payload ?? {}) as Record<string, unknown>
  const q = p.question ? `“${String(p.question).slice(0, 90)}${String(p.question).length > 90 ? '…' : ''}”` : `query ${r.query_id}`
  switch (r.event_type) {
    case 'ask': return ['answered', `${q}${p.outcome ? ` → ${p.outcome}` : ''}`]
    case 'abstain': return ['abstained on', `${q}${p.reason ? ` (${String(p.reason).replace(/_/g, ' ')})` : ''}`]
    case 'review': return [String(p.action ?? 'reviewed').replace('sign_off', 'signed off').replace('accept', 'accepted').replace('reject', 'rejected').replace('edit', 'edited'), `item ${r.query_id}`]
    case 'incident': return ['flagged', `answer ${r.query_id} as wrong`]
    case 'impact': return ['ran an impact report', r.query_id]
    case 'genesis': case 'chain_genesis': case 'reanchor': case 're-anchor': case 'archive': case 'chain_archive':
      return ['started a new chain', `${p.reason ? String(p.reason).replace(/[.;\s]+$/, '') + '; ' : ''}${markerWhere(p) ? 'earlier log archived at ' + markerWhere(p) : 'earlier log archived'}`]
    case 'rechain': return ['re-linked the chain', `from row #${p.from_seq ?? '?'} (${p.rows_relinked ?? '?'} rows) after a concurrent-write fork; row contents unchanged, backup kept`]
    default: return [r.event_type, r.query_id]
  }
}

export function AuditPage() {
  const { features, history } = useApp()
  const [rows, setRows] = useState<TraceRow[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [chain, setChain] = useState<ChainResult | null>(null)
  const [ticking, setTicking] = useState(-1)
  const [open, setOpen] = useState<string | null>(null)
  const [detail, setDetail] = useState<Record<string, TraceRow>>({})
  const [filter, setFilter] = useState('all')
  const [devMsg, setDevMsg] = useState<string | null>(null)
  const [tampered, setTampered] = useState<number | null>(null)
  const [rechain, setRechain] = useState<TraceRow | null>(null)
  useEffect(() => { api.trace('audit-rechain').then((rs) => setRechain(rs[rs.length - 1] ?? null)).catch(() => {}) }, [])
  const listed = useMemo(() => (rows ?? []).find((r) => MARKER.test(r.event_type) && r.event_type !== 'rechain') ?? null, [rows])
  const [genesis, setGenesis] = useState<TraceRow | null>(null)
  useEffect(() => { api.trace('audit-genesis').then((rs) => setGenesis(rs[rs.length - 1] ?? null)).catch(() => {}) }, [rows])
  const anchor = genesis ?? listed
  const anchorDetail = genesis

  const load = useCallback(async () => {
    setErr(null)
    try {
      if (features.traceList) {
        const list = await api.traceList(80)
        setRows(list)
        // GET /trace omits payloads; fetch the first rows' details so each reads as a sentence.
        const ids = [...new Set(list.slice(0, 40).map((r) => r.query_id))]
        Promise.all(ids.map((id) => api.trace(id).catch(() => [] as TraceRow[]))).then((all) => {
          const m: Record<string, TraceRow> = {}
          all.flat().forEach((r) => { m[String(r.seq)] = r })
          setDetail((d) => ({ ...m, ...d }))
        })
      } else {
        // Fallback without GET /trace: rebuild from this session's questions.
        const ids = [...new Set(history.map((h) => h.query_id).filter(Boolean) as string[])].slice(0, 25)
        const all = (await Promise.all(ids.map((id) => api.trace(id).catch(() => [])))).flat()
        setRows(all.sort((a, b) => Number(b.seq) - Number(a.seq)))
      }
    } catch (e) { setErr((e as Error).message) }
  }, [features.traceList, history])
  useEffect(() => { load() }, [load])

  const shown = useMemo(() => (rows ?? []).filter((r) => filter === 'all' || r.event_type === filter || (filter === 'human' && r.actor !== 'system')), [rows, filter])
  const types = useMemo(() => [...new Set((rows ?? []).map((r) => r.event_type))], [rows])

  const verify = async () => {
    setChain(null)
    load() // the list and the verdict should describe the same rows
    const res = api.verifyChain()
    // tick visible rows in sequence (~1.5 s), then show the server's verdict
    const n = Math.min(shown.length, 24)
    for (let i = 0; i < n; i++) { setTicking(i); await new Promise((r) => setTimeout(r, 1500 / Math.max(n, 1))) }
    setTicking(-1)
    try { setChain(await res) } catch (e) { setErr((e as Error).message) }
  }
  const tamper = async () => {
    const plain = shown.filter((r) => !MARKER.test(r.event_type))
    const target = plain[Math.min(1, plain.length - 1)]
    if (!target) return
    setDevMsg(null)
    try {
      const r = await api.tamper(Number(target.seq))
      setChain(r.verify_chain)
      setTampered(r.tampered_seq)
      setDevMsg(`Edited the payload of row #${r.tampered_seq} directly in SQLite, as someone with database access could.`)
    } catch (e) {
      const er = e as ApiError
      setDevMsg(er.status === 404 ? 'The tamper demo is off. Restart the API with DEV_TAMPER=1 to enable it.' : er.message)
    }
  }
  const restore = async () => {
    try { const r = await api.restore(); setChain(r.verify_chain); setTampered(null); setDevMsg(r.restored.length ? `Restored row${r.restored.length === 1 ? '' : 's'} #${r.restored.join(', #')} byte for byte.` : 'Nothing to restore.') } catch (e) { setDevMsg((e as Error).message) }
  }
  const toggle = async (r: TraceRow) => {
    const k = String(r.seq)
    setOpen(open === k ? null : k)
    if (!r.payload && !detail[k]) {
      const rs = await api.trace(r.query_id).catch(() => [])
      const hit = rs.find((x) => String(x.seq) === k)
      if (hit) setDetail((d) => ({ ...d, [k]: hit }))
    }
  }
  const broken = chain && !chain.ok ? Number(chain.broken_at_seq) : null

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">Audit trail</h1>
          <p className="page-sub">Append-only and hash-chained: each row stores <span className="mono">sha256(prev_hash ‖ row)</span>. Change any past row and every later hash stops matching.</p>
        </div>
        <div className="audit-actions">
          <button type="button" className="btn btn-primary" onClick={verify} disabled={ticking >= 0}><IChain size={14} /> Verify chain</button>
          {features.tamper && <>
            <button type="button" className="btn btn-quiet" onClick={tamper}>Tamper one row (dev)</button>
            <button type="button" className="btn btn-quiet" onClick={restore}>Restore</button>
          </>}
        </div>
      </header>

      {anchor && (() => {
        const p = ((anchorDetail ?? anchor).payload ?? {}) as Record<string, unknown>
        const range = Array.isArray(p.archived_seq_range) ? p.archived_seq_range as number[] : null
        const check = p.archived_chain_check as { ok?: boolean; broken_at_seq?: number } | undefined
        return (
          <div className="rechain anchor">
            <b>New chain since row #{anchor.seq} ({fmtDateTime(anchor.ts)}), started by {anchor.actor}.</b> {p.reason ? String(p.reason).replace(/([^.])$/, '$1.') + ' ' : ''}
            The previous log{range ? <> (rows #{range[0]}–#{range[1]}, {String(p.archived_rows ?? '')} rows)</> : ''} was archived unedited
            {p.archive_file ? <> to <span className="mono">audit_archive/{String(p.archive_file)}</span></> : markerWhere(p) ? <> to <span className="mono">{markerWhere(p)}</span></> : ''}
            {p.archive_sha256 ? <> (sha256 <span className="mono">{shortHash(String(p.archive_sha256), 8)}</span>)</> : ''}
            {p.archive_table ? <> and the <span className="mono">{String(p.archive_table)}</span> table</> : ''}.
            {check ? <> At archiving, the old chain {check.ok ? 'verified intact' : <>was broken at row #{check.broken_at_seq}</>}.</> : ''}
            {p.archived_last_row_hash ? <> Its last hash, <span className="mono">{shortHash(String(p.archived_last_row_hash), 8)}</span>, is recorded in the genesis row, so the two logs stay linked.</> : ''}
            {' '}“Verify chain” checks the new chain from this genesis row.
          </div>
        )
      })()}
      {chain && (
        <div className={`chainres ${chain.ok ? 'chain-ok' : 'chain-bad'}`} role="status">
          {chain.ok ? <ICheck size={16} /> : <IX size={16} />}
          {chain.ok ? <span><b>Chain intact.</b> {chain.checked} rows re-hashed from the genesis row; every hash matches.</span>
            : <span><b>Chain broken at row #{chain.broken_at_seq}.</b> {chain.checked} rows before it verify; from #{chain.broken_at_seq} on, the stored hashes no longer follow from the data.</span>}
          {Object.entries(chain).filter(([k]) => !['ok', 'checked', 'broken_at_seq'].includes(k)).map(([k, v]) => <span key={k} className="mono chain-extra">{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>)}
        </div>
      )}
      {devMsg && <div className="note">{devMsg}</div>}
      {rechain && (() => {
        const p = (rechain.payload ?? {}) as Record<string, unknown>
        return (
          <div className="rechain">
            <b>Disclosed repair, row #{rechain.seq} ({fmtDateTime(rechain.ts)}):</b> {String(p.reason ?? 'the chain was re-linked')} {String(p.rows_relinked ?? '')} rows from #{String(p.from_seq ?? '')} were re-hashed by <b>{rechain.actor}</b>; a backup of the database before the repair was kept. The repair itself is an entry in the chain, so it cannot be hidden.
          </div>
        )
      })()}
      {!features.tamper && <p className="hint">Live tamper demo needs the backend’s dev endpoints (<span className="mono">POST /dev/tamper/{'{seq}'}</span>, started with <span className="mono">DEV_TAMPER=1</span>).</p>}

      <div className="toolbar">
        <div className="seg">
          {['all', 'human', ...types].map((f) => <button type="button" key={f} className={`seg-b ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'human' ? 'People' : f}</button>)}
        </div>
        {!features.traceList && <span className="hint">Showing this session’s questions (the backend has no audit list endpoint yet).</span>}
      </div>

      {err && <div className="errnote">{err}</div>}
      {!rows && !err && <Spinner label="Loading the audit log…" />}
      {rows && rows.length > 0 && <HashChainStrip rows={rows} brokenAt={broken} ok={chain ? chain.ok : null} />}
      {rows && (
        <ol className="atl">
          {shown.map((r, i) => {
            const d = detail[String(r.seq)] ?? r
            const [v, obj] = verb(d)
            const k = String(r.seq)
            const bad = (broken != null && Number(r.seq) >= broken) || Number(r.seq) === tampered
            const ok = chain?.ok || (broken != null && Number(r.seq) < broken)
            if (MARKER.test(r.event_type) && r.event_type !== 'rechain') {
              return <li key={k} className="arow arow-marker"><span className="arow-icon"><IChain size={12} /></span><div className="marker-line"><span className="mono aseq">#{r.seq}</span> <b>{v}</b> {obj} · {fmtDateTime(r.ts)}</div></li>
            }
            return (
              <li key={k} className={`arow ${bad ? 'arow-bad' : ''} ${ticking === i ? 'arow-tick' : ''} ${ok && !bad ? 'arow-ok' : ''}`}>
                <span className="arow-icon">{bad ? <IX size={12} /> : ok || (ticking > i) ? <ICheck size={12} /> : <span className="adot" />}</span>
                <button type="button" className="arow-main" onClick={() => toggle(r)} aria-expanded={open === k}>
                  <span className="arow-text"><span className="mono aseq">#{r.seq}</span>{Number(r.seq) === tampered && <span className="pill pill-conflict">edited outside the app</span>}  {r.actor === 'system' ? 'System' : r.actor} <b>{v}</b> {obj}</span>
                  <span className="arow-time tnum">{fmtDateTime(r.ts)}</span>
                  <span className="arow-hash mono" title={`${r.prev_hash} → ${r.row_hash}`}>{shortHash(r.prev_hash, 4)} → {shortHash(r.row_hash, 4)}</span>
                  <IChevron size={12} className="arow-car" />
                </button>
                {open === k && (
                  <pre className="arow-json mono">{JSON.stringify({ ...d, payload: d.payload ?? '(loading…)' }, null, 2).slice(0, 4000)}</pre>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
