// Hero: the real corpus as an interactive 3D stick graph (research_notes/.../landing_hero_inspection.md).
// Hubs are documents (RBI ring above, Example UCB ring below); satellites are their clauses. Sticks are the real
// relations: contains, REFERS_TO, AMENDED_BY, WITHDRAWS, and CONFLICT pairs from the same triage code as
// GET /conflicts at the chosen date. Canvas 2D with a hand-written perspective projection: no 3D library.
import { useEffect, useMemo, useRef, useState } from 'react'
import data from '../data/corpus-graph.json'
import { docShort, fmtDate } from '../lib/format'

type Hub = (typeof data.hubs)[number]
type Clause = (typeof data.clauses)[number]
interface N { id: string; doc: string; hub: boolean; bank: boolean; core: boolean; phase: number; at: number; label: string; title: string; text?: string; x: number; y: number; z: number }
interface E { a: number; b: number; kind: 'frame' | 'contains' | 'REFERS_TO' | 'AMENDED_BY' | 'WITHDRAWS' | 'CONFLICT'; core: boolean; phase: number; at: number }

const DATES: [string, string][] = [['2024-04-01', '01-Apr-2024'], ['2025-12-01', '01-Dec-2025'], ['2026-11-23', 'Today']]

// Build-up in phases on first view (user: "one by one … so it does not look busy and the judge understands it").
// Each phase has a start time (ms) and a one-line caption; elements inside a phase are staggered.
export const PHASES: { at: number; title: string; caption: string }[] = [
  { at: 300, title: 'RBI rules', caption: 'RBI circulars and directions, joined into one rulebook.' },
  { at: 2400, title: 'Your bank', caption: 'The bank’s own documents: policy, agreements, KFS, letters, FAQ.' },
  { at: 4000, title: 'Clauses', caption: 'The clauses inside them: what gets quoted as evidence.' },
  { at: 5500, title: 'Changes', caption: 'Amendments and withdrawals: which rule replaced which, and when.' },
  { at: 7300, title: 'Conflicts', caption: 'Where the bank’s clauses conflict with RBI rules in force today.' },
]
export const DONE_AT = 9300

function seeded(i: number) { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x) }

