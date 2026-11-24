// Judge Q&A appendix (backup slides, not presented). Build: `node build_appendix.js` in deck/.
const path = require('path')
const { P, F, W, M, THEME, newDeck, T, title, box, arrow, img } = require('./build_deck')
const { applyTheme } = require('./scripts/apply_theme.js')

const TOT = 8
function foot(s, n, src) {
  if (src) T(s, src, { x: M, y: 7.0, w: 10.6, h: 0.32, fontSize: 10.5, color: P.ink3, valign: 'bottom' })
  T(s, `Appendix · A${n}/${TOT}`, { x: W - M - 2.4, y: 7.0, w: 2.4, h: 0.32, fontSize: 10.5, color: P.ink3, align: 'right', valign: 'bottom' })
}
function table(s, rows, o) {
  const head = rows[0].map((h) => ({ text: h, options: { bold: true, fontSize: 12.5, color: P.ink2, fill: { color: P.paper }, valign: 'bottom', margin: [0.04, 0.08, 0.06, 0.08] } }))
  const body = rows.slice(1).map((r, i) => r.map((v, j) => ({ text: String(v), options: { bold: j === 0 || (o.boldCol === j), fontSize: o.fs ?? 13, color: P.ink, fill: { color: (o.hiRow === i ? P.accentTint : (i % 2 ? P.paper : P.surface)) }, valign: 'middle', margin: [0.04, 0.08, 0.04, 0.08] } })))
  s.addTable([head, ...body], { x: o.x ?? M, y: o.y ?? 1.5, w: o.w ?? W - 2 * M, colW: o.colW, rowH: o.rowH, border: { type: 'solid', color: P.line, pt: 0.75 } })
}

