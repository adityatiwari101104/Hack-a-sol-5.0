// Audit hash chain as a linked list of blocks (landing_page_research.md §5b-d).
// HashChainSim: the landing version, a local 8-block simulation that hashes with real SHA-256 in the browser.
// HashChainStrip: the dashboard version, drawn from GET /trace rows and the GET /trace/verify-chain verdict.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TraceRow } from '../api'
import { fmtDateTime } from '../lib/format'

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const EVENTS = [
  'Officer A asked about pre-payment on a ₹40 lakh MSE loan → ANSWER',
  'Verifier withheld 2 sentences',
  'System answered the EMI-reset question as of 15-Sep-2025',
  'Impact report: UCB RBC Directions vs bank documents',
  'A. Rao (maker) accepted conflict on Retail Loan Policy 7.4',
  'S. Iyer (checker) signed off the item',
  'Officer A asked about the gold-loan FAQ → ABSTAIN',
  'Officer B flagged an answer for review',
]

interface Block { seq: number; payload: string; prev: string; hash: string }

export function HashChainSim() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [tampered, setTampered] = useState(false)
  const [expected, setExpected] = useState<string[]>([])

  const build = useCallback(async () => {
    const out: Block[] = []
    let prev = '0'.repeat(64)
    for (let i = 0; i < EVENTS.length; i++) {
      const hash = await sha256(prev + JSON.stringify({ seq: i + 1, event: EVENTS[i] }))
      out.push({ seq: i + 1, payload: EVENTS[i], prev, hash })
      prev = hash
    }
    setBlocks(out)
    setExpected(out.map((b) => b.hash))
    setTampered(false)
  }, [])
  useEffect(() => { build() }, [build])

  const tamper = async () => {
    const edited = blocks.map((b) => (b.seq === 5 ? { ...b, payload: b.payload.replace('accepted', 'rejected') } : b))
    // Re-hash every row from its stored prev_hash, the way verify-chain does, and compare with the stored hashes.
    const exp: string[] = []
    let prev = '0'.repeat(64)
    for (const b of edited) {
      const h = await sha256(prev + JSON.stringify({ seq: b.seq, event: b.payload }))
      exp.push(h)
      prev = h
    }
    setBlocks(edited)
    setExpected(exp)
    setTampered(true)
  }
  const firstBad = blocks.findIndex((b, i) => expected[i] && expected[i] !== b.hash)

  return (
    <div className="hcs">
      <div className="hcs-row" role="list">
        {blocks.map((b, i) => {
          const bad = firstBad >= 0 && i >= firstBad
          return (
            <div key={b.seq} role="listitem" className={`hcs-block ${bad ? 'bad' : ''} ${tampered && b.seq === 5 ? 'edited' : ''}`}>
              <div className="hcs-top"><span className="mono">#{b.seq}</span>{bad ? <span className="hcs-x">×</span> : <span className="hcs-ok">✓</span>}</div>
              <div className="hcs-p">{b.payload}</div>
              <div className="hcs-h mono" title={b.hash}>{b.hash.slice(0, 8)}</div>
              {i < blocks.length - 1 && <span className={`hcs-link ${firstBad >= 0 && i + 1 >= firstBad ? 'snapped' : ''}`} aria-hidden="true" />}
            </div>
          )
        })}
      </div>
      <div className="hcs-actions">
        {!tampered
          ? <button type="button" className="btn btn-quiet btn-sm" onClick={tamper}>Tamper with row #5</button>
          : <button type="button" className="btn btn-quiet btn-sm" onClick={build}>Restore</button>}
        <span className="hcs-msg" aria-live="polite">
          {tampered ? <>Row #5 now says “rejected”. Re-hashing it gives <span className="mono">{expected[4]?.slice(0, 8)}</span>, but the chain stored <span className="mono">{blocks[4]?.hash.slice(0, 8)}</span>: rows #5–#8 no longer verify.</>
            : 'Each block stores sha256(previous hash + its own content). Edit any row and every later link breaks.'}
        </span>
      </div>
    </div>
  )
}

export function HashChainStrip({ rows, brokenAt, ok }: { rows: TraceRow[]; brokenAt: number | null; ok: boolean | null }) {
  const last = [...rows].sort((a, b) => Number(a.seq) - Number(b.seq)).slice(-12)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth }, [rows])
  return (
    <div className="hcs hcs-strip">
      <div className="hcs-row" role="list" aria-label="Last audit rows as a chain, newest on the right" ref={ref}>
        {last.map((r, i) => {
          const seq = Number(r.seq)
          const bad = brokenAt != null && seq >= brokenAt
          const prev = last[i - 1]
          const gap = prev && Number(prev.seq) !== seq - 1
          const linkOk = prev ? prev.row_hash === r.prev_hash : true
          return (
            <div key={seq} role="listitem" className={`hcs-block ${bad ? 'bad' : ok ? 'good' : ''} ${/genesis|archive|anchor/i.test(r.event_type) ? 'genesis' : ''}`}>
              {i > 0 && <span className={`hcs-in ${!linkOk || gap ? 'snapped' : ''}`} title={linkOk ? `prev_hash ${r.prev_hash.slice(0, 8)} = row #${prev?.seq} hash` : `prev_hash ${r.prev_hash.slice(0, 8)} ≠ row #${prev?.seq} hash ${prev?.row_hash.slice(0, 8)}`} aria-hidden="true" />}
              <div className="hcs-top"><span className="mono">#{seq}</span><span className="hcs-ev">{r.event_type}</span></div>
              <div className="hcs-p tnum">{fmtDateTime(r.ts)}</div>
              <div className="hcs-h mono" title={r.row_hash}>{r.prev_hash.slice(0, 4)}→{r.row_hash.slice(0, 6)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
