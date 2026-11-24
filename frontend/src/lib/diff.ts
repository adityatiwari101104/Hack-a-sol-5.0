// Word-level diff (LCS) for clause history redlines, and key-term marking for conflict cards.

export type Op = { t: 'eq' | 'ins' | 'del'; w: string }

export function wordDiff(a: string, b: string): Op[] {
  const A = a.split(/(\s+)/).filter((x) => x !== '')
  const B = b.split(/(\s+)/).filter((x) => x !== '')
  const n = A.length
  const m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: Op[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: 'eq', w: A[i] }); i++; j++ } else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: 'del', w: A[i] }); i++ } else { out.push({ t: 'ins', w: B[j] }); j++ }
  }
  while (i < n) out.push({ t: 'del', w: A[i++] })
  while (j < m) out.push({ t: 'ins', w: B[j++] })
  // merge adjacent ops of the same kind (whitespace joins its neighbours)
  const merged: Op[] = []
  for (const o of out) {
    const last = merged[merged.length - 1]
    if (last && last.t === o.t) last.w += o.w
    else merged.push({ ...o })
  }
  return merged
}

/** Python difflib.ndiff-style redline lines ("  word", "- word", "+ word", "? ...") → ops. */
export function ndiffToOps(lines: string[]): Op[] {
  const ops: Op[] = []
  for (const l of lines) {
    if (l.startsWith('? ')) continue
    const t = l.startsWith('+ ') ? 'ins' : l.startsWith('- ') ? 'del' : 'eq'
    const w = l.slice(2)
    const last = ops[ops.length - 1]
    if (last && last.t === t) last.w += ' ' + w
    else ops.push({ t, w: (ops.length ? ' ' : '') + w })
  }
  return ops
}

// Terms that decide a conflict: money, percentages, dates, and modality ("shall not" vs "may").
const KEY = /(₹\s?[\d,.]+(?:\s?(?:lakh|crore))?|Rs\.?\s?[\d,.]+(?:\s?(?:lakh|crore))?|\d+(?:\.\d+)?\s?%|\b(?:shall not|shall|may not|may|cannot|not permitted|not be levied|no (?:fee|charge|pre-payment charges?|foreclosure charges?)|prohibited|permitted|levied|at its option)\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4})/gi

export function keyTerms(text: string): { s: string; k: boolean }[] {
  const out: { s: string; k: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(KEY)) {
    const i = m.index ?? 0
    if (i > last) out.push({ s: text.slice(last, i), k: false })
    out.push({ s: m[0], k: true })
    last = i + m[0].length
  }
  if (last < text.length) out.push({ s: text.slice(last), k: false })
  return out
}
