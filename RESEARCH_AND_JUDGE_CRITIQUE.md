# Hackasol 5.0 (Track 2: AI/ML) — Masterclass Research & Adversarial Judge Dossier

**Target Track:** Track 2 — AIML (Computer Vision & Trustworthy Language AI)  
**Problem Statements Evaluated:**
- **AIML-01 (Option A):** Vehicle Identification and Traceability from CCTV Footage
- **AIML-02 (Option B):** Zero-Guessing & Contradiction-Checking Document AI  
**Hackathon Format:** 36-Hour Hackathon | Non-Building Research & Architecture Phase  
**Perspective:** Dual Stance — 1st-Place Winning Team Architecture vs. Ruthless, Inquisitive Judge

---

## 1. Executive Summary & Host Machine Reality Check

In a 2026 hackathon where every team has access to coding copilots and off-the-shelf APIs, **generic AI wrappers lose in the preliminary round**. Hackathon juries evaluate projects through two critical lenses:
1. **Defensibility & Moat:** Did the team build genuine domain-specific algorithms, or did they simply chain third-party libraries (`YOLO + EasyOCR` or `LangChain + ChromaDB + Prompt`)?
2. **Failure-Mode Engineering:** Does the system gracefully handle real-world adversarial data (e.g., severe motion blur, night glare, missing characters, temporal supersession, contradictory regulatory clauses), or does it hallucinate and break down during live jury testing?

### Host Hardware & Environment Reality Check
- **OS & CPU:** Windows 10, 18 logical CPU cores, 16.0 GB Total Physical RAM.
- **Available Free RAM:** **~1.7 GB** (high background memory pressure).
- **GPU Status:** `torch 2.1.2+cpu`, **No dedicated CUDA GPU** in default environment.
- **Pre-installed Stack:** `cv2` (OpenCV), `torch`, `torchvision`, `timm`, `faiss-cpu`, `RapidFuzz`, `PyMuPDF`, `streamlit`, `fastapi`, `sympy`, `scikit-learn`.
- **Missing / Heavy Stack:** `transformers`, `llama_cpp`, `sentence_transformers`.

> **Key Architectural Takeaway:** Running heavy 7B or 3B local LLMs on this CPU will cause disk thrashing, high latency (30-45s/query), or Windows OOM crashes. Both problems can be won on this hardware, but only if architected with lightweight, deterministic, and quantized algorithms.

---

## 2. Deep Dive: AIML-01 — Vehicle Identification and Traceability from CCTV

### 2.1 SOTA "1st-Place Winner" Architecture

A winning solution must never rely on a single lucky frame. Real CCTV footage of moving vehicles suffers from motion blur, interlacing artifacts, compression noise, and oblique angles. The winning architecture is an **End-to-End Multi-Frame Evidence Fusion & Probabilistic Registry Engine**:

```
[Low-Resolution CCTV Video Stream]
                │
                ▼
[1. Vehicle Detection & Multi-Object Tracking]
   ├─► Detection: YOLOv8n / MobileNet-SSD (Vehicle Bounding Boxes)
   └─► Temporal Association: ByteTrack / SORT (Assign Track ID across frames)
                │
                ▼
[2. Vehicle Body Panel & Attribute Extraction]
   ├─► Body Type Classifier: Lightweight MobileNetV3 (Car, SUV, 2-Wheeler, Auto, Truck)
   ├─► Specular/Glass Masking: Exclude windshield, windows, wheels, headlamps
   └─► Illumination-Normalized Color: Gray-World Retinex + CIE-Lab Delta-E Clustering
                │
                ▼
[3. License Plate Localization & Spatial Rectification]
   ├─► Plate Bounding Box Detection (Corner regression / Contour quad detection)
   └─► Perspective Transform: 4-Point Homography Warp to canonical 240x80 planar rectangle
                │
                ▼
[4. Multi-Frame Temporal Character Evidence Accumulator]
   ├─► Frame-by-frame character segment slicing / OCR confidence distribution P_k(C_i = c)
   ├─► Character Evidence Fusion: Bayesian temporal logit accumulation across K frames
   └─► Zero-Hallucination Masking: Shannon Entropy H(C_i) > tau -> Mark strictly as '?'
                │
                ▼
[5. Indian HSRP Syntax Parser & Registry Ranking Engine]
   ├─► Syntax Grammar Prior: State Code (2A) + District (2D) + Series (1-3A) + Unique (4D)
   ├─► Domain-Aware OCR Confusion Matrix (e.g., Cost(8, B) = 0.15, Cost(0, O) = 0.10)
   ├─► Fast Fuzzy Search: BK-Tree / Inverted N-Gram Index over Sample Registry (100k+ records)
   └─► Multi-Factor Bayesian Scoring: S_total = w_p*S_plate + w_c*S_color + w_t*S_type
                │
                ▼
[6. Investigator Interface & Forensic Audit Report]
   ├─► UI: Interactive video scrubber, multi-frame crop gallery, character confidence heatmaps
   ├─► Decision Gate: If max(S_total) < Threshold -> Output "No confident match"
   └─► Export: Forensic PDF/HTML Dossier with complete chain-of-evidence breakdown
```

