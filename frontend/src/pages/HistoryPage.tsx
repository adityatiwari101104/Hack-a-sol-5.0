// Clause history / diff: Plane "Compare versions" strip + Draftable synced serif panes + legislation.gov.uk
// point-in-time timeline. Versions come from GET /provisions/{chunk_id}/timeline; the global as-of date is the cursor.
import { useEffect, useMemo, useState } from 'react'
import { api, type Version } from '../api'
import { IClock, IDoc } from '../components/Icons'
import { PdfView } from '../components/PdfView'
import { ProvisionTimeline } from '../components/Graphs'
import { Empty, Spinner, StatusPill } from '../components/primitives'
import { wordDiff } from '../lib/diff'
import { cleanTitle, docShort, fmtDate } from '../lib/format'
import { useApp, useRoute } from '../state'

const KNOWN = [
  { chunk: 'RBI-EMI-RESET-2023:2(ii)', label: 'EMI reset · para 2(ii) — fixed-rate switch at reset', note: '2 versions, rebuilt from RBI footnotes' },
  { chunk: 'RBI-UCB-RBC-MD-2025:261(2)(ii)', label: 'UCB RBC MD · para 261(2)(ii) — Tier 3 pre-payment', note: 'single version' },
  { chunk: 'RBI-UCB-RBC-MD-2025:260', label: 'UCB RBC MD · para 260 — existing floating-rate loans', note: 'single version' },
  { chunk: 'RBI-UCB-RBC-MD-2025:257(4)', label: 'UCB RBC MD · para 257(4) — penal charges', note: 'single version' },
  { chunk: 'INS-POLICY:4.2', label: 'Insurance · policy clause 4.2 — pre-existing diseases', note: '48 → 36 months by Endorsement No. 1' },
]

function RulebookTimeline() {
  const { docs, asOf } = useApp()
  const rbi = docs.filter((d) => !d.is_synthetic && (d.issue_date || d.effective_date)).sort((a, b) => (a.effective_date ?? a.issue_date ?? '').localeCompare(b.effective_date ?? b.issue_date ?? ''))
  const min = Date.parse('2014-01-01')
  const max = Date.parse('2027-06-01')
  const x = (d: string) => ((Date.parse(d) - min) / (max - min)) * 100
  return (
    <div className="rulebook">
      <div className="rb-axis">{[2014, 2016, 2018, 2020, 2022, 2024, 2026].map((y) => <span key={y} style={{ left: `${x(`${y}-01-01`)}%` }}>{y}</span>)}</div>
      {rbi.map((d) => {
        const from = d.effective_date ?? d.issue_date!
        const to = d.withdrawn_on
        const inForce = from <= asOf && (!to || asOf < to)
        return (
          <div key={d.doc_id} className="rb-row">
            <div className="rb-name" title={d.title}>{docShort(d.doc_id, d.title)}<span className="mono rb-circ" title={d.circular_no ?? undefined}>{d.circular_no}</span></div>
            <div className="rb-track">
              <span className={`rb-bar ${inForce ? 'rb-on' : 'rb-off'} ${to ? 'rb-ended' : ''}`} style={{ left: `${x(from)}%`, width: `${Math.max(0.6, x(to ?? '2027-06-01') - x(from))}%` }}
                title={`${fmtDate(from)} → ${to ? fmtDate(to) + ' (withdrawn)' : 'in force'}`} />
              {to && <span className="rb-end" style={{ left: `${x(to)}%` }} title={`Withdrawn ${fmtDate(to)}`}>×</span>}
            </div>
          </div>
        )
      })}
      <span className="rb-cursor" style={{ left: `calc(var(--rb-name) + (100% - var(--rb-name)) * ${x(asOf) / 100})` }}><span className="tnum">{fmtDate(asOf)}</span></span>
    </div>
  )
}

