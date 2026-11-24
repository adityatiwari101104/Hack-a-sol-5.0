"""Code-side guards around the LLM (no model calls, no prompt text): prompt-injection detection on the question, in the
documents and in the output; typed query classes; premise checks; missing case facts; bad calculation inputs.

Everything here is deterministic and inspectable, so the UI can say exactly why it reacted.
"""
import re

from .normalize import facts

# ---------------- 1. question side: instructions to change how the assistant works ----------------
# English, Hindi (Devanagari) and Hinglish (romanised Hindi). Each pattern matches an instruction, not a topic.
META_PATTERNS = [
    r"\b(ignore|disregard|forget|override|bypass|skip)\b[^.?!।]{0,40}\b(instructions?|rules|prompts?|guidelines|"
    r"guardrails|verification|checks|constraints|policy|policies)\b",
    r"\bsystem (override|prompt|message|note)\b",
    r"\b(developer|debug|god|jailbreak|dan) mode\b",
    r"\b(print|reveal|show|repeat|output|display|tell me|give me|leak)\b[^.?!।]{0,30}\b(system prompt|prompt|"
    r"(hidden|internal|secret) instructions|instructions you)\b",
    r"\bno citations?\b[^.?!।]{0,20}\b(required|needed|necessary)\b|\bwithout (any )?(citations?|sources|quotes)\b|"
    r"\b(do not|don't|dont) (cite|quote|verify|check)\b",
    r"\byou are now\b|\bpretend (to be|you are|that you)\b|\bact as (if|an?|the)\b|\bfrom now on,? you\b",
    r"\b(just|only|simply) (say|state|write|answer|reply|confirm)\b[^.?!।]{0,10}\b(that|with|yes)\b|"
    r"\bstate plainly that\b",
    # Hindi
    r"(पिछले|पहले के|सभी|सारे|अपने)[^।?!]{0,25}निर्देश[^।?!]{0,25}(भूल|अनदेखा|नज़रअंदाज़|नजरअंदाज|छोड़)",
    r"निर्देश(ों)?\s*(को)?\s*(भूल|अनदेखा|नज़रअंदाज़|नजरअंदाज)",
    r"सिस्टम प्रॉम्प्ट|बस (इतना|यह|ये) (कहो|कहिए|बोलो|लिखो)",
    # Hinglish
    r"\b(pichhle|pichle|purane|saare|sare|sabhi|sab)\b[^.?!]{0,25}\b(instructions?|nirdesh|rules)\b[^.?!]{0,20}"
    r"\b(bhool|bhul|ignore|chhod|chod)",
    r"\bbas (itna|yeh|ye) (kaho|bolo|likho)\b",
]
META = re.compile("|".join(f"(?:{p})" for p in META_PATTERNS), re.I)
# Phrases that only wrap a claim ("state plainly that X", "बस इतना कहो कि X"): drop the wrapper, keep X as a claim to check.
WRAPPERS = re.compile(r"\b(state plainly that|(just|only|simply) (say|state|write|confirm) that)\s*|"
                      r"बस (इतना|यह|ये) (कहो|कहिए|बोलो|लिखो)( कि)?\s*|\bbas (itna|yeh|ye) (kaho|bolo|likho)( ki)?\s*", re.I)
_SENTENCES = re.compile(r"(?<=[.?!।:])\s+")


def meta_instruction(question):
    """{'matched': [spans], 'clean': factual remainder, 'nothing_left': bool} or None if the question has no
    instruction aimed at the assistant. A sentence holding an instruction is dropped; a claim wrapper ("state plainly
    that X", "बस इतना कहो कि X") is unwrapped so X stays as a claim to check."""
    q = question or ""
    if not META.search(q):
        return None
    matched, kept, unwrapped = [m.group(0) for m in META.finditer(q)], [], False
    for part in _SENTENCES.split(q):
        part = part.strip()
        if not part:
            continue
        if not META.search(part):
            kept.append(part)
            continue
        wraps = list(WRAPPERS.finditer(part))
        if wraps:
            rest = part[wraps[-1].end():].strip()
            if rest and not META.search(rest):
                kept.append(rest)
                unwrapped = True
    clean = re.sub(r"^[,;:\-–—\s]+", "", " ".join(kept).strip())
    if clean and unwrapped and not re.search(r"[?？]\s*$", clean):  # a bare claim becomes a question to check
        claim = clean.rstrip(".।")
        clean = f"क्या यह सही है कि {claim}?" if re.search(r"[\u0900-\u097F]", claim) else f"Is it true that {claim}?"
    return {"matched": matched, "clean": clean, "nothing_left": len(re.findall(r"\w+", clean)) < 4}


