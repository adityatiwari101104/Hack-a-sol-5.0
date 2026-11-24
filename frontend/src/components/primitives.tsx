import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Citation, Outcome } from '../api'
import { docShort, fmtDate, isBankDoc, isUpload } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { ICheck, IClock, IConflict, IHalf, IHand, IWarn, IX } from './Icons'
import { Popover } from './Popover'

const IAskSmall = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M6.4 6.4a1.7 1.7 0 113.1 1c-.6.6-1.5.9-1.5 1.8M8 11.2h.01" /></svg>

/* OutcomeBadge: icon + label + colour, always all three (WCAG 2.1 AA; ui_research Q4). */
export function OutcomeBadge({ outcome, lang = 'en', size = 'md' }: { outcome: Outcome | string; lang?: Lang; size?: 'sm' | 'md' }) {
  const o = (outcome || 'ABSTAIN') as Outcome
  const Icon = o === 'ANSWER' ? ICheck : o === 'PARTIAL' ? IHalf : o === 'CONFLICT' ? IConflict : o === 'NEEDS_INFO' ? IAskSmall : IHand
  const label = ['ANSWER', 'PARTIAL', 'CONFLICT', 'ABSTAIN', 'NEEDS_INFO'].includes(o) ? t(o, lang) : o
  return (
    <span className={`outcome outcome-${o.toLowerCase()} outcome-${size}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
    </span>
  )
}

export function OutcomeDot({ outcome }: { outcome?: string }) {
  return <span className={`odot odot-${(outcome ?? 'none').toLowerCase()}`} aria-label={outcome ?? 'not asked'} />
}

/* Validity pip: solid green = in force; hollow grey struck = superseded (KeyCite-style flag on the citation itself). */
export function StatusPip({ status }: { status?: string }) {
  const s = status ?? 'IN_FORCE'
  const cls = s === 'IN_FORCE' ? 'pip-inforce' : s === 'SUPERSEDED' ? 'pip-superseded' : 'pip-future'
  return <span className={`pip ${cls}`} aria-hidden="true" />
}

export function StatusPill({ status, lang = 'en' }: { status?: string; lang?: Lang }) {
  const s = status ?? 'IN_FORCE'
  if (s === 'IN_FORCE') return <span className="pill pill-ok"><ICheck size={11} />{t('inForce', lang)}</span>
  if (s === 'SUPERSEDED') return <span className="pill pill-grey"><IClock size={11} /><s>{t('superseded', lang)}</s></span>
  if (s === 'NOT_YET_IN_FORCE') return <span className="pill pill-amber"><IClock size={11} />Not yet in force</span>
  return <span className="pill pill-grey">{s}</span>
}

const VERDICT_CLASS: Record<string, string> = {
  CONFLICT: 'pill-conflict', NEEDS_REVIEW: 'pill-amber', DIFFERENT_CONDITION: 'pill-grey', SUPERSESSION: 'pill-blue',
  CONSISTENT: 'pill-ok', APPLIES: 'pill-ok', DOES_NOT_APPLY: 'pill-grey', STATUS: 'pill-blue', AFFECTED: 'pill-amber',
  open: 'pill-amber', accepted: 'pill-blue', rejected: 'pill-grey', edited: 'pill-blue', signed_off: 'pill-ok',
}
const VERDICT_ICON: Record<string, ReactNode> = {
  CONFLICT: <IConflict size={11} />, NEEDS_REVIEW: <IWarn size={11} />, APPLIES: <ICheck size={11} />, signed_off: <ICheck size={11} />,
  DOES_NOT_APPLY: <IX size={11} />, open: <IClock size={11} />,
}
const VERDICT_TEXT: Record<string, string> = {
  NEEDS_REVIEW: 'Needs review', DIFFERENT_CONDITION: 'Different condition', DOES_NOT_APPLY: 'Does not apply', APPLIES: 'Applies',
  STATUS: 'Status', open: 'Pending maker', accepted: 'Accepted · pending checker', rejected: 'Rejected · pending checker',
  edited: 'Edited · pending checker', signed_off: 'Signed off', CONFLICT: 'Conflict', SUPERSESSION: 'Supersession',
  CONSISTENT: 'Consistent', AFFECTED: 'Affected',
}
export function VerdictPill({ v }: { v: string }) {
  return <span className={`pill ${VERDICT_CLASS[v] ?? 'pill-grey'}`}>{VERDICT_ICON[v]}{VERDICT_TEXT[v] ?? v}</span>
}

export function SourceTypePill({ docId, docType }: { docId: string; docType?: string }) {
  if (docId.startsWith('INS-')) {
    const faq = docId === 'INS-FAQ'
    return <span className={`srcpill ${faq ? 'srcpill-faq' : 'srcpill-bank'}`}>{faq ? 'Claim FAQ · non-binding' : docId === 'INS-POLICY' ? 'Insurance policy wording' : 'Policy endorsement'}</span>
  }
  if (isUpload(docId)) return <span className="srcpill srcpill-bank">Your upload</span>
  if (isBankDoc(docId)) {
    const nonBinding = docId === 'EUCB-S7'
    return <span className={`srcpill ${nonBinding ? 'srcpill-faq' : 'srcpill-bank'}`}>{nonBinding ? 'FAQ · non-binding' : 'Bank document'}</span>
  }
  const label = docType === 'master_direction' ? 'RBI Master Direction' : docType === 'rbi_directions' ? 'RBI Directions' : 'RBI Circular'
  return <span className="srcpill srcpill-rbi">{label}</span>
}

/* CitationChip: doc short name · clause · p. · status pip; hover/focus shows the verbatim quote; click opens the PDF. */
export function CitationChip({ c, n, active, onOpen, compact }: { c: Citation; n?: number; active?: boolean; onOpen?: (c: Citation) => void; compact?: boolean }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const btn = useRef<HTMLButtonElement>(null)
  const show = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), 180) }
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 120) }
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const isRule = !!c.rid
  const sup = c.status === 'SUPERSEDED'
  return (
    <span className="chip-wrap" onMouseEnter={show} onMouseLeave={hide}>
      <button ref={btn} type="button" className={`chip ${active ? 'chip-active' : ''} ${sup ? 'chip-sup' : ''} ${isBankDoc(c.doc_id) ? 'chip-bank' : ''}`}
        aria-describedby={id} onFocus={show} onBlur={hide} onClick={() => { setOpen(false); onOpen?.(c) }}>
        {n != null && <span className="chip-n">{n}</span>}
        <StatusPip status={c.status} />
        {!compact && <span className="chip-doc">{isRule ? `Rule ${c.rid}` : docShort(c.doc_id, c.title)}</span>}
        {c.clause && <span className="chip-clause mono">{isBankDoc(c.doc_id) ? '§' : ''}{c.clause}</span>}
        <span className="chip-page">p.{c.page}</span>
        {(c.uploaded || isUpload(c.doc_id)) && <span className="chip-tag">uploaded</span>}
        {c.ocr && <span className="chip-tag" title="Text read by OCR: check the page image">OCR</span>}
      </button>
      <span id={id} className="sr-only">{docShort(c.doc_id, c.title)} {c.clause} page {c.page}, {c.status === 'SUPERSEDED' ? 'superseded' : 'in force'}: “{c.text}”</span>
      <Popover anchor={btn} open={open} place="top-start" layer="tooltip" role="tooltip" className="hovercard open">
      <span className="hc-inner" onMouseEnter={show} onMouseLeave={hide}>
        <span className="hc-head">
          <span className="hc-title">{docShort(c.doc_id, c.title)} {c.clause && <span className="mono">{c.clause}</span>} · p.{c.page}</span>
          <StatusPill status={c.status} />
        </span>
        {c.context && !c.text.startsWith(c.context.slice(0, 40)) && (
          <span className="hc-lead serif">{c.context.length > 160 ? '…' + c.context.slice(-158) : c.context}</span>
        )}
        <span className="hc-quote serif">“{c.text}”</span>
        <span className="hc-meta">
          {c.valid_from ? <>Valid {fmtDate(c.valid_from)} → {c.valid_to ? fmtDate(c.valid_to) : 'today'}</> : isRule ? 'Rule finding computed by code' : 'Bank document'}
          {c.reconstructed && <> · rebuilt from RBI footnote</>}
          {c.located === false && <> · page-level match</>}
          {c.lead_in_used && <> · relies on the clause lead-in above</>}
          {c.ocr && <> · OCR text, check the page image</>}
          {(c.uploaded || isUpload(c.doc_id)) && <> · from an uploaded document</>}
        </span>
        {c.statement && <span className="hc-rule">{c.statement.split('. Applies to this case:')[1] ? 'Case check: ' + c.statement.split('. Applies to this case:')[1] : ''}</span>}
        <span className="hc-cta">Click to open the page with the quote boxed</span>
      </span>
      </Popover>
    </span>
  )
}

export function Section({ title, count, children, right, id }: { title: ReactNode; count?: number; children: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <section className="sec" id={id}>
      <header className="sec-head">
        <h3>{title}{count != null && <span className="count">{count}</span>}</h3>
        {right}
      </header>
      {children}
    </section>
  )
}

export function Empty({ title, children, art }: { title: string; children?: ReactNode; art?: ReactNode }) {
  return (
    <div className="empty">
      {art}
      <div className="empty-title">{title}</div>
      {children && <div className="empty-body">{children}</div>}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return <span className="spinner" role="status"><span className="spin" />{label && <span>{label}</span>}</span>
}

export function ErrorNote({ error }: { error: string }) {
  return <div className="errnote" role="alert"><IWarn size={14} /><span>{error}</span></div>
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="mono">{children}</span>
}