export function HistoryPage({ chunk }: { chunk: string }) {
  const { asOf } = useApp()
  const [, , go] = useRoute()
  const id = chunk || KNOWN[0].chunk
  const [data, setData] = useState<{ versions: Version[]; edges: Record<string, unknown>[] } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pick, setPick] = useState<[number, number]>([0, 1])
  const [pdfPage, setPdfPage] = useState<number | null>(null)

  useEffect(() => {
    setData(null); setErr(null)
    api.timeline(id, asOf).then((d) => { setData(d); setPick([0, Math.max(0, d.versions.length - 1)]) }).catch((e) => setErr(e.message))
  }, [id, asOf])

  const vs = data?.versions ?? []
  const a = vs[pick[0]]
  const b = vs[pick[1]]
  const ops = useMemo(() => (a && b && a !== b ? wordDiff(a.text, b.text) : []), [a, b])
  const edge = data?.edges?.[0] as { quote?: string; quote_page?: number; quote_doc_id?: string; type?: string; effective_date?: string } | undefined
  const changes = ops.filter((o) => o.t !== 'eq').length

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">Clause history</h1>
          <p className="page-sub">Every version of a clause, its validity window and the RBI text that changed it. The as-of date ({fmtDate(asOf)}) decides which version is in force.</p>
        </div>
        <select className="input" value={id} onChange={(e) => go(`history/${e.target.value}`)} aria-label="Clause">
          {[...KNOWN.map((k) => k.chunk), ...(KNOWN.some((k) => k.chunk === id) ? [] : [id])].map((c) => <option key={c} value={c}>{KNOWN.find((k) => k.chunk === c)?.label ?? c}</option>)}
        </select>
      </header>

      {err && <div className="errnote">{err}</div>}
      {!data && !err && <Spinner label="Loading versions…" />}
      {data && vs.length === 0 && <Empty title="No stored versions for this clause" />}

      {data && vs.length > 0 && (
        <>
          <ProvisionTimeline versions={vs} edges={(data.edges ?? []) as { type?: string; effective_date?: string }[]} asOf={asOf} picked={pick}
            onPick={(i) => setPick(([p0, p1]) => (pick.includes(i) ? [p0, p1] : i < p1 ? [i, p1] : [p0, i]))} />
          <div className="versions">
            {vs.map((v, i) => (
              <label key={v.version_id} className={`vcard ${pick.includes(i) ? 'on' : ''} ${v.status === 'SUPERSEDED' ? 'vcard-sup' : ''}`}>
                <input type="checkbox" checked={pick.includes(i)} onChange={() => setPick(([p0, p1]) => (pick.includes(i) ? [p0, p1] : (i < p1 ? [i, p1] : [p0, i])))} />
                <span className="vcard-top"><span className="mono">v{i + 1}</span> <StatusPill status={v.status} /> <span className="vcard-op">{v.op === 'original' ? 'Original' : v.op === 'substitute' ? 'Substituted' : v.op}</span></span>
                <span className="vcard-dates tnum"><IClock size={12} /> {fmtDate(v.valid_from)} → {v.valid_to ? fmtDate(v.valid_to) : 'today'}</span>
                {v.amended_by && <span className="vcard-by">Amended by {v.amended_by}</span>}
              </label>
            ))}
          </div>

          {vs.length > 1 && a && b && (
            <>
              <div className="cmpstrip">
                <span>Comparing <b>v{pick[0] + 1}</b> ({fmtDate(a.valid_from)}) with <b>v{pick[1] + 1}</b> ({fmtDate(b.valid_from)})</span>
                <span className="cmp-legend"><del className="d-del">removed</del> <ins className="d-ins">inserted</ins> · {changes} change{changes === 1 ? '' : 's'}</span>
              </div>
              <div className="diffpanes">
                <div className="dpane">
                  <div className="dpane-h"><span className="mono">v{pick[0] + 1}</span> <StatusPill status={a.status} /></div>
                  <p className="serif">{ops.map((o, i) => o.t === 'ins' ? null : o.t === 'del' ? <del key={i} className="d-del">{o.w}</del> : <span key={i}>{o.w}</span>)}</p>
                </div>
                <div className="dminimap" aria-hidden="true">
                  {ops.map((o, i) => o.t !== 'eq' ? <span key={i} className={`mm mm-${o.t}`} style={{ top: `${(i / ops.length) * 100}%` }} /> : null)}
                </div>
                <div className="dpane">
                  <div className="dpane-h"><span className="mono">v{pick[1] + 1}</span> <StatusPill status={b.status} /></div>
                  <p className="serif">{ops.map((o, i) => o.t === 'del' ? null : o.t === 'ins' ? <ins key={i} className="d-ins">{o.w}</ins> : <span key={i}>{o.w}</span>)}</p>
                </div>
              </div>
            </>
          )}
          {vs.length === 1 && (
            <div className="dpane solo">
              <div className="dpane-h">Only one version stored <StatusPill status={vs[0].status} /></div>
              <p className="serif">{vs[0].text}</p>
            </div>
          )}

          {edge?.quote && (
            <div className="edgeproof">
              <div className="ep-h"><IDoc size={14} /> Proof of the change · {edge.type === 'AMENDED_BY' ? 'amendment' : edge.type === 'WITHDRAWS' ? 'withdrawal' : (edge.type ?? '').toLowerCase()} effective {fmtDate(edge.effective_date)}</div>
              <blockquote className="serif"><mark className="qhl">{edge.quote}</mark></blockquote>
              <div className="ep-meta">Located on {docShort(edge.quote_doc_id ?? '')} p.{edge.quote_page} (RBI’s own footnote). <button type="button" className="linkbtn" onClick={() => setPdfPage(edge.quote_page ?? 1)}>Open the page</button></div>
              {pdfPage && edge.quote_doc_id && <div className="ep-pdf"><PdfView docId={edge.quote_doc_id} page={pdfPage} onPageChange={setPdfPage} label={`${cleanTitle(edge.quote_doc_id)} p.${pdfPage}`} /></div>}
            </div>
          )}
        </>
      )}

      <section className="sec">
        <header className="sec-head"><h3>Rulebook timeline</h3><span className="sec-note">Issue → withdrawal of each RBI document; the line is the as-of date</span></header>
        <RulebookTimeline />
      </section>
    </div>
  )
}
