// Landing / pitch page. Structure, copy and imagery follow
// research_notes/Proof or Silence next steps/landing_page_research.md (§2 section order, §3 copy, §4 direction A,
// §5a graph); numbers are only the safe set from reports/Banking judge critique and evals.md §7.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ConflictCard } from '../components/answer'
import { HashChainSim } from '../components/HashChain'
import { ICheck, IMoon, ISun, IX } from '../components/Icons'
import { JaaliPattern } from '../components/ReadingRoom'
import { StickGraph } from '../components/StickGraph'
import hero from '../data/hero-answer.json'
import graph from '../data/landing-graph.json'
import { docShort, fmtDate } from '../lib/format'
import { REHEARSED, type Rehearsed } from '../lib/rehearsed'
import { useApp } from '../state'

const LawOverTime = lazy(() => import('../components/LawOverTime').then((m) => ({ default: m.LawOverTime })))

const STORY_Q = REHEARSED.filter((r) => /^\d/.test(r.group))


const STEPS: [string, string, string][] = [
  ['01', 'Retrieve', 'Keyword and meaning search over the RBI texts and your own documents. Amendment and withdrawal links pull in the text that replaced a rule.'],
  ['02', 'Draft', 'A model writes at most four sentences, each pointing at evidence. It only drafts; it never decides what you see, and never does arithmetic.'],
  ['03', 'Locate the quote', 'Code finds every cited quote on its PDF page, word by word, and checks every number and date against it.'],
  ['04', 'Check the date', 'The quoted text must be in force on the date you choose. Nothing is deleted: superseded law stays in the graph with the date it stopped applying.'],
  ['05', 'Show it, or withhold it', 'A sentence that passes every check is shown with its citation. One that fails goes to the Withheld tray with the reason. No proof, no sentence.'],
]

// Percentages from eval/reports/critical/final_pass.json (backend final pass); the technical metrics from
// eval/reports/critical/retrieval.json (75 questions with labelled gold clauses) and eval/reports/critical_summary_final.json.
const NUMBERS: [string, string, string][] = [
  ['89.5%', 'accurate on 114 questions', 'Strict grader, 102 / 114; Wilson 95% CI 82.5–93.9%'],
  ['0.743', 'MRR@50, retrieval', 'Hybrid BM25 + dense with RRF; BM25 alone 0.660, dense alone 0.704 (75 labelled questions)'],
  ['0.893', 'Recall@8 of the gold clauses', 'The 8 passages the drafter sees; Hit@8 0.92, Hit@3 0.88; multi-query union 0.967'],
  ['0.887', 'faithfulness: shown sentences fully supported', 'By the cited span, independent sentence-support audit after the final pass (was 0.884)'],
  ['2.8%', 'of shown sentences not supported by their cited quote', 'Independent audit, 7 / 247; plain RAG 10.6%'],
  ['0.913', 'citation recall', 'Share of the gold clauses cited in the answer; 68 / 71 answers cite at least one'],
  ['0.93 / 0.81', 'contradiction precision / recall', 'Code triage on 16 conflicting and 68 consistent clause pairs'],
  ['50%', 'plain RAG on the same fresh questions', 'Top-5 dense retrieval + one prompt; 10 / 22 on the red-team'],
]

function useInView<T extends Element>(threshold = 0.35): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])
  return [ref, seen]
}

