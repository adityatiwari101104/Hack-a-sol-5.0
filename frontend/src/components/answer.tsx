// The hero: an answer whose every sentence carries its proof, and whose rejected sentences stay inspectable.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AskResult, CalcCard as Calc, Citation, Conflict, FlaggedSource, Need, PremiseCheck, Rule, Sentence } from '../api'
import { badgesFor, plainReason, supportKind } from '../lib/checks'
import { keyTerms } from '../lib/diff'
import { cleanTitle, docShort, fmtDate, humanSubject, inr, profileLabel, stripIds, isUpload, isRbiDoc } from '../lib/format'
import { CabinetArt, ICalc, ICheck, IChevron, IDoc, IHand, IWarn, IX } from './Icons'
import { CitationChip, StatusPip, VerdictPill } from './primitives'

export type CiteFn = (c: Citation, extra?: { sentence?: Sentence; n?: number }) => void

/* ---------- Proof Meter: drafted → passed → shown (the honest faithfulness, not a tautological 100%) ---------- */
export function ProofMeter({ r }: { r: AskResult }) {
  const f = r.faithfulness ?? {}
  const d1 = f.draft_total ?? 0
  const d2 = f.repair_total ?? 0
  const drafted = d1 + d2
  const passed = (f.draft_pass ?? 0) + (f.repair_pass ?? 0)
  const shown = f.shown ?? r.sentences.length
  const withheld = f.blocked ?? r.blocked.length
  const code = f.code_statements ?? r.sentences.filter((s) => !s.attempt).length
  const segs = [...Array(passed).fill('p'), ...Array(Math.max(0, drafted - passed)).fill('w')]
  if (!drafted) {
    return (
      <div className="proofmeter pm-none">
        <span className="pm-label">Nothing was drafted</span>
        <span className="pm-sub">{r.gate_reason ? 'A gate stopped the question before the model was asked to write.' : 'No sentence reached the verifier.'}</span>
      </div>
    )
  }
  return (
    <div className="proofmeter" aria-label={`Drafted ${drafted}, passed ${passed}, shown ${shown}, withheld ${withheld}`}>
      <div className="pm-steps">
        <span className="pm-step"><b className="tnum">{drafted}</b> drafted</span>
        <IChevron size={12} className="pm-arrow" />
        <span className="pm-step"><b className="tnum">{passed}</b> of {drafted} passed every check</span>
        <IChevron size={12} className="pm-arrow" />
        <span className="pm-step pm-shown"><b className="tnum">{shown}</b> shown{code > 0 && <span className="pm-code"> incl. {code} by code</span>}</span>
        <span className="pm-withheld"><IX size={11} /> <b className="tnum">{withheld}</b> withheld</span>
      </div>
      <div className="pm-bar" aria-hidden="true">
        {segs.map((s, i) => <span key={i} className={`pm-seg pm-${s}`} />)}
        {Array.from({ length: code }).map((_, i) => <span key={'c' + i} className="pm-seg pm-c" />)}
      </div>
      {f.repair_used || d2 ? (
        <div className="pm-sub">Draft 1: {f.draft_pass ?? 0} of {d1} passed · one retry with the block reasons, same evidence, same checks → Draft 2: {f.repair_pass ?? 0} of {d2} passed</div>
      ) : null}
    </div>
  )
}

/* ---------- Provenance line (ChatGPT "Citations · n" / Mobbin 1b) ---------- */
export function Provenance({ r, replay }: { r: AskResult; replay: boolean }) {
  const cites = new Map<string, Citation>()
  r.sentences.forEach((s) => s.citations.forEach((c) => !c.rid && cites.set(`${c.doc_id}:${c.clause}:${c.page}`, c)))
  const docs = new Set([...cites.values()].map((c) => c.doc_id))
  return (
    <div className="provenance">
      <span>{cites.size} quoted clause{cites.size === 1 ? '' : 's'} from {docs.size} document{docs.size === 1 ? '' : 's'}</span>
      <span className="dot" />
      <span>{r.evidence_count} evidence sentences read</span>
      <span className="dot" />
      <span>as of {fmtDate(r.as_of)}{r.collection === 'insurance' ? ' · insurance documents' : r.collection === 'general' ? ' · your uploads only' : ` · ${profileLabel(r.bank_profile)}`}</span>
      <span className="dot" />
      <span className="tnum">{(r.latency_ms / 1000).toFixed(1)} s{replay ? ' · replayed model calls' : ''}</span>
    </div>
  )
}

