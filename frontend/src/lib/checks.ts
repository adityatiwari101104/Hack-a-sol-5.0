import type { Sentence } from '../api'

// The five verifier gates in backend/app/verify.py (HANDOFF §4 step 7). If the backend returns
// `badges` (service.badges) we use them as-is; otherwise we derive the same thing from `checks`.

export interface Badge {
  gate: string
  ok: boolean | null
  label: string
  detail: string
  short: string
}

const SUPPORT_LABEL: Record<string, string> = {
  coverage: 'word coverage',
  lexical: 'near-verbatim match',
  hhem: 'HHEM-2.1 (NLI)',
  minicheck: 'MiniCheck (NLI)',
  'llm-judge': 'AI judge (3rd tier)',
  rule: 'code rule finding',
  calc: 'code calculation',
  triage: 'code conflict triage',
}

const GATES: [string, string, string, string][] = [
  ['ids', 'a:', 'Cited ids exist', 'ids'],
  ['status', 'b:', 'In force on the as-of date', 'in force'],
  ['quote', 'c:', 'Quote located on the page', 'quote'],
  ['numbers', 'd:', 'Numbers and dates found in the evidence', 'numbers'],
  ['support', 'e:', 'Claim supported by the evidence', 'support'],
]

export function badgesFor(s: Sentence & { badges?: Omit<Badge, 'short'>[] }): Badge[] {
  if (Array.isArray(s.badges) && s.badges.length) {
    return s.badges.map((b) => ({ ...b, short: GATES.find((g) => g[0] === b.gate)?.[3] ?? b.gate }))
  }
  const checks = s.checks ?? []
  const codeStmt = !(s.cites?.length) && checks.some((c) => c.includes('(code'))
  let failed = false
  return GATES.map(([gate, prefix, label, short]) => {
    const hit = checks.find((c) => c.startsWith(prefix))
    if (codeStmt && gate !== 'support') return { gate, ok: null, label, detail: 'Code statement: not drafted by the model', short }
    if (hit) {
      let detail = hit.slice(2)
      if (gate === 'support') {
        const kind = detail.split(' ')[0]
        detail = (SUPPORT_LABEL[kind] ?? kind) + detail.slice(kind.length)
      }
      return { gate, ok: true, label, detail, short }
    }
    if (s.verdict === 'BLOCKED' && !failed) {
      failed = true
      return { gate, ok: false, label, detail: s.reason, short }
    }
    return { gate, ok: null, label, detail: 'Not run', short }
  })
}

/** Which support model passed the sentence, for the compact label next to the badges. */
export function supportKind(s: Sentence): string | null {
  const e = (s.checks ?? []).find((c) => c.startsWith('e:'))
  if (!e) return null
  const kind = e.slice(2).split(' ')[0]
  return SUPPORT_LABEL[kind] ?? kind
}

/** Plain-words version of a verifier block reason. */
export function plainReason(reason: string): string {
  const r = reason || ''
  if (/not supported by cited evidence/i.test(r)) return `The cited quotes do not entail this sentence — ${r.replace(/^not supported by cited evidence\s*/i, '').replace(/[()]/g, '')}`
  if (/number\/date not in cited evidence/i.test(r)) return `A number or date in the sentence appears in no cited quote — ${r.split(':').slice(1).join(':').trim()}`
  if (/SUPERSEDED/i.test(r)) return 'It cites text that is not in force on the as-of date'
  if (/quote/i.test(r) && /not (found|located)/i.test(r)) return 'Its quote could not be located on the cited page'
  if (/unknown|no such id|ids/i.test(r)) return 'It cites evidence ids that do not exist'
  if (/no cit/i.test(r)) return 'It makes a claim without citing any evidence'
  return r
}
