// Review queue (maker-checker): Deputy-style tabs with counts, status pills, ⚠ on conflicts, and the
// Control-review detail (submitted → decided → signed off). Self sign-off is disabled in the UI and refused by the server.
import { useEffect, useMemo, useState } from 'react'
import { api, ApiError, type ReviewRow, type TupleSide } from '../api'
import { ICheck, IConflict, IUser, IWarn, IX } from '../components/Icons'
import { Empty, Spinner, VerdictPill } from '../components/primitives'
import { docShort, fmtDate } from '../lib/format'
import { useApp } from '../state'

const PEOPLE = ['A. Rao (maker)', 'S. Iyer (checker)']

/** The triage reason embeds Python dicts; keep the words, drop the braces and quotes. */
export function cleanReason(r: string): string {
  const fmt = (k: string, v: string) => {
    if (/amount_max/.test(k)) return `up to ₹${+(Number(v) / 1e5).toFixed(2)} lakh`
    if (/amount_min/.test(k)) return `from ₹${+(Number(v) / 1e5).toFixed(2)} lakh`
    if (/sanction_from/.test(k)) return `sanctioned on/after ${fmtDate(v)}`
    if (/sanction_before/.test(k)) return `sanctioned before ${fmtDate(v)}`
    return v.replace(/_/g, ' ')
  }
  return r.replace(/\{([^}]*)\}/g, (_, body: string) => body.split(',').map((kv) => {
    const [k, v] = kv.split(':').map((x) => x?.replace(/['"]/g, '').trim())
    return k && v ? fmt(k, v) : ''
  }).filter(Boolean).join(', '))
}

interface Row extends ReviewRow { ob: TupleSide; int: TupleSide & { clause_text?: string } }

export function ReviewPage() {
  const { actor, setActor } = useApp()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [signed, setSigned] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [tab, setTab] = useState<'open' | 'checker' | 'signed'>('open')
  const [sel, setSel] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [onlyConflicts, setOnlyConflicts] = useState(true)

  const load = () => api.reviewQueue().then((rs) => setRows(rs.map((r) => ({ ...r, ob: JSON.parse(r.obligation_json), int: JSON.parse(r.internal_json) })))).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])

  // The same internal clause can be flagged by several reports; show each clause pair once (newest report wins).
  const dedup = useMemo(() => {
    const m = new Map<string, Row>()
    ;(rows ?? []).forEach((r) => {
      const k = `${r.int.doc_id}|${r.int.clause}|${r.ob.clause}|${r.verdict}`
      const cur = m.get(k)
      if (!cur || (cur.review_state === 'open' && r.review_state !== 'open')) m.set(k, r)
    })
    return [...m.values()].filter((r) => !onlyConflicts || r.verdict === 'CONFLICT')
  }, [rows, onlyConflicts])
  const open = dedup.filter((r) => r.review_state === 'open')
  const checker = dedup.filter((r) => r.review_state !== 'open')
  const list = tab === 'open' ? open : tab === 'checker' ? checker : signed
  const item = [...dedup, ...signed].find((r) => r.item_id === sel) ?? list[0]

  const act = async (action: string, force = false) => {
    if (!item) return
    if (action === 'sign_off' && item.decided_by === actor && !force) return
    setBusy(true); setMsg(null)
    try {
      const res = await api.review(item.item_id, action, actor, action === 'sign_off' ? 'checked against both quotes' : '')
      setMsg({ ok: true, text: action === 'sign_off' ? `Signed off by ${actor}. Maker ${res.decided_by}; the decision and sign-off are now in the audit chain.` : `${actor} ${res.review_state} the item. It now waits for a different person to sign off.` })
      if (action === 'sign_off') { setSigned((s) => [{ ...item, review_state: 'signed_off', signed_off_by: actor }, ...s]); setTab('signed'); setSel(item.item_id) }
      else { setTab('checker'); setSel(item.item_id) }
      await load()
    } catch (e) {
      const er = e as ApiError
      setMsg({ ok: false, text: `Server refused (${er.status}): ${er.message}` })
    } finally { setBusy(false) }
  }

  const selfBlocked = !!item && item.review_state !== 'open' && item.decided_by === actor

  return (
    <div className="page page-wide">
      <header className="page-head">
        <div>
          <h1 className="page-h">Review queue</h1>
          <p className="page-sub">Impact-alert items wait for a maker’s decision and a different checker’s sign-off. Every action is written to the audit chain.</p>
        </div>
        <div className="filters">
        <label className="check small"><input type="checkbox" checked={onlyConflicts} onChange={(e) => setOnlyConflicts(e.target.checked)} /> Conflicts only</label>
        <div className="actor">
          <IUser size={14} /><span className="ctx-k">Acting as</span>
          <div className="seg">
            {PEOPLE.map((p) => <button type="button" key={p} className={`seg-b ${actor === p ? 'on' : ''}`} onClick={() => setActor(p)}>{p}</button>)}
          </div>
        </div>
        </div>
      </header>
      {err && <div className="errnote">{err}</div>}
      {!rows && !err && <Spinner label="Loading the queue…" />}
      {rows && (
        <div className="review">
          <div className="rq">
            <div className="tabs" role="tablist">
              <button type="button" role="tab" className={`tab ${tab === 'open' ? 'on' : ''}`} onClick={() => { setTab('open'); setSel(null) }}>To decide <span className="count">{open.length}</span></button>
              <button type="button" role="tab" className={`tab ${tab === 'checker' ? 'on' : ''}`} onClick={() => { setTab('checker'); setSel(null) }}>To sign off <span className="count">{checker.length}</span></button>
              <button type="button" role="tab" className={`tab ${tab === 'signed' ? 'on' : ''}`} onClick={() => { setTab('signed'); setSel(null) }}>Signed off <span className="count">{signed.length}</span></button>
            </div>
            {list.length === 0 ? <Empty title={tab === 'signed' ? 'Nothing signed off in this session' : 'Nothing waiting here'} /> : (
              <ul className="rq-list">
                {list.map((r) => (
                  <li key={r.item_id}>
                    <button type="button" className={`rq-row ${item?.item_id === r.item_id ? 'on' : ''}`} onClick={() => { setSel(r.item_id); setMsg(null) }}>
                      <span className="rq-flag">{r.verdict === 'CONFLICT' ? <IWarn size={13} className="warn" /> : null}</span>
                      <span className="rq-main">
                        <span className="rq-t">{docShort(r.int.doc_id, r.int.title)} <span className="mono">§{r.int.clause}</span> <IConflict size={11} /> RBI <span className="mono">{r.ob.clause}</span></span>
                        <span className="rq-s">{r.severity} · {r.decided_by ? `maker ${r.decided_by}` : 'no maker yet'} · <span className="mono">{r.item_id}</span></span>
                      </span>
                      <VerdictPill v={r.review_state} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {item && (
            <div className="rdetail">
              <div className="rd-head"><VerdictPill v={item.verdict} /><span className="sev">{item.severity}</span><span className="mono rd-id">{item.item_id}</span></div>
              <div className="icols">
                <div className="cside cside-bank"><div className="cside-who">{docShort(item.int.doc_id, item.int.title)} <span className="mono">§{item.int.clause}</span> · p.{item.int.page}</div><blockquote className="serif">{item.int.quote}</blockquote></div>
                <div className="cside cside-rbi"><div className="cside-who">RBI para <span className="mono">{item.ob.clause}</span> · p.{item.ob.page}</div><blockquote className="serif">{item.ob.quote}</blockquote></div>
              </div>
              {item.suggested_fix && <div className="fix-body"><div className="fix-label">DRAFT – AI-suggested, needs human approval</div><p className="serif">{item.suggested_fix}</p></div>}
              <div className="rd-reason">{cleanReason(item.reason)}</div>

              <ol className="lifecycle">
                <li className="lc-done"><span className="lc-dot"><ICheck size={10} /></span><span><b>Impact report</b> flagged this clause pair <span className="mono">· {item.report_id}</span></span></li>
                <li className={item.decided_by ? 'lc-done' : 'lc-now'}><span className="lc-dot">{item.decided_by ? <ICheck size={10} /> : null}</span>
                  <span>{item.decided_by ? <><b>{item.decided_by}</b> {item.review_state === 'signed_off' ? 'decided' : item.review_state} (maker)</> : 'Waiting for a maker to accept, reject or edit'}</span></li>
                <li className={item.review_state === 'signed_off' ? 'lc-done' : item.decided_by ? 'lc-now' : ''}><span className="lc-dot">{item.review_state === 'signed_off' ? <ICheck size={10} /> : null}</span>
                  <span>{item.signed_off_by ? <><b>{item.signed_off_by}</b> signed off (checker)</> : 'Waiting for a different person to sign off'}</span></li>
              </ol>

              {item.review_state === 'open' && (
                <div className="rd-actions">
                  <span className="rd-as">As <b>{actor}</b>:</span>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => act('accept')}>Accept finding</button>
                  <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => act('edit')}>Accept with edit</button>
                  <button type="button" className="btn btn-quiet" disabled={busy} onClick={() => act('reject')}>Reject</button>
                </div>
              )}
              {item.review_state !== 'open' && item.review_state !== 'signed_off' && (
                <div className="rd-actions">
                  <span className="rd-as">As <b>{actor}</b>:</span>
                  <button type="button" className="btn btn-primary" disabled={busy || selfBlocked} onClick={() => act('sign_off')} aria-describedby="selfnote">Sign off</button>
                  {selfBlocked && (
                    <span id="selfnote" className="selfnote"><IX size={12} /> You made this decision — a different person must sign off.
                      <button type="button" className="linkbtn" onClick={() => act('sign_off', true)}>Try anyway (server check)</button></span>
                  )}
                </div>
              )}
              {msg && <div className={msg.ok ? 'okmsg' : 'errnote'}>{msg.text}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
