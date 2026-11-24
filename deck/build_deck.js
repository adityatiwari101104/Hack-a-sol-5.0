// DocuHelp pitch deck: 8 slides (+ appendix in a separate file). Build: `node build_deck.js` in deck/.
// Palette: research_notes/Winning hackathon deck/colour_theory_and_palette.md (product tokens, contrast-fixed).
// Diagrams are native shapes (editable in PowerPoint). Screens are real 2x captures in assets/crops/.
const pptxgen = require('pptxgenjs')
const path = require('path')
const fs = require('fs')
const { imageSize } = require('./scripts/imgsize')
const N = require('./notes')

// ---------- tokens ----------
const P = {
  paper: 'F7F5EF', surface: 'FFFEFB', surface2: 'F1EEE6', line: 'E3DFD4', lineStrong: 'CDC8BA',
  ink: '1B1E22', ink2: '474C54', ink3: '5C6169',
  accent: '1F3A5F', accentTint: 'E5EBF3',
  hl: 'F9E3A2', hlBorder: 'D29A12',
  proven: '14704F', provenTint: 'E3EFE5',
  withheld: '7A2A1A', withheldTint: 'F6E8E3',
  conflict: '962A66', conflictTint: 'F5E3EC',
  abstain: '3F6590', abstainTint: 'E6ECF3',
  superseded: '5C6169', supersededMark: '7A7E86',
  bank: '6A40A3', bankTint: 'EFE8F8', rbi: '964A00', rbiTint: 'FBEADB',
  // dark (title + close)
  navy: '14263D', onNavy: 'F3F1EC', onNavy2: 'C9D2DE', navyLine: '34496A', navyAccent: '9DBBE2',
}
const F = { head: 'IBM Plex Sans', body: 'IBM Plex Sans', serif: 'IBM Plex Serif', mono: 'IBM Plex Mono' }
const W = 13.333, H = 7.5, M = 0.6
const TOTAL = 8

const THEME = {
  name: 'DocuHelp', headFontFace: F.head, bodyFontFace: F.body,
  colors: { dk1: P.ink, lt1: P.surface, dk2: P.accent, lt2: P.paper, accent1: P.accent, accent2: P.proven,
    accent3: P.withheld, accent4: P.conflict, accent5: P.abstain, accent6: P.rbi, hlink: P.accent, folHlink: P.ink2 },
}

function newDeck(title) {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_WIDE'
  pres.author = 'Team DocuHelp (Gaurav, Tiwari)'
  pres.title = title
  pres.theme = { headFontFace: F.head, bodyFontFace: F.body }
  pres.defineSlideMaster({ title: 'LIGHT', background: { color: P.paper }, objects: [] })
  pres.defineSlideMaster({ title: 'DARK', background: { color: P.navy }, objects: [] })
  return pres
}

// ---------- helpers ----------
const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: F.body, color: P.ink, valign: 'top', ...o })
function title(s, text, o = {}) {
  T(s, text, { x: M, y: 0.42, w: W - 2 * M, h: 0.95, bold: true, fontFace: F.head, fontSize: 32, color: P.ink, valign: 'middle', fit: 'none', ...o })
}
function footer(s, n, src, dark = false) {
  const c = dark ? P.onNavy2 : P.ink3
  if (src) T(s, src, { x: M, y: 7.0, w: 10.6, h: 0.32, fontSize: 10.5, color: c, valign: 'bottom' })
  T(s, `DocuHelp · ${n}/${TOTAL}`, { x: W - M - 2.4, y: 7.0, w: 2.4, h: 0.32, fontSize: 10.5, color: c, align: 'right', valign: 'bottom' })
}
function box(s, x, y, w, h, o = {}) {
  s.addShape('roundRect', { x, y, w, h, rectRadius: o.r ?? 0.06, fill: { color: o.fill ?? P.surface }, line: { color: o.line ?? P.line, width: o.lw ?? 1, dashType: o.dash ?? 'solid' }, ...(o.shadow ? { shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 6, offset: 2, angle: 90 } } : {}) })
}
function arrow(s, x1, y1, x2, y2, color = P.ink3, w = 1.5) {
  const flipH = x2 < x1, flipV = y2 < y1
  s.addShape('line', { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipH, flipV, line: { color, width: w, endArrowType: 'triangle' } })
}
function dot(s, n, x, y, o = {}) { // numbered callout, centred on (x, y)
  const d = o.d ?? 0.42
  s.addShape('ellipse', { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: o.fill ?? P.accent }, line: { color: o.ring ?? 'FFFFFF', width: 2 } })
  T(s, String(n), { x: x - d / 2, y: y - d / 2, w: d, h: d, bold: true, fontFace: F.head, fontSize: o.fs ?? 15, color: o.color ?? 'FFFFFF', align: 'center', valign: 'middle' })
}
function img(s, file, x, y, w, h, o = {}) { // fit inside (w, h), keep aspect; returns placed rect
  const p = path.join(__dirname, 'assets', 'crops', file)
  const { width, height } = imageSize(p)
  let iw = w, ih = (w * height) / width
  if (ih > h) { ih = h; iw = (h * width) / height }
  const ix = o.align === 'center' ? x + (w - iw) / 2 : o.align === 'right' ? x + w - iw : x
  const iy = o.valign === 'middle' ? y + (h - ih) / 2 : y
  if (o.frame !== false) s.addShape('rect', { x: ix - 0.02, y: iy - 0.02, w: iw + 0.04, h: ih + 0.04, fill: { color: 'FFFFFF' }, line: { color: o.frameColor ?? P.lineStrong, width: 0.75 }, shadow: { type: 'outer', color: '000000', opacity: o.dark ? 0.35 : 0.10, blur: 10, offset: 3, angle: 90 } })
  s.addImage({ path: p, x: ix, y: iy, w: iw, h: ih, altText: o.alt ?? file })
  return { x: ix, y: iy, w: iw, h: ih, at: (fx, fy) => [ix + fx * iw, iy + fy * ih] }
}
function tag(s, text, x, y, color, tint, o = {}) {
  const w = o.w ?? (0.16 + text.length * 0.085)
  s.addShape('roundRect', { x, y, w, h: 0.3, rectRadius: 0.05, fill: { color: tint }, line: { color, width: 1 } })
  T(s, text, { x, y, w, h: 0.3, fontSize: 11.5, bold: true, fontFace: F.head, color, align: 'center', valign: 'middle' })
  return w
}

