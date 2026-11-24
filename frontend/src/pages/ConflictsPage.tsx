// Conflicts board: Beamline-style columns with counts, mono IDs, an amber banner on the CONFLICT column.
// Data: GET /conflicts?as_of&profile (code triage over extracted value tuples).
import { useEffect, useMemo, useState } from 'react'
import { api, type Conflict } from '../api'
import { ConflictCard } from '../components/answer'
import { ConflictMap } from '../components/Graphs'
import { IConflict, IWarn, IX } from '../components/Icons'
import { PdfView } from '../components/PdfView'
import { Spinner, VerdictPill } from '../components/primitives'
import { docShort, fmtDate, humanSubject, isBankDoc, profileLabel } from '../lib/format'
import { useApp } from '../state'

const COLS = [
  { v: 'CONFLICT', title: 'Conflict', note: 'Bank text permits what RBI forbids (or the reverse) for an overlapping scope' },
  { v: 'NEEDS_REVIEW', title: 'Needs review', note: 'RBI rule is conditional; a person must decide' },
  { v: 'DIFFERENT_CONDITION', title: 'Different condition', note: 'Looks contradictory, but the scopes do not overlap' },
  { v: 'SUPERSESSION', title: 'Supersession', note: 'A newer RBI text replaced an older one' },
]
const INS_NOTE: Record<string, string> = {
  CONFLICT: 'Two documents in force give different values for the same thing',
  NEEDS_REVIEW: 'One text is conditional; a person must decide',
  DIFFERENT_CONDITION: 'Looks contradictory, but the scopes do not overlap',
  SUPERSESSION: 'A later text (the endorsement) replaced an earlier one',
}

