// Rule simulator ("what applies to this loan?"): code-only applicability via POST /rules — no retrieval, no LLM.
// Showcase feature F2: officers think in cases; Tier 3 ↔ 4 and ₹40 L ↔ ₹80 L flip live.
import { useEffect, useState } from 'react'
import { api, type Missing, type Rule } from '../api'
import { ICheck, IX } from '../components/Icons'
import { Empty, Spinner, VerdictPill } from '../components/primitives'
import { docShort, fmtDate, humanSubject, profileLabel } from '../lib/format'
import { useApp } from '../state'

const SUBJECTS = ['prepayment_charge', 'penal_charges', 'penal_interest', 'penal_capitalisation', 'fees_not_in_kfs', 'fixed_rate_switch_offer', 'apr_disclosure']

export function RulesPage() {
  const { profile, asOf, features } = useApp()
  const [subject, setSubject] = useState('prepayment_charge')
  const [borrower, setBorrower] = useState('mse')
  const [purpose, setPurpose] = useState('business')
  const [rate, setRate] = useState('floating')
  const [lakh, setLakh] = useState(40)
  const [sanction, setSanction] = useState('2026-03-15')
  const [res, setRes] = useState<{ rules: Rule[]; gaps: Missing[]; llm_calls: number } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!features.rules) return
    let alive = true
    setBusy(true)
    const t = setTimeout(() => {
      api.rules({ case: { borrower, purpose, rate_type: rate, amount_inr: lakh * 1e5, sanction_date: sanction }, bank_profile: profile, as_of: asOf, subjects: [subject] })
        .then((r) => { if (alive) { setRes(r); setErr(null) } }).catch((e) => alive && setErr(e.message)).finally(() => alive && setBusy(false))
    }, 150)
    return () => { alive = false; clearTimeout(t) }
  }, [subject, borrower, purpose, rate, lakh, sanction, profile, asOf, features.rules])

  const real = (res?.rules ?? []).filter((r) => r.verdict !== 'STATUS')
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">Rule simulator</h1>
          <p className="page-sub">Describe a loan; code checks it against every applicable RBI rule for {profileLabel(profile)} as of {fmtDate(asOf)}. No search, no model — the same applicability check the answers use.</p>
        </div>
      </header>
      {!features.rules ? <Empty title="Needs the backend’s POST /rules">The rule simulator appears as soon as the backend exposes it.</Empty> : (
        <div className="sim">
          <form className="simform" onSubmit={(e) => e.preventDefault()}>
            <label>Subject<select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s} value={s}>{humanSubject(s)}</option>)}</select></label>
            <label>Borrower<select className="input" value={borrower} onChange={(e) => setBorrower(e.target.value)}><option value="individual">Individual</option><option value="mse">MSE</option><option value="company">Company</option></select></label>
            <label>Purpose<select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}><option value="business">Business</option><option value="non_business">Non-business</option></select></label>
            <label>Rate<select className="input" value={rate} onChange={(e) => setRate(e.target.value)}><option value="floating">Floating</option><option value="fixed">Fixed</option></select></label>
            <label>Sanctioned amount <span className="tnum">₹{lakh} lakh</span><input type="range" min={5} max={200} step={5} value={lakh} onChange={(e) => setLakh(Number(e.target.value))} /></label>
            <label>Sanction date<input type="date" className="input" value={sanction} onChange={(e) => setSanction(e.target.value)} /></label>
            <p className="hint">Switch Tier 3 ↔ Tier 4 in the top bar, or slide past ₹50 lakh, and watch the findings flip.</p>
          </form>
          <div className="simres">
            <div className="simres-h">{busy ? <Spinner label="Checking…" /> : <span>{real.filter((r) => r.verdict === 'APPLIES').length} rule{real.filter((r) => r.verdict === 'APPLIES').length === 1 ? '' : 's'} apply · {real.filter((r) => r.verdict !== 'APPLIES').length} do not · <span className="tag tag-code">{res?.llm_calls ?? 0} model calls</span></span>}</div>
            {err && <div className="errnote">{err}</div>}
            {(res?.gaps ?? []).map((g, i) => <div key={i} className="gap"><b>Gap:</b>&nbsp;{g.slot}{g.searched ? ` — ${g.searched}` : ''}</div>)}
            <ul className="rule-list">
              {real.sort((a, b) => (a.verdict === 'APPLIES' ? -1 : 1) - (b.verdict === 'APPLIES' ? -1 : 1)).map((r) => {
                const tail = r.statement.split(/\. (?:Applies to this case|Does not apply[^:]*):/)[1] ?? ''
                return (
                  <li key={r.rid} className={`rule ${r.verdict === 'APPLIES' ? 'rule-on' : ''}`}>
                    <div className="rule-top"><VerdictPill v={r.verdict} /><span>{docShort(r.doc_id)} <span className="mono">{r.clause}</span> · p.{r.page}</span></div>
                    <blockquote className="serif">{r.quote}</blockquote>
                    {tail && <div className="facts">{tail.split(';').map((f) => f.trim()).filter(Boolean).map((f, i) => (
                      <span key={i} className={`fact ${/≤|≥|\(rule: (any|ucb_any)|rule: \w+\)$/.test(f) && r.verdict === 'APPLIES' ? 'fact-ok' : ''}`}>{r.verdict === 'APPLIES' ? <ICheck size={10} /> : <IX size={10} />}{f.replace(/\.$/, '')}</span>))}</div>}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
