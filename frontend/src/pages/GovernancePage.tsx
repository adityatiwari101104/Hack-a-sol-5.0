// AI governance mapped to RBI's FREE-AI framework (13 Aug 2025) and the June 2026 draft model-risk guidance.
// Sources: research_notes/.../saas_landscape.md §3, backend_gaps.md Q4, chatpdf_landscape_and_showcase.md F4, docs/MODEL_CARD.md.
import { useEffect, useState } from 'react'
import { api, type ChainResult } from '../api'
import { ICheck, IShield, IWarn } from '../components/Icons'
import { useApp, useRoute } from '../state'

const SUTRAS: { sutra: string; how: string; where: string }[] = [
  { sutra: 'Trust is the foundation', how: 'Every shown sentence passed five code checks against a located, in-force quote; the rest are withheld with the reason.', where: 'ask' },
  { sutra: 'People first', how: 'Suggested fixes are labelled drafts. Maker and checker must be different people; the server refuses self sign-off.', where: 'review' },
  { sutra: 'Innovation over restraint', how: 'Generative drafting is used where it helps (phrasing), and code where it must be exact (applicability, numbers, status).', where: 'ask' },
  { sutra: 'Fairness and equity', how: 'Rules are applied to case facts by code, the same way for every borrower; no model decides who a rule covers.', where: 'ask' },
  { sutra: 'Accountability', how: 'Each answer, abstention, review and incident is a row in a hash-chained audit log with the model id and corpus hash.', where: 'audit' },
  { sutra: 'Understandable by design', how: 'Citations open the PDF page with the quote boxed; the pipeline X-ray shows every stage and which checker passed each sentence.', where: 'ask' },
  { sutra: 'Safety, resilience and sustainability', how: 'Abstains instead of guessing; replay mode and a hard spend cap act as a kill switch; injected PDF text is never evidence.', where: 'governance' },
]

const PILLARS: [string, string][] = [
  ['Governance', 'Model inventory below; human sign-off on every impact finding; incident flag on every answer.'],
  ['Protection', 'Presidio redaction of PAN, Aadhaar, phone, e-mail, IFSC and account numbers before any model call; per-call egress manifest.'],
  ['Assurance', 'Tamper-evident audit chain with a one-click verify; frozen eval splits with a plain-RAG baseline and fabricated-quote counts.'],
  ['Policy', 'Not intended for customer-facing advice or final credit/legal decisions without human sign-off (docs/MODEL_CARD.md).'],
  ['Capacity', 'Answers are scoped to a bank profile (Tier 3 / Tier 4 UCB) and an as-of date the officer chooses.'],
  ['Infrastructure', 'Local NLI, embeddings and PII models; only redacted evidence sentences leave the machine.'],
]