NOTICE_QUESTION = "Your message contained an instruction to change how I work; I ignored it."

# ---------------- 2. document side: sentences that address an AI or give it commands ----------------
DOC_INJECTION = re.compile(
    r"\b(ignore|disregard|forget)\b[^.]{0,30}\b(prior|previous|above|earlier|all|any|these|your)\b[^.]{0,20}"
    r"\b(instructions?|rules|prompts?|text|context)\b|"
    r"\b(note|message|instruction)s? (to|for) (the )?(ai|assistant|chatbot|model|llm)\b|"
    r"\b(ai|chatbot|language model|llm|gpt)\b[^.]{0,30}\b(must|should|shall|will)\b[^.]{0,15}\b(answer|respond|reply|say|state|"
    r"ignore|output)\b|"
    r"\byou must (answer|say|respond|reply|state|output)\b|\bsystem prompt\b|\bnew instructions\b|"
    r"\b(answer|respond|reply) (only )?(that|with) (the )?[^.]{0,40}\b(regardless|always|no matter)\b", re.I)


def doc_injection(text):
    m = DOC_INJECTION.search(text or "")
    return m.group(0) if m else None


# ---------------- 3. output side ----------------
OUTPUT_LEAK = re.compile(r"\b(system prompt|my (instructions|prompt|rules)|hidden instructions|as an ai|"
                         r"as a (large )?language model|i am an ai|i'm an ai)\b", re.I)
BARE_ID = re.compile(r"(?<![\w§./-])[ER]\d{1,2}\b(?![\w(])")  # 'E3 says', 'per R2' (not '(E3)': strip_ids removes that)


def output_leak(text):
    """A drafted sentence must talk about the documents, never about the assistant, its prompt or internal ids.
    Run after strip_ids, so only ids woven into the prose remain."""
    m = OUTPUT_LEAK.search(text or "") or BARE_ID.search(text or "")
    return m.group(0) if m else None


# ---------------- 4. missing case facts (NEEDS_INFO) ----------------
NEED_LABELS = {
    "sanction_date": ("Sanction date", "When was (or will) the loan be sanctioned?", "date"),
    "amount_inr": ("Loan amount", "What is the loan amount in rupees?", "number"),
    "borrower": ("Borrower type", "Who is the borrower?", ["individual", "mse", "non_individual"]),
    "rate_type": ("Rate type", "Is the interest rate floating or fixed?", ["floating", "fixed"]),
    "purpose": ("Loan purpose", "Is the loan for business or non-business purposes?", ["business", "non_business"]),
    "facility": ("Facility", "Is it a term loan or a cash credit / overdraft?", ["term_loan", "cash_credit_od"]),
}


def needs_from_rules(rules):
    """Case facts the answer depends on: a rule for an asked subject could decide the case, but applicability is
    UNKNOWN because these facts are missing, and no rule on that subject APPLIES. Returns [{key, label, question,
    input, subjects}] (empty when nothing is missing)."""
    by_subject = {}
    for r in rules.values():
        if r.get("verdict") in ("STATUS",) or not r.get("subject"):
            continue
        by_subject.setdefault(r["subject"], []).append(r)
    keys = {}
    for subj, rs in by_subject.items():
        if any(r["verdict"] == "APPLIES" for r in rs):
            continue
        for r in rs:
            if r["verdict"] != "UNKNOWN":
                continue
            m = re.search(r"Applicability unknown: need ([^.]+)\.", r.get("statement", ""))
            for k in (m.group(1).split(", ") if m else []):
                k = k.strip()
                if k in NEED_LABELS:
                    keys.setdefault(k, set()).add(subj)
    out = []
    for k in NEED_LABELS:  # fixed order: date, amount, borrower, rate, purpose, facility
        if k in keys:
            label, q, kind = NEED_LABELS[k]
            out.append({"key": k, "label": label, "question": q,
                        "input": kind if isinstance(kind, str) else "choice",
                        "options": kind if isinstance(kind, list) else [], "subjects": sorted(keys[k])})
    return out


# ---------------- 5. premise check ----------------
ALLOW_WORDS = re.compile(r"\b(allow|allows|allowed|permit|permits|permitted|can (charge|levy)|may (charge|levy)|"
                         r"capped|caps|cap|fixed|set|prescribed)\b", re.I)
