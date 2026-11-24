// Right pane: evidence sheet with Evidence / Withheld / Audit tabs (ChatGPT "Citations · n" + a Withheld tab),
// clause metadata panel (Intercom Details), serif quote with amber highlight, and the PDF page with the quote boxed.
import { useEffect, useMemo, useState } from 'react'
import { api, type AskResult, type Citation, type Conflict, type TraceRow } from '../api'
import { plainReason } from '../lib/checks'
import { cleanTitle, docShort, fmtDate, fmtDateTime, isBankDoc, shortHash, stripIds } from '../lib/format'
import { useApp, useRoute } from '../state'
import { IChain, IDoc, IExternal, IHistory, IX } from './Icons'
import { PdfView } from './PdfView'
import { Empty, SourceTypePill, Spinner, StatusPill, StatusPip } from './primitives'

export type PaneState =
  | { kind: 'cite'; c: Citation }
  | { kind: 'compare'; conflict: Conflict }
  | null

function allCitations(r: AskResult): Citation[] {
  const m = new Map<string, Citation>()
  for (const s of r.sentences) for (const c of s.citations) {
    if (c.rid || s.type === 'conflict') continue
    const k = `${c.doc_id}:${c.clause}:${c.page}`
    if (!m.has(k) || (!m.get(k)!.bboxes && c.bboxes)) m.set(k, c)
  }
  return [...m.values()]
}

/** Conflict sides carry no bboxes; reuse any located citation for the same clause on the same page. */
export function findBoxes(r: AskResult | null, docId: string, clause: string, page: number) {
  if (!r) return undefined
  for (const s of [...r.sentences, ...r.blocked]) for (const c of s.citations) {
    if (c.doc_id === docId && c.clause === clause && c.page === page && c.bboxes) return c.bboxes
  }
  for (const m of r.missing) for (const c of m.closest ?? []) if (c.doc_id === docId && c.clause === clause && c.bboxes) return c.bboxes
  return undefined
}

function CiteDetail({ c, onClose }: { c: Citation; onClose: () => void }) {
  const { docById } = useApp()
  const [, , go] = useRoute()
  const [page, setPage] = useState(c.page)
  useEffect(() => setPage(c.page), [c])
  const doc = docById[c.doc_id]
  const hasBoxes = !!c.bboxes && Object.keys(c.bboxes).length > 0
  const chunk = c.version_id ? c.version_id.split('@')[0] : null
  return (
    <div className="cdetail">
      <div className="cd-head">
        <div className="cd-titlerow">
          <SourceTypePill docId={c.doc_id} docType={doc?.doc_type} />
          <button type="button" className="iconbtn" aria-label="Close evidence" onClick={onClose}><IX /></button>
        </div>
        <div className="cd-title">{cleanTitle(c.title ?? doc?.title) || docShort(c.doc_id)}</div>
        <dl className="kv">
          <dt>Clause</dt><dd className="mono">{c.clause || '—'}</dd>
          <dt>Page</dt><dd className="tnum">{c.page}</dd>
          <dt>Status</dt><dd><StatusPill status={c.status} /></dd>
          {c.valid_from && (<><dt>Valid</dt><dd className="tnum">{fmtDate(c.valid_from)} → {c.valid_to ? fmtDate(c.valid_to) : 'today'}</dd></>)}
          {doc?.circular_no && (<><dt>Circular</dt><dd className="mono">{doc.circular_no}</dd></>)}
          {doc?.withdrawn_on && (<><dt>Withdrawn</dt><dd className="tnum">{fmtDate(doc.withdrawn_on)}</dd></>)}
        </dl>
      </div>
      <blockquote className="cd-quote serif">
        {c.breadcrumb && <span className="cd-crumb">{c.breadcrumb.replace(/\s*>\s*/g, ' › ')}</span>}
        {c.context && !c.text.startsWith(c.context.slice(0, 40)) && <span className="cd-context">{c.context.length > 260 ? '…' + c.context.slice(-258) : c.context} </span>}
        <mark className="qhl">{c.text}</mark>
      </blockquote>
      <div className="cd-notes">
        {c.reconstructed && <span className="note">Rebuilt from RBI’s footnote: this wording is not printed in the PDF.</span>}
        {!hasBoxes && <span className="note">Page-level match: the quote is verified on page {c.page}, but no word boxes are stored for it, so nothing is boxed.</span>}
        {chunk && (
          <button type="button" className="linkbtn" onClick={() => go(`history/${chunk}`)}><IHistory size={13} /> View clause history →</button>
        )}
      </div>
      <PdfView docId={c.doc_id} page={page} bboxes={c.bboxes} onPageChange={setPage}
        label={`${docShort(c.doc_id, c.title)} · ${c.clause || 'p.' + c.page}`} tone={isBankDoc(c.doc_id) ? 'bank' : 'amber'} />
    </div>
  )
}

