// "The law, as of any date", redesigned to be read at a glance (user review: the swimlane graph "does not solve the
// purpose of understanding by a glance"). Three plain questions, one row each. Each row shows which text governed the
// question over time; a single date cursor glides across all rows, and under each row a readout says what applied on
// that date, with the verbatim quote. Data: src/data/landing-graph.json (exported from the DB + conflict triage).
import { useEffect, useMemo, useRef, useState } from 'react'
import graph from '../data/landing-graph.json'
import { fmtDate } from '../lib/format'

type GNode = (typeof graph.nodes)[number]
const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n])) as Record<string, GNode>

const START = '2014-01-01'
const END = '2026-12-31'
const TODAY = '2026-11-23'
// position 0..1 on the axis; 2014–2022 compressed so 2023–2026 (where everything happens) is readable
const STOPS: [string, number][] = [[START, 0], ['2023-01-01', 0.1], ['2025-06-01', 0.42], ['2026-02-01', 0.82], [END, 1]]
const T = (d: string) => Date.parse(d)
function posOf(ms: number): number {
  for (let i = 1; i < STOPS.length; i++) {
    const [d0, p0] = STOPS[i - 1]
    const [d1, p1] = STOPS[i]
    if (ms <= T(d1) || i === STOPS.length - 1) return p0 + Math.max(0, Math.min(1, (ms - T(d0)) / (T(d1) - T(d0)))) * (p1 - p0)
  }
  return 1
}
function msOf(pos: number): number {
  for (let i = 1; i < STOPS.length; i++) {
    const [d0, p0] = STOPS[i - 1]
    const [d1, p1] = STOPS[i]
    if (pos <= p1 || i === STOPS.length - 1) return T(d0) + Math.max(0, Math.min(1, (pos - p0) / (p1 - p0))) * (T(d1) - T(d0))
  }
  return T(END)
}
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const inForce = (n: GNode, d: string) => n.from <= d && (!n.until || d < n.until)

interface Row { q: string; bars: { id: string; label: string }[]; kind: 'rule' | 'bank' }
const ROWS: Row[] = [
  { q: 'Can a UCB charge for pre-paying a floating-rate loan to an individual?', kind: 'rule', bars: [
    { id: 'FORECLOSURE-2014', label: 'Foreclosure circular, 2014' },
    { id: 'PREPAY-2025', label: 'Pre-payment Directions, 2025' },
    { id: 'MD-261-1', label: 'UCB Master Direction ¶261(1)' },
  ] },
  { q: 'At an EMI reset, must the lender offer a switch to a fixed rate?', kind: 'rule', bars: [
    { id: 'EMI-2ii-orig', label: 'EMI reset ¶2(ii): “shall” offer' },
    { id: 'EMI-2ii-sub', label: '¶2(ii) amended: “may, at its option”' },
  ] },
  { q: 'Is our Retail Loan Policy clause 7.4 (2% foreclosure charge) allowed?', kind: 'bank', bars: [
    { id: 'S1-7.4', label: 'Retail Loan Policy 7.4: 2% on all term loans' },
  ] },
]

const MILESTONES: [string, string][] = [
  ['2014-05-07', '2014 circular'], ['2023-08-18', 'EMI reset rule'], ['2025-07-02', 'Pre-payment Directions'],
  ['2025-10-01', '“shall” → “may”'], ['2025-11-28', 'Consolidated into the Master Direction'], [TODAY, 'Today'],
]