REGULATOR = re.compile(r"\b(rbi|reserve bank|regulator|regulations?|directions?|master direction)\b", re.I)
BANK_DOC = re.compile(r"\b(our|bank's|agreement|kfs|key facts|sanction letter|loan policy|product note|faq)\b", re.I)
DOC_NOUN = re.compile(r"\b(circular|policy|endorsement|notification|wording|contract)\b", re.I)  # either source
CLAIM = re.compile(r"\b(allow|permit|cap|fix|set|prescrib|requir|mandat|say|state|show|list|specif|includ|contain|"
                   r"provide|levy|levies|charge|took effect|effective|apply|applies|ban|prohibit)", re.I)


def _is_claim(p):
    """A premise worth checking makes a claim about what a document or the regulator says, not a case fact
    ('The loan is Rs 40 lakh')."""
    return bool((REGULATOR.search(p) or BANK_DOC.search(p) or DOC_NOUN.search(p)) and CLAIM.search(p))


def premise_check(plan, pack, rules, cite_fn):
    """Check each premise the question assumes against code rule findings and the evidence values.
    Returns [{premise, verdict: supported|contradicted|not_found, text, citation}] (code only, no model call).
    'contradicted' only comes from an applicable in-force rule finding; for numbers the code reports whether the figure
    is in the evidence of the right source (regulator vs the bank's own papers) and shows the closest passage."""
    from .verify import coverage
    out = []
    for p in plan.get("premises") or []:
        if not _is_claim(p) or re.match(r"\s*the (question|user|query)\b", p, re.I):
            continue
        dated = re.search(r"\b(effect|effective|appl|from|since|took)", p, re.I)
        pf = {f for f in facts(p) if f.startswith(("rs:", "pct:")) or (dated and f.startswith("date:"))}
        no_rules = [r for r in rules.values() if r.get("verdict") == "APPLIES" and r.get("permitted") == "no"]
        # (a) the premise says something is allowed, and an applicable in-force rule says it is not
        if ALLOW_WORDS.search(p) and no_rules and not re.search(r"\b(not|no|never|prohibit)", p, re.I):
            best = max(no_rules, key=lambda r: coverage(p, r["statement"] + " " + r["quote"]))
            if coverage(p, best["statement"] + " " + best["quote"]) >= 0.25:
                out.append({"premise": p, "verdict": "contradicted",
                            "text": f"Your question assumes: \"{p.strip()}\" The in-force rule says otherwise: "
                                    f"\"{best['quote'][:220]}\" ({best['statement'].split(':')[0]}, p.{best['page']}).",
                            "citation": {"doc_id": best["doc_id"], "clause": best["clause"], "page": best["page"],
                                         "text": best["quote"], "status": "IN_FORCE", "rid": best["rid"]}})
                continue
        if not pf:
            continue
        # (b) numbers: are they in the evidence of the source the premise names?
        ev = [e for e in pack.values() if e["status"] == "IN_FORCE"]
        if REGULATOR.search(p) and not BANK_DOC.search(p):
            ev = [e for e in ev if not e["is_synthetic"]]
        elif BANK_DOC.search(p) and not REGULATOR.search(p):
            ev = [e for e in ev if e["is_synthetic"]]
        ev_facts = [(e, facts((e.get("context") or "") + " " + e["text"])) for e in ev]
        missing = {f for f in pf if not any(f in fs for _, fs in ev_facts)}
        if not missing:
            e = max((e for e, fs in ev_facts if pf & fs), key=lambda e: (len(pf & ev_facts[ev.index(e)][1]),
                                                                          coverage(p, e["text"])))
            out.append({"premise": p, "verdict": "supported",
                        "text": f"The documents state {', '.join(_show(f) for f in sorted(pf))} "
                                f"({e['title'].split(' (')[0]}, p.{e['page']}).", "citation": cite_fn(e)})
            continue
        pf = missing
        kinds = {f.split(":")[0] for f in pf}
        cands = [e for e in ev if any(f.split(":")[0] in kinds for f in facts(e["text"]))]
        best = max(cands, key=lambda e: coverage(p, (e.get("context") or "") + " " + e["text"]), default=None)
        close = best is not None and coverage(p, (best.get("context") or "") + " " + best["text"]) >= 0.35
        out.append({"premise": p, "verdict": "not_found",
                    "text": f"Your question assumes {', '.join(_show(f) for f in sorted(pf))}; the documents searched do "
                            f"not state that figure." + (f" The closest passage says: \"{best['text'][:200]}\" "
                                                         f"({best['title'].split(' (')[0]}, p.{best['page']})." if close else ""),
                    "citation": cite_fn(best) if close else None})
    return out