### 2.2 Algorithmic Moats for AIML-01

1. **Information-Theoretic "Never Invent" Gate (Shannon Entropy):**
   - The PS requires: *"Characters that cannot be read must be marked unknown, never invented."*
   - For character slot $i$ across $K$ consecutive frames, let $P(c)$ be the fused probability of character $c \in \Sigma$ ($[A-Z, 0-9]$).
   - Shannon Entropy:
     $$H(C_i) = -\sum_{c \in \Sigma} P(c) \log_2 P(c)$$
   - If $H(C_i) > \tau_{\text{entropy}}$ (e.g., $1.5$ bits) OR $\max_{c} P(c) < 0.45$, mark character slot strictly as `?`. This mathematically proves to judges that the system never invents characters.

2. **Domain-Calibrated OCR Confusion Cost Matrix:**
   - Standard Levenshtein treats distance between `B` and `8` the same as `B` and `X` ($1.0$).
   - Optical confusion kernels for CCTV OCR: $(8 \leftrightarrow B)$, $(0 \leftrightarrow O \leftrightarrow D)$, $(1 \leftrightarrow I \leftrightarrow T)$, $(5 \leftrightarrow S)$, $(2 \leftrightarrow Z)$, $(4 \leftrightarrow A)$.
   - Define custom substitution weights:
     $$M('8', 'B') = 0.15, \quad M('0', 'O') = 0.10, \quad M('?', \text{any}) = 0.05$$

3. **Sub-Millisecond Registry Indexing (BK-Tree):**
   - Linear scans take 5–10s on 100,000 records. A **BK-Tree (Burkhard-Keller Tree)** partitioned by vehicle type/color returns top-5 matches in $< 4$ milliseconds.

4. **Illumination-Invariant CIE-Lab Color Extraction:**
   - Gray-World Retinex normalization strips sodium-lamp yellow casts. CIE-Lab $\Delta E^*$ calculates true perceptual color distance against RTO categories.

5. **Cross-Clip Re-Identification Gate (Bonus):**
   - Speed constraint: $v_{\text{inferred}} = \frac{\text{Distance}(\text{Cam}_1, \text{Cam}_2)}{|t_2 - t_1|}$. If $v_{\text{inferred}} > 140\text{ km/h}$, reject match regardless of visual similarity.

### 2.3 The Toughest Judge: 5 Brutal Grilling Questions & Defenses for AIML-01

1. **Judge:** *"Did you just run off-the-shelf YOLO + EasyOCR on a single clear frame?"*
   - **Defense:** Show the Multi-Frame Probabilistic Character Lattice table. Show frame 1 reading `DL 0? ?? 12??`, frame 2 reading `?? ?C AB ??34`, and frame 3 fusing them into `DL 0C AB 1234` with entropy logs.
2. **Judge:** *"The plate was physically covered in mud. Your model output '8C'. Did it read that or guess it?"*
   - **Defense:** Point to the Shannon entropy threshold check in `plate_fusion.py`. Show that when confidence falls below 45% or entropy exceeds 1.5, the slot is strictly masked as `?`.
3. **Judge:** *"Your video was shot under 2200K yellow sodium streetlights. Why did your model match a Gold car instead of White?"*
   - **Defense:** Demonstrate the Gray-World Retinex pre-filtering step and the before/after CIE-Lab color histogram normalizing the ambient cast.
4. **Judge:** *"A real registry has 10 million vehicles. Your linear regex scan takes 8 seconds for 500 rows. How does this survive at scale?"*
   - **Defense:** Demonstrate the BK-Tree index querying a 100,000-record synthetic registry database in $< 8$ ms.
5. **Judge:** *"I uploaded a clip of an unregistered tractor. Why did you output a Hyundai Creta? Where is your rejection boundary?"*
   - **Defense:** Show the rejection threshold: if Bayesian match score $< 0.55$, output red badge: `"NO CONFIDENT MATCH: Evidence insufficient to link with registered database."`

---

## 3. Deep Dive: AIML-02 — Zero-Guessing & Contradiction-Checking Document AI

### 3.1 SOTA "1st-Place Winner" Architecture

Generic teams will build a standard RAG pipeline (`LangChain + VectorDB + LLM Prompt`). This fails on amendment chains, hallucinates numbers, cannot detect contradictions across distant pages, and violates the "open-source only, zero paid API" constraint.

A 1st-place winning architecture decouples **Document Parsing & Temporal DAG Modeling** from a **Deterministic Natural Language Inference (NLI) Verifier & Exact Span Grounder**:

