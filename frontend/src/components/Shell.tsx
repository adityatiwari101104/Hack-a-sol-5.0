import { useMemo, useRef, useState, type ReactNode } from 'react'
import { fmtDate, profileLabel, todayISO } from '../lib/format'
import { t } from '../lib/i18n'
import { REHEARSED } from '../lib/rehearsed'
import { useApp, useRoute, type Domain } from '../state'
import { IAsk, IBank, IBell, IBoard, ICalendar, IChain, IChevronDown, IClock, IHistory, IInbox, IMoon, IScale, IShield, ISun, IUpload } from './Icons'
import { OutcomeDot } from './primitives'
import { Popover } from './Popover'

/* As-of control: chip + popover with a ruler of circular dates (timeline scrubber ref) and recorded presets. */
function AsOfControl() {
  const { asOf, setAsOf, today, docs, health, lang } = useApp()
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const events = useMemo(() => {
    const ev: { d: string; label: string; kind: 'issue' | 'effect' | 'withdraw' }[] = []
    docs.filter((d) => !d.is_synthetic).forEach((d) => {
      if (d.issue_date) ev.push({ d: d.issue_date, label: `${d.title} issued`, kind: 'issue' })
      if (d.effective_date && d.effective_date !== d.issue_date) ev.push({ d: d.effective_date, label: `${d.title} in force`, kind: 'effect' })
      if (d.withdrawn_on) ev.push({ d: d.withdrawn_on, label: `${d.title} withdrawn`, kind: 'withdraw' })
    })
    return ev.sort((a, b) => a.d.localeCompare(b.d))
  }, [docs])
  const presets = useMemo(() => {
    const s = new Set(REHEARSED.map((r) => r.as_of))
    return [...s].sort().reverse()
  }, [])
  const min = Date.parse('2023-01-01')
  const max = Date.parse('2027-01-01')
  const x = (d: string) => ((Date.parse(d) - min) / (max - min)) * 100
  const replay = health?.llm_mode === 'replay'
  return (
    <div className="asof">
      <button ref={btn} type="button" className={`ctxchip ${asOf !== today && asOf !== todayISO() ? 'ctxchip-warn' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog">
        <ICalendar size={14} /><span className="ctx-k">{t('asOf', lang)}</span><span className="ctx-v tnum">{fmtDate(asOf)}</span><IChevronDown size={12} />
      </button>
      <Popover anchor={btn} open={open} onClose={() => setOpen(false)} label="As-of date" className="pop asof-pop">
        <div>
          <div className="pop-h">Which day’s law?</div>
          <p className="pop-p">Answers use only rules in force on this date. Later amendments show as not yet in force; earlier ones as superseded.</p>
          <div className="ruler" aria-hidden="true">
            {[2023, 2024, 2025, 2026].map((y) => <span key={y} className="ruler-year" style={{ left: `${x(`${y}-01-01`)}%` }}>{y}</span>)}
            {events.filter((e) => e.d >= '2023-01-01').map((e, i) => (
              <button type="button" key={i} className={`tick tick-${e.kind}`} style={{ left: `${x(e.d)}%` }} title={`${fmtDate(e.d)} · ${e.label}`} onClick={() => setAsOf(e.d)} tabIndex={-1} />
            ))}
            <span className="ruler-cursor" style={{ left: `${Math.min(100, Math.max(0, x(asOf)))}%` }}><span className="ruler-pill tnum">{fmtDate(asOf)}</span></span>
          </div>
          <div className="pop-row">
            <input type="date" className="input" value={asOf} max="2027-12-31" onChange={(e) => e.target.value && setAsOf(e.target.value)} aria-label="As-of date" />
            <button type="button" className="btn btn-quiet" onClick={() => setAsOf(today)}>{t('backToToday', lang)}</button>
          </div>
          {replay && (
            <>
              <div className="pop-h2">Recorded dates (replay mode)</div>
              <div className="presets">
                {presets.map((d) => (
                  <button type="button" key={d} className={`preset ${d === asOf ? 'on' : ''}`} onClick={() => { setAsOf(d); setOpen(false) }}>
                    <span className="tnum">{fmtDate(d)}</span>
                    <span className="preset-n">{REHEARSED.filter((r) => r.as_of === d).length} q</span>
                  </button>
                ))}
              </div>
              <p className="pop-note">Each new date changes the evidence, so it needs a live model call. In replay mode only these dates are recorded.</p>
            </>
          )}
        </div>
      </Popover>
    </div>
  )
}

function ProfileControl() {
  const { profile, setProfile } = useApp()
  return (
    <div className="seg" role="group" aria-label="Bank profile">
      <span className="seg-label"><IBank size={14} /><span className="ctx-k">Example UCB</span></span>
      {['ucb_tier3', 'ucb_tier4', ...(profile === 'commercial_bank' ? ['commercial_bank'] : [])].map((p) => (
        <button type="button" key={p} className={`seg-b ${profile === p ? 'on' : ''}`} aria-pressed={profile === p} onClick={() => setProfile(p)}>
          {p === 'ucb_tier3' ? 'Tier 3' : p === 'ucb_tier4' ? 'Tier 4' : 'Commercial bank'}
        </button>
      ))}
    </div>
  )
}

/** Which documents an answer may use: RBI + the example bank (default), the fictional insurance set, or your uploads. */
export const DOMAINS: { id: Domain; label: string }[] = [
  { id: 'banking', label: 'Banking (RBI)' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'uploads', label: 'Your uploads' },
]
function DomainControl() {
  const { domain, setDomain, uploadIds } = useApp()
  return (
    <div className="seg seg-domain" role="group" aria-label="Documents to answer from">
      {DOMAINS.map((d) => (
        <button type="button" key={d.id} className={`seg-b ${domain === d.id ? 'on' : ''}`} aria-pressed={domain === d.id} onClick={() => setDomain(d.id)}
          title={d.id === 'banking' ? 'RBI directions and Example UCB’s own documents' : d.id === 'insurance' ? 'A fictional health policy, its endorsement and the claim FAQ' : 'PDFs you uploaded, searched together with the banking corpus'}>
          {d.label}{d.id === 'uploads' && uploadIds.length > 0 && <span className="seg-n tnum">{uploadIds.length}</span>}
        </button>
      ))}
    </div>
  )
}

function LangControl() {
  const { lang, setLang } = useApp()
  return (
    <div className="seg seg-lang" role="group" aria-label="Language / भाषा">
      <button type="button" className={`seg-b ${lang === 'en' ? 'on' : ''}`} aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
      <button type="button" className={`seg-b ${lang === 'hi' ? 'on' : ''}`} aria-pressed={lang === 'hi'} onClick={() => setLang('hi')} lang="hi">हिं</button>
    </div>
  )
}

export function TopBar() {
  const { theme, setTheme, health, apiState, domain, uploadCollection } = useApp()
  const [, , go] = useRoute()
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={() => go('home')} aria-label="Proof-or-Silence home">
        <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 20 20" width="20" height="20"><rect width="20" height="20" rx="5" fill="currentColor" /><path d="M5.5 10.3l3 3 6-6.6" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <span className="brand-name">Proof<span className="brand-or">-or-</span>Silence</span>
      </button>
      <div className="topbar-ctx">
        <DomainControl />
        <AsOfControl />
        {(domain === 'banking' || (domain === 'uploads' && uploadCollection === 'banking')) && <ProfileControl />}
        <LangControl />
      </div>
      <div className="topbar-right">
        {apiState === 'down' ? (
          <span className="mode mode-down"><span className="mode-dot" />Backend offline</span>
        ) : apiState === 'starting' ? (
          <span className="mode"><span className="mode-dot" />Backend starting…</span>
        ) : health ? (
          <span className={`mode ${health.llm_mode === 'replay' ? 'mode-replay' : 'mode-live'}`} title={health.llm_mode === 'replay' ? 'Model calls are replayed from recordings made on 23-Nov-2026 (eval/cassettes). $0, deterministic.' : 'Live mode: recorded questions still come free from the cassettes; new questions call the model. The server refuses calls at the cap.'}>
            <span className="mode-dot" />{health.llm_mode === 'replay' ? 'Replay' : `Live · spend $${health.spend_usd.toFixed(2)} of cap $${health.spend_cap_usd.toFixed(2)}`}
          </span>
        ) : null}
        <button type="button" className="iconbtn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
          {theme === 'light' ? <IMoon /> : <ISun />}
        </button>
      </div>
    </header>
  )
}

/* Lovable "Viewing: version · Back to latest" → sticky time-travel bar whenever as-of ≠ today. */
export function AsOfBar() {
  const { asOf, today, setAsOf, lang } = useApp()
  // In replay the app's "today" is the 23-Nov recording date; the insurance and upload answers were recorded on the
  // real today (24-Nov). Neither is time travel, so neither shows the bar.
  if (asOf === today || asOf === todayISO()) return null
  const past = asOf < todayISO()
  return (
    <div className="asofbar" role="status">
      <IClock size={14} />
      <span><b>{t('viewingAsOf', lang)} {fmtDate(asOf)}.</b> {past ? 'Answers use rules in force that day; later amendments are treated as not yet in force.' : 'Answers use rules scheduled to be in force on that day.'}</span>
      <button type="button" className="linkbtn" onClick={() => setAsOf(today)}>{t('backToToday', lang)}</button>
    </div>
  )
}

const NAV: { id: string; key: Parameters<typeof t>[0]; icon: ReactNode }[] = [
  { id: 'ask', key: 'ask', icon: <IAsk /> },
  { id: 'impact', key: 'alerts', icon: <IBell /> },
  { id: 'conflicts', key: 'conflicts', icon: <IBoard /> },
  { id: 'review', key: 'reviews', icon: <IInbox /> },
  { id: 'uploads', key: 'uploads', icon: <IUpload /> },
  { id: 'rules', key: 'rules', icon: <IScale /> },
  { id: 'history', key: 'history', icon: <IHistory /> },
  { id: 'audit', key: 'audit', icon: <IChain /> },
  { id: 'governance', key: 'governance', icon: <IShield /> },
]

export function Rail({ onPick }: { onPick: (q: { question: string; as_of: string; profile: string; collection?: string; upload_ids?: string[]; history?: { question: string; query_id?: string }[] }) => void }) {
  const { history, lang, profile, asOf } = useApp()
  const [page, , go] = useRoute()
  return (
    <nav className="rail" aria-label="Main">
      <ul className="nav">
        {NAV.map((n) => (
          <li key={n.id}>
            <button type="button" className={`navb ${page === n.id ? 'on' : ''}`} onClick={() => go(n.id)} aria-current={page === n.id ? 'page' : undefined}>
              {n.icon}<span>{t(n.key, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="rail-sec">
        <div className="rail-h">{t('recent', lang)}</div>
        {history.length === 0 ? (
          <div className="rail-empty">Questions you ask appear here with their outcome.</div>
        ) : (
          <ul className="hist">
            {history.slice(0, 14).map((h, i) => (
              <li key={i}>
                <button type="button" className="histb" title={h.question} onClick={() => { go('ask'); onPick({ question: h.question, as_of: h.as_of, profile: h.profile, collection: h.collection, upload_ids: h.upload_ids, history: h.history }) }}>
                  <OutcomeDot outcome={h.outcome} />
                  <span className="histq">{h.question}</span>
                  {(h.as_of !== asOf || h.profile !== profile) && <span className="hist-meta tnum">{fmtDate(h.as_of)}{h.profile !== 'ucb_tier3' ? ' · ' + profileLabel(h.profile).replace('UCB · ', '') : ''}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}

/** Backend status: friendly while the models warm up, explicit (with the start command and Retry) when it is down. */
export function BackendBanner() {
  const { apiState, retry } = useApp()
  const [copied, setCopied] = useState(false)
  if (apiState === 'up') return null
  const cmd = 'cd frontend && npm run dev:all'
  if (apiState === 'starting') {
    return (
      <div className="apibar apibar-starting" role="status">
        <span className="spin" aria-hidden="true" />
        <span><b>Connecting to the backend…</b> On first start it loads its local models, which takes about 15 seconds.</span>
      </div>
    )
  }
  return (
    <div className="apibar apibar-down" role="alert">
      <span className="apibar-text"><b>The backend is not running.</b> From the repository root, start the replay API and this UI together with <code>{cmd}</code>. To start only the API: <code>cd backend && LLM_MODE=replay ../.venv/bin/uvicorn app.api:app --port 8000</code>. Then press Retry.</span>
      <span className="apibar-actions">
        <button type="button" className="mbtn mbtn-gray" onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied' : 'Copy command'}</button>
        <button type="button" className="mbtn mbtn-primary" onClick={retry}>Retry</button>
      </span>
    </div>
  )
}