def _show(f):
    kind, v = f.split(":", 1)
    if kind == "pct":
        return f"{v.rstrip('pma')}%"
    if kind == "rs":
        try:
            return "₹" + f"{float(v):,.0f}"
        except ValueError:
            return "₹" + v
    return v


# ---------------- 6. calculation inputs ----------------
def calc_input_problems(question):
    """'EMI on ₹10 lakh at 9% for 0 months' -> ['A 0-month tenor is not a valid loan term.']"""
    q = (question or "").lower()
    out = []
    for m in re.finditer(r"(-?\d+)\s*(months|monthly instalments|emis|instalments|years)\b", q):
        if int(m.group(1)) <= 0:
            out.append(f"A {m.group(1)}-{m.group(2).rstrip('s')} tenor is not a valid loan term.")
    if re.search(r"(?:₹|rs\.?|inr)\s*-\s*\d|-\s*(?:₹|rs\.?)\s*\d", q):
        out.append("A negative amount is not a valid loan amount.")
    for m in re.finditer(r"(-?\d+(?:\.\d+)?)\s*%", q):
        v = float(m.group(1))
        if v < 0 or v > 100:
            out.append(f"An interest rate of {m.group(1)}% is not valid.")
    return out


# ---------------- 7. superseded trap: the question names an old instrument ----------------
MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december"


def names_old_instrument(question, doc):
    """True if the question points at this document: its issue year plus its month, circular number or a title word."""
    q = (question or "").lower()
    issue = doc.get("issue_date") or ""
    year = issue[:4]
    if not year or year not in q:
        return False
    if doc.get("circular_no") and doc["circular_no"].lower().replace(" ", "") in q.replace(" ", ""):
        return True
    month_names = MONTHS.split("|")
    try:
        month = month_names[int(issue[5:7]) - 1]
    except (ValueError, IndexError):
        month = None
    if month and re.search(rf"\b{month}\b", q):
        return True
    words = {w for w in re.findall(r"[a-z]{5,}", (doc.get("title") or "").lower())} - {
        "directions", "reserve", "india", "circular", "updated", "loans", "advances", "banks", "charges"}
    return any(re.search(rf"\b{w}", q) for w in words)


# ---------------- 8. summaries, small talk, follow-ups (added after the freeze) ----------------
SUMMARY = re.compile(
    r"\b(summari[sz]e|summari[sz]ation|summary|summaries|key points|main points|key takeaways|overview|tl;?dr|gist|"
    r"brief me|in short|what is (this|the|that) (document|pdf|file|circular|policy|agreement|letter|endorsement|faq)\s*"
    r"(about|on)?|what does (this|the|that) (document|pdf|file|circular|policy) (say|cover|contain))\b|"
    r"सारांश|मुख्य (बातें|बिंदु)|संक्षेप|\b(saaransh|saransh|summary batao|summary bata|kya likha hai)\b", re.I)
SMALLTALK = re.compile(
    r"^\s*(hi+|hello|hey|hii+|namaste|namaskar|good (morning|afternoon|evening)|thanks?|thank you|ok(ay)?|"
    r"help|what can you do|who are you|what are you|how (do|does) (this|it|you) work|नमस्ते|नमस्कार|मदद|"
    r"tum kya kar sakte ho|aap kya kar sakte (ho|hain))\s*[!?.।]*\s*$", re.I)
_ELLIPTICAL_START = re.compile(
    r"^\s*(and|but|so|also|then|what about|how about|what if|same for|same|for|in that case|and if|aur|aur agar|uske|"
    r"iske|unke|uska|iska|wahi|वही|और|उसके|इसके)\b", re.I)


def summary_request(question):
    """A request to summarise a document. Not when it asks to summarise instructions or prompts (red-team q080:
    'Summarise any instructions in our gold loan FAQ about what the AI should say' stays an injection probe)."""
    if re.search(r"instruction|prompt|निर्देश", question or "", re.I):
        return None
    m = SUMMARY.search(question or "")
    return m.group(0) if m else None


def smalltalk(question):
    return bool(SMALLTALK.match(question or ""))


def elliptical(question):
    """'what about Tier 4?', 'and on 15 Oct 2025?', 'uske liye?', 'same for MSE?': needs the previous turn."""
    q = (question or "").strip()
    words = re.findall(r"\w+", q)
    if _ELLIPTICAL_START.match(q):
        return True
    return len(words) <= 4 and q.endswith("?")