function CompareDetail({ conflict, result, onClose }: { conflict: Conflict; result: AskResult | null; onClose: () => void }) {
  const [bank, rbi] = isBankDoc(conflict.a.doc_id) ? [conflict.a, conflict.b] : [conflict.b, conflict.a]
  return (
    <div className="cdetail compare">
      <div className="cd-head">
        <div className="cd-titlerow">
          <span className="srcpill srcpill-conflict">Side by side</span>
          <button type="button" className="iconbtn" aria-label="Close comparison" onClick={onClose}><IX /></button>
        </div>
        <div className="cd-title">{conflict.subject.replace(/_/g, ' ')}</div>
      </div>
      {[bank, rbi].map((x, i) => (
        <div key={i} className={`cmp-side cmp-${isBankDoc(x.doc_id) ? 'bank' : 'rbi'}`}>
          <div className="cmp-label">{isBankDoc(x.doc_id) ? 'Bank' : 'RBI'} · {docShort(x.doc_id, x.title)} <span className="mono">{x.clause}</span> · p.{x.page}</div>
          <blockquote className="serif">{x.quote}</blockquote>
          <PdfView docId={x.doc_id} page={x.page} bboxes={x.bboxes ?? findBoxes(result, x.doc_id, x.clause, x.page)} tone={isBankDoc(x.doc_id) ? 'bank' : 'rbi'}
            label={`${docShort(x.doc_id, x.title)} p.${x.page}`} />
        </div>
      ))}
    </div>
  )
}

