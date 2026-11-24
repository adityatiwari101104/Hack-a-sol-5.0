// Evidence viewer: react-pdf 11 page + absolutely positioned highlight boxes scaled by rendered/original width
// (reports/Proof or Silence next steps.md: "react-pdf 11 with absolutely positioned highlight divs").
// Page size comes from pdf.js itself, so GET /documents/{id}/pages is not required.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { api, type BBoxes } from '../api'
import { IChevron, IZoomIn, IZoomOut } from './Icons'
import { Spinner } from './primitives'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

type Box = [number, number, number, number]

// Page sizes from GET /documents/{id}/pages (the units the bboxes were stored in). pdf.js size is the fallback.
const sizeCache: Record<string, Promise<Record<number, { w: number; h: number }>>> = {}
function pageSizes(docId: string) {
  sizeCache[docId] ??= api.pages(docId)
    .then((r) => Object.fromEntries(r.pages.map((p) => [p.page_no, { w: p.width, h: p.height }])))
    .catch(() => ({}))
  return sizeCache[docId]
}

/** Merge word boxes on one line into a single rectangle so the quote reads as a calm block, not confetti. */
export function mergeBoxes(words: Box[]): Box[] {
  const line = (b: Box) => Math.round((b[1] + b[3]) / 2 / 4)
  const sorted = [...words].sort((a, b) => line(a) - line(b) || a[0] - b[0])
  const lines: Box[] = []
  for (const w of sorted) {
    const last = lines[lines.length - 1]
    if (last && Math.abs((last[1] + last[3]) / 2 - (w[1] + w[3]) / 2) < 4 && w[0] - last[2] < 18 && w[0] >= last[0] - 1) {
      last[2] = Math.max(last[2], w[2])
      last[1] = Math.min(last[1], w[1])
      last[3] = Math.max(last[3], w[3])
    } else {
      lines.push([...w] as Box)
    }
  }
  return lines
}

export function PdfView({ docId, page, bboxes, onPageChange, label, tone = 'amber' }: {
  docId: string
  page: number
  bboxes?: BBoxes
  onPageChange?: (p: number) => void
  label?: string
  tone?: 'amber' | 'bank' | 'rbi'
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(520)
  const [zoom, setZoom] = useState(1)
  const [orig, setOrig] = useState<{ w: number; h: number } | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const [rendered, setRendered] = useState(0)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, Math.floor(e.contentRect.width) - 2)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [stored, setStored] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    let alive = true
    setStored(null)
    pageSizes(docId).then((m) => alive && setStored(m[page] ?? null))
    return () => { alive = false }
  }, [docId, page])

  const boxes = useMemo(() => mergeBoxes((bboxes?.[String(page)] ?? []) as Box[]), [bboxes, page])
  const renderW = Math.round(width * zoom)
  const base = stored ?? orig
  const scale = base ? renderW / base.w : 1

  // Scroll the boxed quote into view and pulse it once each time the citation changes.
  useEffect(() => {
    setPulse((p) => p + 1)
  }, [docId, page, bboxes])
  useEffect(() => {
    if (!orig || !boxes.length || !wrap.current) return
    const top = boxes[0][1] * scale
    wrap.current.scrollTo({ top: Math.max(0, top - 90), behavior: 'smooth' })
  }, [orig, boxes, scale, pulse, rendered])

  const file = api.pdfUrl(docId)
  return (
    <div className="pdfview">
      <div className="pdf-toolbar">
        <span className="pdf-label">{label}</span>
        <span className="pdf-tools">
          <button type="button" className="iconbtn" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
            <IChevron style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="pdf-pageno mono">p.{page}{numPages ? ` / ${numPages}` : ''}</span>
          <button type="button" className="iconbtn" aria-label="Next page" disabled={!!numPages && page >= numPages} onClick={() => onPageChange?.(page + 1)}>
            <IChevron />
          </button>
          <span className="sep" />
          <button type="button" className="iconbtn" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}><IZoomOut /></button>
          <span className="mono pdf-zoom">{Math.round(zoom * 100)}%</span>
          <button type="button" className="iconbtn" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))}><IZoomIn /></button>
        </span>
      </div>
      <div className="pdf-scroll" ref={wrap}>
        {err ? (
          <div className="pdf-err">The PDF could not be loaded ({err}). RBI PDFs are not committed to the repo; run <code>make manifest</code> to copy them in.</div>
        ) : (
          <Document file={file} loading={<div className="pdf-loading"><Spinner label="Loading PDF…" /></div>}
            onLoadSuccess={(d) => { setNumPages(d.numPages); setErr(null) }} onLoadError={(e) => setErr(e.message)}>
            <div className="pdf-page" style={{ width: renderW }}>
              <Page pageNumber={page} width={renderW} renderTextLayer={false} renderAnnotationLayer={false}
                loading={<div className="pdf-loading" style={{ height: renderW * 1.3 }}><Spinner /></div>}
                onRenderSuccess={() => setRendered((n) => n + 1)}
                onLoadSuccess={(p) => {
                  const vp = p.getViewport({ scale: 1 })
                  setOrig({ w: vp.width, h: vp.height })
                }} />
              {orig && boxes.map((b, i) => (
                <span key={`${pulse}-${i}`} className={`hlbox hl-${tone}`} style={{
                  left: (b[0] - 2) * scale, top: (b[1] - 1.5) * scale, width: (b[2] - b[0] + 4) * scale, height: (b[3] - b[1] + 3) * scale,
                  animationDelay: `${i * 30}ms`,
                }} />
              ))}
            </div>
          </Document>
        )}
      </div>
    </div>
  )
}