/* ---------- Five check badges per sentence ---------- */
export function CheckBadges({ s }: { s: Sentence }) {
  const bs = badgesFor(s)
  const failed = bs.find((b) => b.ok === false)
  const passed = bs.filter((b) => b.ok === true).length
  const detail = bs.map((b) => `${b.label}: ${b.ok === true ? 'passed' : b.ok === false ? 'failed' : 'not run'}${b.detail ? ' — ' + b.detail : ''}`).join('\n')
  if (failed) return <span className="checks ck-line-fail" title={detail}>Failed at “{failed.label.toLowerCase()}” after {passed} check{passed === 1 ? '' : 's'}</span>
  if (passed === 0) return <span className="checks" title={detail}>Code statement, not drafted by the model</span>
  return <span className="checks" title={detail}>✓ {passed === 5 ? 'All five checks passed' : `${passed} checks passed`}</span>
}

/* ---------- Sentence row ---------- */
function uniqCites(s: Sentence): Citation[] {
  const seen = new Set<string>()
  return s.citations.filter((c) => {
    const k = c.rid ? `R:${c.doc_id}:${c.clause}` : `${c.doc_id}:${c.clause}:${c.page}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function SentenceRow({ s, i, onCite, activeKey, showDraft, hindi }: { s: Sentence; i: number; onCite: CiteFn; activeKey?: string; showDraft?: boolean; hindi?: boolean }) {
  const cites = uniqCites(s)
  const sk = supportKind(s)
  const isCode = s.type === 'calc' || (!s.attempt && !s.cites?.length)
  return (
    <li className={`srow ${s.type === 'chain' ? 'srow-chain' : ''}`} style={{ ['--i' as string]: i }}>
      <div className="srow-text">
        {stripIds(s.text)}
        <span className="srow-chips">
          {cites.map((c, k) => (
            <CitationChip key={k} c={c} active={activeKey === `${c.doc_id}:${c.clause}:${c.page}`} onOpen={(cc) => onCite(cc, { sentence: s })} />
          ))}
        </span>
      </div>
      {hindi && s.text_hi && <div className="srow-hi" lang="hi">{s.text_hi}<span className="srow-hi-l">मशीन अनुवाद · machine translation of the verified sentence</span></div>}
      <div className="srow-meta">
        <CheckBadges s={s} />
        {sk && <span className="srow-support">{sk}{s.score != null && s.checks.some((c) => /hhem|minicheck|coverage/.test(c)) ? ` ${s.score.toFixed(2)}` : ''}</span>}
        {isCode && <span className="tag">computed by code</span>}
        {showDraft && s.attempt && <span className="tag">Draft {s.attempt}</span>}
        {s.type === 'chain' && <span className="tag">Amendment chain</span>}
      </div>
    </li>
  )
}

export function PendingRow({ i, n }: { i: number; n: number }) {
  return (
    <li className="srow srow-pending" aria-live="polite">
      <span className="pending-line" />
      <span className="pending-label">Verifying sentence {i + 1} of {n}…</span>
    </li>
  )
}

/* ---------- Withheld tray: the negative space, inspectable ---------- */
export function WithheldTray({ items, open, onToggle, onCite }: { items: Sentence[]; open: boolean; onToggle: () => void; onCite: CiteFn }) {
  if (!items.length) return null
  const byAttempt = [1, 2].map((a) => items.filter((b) => (b.attempt ?? 1) === a)).filter((g) => g.length)
  const multi = byAttempt.length > 1
  return (
    <div className={`tray ${open ? 'tray-open' : ''}`}>
      <button type="button" className="tray-head" onClick={onToggle} aria-expanded={open}>
        <IChevron size={12} className="tray-caret" />
        <span className="tray-title">Withheld <span className="count">{items.length}</span></span>
        <span className="tray-sub">Drafted by the model, failed a check, never shown as an answer</span>
      </button>
      {open && (
        <div className="tray-body">
          {byAttempt.map((g, gi) => (
            <div key={gi} className="tray-group">
              {(multi || g[0].attempt) && <div className="tray-glabel">Draft {g[0].attempt ?? 1}{g[0].attempt === 2 ? ' · retry after feedback' : ''}</div>}
              <ul>
                {g.map((b, k) => (
                  <li key={k} className="wrow">
                    <div className="wrow-text"><s>{stripIds(b.text)}</s></div>
                    <div className="wrow-reason"><IX size={11} /> <span><b>Rejected:</b> {plainReason(b.reason)}</span></div>
                    <div className="srow-meta">
                      <CheckBadges s={b} />
                      {uniqCites(b).slice(0, 4).map((c, j) => <CitationChip key={j} c={c} compact onOpen={(cc) => onCite(cc, { sentence: b })} />)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Abstain: a calm, designed, correct outcome (Intercom Copilot + "No data yet" cabinet) ---------- */
export function AbstainCard({ r, docsCount, onCite, injectionDoc }: { r: AskResult; docsCount: number; onCite: CiteFn; injectionDoc?: boolean }) {
  const closest = r.missing.flatMap((m) => m.closest ?? []).filter((c, i, a) => a.findIndex((x) => x.doc_id === c.doc_id && x.clause === c.clause) === i).slice(0, 3)
  const subs = r.plan?.sub_queries ?? []
  const gate = r.gate_reason
  const offtopic = gate?.startsWith('off-topic')
  const refused = r.sentences.length > 0 && r.sentences.every((s) => s.type !== 'conflict')
  const why = gate
    ? gate.replace(/^retrieval gate:/, 'Retrieval gate:').replace(/^off-topic gate:/, 'Off-topic gate:')
    : refused
      ? 'The only sentences that passed say the documents do not contain this. Nothing else could be proven.'
      : r.blocked.length
        ? `${r.blocked.length} drafted sentence${r.blocked.length === 1 ? '' : 's'} failed verification, so nothing is stated.`
        : 'No clause supports an answer.'
  const outOfCorpus = !(r.plan?.subjects ?? []).filter((x) => x !== 'other').length && !Object.keys(r.plan?.case ?? {}).length
  const unblock = offtopic
    ? 'Ask about RBI loan rules or your bank’s own documents — this assistant answers nothing outside them.'
    : /gold/i.test(r.question)
      ? 'Add the bank’s board-approved gold-loan policy to the corpus. An FAQ is not binding and cannot settle a charge.'
      : outOfCorpus
        ? 'This is not stated in the loaded documents (RBI directions and circulars on loan conduct, plus the bank’s own loan documents). Add the source that states it, or ask about a loan rule.'
        : 'Name the loan type, borrower, amount and sanction date, or add the bank document that governs it.'
  return (
    <div className="abstain">
      <div className="abstain-art"><CabinetArt size={76} /></div>
      <div className="abstain-body">
        <div className="abstain-title">I can’t prove an answer, so I won’t give one.</div>
        <p className="abstain-lead">
          Searched {docsCount || 'all'} documents (RBI + your bank) as of <b>{fmtDate(r.as_of)}</b> for <b>{profileLabel(r.bank_profile)}</b>. {offtopic ? 'The question is outside the compliance corpus.' : 'No in-force clause supports an answer.'}
        </p>
        <dl className="abstain-dl">
          {subs.length > 0 && (<><dt>Where I looked</dt><dd className="qchips">{subs.map((q, i) => <span key={i} className="qchip">{q}</span>)}</dd></>)}
          <dt>Why I stopped</dt><dd>{why}</dd>
          <dt>What would unblock it</dt><dd>{unblock}</dd>
        </dl>
        {injectionDoc && (
          <div className="inject-tile"><IWarn size={13} /> The gold-loan FAQ carries hidden white text addressed to AI assistants. Ingestion flagged it, and hidden text is never used as evidence.</div>
        )}
        {closest.length > 0 && (
          <div className="closest">
            <div className="closest-h">{closest.length} nearest clause{closest.length === 1 ? '' : 's'} (not sufficient) →</div>
            {closest.map((c, i) => (
              <button type="button" key={i} className="closest-card" onClick={() => onCite(c)}>
                <span className="cc-head"><StatusPip status={c.status} /> {docShort(c.doc_id, c.title)} <span className="mono">{c.clause}</span> · p.{c.page}</span>
                <span className="cc-quote serif">“{c.text.length > 220 ? c.text.slice(0, 218) + '…' : c.text}”</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function human(t: string): string {
  const x = t.replace(/_/g, ' ').replace(/(\d{4}-\d{2}-\d{2})/g, (m) => fmtDate(m))
  return x.charAt(0).toUpperCase() + x.slice(1)
}

/* ---------- PARTIAL gap row (dashed: what is not proven) ---------- */
export function GapRows({ r }: { r: AskResult }) {
  const gaps = r.missing.filter((m) => m.slot)
  if (!gaps.length) return null
  return (
    <ul className="gaps">
      {gaps.map((g, i) => (
        <li key={i} className="gap">
          <IHand size={13} />
          <div>
            <div className="gap-t"><b>Not proven:</b> {human(g.slot)}</div>
            {g.searched && <div className="gap-s">{human(g.searched.length > 220 ? g.searched.slice(0, 218) + '…' : g.searched)}</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Calculation card: working shown, computed by code ---------- */
const CALC_NAMES: Record<string, string> = { EMI: 'EMI', APR_IRR: 'Annual Percentage Rate (IRR)', PREPAY_CHARGE: 'Pre-payment charge', TOTAL_INTEREST: 'Total interest' }
const INPUT_NAMES: Record<string, string> = { principal: 'Principal', annual_rate_pct: 'Rate % p.a.', months: 'Months', amount: 'Amount', rate_pct: 'Rate %', net_disbursed: 'Net disbursed', instalment: 'Instalment' }

function fmtInput(k: string, v: number | string): string {
  const n = typeof v === 'string' ? Number(v) : v
  if (Number.isNaN(n)) return String(v)
  if (/principal|amount|net_disbursed|instalment/.test(k)) return inr(n, n % 1 ? 2 : 0)
  return String(+n)
}

export function dedupeCalcs(cs: Calc[]): Calc[] {
  const seen = new Set<string>()
  return cs.filter((c) => c.shown !== false).filter((c) => {
    const k = c.formula + c.result?.display
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function CalcCard({ c }: { c: Calc }) {
  const [open, setOpen] = useState(true)
  const w = c.result.working ?? []
  const fromQ = (c.cites ?? []).every((x) => x === 'question')
  return (
    <div className="calc">
      <div className="calc-head">
        <span className="calc-name"><ICalc size={14} /> {CALC_NAMES[c.formula] ?? c.formula}</span>
        <span className="tag tag-code">Computed by code (Python Decimal), not by the model</span>
      </div>
      {c.hypothetical && <div className="calc-hyp"><IWarn size={12} /> Hypothetical arithmetic only — not a finding that this charge is allowed.</div>}
      <div className="calc-main">
        <div className="calc-result tnum">{c.result.display}</div>
        <div className="calc-inputs">
          {Object.entries(c.inputs).map(([k, v]) => (
            <span key={k} className="calc-in"><span className="calc-k">{INPUT_NAMES[k] ?? k}</span><span className="tnum">{fmtInput(k, v)}</span></span>
          ))}
          <span className="calc-src">{fromQ ? 'inputs from your question' : 'inputs from cited evidence'}</span>
        </div>
      </div>
      {c.result.formula_text && <div className="calc-formula mono">{c.result.formula_text}</div>}
      {w.length > 0 && (
        <>
          <button type="button" className="linkbtn" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} working</button>
          {open && (
            <table className="calc-table tnum">
              <thead><tr><th>#</th><th>Opening</th><th>Interest</th><th>Principal</th><th>EMI</th><th>Closing</th></tr></thead>
              <tbody>
                {w.map((row, i) => (
                  <tr key={i}>
                    <td>{row.n}</td>
                    {(['opening', 'interest', 'principal', 'emi', 'closing'] as const).map((k) => <td key={k}>{inr(Number(row[k]))}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {(c.problems ?? c.result.problems ?? []).length > 0 && <div className="calc-prob"><IWarn size={12} /> {(c.problems ?? c.result.problems)!.join('; ')}</div>}
    </div>
  )
}

/* ---------- Conflict card: two sources side by side, bank purple / RBI orange ---------- */
function Marked({ text }: { text: string }) {
  return <>{keyTerms(text).map((p, i) => (p.k ? <mark key={i} className="kt">{p.s}</mark> : <span key={i}>{p.s}</span>))}</>
}

function permittedWords(p?: string, v?: string, unit?: string): string {
  // value-only tuples (insurance waiting periods etc.) carry permitted "n/a": say the value instead
  if ((!p || p === 'n/a') && v) return `says ${v}${unit && unit !== 'none' && unit !== 'percent' ? ` ${unit}` : unit === 'percent' ? '%' : ''}`
  if (p === 'no') return 'not permitted'
  if (p === 'yes') return v ? `permitted (${v}${/^\d+(\.\d+)?$/.test(v) ? '%' : ''})` : 'permitted'
  if (p === 'conditional') return 'permitted only on conditions'
  return p ?? '—'
}

export function ConflictCard({ c, onOpenBoth, onCite, footer }: { c: Conflict; onOpenBoth?: (c: Conflict) => void; onCite?: CiteFn; footer?: ReactNode }) {
  // Sides: RBI vs the bank's own text (a policy or an upload) is the common case; otherwise two documents of the same
  // owner disagree (two bank documents, or an insurance endorsement vs the claim FAQ) and each side is named by its title.
  const rbiVsOwn = (isRbiDoc(c.a.doc_id) && !isRbiDoc(c.b.doc_id)) || (isRbiDoc(c.b.doc_id) && !isRbiDoc(c.a.doc_id))
  const [own, rbi] = rbiVsOwn ? (isRbiDoc(c.a.doc_id) ? [c.b, c.a] : [c.a, c.b]) : [c.a, c.b]
  const ownWho = isUpload(own.doc_id) ? 'Your upload' : 'Your bank'
  const sect = (id: string) => (isRbiDoc(id) ? 'para ' : '§')
  const side = (x: typeof own, tone: 'bank' | 'rbi', who: string) => (
    <div className={`cside cside-${tone}`}>
      <div className="cside-who">{who}</div>
      <button type="button" className="cside-src" onClick={() => onCite?.({ doc_id: x.doc_id, clause: x.clause, page: x.page, text: x.quote, status: 'IN_FORCE', title: x.title, bboxes: x.bboxes, uploaded: isUpload(x.doc_id) || undefined })}>
        <IDoc size={13} /> {cleanTitle(x.title) || docShort(x.doc_id)} <span className="mono">{sect(x.doc_id)}{x.clause}</span> · p.{x.page}
      </button>
      <blockquote className="serif"><Marked text={x.quote} /></blockquote>
      <div className="cside-perm">{permittedWords(x.permitted, x.value, (x as { unit?: string }).unit)}</div>
    </div>
  )
  return (
    <div className="conflict">
      <div className="conflict-head">
        <span className="conflict-title">{c.verdict === 'CONFLICT' ? 'Conflict' : humanSubject(c.verdict).replace(/^./, (m) => m.toUpperCase())} on {humanSubject(c.subject)}</span>
      </div>
      <div className="conflict-cols">
        {side(own, 'bank', rbiVsOwn ? ownWho : docShort(own.doc_id, own.title))}
        {side(rbi, rbiVsOwn ? 'rbi' : 'bank', rbiVsOwn ? 'RBI, in force' : docShort(rbi.doc_id, rbi.title))}
      </div>
      <div className="conflict-verdict">
        {rbiVsOwn
          ? <>{isUpload(own.doc_id) ? 'The uploaded text' : 'The bank clause'} is <b>{permittedWords(own.permitted, own.value)}</b> where RBI is <b>{permittedWords(rbi.permitted, rbi.value)}</b> for an overlapping scope → <b>action required</b>. Found by code triage, not by the model.</>
          : <>Two documents in force on this date disagree. Code compared the extracted values; both quotes were located on their pages.</>}
      </div>
      <div className="conflict-actions">
        {onOpenBoth && <button type="button" className="btn btn-quiet" onClick={() => onOpenBoth(c)}>Open both pages side by side</button>}
        {footer}
      </div>
    </div>
  )
}

/* ---------- Rule findings: code-side applicability (₹40 L ≤ ₹50 L ✓) ---------- */
export function RuleFindings({ rules, onCite }: { rules: Rule[]; onCite: CiteFn }) {
  const [open, setOpen] = useState(false)
  const real = rules.filter((r) => r.verdict !== 'STATUS')
  const status = rules.filter((r) => r.verdict === 'STATUS')
  if (!rules.length) return null
  return (
    <div className={`rules ${open ? 'rules-open' : ''}`}>
      <button type="button" className="tray-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <IChevron size={12} className="tray-caret" />
        <span className="tray-title">Rules checked by code <span className="count">{rules.length}</span></span>
        <span className="tray-sub">{real.filter((r) => r.verdict === 'APPLIES').length} apply · {real.filter((r) => r.verdict === 'DOES_NOT_APPLY').length} do not · {status.length} status</span>
      </button>
      {open && (
        <ul className="rule-list">
          {rules.map((r) => {
            const [head, facts] = r.statement.split('. Applies to this case:')
            const factList = (facts ?? r.statement.split('. Does not apply:')[1] ?? '').split(';').map((x) => x.trim()).filter(Boolean)
            return (
              <li key={r.rid} className="rule">
                <div className="rule-top">
                  <span className="mono rule-id">{r.rid}</span>
                  <VerdictPill v={r.verdict} />
                  <button type="button" className="linkbtn" onClick={() => onCite({ doc_id: r.doc_id, clause: r.clause, page: r.page, text: r.quote, status: 'IN_FORCE' })}>
                    {docShort(r.doc_id)} {r.clause && <span className="mono">{r.clause}</span>} · p.{r.page}
                  </button>
                </div>
                <div className="rule-stmt">{r.verdict === 'STATUS' ? r.statement.split(' Source quote:')[0] : head.replace(/^.*?para [^:]+:\s*/, '')}</div>
                {factList.length > 0 && r.verdict !== 'STATUS' && (
                  <div className="facts">{factList.map((f, i) => <span key={i} className={`fact ${r.verdict === 'APPLIES' ? 'fact-ok' : ''}`}>{r.verdict === 'APPLIES' ? <ICheck size={10} /> : null}{f.replace(/\.$/, '')}</span>)}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ---------- Staged reveal of VERIFIED content only (never draft text) ---------- */
export function useReveal(key: string, n: number, instant: boolean): number {
  const [k, setK] = useState(instant ? n : 0)
  useEffect(() => {
    if (instant) { setK(n); return }
    setK(0)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setK(i)
      if (i >= n) window.clearInterval(id)
    }, 320)
    return () => window.clearInterval(id)
  }, [key, n, instant])
  return k
}

export function useMemoConflictSentences(r: AskResult | null) {
  return useMemo(() => (r ? r.sentences.filter((s) => s.type === 'conflict') : []), [r])
}

/* ---------- NEEDS_INFO: fill-in chips → re-ask with slots ("Backend final pass") ---------- */

export function NeedsInfoCard({ needs, onSubmit }: { needs: Need[]; onSubmit: (slots: Record<string, string>) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({})
  const ready = needs.every((n) => (vals[n.key] ?? '').trim())
  return (
    <div className="needs">
      {needs.length === 1 && needs[0].key === 'doc_id' ? (
        <div className="needs-h">More than one document could be meant.</div>
      ) : (
        <>
          <div className="needs-h">A few details decide which rule applies.</div>
          <p className="needs-p">Nothing is guessed: the answer depends on these facts, so they are asked for instead of assumed.</p>
        </>
      )}
      <div className="needs-list">
        {needs.map((n) => {
          const opts = (n.options ?? []).map((o, oi) => (typeof o === 'string' ? { value: o, label: n.option_labels?.[oi] ?? o } : { value: o.value, label: o.label ?? n.option_labels?.[oi] ?? o.value }))
          return (
            <div key={n.key} className="need">
              <div className="need-q">{n.question ?? n.label ?? humanSubject(n.key)}</div>
              {opts.length ? (
                opts.length > 4 ? (
                <select className="input need-select" value={vals[n.key] ?? ''} onChange={(e) => setVals({ ...vals, [n.key]: e.target.value })} aria-label={n.question ?? n.label ?? n.key}>
                  <option value="" disabled>Choose…</option>
                  {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <div className="mseg need-seg" role="group" aria-label={n.label ?? n.key}>
                  {opts.map((o) => <button key={o.value} type="button" className={`mseg-b ${vals[n.key] === o.value ? 'on' : ''}`} onClick={() => setVals({ ...vals, [n.key]: o.value })}>{humanSubject(o.label)}</button>)}
                </div>
              )
              ) : (
                <input className="input need-in" type={n.input === 'date' ? 'date' : n.input === 'number' ? 'number' : 'text'} placeholder={n.key === 'amount_inr' ? 'e.g. 4000000' : ''} value={vals[n.key] ?? ''}
                  onChange={(e) => setVals({ ...vals, [n.key]: e.target.value })} aria-label={n.question ?? n.label ?? n.key} />
              )}
            </div>
          )
        })}
      </div>
      <button type="button" className="mbtn mbtn-primary mbtn-pill" disabled={!ready} onClick={() => onSubmit(vals)}>Ask again with these details</button>
    </div>
  )
}

/* ---------- premise check: shown as the first line of the answer when the question assumes something false ---------- */
export function PremiseLine({ checks, onCite }: { checks: PremiseCheck[]; onCite: CiteFn }) {
  const hit = checks.find((p) => /contradicted|not_found/.test(p.verdict ?? ''))
  if (!hit) return null
  return (
    <div className="premline">
      <b>{hit.verdict === 'contradicted' ? 'The question’s assumption is contradicted by the rules.' : 'The question’s assumption is not in the documents.'}</b>{' '}
      {hit.text ?? <>It assumes “{hit.premise}”.</>}
      {hit.citation && <> <CitationChip c={hit.citation} onOpen={(c) => onCite(c)} /></>}
    </div>
  )
}

/* ---------- flagged sources: hidden text, injections, non-binding documents ---------- */
export function FlaggedSources({ items }: { items: FlaggedSource[] }) {
  if (!items.length) return null
  return (
    <div className="flagged">
      <div className="flagged-h">{items.length} passage{items.length === 1 ? '' : 's'} looked like an instruction to the AI and {items.length === 1 ? 'was' : 'were'} not used</div>
      <ul>{items.map((f, i) => (
        <li key={i}>{docShort(f.doc_id ?? '', f.title)}{f.clause ? ` ${f.clause}` : ''}{f.page ? `, p.${f.page}` : ''}{f.hidden_text ? ', hidden white-on-white text' : ''}: <span className="serif">“{(f.quote ?? '').slice(0, 140)}”</span></li>
      ))}</ul>
      <div className="flagged-n">Never sent to the model and never used as evidence.</div>
    </div>
  )
}