export function ConflictsPage() {
  const { asOf, profile, domain, uploadIds, uploadCollection } = useApp()
  const ins = domain === 'insurance'
  const coll = ins ? 'insurance' : domain === 'uploads' ? uploadCollection : 'banking'
  const ups = domain === 'uploads' ? uploadIds : []
  const [data, setData] = useState<{ counts: Record<string, number>; items: Conflict[] } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [bankOnly, setBankOnly] = useState(true)
  const [subject, setSubject] = useState('all')
  const [open, setOpen] = useState<{ c: Conflict; id: string } | null>(null)
  const [view, setView] = useState<'board' | 'map'>('board')
  const [cite, setCite] = useState<{ doc_id: string; page: number; label: string; bboxes?: import('../api').BBoxes } | null>(null)

  useEffect(() => {
    setData(null); setErr(null)
    api.conflicts(asOf, profile, coll, ups).then(setData).catch((e) => setErr(e.message))
  }, [asOf, profile, coll, ups.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(() => (data?.items ?? []).map((c, i) => ({ c, id: `CF-${String(i + 1).padStart(3, '0')}` }))
    .filter(({ c }) => ins || !bankOnly || isBankDoc(c.a.doc_id) || isBankDoc(c.b.doc_id))
    .filter(({ c }) => subject === 'all' || c.subject === subject), [data, bankOnly, subject, ins])
  const subjects = useMemo(() => [...new Set((data?.items ?? []).map((c) => c.subject))].sort(), [data])

  return (
    <div className="page page-wide">
      <header className="page-head">
        <div>
          <h1 className="page-h">Conflicts board</h1>
          <p className="page-sub">Every pair of clauses that code triage flagged, as of {fmtDate(asOf)} for {ins ? 'the insurance documents (policy wording, Endorsement No. 1, claim FAQ)' : profileLabel(profile)}{domain === 'uploads' && ups.length ? `, including your upload${ups.length === 1 ? '' : 's'} ${ups.join(', ')}` : ''}. Contradictions are sorted into conflict, needs-review, different-condition and supersession — not just “contradiction”.</p>
        </div>
        <div className="filters">
          <div className="seg" role="group" aria-label="View">
            <button type="button" className={`seg-b ${view === 'board' ? 'on' : ''}`} onClick={() => setView('board')}>Board</button>
            <button type="button" className={`seg-b ${view === 'map' ? 'on' : ''}`} onClick={() => setView('map')}>Map</button>
          </div>
          {!ins && <label className="check"><input type="checkbox" checked={bankOnly} onChange={(e) => setBankOnly(e.target.checked)} /> Involving our bank’s documents</label>}
          <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
            <option value="all">All subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{humanSubject(s)}</option>)}
          </select>
        </div>
      </header>
      {err && <div className="errnote">{err}</div>}
      {!data && !err && <Spinner label="Running conflict triage…" />}
      {data && view === 'map' && (
        <ConflictMap items={(data.items ?? []).filter((c) => subject === 'all' || c.subject === subject)}
          onSelect={(c) => setOpen({ c, id: `CF-${String((data.items ?? []).indexOf(c) + 1).padStart(3, '0')}` })} />
      )}
      {data && view === 'board' && (
        <div className="board">
          {COLS.map((col) => {
            const colItems = items.filter(({ c }) => c.verdict === col.v)
            return (
              <section key={col.v} className={`bcol bcol-${col.v.toLowerCase()}`}>
                <header className="bcol-h">
                  <VerdictPill v={col.v} />
                  <span className="count">{colItems.length}</span>
                </header>
                <p className="bcol-note">{ins ? INS_NOTE[col.v] ?? col.note : col.note}</p>
                {col.v === 'CONFLICT' && colItems.length > 0 && (
                  <div className="banner-amber"><IWarn size={13} /> {colItems.length} {ins ? 'clause' : 'bank clause'} pair{colItems.length === 1 ? '' : 's'} need{colItems.length === 1 ? 's' : ''} action</div>
                )}
                <div className="bcards">
                  {colItems.slice(0, 60).map(({ c, id }) => {
                    const [bank, rbi] = isBankDoc(c.a.doc_id) ? [c.a, c.b] : [c.b, c.a]
                    return (
                      <button type="button" key={id} className="bcard" onClick={() => setOpen({ c, id })}>
                        <span className="bcard-top"><span className="mono bcard-id">{id}</span><span className="bcard-subj">{humanSubject(c.subject)}</span></span>
                        <span className="bcard-pair">
                          <span className={isBankDoc(bank.doc_id) ? 'who-bank' : 'who-rbi'}>{docShort(bank.doc_id, bank.title)} <span className="mono">{isBankDoc(bank.doc_id) ? '§' : ''}{bank.clause}</span></span>
                          <IConflict size={12} />
                          <span className={isBankDoc(rbi.doc_id) ? 'who-bank' : 'who-rbi'}>{docShort(rbi.doc_id, rbi.title)} <span className="mono">{rbi.clause}</span></span>
                        </span>
                      </button>
                    )
                  })}
                  {colItems.length > 60 && <div className="bmore">+{colItems.length - 60} more</div>}
                  {colItems.length === 0 && <div className="bempty">None</div>}
                </div>
              </section>
            )
          })}
        </div>
      )}
      {open && (
        <div className="modal-wrap" role="dialog" aria-label={`Conflict ${open.id}`}>
          <div className="drawer-scrim" onClick={() => { setOpen(null); setCite(null) }} />
          <div className="modal">
            <header className="modal-head"><span className="mono">{open.id}</span><button type="button" className="iconbtn" onClick={() => { setOpen(null); setCite(null) }} aria-label="Close"><IX /></button></header>
            <ConflictCard c={open.c} onCite={(c) => setCite({ doc_id: c.doc_id, page: c.page, label: `${docShort(c.doc_id)} ${c.clause} · p.${c.page}`, bboxes: c.bboxes })} />
            {cite && <div className="modal-pdf"><PdfView docId={cite.doc_id} page={cite.page} bboxes={cite.bboxes} label={cite.label} onPageChange={(p) => setCite({ ...cite, page: p })} /></div>}
          </div>
        </div>
      )}
    </div>
  )
}
