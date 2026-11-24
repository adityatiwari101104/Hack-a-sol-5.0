import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, ApiError, type AskResult, type Citation, type Conflict } from '../api'
import {
  AbstainCard, CalcCard, ConflictCard, dedupeCalcs, FlaggedSources, GapRows, NeedsInfoCard, PendingRow, PremiseLine, ProofMeter, Provenance, RuleFindings,
  SentenceRow, useReveal, WithheldTray, type CiteFn,
} from '../components/answer'
import { EvidencePane, type PaneState } from '../components/Evidence'
import { IArrowUp, IBank, ICalendar, ICopy, IFlag, IPrint, ISearch, IXray } from '../components/Icons'
import { OutcomeBadge, OutcomeDot } from '../components/primitives'
import { XrayDrawer } from '../components/Xray'
import { Popover } from '../components/Popover'
import { keyTerms } from '../lib/diff'
import { cleanTitle, fmtDate, isBankDoc, profileLabel, stripIds } from '../lib/format'
import { t } from '../lib/i18n'
import { DEMO_UPLOAD_ID, REHEARSED, type Rehearsed } from '../lib/rehearsed'
import { useApp, useRoute, type Domain } from '../state'
import { demoFile, UploadAskChips, UploadDialog } from '../components/Upload'
import type { Turn, UploadStatus } from '../api'

/** Which corpus a request searched, from what it sent. */
const domainOf = (r: { collection?: string; upload_ids?: string[] } | null | undefined): Domain =>
  r?.upload_ids?.length ? 'uploads' : r?.collection === 'insurance' ? 'insurance' : 'banking'
const DOMAIN_SET: Record<Domain, Rehearsed[]> = {
  banking: [],
  insurance: REHEARSED.filter((r) => r.domain === 'insurance'),
  uploads: REHEARSED.filter((r) => r.domain === 'uploads'),
}
/** Recorded follow-ups that can be asked after this answer (same question, same date). */
const followupsFor = (r: AskResult | null) => (r ? REHEARSED.filter((x) => x.after && x.after === r.question && x.as_of === r.as_of) : [])

export interface AskRequest { question: string; as_of: string; profile: string; nonce: number; slots?: Record<string, string>; collection?: string; upload_ids?: string[]
  /** prior turns sent for follow-up resolution; only typed questions in an open thread carry them (recorded ones never do, so replay keys stay exact) */
  history?: Turn[]
  thread?: 'new' | 'continue' | 'replace' }
interface ThreadTurn { question: string; query_id: string; outcome: string; resolved?: string }

const CALC_LABEL: Record<string, string> = { EMI: 'EMI', APR_IRR: 'APR', PREPAY_CHARGE: 'Pre-payment charge', TOTAL_INTEREST: 'Total interest' }

const STAGES = ['Understanding the question', 'Searching RBI + bank documents', 'Checking rules against the case', 'Drafting (model)', 'Verifying every sentence', 'Deciding the outcome']

export interface Live { stages: { stage: string; label: string }[]; verdicts: { n: number; of: number; verdict: string }[]; withheld?: number }

function Working({ q, live }: { q: string; live: Live | null }) {
  const { reducedMotion } = useApp()
  if (live && live.stages.length) {
    // POST /ask/stream: real stage events and per-sentence verdicts (verdict only, never draft text)
    const lastV = live.verdicts[live.verdicts.length - 1]
    return (
      <div className="working" aria-live="polite">
        <div className="working-q">{q}</div>
        <ol className="working-stages live">
          {live.stages.map((st, i) => <li key={i} className={i === live.stages.length - 1 ? 'cur' : 'done'}><span className="ws-dot" />{st.label}</li>)}
        </ol>
        {lastV && <div className="working-verdicts">Checking sentence {lastV.n} of {lastV.of}: {live.verdicts.filter((v) => v.verdict === 'PASS' || v.verdict === 'CONTESTED').length} verified · {live.verdicts.filter((v) => v.verdict === 'BLOCKED').length} withheld so far</div>}
        <div className="working-note">Only the verdicts stream. Sentences appear once every check has finished.</div>
      </div>
    )
  }
  return (
    <div className="working" aria-live="polite">
      <div className="working-q">{q}</div>
      <ol className={`working-stages ${reducedMotion ? '' : 'animate'}`}>
        {STAGES.map((s, i) => <li key={s} style={{ ['--i' as string]: i }}><span className="ws-dot" />{s}</li>)}
      </ol>
      <div className="working-note">Nothing is shown until each sentence has passed its checks.</div>
    </div>
  )
}

const CLASS_NOTE: Record<string, string> = {
  task_request: 'This asks for writing, a guarantee or a prediction, not a compliance answer, so it was declined before any model call.',
  meta_instruction: 'The message only tried to change how the assistant works, so there was nothing to answer.',
  profile_mismatch: 'These directions do not apply to this kind of bank; the answer says so and cites where the scope is set.',
  bad_input: 'One of the inputs cannot be computed as given (for example a 0-month tenor).',
  general_question: 'Answered from a general document collection, not the RBI rulebook.',
}

