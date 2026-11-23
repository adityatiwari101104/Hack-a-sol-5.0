"""Settings. Every value can be overridden with an environment variable."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(os.getenv("DATA_DIR", ROOT / "backend" / "data"))
DB_PATH = DATA / "aiml02.sqlite"
CORPUS = ROOT / "corpus"
REGISTRY = CORPUS / "registry.json"
CASSETTES = Path(os.getenv("CASSETTES_DIR", ROOT / "eval" / "cassettes"))
SPEND_LEDGER = ROOT / "eval" / "spend_ledger.json"

# LLM: OpenAI by default; any OpenAI-compatible endpoint via LLM_BASE_URL (e.g. Groq gpt-oss, local Ollama).
LLM_BASE_URL = os.getenv("LLM_BASE_URL") or None
LLM_KEY_FILE = Path(os.getenv("LLM_KEY_FILE", Path.home() / "Janmitra" / ".env"))  # organizer-approved OpenAI key
LLM_MODEL_DRAFT = os.getenv("LLM_MODEL_DRAFT", "gpt-5.4-mini-2026-03-17")
LLM_MODEL_EXTRACT = os.getenv("LLM_MODEL_EXTRACT", "gpt-5.4-nano-2026-03-17")
LLM_MODE = os.getenv("LLM_MODE", "live")  # live: call API on cache miss; replay: cache only (tests, canary gate)
# USD per 1M tokens (input, output), from public pricing on 2026-11-23, plus 20% safety margin.
PRICES = {"gpt-5.4-mini": (0.75 * 1.2, 4.50 * 1.2), "gpt-5.4-nano": (0.20 * 1.2, 1.25 * 1.2)}
SPEND_CAP_USD = float(os.getenv("SPEND_CAP_USD", "3.50"))  # whole-project budget is $4; keep a margin

EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")  # bge-m3 for Hindi/multilingual if RAM allows
NLI_MODEL = "vectara/hallucination_evaluation_model"
NLI_REVISION = os.getenv("NLI_REVISION", "main")
NLI2_MODEL = os.getenv("NLI2_MODEL", "lytang/MiniCheck-DeBERTa-v3-Large")  # second opinion; "" disables

TAU_ENTAIL = float(os.getenv("TAU_ENTAIL", "0.5"))
TAU_LEXICAL = float(os.getenv("TAU_LEXICAL", "90"))     # token-set similarity for near-verbatim sentences
FUZZ_CUTOFF = float(os.getenv("FUZZ_CUTOFF", "95"))
TAU_RETRIEVAL = float(os.getenv("TAU_RETRIEVAL", "0.55"))  # cosine of best evidence sentence
TOP_K_CHUNKS = int(os.getenv("TOP_K_CHUNKS", "8"))
MAX_EVIDENCE = int(os.getenv("MAX_EVIDENCE", "18"))

BANK_PROFILES = {
    "ucb_tier3": {"label": "Example UCB (fictional) · Tier 3 UCB", "entity": "ucb", "ucb_tier": 3},
    "ucb_tier4": {"label": "Example UCB (fictional) · Tier 4 UCB", "entity": "ucb", "ucb_tier": 4},
    "commercial_bank": {"label": "Commercial bank", "entity": "commercial_bank", "ucb_tier": None},
}
