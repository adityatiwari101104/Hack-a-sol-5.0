// Formatting conventions from ui_research.md Q4: DD-MMM-YYYY dates, Indian digit grouping, mono IDs.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${m[3]}-${MONTHS[Number(m[2]) - 1]}-${m[1]}`
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const t = /T(\d{2}:\d{2})/.exec(iso)
  return `${fmtDate(iso)}${t ? ' ' + t[1] : ''}`
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** ₹12,34,567.00 style grouping. */
export function inr(n: number, decimals = 2): string {
  const neg = n < 0
  const [int, dec] = Math.abs(n).toFixed(decimals).split('.')
  const last3 = int.slice(-3)
  const rest = int.slice(0, -3)
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3
  return `${neg ? '−' : ''}₹${grouped}${dec ? '.' + dec : ''}`
}

export function inrShort(n: number): string {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} crore`
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} lakh`
  return inr(n, 0)
}

/** Short, human doc code for chips: "UCB RBC MD 2025", "Retail Loan Policy". */
export function docShort(docId: string, title?: string): string {
  const known: Record<string, string> = {
    'RBI-UCB-RBC-MD-2025': 'UCB RBC MD 2025',
    'RBI-CB-RBC-MD-2025': 'CB RBC MD 2025',
    'RBI-PREPAY-DIR-2025': 'Pre-payment Dir. 2025',
    'RBI-FORECLOSURE-2014': 'Foreclosure circ. 2014',
    'RBI-PENAL-2023': 'Penal charges circ. 2023',
    'RBI-EMI-RESET-2023': 'EMI reset circ. 2023',
    'RBI-WITHDRAWAL-2025': 'Withdrawal list 2025',
    'RBI-PENAL-EXT-2023': 'Penal ext. 2023',
    'RBI-KFS-2024': 'KFS circ. 2024',
    'RBI-KFS-2024-ANNEX-B': 'KFS Annex B',
    'RBI-KFS-2024-ANNEX-C': 'KFS Annex C',
    'RBI-IRA-AMEND-2025': 'IRA amendment 2025',
    'RBI-CB-RBC-AMEND-2025': 'CB RBC amend. 2025',
    'RBI-CB-RBC-AMEND-2026': 'CB RBC amend. 2026',
    'RBI-PR-CONSOLIDATION-2025': 'Press release 2025',
    'EUCB-S1': 'Retail Loan Policy',
    'EUCB-S2': 'Home Loan Agmt',
    'EUCB-S3': 'Home Loan Agmt (copy)',
    'EUCB-S4': 'Home Loan KFS',
    'EUCB-S5': 'MSE Sanction Letters',
    'EUCB-S6': 'Foreclosure Product Note',
    'EUCB-S7': 'Gold Loan FAQ',
    'INS-POLICY': 'Policy wording',
    'INS-ENDORSE-1': 'Endorsement No. 1',
    'INS-FAQ': 'Claim FAQ',
    'UP-6c9e04c23b': 'Circular EUCB/CR/2026/07',
  }
  if (known[docId]) return known[docId]
  if (title) {
    const t = title.replace(/\s*\(FICTIONAL\)\s*/i, '').replace(/\(updated[^)]*\)/i, '').trim()
    return t.length > 34 ? t.slice(0, 32) + '…' : t
  }
  return docId
}

export function isBankDoc(docId: string): boolean {
  return docId.startsWith('EUCB') || docId.startsWith('UP-')
}

/** An uploaded document (doc ids UP-…); the backend also marks citations `uploaded: true`. */
export function isUpload(docId: string): boolean {
  return docId.startsWith('UP-')
}

export function isRbiDoc(docId: string): boolean {
  return docId.startsWith('RBI-')
}

export function cleanTitle(title?: string): string {
  return (title ?? '').replace(/\s*\(FICTIONAL\)\s*/i, '').trim()
}

/** Drafts sometimes end with "[E3, E6]" id tags; the citation chips already carry them. */
export function stripIds(text: string): string {
  return text.replace(/\s*\[(?:[ER]\d+(?:,\s*)?)+\]/g, '').trim()
}

export function profileLabel(p: string): string {
  return p === 'ucb_tier4' ? 'UCB · Tier 4' : p === 'ucb_tier3' ? 'UCB · Tier 3' : p === 'commercial_bank' ? 'Commercial bank' : p
}

export function pct(x?: number): string {
  return x == null ? '—' : `${Math.round(x * 100)}%`
}

export function shortHash(h?: string | null, n = 6): string {
  if (!h || h === 'None') return '—'
  return `${h.slice(0, n)}…${h.slice(-4)}`
}

export function humanSubject(s?: string): string {
  return (s ?? '').replace(/_/g, ' ')
}