```
[Raw Legal & Regulatory PDFs: Circulars, Policies, Loan Agreements]
                              │
                              ▼
[1. Layout-Aware PDF Parser (PyMuPDF)]
   ├─► Retains Exact Geometry: Document Name, Page Number, Bounding Boxes [x0, y0, x1, y1]
   ├─► Table Matrix Extractor: Converts financial fee schedules into structured JSON grids
   └─► Hierarchical Chunking: Document -> Chapter -> Section -> Subsection -> Paragraph
                              │
                              ▼
[2. Temporal Amendment DAG (Directed Acyclic Graph) Engine]
   ├─► Metadata Extraction: Circular ID, Issue Date, Effective Date, Target Document Ref
   ├─► Graph Structure: Nodes = Clauses; Edges = ("AMENDS", "SUBSTITUTES", "REPEALS")
   └─► Temporal Resolution: get_active_clause(clause_id, target_date=T_query)
                              │
                              ▼
[3. Hybrid Lexical-Dense Retriever (BM25 + FAISS / RapidFuzz)]
   ├─► High-Recall Retrieval: Gathers all historical versions + related topic clauses
   └─► Context Filter: Prunes repealed clauses while retaining amendment audit trails
                              │
                              ▼
[4. Deterministic Contradiction & Conflict Engine]
   ├─► Entity-Aligned Clause Pairing: Aligns clauses discussing identical financial terms
   ├─► Multi-Type Discrepancy Checker: Numeric Value Conflict, Date/Timeline Conflict, Condition Conflict
   └─► Side-by-Side Contradiction Alert: Verbatim Quote A vs Verbatim Quote B + Diff Summary
                              │
                              ▼
[5. Local Verifiable Synthesizer & Zero-Guessing Gatekeeper]
   ├─► Extractive Span Selector / Lightweight CPU Model (No heavy 7B LLM required)
   ├─► Sentence Decomposition: Breaks synthesized response into atomic factual claims {C_1, ..., C_m}
   ├─► Verifiable Citation Anchor: Every claim linked to (Doc, Page, BBox, Verbatim Quote)
   ├─► Zero-Guessing Abstention: If claim unsupported -> BLOCK CLAIM:
   │     "I don't have proof: Documents provide no evidence regarding [entity]."
   └─► Mathematical Faithfulness Score: (Entailed Claims / Total Claims) * 100%
                              │
                              ▼
[6. High-Impact Enterprise UI & Bonus Capabilities]
   ├─► PDF Interactive Viewer: Renders glowing highlight boxes directly on original PDF pages
   ├─► Deterministic Calculation Engine (SymPy): Computes EMI/penalties with mathematical proof
   └─► Multilingual Hindi Module: Cross-lingual sentence embeddings for Hindi query answering
```

### 3.2 Algorithmic Moats for AIML-02

1. **Temporal Amendment Directed Acyclic Graph (DAG):**
   - Regulatory circulars mutate rules over time (Document C amends B, which amended A).
   - We construct an explicit clause lifecycle graph:
     $$\mathcal{G} = (\mathcal{V}_{\text{clauses}}, \mathcal{E}_{\text{amendments}})$$
   - Each clause possesses $[\text{valid\_from}, \text{valid\_to}, \text{status}]$. When querying active rules, the engine traverses the DAG to return the current leaf clause while displaying the historical evolution chain.

2. **Deterministic Contradiction Tuples:**
   - Extract structured tuples: $\tau = \langle \text{Subject}, \text{Attribute}, \text{Value}, \text{Condition}, \text{DocID}, \text{Page} \rangle$.
   - When $\text{Subject}$ and $\text{Condition}$ match but $\text{Value}$ diverges across unlinked active documents, trigger a **Side-by-Side Contradiction Alert**.

3. **Mathematical Faithfulness Score & Zero-Guessing Abstention:**
   - Decompose response into propositions $\{s_1, \dots, s_n\}$. Align each proposition to source span $q_j$:
     $$E(s_i, q_j) = \mathbb{I}\left( \text{Entailment}(q_j, s_i) \ge \tau \right)$$
     $$\text{Faithfulness} = \left( \frac{\sum_{i=1}^n E(s_i, q_{\text{source}})}{n} \right) \times 100\%$$
   - Any ungrounded proposition is blocked and replaced with: *"I don't have proof: Evidence absent in provided documents."*

4. **Visual PDF Highlighting (PyMuPDF Coordinate Injection):**
   - PyMuPDF extracts `(x0, y0, x1, y1)` coordinates of cited spans. UI draws native highlight boxes over the rendered PDF page.

5. **Deterministic Financial Math (SymPy):**
   - Financial penalties are executed using an exact Python AST / SymPy formula rather than an LLM doing guesswork arithmetic.

