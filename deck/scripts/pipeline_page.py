"""Builds deck/pipeline/index.html: DocuHelp pipeline block diagram + verification ladder, with novelty and scores."""
from html import escape as E
from pathlib import Path

W = 1400
BW, BH = 200, 116
out = []

def box(x, y, w, h, title, lines, score=None, kind="local", novel=False, num=None):
    cls = {"local": "b-local", "code": "b-code", "ai": "b-ai", "io": "b-io", "ok": "b-ok", "bad": "b-bad", "abs": "b-abs"}[kind]
    s = [f'<g class="{cls}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>']
    t = (f"{num} · " if num else "") + title
    s.append(f'<text class="bt" x="{x+12}" y="{y+22}">{E(t)}</text>')
    for i, ln in enumerate(lines):
        s.append(f'<text class="bl" x="{x+12}" y="{y+41+i*15}">{E(ln)}</text>')
    sc = [score] if isinstance(score, str) else (score or [])
    for i, ln in enumerate(sc):
        s.append(f'<text class="bs" x="{x+12}" y="{y+h-10-(len(sc)-1-i)*15}">{E(ln)}</text>')
    if novel:
        s.append(f'<g class="nov"><rect x="{x+w-56}" y="{y-10}" width="50" height="18" rx="9"/><text x="{x+w-31}" y="{y+3}" text-anchor="middle">novel</text></g>')
    s.append("</g>")
    out.append("".join(s))

def arrow(d, label=None, lx=None, ly=None, cls="ar"):
    out.append(f'<path class="{cls}" d="{d}" marker-end="url(#ah)"/>')
    if label:
        out.append(f'<text class="al" x="{lx}" y="{ly}" text-anchor="middle">{E(label)}</text>')

def lane(y, h, label):
    out.append(f'<rect class="lane" x="10" y="{y}" width="{W-20}" height="{h}" rx="12"/><text class="ll" x="26" y="{y+20}">{E(label)}</text>')

lane(40, 176, "ONCE PER DOCUMENT  (ingest and upload)")
lane(236, 196, "PER QUESTION  (understand, find, decide)")
lane(452, 438, "PER SENTENCE  (draft, prove or withhold, record)")
X = [30 + i * 230 for i in range(6)]
y1 = 74
box(X[0], y1, BW, BH, "PDFs in", ["15 RBI + 7 bank documents", "live uploads, OCR for scans", "insurance demo set"], "22 docs in the library", "io")
box(X[1], y1, BW, BH, "Parse", ["words + page boxes", "clause tree with lead-ins", "hidden white text flagged"], "0/375 quotes unlocatable", "local", num=1)
box(X[2], y1, BW, BH, "Extract & link", ["values, each quote-checked", "versions from RBI footnotes", "typed edges + proof quote"], ["edges: 6 withdraw,", "2 amend, 61 refer"], "local", True, 2)
box(X[3], y1, BW, BH, "Index", ["keyword + semantic index", "context header per chunk", "uploads: incremental"], "1,923 clause chunks", "local", num=3)
box(X[4], y1, 430, BH, "Store (SQLite)", ["clauses · versions with valid-from / valid-to", "typed edges · extracted values", "status computed at the as-of date, never stored"], "the date-aware rulebook", "io", True)
for a_, b_ in [(0, 1), (1, 2), (2, 3), (3, 4)]:
    arrow(f"M{X[a_]+BW} {y1+BH/2} L{X[b_]-4} {y1+BH/2}")

y2 = 276
box(X[0], y2, BW, BH, "Question", ["English, Hindi or Hinglish", "as-of date · bank tier", "optional uploads"], "8/8 Hindi questions", "io")
box(X[1], y2, BW, BH, "Guard & plan", ["strip injected instructions", "small talk, tasks: by code", "sub-queries, facts, premises"], "red-team 22/22 vs 10/22", "code", num=4)
box(X[2], y2, BW, BH, "Retrieve", ["hybrid search, rank fusion", "up to 4 sub-queries", "follows amendment edges"], "top-8 hit 92% → 99%", "local", num=5)
box(X[3], y2, BW, BH, "Evidence pack", ["≤ 18 sentences, ≤ 3 a clause", "in-force text first", "lead-in kept with each"], "gold clause cited 0.91", "code", num=6)
box(X[4], y2, BW, BH, "Rules by code", ["case facts vs conditions:", "tier, amount, purpose, date", "gaps and scope detected"], "Tier 3 ↔ 4 by code", "code", True, 7)
box(X[5], y2, BW, BH, "Redact", ["PAN, account no., IFSC,", "names removed before", "anything leaves"], "PII attacks handled", "code", num=8)
for a_, b_ in [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5)]:
    arrow(f"M{X[a_]+BW} {y2+BH/2} L{X[b_]-4} {y2+BH/2}")