async function main() {
  const pres = newDeck('Proof-or-Silence: judge Q&A appendix')
  const add = () => pres.addSlide({ masterName: 'LIGHT' })

  // A1 method and numbers
  {
    const s = add()
    title(s, 'How we measured: every number replays at $0')
    table(s, [
      ['Test', 'Proof-or-Silence', 'Plain RAG (no checks)', 'What it means'],
      ['Gold set, 114 questions (strict grader)', '102/114 = 89.5% · CI 82.5–93.9 · 0 hallucinated', '—', 'Accurate = right outcome, right facts, right citation'],
      ['Held-out test, 30', '27/30', '—', 'Frozen split, never tuned on'],
      ['Fresh, 34 new questions', '29/34 = 85%', '17/34 = 50%', 'Run once; same questions for both'],
      ['Red-team, 22 attacks', '22/22', '10/22', 'Injection, false premise, superseded traps, PII, homoglyphs'],
      ['Hindi / Hinglish, 8', '8/8 · 20/20 translations pass the number check', '0/8 strict', 'Hindi shown beside the English proof'],
      ['Shown sentences not supported by their cited span', '2.8% (7/247)', '10.6% (5/47)', 'Independent audit: an opinion, not ground truth'],
      ['Quotes not found on the cited page', '0 of 375', '1 of 47 (fresh)', 'Deterministic string check'],
      ['Unanswerable / out of scope', '19/19 handled', '—', 'Says what it searched and why it stopped'],
      ['Contradiction detection', 'precision 0.93 · recall 0.81', '—', 'On labelled conflict pairs'],
    ], { y: 1.45, colW: [3.3, 3.05, 1.95, 3.83], rowH: 0.47, fs: 12.5 })
    T(s, 'Still to do: a two-person blind check of 20 fresh answers (Cohen’s κ). Three graders (strict, independent, hand check); we report the strict one.', { x: M, y: 6.5, w: W - 2 * M, h: 0.4, fontSize: 13, color: P.ink2, italic: true })
    foot(s, 1, 'eval/reports/critical/final_pass.json · reports/Banking judge critique and evals.md §3 and §7')
    s.addNotes('If asked "is 89.5% good?": Stanford measured Lexis+ AI at 65% and Westlaw AI at 41% accurate on a different legal corpus, so it is directional only. Our gates trade hallucination for "incomplete": 12 of 114 answers are incomplete, none invented.')
  }

  // A2 ablation
  {
    const s = add()
    title(s, 'Each check earns its place')
    table(s, [
      ['Check switched off', 'Wrong sentences that would reach the user', 'Answers affected', 'Good sentences lost'],
      ['In force / applicability on the as-of date', '18', '16', '0'],
      ['Numbers present in evidence + numeric binding', '7', '5', '1'],
      ['Claim-support check', '90', '55', '0'],
    ], { y: 1.5, colW: [5.0, 2.9, 1.9, 2.33], rowH: 0.56, fs: 14, hiRow: 0 })
    T(s, [
      { text: 'Why three checkers? ', options: { bold: true } },
      { text: 'Each check stops wrong sentences that nothing else would stop. The extra support steps only rescue good sentences, to cut over-refusal; they never loosen the status and number checks.' },
    ], { x: M, y: 5.0, w: W - 2 * M, h: 1.1, fontSize: 15, color: P.ink })
    foot(s, 2, 'eval/critical_ablate.py on 415 captured drafted sentences (414/415 production verdicts reproduced)')
    s.addNotes('Key line: "Take out the in-force check and 18 sentences stating superseded or inapplicable RBI text as current law reach the user."')
  }

  // A3 verification ladder detail
  {
    const s = add()
    title(s, 'Five gates per sentence; the first failure withholds it')
    const gates = [
      ['1', 'Evidence ids exist', 'cites E/R ids we actually retrieved', 'cites an id that was never in the pack'],
      ['2', 'In force on the as-of date', 'status computed from valid_from / valid_to, never stored', '“cites text SUPERSEDED on this date”'],
      ['3', 'Quote found on the page', 'exact or fuzzy ≥ 95, with word boxes for the highlight', 'quote not located on the cited page'],
      ['4', 'Every number is in the evidence', 'numbers, dates, amounts bound to the right clause', '“number not in the evidence”'],
      ['5', 'Claim supported', 'the cited quote must entail the sentence; extra steps can only rescue', '“the cited quotes do not entail this sentence”'],
    ]
    T(s, 'GATE', { x: M, y: 1.45, w: 4.3, h: 0.3, bold: true, fontSize: 12, color: P.ink3, charSpacing: 1 })
    T(s, 'HOW CODE CHECKS IT', { x: M + 4.5, y: 1.45, w: 4, h: 0.3, bold: true, fontSize: 12, color: P.ink3, charSpacing: 1 })
    T(s, 'REASON SHOWN IN THE WITHHELD TRAY', { x: M + 8.55, y: 1.45, w: 3.6, h: 0.3, bold: true, fontSize: 12, color: P.withheld, charSpacing: 1 })
    gates.forEach(([n, a, b, c], i) => {
      const y = 1.85 + i * 0.86
      box(s, M, y, 4.25, 0.7, { fill: P.accent, line: P.accent })
      T(s, `${n}  ${a}`, { x: M + 0.18, y, w: 4.0, h: 0.7, bold: true, fontSize: 15, color: 'FFFFFF', valign: 'middle' })
      T(s, b, { x: M + 4.5, y, w: 3.85, h: 0.7, fontSize: 13, color: P.ink, valign: 'middle' })
      box(s, M + 8.55, y, W - 2 * M - 8.55, 0.7, { fill: P.withheldTint, line: P.withheld })
      T(s, c, { x: M + 8.7, y, w: W - 2 * M - 8.85, h: 0.7, fontFace: F.serif, fontSize: 12, color: P.withheld, valign: 'middle' })
      if (i < gates.length - 1) arrow(s, M + 2.12, y + 0.7, M + 2.12, y + 0.84, P.ink3, 1.25)
    })
    T(s, 'If no core sentence passes: one retry with the reasons, same evidence, same bar; both drafts logged. Still nothing → the calm “I can’t prove an answer” card.', { x: M, y: 6.25, w: W - 2 * M, h: 0.5, fontSize: 13, color: P.ink2, italic: true })
    foot(s, 3, 'backend/app/verify.py · HANDOFF.md §4')
  }

  // A4 amendment chain
  {
    const s = add()
    title(s, 'Every version, its dates, and the RBI text that changed it')
    img(s, 'clause-history.png', M, 1.45, 8.3, 5.35, { alt: 'Clause history: EMI reset para 2(ii), v1 18-Aug-2023 to 01-Oct-2025 and v2 from 01-Oct-2025, side-by-side diff, and the RBI amendment footnote that proves the change' })
    const lx = M + 8.6, lw = W - M - lx
    const pts = [
      ['Versions rebuilt from RBI’s own footnotes', 'the 2025 amendment substitutes “may, at its option” for “shall”'],
      ['Status is computed for the date you ask', 'IN FORCE / SUPERSEDED / NOT YET IN FORCE, never stored'],
      ['Withdrawals are edges with a proof quote', 'WITHDRAWS, AMENDED_BY, REFERS_TO, each located verbatim'],
      ['Only in-force text can support a present-tense sentence', 'superseded text can be quoted as history, labelled'],
    ]
    pts.forEach(([a, b], i) => {
      const y = 1.5 + i * 1.3
      s.addShape('line', { x: lx, y, w: lw, h: 0, line: { color: P.line, width: 1 } })
      T(s, a, { x: lx, y: y + 0.08, w: lw, h: 0.55, bold: true, fontSize: 14, color: P.ink })
      T(s, b, { x: lx, y: y + 0.64, w: lw, h: 0.6, fontSize: 12.5, color: P.ink2 })
    })
    foot(s, 4, 'Real screen: Clause history, EMI reset para 2(ii), as of 15-Sep-2025 · backend/app/pipeline.py (edges, provision_versions)')
  }

  // A5 privacy
  {
    const s = add()
    title(s, 'What leaves the bank, and what stays')
    table(s, [
      ['Step', 'Where it runs', 'What it sees'],
      ['Parse, OCR, index the PDFs', 'On the bank’s machine', 'The documents'],
      ['Redact personal data (PAN, account no., IFSC, names)', 'On the bank’s machine', 'Question and evidence, before anything is sent'],
      ['Search and rules (tier, amount, date)', 'On the bank’s machine', 'Indexed clauses'],
      ['Draft the answer', 'AI service, or a server inside the bank', 'Only the redacted question and its evidence sentences'],
      ['Five checks per sentence', 'On the bank’s machine', 'Drafted sentences and their quotes'],
      ['Audit log (hash-chained), maker-checker', 'On the bank’s machine', 'Every answer, upload and deletion'],
    ], { y: 1.45, colW: [4.6, 3.3, 4.23], rowH: 0.52, fs: 13.5 })
    T(s, 'What was sent is listed per call in the audit row. Aligned with RBI FREE-AI (not “compliant”): understandable by design, accountability, safety.', { x: M, y: 5.6, w: W - 2 * M, h: 0.8, fontSize: 14, color: P.ink2, italic: true })
    foot(s, 5, 'docs/PRIVACY.md')
  }

  // A6 cost, speed, scale
  {
    const s = add()
    title(s, 'Cost and speed for a Tier 3 co-operative bank')
    const K = [
      ['≈ ₹0.38', 'per answer', '$0.0045 mean, $0.0086 p95 at list price; drafting is ~80% of it'],
      ['~$45', 'a month at 10,000 questions', 'third-party estimate for Harvey: ~$1,000–1,200 per seat per month'],
      ['7–15 s', 'for a live answer', 'warm local work ~1 s; the demo replays recorded calls'],
      ['1,457', 'urban co-operative banks', 'Tier 1: 838 · Tier 2: 535 · Tier 3: 78 · Tier 4: 6 (RBI, 2024-25)'],
    ]
    K.forEach(([n, a, b], i) => {
      const x = M + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.3
      s.addShape('line', { x, y, w: 5.85, h: 0, line: { color: P.accent, width: 2.5 } })
      T(s, n, { x, y: y + 0.12, w: 5.85, h: 0.8, bold: true, fontSize: 40, color: P.accent, valign: 'middle' })
      T(s, a, { x, y: y + 0.95, w: 5.85, h: 0.38, bold: true, fontSize: 16, color: P.ink })
      T(s, b, { x, y: y + 1.35, w: 5.85, h: 0.6, fontSize: 13, color: P.ink2 })
    })
    T(s, 'Roadmap, after judging: ~40% fewer tokens (prompt trims break today’s recordings, so we wait); stream verdicts, never draft text.', { x: M, y: 6.3, w: W - 2 * M, h: 0.5, fontSize: 13, color: P.ink2, italic: true })
    foot(s, 6, 'Judge report §1 and §3.8; RBI Trend & Progress 2024-25 Table V.1; Spellbook (Harvey pricing, third-party)')
  }

  // A7 honest limits
  {
    const s = add()
    title(s, 'What we have not solved yet')
    const L = [
      ['Checkers are English-trained', 'Hindi is translated from the verified English answer, never checked on its own.'],
      ['On-prem drafting is not benchmarked yet', 'the path exists; we have not measured it.'],
      ['Some table and contradiction answers are incomplete', '12 of 114 gold answers; we leave a gap rather than guess.'],
      ['Premise checks on numbers are heuristic', 'false premises are caught in our red-team, not proven in general.'],
      ['General mode compares values, not conditions', 'insurance and uploads get value-level conflicts only.'],
      ['English OCR only', 'Hindi scans need the Hindi OCR pack.'],
      ['No two-person blind check yet', 'Cohen’s κ on 20 fresh answers is the next evaluation step.'],
    ]
    L.forEach(([a, b], i) => {
      const y = 1.5 + i * 0.73
      s.addShape('line', { x: M, y, w: W - 2 * M, h: 0, line: { color: P.line, width: 1 } })
      T(s, a, { x: M, y: y + 0.12, w: 5.1, h: 0.5, bold: true, fontSize: 15, color: P.ink, valign: 'middle' })
      T(s, b, { x: M + 5.3, y: y + 0.12, w: W - 2 * M - 5.3, h: 0.5, fontSize: 14, color: P.ink2, valign: 'middle' })
    })
    foot(s, 7, 'HANDOFF.md §0')
  }

  // A8 more real screens
  {
    const s = add()
    title(s, 'Also built: refusal, calculation, insurance, audit log')
    const tiles = [
      ['abstain.png', 'Refusal: says where it looked and why it stopped'],
      ['calc.png', 'EMI computed by code, with the working shown'],
      ['ins-conflict.png', 'Insurance: endorsement says 36 months, claim FAQ says 24'],
      ['audit.png', 'Audit chain: each row hashes the previous one; verify is green'],
    ]
    const gw = (W - 2 * M - 0.3) / 2, gh = 2.55
    tiles.forEach(([f, c], i) => {
      const x = M + (i % 2) * (gw + 0.3), y = 1.45 + Math.floor(i / 2) * (gh + 0.2)
      box(s, x, y, gw, gh, { fill: P.surface, line: P.line })
      img(s, f, x + 0.15, y + 0.15, 3.6, gh - 0.3, { align: 'center', valign: 'middle', alt: c })
      T(s, c, { x: x + 3.95, y: y + 0.2, w: gw - 4.1, h: gh - 0.4, fontSize: 15, color: P.ink, valign: 'middle' })
    })
    foot(s, 8, 'Real screens, replay mode. Insurance documents are fictional (corpus/demo).')
  }

  const out = path.join(__dirname, 'Proof-or-Silence-appendix.pptx')
  await pres.writeFile({ fileName: out })
  await applyTheme(out, THEME)
  console.log('wrote', out)
}
main().catch((e) => { console.error(e); process.exit(1) })