function AuditTab({ r }: { r: AskResult }) {
  const [rows, setRows] = useState<TraceRow[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    setRows(null)
    api.trace(r.query_id).then(setRows).catch((e) => setErr(e.message))
  }, [r.query_id])
  if (err) return <div className="pane-pad"><div className="note">{err}</div></div>
  if (!rows) return <div className="pane-pad"><Spinner label="Loading audit entry…" /></div>
  return (
    <div className="pane-pad">
      {rows.map((row) => {
        let egress: { eid: string; chars: number; chunk_id: string }[] = []
        try { egress = JSON.parse(row.egress_manifest_json ?? '[]') } catch { /* */ }
        return (
          <div key={String(row.seq)} className="auditcard">
            <div className="ac-top"><IChain size={14} /> <b>Row #{row.seq}</b> · {row.event_type} · {fmtDateTime(row.ts)}</div>
            <dl className="kv">
              <dt>prev → row</dt><dd className="mono">{shortHash(row.prev_hash)} → {shortHash(row.row_hash)}</dd>
              <dt>Model</dt><dd className="mono">{row.model_id ?? '—'}</dd>
              <dt>Corpus</dt><dd className="mono">{row.corpus_hash ?? '—'}</dd>
              <dt>Redaction</dt><dd className="mono">{row.redaction_map_hash && row.redaction_map_hash !== 'None' ? shortHash(row.redaction_map_hash) : 'no identifiers in question'}</dd>
            </dl>
            {egress.length > 0 && (
              <>
                <div className="ac-h">What left this machine: {egress.length} evidence sentences, {egress.reduce((a, e) => a + e.chars, 0).toLocaleString('en-IN')} characters</div>
                <ul className="egress">
                  {egress.map((e) => <li key={e.eid}><span className="mono">{e.eid}</span><span className="mono eg-chunk">{e.chunk_id}</span><span className="tnum">{e.chars} ch</span></li>)}
                </ul>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function EvidencePane({ r, pane, setPane }: { r: AskResult | null; pane: PaneState; setPane: (p: PaneState) => void }) {
  const [tab, setTab] = useState<'evidence' | 'withheld' | 'audit'>('evidence')
  const cites = useMemo(() => (r ? allCitations(r) : []), [r])
  useEffect(() => { if (pane) setTab('evidence') }, [pane])
  if (!r) {
    return (
      <aside className="pane">
        <div className="howit">
          <div className="howit-h">How an answer is made</div>
          <ol>
            {[
              ['01', 'Understand', 'A small model turns the question into search queries and case facts (amount, borrower, sanction date).'],
              ['02', 'Search', 'BM25 + dense search over the RBI documents and the bank’s own; amendment and withdrawal links pull in the text that replaced it.'],
              ['03', 'Apply rules', 'Code compares the case facts with each rule’s conditions, on the as-of date, for this bank tier.'],
              ['04', 'Draft', 'The model writes at most four sentences, each citing evidence ids. It never computes numbers.'],
              ['05', 'Verify', 'Each sentence alone: ids exist → in force → quote located on its page → numbers present → claim entailed.'],
              ['06', 'Show or withhold', 'Only passing sentences are shown. The rest go to the Withheld tray with the reason. No proof, no answer.'],
            ].map(([n, t, d]) => <li key={n}><span className="mono howit-n">{n}</span><div><b>{t}</b><span>{d}</span></div></li>)}
          </ol>
          <div className="howit-foot"><IDoc size={14} /> Citations open here, on the PDF page with the quote boxed.</div>
        </div>
      </aside>
    )
  }
  return (
    <aside className="pane" aria-label="Evidence">
      <div className="tabs" role="tablist">
        <button role="tab" type="button" className={`tab ${tab === 'evidence' ? 'on' : ''}`} aria-selected={tab === 'evidence'} onClick={() => setTab('evidence')}>Evidence <span className="count">{cites.length}</span></button>
        <button role="tab" type="button" className={`tab ${tab === 'withheld' ? 'on' : ''}`} aria-selected={tab === 'withheld'} onClick={() => setTab('withheld')}>Withheld <span className="count">{r.blocked.length}</span></button>
        <button role="tab" type="button" className={`tab ${tab === 'audit' ? 'on' : ''}`} aria-selected={tab === 'audit'} onClick={() => setTab('audit')}>Audit entry</button>
      </div>
      <div className="pane-body">
        {tab === 'evidence' && (pane?.kind === 'cite' ? <CiteDetail c={pane.c} onClose={() => setPane(null)} />
          : pane?.kind === 'compare' ? <CompareDetail conflict={pane.conflict} result={r} onClose={() => setPane(null)} />
            : cites.length === 0 ? (
              <Empty title="No clause was cited">{r.outcome === 'ABSTAIN' ? 'Nothing was proven, so nothing is cited. The nearest clauses are listed in the answer.' : 'Only code statements were shown.'}</Empty>
            ) : (
              <div className="pane-pad">
                <p className="pane-hint">Select a citation to open its page with the quote boxed.</p>
                <ul className="evlist">
                  {cites.map((c, i) => (
                    <li key={i}>
                      <button type="button" className="evcard" onClick={() => setPane({ kind: 'cite', c })}>
                        <span className="ev-head"><span className="ev-n tnum">{i + 1}</span><StatusPip status={c.status} />{docShort(c.doc_id, c.title)} <span className="mono">{c.clause}</span><span className="ev-p">p.{c.page}</span>{c.bboxes ? <span className="ev-box" title="Quote boxed on the page">▣</span> : null}</span>
                        <span className="ev-quote serif">{c.text.length > 200 ? c.text.slice(0, 198) + '…' : c.text}</span>
                        <span className="ev-meta"><StatusPill status={c.status} />{c.valid_from && <span className="tnum">{fmtDate(c.valid_from)} → {c.valid_to ? fmtDate(c.valid_to) : 'today'}</span>}<IExternal size={12} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        {tab === 'withheld' && (
          <div className="pane-pad">
            {r.blocked.length === 0 ? <Empty title="Nothing was withheld">Every drafted sentence passed all five checks.</Empty> : (
              <ul className="evlist">
                {r.blocked.map((b, i) => (
                  <li key={i} className="wcard">
                    <div className="wcard-top"><span className="tag">Draft {b.attempt ?? 1}</span><span className="wcard-r"><IX size={11} /> {plainReason(b.reason)}</span></div>
                    <div className="wcard-text"><s>{stripIds(b.text)}</s></div>
                    <div className="wcard-raw mono">verifier: {b.reason}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {tab === 'audit' && <AuditTab r={r} />}
      </div>
    </aside>
  )
}