arrow(f"M{X[4]+215} {y1+BH} L{X[4]+215} {y2-4}", "versions, edges, values", X[4]+300, y1+BH+40, "ar dash")
arrow(f"M{X[3]+60} {y1+BH} C{X[3]+60} {y1+BH+40} {X[2]+100} {y2-40} {X[2]+100} {y2-4}", "index", X[3]+20, y1+BH+30, "ar dash")

y3 = 494
box(X[0], y3, BW, 140, "Draft", ["at most 4 sentences", "each cites evidence ids", "numbers left as {{calc}}", "never computes"], "first-draft pass 76%", "ai", num=9)
arrow(f"M{X[5]+BW/2} {y2+BH} L{X[5]+BW/2} {y2+BH+22} L{X[0]+BW/2} {y2+BH+22} L{X[0]+BW/2} {y3-4}", "only the redacted question + its evidence leaves", 700, y2+BH+16)
vx, vw, vh = X[1], 430, 236
box(vx, y3, vw, vh, "Verify each sentence (first failure decides)", [
    "a  every cited evidence id exists",
    "b  cites IN_FORCE text on the as-of date; rule applies",
    "c  quote located on its page (exact or ≥ 95%)",
    "d  every number / date is in the evidence, question,",
    "    a rule finding or a code calculation",
    "e  support ladder: coverage → near-verbatim → entailment",
    "    → 2nd entailment → AI judge (span code must find)",
    "    → verified rule finding",
    "f  conflict lookup → marked CONTESTED"], "unsupported 2.8% vs 10.6% · 0 fabricated", "code", True, 10)
arrow(f"M{X[0]+BW} {y3+70} L{vx-4} {y3+70}")
ox = X[3] + 95
box(ox, y3, BW, 66, "Shown", ["quote, page box, date"], None, "ok")
box(ox, y3+84, BW, 66, "Withheld", ["struck out + failed check"], None, "bad", True)
box(ox, y3+168, BW, 66, "Abstain", ["says where it looked, why"], None, "abs")
for yy, lab in [(y3+33, "pass"), (y3+117, "fail"), (y3+201, "nothing passes")]:
    arrow(f"M{vx+vw} {yy} L{ox-4} {yy}", lab, (vx+vw+ox)/2, yy-6)
ax = X[5] - 20
box(ax, y3, BW + 20, 150, "Audit log", ["every answer, upload,", "deletion and decision", "hash-chained rows", "lists what left the machine"], "tamper → red at that row", "code", True)
arrow(f"M{ox+BW} {y3+33} L{ax-4} {y3+33}")
arrow(f"M{ox+BW} {y3+117} L{ax-4} {y3+117}")
arrow(f"M{ox+BW} {y3+201} C{ox+BW+30} {y3+201} {ax+50} {y3+190} {ax+50} {y3+154}")
out.append(f'<text class="bs" x="{ox}" y="{y3+256}">19/19 unanswerables refused · over-refusal 4.6%</text>')

y4 = 768
box(X[0], y4, BW, 106, "Repair", ["no core sentence passed?", "one retry with the reasons"], "same evidence, same bar", "code", num=11)
box(vx, y4, BW, 106, "Calc (code)", ["EMI, APR, interest", "in Decimal, with working"], ["EMI ₹21,695.58", "APR 17.07%"], "code", num=12)
box(vx+230, y4, BW, 106, "Contradiction triage", ["conflict · needs review ·", "different cond. · supersede"], ["precision 0.93", "recall 0.81"], "code", True, 13)
box(ox, y4, BW, 106, "Hindi", ["translates shown text only", "numbers, ids re-checked"], "20/20 number check", "local", num=14)
box(ax, y4, BW + 20, 106, "Impact → Review", ["new rule vs bank clauses", "maker decides, checker signs"], "self sign-off → 409", "code", True, 15)
arrow(f"M{X[0]+BW/2} {y4} L{X[0]+BW/2} {y3+144}", "retry", X[0]+BW/2+26, y4-14, "ar dash")
arrow(f"M{vx+BW/2} {y4} L{vx+BW/2} {y3+vh+4}", "fills calc slots", vx+BW/2+62, y4-14, "ar dash")
arrow(f"M{vx+230+BW/2} {y4} L{vx+230+BW/2} {y3+vh+4}", "CONTESTED", vx+230+BW/2+48, y4-14, "ar dash")

