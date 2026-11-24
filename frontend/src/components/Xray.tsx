// Pipeline X-ray drawer: what happened to the question, stage by stage (showcase map rows 7–19).
// Uses result.timings when the backend returns it; otherwise shows counts only and says so.
import { useEffect, useState, type ReactNode } from 'react'
import { api, type AskResult, type TraceRow } from '../api'
import { fmtDate, humanSubject, inrShort, profileLabel, shortHash } from '../lib/format'
import { useApp } from '../state'
import { IX } from './Icons'
import { OutcomeBadge, VerdictPill } from './primitives'

interface Stage { key: string; name: string; who: 'model' | 'code' | 'local'; summary: ReactNode; detail?: ReactNode; ms?: number }

function caseChips(c: Record<string, string | number> = {}) {
  return Object.entries(c).map(([k, v]) => {
    const val = k === 'amount_inr' && typeof v === 'number' ? inrShort(v) : k.includes('date') ? fmtDate(String(v)) : String(v)
    return <span key={k} className="qchip"><span className="qk">{k.replace(/_inr$/, '').replace(/_/g, ' ')}</span> {val}</span>
  })
}

export function XrayDrawer({ r, open, onClose }: { r: AskResult; open: boolean; onClose: () => void }) {
  const { health, reducedMotion } = useApp()
  const [trace, setTrace] = useState<TraceRow | null>(null)
  useEffect(() => {
    if (!open) return
    api.trace(r.query_id).then((rows) => setTrace(rows[0] ?? null)).catch(() => setTrace(null))
  }, [open, r.query_id])
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])

  const tm = r.timings ?? {}
  const p = r.plan ?? {}
  const all = [...r.sentences, ...r.blocked]
  const supportCount = (k: string) => all.filter((s) => s.checks.some((c) => c.startsWith('e:' + k))).length
  const gateFail = (g: string) => r.blocked.filter((b) => !b.checks.some((c) => c.startsWith(g))).length
  let egress: { eid: string; chars: number }[] = []
  try { egress = JSON.parse(trace?.egress_manifest_json ?? '[]') } catch { /* */ }
  const f = r.faithfulness ?? {}
  const replay = health?.llm_mode === 'replay'
  const draftModel = 'The drafting model'
  const planModel = 'The planning model'
  const ruleCounts = ['APPLIES', 'DOES_NOT_APPLY', 'STATUS'].map((v) => [v, r.rules.filter((x) => x.verdict === v).length] as const).filter(([, n]) => n)

  const stages: Stage[] = [
    { key: 'understand', name: 'Understand', who: 'model', ms: tm.understand,
      summary: <>{planModel} turned the question into {p.sub_queries?.length ?? 0} search queries, {p.subjects?.length ?? 0} subject{p.subjects?.length === 1 ? '' : 's'} and {Object.keys(p.case ?? {}).length} case facts{p.lang && p.lang !== 'en' ? ` (translated from ${p.lang === 'hi' ? 'Hindi' : p.lang})` : ''}.</>,
      detail: (
        <>
          {p.english_question && p.english_question !== r.question && <div className="xd"><span className="xk">In English</span>{p.english_question}</div>}
          {Object.keys(p.case ?? {}).length > 0 && <div className="xd"><span className="xk">Case facts</span><span className="qchips">{caseChips(p.case)}</span></div>}
          {(p.subjects?.length ?? 0) > 0 && <div className="xd"><span className="xk">Subjects</span><span className="qchips">{p.subjects!.map((s) => <span key={s} className="qchip">{humanSubject(s)}</span>)}</span></div>}
          {(p.premises?.length ?? 0) > 0 && <div className="xd"><span className="xk">Assumptions checked, not trusted</span><ul className="xl">{p.premises!.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
          {(p.sub_queries?.length ?? 0) > 0 && <div className="xd"><span className="xk">Search queries</span><ul className="xl">{p.sub_queries!.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
        </>
      ) },
    { key: 'retrieve', name: 'Search', who: 'local', ms: (tm.retrieve ?? 0) + (tm.evidence ?? 0) || undefined,
      summary: <>BM25 + dense (bge-small) fused by RRF, graph expansion over AMENDED_BY / WITHDRAWS / REFERS_TO, then sentence rescoring → <b>{r.evidence_count}</b> evidence sentences{r.best_sim != null ? <> · best similarity <span className="tnum">{r.best_sim.toFixed(2)}</span></> : null}.</>,
      detail: <div className="xd">In-force text is ranked first; superseded versions stay in the pack so the verifier can refuse them for present-tense claims.</div> },
    { key: 'rules', name: 'Rules', who: 'code', ms: tm.rules,
      summary: r.rules.length ? <>Code compared the case facts with each rule’s conditions: {ruleCounts.map(([v, n], i) => <span key={v}>{i ? ', ' : ''}{n} {v === 'APPLIES' ? (n === 1 ? 'applies' : 'apply') : v === 'DOES_NOT_APPLY' ? (n === 1 ? 'does not apply' : 'do not apply') : `status finding${n === 1 ? '' : 's'}`}</span>)}.</> : <>No rule conditions matched the case facts.</>,
      detail: r.rules.length ? <ul className="xl">{r.rules.slice(0, 8).map((x) => <li key={x.rid}><span className="mono">{x.rid}</span> <VerdictPill v={x.verdict} /> {x.clause ? `para ${x.clause}` : x.doc_id}</li>)}</ul> : undefined },
    { key: 'privacy', name: 'Privacy', who: 'local', ms: undefined,
      summary: trace ? <>Presidio redaction ran before anything left the machine. Sent: {egress.length} evidence sentences, {egress.reduce((a, e) => a + e.chars, 0).toLocaleString('en-IN')} characters{trace.redaction_map_hash && trace.redaction_map_hash !== 'None' ? '; identifiers replaced by placeholders' : '; no identifiers in the question'}.</> : <>PAN, Aadhaar, phone, e-mail, IFSC and account numbers are replaced before the model call.</> },
    ...(r.gate_reason && !f.draft_total ? [{ key: 'gate', name: 'Gate', who: 'code' as const, summary: <>Stopped before drafting: {r.gate_reason}.</> }] : [
      { key: 'draft', name: 'Draft', who: 'model' as const, ms: tm.draft,
        summary: <>{draftModel} wrote <b>{f.draft_total ?? 0}</b> sentences, each citing evidence ids. It never computes numbers (code fills <span className="mono">{'{{calc}}'}</span> placeholders).{replay ? ' Replayed from recorded model calls.' : ''}</> },
      { key: 'verify', name: 'Verify', who: 'code' as const, ms: tm.verify,
        summary: <>Each sentence alone: ids → in force → quote located → numbers → support. <b>{(f.draft_pass ?? 0) + (f.repair_pass ?? 0)}</b> passed, <b>{r.blocked.length}</b> withheld.</>,
        detail: (
          <div className="xgrid">
            <div><span className="xk">Support tier used</span>
              <ul className="xl">
                <li>word coverage ≥ 0.8: {supportCount('coverage')}</li>
                <li>HHEM-2.1 NLI ≥ 0.5: {supportCount('hhem')}</li>
                <li>MiniCheck NLI ≥ 0.5: {supportCount('minicheck')}</li>
                <li>AI judge (3rd tier, ≤ 3 per answer): {supportCount('llm-judge')}</li>
                <li>code rule / calc / triage: {supportCount('rule') + supportCount('calc') + supportCount('triage')}</li>
              </ul>
            </div>
            <div><span className="xk">Where withheld sentences failed</span>
              <ul className="xl">
                <li>ids: {gateFail('a:')}</li><li>in force: {gateFail('b:') - gateFail('a:')}</li><li>quote: {gateFail('c:') - gateFail('b:')}</li>
                <li>numbers: {gateFail('d:') - gateFail('c:')}</li><li>support: {gateFail('e:') - gateFail('d:')}</li>
              </ul>
            </div>
          </div>
        ) },
      { key: 'repair', name: 'Repair', who: 'model' as const, ms: tm.repair,
        summary: f.repair_used || f.repair_total ? <>No core sentence passed, so the drafter got one retry with each block reason — same evidence, same checks: {f.repair_pass ?? 0} of {f.repair_total ?? 0} passed.</> : <>Not needed: a core sentence passed on the first draft.</> },
      { key: 'calc', name: 'Calculate & triage', who: 'code' as const, ms: (tm.calc ?? 0) + (tm.conflicts ?? 0) || undefined,
        summary: <>{r.calc.length ? `${r.calc.length} calculation${r.calc.length === 1 ? '' : 's'} in Python Decimal` : 'No calculation'} · {r.conflicts.length ? `${r.conflicts.length} code-detected conflict${r.conflicts.length === 1 ? '' : 's'}` : 'no conflicts with the named bank documents'}.</> },
    ]),
    { key: 'audit', name: 'Decide & log', who: 'code', ms: undefined,
      summary: <><OutcomeBadge outcome={r.outcome} size="sm" /> decided by code, written to the hash-chained audit log{trace ? <> as row <span className="mono">#{trace.seq}</span> <span className="mono">{shortHash(trace.row_hash)}</span></> : ''}.</> },
  ]
  const maxMs = Math.max(1, ...stages.map((s) => s.ms ?? 0))
  const hasTimings = !!r.timings

  return (
    <div className={`drawer-wrap ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Pipeline X-ray">
        <header className="drawer-head">
          <div>
            <div className="drawer-title">Pipeline X-ray</div>
            <div className="drawer-sub">The AI writes; code decides. {fmtDate(r.as_of)} · {profileLabel(r.bank_profile)} · {(r.latency_ms / 1000).toFixed(1)} s total</div>
          </div>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Close X-ray"><IX /></button>
        </header>
        {replay && <div className="xnote">Replay mode: model calls are served from recordings (eval/cassettes), so model stages take near-zero time. Local checks run for real.</div>}
        {!hasTimings && <div className="xnote xnote-quiet">Per-stage timings need the backend’s <span className="mono">timings{'{}'}</span> field; counts below come from the answer itself.</div>}
        <ol className={`stages ${reducedMotion ? '' : 'animate'}`}>
          {stages.map((s, i) => (
            <li key={s.key} className={`stage stage-${s.who}`} style={{ ['--i' as string]: i }}>
              <div className="st-rail"><span className="st-n">{i + 1}</span></div>
              <div className="st-body">
                <div className="st-top">
                  <span className="st-name">{s.name}</span>
                  <span className={`who who-${s.who}`}>{s.who === 'model' ? 'hosted model' : s.who === 'local' ? 'local model' : 'code'}</span>
                  {s.ms != null && <span className="st-ms tnum">{s.ms < 1000 ? `${s.ms} ms` : `${(s.ms / 1000).toFixed(1)} s`}</span>}
                </div>
                {s.ms != null && <div className="st-bar"><span style={{ width: `${Math.max(2, (s.ms / maxMs) * 100)}%` }} /></div>}
                <div className="st-sum">{s.summary}</div>
                {s.detail && <details className="st-detail"><summary>Details</summary>{s.detail}</details>}
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