function build() {
  const nodes: N[] = []
  const idx: Record<string, number> = {}
  const rbi = data.hubs.filter((h) => !h.bank).sort((a, b) => (a.issued ?? '').localeCompare(b.issued ?? ''))
  const bank = data.hubs.filter((h) => h.bank)
  const place = (list: Hub[], radius: number, y: number, tilt: number) => list.forEach((h, i) => {
    const t = (i / list.length) * Math.PI * 2
    idx[h.id] = nodes.length
    nodes.push({ id: h.id, doc: h.id, hub: true, bank: !!h.bank, core: true, phase: h.bank ? 2 : 1, at: h.bank ? PHASES[1].at + i * 170 : PHASES[0].at + i * 115, label: h.label ?? h.id, title: h.title, x: Math.cos(t) * radius, y: y + Math.sin(t * 2) * tilt, z: Math.sin(t) * radius })
  })
  place(rbi, 1.0, 0.42, 0.12)
  place(bank, 0.62, -0.62, 0.06)
  // Compact by default: only clauses that carry the story (amendment/withdrawal or RBI-vs-bank conflict endpoints),
  // plus two per document for texture. Everything else appears with "Show all links" or around a hovered node.
  const bankIds = new Set(bank.map((h) => h.id))
  const docOf = Object.fromEntries(data.clauses.map((c) => [c.id, c.doc]))
  const coreIds = new Set<string>()
  data.edges.forEach((e) => { if (e.type !== 'REFERS_TO') { coreIds.add(e.a); coreIds.add(e.b) } })
  Object.values(data.conflicts as Record<string, string[][]>).flat().forEach(([a, b]) => {
    if (bankIds.has(docOf[a]) !== bankIds.has(docOf[b])) { coreIds.add(a); coreIds.add(b) }
  })
  let clauseCount = 0
  const byDoc: Record<string, Clause[]> = {}
  data.clauses.forEach((c) => { (byDoc[c.doc] ??= []).push(c) })
  Object.values(byDoc).forEach((cs) => cs.slice(0, 2).forEach((c) => coreIds.add(c.id)))
  Object.entries(byDoc).forEach(([doc, cs]) => {
    const h = nodes[idx[doc]]
    if (!h) return
    const r = 0.16 + Math.min(0.2, cs.length * 0.008)
    cs.forEach((c, i) => {
      // golden-spiral shell around the hub
      const k = i + 0.5
      const phi = Math.acos(1 - (2 * k) / cs.length)
      const th = Math.PI * (1 + Math.sqrt(5)) * k
      const rr = r * (0.75 + 0.35 * seeded(i + doc.length))
      idx[c.id] = nodes.length
      nodes.push({ id: c.id, doc, hub: false, bank: h.bank, core: coreIds.has(c.id), phase: 3, at: PHASES[2].at + (clauseCount++ % 60) * 20, label: c.label, title: h.title, text: c.text, x: h.x + rr * Math.cos(th) * Math.sin(phi), y: h.y + rr * Math.cos(phi), z: h.z + rr * Math.sin(th) * Math.sin(phi) })
    })
  })
  const edges: E[] = []
  // The frame (user request: "join the outer portions so it appears as a polygon"): each ring of documents is closed
  // into a polygon, and every bank document is strutted to its two nearest RBI documents, so the corpus reads as one
  // wireframe solid. Frame sticks are structure only; they are not relations and are drawn hairline-thin.
  const ring = (ids: string[], phase: number) => ids.forEach((id, i) => { const a = idx[id]; const b = idx[ids[(i + 1) % ids.length]]; edges.push({ a, b, kind: 'frame', core: true, phase, at: Math.max(nodes[a].at, nodes[b].at) + 120 }) })
  ring(rbi.map((h) => h.id), 1)
  ring(bank.map((h) => h.id), 2)
  bank.forEach((h) => {
    const b = nodes[idx[h.id]]
    const near = rbi.map((r) => nodes[idx[r.id]]).map((r, k) => [k, Math.atan2(r.z, r.x)] as [number, number])
      .map(([k, ang]) => [k, Math.abs(Math.atan2(Math.sin(ang - Math.atan2(b.z, b.x)), Math.cos(ang - Math.atan2(b.z, b.x))))] as [number, number])
      .sort((x, y) => x[1] - y[1]).slice(0, 2)
    near.forEach(([k]) => edges.push({ a: idx[h.id], b: idx[rbi[k].id], kind: 'frame', core: true, phase: 2, at: nodes[idx[h.id]].at + 220 }))
  })
  nodes.forEach((n, i) => { if (!n.hub && idx[n.doc] != null) edges.push({ a: idx[n.doc], b: i, kind: 'contains', core: n.core, phase: 3, at: n.at }) })
  let chg = 0
  data.edges.forEach((e) => { if (idx[e.a] != null && idx[e.b] != null) edges.push({ a: idx[e.a], b: idx[e.b], kind: e.type as E['kind'], core: e.type !== 'REFERS_TO', phase: 4, at: PHASES[3].at + (e.type === 'REFERS_TO' ? 0 : chg++ * 240) }) })
  return { nodes, edges, idx }
}

function status(h: Hub | undefined, d: string): 'future' | 'inforce' | 'withdrawn' {
  if (!h) return 'inforce'
  if (h.issued && h.issued > d) return 'future'
  if (h.until && h.until <= d) return 'withdrawn'
  return 'inforce'
}