H = 900
svg1 = f'''<svg viewBox="0 0 {W} {H}" role="img" aria-label="DocuHelp pipeline: documents are parsed, linked into a date-aware rulebook and indexed once; each question is guarded, searched, checked against rules in code and redacted; the AI drafts at most four sentences; code verifies each sentence and shows, withholds or abstains, and every step is written to a hash-chained audit log.">
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
{"".join(out)}</svg>'''
# ---------- verification ladder ----------
out = []
LW, gx, gw, fx = 1200, 60, 560, 720
gates = [
    ("a", "Cited ids exist", "Each evidence id (E…) or rule id (R…) the sentence cites must be in this answer's evidence pack.", "“no citation” / “cites unknown id(s)”"),
    ("b", "In force and applicable", "A fact or calc sentence may cite only text that is IN_FORCE on the as-of date (from valid-from / valid-to), and rules that apply to this bank. History sentences may cite superseded text, labelled.", "“states a current fact but cites text that is SUPERSEDED on …”"),
    ("c", "Quote located on its page", "Every cited evidence sentence is found on its page in the PDF, exactly or with fuzzy match ≥ 95; this also yields the word boxes for the highlight.", "“E7: quote not located on page”"),
    ("d", "Numbers, dates and terms", "Every number and date must appear in the cited evidence (with its lead-in), the question, a code rule finding or a calculation; it must sit next to the claim's subject; defined terms must be spelled as defined (UCB ≠ “Upper Co-operative Bank”).", "“number/date not in cited evidence: ₹4,000”"),
    ("e", "Supported by the quote", "Ladder, first pass wins: conflict established by code → calc result → word coverage ≥ 0.8 with matching negation → near-verbatim match → entailment ≥ 0.5 → second entailment ≥ 0.5 → AI judge (≤ 3 per answer; must return a span code locates) → verified rule finding with the same polarity.", "“not supported by cited evidence (score 0.06 < 0.5)”"),
    ("f", "Conflict lookup", "If the cited clauses are in a known conflict pair, the sentence is marked CONTESTED and the conflict card shows both quotes.", "(not a block: a label)"),
]
gy0, gh, gap = 70, 116, 22
out.append(f'<text class="ll" x="{gx}" y="40">GATE (code)</text><text class="ll" x="{fx}" y="40">IF IT FAILS → WITHHELD, WITH THIS REASON</text>')
for i, (k, t, d, r) in enumerate(gates):
    y = gy0 + i * (gh + gap)
    out.append(f'<g class="b-code"><rect x="{gx}" y="{y}" width="{gw}" height="{gh}" rx="8"/><text class="bt" x="{gx+14}" y="{y+24}">{k} · {E(t)}</text></g>')
    words, line, lines = d.split(), "", []
    for w_ in words:
        if len(line) + len(w_) + 1 > 82: lines.append(line); line = w_
        else: line = (line + " " + w_).strip()
    lines.append(line)
    for j, ln in enumerate(lines[:5]):
        out.append(f'<text class="bl inv" x="{gx+14}" y="{y+44+j*15}">{E(ln)}</text>')
    kind = "b-abs" if k == "f" else "b-bad"
    out.append(f'<g class="{kind}"><rect x="{fx}" y="{y+30}" width="420" height="56" rx="8"/><text class="bl" x="{fx+14}" y="{y+63}">{E(r)}</text></g>')
    arrow(f"M{gx+gw} {y+58} L{fx-4} {y+58}", "fail" if k != "f" else "conflict", (gx+gw+fx)/2, y+52)
    if i < len(gates) - 1:
        arrow(f"M{gx+gw/2} {y+gh} L{gx+gw/2} {y+gh+gap-4}", "pass", gx+gw/2+22, y+gh+15)