function RecordedPicker({ onPick, onClose, anchor }: { onPick: (r: Rehearsed) => void; onClose: () => void; anchor: React.RefObject<HTMLButtonElement | null> }) {
  const [filter, setFilter] = useState('')
  const groups = useMemo(() => {
    const m = new Map<string, Rehearsed[]>()
    REHEARSED.filter((r) => !filter || (r.q + r.title).toLowerCase().includes(filter.toLowerCase())).forEach((r) => {
      m.set(r.group, [...(m.get(r.group) ?? []), r])
    })
    return [...m.entries()]
  }, [filter])
  return (
    <Popover anchor={anchor} open onClose={onClose} place="bottom-end" className="picker" label="Recorded questions">
      <div className="picker-head">
        <div className="picker-search"><ISearch size={14} /><input autoFocus placeholder={`Filter ${REHEARSED.filter((r) => !r.after).length} recorded questions…`} value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && onClose()} /></div>
        <span className="picker-note">Picking one sets its recorded date and bank profile, so it replays at $0.</span>
      </div>
      <div className="picker-body">
        {groups.map(([g, items]) => (
          <div key={g} className="pk-group">
            <div className="pk-h">{g}</div>
            {items.map((r) => (
              <button type="button" key={r.id} className="pk-item" onClick={() => onPick(r)}>
                <OutcomeDot outcome={r.outcome} />
                <span className="pk-q">{r.title ? <b>{r.title}. </b> : null}{r.q}</span>
                <span className="pk-meta tnum">{fmtDate(r.as_of)}{r.profile === 'ucb_tier4' ? ' · Tier 4' : ''}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </Popover>
  )
}

export const STORY = REHEARSED.filter((r) => /^\d/.test(r.group))
DOMAIN_SET.banking = STORY

const INS_DOCS = [
  { id: 'INS-POLICY', label: 'policy wording', q: 'Summarise the Suraksha Health Insurance Policy Wording' },
  { id: 'INS-ENDORSE-1', label: 'Endorsement No. 1', q: 'Summarise Endorsement No. 1 to the Suraksha Health Insurance Policy Wording' },
  { id: 'INS-FAQ', label: 'claim FAQ', q: 'Summarise the Suraksha Health Claim FAQ' },
]
const isSummary = (r: AskResult) => !!r.summary || r.query_class === 'summary_request'

/** "Key points (verified)": a summary is still sentence-by-sentence proof; the coverage line says how much of the
 *  document the proven points reach, and the Withheld tray below holds the points that failed. */
function SummaryHead({ r, shown }: { r: AskResult; shown: number }) {
  const c = r.coverage
  const blocked = r.blocked?.length ?? 0
  const line = typeof c === 'string' ? c : typeof c === 'number' ? `The proven points cover ${Math.round(c * 100)}% of the document.`
    : c && typeof c === 'object' ? (c.note ?? (c.proven != null && c.total != null ? `${c.proven} of ${c.total} drafted key points proven.` : ''))
    : ''
  return (
    <div className="kp-head">
      <div className="kp-h">Key points (verified){r.summary_of?.length ? <span className="kp-of"> · {r.summary_of.map((d) => cleanTitle(d.title ?? d.doc_id)).join(", ")}</span> : null}</div>
      <div className="kp-cov">{line ? `${line.replace(/\.$/, '')}.` : `${shown} key point${shown === 1 ? '' : 's'} proven${blocked ? `, ${blocked} withheld` : ''}.`} Each point is checked against its quote like any answer{blocked ? '; the withheld ones are in the tray below with their reasons' : ''}.</div>
    </div>
  )
}

/** Greetings and "what can you do": the server's fixed reply, plus example questions that are known to answer. */
function SmalltalkCard({ r, fallback, onRecorded, onDraft }: { r: AskResult; fallback: Rehearsed[]; onRecorded: (x: Rehearsed) => void; onDraft: (q: string) => void }) {
  const [, , go] = useRoute()
  const text = r.help?.text ?? r.reply ?? r.message ?? r.sentences?.[0]?.text ?? 'Hello. Ask a specific question about a rule, a charge, a date or a clause, and every sentence of the answer will be proven against a quote.'
  const ex = (r.help?.examples ?? r.examples ?? []).map((e) => (typeof e === 'string' ? e : e.q ?? e.question ?? '')).filter(Boolean)
  const items: { q: string; rec?: Rehearsed }[] = ex.length ? ex.map((q) => ({ q, rec: REHEARSED.find((x) => x.q === q) })) : fallback.map((x) => ({ q: x.q, rec: x }))
  return (
    <div className="smalltalk" role="status">
      <p>{text}</p>
      {items.length > 0 && (
        <>
          <div className="smalltalk-h">Try one of these</div>
          <div className="docq-chips">
            {items.map((x) => (
              <button key={x.q} type="button" className="docq-chip" onClick={() => (/^upload a pdf/i.test(x.q) ? go('uploads') : x.rec ? onRecorded(x.rec) : onDraft(x.q.replace(/^.*then ask:\s*/i, '')))}>{x.q}{x.rec && <span className="docq-tag">recorded</span>}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DomainHero({ domain, onPick, onUpload, onDemo, uploadIds, demoErr, replay, onDraft, onAsk, onSummarise }: { domain: Domain; onPick: (r: Rehearsed) => void; onUpload: () => void; onDemo: () => void; uploadIds: string[]; demoErr: string | null; replay: boolean; onDraft: (q: string) => void; onAsk: (q: string, ids?: string[]) => void; onSummarise?: (question: string) => void }) {
  const [, , go] = useRoute()
  const set = DOMAIN_SET[domain]
  const ins = domain === 'insurance'
  return (
    <div className="hero">
      <h1 className="hero-h">{ins ? <>Same proof engine,<br /><em className="serif">another domain.</em></> : <>Your document,<br /><em className="serif">checked before it is used.</em></>}</h1>
      <p className="hero-p">{ins
        ? 'A fictional health policy (Suraksha Health), Endorsement No. 1 that changes it from 1 April 2026, and a claim FAQ that was never updated. Ask the same question on two dates: the answer follows the endorsement, and the stale FAQ shows up as a conflict. Quotes, versions, contradictions and refusals work exactly as for RBI rules.'
        : 'Upload a circular, policy, agreement or KFS. It is redacted, indexed and checked against every RBI text in force. Ask about it here: answers quote it like any other document and say when it breaks an RBI rule.'}</p>
      {!ins && (
        <div className="hero-upl">
          <span>{uploadIds.length ? <>Answers will use <b>{uploadIds.length} upload{uploadIds.length === 1 ? '' : 's'}</b> with the banking corpus.</> : 'No upload chosen yet.'}</span>
          <button type="button" className={`btn ${uploadIds.length ? 'btn-quiet' : 'btn-primary'}`} onClick={onDemo}>Try the demo upload</button>
          <button type="button" className="btn btn-quiet" onClick={onUpload}>Upload PDF</button>
          <button type="button" className="btn btn-quiet" onClick={() => go('uploads')}>My uploads</button>
        </div>
      )}
      {demoErr && <div className="errnote" role="alert">{demoErr}</div>}
      {ins && (
        <div className="docq"><div className="docq-doc">
          <div className="docq-h">Summarise a document <span>· key points, each proven against its quote</span></div>
          <div className="docq-chips">
            {INS_DOCS.map((d) => (
              <button key={d.id} type="button" className="docq-chip" onClick={() => { const rec = REHEARSED.find((x) => x.q === d.q); if (rec) onPick(rec); else onSummarise?.(d.q) }} title={replay ? 'Not recorded yet: fills the box; needs the live stack or a recording' : 'Asks for a verified summary of this document'}>
                Summarise the {d.label}{replay && !REHEARSED.some((x) => x.q === d.q) && <span className="docq-tag">live only</span>}
              </button>
            ))}
          </div>
        </div></div>
      )}
      {!ins && uploadIds.length > 0 && <UploadAskChips ids={uploadIds} replay={replay} onRecorded={onPick} onDraft={onDraft} onAsk={onAsk} />}
      {(ins || uploadIds.length === 0) && <>
      <div className="hero-label">{ins ? 'Recorded insurance questions' : 'Recorded questions about the demo upload'} <span>· one click, $0{!ins ? ` · need upload ${DEMO_UPLOAD_ID}` : ''}</span></div>
      <div className="hero-grid">
        {set.map((r) => (
          <button type="button" key={r.id} className="hcard" onClick={() => onPick(r)}>
            <span className="hcard-top"><span className="hcard-eyebrow">{r.group}</span><OutcomeBadge outcome={r.outcome} size="sm" /></span>
            <span className="hcard-t">{r.title}</span>
            <span className="hcard-n">{r.note}</span>
            <span className="hcard-meta tnum">{fmtDate(r.as_of)}</span>
          </button>
        ))}
      </div>
      </>}
    </div>
  )
}

function Hero({ onPick }: { onPick: (r: Rehearsed) => void }) {
  return (
    <div className="hero">
      <h1 className="hero-h">Every sentence proven.<br /><em className="serif">Or nothing said.</em></h1>
      <p className="hero-p">Ask about RBI loan rules or your bank’s own documents. A model drafts; code checks every sentence against a located, in-force quote and withholds the rest with the reason. No unverified sentence is shown.</p>
      <div className="hero-label">The demo, in order <span>· recorded, one click, $0</span></div>
      <div className="hero-grid">
        {STORY.map((r) => (
          <button type="button" key={r.id} className="hcard" onClick={() => onPick(r)}>
            <span className="hcard-top"><span className="hcard-eyebrow">{r.group}</span><OutcomeBadge outcome={r.outcome} size="sm" /></span>
            <span className="hcard-t">{r.title}</span>
            <span className="hcard-n">{r.note}</span>
            <span className="hcard-meta tnum">{fmtDate(r.as_of)}{r.profile === 'ucb_tier4' ? ' · Tier 4' : ''}</span>
          </button>
        ))}
      </div>
      <div className="numbers" aria-label="Measured results">
        <div className="numbers-h">Measured, not asserted <span>· eval/reports/critical/final_pass.json</span></div>
        <dl>
          <div><dt className="tnum">89.5%</dt><dd>accurate on 114 questions, strict grader (95% CI 82.5–93.9)</dd></div>
          <div><dt className="tnum">0</dt><dd>quotes fabricated · 0 hallucinated answers</dd></div>
          <div><dt className="tnum">2.8%</dt><dd>of shown sentences not supported by their cited quote, vs 10.6% for plain RAG</dd></div>
          <div><dt className="tnum">22 / 22</dt><dd>red-team questions handled</dd></div>
          <div><dt className="tnum">8 / 8</dt><dd>Hindi questions, numbers re-checked by code</dd></div>
          <div><dt className="tnum">≈ ₹0.4</dt><dd>per answer; plain RAG scores 50% on the fresh set and 10/22 on the red-team</dd></div>
        </dl>
      </div>
    </div>
  )
}

/** "Then vs now": the first core sentence at the previous date and at this date, deciding terms marked (time machine). */
function ThenNow({ prev, cur }: { prev: AskResult; cur: AskResult }) {
  const a = prev.sentences.find((s) => s.core)?.text
  const b = cur.sentences.find((s) => s.core)?.text
  if (!a || !b || a === b) return null
  const row = (date: string, text: string, tone: 'then' | 'now', profile: string) => (
    <div className={`tn-row tn-${tone}`}>
      <span className="tn-date tnum">{fmtDate(date)}{prev.bank_profile !== cur.bank_profile ? ` · ${profileLabel(profile)}` : ''}</span>
      <p className="tn-text">{keyTerms(stripIds(text)).map((p, i) => (p.k ? <mark key={i} className="kt">{p.s}</mark> : <span key={i}>{p.s}</span>))}</p>
    </div>
  )
  return (
    <div className="thennow">
      <div className="tn-h">Same question, different {prev.bank_profile !== cur.bank_profile ? 'bank profile' : 'date'}, different law — both proven</div>
      {row(prev.as_of, a, 'then', prev.bank_profile)}
      {row(cur.as_of, b, 'now', cur.bank_profile)}
    </div>
  )
}

export function AskPage({ request, setRequest }: { request: AskRequest | null; setRequest: (r: AskRequest) => void }) {
  const { refreshHealth, results } = useApp()
  const [thread, setThread] = useState<ThreadTurn[]>([])
  const { asOf, setAsOf, profile, setProfile, lang, health, docs, pushHistory, cacheResult, reducedMotion, features, domain, setDomain, uploadIds, setUploadIds, uploadCollection, setUploadCollection } = useApp()
  const scope = useMemo(() => (domain === 'insurance' ? { collection: 'insurance' } : domain === 'uploads' ? { collection: uploadCollection, upload_ids: uploadIds } : {}), [domain, uploadCollection, uploadIds])
  const [upl, setUpl] = useState<{ preset?: { file: File; doc_kind: string } | null } | null>(null)
  const [demoErr, setDemoErr] = useState<string | null>(null)
  const tryDemo = async () => { setDemoErr(null); try { setUpl({ preset: { file: await demoFile(), doc_kind: 'bank_policy' } }) } catch (e) { setDemoErr((e as Error).message) } }
  const onUploaded = (st: UploadStatus) => {
    setUpl(null)
    const c = st.collection ?? 'banking'
    setUploadCollection(c)
    setUploadIds(c !== uploadCollection ? [st.doc_id] : [...uploadIds.filter((x) => x !== st.doc_id), st.doc_id])
    setDomain('uploads')
  }
  const [, , go] = useRoute()
  const [draft, setDraft] = useState('')
  const [result, setResult] = useState<AskResult | null>(null)
  const [prev, setPrev] = useState<AskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ status: number; msg: string; q: string; as_of: string; profile: string } | null>(null)
  const [pane, setPane] = useState<PaneState>(null)
  const [trayOpen, setTrayOpen] = useState(false)
  const [xray, setXray] = useState(false)
  const [picker, setPicker] = useState(false)
  const [fresh, setFresh] = useState(false)
  const [flagged, setFlagged] = useState<string | null>(null)
  const [live, setLive] = useState<Live | null>(null)
  const pickerBtn = useRef<HTMLButtonElement>(null)
  const lastReq = useRef<AskRequest | null>(null)
  // a recorded follow-up counts only right after its question (that is the context it was recorded in)
  const isRecorded = REHEARSED.some((r) => r.q === draft.trim() && (!r.after || (thread.length > 0 && thread[thread.length - 1].question === r.after)))
  const replayMode = health?.llm_mode === 'replay'
  const liveMode = !!health && health.llm_mode !== 'replay'
  // Replay answers only recorded wordings: a new question is blocked here instead of failing with a 503 later.
  // the question just answered (e.g. a follow-up whose context has moved on) is not a new question
  const isAsked = !!result && draft.trim() === result.question.trim()
  const blockedNew = replayMode && !!draft.trim() && !isRecorded
  const historyOf = (t: ThreadTurn[]): Turn[] => t.slice(-3).map((x) => (liveMode ? { question: x.question, query_id: x.query_id } : { question: x.question }))
  const LIVE_HINT = 'This server replays recorded questions only ($0). To ask a new question, start the live stack: npm run dev:live'
  const resultRef = useRef<AskResult | null>(null)

  const run = useCallback(async (req: AskRequest) => {
    lastReq.current = req
    setLoading(true)
    setError(null)
    setPane(null)
    setFlagged(null)
    try {
      setLive(null)
      let r: AskResult
      if (features.stream) {
        const lv: Live = { stages: [], verdicts: [] }
        try {
          r = await api.askStream(req.question, req.as_of, req.profile, req.slots, ({ event, data }) => {
            if (lastReq.current !== req) return
            if (event === 'stage') lv.stages = [...lv.stages, { stage: String(data.stage), label: String(data.label ?? data.stage) }]
            else if (event === 'verdict') lv.verdicts = [...lv.verdicts, { n: Number(data.n), of: Number(data.of), verdict: String(data.verdict) }]
            else if (event === 'withheld') lv.withheld = Number(data.n)
            else return
            setLive({ ...lv })
          }, { collection: req.collection, upload_ids: req.upload_ids, history: req.history })
        } catch (e) {
          const er = e as ApiError
          if (er.status === 503 || er.status === 429) throw e
          r = await api.ask(req.question, req.as_of, req.profile, req.slots, { collection: req.collection, upload_ids: req.upload_ids, history: req.history }) // stream unavailable: plain request
        }
      } else {
        r = await api.ask(req.question, req.as_of, req.profile, req.slots, { collection: req.collection, upload_ids: req.upload_ids, history: req.history })
      }
      if (lastReq.current !== req) return
      if (r.followup && (r.as_of !== req.as_of || r.bank_profile !== req.profile)) {
        // the server used another tier or date (the follow-up asked for it): show it in the top bar. lastReq is
        // updated first so the as-of/profile effect sees no change and does not ask again.
        lastReq.current = { ...req, as_of: r.as_of, profile: r.bank_profile }
        setLoading(false)
        if (r.as_of !== req.as_of) setAsOf(r.as_of)
        if (r.bank_profile !== req.profile && r.bank_profile) setProfile(r.bank_profile)
      }
      const old = resultRef.current
      setPrev(old && old.question === r.question && (old.as_of !== r.as_of || old.bank_profile !== r.bank_profile) ? old : null)
      resultRef.current = r
      setResult(r)
      setFresh(true)
      setTrayOpen(false)
      cacheResult(r)
      {
        const turn: ThreadTurn = { question: req.question, query_id: r.query_id, outcome: r.outcome, resolved: r.followup?.resolved_question ?? undefined }
        setThread((t) => (req.thread === 'continue' ? [...t, turn] : req.thread === 'replace' && t.length ? [...t.slice(0, -1), turn] : [turn]).slice(-8))
      }
      pushHistory({ question: req.question, as_of: req.as_of, profile: req.profile, outcome: r.outcome, query_id: r.query_id, collection: req.collection, upload_ids: req.upload_ids, history: req.history, at: Date.now() })
      // open the first boxed citation so the PDF pane is never empty on a proven answer
      const boxed = r.sentences.flatMap((s) => s.citations).filter((c) => c.bboxes && !c.rid)
      const first = r.outcome === 'ABSTAIN' ? undefined
        : boxed.find((c) => c.status === 'IN_FORCE' && !isBankDoc(c.doc_id)) ?? boxed.find((c) => c.status === 'IN_FORCE') ?? boxed[0]
      if (first) setPane({ kind: 'cite', c: first })
    } catch (e) {
      if (lastReq.current !== req) return
      const err = e as ApiError
      setError({ status: err.status ?? 0, msg: err.message, q: req.question, as_of: req.as_of, profile: req.profile })
    } finally {
      if (lastReq.current === req) setLoading(false)
      refreshHealth() // live mode: the spend chip updates right after an answer
    }
  }, [cacheResult, pushHistory, features.stream, refreshHealth, setAsOf, setProfile])

  const runRef = useRef(run)
  runRef.current = run
  useEffect(() => {
    if (request && lastReq.current !== request) {
      setDraft(request.question)
      runRef.current(request)
    }
  }, [request])

  // Global as-of / profile drive the shown answer: change them and the same question is asked again.
  useEffect(() => {
    const last = lastReq.current
    if (!last || (last.as_of === asOf && last.profile === profile)) return
    setRequest({ ...last, as_of: asOf, profile, slots: undefined, thread: 'replace', nonce: Date.now() })
  }, [asOf, profile, setRequest])

  // Switching the domain starts over: an answer from another corpus is put away (it stays in Recent).
  useEffect(() => {
    const last = lastReq.current
    if (!last || domainOf(last) === domain) return
    lastReq.current = null
    setResult(null); setPrev(null); setError(null); setLoading(false); setPane(null); setDraft(''); setThread([])
  }, [domain])

  const submit = (q = draft) => {
    const question = q.trim()
    if (!question) return
    const recs = REHEARSED.filter((r) => r.q === question)
    const fu = recs.find((r) => r.after && thread.length > 0 && thread[thread.length - 1].question === r.after)
    const fresh = recs.some((r) => !r.after)
    if (replayMode && !fresh && !fu) return
    // A recorded wording starts fresh (its cassette was recorded without history); a recorded follow-up, or anything
    // else typed while a thread is open, is sent with the last turns so "what about Tier 4?" can be resolved.
    const cont = features.followup && !fresh && thread.length > 0 && !!result
    const last = lastReq.current
    setRequest({ question, as_of: fu && last ? last.as_of : asOf, profile: fu && last ? last.profile : profile, ...scope, history: cont ? historyOf(thread) : undefined, thread: cont ? 'continue' : 'new', nonce: Date.now() })
  }
  /** Ask a typed question about specific documents (summary chips). Never sends history: it opens a new thread. */
  const askAbout = (q: string, ids?: string[], collection?: string) => {
    if (replayMode && !REHEARSED.some((r) => r.q === q)) { draftIt(q); return }
    setRequest({ question: q, as_of: asOf, profile, ...scope, ...(collection ? { collection } : {}), ...(ids?.length ? { upload_ids: ids } : {}), thread: 'new', nonce: Date.now() })
  }
  const composerRef = useRef<HTMLTextAreaElement>(null)
  /** Put a question in the box without asking it (replay mode cannot answer new wordings). */
  const draftIt = (q: string) => { setDraft(q); window.setTimeout(() => composerRef.current?.focus(), 0) }
  const pickRecorded = (r: Rehearsed) => {
    if (r.after) {
      if (result && result.question === r.after && thread.length) { setPicker(false); submit(r.q); return }
      const pre = REHEARSED.find((x) => x.q === r.after && x.as_of === r.as_of && !x.after)
      if (pre) { pickRecorded(pre); return }
    }
    setPicker(false)
    setDraft(r.q)
    if (r.as_of !== asOf) setAsOf(r.as_of)
    if (r.profile !== profile) setProfile(r.profile)
    const d: Domain = r.domain ?? 'banking'
    if (d !== domain) setDomain(d)
    let extra: { collection?: string; upload_ids?: string[] } = {}
    if (d === 'insurance') extra = { collection: 'insurance' }
    if (d === 'uploads') {
      const ids = r.upload_ids ?? []
      if (uploadCollection !== 'banking' || ids.some((i) => !uploadIds.includes(i))) { setUploadCollection('banking'); setUploadIds([...(uploadCollection === 'banking' ? uploadIds.filter((i) => !ids.includes(i)) : []), ...ids]) }
      extra = { collection: 'banking', upload_ids: ids }
    }
    setRequest({ question: r.q, as_of: r.as_of, profile: r.profile, ...extra, thread: 'new', nonce: Date.now() })
  }

  const onCite: CiteFn = (c: Citation) => setPane({ kind: 'cite', c })
  const onOpenBoth = (c: Conflict) => setPane({ kind: 'compare', conflict: c })

  // Code statements about a calculation are re-worded from the calc card itself (the backend prints Python floats).
  const proven = result ? result.sentences.filter((s) => s.type !== 'conflict').map((s) => {
    const c = s.type === 'calc' ? result.calc.find((x) => x.result?.display && s.text.includes(x.result.display)) : undefined
    const hyp = c?.hypothetical || /^hypothetical/i.test(s.text)
    return c ? { ...s, text: `${hyp ? 'Hypothetical arithmetic only, not a finding that this charge is allowed: ' : ''}${CALC_LABEL[c.formula] ?? c.formula} computed by code: ${c.result.display}, from the inputs in your question. The formula and working are shown below.` } : s
  }) : []
  const revealKey = result ? result.query_id : ''
  const revealed = useReveal(revealKey, proven.length, reducedMotion || !fresh)
  const doneRevealing = revealed >= proven.length
  const calcs = result ? dedupeCalcs(result.calc) : []
  // RBI-vs-bank conflicts first: they are the ones that need action; bank-vs-bank inconsistencies follow.
  const conflicts = result ? [...result.conflicts].sort((x, y) => Number(isBankDoc(x.a.doc_id) && isBankDoc(x.b.doc_id)) - Number(isBankDoc(y.a.doc_id) && isBankDoc(y.b.doc_id))) : []
  const repairUsed = !!result?.faithfulness?.repair_used || !!result?.faithfulness?.repair_total
  const injection = !!result && result.flagged_sources == null && /gold loan faq/i.test(result.question)
  const replay = health?.llm_mode === 'replay'
  const recordedFor = (q: string) => REHEARSED.filter((r) => r.q === q)
  const activeKey = pane?.kind === 'cite' ? `${pane.c.doc_id}:${pane.c.clause}:${pane.c.page}` : undefined

  const copyWithCitations = () => {
    if (!result) return
    const lines = proven.map((s, i) => `${i + 1}. ${stripIds(s.text)}\n${s.citations.filter((c) => !c.rid).map((c) => `   — ${c.title ?? c.doc_id}, ${c.clause ? 'para ' + c.clause + ', ' : ''}p.${c.page} (${c.status}): "${c.text}"`).join('\n')}`)
    navigator.clipboard?.writeText(`Q: ${result.question}\nAs of ${fmtDate(result.as_of)} · ${profileLabel(result.bank_profile)} · outcome ${result.outcome}\n\n${lines.join('\n\n')}\n\nAudit query id: ${result.query_id}`)
  }
  const flag = async () => {
    if (!result) return
    const note = window.prompt('Flag this answer as wrong. What is wrong with it? (logged as an incident in the audit chain)')
    if (!note) return
    try { await api.incident(result.query_id, note); setFlagged('Logged as an incident and added to the audit chain.') } catch (e) { setFlagged((e as Error).message) }
  }

  return (
    <div className="askpage">
      <div className="center">
        <div className="composer">
          <form className="composer-box" onSubmit={(e) => { e.preventDefault(); submit() }}>
            <textarea ref={composerRef} className="composer-input" rows={2} placeholder={t('placeholder', lang)} value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} aria-label="Question" />
            {draft.trim() && !isRecorded && !isAsked && (
              <div className={`live-warn ${replayMode ? 'live-warn-replay' : ''}`}>
                {replayMode
                  ? <>Not a recorded question. This server replays recorded questions only ($0). To ask new ones, start the live stack with <code>npm run dev:live</code>, or pick a recorded question.</>
                  : <>New question · calls the model, about 7–15 s{health ? <>; spent so far <b className="tnum">${health.spend_usd.toFixed(2)}</b> of the <span className="tnum">${health.spend_cap_usd.toFixed(2)}</span> cap</> : ''}. Recorded questions stay free.</>}
              </div>
            )}
            <div className="composer-row">
              <span className="composer-scope">
                <span className="scope-chip"><ICalendar size={12} />{fmtDate(asOf)}</span>
                {domain !== 'insurance' && uploadCollection !== 'general' && <span className="scope-chip"><IBank size={12} />{profileLabel(profile)}</span>}
                {domain === 'uploads' && <button type="button" className="scope-chip scope-upl" onClick={() => go('uploads')} title="Choose uploads">{uploadIds.length ? `${uploadIds.length} upload${uploadIds.length === 1 ? '' : 's'}` : 'no upload chosen'}</button>}
                <span className="scope-txt">{domain === 'insurance' ? 'Searching the 3 insurance documents' : domain === 'uploads' && uploadCollection === 'general' ? 'Searching only your uploads' : `Searching ${docs.length || 22} documents${domain === 'uploads' && uploadIds.length ? ' + your uploads' : ''}`} · unproven sentences are withheld</span>
              </span>
              <span className="composer-actions">
                {thread.length > 1 && <button type="button" className="btn btn-quiet" onClick={() => { setThread([]); setResult(null); setPrev(null); setError(null); setPane(null); lastReq.current = null; setDraft('') }}>New conversation</button>}
                <button ref={pickerBtn} type="button" className="btn btn-quiet" onClick={() => setPicker(!picker)} aria-expanded={picker} aria-haspopup="dialog">{t('rehearsed', lang)}</button>
                <button type="submit" className={`btn btn-primary ${isRecorded || !draft.trim() || replayMode ? 'btn-icon' : ''}`} disabled={!draft.trim() || loading || blockedNew}
                  title={blockedNew ? LIVE_HINT : undefined} aria-label={blockedNew ? `Ask (unavailable: ${LIVE_HINT})` : isRecorded ? 'Ask (recorded)' : liveMode ? 'Ask live' : 'Ask'}>
                  {isRecorded || !draft.trim() || replayMode ? <IArrowUp /> : 'Ask live'}</button>
              </span>
            </div>
          </form>
          {picker && <RecordedPicker anchor={pickerBtn} onPick={pickRecorded} onClose={() => setPicker(false)} />}
          {(result || loading || error) && (
            <div className="demochips" aria-label="Recorded demo questions">
              {DOMAIN_SET[domain].map((r) => (
                <button type="button" key={r.id} className={`demochip ${result?.question === r.q && result.as_of === r.as_of ? 'on' : ''}`} onClick={() => pickRecorded(r)} title={r.q}>
                  {domain === 'banking' && <span className="mono">{r.group.split(' ')[0]}</span>}{r.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="answer-scroll">
          {loading && <Working q={lastReq.current?.question ?? ''} live={live} />}

          {!loading && error && (
            error.status === 429 ? (
              <div className="notrec">
                <div className="notrec-t">The spend cap is reached{health ? ` ($${health.spend_usd.toFixed(2)} of $${health.spend_cap_usd.toFixed(2)})` : ''}.</div>
                <p>The server refuses new model calls at the cap, so this question was not answered. Recorded questions still answer from the cassettes at $0.</p>
                <button type="button" className="btn btn-quiet" onClick={() => setPicker(true)}>Choose a recorded question</button>
              </div>
            ) : error.status === 503 ? (
              <div className="notrec">
                <div className="notrec-t">This question isn’t recorded for {fmtDate(error.as_of)} · {profileLabel(error.profile)}.</div>
                <p>{replayMode ? <>The server is in replay mode, so it answers only questions recorded earlier, at their recorded date and profile. A new date changes the evidence and would need a live model call: start the live stack with <code>npm run dev:live</code>.</> : error.msg}</p>
                {recordedFor(error.q).length > 0 ? (
                  <div className="notrec-opts">Recorded for this question:{' '}
                    {recordedFor(error.q).map((r) => <button key={r.id} type="button" className="preset" onClick={() => pickRecorded(r)}>{fmtDate(r.as_of)} · {profileLabel(r.profile)}</button>)}
                  </div>
                ) : <button type="button" className="btn btn-quiet" onClick={() => setPicker(true)}>Choose a recorded question</button>}
                {result && <div className="notrec-prev">Still showing the answer as of {fmtDate(result.as_of)} below.</div>}
              </div>
            ) : error.status === 400 && domain === 'uploads' ? (
              <div className="notrec">
                <div className="notrec-t">That upload is not in the library.</div>
                <p>{error.msg}. Upload the file first (the recorded questions need the demo circular, {DEMO_UPLOAD_ID}), then ask again.</p>
                <div className="notrec-opts"><button type="button" className="btn btn-primary" onClick={tryDemo}>Try the demo upload</button> <button type="button" className="btn btn-quiet" onClick={() => go('uploads')}>My uploads</button></div>
              </div>
            ) : <div className="errnote" role="alert">{error.msg}</div>
          )}

          {!loading && !result && !error && (domain === 'banking' ? <Hero onPick={pickRecorded} /> : <DomainHero domain={domain} onPick={pickRecorded} onUpload={() => setUpl({})} onDemo={tryDemo} uploadIds={uploadIds} demoErr={demoErr} replay={replayMode} onDraft={draftIt} onAsk={(q, ids) => (ids ? askAbout(q, ids) : submit(q))} onSummarise={(q) => askAbout(q, undefined, 'insurance')} />)}

          {thread.length > 1 && result && !loading && (
            <ol className="thread" aria-label="Earlier in this conversation">
              {thread.slice(0, -1).map((t) => (
                <li key={t.query_id}>
                  <button type="button" className="thread-q" disabled={!results[t.query_id]} onClick={() => { const c = results[t.query_id]; if (c) { setThread((th) => [...th.filter((x) => x.query_id !== t.query_id), t]); setResult(c); setPane(null) } }}>
                    <OutcomeDot outcome={t.outcome} /> <span>{t.question}</span>
                  </button>
                  {t.resolved && t.resolved !== t.question && <span className="thread-r">answered as: {t.resolved}</span>}
                </li>
              ))}
            </ol>
          )}

          {!loading && result && result.query_class === 'smalltalk' && (
            <SmalltalkCard r={result} fallback={DOMAIN_SET[domain].slice(0, 4)} onRecorded={pickRecorded} onDraft={draftIt} />
          )}

          {!loading && result && result.query_class !== 'smalltalk' && (
            <article className={`answer outcome-bg-${result.outcome.toLowerCase()}`} key={result.query_id}>
              <header className="ans-head">
                <div className="ans-q">{result.question}</div>
                {result.followup?.resolved_question && result.followup.resolved_question.trim() !== result.question.trim() && (
                  <div className="ans-resolved">Answering: <span>{result.followup.resolved_question}</span></div>
                )}
                <div className="ans-scope">As of {fmtDate(result.as_of)} · {result.collection === 'insurance' ? 'Insurance documents' : result.collection === 'general' ? 'Your uploads only' : profileLabel(result.bank_profile)}{result.upload_ids?.length ? ` · with upload ${result.upload_ids.join(', ')}` : ''}{result.plan?.lang === 'hi' ? ' · asked in Hindi' : ''}</div>
                <div className="ans-badges">
                  <OutcomeBadge outcome={result.outcome} lang={lang} />
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => setXray(true)}><IXray size={14} /> {t('xray', lang)}</button>
                </div>
                <ProofMeter r={result} />
                {result.confidence?.level === 'low' && <div className="lowconf">Low confidence: {(result.confidence.note ?? 'few drafted sentences could be proven').replace(/^low confidence:?\s*/i, '').replace(/\.$/, '')}. Shown as partial.</div>}
                <Provenance r={result} replay={replay} />
              </header>

              {(result.notices ?? []).map((n, i) => <div key={i} className="notice">{n.text}{n.matched?.length ? <span className="notice-m"> Removed: {n.matched.map((m) => `“${m}”`).join(', ')}.</span> : null}</div>)}
{features.followup && followupsFor(result).length > 0 && (
                <div className="fuchips">
                  <span className="fuchips-k">Try a follow-up</span>
                  {followupsFor(result).map((f) => <button key={f.id} type="button" className="docq-chip" onClick={() => submit(f.q)}>{f.q}<span className="docq-tag">recorded</span></button>)}
                </div>
              )}
              {result.query_class && CLASS_NOTE[result.query_class] && !(result.query_class === 'general_question' && result.collection === 'insurance') && <div className="classnote">{CLASS_NOTE[result.query_class]}</div>}
              {result.premise_check && <PremiseLine checks={Array.isArray(result.premise_check) ? result.premise_check : [result.premise_check]} onCite={onCite} />}
              {result.needs_info && (result.needs?.length ?? 0) > 0 && lastReq.current && (
                <NeedsInfoCard needs={result.needs!} onSubmit={(slots) => setRequest({ ...lastReq.current!, slots, thread: 'replace', nonce: Date.now() })} />
              )}

              {prev && <ThenNow prev={prev} cur={result} />}

              {result.outcome === 'ABSTAIN' && <AbstainCard r={result} docsCount={docs.length} onCite={onCite} injectionDoc={injection} />}

              {proven.length > 0 && (
                <>
                  {result.outcome === 'ABSTAIN' && !isSummary(result) && <div className="subhead">What could still be proven</div>}
                  {isSummary(result) && <SummaryHead r={result} shown={proven.length} />}
                  <ol className={`sentences ${isSummary(result) ? 'kp' : ''}`}>
                    {proven.map((s, i) => i < revealed ? <SentenceRow key={i} s={s} i={i} onCite={onCite} activeKey={activeKey} showDraft={repairUsed} hindi={lang === 'hi' || result.lang === 'hi'} /> : <PendingRow key={i} i={i} n={proven.length} />)}
                  </ol>
                </>
              )}

              {doneRevealing && (
                <>
                  {result.outcome !== 'ABSTAIN' && <GapRows r={result} />}
                  {(result.flagged_sources?.length ?? 0) > 0 && <FlaggedSources items={result.flagged_sources!} />}
                  {(result.lang === 'hi' || lang === 'hi') && (
                    <div className="hi-note" lang="hi">
                      {result.translation ? (
                        <>
                          <div className="hi-label">{result.translation.label ?? 'हिंदी अनुवाद · machine translation of the verified answer'}</div>
                          {result.translation.abstain_text && <p>{result.translation.abstain_text}</p>}
                          <p className="hi-sub" lang="en">Hindi is shown under each verified sentence. Every number, date and clause id in it was re-checked by code{result.translation.passed != null && result.translation.sentences ? ` (${result.translation.passed} of ${result.translation.sentences.length} passed; the rest stay in English)` : ''}. The proof is the English sentence and its quote.</p>
                        </>
                      ) : <span lang="en">This answer was asked in English, so no translation was made. Hindi questions get a checked Hindi translation beside the English proof.</span>}
                    </div>
                  )}
                  {calcs.map((c, i) => <CalcCard key={i} c={{ ...c, hypothetical: c.hypothetical || result.sentences.some((x) => x.type === 'calc' && /^hypothetical/i.test(x.text) && x.text.includes(c.result.display)) }} />)}
                  {conflicts.length > 0 && (
                    <div className="conflicts">
                      <div className="subhead">Conflicts found by code <span className="count">{conflicts.length}</span></div>
                      {conflicts.slice(0, 3).map((c, i) => <ConflictCard key={i} c={c} onOpenBoth={onOpenBoth} onCite={onCite}
                        footer={<button type="button" className="btn btn-quiet" onClick={() => go('impact')}>See impact alerts →</button>} />)}
                      {conflicts.length > 3 && <button type="button" className="linkbtn" onClick={() => go('conflicts')}>All conflicts on the board →</button>}
                    </div>
                  )}
                  {result.outcome === 'CONFLICT' && conflicts.some((c) => isBankDoc(c.a.doc_id) !== isBankDoc(c.b.doc_id)) && (() => {
                    const c = conflicts.find((x) => isBankDoc(x.a.doc_id) !== isBankDoc(x.b.doc_id))!
                    const bank = isBankDoc(c.a.doc_id) ? c.a : c.b
                    return (
                      <div className="nextstep">
                        <b>Next step:</b> amend {cleanTitle(bank.title) || bank.doc_id} §{bank.clause.replace(/#\d+$/, '')}. A draft fix is waiting in Impact alerts; it needs a maker’s decision and a different checker’s sign-off.
                        <button type="button" className="linkbtn" onClick={() => go('impact')}>Open impact alerts →</button>
                      </div>
                    )
                  })()}
                  <WithheldTray items={result.blocked} open={trayOpen} onToggle={() => setTrayOpen(!trayOpen)} onCite={onCite} />
                  <RuleFindings rules={result.rules} onCite={onCite} />
                  <div className="ans-actions">
                    <button type="button" className="btn btn-quiet btn-sm" onClick={copyWithCitations}><ICopy size={13} /> Copy with citations</button>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => window.print()}><IPrint size={13} /> Print evidence pack</button>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={flag}><IFlag size={13} /> Flag as wrong</button>
                    <span className="ans-qid mono">query {result.query_id}</span>
                  </div>
                  {flagged && <div className="note">{flagged}</div>}
                </>
              )}
            </article>
          )}
        </div>
      </div>
      <EvidencePane r={result} pane={pane} setPane={setPane} />
      {result && <XrayDrawer r={result} open={xray} onClose={() => setXray(false)} />}
      <UploadDialog open={!!upl} preset={upl?.preset} onAsk={onUploaded} onClose={() => setUpl(null)} />
    </div>
  )
}