### 3.3 The Toughest Judge: 5 Brutal Grilling Questions & Defenses for AIML-02

1. **Judge:** *"Did your LLM invent its own 95% faithfulness score? Show me the deterministic code calculating this."*
   - **Defense:** Open `verifier.py`: show sentence tokenization, character offset substring verification, and the mathematical formula dividing verified claims by total claims.
2. **Judge:** *"Here is Circular 2019 (stating 4%) and Circular 2023 (amending it to 2.5%). Why did your chatbot answer 4%?"*
   - **Defense:** Walk through the Amendment DAG resolution log: show how `Circular 2023` supersedes `Clause 3` of `Circular 2019`, pruning the old rule and displaying the chronological audit trail.
3. **Judge:** *"The problem statement requires 'running entirely on open-source models without any paid AI API'. Pull out your internet connection right now and run this query live."*
   - **Defense:** Disconnect network adapter. Execute full pipeline locally on CPU using local PyMuPDF, local BM25/FAISS, and local deterministic verification. Operates 100% offline.
4. **Judge:** *"Here is a 3-page loan fee schedule where table header is on page 11 and penalty tier is on page 12. Your chunker broke the table. Why?"*
   - **Defense:** Demonstrate table-matrix parser that stitches cross-page tables into unified structured JSON grids with repeated headers.
5. **Judge:** *"The agreement does not specify year 5 prepayment. Your system suggested 2%. Why did it guess instead of refusing?"*
   - **Defense:** Query an unmentioned term. Show the Zero-Guessing Gate triggering: `"I don't have proof: Prepayment terms for Year 5 are not defined in the submitted documents."`

---

## 4. Head-to-Head Comparative Decision Matrix

| Evaluation Dimension | AIML-01: Vehicle CCTV Traceability | AIML-02: Zero-Guessing Document AI | Strategic Winner |
| :--- | :--- | :--- | :--- |
| **Algorithmic Defensibility & Moat** | Multi-frame temporal logit fusion, Shannon entropy `?` threshold, optical confusion matrix, BK-tree fast indexing. | Temporal amendment DAG, deterministic contradiction tuple matching, atomic proposition entailment, coordinate-grounded visual overlays. | **TIE** (Both offer immense depth) |
| **Live Stage Presence & Wow Factor** | High-adrenaline visual playback, tracking bounding boxes moving with vehicles, progressive plate character resolution, instant ranked shortlist. | Dual-pane PDF view, glowing coordinate bounding boxes, chronological amendment graphs, side-by-side red contradiction cards, verified faithfulness badges. | **AIML-02 (Slight Edge in Enterprise/Fintech)** |
| **Hardware & Environment Compatibility** | **100% Ready on Host**: `cv2`, `torch` (CPU), `torchvision`, `timm`, `faiss-cpu`, `RapidFuzz` are installed. Runs easily within 1.7 GB RAM. | **Ready (if Architected Deterministically)**: PyMuPDF installed. Heavy 3B+ local LLMs will cause OOM/thrashing. Must use lightweight extractive/deterministic modules. | **AIML-01** (Zero memory friction) |
| **Implementation Risk within 36 Hours** | **Low-to-Medium**: Video decoding, contour homography, OCR logit accumulation, and CSV registry matching have deterministic milestones. Test clips can be pre-rendered and cached. | **Medium**: Requires curating complex multi-document test sets (amended circulars, contradictory clauses) and fine-tuning PDF bounding-box rendering. | **AIML-01** (Lower execution risk) |
| **Bonus Features Feasibility** | Make/Model classifier (MobileNet on vehicle crop) + Spatio-temporal Re-ID across 2 clips. | Native PDF bounding box highlights (PyMuPDF coordinates) + SymPy loan calculation engine + Hindi cross-lingual embeddings. | **AIML-02** (PDF highlighting & calculation engine score high bonus marks) |

---

## 5. Decision Framework: Which Should You Pick?

- **Pick AIML-01 (CCTV Vehicle Traceability) IF:**
  - You want an undeniable, dynamic visual demo (investigators scrubbing CCTV, bounding boxes tracking, plates de-blurring across frames).
  - You want zero dependency/installation hurdles on the current machine (`cv2`, `torch`, `torchvision`, `timm`, `faiss-cpu`, `RapidFuzz` are already installed and verified).
  - You want lowest live-pitch risk (no risk of local model slowdowns or token-generation stalls).

- **Pick AIML-02 (Zero-Guessing Document AI) IF:**
  - You want to solve the #1 enterprise problem in AI (hallucination, silent compliance breaches, outdated regulations).
  - You love building knowledge graphs, financial table parsers, and verifiable citation systems.
  - You commit to the strict rule: **DO NOT run bloated 7B/3B generative LLMs on this CPU**; build an ultra-fast deterministic extractive & DAG verification engine.