ye = gy0 + len(gates) * (gh + gap)
out.append(f'<g class="b-ok"><rect x="{gx}" y="{ye}" width="{gw}" height="58" rx="8"/><text class="bt" x="{gx+14}" y="{ye+24}">Shown, with five check badges</text><text class="bl" x="{gx+14}" y="{ye+44}">then: output guard → Hindi (numbers re-checked) → audit row</text></g>')
arrow(f"M{gx+gw/2} {ye-gap} L{gx+gw/2} {ye-4}")
out.append(f'<g class="b-abs"><rect x="{fx}" y="{ye}" width="420" height="58" rx="8"/><text class="bt" x="{fx+14}" y="{ye+24}">No core sentence passed?</text><text class="bl" x="{fx+14}" y="{ye+44}">one retry with the reasons → still none → “I can’t prove an answer”</text></g>')
LH = ye + 80
svg2 = f'''<svg viewBox="0 0 {LW} {LH}" role="img" aria-label="The verification ladder: each drafted sentence passes gates a to f in order; the first failure withholds it with a reason; sentences that pass are shown with five check badges.">
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
{"".join(out)}</svg>'''

rows = [
    ("1 Parse", "Words with page boxes; clause tree (261(2)(ii) keeps its lead-in); footnotes; tables stitched across pages; RBI “Withdrawn” stamps; hidden white text flagged, never evidence; OCR for scanned uploads.", "", "0 of 375 quotes unlocatable"),
    ("2 Extract & link", "Values (subject, permitted, amount, conditions) checked against a located quote; versions rebuilt from RBI footnotes; WITHDRAWS / AMENDED_BY / REFERS_TO edges, each with a proof quote.", "Typed legal edges with proof", "6 · 2 · 61 edges"),
    ("3 Index", "Keyword index plus semantic vectors over 1,923 clause chunks, each with a short context header; uploads indexed incrementally.", "", "—"),
    ("4 Guard & plan", "Injected instructions stripped with a visible notice; documents' hidden instructions flagged; small talk and off-task requests answered by code; sub-queries, case facts and premises planned; Hindi to English.", "", "red-team 22/22 vs 10/22"),
    ("5 Retrieve", "Hybrid keyword + semantic search, merged by reciprocal rank fusion; up to 4 sub-queries; follows amendment and withdrawal edges one hop.", "", "top-8 hit 92% → 99%; MRR 0.74"),
    ("6 Evidence pack", "Sentence-level rescoring to at most 18 sentences, ≤ 3 per clause, in-force text first, lead-in kept.", "", "gold clause cited 0.91"),
    ("7 Rules by code", "Case facts (tier, amount, purpose, floating/fixed, sanction date) compared with each rule's conditions; scope and gaps detected.", "Applicability decided by code", "Tier 3 ↔ 4 flips correctly"),
    ("8 Redact", "Personal data removed before anything leaves the machine; each audit row lists what was sent.", "", "PII attacks handled"),
    ("9 Draft (AI)", "At most 4 sentences, one claim each, every sentence citing evidence ids; numbers left as calc slots.", "", "first-draft pass 76% (dev)"),
    ("10 Verify", "Gates a–f per sentence; first failure withholds it with the reason.", "Proof or silence, per sentence", "unsupported 2.8% vs 10.6%; 0 fabricated; ablation 18 / 7 / 90"),
    ("11 Repair", "If no core sentence passed: one retry with the block reasons, same evidence, same bar; both drafts logged.", "", "19/19 unanswerables refused"),
    ("12 Calc", "EMI, APR (IRR), interest and prepayment computed in Python Decimal with the working; false premises labelled hypothetical.", "", "EMI ₹21,695.58 · APR 17.07%"),
    ("13 Contradiction triage", "Bank vs RBI clause pairs typed as conflict / needs review / different condition / supersession, from extracted values on located quotes.", "Typed, not just “contradiction”", "precision 0.93 · recall 0.81"),
    ("14 Hindi", "Only verified sentences are translated; numbers, dates, amounts and clause ids re-checked by code; labelled machine translation.", "", "8/8 · 20/20"),
    ("15 Impact → Review → Audit", "A new rule is matched against every bank clause; maker decides, a different checker signs off; every step in a hash-chained log.", "Maker-checker enforced by the server", "self sign-off → 409; tamper → red row"),
]
trs = "".join(f"<tr><td><b>{E(a)}</b></td><td>{E(b)}</td><td>{('<span class=nv>novel</span> ' + E(c)) if c else ''}</td><td class=num>{E(d)}</td></tr>" for a, b, c, d in rows)

