// Impact alerts: "New RBI circular affects N bank clauses" (Inara Studio inline alert) → items with both quotes,
// severity, effective-for and an AI fix shown as a redline labelled DRAFT. The Tier 3 → Tier 4 flip is applied by code.
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, type ImpactItem, type ImpactReport } from '../api'
import { IBell, IConflict, IWarn } from '../components/Icons'
import { Spinner, VerdictPill } from '../components/primitives'
import { ImpactGraph } from '../components/Graphs'
import { keyTerms, ndiffToOps } from '../lib/diff'
import { cleanTitle, docShort, fmtDate, humanSubject, profileLabel } from '../lib/format'
import { useApp, useRoute } from '../state'

// A bank clause is "new" under this tier if it was not in conflict with any RBI paragraph under the other tier.
const keyOf = (it: ImpactItem) => `${it.internal.doc_id}|${it.internal.clause}`
const clauseLabel = (c: string) => c.replace(/#\d+$/, '')

function Marked({ text }: { text: string }) {
  return <>{keyTerms(text).map((p, i) => (p.k ? <mark key={i} className="kt">{p.s}</mark> : <span key={i}>{p.s}</span>))}</>
}

function condChips(c?: Record<string, string>) {
  if (!c) return null
  const out: string[] = []
  if (c.entity && c.entity !== 'any') out.push(c.entity.replace('ucb_', 'UCB ').replace('_', ' '))
  if (c.borrower && c.borrower !== 'any') out.push(c.borrower.replace(/_/g, ' '))
  if (c.purpose && c.purpose !== 'any') out.push(c.purpose.replace('_', '-'))
  if (c.rate_type && c.rate_type !== 'any') out.push(`${c.rate_type} rate`)
  if (c.facility && c.facility !== 'any') out.push(c.facility.replace(/_/g, ' '))
  if (c.amount_max_inr) out.push(`≤ ₹${(Number(c.amount_max_inr) / 1e5).toFixed(0)} lakh`)
  if (c.amount_min_inr) out.push(`> ₹${(Number(c.amount_min_inr) / 1e5).toFixed(0)} lakh`)
  if (c.sanction_from) out.push(`sanctioned ≥ ${fmtDate(c.sanction_from)}`)
  if (c.sanction_before) out.push(`sanctioned < ${fmtDate(c.sanction_before)}`)
  return out.map((s) => <span key={s} className="qchip">{s}</span>)
}

function ItemCard({ it, isNew }: { it: ImpactItem; isNew: boolean }) {
  const [fix, setFix] = useState(it.verdict === 'CONFLICT')
  const ops = it.redline?.length ? ndiffToOps(it.redline) : []
  return (
    <div className={`icard ${isNew ? 'icard-new' : ''}`} id={`item-${it.item_id}`}>
      <div className="icard-top">
        <VerdictPill v={it.verdict} />
        <span className="sev">{it.severity}</span>
        {it.effective_for && <span className="eff">for {it.effective_for.replace(/(\d{4}-\d{2}-\d{2})/, (m) => fmtDate(m))}</span>}
        {isNew && <span className="pill pill-conflict">New under this tier</span>}
        <span className="grow" />
        <VerdictPill v={it.review_state} />
      </div>
      <div className="icols">
        <div className="cside cside-bank">
          <div className="cside-who">{docShort(it.internal.doc_id, it.internal.title)} <span className="mono">§{clauseLabel(it.internal.clause)}</span> · p.{it.internal.page}</div>
          <blockquote className="serif"><Marked text={it.internal.quote} /></blockquote>
        </div>
        <div className="cside cside-rbi">
          <div className="cside-who">RBI para <span className="mono">{it.obligation.clause}</span> · p.{it.obligation.page}</div>
          <blockquote className="serif"><Marked text={it.obligation.quote} /></blockquote>
          <div className="qchips">{condChips(it.obligation.condition)}</div>
        </div>
      </div>
      {it.suggested_fix && (
        <div className="fix">
          <button type="button" className="linkbtn" onClick={() => setFix(!fix)}>{fix ? 'Hide' : 'Show'} suggested fix</button>
          {fix && (
            <div className="fix-body">
              <div className="fix-label">{it.fix_label ?? 'DRAFT – AI-suggested, needs human approval'}</div>
              <p className="serif redline">{ops.length ? ops.map((o, i) => o.t === 'eq' ? <span key={i}>{o.w}</span> : o.t === 'del' ? <del key={i} className="d-del">{o.w}</del> : <ins key={i} className="d-ins">{o.w}</ins>) : it.suggested_fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ImpactPage({ docParam }: { docParam?: string }) {
  const { docs, profile, asOf } = useApp()
  const [, , go] = useRoute()
  const rbiDocs = docs.filter((d) => !d.is_synthetic)
  const [docId, setDocId] = useState(docParam || 'RBI-UCB-RBC-MD-2025')
  useEffect(() => { if (docParam) setDocId(docParam) }, [docParam])
  const [rep, setRep] = useState<ImpactReport | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'CONFLICT' | 'all'>('CONFLICT')
  const [view, setView] = useState<'list' | 'graph'>('list')
  const seen = useRef<Record<string, ImpactReport>>({})

  useEffect(() => {
    let alive = true
    setLoading(true); setErr(null)
    api.impact(docId, profile, asOf).then((r) => { if (alive) { setRep(r); seen.current[`${docId}|${profile}|${asOf}`] = r } })
      .catch((e) => alive && setErr(e.message)).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [docId, profile, asOf])

  const other = seen.current[`${docId}|${profile === 'ucb_tier3' ? 'ucb_tier4' : 'ucb_tier3'}|${asOf}`]
  const otherKeys = useMemo(() => new Set(other?.items.filter((i) => i.verdict === 'CONFLICT').map(keyOf) ?? []), [other])
  const newKeys = useMemo(() => new Set(other ? (rep?.items ?? []).filter((i) => i.verdict === 'CONFLICT' && !otherKeys.has(keyOf(i))).map(keyOf) : []), [rep, other, otherKeys])

  const items = (rep?.items ?? []).filter((i) => filter === 'all' || i.verdict === 'CONFLICT')
  const groups = useMemo(() => {
    const m = new Map<string, ImpactItem[]>()
    items.forEach((i) => m.set(i.internal.doc_id, [...(m.get(i.internal.doc_id) ?? []), i]))
    const fresh = (i: ImpactItem) => (newKeys.has(keyOf(i)) ? 0 : 1)
    return [...m.entries()].map(([d, its]) => [d, [...its].sort((a, b) => fresh(a) - fresh(b))] as [string, ImpactItem[]])
      .sort((a, b) => fresh(a[1][0]) - fresh(b[1][0]))
  }, [items, newKeys])
  const nConflict = rep?.summary.CONFLICT ?? 0
  const affectedClauses = new Set((rep?.items ?? []).filter((i) => i.verdict === 'CONFLICT').map((i) => `${i.internal.doc_id}|${i.internal.clause}`)).size

  const exportMd = async () => {
    if (!rep) return
    const md = await api.exportImpact(rep.report_id)
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url; a.download = `impact-${rep.report_id}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">Impact alerts</h1>
          <p className="page-sub">When RBI issues a circular, code checks it against every clause of the bank’s own documents for {profileLabel(profile)} as of {fmtDate(asOf)}. Fixes are AI drafts and need human approval.</p>
        </div>
        <select className="input" value={docId} onChange={(e) => setDocId(e.target.value)} aria-label="Circular">
          {[...rbiDocs, ...(rbiDocs.some((d) => d.doc_id === docId) ? [] : [{ doc_id: docId, title: docId.startsWith('UP-') ? `Your upload ${docId}` : docId }])].map((d) => <option key={d.doc_id} value={d.doc_id}>{cleanTitle(d.title)}</option>)}
        </select>
      </header>
      {err && <div className="errnote">{err}</div>}
      {loading && <Spinner label="Checking the circular against the bank’s clauses…" />}
      {rep && !loading && (
        <>
          <div className={`alert ${nConflict ? 'alert-amber' : 'alert-quiet'}`}>
            <IBell size={16} />
            <div className="alert-body">
              <div className="alert-t">{nConflict ? `${cleanTitle(rbiDocs.find((d) => d.doc_id === docId)?.title ?? docId)} affects ${affectedClauses} bank clause${affectedClauses === 1 ? '' : 's'}` : 'No bank clauses affected'}</div>
              <div className="alert-s">{nConflict} conflicts · {rep.summary.NEEDS_REVIEW ?? 0} need review · {rep.bank_profile} · report <span className="mono">{rep.report_id}</span></div>
            </div>
            {nConflict > 0 && <button type="button" className="alert-act" onClick={() => go('review')}>Review {nConflict} items →</button>}
          </div>

          {other && (
            <div className={`flip ${newKeys.size ? 'flip-on' : ''}`}>
              <IConflict size={14} />
              {newKeys.size
                ? <span><b>Tier switch applied by code:</b> moving from {profileLabel(profile === 'ucb_tier3' ? 'ucb_tier4' : 'ucb_tier3')} to {profileLabel(profile)} puts {newKeys.size} more bank clause{newKeys.size === 1 ? '' : 's'} in conflict (marked below). Same circular, same clauses — a different rule applies.</span>
                : <span>Compared with {profileLabel(profile === 'ucb_tier3' ? 'ucb_tier4' : 'ucb_tier3')}: no new conflicts at this tier.</span>}
            </div>
          )}
          {!other && <p className="hint">Switch the bank profile in the top bar (Tier 3 ↔ Tier 4) to see which conflicts the tier changes.</p>}

          <div className="toolbar">
            <div className="seg">
              <button type="button" className={`seg-b ${filter === 'CONFLICT' ? 'on' : ''}`} onClick={() => setFilter('CONFLICT')}>Conflicts <span className="count">{nConflict}</span></button>
              <button type="button" className={`seg-b ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All <span className="count">{rep.items.length}</span></button>
            </div>
            <div className="seg" role="group" aria-label="View">
              <button type="button" className={`seg-b ${view === 'list' ? 'on' : ''}`} onClick={() => setView('list')}>List</button>
              <button type="button" className={`seg-b ${view === 'graph' ? 'on' : ''}`} onClick={() => setView('graph')}>Graph</button>
            </div>
            <button type="button" className="btn btn-quiet btn-sm" onClick={exportMd}>Export report (.md)</button>
          </div>
          {view === 'graph' && <ImpactGraph items={items} circular={docId} onPick={(it) => { setView('list'); setTimeout(() => document.getElementById(`item-${it.item_id}`)?.scrollIntoView({ block: 'center' }), 50) }} />}

          {view === 'list' && groups.map(([doc, its]) => (
            <section key={doc} className="sec">
              <header className="sec-head"><h3>{cleanTitle(its[0].internal.title) || docShort(doc)} <span className="count">{its.length}</span></h3><span className="sec-note">{humanSubject([...new Set(its.map((i) => i.subject))].join(', '))}</span></header>
              {its.map((it) => <ItemCard key={it.item_id} it={it} isNew={newKeys.has(keyOf(it))} />)}
            </section>
          ))}
          {groups.length === 0 && <div className="hint"><IWarn size={13} /> Nothing in this filter.</div>}
        </>
      )}
    </div>
  )
}