function conflictOf(bankId: string, d: string): GNode | null {
  let snap = graph.snapshots[0]
  for (const s of graph.snapshots) if (s.date <= d) snap = s
  const mine = (snap.conflicts as { a: string; b: string; kind: string }[]).filter((x) => x.kind === 'conflict' && (x.a === bankId || x.b === bankId))
  // prefer the headline rule (¶261(1)), then ¶261(2)(ii), then ¶260
  const rank = (x: { a: string; b: string }) => ['MD-261-1', 'MD-261-2-ii', 'MD-260'].indexOf(x.a === bankId ? x.b : x.a)
  const c = mine.sort((x, y) => (rank(x) + 10) % 10 - (rank(y) + 10) % 10)[0]
  if (!c) return null
  const other = byId[c.a === bankId ? c.b : c.a]
  return other && inForce(other, d) ? other : null
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function LawOverTime({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [pos, setPos] = useState(posOf(T('2025-10-15')))
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const d = iso(msOf(pos))

  const cancel = () => { cancelAnimationFrame(raf.current); setPlaying(false) }
  /** Glide the cursor to a date (eased, ~700 ms); instant under reduced motion. */
  const glideTo = (target: string) => {
    cancelAnimationFrame(raf.current)
    setPlaying(false)
    const to = posOf(T(target))
    if (reducedMotion) { setPos(to); return }
    const from = pos
    const t0 = performance.now()
    const dur = 300 + Math.abs(to - from) * 900
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      setPos(from + (to - from) * ease(k))
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }
  /** Play: sweep from 2023 to today at a steady visual speed (~9 s). */
  const play = () => {
    if (playing) { cancel(); return }
    cancelAnimationFrame(raf.current)
    const from = pos >= posOf(T(TODAY)) - 0.005 ? posOf(T('2023-01-01')) : pos
    const to = posOf(T(TODAY))
    const t0 = performance.now()
    const dur = Math.max(1500, (to - from) * 10000)
    setPlaying(true)
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      setPos(from + (to - from) * k)
      if (k < 1) raf.current = requestAnimationFrame(step); else setPlaying(false)
    }
    raf.current = requestAnimationFrame(step)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const years = useMemo(() => ['2014', '2023', '2024', '2025', '2026'], [])
  const pct = (dd: string) => `${posOf(T(dd)) * 100}%`

  return (
    <div className="lot">
      <div className="lot-top">
        <div className="lot-date" aria-live="polite">The law on <b className="tnum">{fmtDate(d)}</b></div>
        <div className="lot-ctl">
          <button type="button" className="mbtn mbtn-gray mbtn-pill" onClick={play} aria-pressed={playing}>{playing ? 'Pause' : '▶ Play 2023 → today'}</button>
          <button type="button" className="mbtn mbtn-gray mbtn-pill" onClick={() => glideTo(TODAY)}>Today</button>
        </div>
      </div>

      <div className="lot-body">
        {/* shared axis + cursor */}
        <div className="lot-axis" aria-hidden="true">
          {years.map((y) => <span key={y} className="lot-year" style={{ left: pct(`${y}-01-01`) }}>{y}</span>)}
          <span className="lot-gap" style={{ left: pct('2018-07-01') }} title="2014–2022 compressed">⋯</span>
        </div>
        <div className="lot-cursor" style={{ left: `${pos * 100}%` }} aria-hidden="true"><span className="lot-cursor-dot" /></div>

        {ROWS.map((row, ri) => {
          const live = row.bars.map((b) => byId[b.id]).filter((n) => inForce(n, d))
          const primary = [...live].sort((a, b) => b.from.localeCompare(a.from))[0]
          const conflict = row.kind === 'bank' ? conflictOf(row.bars[0].id, d) : null
          const notYet = row.bars.every((b) => byId[b.id].issued > d)
          const gone = !primary && !notYet
          const lastGone = gone ? [...row.bars].map((b) => byId[b.id]).filter((n) => n.until && n.until <= d).sort((a, b) => (b.until ?? '').localeCompare(a.until ?? ''))[0] : null
          const stateKey = `${primary?.id ?? 'none'}-${conflict?.id ?? ''}-${notYet}`
          return (
            <section key={ri} className="lot-row">
              <h3 className="lot-q">{row.q}</h3>
              <div className="lot-track">
                {row.bars.map((b) => {
                  const n = byId[b.id]
                  const left = posOf(T(n.from))
                  const right = posOf(T(n.until ?? END))
                  const on = primary?.id === n.id
                  const conflictFrom = row.kind === 'bank' ? '2025-11-28' : null
                  return (
                    <div key={b.id} className={`lot-bar ${on ? 'on' : ''} ${inForce(n, d) ? 'live' : ''} ${row.kind === 'bank' ? 'bank' : ''}`}
                      style={{ left: `${left * 100}%`, width: `${Math.max(0.6, (right - left) * 100)}%` }}>
                      <span className="lot-bar-label">{b.label}</span>
                      {conflictFrom && <span className="lot-bar-conflict" style={{ left: `${((posOf(T(conflictFrom)) - left) / (right - left)) * 100}%` }} title="In conflict with RBI from 28-Nov-2025" />}
                      {n.until && <span className="lot-bar-end" title={`Withdrawn ${fmtDate(n.until)}`} />}
                    </div>
                  )
                })}
              </div>
              <div className="lot-read" key={stateKey}>
                {row.kind === 'bank' ? (
                  conflict
                    ? <><span className="lot-verdict bad">Not allowed: conflicts with {conflict.label.replace('UCB MD', 'UCB Master Direction')}.</span> <span className="serif lot-quote">“{conflict.quote.slice(0, 150)}{conflict.quote.length > 150 ? '…' : ''}”</span></>
                    : notYet ? <span className="lot-verdict">The policy did not exist yet.</span>
                      : <span className="lot-verdict ok">No conflict with an RBI text in force on this date.</span>
                ) : primary ? (
                  <><span className="lot-verdict">Governed by <b>{row.bars.find((b) => b.id === primary.id)?.label}</b>{live.length > 1 ? `, with ${live.length - 1} older text still in force` : ''}.</span> {(() => { const cx = (primary as { context?: string }).context; return cx && cx.length <= 200 ? <span className="serif lot-lead">{cx} </span> : null })()}<span className="serif lot-quote">“{primary.quote.slice(0, 160)}{primary.quote.length > 160 ? '…' : ''}”</span></>
                ) : notYet ? <span className="lot-verdict">No RBI text on this yet.</span>
                  : <span className="lot-verdict">No longer covered here: {lastGone ? `${row.bars.find((b) => b.id === lastGone.id)?.label} was withdrawn on ${fmtDate(lastGone.until)}` : 'withdrawn'}.</span>}
              </div>
            </section>
          )
        })}

        <div className="lot-slider">
          <input type="range" min={0} max={1000} value={Math.round(pos * 1000)} aria-label="Choose a date" aria-valuetext={fmtDate(d)}
            onChange={(e) => { cancel(); setPos(Number(e.target.value) / 1000) }} />
          <div className="lot-miles">
            {MILESTONES.map(([md, l], mi) => (
              <button key={md} type="button" className={`lot-mile ${d >= md ? 'past' : ''} ${mi % 2 ? 'low' : ''}`} style={{ left: pct(md) }} onClick={() => glideTo(md)} title={fmtDate(md)}>
                <span className="lot-mile-dot" /><span className="lot-mile-l">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