page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DocuHelp pipeline map</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* VOICE clinical, engineering review. IDEA an engineering schematic of the answer path. PICTURE the full pipeline block diagram with novelty and score on every block. COLOUR paper + one ink blue (the product palette), green/red-brown only for shown/withheld. TYPE IBM Plex Sans + Mono. LAYOUT title and score strip, the big diagram, the ladder, then the stage table. */
:root{{color-scheme:light dark;--bg:light-dark(#f7f5ef,#121416);--ink:light-dark(#1b1e22,#ebe8e2);--ink2:light-dark(#474c54,#c0bcb4);--line:light-dark(#d9d4c6,#33383e);--card:light-dark(#fffefb,#181b1e);--acc:light-dark(#1f3a5f,#9dbbe2);--accfill:light-dark(#1f3a5f,#22344d);--accink:light-dark(#ffffff,#eef3fa);--tint:light-dark(#e5ebf3,#1f2a38);--ok:light-dark(#14704f,#5fd0ae);--oktint:light-dark(#e3efe5,#17281f);--bad:light-dark(#7a2a1a,#f2a58e);--badtint:light-dark(#f6e8e3,#2d1e1a);--abs:light-dark(#3f6590,#a7bfdc);--abstint:light-dark(#e6ecf3,#1c2633);--hl:light-dark(#f9e3a2,#5a4714)}}
:root[data-theme=light]{{color-scheme:light}}:root[data-theme=dark]{{color-scheme:dark}}
*{{box-sizing:border-box;min-width:0}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "IBM Plex Sans",system-ui,sans-serif;overflow-x:clip}}
.band{{padding:clamp(24px,4vw,56px) max(4vw,16px);max-width:1280px;margin:auto}}
h1{{font-size:clamp(30px,4vw,44px);line-height:1.08;margin:0 0 10px;text-wrap:balance}}h2{{font-size:24px;margin:8px 0 6px;line-height:1.2}}
.sub{{color:var(--ink2);max-width:72ch;margin:0 0 22px}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:10px;margin:0 0 28px}}
.kpi{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px}}.kpi b{{display:block;font-size:26px;color:var(--acc);font-variant-numeric:tabular-nums;white-space:nowrap}}.kpi span{{font-size:14px;color:var(--ink2)}}
figure{{margin:0 0 36px}}figcaption{{color:var(--ink2);font-size:15px;max-width:80ch;margin-top:10px}}
.scroll{{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px}}
svg{{display:block;width:100%;min-width:1040px;height:auto;color:var(--ink2);font-family:"IBM Plex Sans",sans-serif}}
.lane{{fill:none;stroke:var(--line);stroke-dasharray:4 4}}.ll{{font:600 12px "IBM Plex Sans";fill:var(--ink2);letter-spacing:.06em}}
g rect{{stroke-width:1.5}}.bt{{font:600 14px "IBM Plex Sans";fill:var(--ink)}}.bl{{font:12.5px "IBM Plex Sans";fill:var(--ink2)}}.bs{{font:500 12px "IBM Plex Mono";fill:var(--acc)}}.inv{{fill:var(--accink)}}
.b-local rect{{fill:var(--tint);stroke:var(--abs)}}.b-io rect{{fill:var(--card);stroke:var(--line)}}
.b-code rect{{fill:var(--accfill);stroke:var(--accfill)}}.b-code .bt,.b-code .bl{{fill:var(--accink)}}.b-code .bs{{fill:light-dark(#f9e3a2,#f2d27a)}}
.b-ai rect{{fill:var(--card);stroke:var(--ink2);stroke-dasharray:6 4}}
.b-ok rect{{fill:var(--oktint);stroke:var(--ok)}}.b-ok .bt{{fill:var(--ok)}}.b-bad rect{{fill:var(--badtint);stroke:var(--bad)}}.b-bad .bt,.b-bad .bl{{fill:var(--bad)}}
.b-abs rect{{fill:var(--abstint);stroke:var(--abs)}}.b-abs .bt{{fill:var(--abs)}}
.nov rect{{fill:var(--hl);stroke:none}}.nov text{{font:600 11px "IBM Plex Sans";fill:light-dark(#1b1e22,#fff3cf)}}
.ar{{fill:none;stroke:currentColor;stroke-width:1.5}}.dash{{stroke-dasharray:5 4}}.al{{font:12px "IBM Plex Sans";fill:var(--ink2)}}
.legend{{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:14px;color:var(--ink2);margin:0 0 12px}}.sw{{display:inline-block;width:22px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:6px;border:1.5px solid}}
table{{border-collapse:collapse;width:100%;background:var(--card);font-size:14.5px}}th,td{{border-top:1px solid var(--line);padding:9px 10px;text-align:left;vertical-align:top}}th{{color:var(--ink2);font-weight:600;font-size:13px}}td.num{{font-family:"IBM Plex Mono",monospace;font-size:13px;color:var(--acc)}}
.nv{{background:var(--hl);border-radius:9px;padding:1px 8px;font-size:12px;font-weight:600;white-space:nowrap}}
.note{{font-size:14px;color:var(--ink2);max-width:85ch}}
@media(max-width:600px){{table{{font-size:13px}}.stack thead{{display:none}}.stack tr{{display:grid;padding-block:10px}}.stack td{{display:flow-root;border:0;padding:3px 0;padding-inline-start:7em;text-align:start}}.stack td::before{{content:attr(data-l);float:inline-start;width:6.5em;margin-inline-start:-7em;white-space:normal;color:var(--ink2)}}.stack td:empty{{display:none}}}}
</style></head><body><main class="band">
<h1>DocuHelp: the full pipeline, with proof at every step</h1>
<p class="sub">The AI only drafts. Everything else (finding the rule, checking the date, locating the quote, checking the numbers, doing the maths, deciding what is shown) is code or a local check. Each block shows what it does, whether it is new, and the score that proves it.</p>
<div class="kpis">
<div class="kpi"><b>89.5%</b><span>accurate on 114 questions (CI 82.5–93.9)</span></div>
<div class="kpi"><b>0</b><span>hallucinated answers · 0 of 375 quotes fabricated</span></div>
<div class="kpi"><b>85% vs 50%</b><span>same fresh questions, plain RAG</span></div>
<div class="kpi"><b>22/22 vs 10/22</b><span>red-team attacks handled</span></div>
<div class="kpi"><b>2.8% vs 10.6%</b><span>shown sentences not supported by their quote</span></div>
<div class="kpi"><b>0.93 / 0.81</b><span>contradiction precision / recall</span></div>
</div>
<div class="legend"><span><i class="sw" style="background:var(--tint);border-color:var(--abs)"></i>runs locally</span><span><i class="sw" style="background:var(--accfill);border-color:var(--accfill)"></i>deterministic code</span><span><i class="sw" style="background:var(--card);border-color:var(--ink2);border-style:dashed"></i>AI drafting step (the only one)</span><span><i class="sw" style="background:var(--oktint);border-color:var(--ok)"></i>shown</span><span><i class="sw" style="background:var(--badtint);border-color:var(--bad)"></i>withheld</span><span><span class="nv">novel</span> not found together in the tools we surveyed</span></div>
<figure><div class="scroll">{svg1}</div>
<figcaption>Read left to right, top to bottom. Documents are parsed and linked once into a date-aware rulebook; each question is guarded, searched and checked against rules in code before the AI drafts; each drafted sentence must pass the verifier or it is withheld; every step lands in the hash-chained audit log. Monospace lines are measured scores (replayed from <code>eval/reports/critical/final_pass.json</code> and the judge report).</figcaption></figure>
<h2>The verification layer, gate by gate</h2>
<p class="sub">Cheapest checks first; the first failure decides. Gates a–d are plain code, gate e is a ladder where later steps can only rescue a sentence, never let a failing one through. Ablation: without gate b, 18 wrong “current law” sentences reach users; without the number checks, 7; without gate e, 90.</p>
<figure><div class="scroll">{svg2}</div>
<figcaption>Each drafted sentence walks down the ladder; a sentence that fails any gate goes to the Withheld tray with that gate's reason, and the user still sees which check stopped it.</figcaption></figure>
<h2>Every stage: what is new and how it scores</h2>
<div class="scroll" style="padding:0"><table class="stack"><thead><tr><th>Stage</th><th>What happens</th><th>Novelty</th><th>Score</th></tr></thead><tbody>{trs}</tbody></table></div>
<p class="note">Scores: strict grader, replayed from recorded answers. “Unsupported” comes from an independent AI audit (an opinion, not ground truth). Plain RAG uses the same drafting AI with top-5 search, one prompt and no checks. “Novel” means no tool we surveyed (open-source RAG platforms, RBI RAG repos, legal AI products) combines it with the rest; it is not a claim that no one anywhere does it.</p>
</main>
<script>new MutationObserver(()=>{{for(const c of document.querySelectorAll('.stack td:not([data-l])')){{let i=0,p=c;while(p=p.previousElementSibling)i+=p.colSpan;c.dataset.l=c.closest('table').rows[0].cells[i]?.textContent||''}}}}).observe(document,{{childList:true,subtree:true}})</script>
</body></html>'''
Path(__file__).resolve().parents[1].joinpath("pipeline", "index.html").write_text(page)
print("ok", len(page))