/** Section 3: the recorded draft, sentence by sentence; each resolves to proven (✓ + chip) or withheld (struck + reason). */
function EarnItsPlace() {
  const { reducedMotion } = useApp()
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [k, setK] = useState(0)
  const rows = hero.rows
  useEffect(() => {
    if (!seen) return
    if (reducedMotion) { setK(rows.length); return }
    let i = 0
    const id = window.setInterval(() => { i += 1; setK(i); if (i >= rows.length) window.clearInterval(id) }, 700)
    return () => window.clearInterval(id)
  }, [seen, reducedMotion, rows.length])
  const shown = rows.filter((r) => r.verdict !== 'BLOCKED').length
  return (
    <div className="eip" ref={ref}>
      <div className="eip-q"><span className="mono">Q</span> {hero.question} <span className="eip-meta">· as of {fmtDate(hero.as_of)} · Tier 3 · recorded answer</span></div>
      <ol className="eip-rows">
        {rows.map((r, i) => {
          const done = i < k
          const blocked = r.verdict === 'BLOCKED'
          return (
            <li key={i} className={`eip-row ${done ? (blocked ? 'eip-w' : 'eip-p') : 'eip-pending'}`}>
              <span className="eip-icon">{done ? (blocked ? <IX size={12} /> : <ICheck size={12} />) : <span className="spin" />}</span>
              <div className="eip-body">
                <span className="eip-draft mono">Draft {r.attempt} · sentence {i + 1}</span>
                {!done && <span className="eip-text eip-placeholder">verifying sentence {i + 1} of {rows.length}…</span>}
                {done && !blocked && <span className="eip-text">{r.text} {r.citations.map((c, j) => <span key={j} className="chip chip-static"><span className="pip pip-inforce" />{docShort(c.doc_id ?? '', c.title ?? undefined)} <span className="mono">{c.clause}</span> p.{c.page}</span>)}</span>}
                {done && blocked && <><span className="eip-text"><s>{r.text}</s></span><span className="eip-reason">Withheld: {r.reason}</span></>}
              </div>
            </li>
          )
        })}
      </ol>
      <div className="eip-sum" aria-live="polite">{k >= rows.length ? <><b>{shown} shown</b> · <span className="eip-wcount">{rows.length - shown} withheld</span>{hero.faithfulness.repair_used ? ' · one retry with the reasons, same evidence, same checks.' : ' · the withheld sentence never reaches the answer; its reason is kept.'}</> : ' '}</div>
    </div>
  )
}