export function GovernancePage() {
  const { health, features } = useApp()
  const [, , go] = useRoute()
  const [chain, setChain] = useState<ChainResult | null>(null)
  useEffect(() => { api.verifyChain().then(setChain).catch(() => {}) }, [])
  const replay = health?.llm_mode === 'replay'
  const spend = health ? health.spend_usd : null
  const cap = health?.spend_cap_usd ?? 3.5

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-h">AI governance</h1>
          <p className="page-sub">How DocuHelp maps to RBI’s FREE-AI framework (Framework for Responsible and Ethical Enablement of AI, 13 Aug 2025) and the June 2026 draft guidance on model risk. FREE-AI-aligned by design; not a certification.</p>
        </div>
      </header>

      <div className="disclosure">
        <IShield size={18} />
        <div>
          <div className="disc-t">This system uses a hosted language model, with the organiser’s permission.</div>
          <p>The Hackasol 5.0 organisers explicitly allowed a hosted model API for this problem statement. The model only <b>drafts</b> sentences and extract structure; they never decide what you see. Our code verifies each sentence and withholds anything it cannot prove. Staff are told when text is AI-drafted: every answer shows which checker passed each sentence.</p>
          <p>Only redacted evidence sentences and the redacted question leave the machine; every verifier runs locally. The model endpoint is configurable (<span className="mono">LLM_BASE_URL</span>), so an on-premises compatible server can replace it, and replay mode runs a demo with no network at all.</p>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="tile-k">Kill switch</div>
          <div className="tile-v">{health ? (replay ? 'Replay only' : 'Live, capped') : '—'}</div>
          <div className="tile-s">{replay ? 'LLM_MODE=replay: no model calls leave the machine; recorded answers only.' : 'LLM_MODE=live: model calls are made and metered.'}</div>
        </div>
        <div className="tile">
          <div className="tile-k">Model spend</div>
          <div className="tile-v tnum">{spend != null ? `$${spend.toFixed(2)}` : '—'}<span className="tile-of"> / ${cap}</span></div>
          <div className="tile-bar"><span style={{ width: `${spend != null ? Math.min(100, (spend / cap) * 100) : 0}%` }} /></div>
          <div className="tile-s">The server refuses calls at the cap. About ₹0.4 per answer.</div>
        </div>
        <div className="tile">
          <div className="tile-k">Audit chain</div>
          <div className={`tile-v ${chain && !chain.ok ? 'bad' : ''}`}>{chain ? (chain.ok ? <><ICheck size={16} /> Intact</> : <><IWarn size={16} /> Broken</>) : '—'}</div>
          <div className="tile-s">{chain ? `${chain.checked} rows re-hashed now${chain.ok ? '' : `; first bad row #${chain.broken_at_seq}`}.` : 'Checking…'} <button type="button" className="linkbtn" onClick={() => go('audit')}>Open audit trail →</button></div>
        </div>
        <div className="tile">
          <div className="tile-k">Corpus</div>
          <div className="tile-v tnum">{health?.documents ?? '—'} docs</div>
          <div className="tile-s mono">hash {health?.corpus_hash ?? '—'}</div>
        </div>
      </div>

      <section className="sec">
        <header className="sec-head"><h3>Model inventory</h3><span className="sec-note">Versions pinned in the backend config; FREE-AI / draft MRM “model inventory”</span></header>
        <table className="tbl">
          <thead><tr><th>Model</th><th>Role</th><th>Where it runs</th><th>Decides what is shown?</th></tr></thead>
          <tbody>
            <tr><td>Drafting model</td><td>Drafts answer sentences (≤ 4, one claim each, cites evidence ids); suggests clause fixes as drafts</td><td>Hosted API, <span className="mono">store=false</span></td><td>No</td></tr>
            <tr><td>Planning model</td><td>Plans the query (sub-queries, case facts, Hindi→English); 3rd-tier judge, at most 3 per answer, labelled “AI judge”</td><td>Hosted API</td><td>Only as the last support tier, after code checks</td></tr>
            <tr><td className="mono">{health?.nli_model ?? 'HHEM-2.1'}</td><td>HHEM-2.1 entailment check (≥ 0.5)</td><td>Local</td><td>Yes (with code)</td></tr>
            <tr><td className="mono">MiniCheck-DeBERTa-L</td><td>Second entailment check when HHEM is unsure</td><td>Local</td><td>Yes (with code)</td></tr>
            <tr><td className="mono">{health?.embed_model ?? 'bge-small-en-v1.5'}</td><td>Dense retrieval (with BM25, fused by RRF)</td><td>Local</td><td>No</td></tr>
            <tr><td className="mono">Presidio + Indian recognisers</td><td>Redacts identifiers before any model call</td><td>Local</td><td>No</td></tr>
          </tbody>
        </table>
      </section>

      <section className="sec">
        <header className="sec-head"><h3>Evaluation</h3><span className="sec-note">eval/reports/critical/final_pass.json (24-Nov-2026) · reproducible from eval/reports</span></header>
        <table className="tbl evaltbl">
          <tbody>
            <tr><td>Accuracy, strict grader, 114 questions</td><td className="tnum">89.5% (95% CI 82.5–93.9)</td></tr>
            <tr><td>Hallucinated answers · fabricated quotes</td><td className="tnum">0 · 0</td></tr>
            <tr><td>Shown sentences not supported by their cited quote</td><td className="tnum">2.8% (plain RAG 10.6%)</td></tr>
            <tr><td>Red-team questions handled · Hindi questions</td><td className="tnum">22 / 22 · 8 / 8</td></tr>
            <tr><td>Contradiction detection, precision / recall (earlier run, small set)</td><td className="tnum">0.93 / 0.81</td></tr>
            <tr><td>Plain-RAG baseline: fresh set · red-team</td><td className="tnum">50% · 10 / 22</td></tr>
            <tr><td>Cost per answer (list price)</td><td className="tnum">≈ ₹0.4</td></tr>
          </tbody>
        </table>
        <p className="hint">Shown sentences are verified by construction, so “no unverified sentence is shown” is the guarantee — not a faithfulness score. The honest number is how many drafted sentences pass, shown on every answer’s Proof Meter.</p>
      </section>

      <section className="sec">
        <header className="sec-head"><h3>FREE-AI’s seven sutras, in this product</h3></header>
        <ol className="sutras">
          {SUTRAS.map((s, i) => (
            <li key={s.sutra}>
              <span className="sutra-n mono">{String(i + 1).padStart(2, '0')}</span>
              <div><div className="sutra-t">{s.sutra}</div><div className="sutra-h">{s.how}</div></div>
              {s.where !== 'governance' && <button type="button" className="linkbtn" onClick={() => go(s.where)}>See it →</button>}
            </li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <header className="sec-head"><h3>The six pillars</h3></header>
        <dl className="pillars">{PILLARS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </section>

      <section className="sec">
        <header className="sec-head"><h3>Known limits, stated</h3></header>
        <ul className="limits">
          <li>Abstention is conservative: it sometimes refuses table or calculation questions it could answer.</li>
          <li>Hindi questions are understood, but answers come back in English; the entailment models are English-trained.</li>
          <li>There is no upload path yet for a new PDF; the corpus is the 15 RBI documents and 7 bank documents in the database (16 RBI PDFs were downloaded; the KFS Annex A blank template is not registered for ingestion).</li>
          <li>A live, unrecorded question takes about 7–15 s; the demo uses recorded questions.</li>
          <li>Value tuples were extracted by a model and audited; they are still imperfect, so conflict triage can over- or under-flag.</li>
          <li>The demo bank and its documents are fictional; the RBI documents are real public circulars.</li>
          {!features.rules && <li>The code-only rule simulator needs the backend’s <span className="mono">POST /rules</span>.</li>}
        </ul>
      </section>
    </div>
  )
}
