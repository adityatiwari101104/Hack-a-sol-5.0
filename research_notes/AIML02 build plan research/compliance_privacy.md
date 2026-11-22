# Compliance workflow and data protection features for AIML-02 (document QA to banking compliance tool)

Research date: 23 Nov 2026. All facts are dated where the source gives a date. Vendor pages are marketing, not independent evidence. Search and fetch summaries were produced by a summarising model over the source page, so check verbatim wording on the primary page before putting it on a slide.

## (A) How do regulatory change management (RCM) tools structure the workflow, and what can a hackathon team replicate in about 6 hours?

### Takeaway
Commercial RCM tools share one backbone: an **obligations register**. New regulation comes in, gets broken into discrete obligation objects, those are diffed against the existing obligation inventory, and the changes are mapped to internal policies, risks and controls. Tasks go to business units, and closure evidence (approvals, certificates, an audit trail) goes into a management dashboard. The team's planned "new circular → impact alert" is the impact-mapping step of this pipeline. The versioned clause graph and value tuples are enough to demo a credible slice of it.

### Cited Findings
- **Ascent RegTech (AscentAI)** builds the inventory around obligations. It defines an obligation as "the legal requirement(s) your business needs to comply with", and its AI pulls each obligation out of a rule set as a separate object. It compares obligation updates against the customer's Obligations Inventory to find applicable changes automatically. The pitch is an "obligations-based approach" — [Ascent: obligations-based approach](https://ascentregtech.com/?p=313582); [Ascent RCM](https://www.ascentregtech.com/?p=1161)
- The AscentFocus product writes generative-AI summaries of each obligation change. It shows a side-by-side markup of old and new rule text (a redline) with tailored impact output, and lets users assign tasks to business units — [AscentFocus](https://www.ascentregtech.com/rlm-platform/ascentfocus/); [Ascent RLM platform](https://ascentregtech.com/?p=311618)
- Ascent's marketing criticises competitors that repurpose horizon-scanning tools and names CUBE as one of them. Treat that as vendor positioning — [Ascent: Not all RCM solutions are the same](https://www.ascentregtech.com/?p=314989)
- **CUBE** says it uses "AI and expert validation" to turn regulatory change into structured obligations and embed them in compliance workflows. Its ServiceNow connector feeds a change-management workspace where obligations are mapped to policies, risks and controls — [CUBE on ServiceNow Store](https://store.servicenow.com/store/app/f6330942476eb2d439e06507e26d431b)
- **Fintellix C-Trac (Compliance Tracker)**, an India-focused product, has a "Regulatory Intelligence" module that tracks changes in guidelines and circulars and "provides insights on impact areas". A "Case Manager" assigns and tracks ad-hoc requests. It keeps circulars, audit findings and internal obligations in one place and offers a live top-management dashboard. It is pitched explicitly at RBI's compliance-management-system (CMS) mandate — [Fintellix C-Trac blog](https://fintellix.com/rbis-compliance-mandate-is-live-compliance-tracker-c-trac-has-you-covered/); [Fintellix solution sheet, Jul 2025](https://fintellix.com/wp-content/uploads/2025/07/Fintellix_Data-and-Regulatory_Compliance-Tracker-Solution-Sheet.pdf.pdf)
- **TeamLease RegTrack** (India) advertises real-time compliance status, automated workflows, integrated document management, and a "dynamic calendar" that merges statutory, internal and checklist compliances into one daily tracker. Its financial-institutions version targets RBI directions. In a vendor case study, one NBFC engagement found 68+ applicable Acts, including 18 RBI master directions and circulars — [RegTrack for FIs](https://teamleaseregtech.com/product-services/regtrack-financial-institutions/); [TeamLease NBFC case study](https://www.teamleaseregtech.com/case-studies/NBFC-compliances-housing-finance)
- A legal-tech vendor describes the same "identify impacted contracts after legislative change" workflow for contracts (not regulation), claiming teams can "respond in hours" — [LawVu](https://lawvu.com/news/staying-ahead-of-legislative-change-how-legal-teams-can-identify-impacted-contracts-and-respond-in-hours/)
- Academic work: COMPACT (EACL 2026) builds "compliance paralegals" through clause-graph reasoning over contracts, which is close to the team's cited graph approach — [COMPACT, EACL 2026](https://preview.aclanthology.org/ingest-eacl/2026.eacl-long.377)
- **"ClauseTrace" hackathon project:** no matching project was found. Searches returned similar projects: ClauseWise (1st place overall, Stanford LLM x Law Hackathon #6, Apr 2026, "logic-based middleware" between legal text and financial systems), ClauseWatch (TechEx hackathon, clause extraction and risk scoring), and the ClauseMatch + JWG RegDelta TechSprint entry — [Stanford Law, 27 Apr 2026](https://law.stanford.edu/2026/04/27/2026-llm-x-law-hackathon-6-winners/); [ClauseWatch on lablab.ai](https://lablab.ai/ai-hackathons/techex-intelligent-enterprise-solutions-hackathon/aegis-systems/clausewatch); [FinTech Futures](https://fintechfutures.com/?p=644562)
- Thomson Reuters Regulatory Intelligence, Wolters Kluwer OneSumX and Compliance.ai were not reached in this session (see Gaps).

### Inferences
- **The canonical pipeline:** (1) horizon scan / ingest circular → (2) obligation extraction (one obligation = subject + modal "shall/shall not" + action + condition + effective date + applicability) → (3) applicability filter (entity type and tier) → (4) diff against the existing obligation register (new / amended / repealed) → (5) impact mapping to internal policies, contracts, products and controls → (6) task assignment with owner and due date → (7) evidence of closure (maker-checker approval, compliance certificate) → (8) dashboard and board report.
- **Mapping to the existing system:** value tuples (subject, attribute, value, condition, dates) are already obligation objects. AMENDED_BY edges are the redline/diff. valid_from/valid_to already supports the "applies to loans sanctioned on or after date X" logic. The missing pieces are the **applicability filter**, the **impact-report screen** and a light **task/closure** layer.
- **What a hackathon can build in about 6 hours (ranked by demo value per hour):**
  1. *Impact report screen (2 h):* ingest a new circular → extract obligation tuples → for every in-force clause in the bank's own documents with a matching (subject, attribute), show a three-column card: old internal clause | new RBI obligation | verdict (CONFLICT / AFFECTED / OK / NEEDS REVIEW). Each column has citations and the circular's effective date. Severity comes from the rule type (prohibition > disclosure > procedural).
  2. *Applicability filter (0.5 h):* a bank profile (e.g., "Tier 3 UCB") plus applicability tables taken from the circular. The Pre-payment Directions, 2025 already split co-op banks by tier and ₹50 lakh (see the last question), so this filter is directly demoable.
  3. *Obligation register table (1 h):* every extracted obligation with source paragraph, effective date, status (new/amended/repealed via AMENDED_BY), and linked internal clauses.
  4. *Redline view (1 h):* side-by-side diff of the internal clause against a suggested compliant wording. The LLM-drafted text is labelled "draft, needs human approval".
  5. *Task + closure stub (1 h):* assign owner, due date (= circular effective date minus a buffer), status, approver, and a closure-evidence upload. This copies the maker-checker and recorded-approval features RBI expects from a CMS.
  6. *Board-ready export (0.5 h):* a one-page PDF or Markdown "Circular impact note" listing affected documents, counts by severity, and open tasks.

### Gaps
- Vendor screen-level details (exact screenshots and fields) for Thomson Reuters Regulatory Intelligence, Wolters Kluwer OneSumX, Compliance.ai and CUBE's impact-assessment UI were not fetched. Vendor claims here are unverified marketing.
- No independent benchmark of obligation-extraction accuracy for any vendor was found.
- "ClauseTrace" could not be located. The team should confirm the exact name or link.

## How do Indian banks (especially co-op banks) handle new RBI circulars today? Pain points and numbers

### Takeaway
RBI expects banks to have a board-approved compliance function headed by a CCO. Since 2024 it has also required larger REs, including Tier III/IV UCBs, to run a workflow-based, technology-driven Compliance Management System (CMS) with maker-checker, escalation, recorded approvals and dashboards. Tier I/II UCBs, which are many of the smaller co-op banks, appear to fall outside that CMS mandate. That leaves a gap for a low-cost tool.

### Cited Findings
- RBI circular "Compliance functions in banks and Role of Chief Compliance Officer (CCO)", RBI/2020-21/35, **11 Sep 2020**, issued because bank practices on compliance had diverged. Contents: CCO minimum fixed tenure of 3 years; removal before that only "with the explicit prior approval of the Board"; compliance function subject to internal audit; CCO responsible for designing and maintaining the compliance framework, training on regulatory and conduct risk, and communicating compliance expectations — [RBI Master Direction page id=11962](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11962); [Vinod Kothari, Sep 2020](https://vinodkothari.com/2020/09/rbi-refines-the-role-of-the-compliance-man-of-a-bank/)
- A parallel circular, "Compliance Function and Role of Chief Compliance Officer (CCO) – Urban Co-operative Banks", exists (RBI notification id 12389). Its full text was not retrieved (the page redirected) — [RBI circular index id=12389](https://rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx?Id=12389)
- In 2026 RBI consolidated parts of this into the "Commercial Banks – Governance" Directions. The Second Amendment Directions, 2026 say the CRO, CCO and HIA "shall ordinarily be appointed for a fixed tenure of not less than three years" — [RBI bs_viewcontent Id=5066](https://www.rbi.org.in/scripts/bs_viewcontent.aspx?Id=5066)
- **CMS mandate:** RBI concluded that "comprehensive, integrated, enterprise-wide and workflow-based solutions/tools" are needed for compliance management. The system should report compliance status by risk, user, entity/location, category and role. The deadline was **30 Jun 2024**. Applies to SCBs (excluding RRBs), SFBs, Payments Banks, **Tier III and IV Primary (Urban) Co-operative Banks**, upper- and middle-layer NBFCs, CICs and AIFIs. Expected features: collaboration and workflow with maker-checker and a complete digital record of actions; applicability assessment; an escalation/notification engine; recorded approvals for any deviation or delay; senior-management dashboards. Source is a vendor blog dated 28 Mar 2024; the circular number RBI/2023-24/117 is only inferred from the linked PDF filename — [TeamLease RegTech blog](https://teamleaseregtech.com/blogs/102/compliance-management-systems-made-mandatory-by-rbi-for-banks)
- **Penalty statistic (user-supplied):** co-op banks received 264 of RBI's 353 penalties in FY2024-25. This was **not independently re-verified** in this session (see Gaps).

### Inferences
- **Persona fit:** a compliance officer at a Tier I/II UCB, or a small Tier III UCB, has CCO-style duties (track circulars, communicate them, test compliance, report to the Board/ACB) but probably no budget for CUBE or Ascent. A "circular → impact note → task list" tool lines up with the CMS features RBI lists (applicability assessment, escalation, recorded approval, dashboard). The team can pitch it as a "CMS-lite for co-op banks".
- **Board reporting** is a natural output: a periodic compliance report to the Board listing new circulars, impact and open items. The specific RBI requirement on the frequency of board reporting was not retrieved, so the deck should not name a frequency.

### Gaps
- No sourced figures were found for staff hours spent per circular, the number of RBI circulars per year, or the average lag from circular to policy update at Indian banks. **Do not quote any time-saving number without a source.**
- The CMS circular's exact number, date and wording should be checked on rbi.org.in. Only a vendor summary was read.
- The UCB compliance-function circular's date, tier applicability and contents were not retrieved.
- The 264/353 co-op bank penalty figure was not checked against RBI's Annual Report or Report on Trend and Progress.

## (B) What do RBI FREE-AI, SEBI, the EU AI Act and NIST expect on explainability, audit logs, human oversight and model inventory, and which concrete features follow?

### Takeaway
RBI's FREE-AI report (13 Aug 2025) is the most relevant source for a bank buyer. It has 7 Sutras and 26 recommendations, including a board-approved AI policy (Rec 14), human oversight (Rec 16), consumer recourse (Rec 18), red teaming (Rec 20), incident reporting (Rec 22), an AI inventory (Rec 23) and an AI audit framework (Rec 24). Its survey found that only 18% of REs kept audit logs. That gap directly supports an "immutable trace log" feature.

### Cited Findings
- **RBI FREE-AI** (Framework for Responsible and Ethical Enablement of AI) committee report, released **13 Aug 2025**, with **26 recommendations under six pillars** and **7 Sutras**: Trust is the Foundation; People First; Innovation over Restraint; Fairness and Equity; Accountability; Understandable by Design; Safety, Resilience and Sustainability — [RBI report page ID=1306](https://rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1306)
- FREE-AI survey finding: "only 18% maintained audit logs" — [RBI FREE-AI](https://rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1306)
- Sutra 2 (People First): "final authority should rest with humans", who should be able to override AI. Citizens should be made aware of AI-generated content. Sutra 5: "Accountability cannot be delegated to the model and underlying algorithm." Sutra 6: "Ensure explainability for trust." — [RBI FREE-AI](https://rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1306)
- Recommendations relevant to this build (numbers as extracted from the report page):
  - Rec 8, AI Liability Framework: a tolerant supervisory stance "limited to first time / one-off aberrations".
  - Rec 14, Board-Approved AI Policy: covers governance structure and accountability.
  - Rec 15, Data Lifecycle Governance.
  - Rec 16, AI System Governance Framework: "this should include human oversight".
  - Rec 17, Product Approval Process: AI products brought within its scope.
  - Rec 18, Consumer Protection: "transparency, fairness, and accessible recourse mechanisms".
  - Rec 19, Cybersecurity.
  - Rec 20, Red Teaming: "structured red teaming processes that span the entire AI lifecycle".
  - Rec 21, BCP for AI.
  - Rec 22, AI Incident Reporting.
  - Rec 23, AI Inventory: "a comprehensive, internal AI inventory that includes all models, use cases, target groups...".
  - Rec 24, AI Audit Framework: "risk-based, calibrated"; 24(b) independent third-party audits for high-risk use cases.
  - Rec 25, AI disclosures in annual reports and websites.
  - Annex V outlines a Board policy on AI.
  - No numbered recommendation explicitly mandates logging or audit trails.
  — [RBI FREE-AI](https://rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1306)
- Press summary: FREE-AI says AI models used for credit, underwriting and customer service must be "explainable, auditable" — [Chambers](https://chambers.com/articles/rbi-committee-report-on-responsible-ai-in-the-financial-sector-free-ai-framework); [Business Standard, 13 Aug 2025](https://www.business-standard.com/amp/finance/news/rbi-ai-panel-calls-for-balancing-innovation-with-strong-risk-safeguards-125081301705_1.html)
- **SEBI** consultation paper "Guidelines for Responsible Usage of AI/ML in Indian Securities Markets", **20 Jun 2025** (comments due 11 Jul 2025). Five principles: Model Governance, Investor Protection and Disclosure, Testing Framework, Fairness and Bias, Data Privacy and Cybersecurity. Proposes secure log retention for event tracking and analysis of model behaviour, detailed documentation, interpretable models or explainability tools, and human review of AI outputs. No specific retention period was confirmed — [Mondaq](https://www.mondaq.com/india/new-technology/1642480/sebis-consultation-paper-on-aiml-guidelines-reconciling-innovation-with-investor-protection); [Lakshmikumaran & Sridharan](https://www.lkslaw.com/insights/articles/sebi-s-consultation-paper-and-the-winds-of-ai-governance)
- **EU AI Act**: Annex III high-risk use cases include AI "intended to be used to evaluate the creditworthiness of natural persons or establish their credit score" (fraud detection excluded). The Digital Omnibus on AI moved Annex III high-risk obligations from 2 Aug 2026 to **2 Dec 2027** and Annex I to 2 Aug 2028. Reports describe the omnibus as adopted in June 2026 and in force from about 27 Jul 2026 — [Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/); [Lewis Silkin, 27 Jul 2026](https://www.lewissilkin.com/insights/2026/07/27/the-digital-omnibus-on-ai-enters-into-force-today-102nedo); [FPF](https://fpf.org/blog/the-ai-act-implementation-timeline-what-changes-under-the-ai-omnibus)

### Inferences
- **Regulatory scope:** a compliance-QA and document-review tool is probably not "credit scoring" under EU Annex III, and the EU AI Act does not bind an Indian co-op bank anyway. Use it only as a design reference (record-keeping and human-oversight concepts) and lean on FREE-AI as the India anchor.
- **Feature translations (each tied to a source):**
  1. **Immutable trace log** (FREE-AI 18% audit-log finding; Rec 24 audit framework; SEBI log retention). Append-only JSONL or SQLite table with: query_id, timestamp, user and role, question, retrieved clause IDs and versions (valid_from/to), redaction map hash (not raw PII), model name and version, prompt template hash, raw model output, per-sentence verification verdicts, abstention flag, final answer. Chain-hash each row (row_hash = sha256(prev_hash + row)) so tampering is detectable. Add a "Verify log integrity" button in the demo.
  2. **AI inventory / model card in README** (Rec 23, Rec 14/Annex V). One table: use case, target users, model(s) and versions, data sent externally, known limitations, evaluation results, owner, last review date.
  3. **Human review queue** (Sutra 2 "final authority with humans"; Rec 16 human oversight; Rec 18 recourse). Every CONFLICT verdict and every abstention or low-confidence answer goes to a queue where the compliance officer must Accept / Reject / Edit, with a reason stored in the trace log. Nothing is "closed" without a human approver, which matches the CMS maker-checker expectation.
  4. **Version pinning** (Rec 24 audit; reproducibility). Pin the dated model snapshot, embedding model, prompt template version and corpus snapshot hash. Show them in the UI footer and in each impact report.
  5. **AI disclosure banner** (Sutra 2; Rec 25): "Draft generated with AI assistance; verified sentences marked; requires officer approval."
  6. **Red-team / eval page** (Rec 20): a small adversarial set (trick questions, outdated-clause traps, contradictory documents) with pass rates for abstention and contradiction detection.
  7. **Incident log** (Rec 22): a button to flag a wrong answer, which creates an incident record linked to the trace ID.

### Gaps
- NIST AI RMF 1.0 (Jan 2023) and the Generative AI Profile (NIST AI 600-1, Jul 2024) were not fetched this session. Cite them only after checking [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework).
- Exact FREE-AI recommendation wording past the quoted fragments, and the Annex V contents, were not fully read. The recommendation numbers above come from a summarising fetch of the RBI page and should be spot-checked in the PDF.
- Whether the SEBI consultation was finalised into binding guidelines by Nov 2026 was not checked.
- Whether EU AI Act Articles 12 and 14 changed substantively under the omnibus was not checked.

## (C) Data protection: OpenAI API policies, India residency, DPDP obligations, PII masking, and a credible 1-slide answer

### Takeaway
By default, OpenAI API data is not used for training. Abuse-monitoring logs are kept for up to 30 days. Zero Data Retention (ZDR) and Modified Abuse Monitoring need OpenAI's approval. India **storage** residency has existed since May 2025, and OpenAI's own data-residency guide (read Nov 2026) lists **India regional processing** via `in.api.openai.com` for `gpt-6-luna` only. DPDP's substantive duties (security safeguards, processor contracts, breach notice) apply from **13 May 2027**, so they are near-term but not yet in force. Presidio covers PAN, Aadhaar, GSTIN, voter ID, passport and vehicle registration out of the box, but **not IFSC or Indian bank account numbers**, so custom recognizers are needed.

### Cited Findings
**OpenAI API data controls**
- "data sent to the OpenAI API is not used to train or improve OpenAI models" unless the customer explicitly opts in — [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data)
- Abuse-monitoring logs are produced by default and "retained for up to 30 days", unless the law requires longer or retention is needed to prevent harm — [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data)
- ZDR and Modified Abuse Monitoring (MAM) "are subject to prior approval by OpenAI and acceptance of additional requirements". Customers contact sales, then configure them under Settings → Organization → Data controls. MAM keeps customer content out of abuse logs. ZDR also forces `store=false` on `/v1/responses` and `/v1/chat/completions` — [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data)
- ZDR-eligible endpoints include `/v1/chat/completions`, `/v1/responses` (with limitations), `/v1/embeddings` and `/v1/moderations`. Files, vector stores, assistants, threads, batches, fine-tuning and evals are **not** ZDR-eligible — [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data)
- The Responses API keeps application state for 30 days by default; `store=true` keeps it at least 30 days — [OpenAI: Your data](https://developers.openai.com/api/docs/guides/your-data)
- **India residency:** OpenAI announced on **7 May 2025** data residency at rest for the API Platform in Japan, India, Singapore and South Korea, enabled by creating a new Project and selecting the country. An update dated 25 Nov 2025 says at-rest residency has expanded globally — [OpenAI: Introducing data residency in Asia](https://openai.com/index/introducing-data-residency-in-asia/)
- OpenAI's data-residency guide, read 23 Nov 2026, contains this table row: India, `in.api.openai.com`, regional storage **Yes**, regional processing **Yes (`gpt-6-luna` only)**. It also says "These regions support Standard pay-as-you-go only", "Hosted tools are unavailable for regional processing", and processing endpoints are `/v1/chat/completions` and `/v1/responses` — [OpenAI: Data residency guide](https://developers.openai.com/api/docs/guides/data-residency)
- News reports date India inference residency to **12 Nov 2026** and say regional processing in India is available only to organisations with active ZDR, with access possibly through sales. **Conflict:** the OpenAI guide as fetched does not state a ZDR requirement for India. Confirm with OpenAI before claiming either — [CRN Asia, 2026](https://www.crnasia.com/india/news/2026/openai-brings-api-inference-residency-to-india-addresses-enterprise-data-localisation-needs); [Inc42](https://inc42.com/?p=580012); [Analytics India Mag](https://analyticsindiamag.com/ai-news/openai-launches-api-inference-residency-in-india)
- **Azure OpenAI / Foundry:** the "Data Zone" deployments for Asia Pacific keep processing within the APAC data zone (Australia, Japan, Korea, Singapore, India). "Global" deployments may process in any Azure region. Central India is listed as a Foundry region. Per-model availability in Central India / South India was not confirmed — [Microsoft Learn: deployment types](https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types); [Microsoft Learn: region support](https://learn.microsoft.com/azure/foundry/reference/region-support); [Microsoft Learn: model region availability](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure-region-availability)

**DPDP Act 2023 + Rules 2025**
- MeitY notified the DPDP Rules on **13 Nov 2025** (some sources say gazette publication on 14 Nov). Phasing:
  - Immediate: institutional provisions and the Data Protection Board.
  - **13 Nov 2026**: consent-manager registration.
  - **13 May 2027**: substantive obligations, including notice and consent, fiduciary duties, data principal rights and cross-border transfer requirements, plus DPB penalty powers.
  — [AZB & Partners, 19 Nov 2025](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/); [Hogan Lovells](https://ca.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)
- **Conflict:** one firm lists cross-border transfer rules as immediately effective. Hogan Lovells places Rules 3 and 5–16 (which includes the transfer rule) at 13 May 2027 — [Mondaq/AMS](https://www.mondaq.com/india/data-protection/1708164/digital-personal-data-protection-rules-2025-notified); [Hogan Lovells](https://ca.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)
- **Fiduciary and processor duties:** fiduciaries must protect personal data whether they process it directly or through processors, and security obligations must go into processor contracts. The minimum "reasonable security safeguards" listed are encryption, masking or tokenisation; access controls; logs and monitoring for unauthorised access; backup and continuity; and **retaining logs for one year** — [AZB & Partners](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
- **Breach notification:** notify the DPB and affected principals without delay, with a detailed report to the DPB within **72 hours**. CERT-In must separately be told of cyber incidents within **6 hours**, alongside any sectoral (RBI) reporting — [AZB & Partners](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/)
- **Cross-border transfer:** permitted except to countries the government restricts. Significant data fiduciaries may face restrictions on specified data sets — [AZB & Partners](https://www.azbpartners.com/bank/update-indias-digital-personal-data-protection-framework-comes-into-effect/); [Mondaq](https://www.mondaq.com/india/data-protection/1708164/digital-personal-data-protection-rules-2025-notified)

**Microsoft Presidio (PII detection and masking)**
- Presidio docs (now hosted at presidio.dataprivacystack.org) list India-specific entities with these detection methods:
  - `IN_PAN`: pattern + context
  - `IN_AADHAAR`: pattern + context + checksum
  - `IN_VEHICLE_REGISTRATION`
  - `IN_VOTER`
  - `IN_PASSPORT`
  - `IN_GSTIN`: pattern + context + validation
  - Global entities include PERSON, PHONE_NUMBER, EMAIL_ADDRESS, LOCATION, DATE_TIME, CREDIT_CARD, IBAN_CODE.
  - **IFSC and Indian bank account numbers are not listed**; the only bank-account entity is `US_BANK_NUMBER`.
  — [Presidio supported entities](https://presidio.dataprivacystack.org/supported_entities/)
- **Discrepancy:** the Presidio page, as summarised, calls PAN a "12-character" identifier. PAN is in fact 10 characters (5 letters, 4 digits, 1 letter) — [Wikipedia: PAN](https://Www.Wikipedia.org/wiki/PAN_card); [Presidio](https://presidio.dataprivacystack.org/supported_entities/)

### Inferences
- **Safeguard stack to build (about 3–4 h total):**
  1. **Presidio redaction before any API call** with built-in IN_* recognizers plus custom `PatternRecognizer`s. IFSC: `[A-Z]{4}0[A-Z0-9]{6}` with context words "IFSC", "branch". Bank account: 9–18 digits with context words "A/c", "account no", "savings", "loan account". Loan account / CIF numbers: bank-specific regex. Indian mobile: `[6-9]\d{9}`. Replace with reversible placeholders (`<PERSON_1>`, `<ACCT_1>`) held in a local vault, and re-hydrate locally after the answer returns.
  2. **Evidence-only egress:** send only the top-k retrieved clause snippets (already redacted), never whole documents. Log a token count and an "egress manifest" (which clause IDs left the machine) in the trace log.
  3. **Local-first checks:** run numeric/date contradiction checks on value tuples, valid_from/to logic and applicability filtering deterministically on local code, with no LLM call. Only extraction and wording use the API.
  4. **Provider toggle:** `LLM_PROVIDER=openai | openai-india-region | azure-dz-apac | local` (e.g., an Ollama model). Even if the local mode is slower or weaker, demoing a switch shows the architecture is not locked to one vendor.
  5. **Request settings:** use Chat Completions or Responses with `store=false`. Avoid Files, Vector Stores and Assistants, which are not ZDR-eligible. Keep embeddings local or use the ZDR-eligible `/v1/embeddings`.
  6. **At rest:** encrypted SQLite (SQLCipher) or full-disk encryption, role-based access (officer / reviewer / admin), and one-year log retention to match the DPDP safeguard list.
- **Positioning:** because DPDP substantive duties start 13 May 2027, the honest pitch is "DPDP-ready by design". Do not claim "DPDP-compliant". Loan documents contain borrowers' personal data (names, PAN, Aadhaar, addresses, account numbers), so the bank is the data fiduciary and OpenAI or Azure would be a processor needing a contract.
- **1-slide answer to "You send bank documents to OpenAI?"** (draft):
  > **No documents leave the bank. Only redacted evidence snippets do, and even that is optional.**
  > 1. *Redact first:* Presidio + custom Indian recognizers (PAN, Aadhaar, GSTIN, IFSC, account numbers) replace PII with tokens; the re-identification map never leaves the machine.
  > 2. *Minimum necessary:* only the 3–5 clause snippets needed for an answer are sent, never whole files. Every byte sent is listed in the audit log.
  > 3. *Deterministic checks run locally:* dates, amounts, version validity and applicability need no LLM.
  > 4. *Contractual controls:* OpenAI API data is not used for training by default; abuse logs are kept ≤30 days; ZDR available on approval; India data residency (storage, and processing for supported models) via `in.api.openai.com`.
  > 5. *Swap the engine:* one config flag moves to Azure OpenAI (APAC data zone) or a fully on-prem open model for banks that require zero egress.
  > 6. *Audit-ready:* hash-chained trace log, human sign-off on every conflict. Aligned to RBI FREE-AI (Recs 16, 23, 24) and the DPDP Rules' safeguard list.

### Gaps
- Whether India regional processing on the OpenAI API requires ZDR: news says yes, the OpenAI guide as fetched does not. Unresolved.
- Exact Azure OpenAI model availability in Central India / South India, and whether India-only (rather than APAC data-zone) processing is possible on Azure, was not confirmed.
- Whether Presidio's IN_* recognizers load by default in the standard `AnalyzerEngine` registry was not confirmed. Register them explicitly in code to be safe.
- The DPDP Rules' exact rule numbers (e.g., which rule holds security safeguards and which holds cross-border transfer) and the Act's penalty caps were not verified from the gazette text in this session.
- RBI-specific outsourcing or IT rules on sending bank data to a cloud AI provider were not researched (e.g., RBI IT outsourcing directions, or the 2018 payment-data localisation circular, which covers payment-system data only).

## Real contradictions between bank loan terms and RBI rules that make good impact-alert demos

### Takeaway
Three RBI instructions give crisp, date-bounded, tuple-checkable conflicts with typical loan-agreement clauses: the Pre-payment Charges Directions 2025 (from 1 Jan 2026), the Penal Charges circular 2023 (from 1 Apr 2024), and the Key Facts Statement circular 2024 (from 1 Oct 2024). The Pre-payment Directions are especially good for a co-op bank demo because they treat UCB tiers differently and use a ₹50 lakh threshold.

### Cited Findings
- **RBI (Pre-payment Charges on Loans) Directions, 2025**: RBI/2025-26/64, DoR.MCS.REC.38/01.01.001/2025-26, dated **2 Jul 2025**, applying to loans **sanctioned or renewed on or after 1 Jan 2026**. Applies to commercial banks (excluding payments banks), co-operative banks, NBFCs and AIFIs — [RBI notification Id=12878](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12878)
  - Para 5(i): no pre-payment charges on floating-rate loans to individuals for non-business purposes.
  - Para 5(ii)(a): commercial banks (excluding SFBs, RRBs and LABs), **Tier 4 UCBs**, NBFC-UL and AIFIs "shall not levy any pre-payment charges" on floating-rate business loans to individuals and MSEs.
  - Para 5(ii)(b): SFBs, RRBs, **Tier 3 UCBs, State Co-operative Banks, Central Co-operative Banks** and NBFC-ML shall not levy charges on such loans "with sanctioned amount/limit up to ₹50 lakh".
  - Para 5(iii): this applies irrespective of the source of funds, with no minimum lock-in.
  - Para 5(iv): dual-rate loans are judged by whether the rate is floating at the time of prepayment.
  - Para 6: other cases follow board policy, with charges based on the amount prepaid.
  - Para 8: no charge when the RE itself initiates the prepayment.
  - Para 9: charges must be disclosed in the sanction letter, loan agreement and KFS; "No pre-payment charges which have not been disclosed... shall be charged".
  - Para 10: no retrospective levy of waived charges.
  - The Annex repeals the 2012, 2014 and 2019 foreclosure circulars.
- **Fair Lending Practice – Penal Charges in Loan Accounts**: RBI/2023-24/53, DoR.MCS.REC.28/01.01.001/2023-24, **18 Aug 2023**. Penalties for non-compliance with material loan terms must be "penal charges", not "penal interest" added to the rate. They must not be capitalised, and no further interest is computed on them. The intent is credit discipline, not revenue enhancement. Extended by RBI/2023-24/102 (29 Dec 2023): applies to fresh loans from **1 Apr 2024**, and existing loans must switch at the next review or renewal on or after 1 Apr 2024, **no later than 30 Jun 2024** — [RBI notification Id=12527](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12527); [RBI extension circular PDF, 29 Dec 2023](https://website.rbi.org.in/documents/87730/39710850/Final+Circular+-+Penal+Charges+in+Loan+Accounts+-+Extension+-+29122023.pdf); [RBI FAQ](https://www.rbi.org.in/Scripts/FAQView.aspx?Id=162)
- **Key Facts Statement (KFS) for Loans & Advances**: RBI/2024-25/18, **15 Apr 2024**. Applies to all retail and MSME term loans by all REs sanctioned on or after **1 Oct 2024**, including fresh loans to existing customers. The KFS must include an APR computation sheet and amortisation schedule, and the borrower must acknowledge it. Charges not in the KFS cannot be levied during the loan term without the borrower's explicit consent. Credit cards are excluded, and working capital lines fall outside the MSME term-loan scope per commentators — [RBI notification Id=12663](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12663); [RBI KFS circular PDF](https://website.rbi.org.in/documents/87730/39710850/Circular+KFS_180424_Final_For_Website.pdf); [Vinod Kothari, Apr 2024](https://vinodkothari.com/2024/04/the-key-to-loan-transparency-rbi-frames-kfs-norms-for-all-retail-and-msme-loans/)

### Inferences
- **Demo scenario 1 (headline):** the bank's internal "Retail Loan Policy v3 (valid_from 2023-04-01)" says "Foreclosure charges of 2% + GST on principal outstanding on all term loans". The new circular is the Pre-payment Directions 2025. The impact alert flags: CONFLICT for floating-rate home and personal loans sanctioned or renewed ≥ 2026-01-01; for a Tier 3 UCB, CONFLICT for floating-rate MSE business loans ≤ ₹50 lakh but AFFECTED / NEEDS REVIEW above ₹50 lakh (para 6); AFFECTED for the KFS template (para 9 disclosure). Tuple check: (prepayment_charge, floating, individual, non-business) value 2% vs required 0%, with condition sanction_date ≥ 2026-01-01. Flip the bank profile to "Tier 4 UCB" and the ₹50 lakh nuance disappears. This is a strong live demo of the applicability filter.
- **Demo scenario 2:** a loan agreement clause says "Default interest @ 2% p.m. over the applicable rate, compounded monthly". Under the Penal Charges circular, the alert flags CONFLICT on two counts: penal *interest* added to the rate, and capitalisation/compounding of penalties. Effective dates: fresh loans from 2024-04-01, existing loans by 2024-06-30.
- **Demo scenario 3:** a sanction-letter template charges a "documentation / processing fee as applicable at the time". Under KFS (≥ 2024-10-01), the alert flags CONFLICT: charges not disclosed in the KFS cannot be levied without consent, and the APR must include all charges.
- **Version-graph demo:** the Pre-payment Directions explicitly repeal the 2012/2014/2019 foreclosure circulars. Show the AMENDED_BY / REPEALED_BY edges and the old circulars' valid_to = 2025-12-31. This shows the team handles "which version applied on date X" (e.g., a loan sanctioned in Dec 2025 vs Jan 2026).
- **Data to use:** build synthetic loan agreements and an internal policy for a fictional "Example Urban Co-operative Bank (Tier 3)". Do not use real bank documents or real borrower data in the demo.

### Gaps
- Real, published instances of specific Indian banks' loan agreements that contradicted these rules were not collected. RBI penalty orders citing these specific circulars were not searched. Use synthetic documents and say so.
- The exact applicability of the Penal Charges and KFS circulars to each UCB tier was not verified paragraph by paragraph (both are described as applying to all REs, with listed exclusions).