module.exports = { P, F, W, H, M, THEME, newDeck, T, title, footer, box, arrow, dot, img, tag }

// ---------- the 8 slides ----------
async function main() {
  const pres = newDeck('DocuHelp: every sentence proven, or nothing said')

  // 1 ── Hook ───────────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'DARK' })
    T(s, 'Hackasol 5.0  ·  Track 2 AIML  ·  AIML-02', { x: M, y: 0.5, w: 6, h: 0.3, fontSize: 13, color: P.onNavy2 })
    T(s, 'A bank can’t act on an answer it can’t prove.', { x: M, y: 1.0, w: 5.75, h: 1.5, bold: true, fontFace: F.head, fontSize: 38, color: P.onNavy, lineSpacingMultiple: 0.95, valign: 'top' })
    s.addShape('rect', { x: M, y: 2.78, w: 5.75, h: 1.18, fill: { color: P.hl }, line: { color: P.hl, width: 0 } })
    T(s, [
      { text: 'DocuHelp ', options: { bold: true, fontFace: F.head } },
      { text: 'shows every sentence with its quote, page and in-force date — or withholds it and says why.' },
    ], { x: M + 0.22, y: 2.78, w: 5.35, h: 1.18, fontSize: 19, color: P.ink, valign: 'middle' })
    const items = [
      'Five code checks on every drafted sentence',
      'A verbatim quote, page and in-force pip on every sentence',
      'Unproven sentences go to the Withheld tray, with the reason',
    ]
    items.forEach((t, i) => {
      const y = 4.32 + i * 0.66
      dot(s, i + 1, M + 0.21, y + 0.17, { fill: P.hl, color: P.ink, ring: P.navy, d: 0.4 })
      T(s, t, { x: M + 0.6, y: y - 0.05, w: 5.15, h: 0.48, fontSize: 16, color: P.onNavy, valign: 'middle' })
    })
    T(s, 'Team: Gaurav · Tiwari', { x: M, y: 6.55, w: 4, h: 0.3, fontSize: 13, color: P.onNavy2 })
    const r = img(s, 'hero-withheld.png', 7.05, 0.95, 5.68, 5.75, { dark: true, frameColor: P.navyLine, alt: 'DocuHelp answer: two proven sentences with citation chips and a Withheld tray showing a struck-through sentence and its reason' })
    const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'crops', 'callouts.json'), 'utf8'))['hero-withheld.png']
    C.forEach(([n, fx, fy]) => dot(s, n, ...r.at(fx, fy), { fill: P.hl, color: P.ink, ring: P.navy }))
    T(s, 'Real screen · EMI-reset question, as of 15-Sep-2025 · replayed', { x: r.x, y: r.y + r.h + 0.12, w: r.w, h: 0.28, fontSize: 10.5, color: P.onNavy2, align: 'right' })
    footer(s, 1, null, true)
    s.addNotes(N.s1)
  }

  // 2 ── Problem ────────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'Chatbots still cite rules that are no longer law')
    // timeline: RBI penal-charges circular RBI/2023-24/53
    const x0 = M + 0.15, x1 = W - M - 0.15, ay = 3.0
    const t0 = Date.UTC(2023, 6, 1), t1 = Date.UTC(2026, 11, 31)
    const X = (y, m, d) => x0 + ((Date.UTC(y, m - 1, d) - t0) / (t1 - t0)) * (x1 - x0)
    T(s, 'One real RBI circular: Penal Charges in Loan Accounts, RBI/2023-24/53', { x: M, y: 1.45, w: 9, h: 0.34, bold: true, fontFace: F.head, fontSize: 15, color: P.ink2 })
    // bands
    s.addShape('rect', { x: X(2024, 4, 1), y: ay - 0.13, w: X(2025, 11, 28) - X(2024, 4, 1), h: 0.26, fill: { color: P.provenTint }, line: { color: P.proven, width: 1 } })
    T(s, 'in force', { x: X(2024, 4, 1), y: ay - 0.13, w: X(2025, 11, 28) - X(2024, 4, 1), h: 0.26, fontSize: 11.5, color: P.proven, align: 'center', valign: 'middle', bold: true, fontFace: F.head })
    s.addShape('rect', { x: X(2025, 11, 28), y: ay - 0.13, w: x1 - X(2025, 11, 28), h: 0.26, fill: { color: P.surface2 }, line: { color: P.supersededMark, width: 1, dashType: 'dash' } })
    T(s, 'withdrawn — but still in the PDF', { x: X(2025, 11, 28), y: ay - 0.13, w: x1 - X(2025, 11, 28), h: 0.26, fontSize: 11.5, color: P.superseded, align: 'center', valign: 'middle', bold: true, fontFace: F.head })
    s.addShape('line', { x: x0, y: ay, w: X(2024, 4, 1) - x0, h: 0, line: { color: P.lineStrong, width: 2 } })
    const ev = [
      [X(2023, 8, 18), '18-Aug-2023', 'Circular issued', P.ink],
      [X(2024, 4, 1), '01-Apr-2024', 'Applies to fresh loans', P.ink],
      [X(2025, 11, 28), '28-Nov-2025', 'Withdrawn by RBI', P.ink],
    ]
    ev.forEach(([x, d, t, c], i) => {
      s.addShape('line', { x, y: ay - 0.42, w: 0, h: 0.29, line: { color: P.ink3, width: 1.25 } })
      const lx = Math.min(Math.max(x - 1.25, M), W - M - 2.5)
      T(s, d, { x: lx, y: 1.88, w: 2.5, h: 0.32, bold: true, fontFace: F.head, fontSize: 16, color: c, align: i === 0 ? 'left' : 'center' })
      T(s, t, { x: lx, y: 2.18, w: 2.5, h: 0.4, fontSize: 13, color: P.ink2, align: i === 0 ? 'left' : 'center' })
    })
    // today: plain RAG vs ours
    const xt = X(2026, 11, 23)
    s.addShape('line', { x: xt, y: ay - 0.42, w: 0, h: 0.62, line: { color: P.withheld, width: 2.25 } })
    T(s, '23-Nov-2026', { x: W - M - 1.9, y: 1.88, w: 1.9, h: 0.32, bold: true, fontFace: F.head, fontSize: 16, color: P.withheld, align: 'right' })
    T(s, 'Asked today', { x: W - M - 1.9, y: 2.18, w: 1.9, h: 0.4, fontSize: 13, color: P.ink2, align: 'right' })
    T(s, [{ text: 'Asked on 23-Nov-2026:  ', options: { bold: true, fontFace: F.head, color: P.ink } }, { text: '“Is the 2023 penal charges circular the rule we should cite today?”', options: { italic: true, color: P.ink } }], { x: M, y: 3.38, w: W - 2 * M, h: 0.36, fontSize: 15, valign: 'middle' })
    // answers under the axis
    box(s, M, 3.88, 5.95, 1.0, { fill: P.withheldTint, line: P.withheld, lw: 1.25 })
    T(s, [
      { text: 'Plain RAG (no checks):  ', options: { bold: true, fontFace: F.head, color: P.withheld } },
      { text: '“Yes — the 2023 circular is the current rule to cite for penal charges in your loan policy.”', options: { fontFace: F.serif, color: P.ink } },
    ], { x: M + 0.2, y: 3.88, w: 5.6, h: 1.0, fontSize: 14, valign: 'middle' })
    box(s, M + 6.18, 3.88, 5.95, 1.0, { fill: P.provenTint, line: P.proven, lw: 1.25 })
    T(s, [
      { text: 'DocuHelp:  ', options: { bold: true, fontFace: F.head, color: P.proven } },
      { text: '“No: as of 2026-11-23, the 2023 circular on penal charges and its timeline extension have been withdrawn and are no longer in force.”', options: { fontFace: F.serif, color: P.ink } },
    ], { x: M + 6.38, y: 3.88, w: 5.6, h: 1.0, fontSize: 14, valign: 'middle' })
    // evidence cells
    const cells = [
      ['17–33%', 'of answers from commercial legal AI research tools were hallucinated (Lexis+ AI >17%, Westlaw AI >33%)', 'Stanford RegLab, Magesh et al., JELS 2025'],
      ['13.34 lakh', 'complaints to the RBI Ombudsman in FY25; loans and advances were the top ground (29.25%)', 'RBI Integrated Ombudsman annual report FY25'],
      ['18%', 'of AI-using regulated entities keep audit logs (RBI FREE-AI survey, 612 entities)', 'RBI FREE-AI report, 2025 (via Dvara Research)'],
    ]
    const cw = (W - 2 * M - 0.6) / 3
    cells.forEach(([n, t, src], i) => {
      const x = M + i * (cw + 0.3)
      s.addShape('line', { x, y: 5.15, w: cw, h: 0, line: { color: P.accent, width: 2.5 } })
      T(s, n, { x, y: 5.22, w: cw, h: 0.56, bold: true, fontFace: F.head, fontSize: 30, color: P.accent, valign: 'middle' })
      T(s, t, { x, y: 5.8, w: cw, h: 0.68, fontSize: 13, color: P.ink })
      T(s, src, { x, y: 6.52, w: cw, h: 0.3, fontSize: 10.5, color: P.ink3 })
    })
    footer(s, 2, 'Both answers are recorded outputs (red-team item r12). Circular dates from corpus/registry.json.')
    s.addNotes(N.s2)
  }

  // 3 ── The product ────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'Each sentence ships with its proof, or it doesn’t ship')
    const r = img(s, 'answer-workspace.png', M + 0.42, 1.55, 8.1, 5.25, { alt: 'Answer workspace: proof meter, three proven sentences with citation chips, and the RBI page with the quote highlighted' })
    const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'crops', 'callouts.json'), 'utf8'))['answer-workspace.png']
    C.forEach(([n, fx, fy]) => dot(s, n, ...r.at(fx, fy)))
    const L = [
      ['EXACT CITATIONS', 'Document, clause, page and an in-force pip on every chip.'],
      ['ZERO-GUESSING', 'Five checks per sentence: ids, in force, quote on the page, numbers, support.'],
      ['FAITHFULNESS SCORE', 'Drafted → passed → shown, with the withheld count. Not 100% by construction.'],
      ['BONUS · PDF HIGHLIGHT', 'A chip opens the page with the quote boxed and its lead-in.'],
    ]
    const lx = M + 8.9, lw = W - M - lx
    L.forEach(([k, t], i) => {
      const y = 1.55 + i * 1.22
      dot(s, i + 1, lx + 0.2, y + 0.2)
      T(s, k, { x: lx + 0.55, y: y + 0.02, w: lw - 0.55, h: 0.3, bold: true, fontFace: F.head, fontSize: 12, color: P.accent, charSpacing: 1 })
      T(s, t, { x: lx + 0.55, y: y + 0.33, w: lw - 0.55, h: 0.8, fontSize: 15, color: P.ink })
    })
    T(s, 'Labels are the brief’s own must-haves.', { x: lx, y: 6.42, w: lw, h: 0.3, fontSize: 11.5, color: P.ink3, italic: true })
    footer(s, 3, 'Built and running. Real screen: Tier 3 UCB, ₹40 lakh MSE loan, as of 23-Nov-2026 (question q028), replayed from recorded answers at $0.')
    s.addNotes(N.s3)
  }

  // 4 ── Demo moments ───────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'Live: the date changes the law, and conflicts surface before anyone relies on them', { fontSize: 28 })
    const tiles = [
      [null, 'AMENDMENT CHAINS · AS-OF DATE', 'Same question, two dates, two versions of the rule.'],
      ['conflict.png', 'CONTRADICTION · SIDE BY SIDE', 'Bank clause 9.3 charges 2%; RBI 261(1) says no charge.'],
      ['upload.png', 'LIVE PDF UPLOAD', 'Redacted, indexed and conflict-checked on arrival.'],
      ['summary-hi.png', 'VERIFIED SUMMARY · HINDI', 'Each key point proven; Hindi beside the proof.'],
    ]
    const gw = (W - 2 * M - 0.3) / 2, gh = 2.66
    tiles.forEach(([f, k, t], i) => {
      const x = M + (i % 2) * (gw + 0.3), y = 1.48 + Math.floor(i / 2) * (gh + 0.2)
      box(s, x, y, gw, gh, { fill: P.surface, line: P.line })
      dot(s, i + 1, x + 0.36, y + 0.34, { d: 0.38, fs: 13 })
      T(s, k, { x: x + 0.66, y: y + 0.19, w: gw - 0.8, h: 0.3, bold: true, fontFace: F.head, fontSize: 12, color: P.accent, charSpacing: 0.5, valign: 'middle' })
      T(s, t, { x: x + 0.66, y: y + 0.5, w: gw - 0.85, h: 0.3, fontSize: 14, color: P.ink })
      const ix = x + 0.2, iy = y + 0.92, iw = gw - 0.4, ih = gh - 1.07
      if (f) { img(s, f, ix, iy, iw, ih, { align: 'center', valign: 'middle', alt: k }); return }
      // native as-of rows (real quotes: RBI EMI-reset circular 2(ii) and its 2025 amendment)
      const rows = [
        ['18-Aug-2023 → 01-Oct-2025', '“…REs shall provide the option to the borrowers to switch over to a fixed rate…”', 'as of 15-Sep-2025', P.surface2, P.supersededMark, 'dash', P.superseded],
        ['01-Oct-2025 → today', '“…REs may, at its option, provide a choice to the borrowers to switch over…”', 'as of 15-Oct-2025', P.provenTint, P.proven, 'solid', P.proven],
      ]
      rows.forEach(([d, q, a, fill, line, dash, c], j) => {
        const ry = iy + 0.02 + j * 0.8, rw = iw - 1.8
        s.addShape('rect', { x: ix, y: ry, w: rw, h: 0.72, fill: { color: fill }, line: { color: line, width: 1.25, dashType: dash } })
        T(s, d, { x: ix + 0.12, y: ry + 0.05, w: rw - 0.2, h: 0.22, fontFace: F.mono, fontSize: 10.5, color: c })
        T(s, q, { x: ix + 0.12, y: ry + 0.27, w: rw - 0.2, h: 0.4, fontFace: F.serif, fontSize: 11.5, color: P.ink, valign: 'middle' })
        arrow(s, ix + iw - 1.72, ry + 0.36, ix + rw + 0.04, ry + 0.33, P.accent, 1.5)
        T(s, a, { x: ix + iw - 1.66, y: ry + 0.2, w: 1.7, h: 0.32, bold: true, fontFace: F.head, fontSize: 11.5, color: P.accent, valign: 'middle' })
      })
    })
    footer(s, 4, 'All four run in the demo from recorded answers ($0). Upload: corpus/demo/upload/EUCB-circular-2026-07.pdf (fictional bank circular).')
    s.addNotes(N.s4)
  }

  // 5 ── How it works ───────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'The AI only drafts. Code decides what you see')
    const cols = [0.6, 2.48, 4.36, 6.24, 8.12, 11.08], bw = 1.6
    // lane labels
    T(s, 'Plain RAG', { x: M, y: 1.38, w: 3, h: 0.32, bold: true, fontFace: F.head, fontSize: 14, color: P.ink3, charSpacing: 1 })
    T(s, 'DocuHelp', { x: M, y: 2.74, w: 3, h: 0.32, bold: true, fontFace: F.head, fontSize: 14, color: P.accent, charSpacing: 1 })
    // plain RAG lane (grey)
    const ry = 1.75, rh = 0.62
    const rag = [[cols[1], 'Search'], [cols[3], 'AI writes answer + quotes'], [cols[5], 'Shown as written']]
    rag.forEach(([x, t]) => { box(s, x, ry, bw, rh, { fill: P.surface2, line: P.lineStrong }); T(s, t, { x: x + 0.08, y: ry, w: bw - 0.16, h: rh, fontSize: 12.5, color: P.ink2, align: 'center', valign: 'middle' }) })
    arrow(s, cols[1] + bw, ry + rh / 2, cols[3] - 0.04, ry + rh / 2, P.supersededMark)
    arrow(s, cols[3] + bw, ry + rh / 2, cols[4] - 0.03, ry + rh / 2, P.supersededMark)
    arrow(s, cols[4] + 2.6, ry + rh / 2, cols[5] - 0.04, ry + rh / 2, P.supersededMark)
    box(s, cols[4], ry + 0.04, 2.6, rh - 0.08, { fill: P.paper, line: P.supersededMark, dash: 'dash' })
    T(s, 'no check', { x: cols[4], y: ry, w: 2.6, h: rh, fontSize: 12.5, color: P.ink3, align: 'center', valign: 'middle', italic: true })
    // our lane
    const y = 3.12, h = 1.55
    const ours = [
      [cols[0], 'Parse', '22 PDFs into clauses, pages, word boxes, versions', 'local'],
      [cols[1], 'Search', 'all 22 documents, plus amendment links', 'local'],
      [cols[2], 'Rules by code', 'tier, amount, date; PII redacted', 'code'],
      [cols[3], 'Draft', '≤ 4 sentences, each citing evidence ids', 'llm'],
    ]
    const sty = { local: { fill: P.accentTint, line: P.abstain, dash: 'solid' }, code: { fill: P.accent, line: P.accent, dash: 'solid' }, llm: { fill: P.surface, line: P.ink3, dash: 'dash' } }
    ours.forEach(([x, a, b, k]) => {
      const st = sty[k]; box(s, x, y, bw, h, { fill: st.fill, line: st.line, dash: st.dash, lw: 1.5 })
      const c = k === 'code' ? 'FFFFFF' : P.ink
      T(s, a, { x: x + 0.1, y: y + 0.16, w: bw - 0.2, h: 0.36, bold: true, fontFace: F.head, fontSize: 15, color: c, align: 'center' })
      T(s, b, { x: x + 0.1, y: y + 0.56, w: bw - 0.2, h: 0.9, fontSize: 12, color: k === 'code' ? 'DCE4EE' : P.ink2, align: 'center' })
    })
    for (let i = 0; i < 3; i++) arrow(s, cols[i] + bw, y + h / 2, cols[i + 1] - 0.04, y + h / 2, P.ink3)
    // verify box (the hero)
    const vx = cols[4], vw = 2.6, vy = 2.98, vh = 3.62
    box(s, vx, vy, vw, vh, { fill: P.accent, line: P.accent, lw: 1.5, shadow: true })
    arrow(s, cols[3] + bw, y + h / 2, vx - 0.04, y + h / 2, P.ink3)
    T(s, 'Verify each sentence', { x: vx + 0.15, y: vy + 0.14, w: vw - 0.3, h: 0.36, bold: true, fontFace: F.head, fontSize: 15.5, color: 'FFFFFF' })
    const rungs = ['Evidence ids exist', 'In force on the as-of date', 'Quote found on the page', 'Every number is in the evidence', 'Claim supported by the quote']
    rungs.forEach((t, i) => {
      const ry2 = vy + 0.6 + i * 0.58
      s.addShape('ellipse', { x: vx + 0.17, y: ry2 + 0.04, w: 0.3, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 } })
      T(s, String(i + 1), { x: vx + 0.17, y: ry2 + 0.04, w: 0.3, h: 0.3, bold: true, fontFace: F.head, fontSize: 11.5, color: P.accent, align: 'center', valign: 'middle' })
      T(s, t, { x: vx + 0.58, y: ry2, w: vw - 0.7, h: 0.52, fontSize: 12.5, color: 'FFFFFF', valign: 'top' })
    })
    // outcomes
    const ox = cols[5], ow = W - M - ox
    box(s, ox, 3.0, ow, 1.42, { fill: P.provenTint, line: P.proven, lw: 1.75 })
    T(s, '✓ Shown', { x: ox + 0.15, y: 3.1, w: ow - 0.3, h: 0.36, bold: true, fontFace: F.head, fontSize: 15.5, color: P.proven })
    T(s, 'with quote, page, box and date', { x: ox + 0.15, y: 3.48, w: ow - 0.3, h: 0.8, fontSize: 12.5, color: P.ink })
    box(s, ox, 4.9, ow, 1.7, { fill: P.withheldTint, line: P.withheld, lw: 1.75 })
    T(s, '✕ Withheld', { x: ox + 0.15, y: 5.0, w: ow - 0.3, h: 0.36, bold: true, fontFace: F.head, fontSize: 15.5, color: P.withheld })
    T(s, 'never shown as an answer; the tray says which check failed', { x: ox + 0.15, y: 5.38, w: ow - 0.3, h: 1.1, fontSize: 12.5, color: P.ink })
    arrow(s, vx + vw, 3.71, ox - 0.04, 3.71, P.proven, 2)
    arrow(s, vx + vw, 5.75, ox - 0.04, 5.75, P.withheld, 2)
    // repair loop + legend
    T(s, 'If no core sentence passes: one retry with the block reasons, same evidence, same checks. Still nothing → “I can’t prove an answer.”', { x: M, y: 4.92, w: 7.3, h: 0.62, fontSize: 12.5, color: P.ink2, italic: true })
    const lg = [['local', 'Runs locally'], ['llm', 'AI drafting step'], ['code', 'Deterministic code']]
    lg.forEach(([k, t], i) => {
      const lx = M + i * 2.55, st = sty[k]
      s.addShape('roundRect', { x: lx, y: 5.86, w: 0.36, h: 0.26, rectRadius: 0.04, fill: { color: st.fill }, line: { color: st.line, width: 1.25, dashType: st.dash } })
      T(s, t, { x: lx + 0.46, y: 5.82, w: 2.05, h: 0.5, fontSize: 11.5, color: P.ink2, valign: 'top' })
    })
    footer(s, 5, 'Every step except drafting runs on the bank’s own machine. Plain RAG has no gate between writing and showing.')
    s.addNotes(N.s5)
  }

  // 6 ── Results ────────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'Same fresh questions: 85% right vs 50% for plain RAG', { fontSize: 30 })
    const chartOpts = (o) => ({
      barDir: 'bar', barGrouping: 'clustered', barGapWidthPct: 45, chartColors: [P.accent, P.supersededMark],
      showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0"%"', dataLabelFontFace: '+mn-lt', dataLabelFontSize: 13, dataLabelColor: P.ink,
      catAxisLabelFontFace: '+mn-lt', catAxisLabelFontSize: 13, catAxisLabelColor: P.ink, catAxisLineShow: false,
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 118, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
      showLegend: false, catAxisOrientation: 'maxMin', catAxisHidden: true, layout: { x: 0.36, y: 0.02, w: 0.58, h: 0.96 }, ...o,
    })
    const CX = M - 0.1, CW = 7.4
    const catLabel = (t, cy) => T(s, t, { x: M, y: cy - 0.3, w: CW * 0.36 - 0.25, h: 0.6, fontSize: 14, color: P.ink, align: 'right', valign: 'middle' })
    catLabel('Correct answers, 34 fresh questions', 1.75 + 2.75 * 0.26)
    catLabel('Red-team attacks handled, 22', 1.75 + 2.75 * 0.74)
    catLabel('Shown sentences not supported by their quote', 4.9 + 1.45 * 0.5)
    T(s, 'Higher is better', { x: M, y: 1.45, w: 4, h: 0.3, bold: true, fontFace: F.head, fontSize: 13, color: P.ink3 })
    s.addChart('bar', [
      { name: 'DocuHelp', labels: ['Correct · 34 fresh questions', 'Red-team attacks handled · 22'], values: [85, 100] },
      { name: 'Plain RAG', labels: ['Correct · 34 fresh questions', 'Red-team attacks handled · 22'], values: [50, 45] },
    ], { x: CX, y: 1.75, w: CW, h: 2.75, ...chartOpts() })
    T(s, 'Lower is better', { x: M, y: 4.6, w: 4, h: 0.3, bold: true, fontFace: F.head, fontSize: 13, color: P.ink3 })
    s.addChart('bar', [
      { name: 'DocuHelp', labels: ['Shown sentences not supported by their quote'], values: [2.8] },
      { name: 'Plain RAG', labels: ['Shown sentences not supported by their quote'], values: [10.6] },
    ], { x: CX, y: 4.9, w: CW, h: 1.45, ...chartOpts({ showValue: false, valAxisMaxVal: 20 }) })
    ;[[2.8, 5.34], [10.6, 5.91]].forEach(([v, cy]) => T(s, v.toFixed(1) + '%', { x: CX + CW * 0.36 + (v / 20) * CW * 0.58 + 0.06, y: cy - 0.17, w: 0.9, h: 0.34, fontSize: 13, color: P.ink, valign: 'middle' }))
    // legend (direct)
    s.addShape('rect', { x: M, y: 6.48, w: 0.26, h: 0.2, fill: { color: P.accent }, line: { color: P.accent, width: 0 } })
    T(s, 'DocuHelp', { x: M + 0.34, y: 6.43, w: 1.8, h: 0.3, fontSize: 12.5, color: P.ink, valign: 'middle' })
    s.addShape('rect', { x: M + 2.2, y: 6.48, w: 0.26, h: 0.2, fill: { color: P.supersededMark }, line: { color: P.supersededMark, width: 0 } })
    T(s, 'Plain RAG: same AI, no checks', { x: M + 2.54, y: 6.43, w: 5.2, h: 0.3, fontSize: 12.5, color: P.ink, valign: 'middle' })
    // KPI column
    const kx = 8.25, kw = W - M - kx
    box(s, kx - 0.25, 1.45, kw + 0.25, 5.35, { fill: P.surface, line: P.line })
    const K = [
      ['89.5%', 'accurate, 114 questions', '102/114 · 95% CI 82.5–93.9'],
      ['0', 'hallucinated answers', '0 of 375 quotes fabricated'],
      ['19/19', 'unanswerables refused', 'says what it searched and why'],
      ['0.93 / 0.81', 'contradictions', 'precision / recall'],
      ['8/8', 'Hindi questions', 'Hindi beside the English proof'],
    ]
    K.forEach(([n, a, b], i) => {
      const y = 1.6 + i * 0.86
      T(s, n, { x: kx, y, w: 1.75, h: 0.62, bold: true, fontFace: F.head, fontSize: 22, color: P.accent, valign: 'middle' })
      T(s, a, { x: kx + 1.8, y: y + 0.02, w: kw - 1.8, h: 0.3, fontSize: 13.5, color: P.ink, bold: true, fontFace: F.head })
      if (b) T(s, b, { x: kx + 1.8, y: y + 0.33, w: kw - 1.8, h: 0.3, fontSize: 12, color: P.ink3 })
    })
    s.addShape('rect', { x: kx - 0.08, y: 5.95, w: kw - 0.07, h: 0.72, fill: { color: P.hl }, line: { color: P.hl, width: 0 } })
    T(s, [{ text: 'Where we lose: ', options: { bold: true, fontFace: F.head } }, { text: '12 of 114 answers are incomplete. We trade a guess for a gap.' }], { x: kx + 0.05, y: 5.95, w: kw - 0.3, h: 0.72, fontSize: 13, color: P.ink, valign: 'middle' })
    footer(s, 6, 'Replayed at $0 from recorded answers: eval/reports/critical/final_pass.json. Fresh set: 34 new questions, run once. Our baseline is weak by design.')
    s.addNotes(N.s6)
  }

  // 7 ── Different + practical ─────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'LIGHT' })
    title(s, 'Others cite. We prove each quote was in force on your date', { fontSize: 31 })
    const hdr = ['', 'Quote checked on the page', 'Abstains in code', 'Typed contradictions', 'As-of validity']
    const Y = (t) => ({ text: '✓ ' + t, options: { color: P.proven, bold: true, fontFace: F.head } })
    const No = (t = 'No') => ({ text: '✕ ' + t, options: { color: P.ink3 } })
    const Pa = (t) => ({ text: '~ ' + t, options: { color: P.rbi } })
    const rows = [
      ['RAGFlow, Kotaemon (open source)', No('chunk links'), Pa('relevance warning'), No(), No()],
      ['Axiom Engine (open source)', Y('Yes'), No('“never silent”'), Pa('no time or condition'), No()],
      ['RBI RAG repos (2 on GitHub)', Pa('id check only'), Pa('confidence gate'), No(), Pa('“updated as on” badge')],
      ['Lexis+ AI, Westlaw AI', Pa('links only'), No('not claimed'), No(), Pa('case-law flags')],
      ['DocuHelp', Y('Yes, with box'), Y('Yes'), Y('Yes, typed'), Y('Yes, per date')],
    ]
    const cell = (v, bold, fill) => ({ text: typeof v === 'string' ? v : [v], options: { bold: !!bold, fontFace: F.body, fontSize: 12.5, color: P.ink, fill: { color: fill }, valign: 'middle', margin: [0.04, 0.08, 0.04, 0.08] } })
    const tableRows = [hdr.map((h) => ({ text: h, options: { bold: true, fontFace: F.head, fontSize: 12, color: P.ink2, fill: { color: P.paper }, valign: 'bottom', margin: [0.04, 0.08, 0.06, 0.08] } }))]
    rows.forEach((r, i) => {
      const ours = i === rows.length - 1
      tableRows.push(r.map((v, j) => {
        const c = cell(v, j === 0 || ours, ours ? P.accentTint : (i % 2 ? P.paper : P.surface))
        if (typeof v !== 'string') c.text = [v]
        return c
      }))
    })
    s.addTable(tableRows, { x: M, y: 1.5, w: 8.15, colW: [2.35, 1.5, 1.4, 1.45, 1.45], rowH: [0.62, 0.66, 0.66, 0.66, 0.66, 0.66], border: { type: 'solid', color: P.line, pt: 0.75 } })
    T(s, '✓ yes   ~ partly   ✕ no. Surveyed from public repos, docs and papers, Nov 2026.', { x: M, y: 5.72, w: 8.15, h: 0.3, fontSize: 11.5, color: P.ink3 })
    // practical column
    const px = 9.15, pw = W - M - px
    T(s, 'Practical for a Tier 3 co-op bank', { x: px, y: 1.48, w: pw, h: 0.36, bold: true, fontFace: F.head, fontSize: 15.5, color: P.accent })
    const pr = [
      ['≈ ₹0.38 per answer', 'list price; ~$45 a month at 10,000 questions'],
      ['Redacts before it sends', 'PII (PAN, account no., IFSC) removed on the machine first'],
      ['On-prem path', 'the drafting step can point at a server inside the bank'],
      ['Runs locally', 'checks, search, OCR and redaction stay on the machine'],
      ['Aligned with RBI FREE-AI', 'explainable by design, hash-chained audit log, maker-checker'],
    ]
    pr.forEach(([a, b], i) => {
      const y = 1.95 + i * 0.93
      s.addShape('line', { x: px, y, w: pw, h: 0, line: { color: P.line, width: 1 } })
      T(s, a, { x: px, y: y + 0.08, w: pw, h: 0.3, bold: true, fontFace: F.head, fontSize: 14, color: P.ink })
      T(s, b, { x: px, y: y + 0.4, w: pw, h: 0.48, fontSize: 12, color: P.ink2 })
    })
    footer(s, 7, 'Sources: competitor survey (repo reports, Nov 2026); cost and FREE-AI mapping (reports/Banking judge critique and evals.md).')
    s.addNotes(N.s7)
  }

  // 8 ── Close ──────────────────────────────────────────────────────────────
  {
    const s = pres.addSlide({ masterName: 'DARK' })
    T(s, 'DocuHelp: proof, or silence.', { x: M, y: 0.7, w: W - 2 * M, h: 1.0, bold: true, fontFace: F.head, fontSize: 46, color: P.onNavy, valign: 'middle' })
    T(s, 'For a co-operative bank, “I can’t prove that” is safer than a confident guess.', { x: M, y: 1.75, w: 9.5, h: 0.5, fontSize: 20, color: P.onNavy2 })
    T(s, 'PLAN · NEXT 90 DAYS', { x: M, y: 2.75, w: 5, h: 0.3, bold: true, fontFace: F.head, fontSize: 12.5, color: P.navyAccent, charSpacing: 1 })
    const steps = [
      ['Shadow', 'Run beside one UCB compliance desk on its past questions, read-only.'],
      ['Assist', 'Answers inside maker-checker review; an officer signs off every use.'],
      ['Own it', 'On-prem drafting, Hindi OCR, more RBI Master Directions.'],
    ]
    const sw = (W - 2 * M - 0.6) / 3
    steps.forEach(([a, b], i) => {
      const x = M + i * (sw + 0.3)
      box(s, x, 3.1, sw, 1.55, { fill: '1C3352', line: P.navyLine })
      dot(s, i + 1, x + 0.38, 3.48, { fill: P.hl, color: P.ink, ring: '1C3352', d: 0.44 })
      T(s, a, { x: x + 0.75, y: 3.28, w: sw - 0.9, h: 0.4, bold: true, fontFace: F.head, fontSize: 18, color: P.onNavy, valign: 'middle' })
      T(s, b, { x: x + 0.25, y: 3.82, w: sw - 0.45, h: 0.78, fontSize: 14, color: P.onNavy2 })
    })
    s.addShape('rect', { x: M, y: 5.0, w: W - 2 * M, h: 0.82, fill: { color: P.hl }, line: { color: P.hl, width: 0 } })
    T(s, [{ text: 'Our ask: ', options: { bold: true, fontFace: F.head } }, { text: 'one co-operative bank compliance desk for a shadow pilot.' }], { x: M + 0.25, y: 5.0, w: W - 2 * M - 0.5, h: 0.82, fontSize: 20, color: P.ink, valign: 'middle' })
    const nums = ['89.5% on 114 questions', '0 hallucinated answers', 'red-team 22/22', '≈ ₹0.38 per answer']
    T(s, nums.join('   ·   '), { x: M, y: 6.1, w: W - 2 * M, h: 0.4, bold: true, fontFace: F.head, fontSize: 16, color: P.onNavy })
    T(s, 'Team DocuHelp: Gaurav · Tiwari', { x: M, y: 6.6, w: 6, h: 0.3, fontSize: 13, color: P.onNavy2 })
    footer(s, 8, null, true)
    s.addNotes(N.s8)
  }

  const out = path.join(__dirname, 'DocuHelp-pitch.pptx')
  await pres.writeFile({ fileName: out })
  const { applyTheme } = require('./scripts/apply_theme.js')
  await applyTheme(out, THEME)
  console.log('wrote', out)
}
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1) })
