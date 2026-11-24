// Dashboard graph views (landing_page_research.md §5b). Hand-written SVG with computed columns: the research picked
// React Flow + dagre, but with fixed two/three-column layouts and < 120 nodes no layout engine is needed, so this keeps
// the bundle small and the paper styling exact (the same reason §5a gives for the landing graph).
import { useMemo, useState } from 'react'
import type { Conflict, ImpactItem, Version } from '../api'
import { docShort, fmtDate, humanSubject, isBankDoc } from '../lib/format'

const RANK: Record<string, number> = { CONFLICT: 3, NEEDS_REVIEW: 2, DIFFERENT_CONDITION: 1, SUPERSESSION: 1 }

/* ---------- (b) Conflict map: bipartite RBI clauses ↔ bank clauses, with a matrix toggle ---------- */
export function ConflictMap({ items, onSelect }: { items: Conflict[]; onSelect: (c: Conflict) => void }) {
  const [view, setView] = useState<'map' | 'matrix'>('map')
  const [showDiff, setShowDiff] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const pairs = useMemo(() => items.filter((c) => isBankDoc(c.a.doc_id) !== isBankDoc(c.b.doc_id)).map((c) => {
    const [bank, rbi] = isBankDoc(c.a.doc_id) ? [c.a, c.b] : [c.b, c.a]
    return { c, bank, rbi }
  }), [items])
  const bankBank = items.filter((c) => isBankDoc(c.a.doc_id) && isBankDoc(c.b.doc_id)).length
  const rbiRbi = items.filter((c) => !isBankDoc(c.a.doc_id) && !isBankDoc(c.b.doc_id)).length
  const shown = pairs.filter((p) => showDiff || p.c.verdict !== 'DIFFERENT_CONDITION')

  // left: RBI clauses grouped by subject; right: bank clauses grouped by document
  const left = useMemo(() => {
    const m = new Map<string, { key: string; label: string; subject: string }>()
    shown.forEach(({ rbi, c }) => { const k = `${rbi.doc_id}|${rbi.clause}`; if (!m.has(k)) m.set(k, { key: k, label: `${docShort(rbi.doc_id)} ${rbi.clause}`, subject: c.subject }) })
    return [...m.values()].sort((a, b) => a.subject.localeCompare(b.subject) || a.label.localeCompare(b.label))
  }, [shown])
  const right = useMemo(() => {
    const m = new Map<string, { key: string; label: string; doc: string }>()
    shown.forEach(({ bank }) => { const k = `${bank.doc_id}|${bank.clause}`; if (!m.has(k)) m.set(k, { key: k, label: `§${bank.clause.replace(/#(\d+)$/, ' (copy $1)')}`, doc: bank.doc_id }) })
    return [...m.values()].sort((a, b) => a.doc.localeCompare(b.doc) || a.label.localeCompare(b.label))
  }, [shown])

  const RH = 24
  const W = 1000
  const LX = 250
  const RX = 690
  const yL = (k: string) => 40 + left.findIndex((n) => n.key === k) * RH + groupOffset(left.map((n) => n.subject), left.findIndex((n) => n.key === k))
  const yR = (k: string) => 40 + right.findIndex((n) => n.key === k) * RH + groupOffset(right.map((n) => n.doc), right.findIndex((n) => n.key === k))
  const H = Math.max(left.length * RH + new Set(left.map((n) => n.subject)).size * 18, right.length * RH + new Set(right.map((n) => n.doc)).size * 18) + 60

  // matrix: subject × bank document, worst verdict
  const subjects = [...new Set(pairs.map((p) => p.c.subject))].sort()
  const bankDocs = [...new Set(pairs.map((p) => p.bank.doc_id))].sort()
  const cell = (s: string, d: string) => {
    const ps = pairs.filter((p) => p.c.subject === s && p.bank.doc_id === d)
    const worst = ps.reduce((w, p) => (RANK[p.c.verdict] > RANK[w] ? p.c.verdict : w), 'NONE')
    return { n: ps.length, worst, conf: ps.filter((p) => p.c.verdict === 'CONFLICT').length }
  }

  return (
    <div className="gmap">
      <div className="gmap-tools">
        <div className="seg">
          <button type="button" className={`seg-b ${view === 'map' ? 'on' : ''}`} onClick={() => setView('map')}>Map</button>
          <button type="button" className={`seg-b ${view === 'matrix' ? 'on' : ''}`} onClick={() => setView('matrix')}>Matrix</button>
        </div>
        {view === 'map' && <label className="check small"><input type="checkbox" checked={showDiff} onChange={(e) => setShowDiff(e.target.checked)} /> Show different-condition pairs</label>}
        <span className="glegend"><span className="gl gl-conf" />conflict <span className="gl gl-rev" />needs review <span className="gl gl-diff" />different condition</span>
        {(bankBank > 0 || rbiRbi > 0) && <span className="hint">Not drawn here: {bankBank} pairs inside the bank’s own documents{rbiRbi ? ` and ${rbiRbi} between RBI texts` : ''} (see the board).</span>}
      </div>
      {view === 'map' ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="gsvg" role="img" aria-label="Conflict map: RBI clauses on the left, Example UCB clauses on the right">
          <text x={LX} y={20} textAnchor="end" className="g-colh">RBI clauses in force · by subject</text>
          <text x={RX} y={20} className="g-colh">Example UCB clauses · by document</text>
          {groupHeads(left.map((n) => n.subject)).map(([g, i]) => <text key={g} x={LX} y={40 + i * RH + groupOffset(left.map((n) => n.subject), i) - 8} textAnchor="end" className="g-group">{humanSubject(g)}</text>)}
          {groupHeads(right.map((n) => n.doc)).map(([g, i]) => <text key={g} x={RX} y={40 + i * RH + groupOffset(right.map((n) => n.doc), i) - 8} className="g-group g-bankg">{docShort(g)}</text>)}
          {shown.map((p, i) => {
            const y1 = yL(`${p.rbi.doc_id}|${p.rbi.clause}`) + 6
            const y2 = yR(`${p.bank.doc_id}|${p.bank.clause}`) + 6
            return (
              <g key={i} className={`g-edge g-${p.c.verdict.toLowerCase()} ${hover === i ? 'on' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(p.c)} tabIndex={0} role="button" aria-label={`${p.c.verdict}: ${p.rbi.clause} and ${docShort(p.bank.doc_id)} ${p.bank.clause}`} onKeyDown={(k) => k.key === 'Enter' && onSelect(p.c)}>
                <path d={`M${LX + 8},${y1} C${(LX + RX) / 2},${y1} ${(LX + RX) / 2},${y2} ${RX - 8},${y2}`} className="g-line" />
                <path d={`M${LX + 8},${y1} C${(LX + RX) / 2},${y1} ${(LX + RX) / 2},${y2} ${RX - 8},${y2}`} className="g-hit" />
              </g>
            )
          })}
          {left.map((n) => <g key={n.key}><circle cx={LX + 4} cy={yL(n.key) + 6} r={3.5} className="g-dot g-dot-rbi" /><text x={LX - 6} y={yL(n.key) + 10} textAnchor="end" className="g-label">{n.label}</text></g>)}
          {right.map((n) => <g key={n.key}><circle cx={RX - 4} cy={yR(n.key) + 6} r={3.5} className="g-dot g-dot-bank" /><text x={RX + 6} y={yR(n.key) + 10} className="g-label">{n.label}</text></g>)}
        </svg>
      ) : (
        <table className="gmatrix">
          <thead><tr><th>Subject</th>{bankDocs.map((d) => <th key={d}>{docShort(d)}</th>)}</tr></thead>
          <tbody>{subjects.map((s) => (
            <tr key={s}><th>{humanSubject(s)}</th>{bankDocs.map((d) => {
              const c = cell(s, d)
              return <td key={d} className={`gm gm-${c.worst.toLowerCase()}`}>{c.n ? <><b className="tnum">{c.n}</b>{c.conf ? <span> · {c.conf} conflict{c.conf === 1 ? '' : 's'}</span> : null}</> : '—'}</td>
            })}</tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}

function groupOffset(groups: string[], i: number): number {
  let n = 0
  for (let k = 0; k <= i; k++) if (k === 0 || groups[k] !== groups[k - 1]) n++
  return n * 18
}
function groupHeads(groups: string[]): [string, number][] {
  return groups.map((g, i) => [g, i] as [string, number]).filter(([g, i]) => i === 0 || groups[i - 1] !== g)
}

/* ---------- (c) Impact graph: circular → obligations → bank clauses (fan-out to counted groups) ---------- */
export function ImpactGraph({ items, circular, onPick }: { items: ImpactItem[]; circular: string; onPick: (it: ImpactItem) => void }) {
  const [all, setAll] = useState(false)
  const sorted = [...items].sort((a, b) => (RANK[b.verdict] ?? 0) - (RANK[a.verdict] ?? 0))
  const top = all ? sorted : sorted.slice(0, 30)
  const obs = [...new Map(top.map((i) => [i.obligation.clause, i])).values()].map((i) => i.obligation.clause).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const banks = [...new Map(top.map((i) => [`${i.internal.doc_id}|${i.internal.clause}`, i])).values()]
    .sort((a, b) => a.internal.doc_id.localeCompare(b.internal.doc_id) || a.internal.clause.localeCompare(b.internal.clause, undefined, { numeric: true }))
  const RH = 26
  const H = Math.max(obs.length, banks.length) * RH + 70
  const W = 1000
  const yO = (c: string) => 50 + obs.indexOf(c) * RH * (Math.max(obs.length, banks.length) / Math.max(obs.length, 1))
  const yB = (k: string) => 50 + banks.findIndex((i) => `${i.internal.doc_id}|${i.internal.clause}` === k) * RH * (Math.max(obs.length, banks.length) / Math.max(banks.length, 1))
  const yC = (H - 20) / 2
  const counts = (c: string) => { const xs = top.filter((i) => i.obligation.clause === c); return `${xs.length} clause${xs.length === 1 ? '' : 's'} · ${xs.filter((i) => i.verdict === 'CONFLICT').length} conflict${xs.filter((i) => i.verdict === 'CONFLICT').length === 1 ? '' : 's'}` }
  return (
    <div className="gmap">
      <div className="gmap-tools">
        <span className="glegend"><span className="gl gl-conf" />conflict <span className="gl gl-rev" />needs review</span>
        {sorted.length > 30 && <button type="button" className="linkbtn" onClick={() => setAll(!all)}>{all ? 'Show top 30 by severity' : `Show all ${sorted.length}`}</button>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="gsvg" role="img" aria-label="Impact graph: circular, its obligations, and the bank clauses they hit">
        <text x={40} y={22} className="g-colh">Circular</text>
        <text x={330} y={22} className="g-colh">Obligations hit · {obs.length}</text>
        <text x={700} y={22} className="g-colh">Example UCB clauses · {banks.length}</text>
        {top.map((it, i) => {
          const yo = yO(it.obligation.clause) + 6
          const yb = yB(`${it.internal.doc_id}|${it.internal.clause}`) + 6
          return <path key={i} d={`M${490},${yo} C${600},${yo} ${600},${yb} ${700},${yb}`} className={`g-line g-${it.verdict.toLowerCase()}`} />
        })}
        {obs.map((c) => <path key={'c' + c} d={`M${200},${yC} C${270},${yC} ${270},${yO(c) + 6} ${330},${yO(c) + 6}`} className="g-line g-trunk" />)}
        <g transform={`translate(20,${yC - 26})`}>
          <rect width={180} height={52} rx={6} className="g-box" />
          <text x={12} y={20} className="g-label g-strong">{docShort(circular)}</text>
          <text x={12} y={38} className="g-sub">{top.length} items shown</text>
        </g>
        {obs.map((c) => (
          <g key={c} transform={`translate(330,${yO(c) - 8})`}>
            <rect width={160} height={28} rx={4} className="g-box g-box-rbi" />
            <text x={8} y={12} className="g-label">¶{c}</text>
            <text x={8} y={23} className="g-sub">{counts(c)}</text>
          </g>
        ))}
        {banks.map((it) => {
          const k = `${it.internal.doc_id}|${it.internal.clause}`
          return (
            <g key={k} transform={`translate(700,${yB(k) - 6})`} className="g-pick" onClick={() => onPick(it)} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onPick(it)}
              aria-label={`${docShort(it.internal.doc_id)} clause ${it.internal.clause}, ${it.review_state}`}>
              <rect width={290} height={24} rx={4} className="g-box g-box-bank" />
              <text x={10} y={16} className="g-label">{docShort(it.internal.doc_id)} §{it.internal.clause.replace(/#\d+$/, '')}</text>
              <text x={282} y={16} textAnchor="end" className={`g-badge g-badge-${it.review_state}`}>{it.review_state === 'open' ? 'open' : it.review_state === 'signed_off' ? 'signed off' : 'decided'}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- (a) Provision timeline: version bars, change markers, the as-of cursor ---------- */
export function ProvisionTimeline({ versions, edges, asOf, onPick, picked }: { versions: Version[]; edges: { type?: string; effective_date?: string }[]; asOf: string; onPick?: (i: number) => void; picked?: number[] }) {
  if (!versions.length) return null
  const start = versions[0].valid_from
  const lastEnd = versions[versions.length - 1].valid_to
  const end = [lastEnd, asOf, '2026-12-31'].filter(Boolean).sort().reverse()[0] as string
  const t0 = Date.parse(start) - 90 * 864e5
  const t1 = Date.parse(end) + 30 * 864e5
  const W = 1000
  const x = (d: string) => 20 + ((Date.parse(d) - t0) / (t1 - t0)) * (W - 40)
  const years: string[] = []
  for (let y = new Date(t0).getFullYear() + 1; y <= new Date(t1).getFullYear(); y++) years.push(`${y}-01-01`)
  return (
    <svg viewBox={`0 0 ${W} 92`} className="gsvg ptl" role="img" aria-label="Version timeline">
      <defs><pattern id="ptl-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" className="asg-hatchline" /></pattern></defs>
      {years.map((y) => <g key={y}><line x1={x(y)} x2={x(y)} y1={14} y2={70} className="asg-grid" /><text x={x(y) + 3} y={86} className="asg-year">{y.slice(0, 4)}</text></g>)}
      {versions.map((v, i) => {
        const x0 = x(v.valid_from)
        const x1 = x(v.valid_to ?? end)
        const cur = v.status === 'IN_FORCE'
        return (
          <g key={v.version_id} className={`ptl-bar ${picked?.includes(i) ? 'on' : ''}`} onClick={() => onPick?.(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onPick?.(i)}>
            <rect x={x0} y={30} width={Math.max(4, x1 - x0)} height={20} rx={3} className={cur ? 'ptl-cur' : 'ptl-old'} />
            {!cur && <rect x={x0} y={30} width={Math.max(4, x1 - x0)} height={20} rx={3} fill="url(#ptl-hatch)" />}
            <text x={x0 + 6} y={44} className="ptl-text">v{i + 1} · {v.op === 'original' ? 'original' : 'substituted'} · {fmtDate(v.valid_from)}</text>
            {v.valid_to && <text x={x1} y={26} textAnchor="middle" className="asg-x">✕</text>}
          </g>
        )
      })}
      {edges.filter((e) => e.effective_date).map((e, i) => <g key={i}><path d={`M${x(e.effective_date!) - 5},${58} l5,-6 l5,6 l-5,6 z`} className="ptl-diamond" /><text x={x(e.effective_date!) + 8} y={66} className="asg-year">{e.type === 'AMENDED_BY' ? 'amended' : (e.type ?? '').toLowerCase()}</text></g>)}
      <line x1={x(asOf)} x2={x(asOf)} y1={8} y2={72} className="asg-cursor" />
      <text x={x(asOf) > W - 120 ? x(asOf) - 4 : x(asOf) + 4} y={14} textAnchor={x(asOf) > W - 120 ? 'end' : 'start'} className="ptl-asof">as of {fmtDate(asOf)}</text>
    </svg>
  )
}