export function StickGraph({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const { nodes, edges, idx } = useMemo(build, [])
  const hubs = useMemo(() => Object.fromEntries(data.hubs.map((h) => [h.id, h])), [])
  const [asOf, setAsOf] = useState('2026-11-23')
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [cap, setCap] = useState<number | null>(reducedMotion ? 5 : null) // a chosen phase (stepper), or null = play the build-up
  const [phaseNow, setPhaseNow] = useState(reducedMotion ? 5 : 0)
  const startAt = useRef(performance.now())
  const replay = () => { startAt.current = performance.now(); setCap(null); setPhaseNow(0); setPinned(null); setHover(null); setTip(null) }
  const view = useRef({ yaw: 0.6, pitch: -0.5, vyaw: reducedMotion ? 0 : 0.0016, dragging: false, lx: 0, ly: 0, moved: 0 })
  const proj = useRef<{ x: number; y: number; s: number; z: number }[]>([])
  const phaseRef = useRef(reducedMotion ? 5 : 0)
  const colors = useRef<Record<string, string>>({})

  const conflicts = useMemo(() => {
    const pairs = (data.conflicts as Record<string, string[][]>)[asOf] ?? []
    // core = RBI vs bank; bank-vs-bank inconsistencies only with "Show all links"
    return pairs.map(([a, b]) => ({ a: idx[a], b: idx[b], kind: 'CONFLICT' as const, core: true, phase: 5, at: 0 }))
      .filter((e) => e.a != null && e.b != null).map((e) => ({ ...e, core: nodes[e.a].bank !== nodes[e.b].bank }))
      .map((e, k, arr) => ({ ...e, at: PHASES[4].at + arr.slice(0, k).filter((x) => x.core).length * 190 }))
  }, [asOf, idx, nodes])
  const st = useMemo(() => nodes.map((n) => status(hubs[n.doc], asOf)), [nodes, hubs, asOf])

  // read theme colours from CSS variables (and again when the theme flips)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const v = (k: string) => cs.getPropertyValue(k).trim()
      colors.current = { ink: v('--ink'), ink3: v('--ink-3'), line: v('--line-strong'), accent: v('--accent'), bank: v('--bank'), rbi: v('--rbi'), conflict: v('--conflict'), sup: v('--superseded'), paper: v('--surface') }
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const c = canvas.current
    const w = wrap.current
    if (!c || !w) return
    let raf = 0
    let W = 0
    let H = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      W = w.clientWidth
      H = w.clientHeight
      c.width = W * dpr
      c.height = H * dpr
      c.style.width = `${W}px`
      c.style.height = `${H}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(w)
    const ctx = c.getContext('2d')!
    const all = [...edges, ...conflicts]
    const focus = pinned ?? hover
    const linked = new Set<number>()
    if (focus != null) all.forEach((e) => { if (e.kind === 'frame') return; if (e.a === focus) linked.add(e.b); if (e.b === focus) linked.add(e.a) })
    const shownNode = (i: number) => showAll || nodes[i].core || i === focus || linked.has(i)
    const shownEdge = (e: { a: number; b: number; core: boolean }) => showAll || e.core || (focus != null && (e.a === focus || e.b === focus))

    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const frame = () => {
      const el = cap != null ? Infinity : performance.now() - startAt.current
      const visPhase = cap ?? 5
      const reveal = (o: { phase: number; at: number }, dur: number) => (o.phase > visPhase ? 0 : el === Infinity ? 1 : ease(Math.max(0, Math.min(1, (el - o.at) / dur))))
      const changesOn = cap != null ? cap >= 4 : el >= PHASES[3].at
      if (cap == null) {
        let ph = 0
        PHASES.forEach((p, k) => { if (el >= p.at) ph = k + 1 })
        if (ph !== phaseRef.current) { phaseRef.current = ph; setPhaseNow(ph) }
      }
      const v = view.current
      if (!v.dragging && focus == null) { v.yaw += v.vyaw; v.vyaw = reducedMotion ? v.vyaw * 0.94 : v.vyaw + (0.0016 - v.vyaw) * 0.02 }
      const cy = Math.cos(v.yaw); const sy = Math.sin(v.yaw); const cp = Math.cos(v.pitch); const sp = Math.sin(v.pitch)
      const scale = Math.min(W * 0.78, H) * 0.5
      const f = 3.2
      proj.current = nodes.map((n) => {
        const x1 = n.x * cy - n.z * sy
        const z1 = n.x * sy + n.z * cy
        const y2 = n.y * cp - z1 * sp
        const z2 = n.y * sp + z1 * cp
        const s = f / (f + z2)
        return { x: W / 2 + x1 * s * scale, y: H / 2 - y2 * s * scale, s, z: z2 }
      })
      const P = proj.current
      const col = colors.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      // sticks, back to front
      const order = all.map((e, i) => [i, (P[e.a].z + P[e.b].z) / 2] as [number, number]).sort((a, b) => b[1] - a[1])
      for (const [i] of order) {
        const e = all[i]
        const rv = reveal(e, 520)
        if (rv <= 0) continue
        // sticks draw in from one end
        const ex = P[e.a].x + (P[e.b].x - P[e.a].x) * rv
        const ey = P[e.a].y + (P[e.b].y - P[e.a].y) * rv
        if (e.kind === 'frame') {
          const depthF = Math.max(0.25, Math.min(1, 1.25 - (P[e.a].z + P[e.b].z) / 4))
          ctx.globalAlpha = (focus != null ? 0.12 : 0.38) * depthF
          ctx.strokeStyle = col.ink3
          ctx.lineWidth = 0.7
          ctx.setLineDash([])
          ctx.beginPath(); ctx.moveTo(P[e.a].x, P[e.a].y); ctx.lineTo(ex, ey); ctx.stroke()
          continue
        }
        if (!shownEdge(e) || !shownNode(e.a) || !shownNode(e.b)) continue
        const sa = changesOn ? st[e.a] : 'inforce'
        const sb = changesOn ? st[e.b] : 'inforce'
        if (sa === 'future' || sb === 'future') continue
        const dead = sa === 'withdrawn' || sb === 'withdrawn'
        const depth = Math.max(0.25, Math.min(1, 1.25 - (P[e.a].z + P[e.b].z) / 4))
        const hot = focus != null && (e.a === focus || e.b === focus)
        const dim = focus != null && !hot
        let color = col.line
        let width = 0.8
        let alpha = 0.32 * depth
        if (e.kind === 'REFERS_TO') { color = col.accent; alpha = 0.35 * depth }
        if (e.kind === 'AMENDED_BY' || e.kind === 'WITHDRAWS') { color = col.ink; width = 1.4; alpha = 0.8 * depth }
        if (e.kind === 'CONFLICT') { if (dead) continue; color = col.conflict; width = 1.5; alpha = 0.9 }
        if (dead && e.kind !== 'WITHDRAWS') alpha *= 0.3
        if (hot) { alpha = 1; width += 0.8 }
        if (dim) alpha *= 0.25
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = width
        if (e.kind === 'CONFLICT') ctx.setLineDash([4, 3]); else ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(P[e.a].x, P[e.a].y)
        ctx.lineTo(ex, ey)
        ctx.stroke()
      }
      ctx.setLineDash([])
      // nodes
      const nOrder = nodes.map((_, i) => i).sort((a, b) => P[b].z - P[a].z)
      for (const i of nOrder) {
        const n = nodes[i]
        const s = changesOn ? st[i] : st[i] === 'future' ? 'future' : 'inforce'
        if (s === 'future' || !shownNode(i)) continue
        const rv = reveal(n, 420)
        if (rv <= 0) continue
        const p = P[i]
        const r = (n.hub ? 4.2 : 1.9) * p.s * (i === focus ? 1.8 : 1) * (0.4 + 0.6 * rv)
        const dim = focus != null && i !== focus && !linked.has(i)
        ctx.globalAlpha = rv * (s === 'withdrawn' ? 0.3 : 1) * (dim ? 0.3 : 1) * Math.max(0.35, Math.min(1, 1.2 - p.z / 3))
        ctx.fillStyle = n.bank ? col.bank : s === 'withdrawn' ? col.sup : n.hub ? col.ink : col.ink3
        if (n.hub) {
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2)
          ctx.globalAlpha *= 0.9
          ctx.fillStyle = col.paper
          ctx.fillRect(p.x - r * 0.45, p.y - r * 0.45, r * 0.9, r * 0.9)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // hub labels for the front half
      ctx.globalAlpha = 1
      ctx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace'
      const placed: [number, number][] = []
      const front = nOrder.filter((i) => nodes[i].hub && st[i] !== 'future').sort((a, b) => P[a].z - P[b].z)
      for (const i of front) {
        const n = nodes[i]
        const text = docShort(n.doc, n.title)
        const tw = ctx.measureText(text).width
        const fx = P[i].x + 9 + tw > W - 4 ? P[i].x - 9 - tw : P[i].x + 9
        const fy = P[i].y + 3.5
        const isFocus = i === focus || linked.has(i)
        const lr = reveal(n, 600)
        if (lr <= 0) continue
        if (!isFocus && (P[i].z > 0.2 || placed.length >= 9 || placed.some(([x, y]) => Math.abs(x - fx) < 120 && Math.abs(y - fy) < 14))) continue
        placed.push([fx, fy])
        ctx.globalAlpha = lr * (changesOn && st[i] === 'withdrawn' ? 0.4 : 0.9) * (focus != null && !isFocus ? 0.3 : 1)
        ctx.lineWidth = 3.5
        ctx.strokeStyle = col.paper
        ctx.lineJoin = 'round'
        ctx.strokeText(text, fx, fy)
        ctx.fillStyle = n.bank ? col.bank : col.ink
        ctx.fillText(text, fx, fy)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [nodes, edges, conflicts, st, hover, pinned, reducedMotion, showAll, cap])

  const pick = (x: number, y: number) => {
    let best = -1
    let bd = 14 * 14
    proj.current.forEach((p, i) => {
      if (st[i] === 'future' || (!showAll && !nodes[i].core)) return
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bd) { bd = d; best = i }
    })
    return best >= 0 ? best : null
  }
  const local = (e: React.PointerEvent) => { const r = wrap.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const onDown = (e: React.PointerEvent) => { const v = view.current; v.dragging = true; v.lx = e.clientX; v.ly = e.clientY; v.moved = 0; (e.target as Element).setPointerCapture(e.pointerId) }
  const onMove = (e: React.PointerEvent) => {
    const v = view.current
    if (v.dragging) {
      const dx = e.clientX - v.lx
      const dy = e.clientY - v.ly
      v.moved += Math.abs(dx) + Math.abs(dy)
      v.yaw += dx * 0.006
      v.pitch = Math.max(-1.2, Math.min(1.2, v.pitch + dy * 0.005))
      v.vyaw = dx * 0.0006
      v.lx = e.clientX
      v.ly = e.clientY
      return
    }
    const p = local(e)
    const i = pick(p.x, p.y)
    setHover(i)
    setTip(i != null ? p : null)
  }
  const onUp = (e: React.PointerEvent) => {
    const v = view.current
    v.dragging = false
    if (v.moved < 4) { const p = local(e); const i = pick(p.x, p.y); setPinned(i === pinned ? null : i); if (i != null) setTip(p) }
  }

  const focus = pinned ?? hover
  const fn = focus != null ? nodes[focus] : null
  const fh = fn ? hubs[fn.doc] : null
  const fs = focus != null ? st[focus] : null
  const nConf = conflicts.filter((c) => (showAll || c.core) && st[c.a] === 'inforce' && st[c.b] === 'inforce').length
  const inForce = data.hubs.filter((h) => !h.bank && status(h, asOf) === 'inforce').length

  return (
    <div className="sg">
      <div className="sg-top">
        <div className="mseg" role="group" aria-label="Law as of">
          {DATES.map(([d, l]) => <button key={d} type="button" className={`mseg-b ${asOf === d ? 'on' : ''}`} aria-pressed={asOf === d} onClick={() => { setAsOf(d); setHover(null); setPinned(null); setTip(null) }}>{l}</button>)}
        </div>
        <span className="sg-stat">{inForce} RBI texts in force · <b className="sg-red">{nConf} {showAll ? 'conflicts' : 'conflicts with RBI'}</b></span>
        <label className="mswitch"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /><span className="mswitch-track" aria-hidden="true" />Show all links</label>
      </div>
      <div className="sg-canvas" ref={wrap} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { if (!view.current.dragging) { setHover(null); if (pinned == null) setTip(null) } }}
        role="img" aria-label={`Interactive graph of ${data.hubs.length} documents and ${data.clauses.length} clauses as of ${fmtDate(asOf)}. Drag to rotate; select a node for its text.`}>
        <canvas ref={canvas} />
        <span className="sg-corner tl" /><span className="sg-corner tr" /><span className="sg-corner bl" /><span className="sg-corner br" />
        {fn && tip && fs !== 'future' && (
          <div className="sg-tip" style={{ left: Math.min(tip.x + 14, (wrap.current?.clientWidth ?? 600) - 290), top: Math.max(8, tip.y - 20) }}>
            <div className="sg-tip-h">{fn.hub ? (fh?.bank ? 'Example UCB document' : 'RBI document') : 'Clause'} <span className={`sg-st sg-st-${fs}`}>{fs === 'withdrawn' ? 'withdrawn' : 'in force'}</span></div>
            <div className="sg-tip-t">{fn.title}</div>
            {fn.hub ? <div className="sg-tip-m mono">{fh?.label} · issued {fmtDate(fh?.issued)}{fh?.until ? ` · withdrawn ${fmtDate(fh.until)}` : ''}</div>
              : <><div className="sg-tip-m mono">¶ {fn.label}</div>{fn.text && <div className="sg-tip-q serif">“{fn.text}{fn.text.length >= 150 ? '…' : ''}”</div>}</>}
          </div>
        )}
      </div>
      <div className="sg-phases">
        <ol className="sg-steps" aria-label="Build the graph step by step">
          {PHASES.map((p, k) => (
            <li key={p.title}><button type="button" className={`sg-step ${phaseNow > k ? 'done' : ''} ${phaseNow === k + 1 ? 'now' : ''}`} onClick={() => { setCap(k + 1); setPhaseNow(k + 1); phaseRef.current = k + 1 }}
              aria-current={phaseNow === k + 1 ? 'step' : undefined}><span className="sg-step-n">{k + 1}</span>{p.title}</button></li>
          ))}
          <li><button type="button" className="sg-replay" onClick={replay}>Replay</button></li>
        </ol>
        <p className="sg-caption" aria-live="polite" key={phaseNow}>{phaseNow === 0 ? ' ' : PHASES[phaseNow - 1].caption}</p>
      </div>
      <div className="sg-legend">
        <span><i className="lg-sq" />RBI document</span><span><i className="lg-sq lg-bank" />Bank document</span><span><i className="lg-dot" />clause</span>
        {showAll && <span><i className="lg-ln lg-ref" />refers to</span>}<span><i className="lg-ln lg-amd" />amends / withdraws</span><span><i className="lg-ln lg-conf" />conflict</span>
        <span className="sg-hint">Drag to rotate · select a node</span>
      </div>
    </div>
  )
}