export function Landing({ onStart, onOpen }: { onStart: (r: Rehearsed) => void; onOpen: (page: string) => void }) {
  const { theme, setTheme, docs, reducedMotion } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const nodes = Object.fromEntries(graph.nodes.map((n) => [n.id, n]))
  const rbiCount = docs.filter((d) => !d.is_synthetic).length || 15
  const start = () => onStart(REHEARSED.find((r) => r.id === 'q028')!)
  const [qi, setQi] = useState(0)
  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => setQi((i) => (i + 1) % STORY_Q.length), 4200)
    return () => window.clearInterval(id)
  }, [reducedMotion])
  useEffect(() => {
    const el = document.querySelector('.landing')
    const on = () => setScrolled((el?.scrollTop ?? 0) > 40)
    el?.addEventListener('scroll', on)
    return () => el?.removeEventListener('scroll', on)
  }, [])
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })

  const rbiQ = nodes['MD-261-1']
  const bankQ = nodes['S1-7.4']

  return (
    <div className="landing">
      <nav className={`lnav ${scrolled ? 'scrolled' : ''}`} aria-label="Landing">
        <div className="lnav-bar">
          <span className="lnav-brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 20 20" width="20" height="20"><rect width="20" height="20" rx="5" fill="currentColor" /><path d="M5.5 10.3l3 3 6-6.6" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>Proof<span className="brand-or">-or-</span>Silence</span></span>
          <span className="lnav-links">
            <button type="button" onClick={() => go('earn')}>Withheld</button>
            <button type="button" onClick={() => go('law')}>Law over time</button>
            <button type="button" onClick={() => go('how')}>How it works</button>
            <button type="button" onClick={() => go('numbers')}>Numbers</button>
            <button type="button" onClick={() => go('audit')}>Audit</button>
          </span>
          <span className="lnav-right">
            <button type="button" className="iconbtn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">{theme === 'light' ? <IMoon /> : <ISun />}</button>
            <button type="button" className="mbtn mbtn-primary mbtn-pill" onClick={() => onOpen('ask')}>Open the demo</button>
          </span>
        </div>
      </nav>

      {/* 1 · hero: sans + italic-serif headline (LandingAI, Reducto) beside the corpus as an interactive stick graph */}
      <header className="lhero">
        <div className="lhero-grid" aria-hidden="true" />
        <div className="lhero-inner">
          <div className="lhero-copy">
            <div className="eyebrow lhero-eyebrow">For urban co-operative banks · {rbiCount} RBI documents and your own policies</div>
            <h1 className="lhero-h">Every sentence, proven.<br /><em className="serif">Or nothing said.</em></h1>
            <p className="lhero-p">Each sentence cites the exact clause, on its page, in force on the date you choose. If we can’t prove it, we don’t say it.</p>
            <div className="lhero-ctas">
              <button type="button" className="mbtn mbtn-primary mbtn-pill mbtn-lg" onClick={start}>Ask a question</button>
              <button type="button" className="mbtn mbtn-gray mbtn-pill mbtn-lg" onClick={() => go('earn')}>See what we withhold</button>
            </div>
            {/* one quiet line instead of a second search box: the hero CTA already opens Ask (user: hero "too crowded") */}
            <button type="button" className="ltry" onClick={() => onStart(STORY_Q[qi])} title={STORY_Q[qi].q}>
              <span className="ltry-k">Try a recorded question, $0:</span>
              <span className="ltry-q" key={qi}>{STORY_Q[qi].q}</span>
              <span className="ltry-go" aria-hidden="true">→</span>
            </button>
          </div>
          <div className="lhero-graph">
            <StickGraph reducedMotion={reducedMotion} />
          </div>
        </div>
        <dl className="lstats">
          <div><dt className="tnum">89.5%</dt><dd>accurate on 114 questions<span>95% CI 82.5–93.9</span></dd></div>
          <div><dt className="tnum">0</dt><dd>quotes fabricated<span>every quote located on its page</span></dd></div>
          <div><dt className="tnum">22 / 22</dt><dd>red-team handled<span>injection, false premises, traps</span></dd></div>
          <div><dt className="tnum">≈ ₹0.4</dt><dd>per answer<span>plain RAG: 50% on the same fresh set</span></dd></div>
        </dl>
      </header>

      {/* 3 · every sentence earns its place */}
      <section className="lsec" id="earn">
        <div className="lsec-head">
          <h2 className="lsec-h serif">Every sentence has to earn its place.</h2>
          <p className="lsec-p">Most compliance AI writes an answer and adds citations. Proof-or-Silence starts from the citations, and drops any sentence it can’t prove. This is a recorded answer, replayed sentence by sentence.</p>
        </div>
        <EarnItsPlace />
      </section>

      {/* 4 · the law, as of any date */}
      <section className="lsec lsec-wide" id="law">
        <div className="lsec-head">
          <h2 className="lsec-h serif">The law, as of any date.</h2>
          <p className="lsec-p">Three questions a compliance officer asks. Move the date and see which rule answered each one that day, quoted verbatim. Answers in the product are always checked against the date you choose.</p>
        </div>
        <Suspense fallback={<div className="lot-skeleton">Loading…</div>}>
          <LawOverTime reducedMotion={reducedMotion} />
        </Suspense>
      </section>

      {/* 5 · your policy vs the regulator */}
      <section className="lsec" id="conflict">
        <div className="lsec-head">
          <h2 className="lsec-h serif">Your policy, against the regulator.</h2>
          <p className="lsec-p">Code compares the extracted values of each clause pair for an overlapping scope. Both quotes are verbatim and located on their pages. As of {fmtDate('2026-11-23')}.</p>
        </div>
        <ConflictCard c={{
          verdict: 'CONFLICT', subject: 'prepayment_charge',
          a: { doc_id: 'EUCB-S1', title: bankQ.title, clause: '7.4', page: bankQ.page, quote: bankQ.quote, permitted: 'yes', value: '2' },
          b: { doc_id: 'RBI-UCB-RBC-MD-2025', title: rbiQ.title, clause: '261(1)', page: rbiQ.page, quote: rbiQ.quote, permitted: 'no' },
        }} />
      </section>

      {/* 6 · how it works */}
      <section className="lsec lhow" id="how">
        <JaaliPattern id="jaali-how" />
        <div className="lsec-head"><h2 className="lsec-h serif">How it works.</h2><p className="lsec-p">The model is a writer, not a source. Five steps, three of them pure code.</p></div>
        <ol className="lsteps">
          {STEPS.map(([n, h, p]) => <li key={n}><span className="mono lstep-n">{n}</span><div><b>{h}</b><p>{p}</p></div></li>)}
        </ol>
      </section>

      {/* 7 · numbers */}
      <section className="lsec" id="numbers">
        <div className="lsec-head"><h2 className="lsec-h serif">Measured, not asserted.</h2><p className="lsec-p">From the frozen evaluation sets, reproducible offline from recorded model calls. No customers to show yet, so these stand in for a logo wall.</p></div>
        <table className="lnum">
          <tbody>{NUMBERS.map(([v, l, f]) => <tr key={l}><td className="tnum lnum-v">{v}</td><td>{l}</td><td className="lnum-f">{f}</td></tr>)}</tbody>
        </table>
        <p className="hint">No unverified sentence is shown. Sources: eval/reports/critical/final_pass.json, retrieval.json and critical_summary_final.json; all reproducible at $0 from eval/cassettes.</p>
      </section>

      {/* 8 · audit chain */}
      <section className="lsec" id="audit">
        <div className="lsec-head"><h2 className="lsec-h serif">A record no one can quietly edit.</h2><p className="lsec-p">Every answer, refusal, review and sign-off is a row in a hash-chained log. This is a local simulation of the same check; the live one is in the app’s audit trail.</p></div>
        <HashChainSim />
      </section>

      {/* 9 · built for a Tier 3 UCB */}
      <section className="lsec" id="built">
        <div className="lsec-head"><h2 className="lsec-h serif">Built for a Tier 3 UCB.</h2></div>
        <div className="lbuilt">
          <div><b>Bank profile</b><p>Rules are applied for your tier. Switch Tier 3 → Tier 4 and the ₹80 lakh sanction letter becomes a conflict under ¶261(2)(i).</p></div>
          <div><b>Maker-checker</b><p>Every finding needs a maker’s decision and a different checker’s sign-off. The server refuses self sign-off.</p></div>
          <div><b>≈ ₹0.4 per answer</b><p>Identifiers are redacted before anything leaves the machine; all checks run locally.</p></div>
          <div><b lang="hi">हिंदी प्रश्न</b><p>Ask in Hindi or Hinglish: the proof stays in English with verbatim quotes, and a Hindi translation sits beside it, its numbers and clause ids re-checked by code.</p></div>
        </div>
      </section>

      {/* 10 · CTA + footer */}
      <section className="lcta">
        <h2 className="serif">Ask your first question.</h2>
        <p>Recorded demo questions replay at no cost. Pick one, or type your own.</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={start}>Ask a question</button>
      </section>
      <footer className="lfoot">
        <JaaliPattern id="jaali-foot" />
        <p>Example UCB is a fictional bank created for this demo. RBI documents are public circulars. Not affiliated with or endorsed by the Reserve Bank of India. Not legal advice. OpenAI models draft sentences, with the Hackasol 5.0 organisers’ permission; code decides what is shown.</p>
        <p className="lfoot-corpus mono">{(docs.length ? docs.filter((d) => !d.is_synthetic) : []).map((d) => d.circular_no).filter(Boolean).join(' · ') || graph.nodes.filter((n) => n.lane === 'rbi' && n.circular).map((n) => n.circular).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</p>
      </footer>
    </div>
  )
}
