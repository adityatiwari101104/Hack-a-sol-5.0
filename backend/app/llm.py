"""OpenAI-compatible client: structured outputs, disk cache ("cassettes"), spend ledger with a hard cap.

The API key is read from a key file (default: the organizer-approved key in ~/Janmitra/.env) and never printed.
Every request is cached by sha256(request); LLM_MODE=replay serves only from cache (tests, canary gate).
"""
import hashlib
import json
import os
import threading

from . import config

_lock = threading.Lock()
_client = None
_reserved = 0.0  # USD held for calls in flight, so concurrent calls cannot overshoot the cap together
TIMEOUT_S = float(os.getenv("LLM_TIMEOUT_S", "60"))
MAX_OUTPUT_TOKENS_EST = 6000  # generous estimate of one call's output (incl. hidden reasoning) for the reservation


class BudgetExceeded(RuntimeError):
    pass


class CacheMiss(RuntimeError):
    pass


class ModelRefusal(RuntimeError):
    """The model declined to answer (structured-output refusal) or returned unparseable output."""


def _key():
    for line in config.LLM_KEY_FILE.read_text().splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError(f"OPENAI_API_KEY not found in {config.LLM_KEY_FILE}")


def client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=_key(), base_url=config.LLM_BASE_URL, timeout=TIMEOUT_S, max_retries=2)
    return _client


def spent():
    """USD recorded so far. Retries briefly if another process (one still running older code that wrote the ledger in
    place) is mid-write; never reports 0 on a half-written file."""
    import time
    for attempt in range(20):
        try:
            return json.loads(config.SPEND_LEDGER.read_text())["usd"]
        except FileNotFoundError:
            return 0.0
        except (json.JSONDecodeError, KeyError):
            if attempt == 19:
                raise
            time.sleep(0.05)


def _price(model):
    base = next((k for k in config.PRICES if model.startswith(k)), None)
    return config.PRICES.get(base, (2.5, 10.0))


def _estimate(model, system, user):
    """Upper-bound cost of one call: ~1 token per 3 characters in, MAX_OUTPUT_TOKENS_EST out."""
    pin, pout = _price(model)
    return (len(system) + len(user)) / 3 / 1e6 * pin + MAX_OUTPUT_TOKENS_EST / 1e6 * pout


def _reserve(est):
    """Check the cap and hold `est` in one locked step (the old check-then-call let parallel calls overshoot)."""
    global _reserved
    with _lock:
        if spent() + _reserved + est > config.SPEND_CAP_USD:
            raise BudgetExceeded(f"spend cap ${config.SPEND_CAP_USD} reached (ledger ${spent():.3f}, "
                                 f"in flight ${_reserved:.3f})")
        _reserved += est


def _release(est):
    global _reserved
    with _lock:
        _reserved = max(0.0, _reserved - est)


def _record(model, usage):
    pin, pout = _price(model)
    cost = usage["prompt_tokens"] / 1e6 * pin + usage["completion_tokens"] / 1e6 * pout
    with _lock, _ledger_lock():
        led = json.loads(config.SPEND_LEDGER.read_text()) if config.SPEND_LEDGER.exists() else {"usd": 0.0, "calls": 0}
        led["usd"] = led["usd"] + cost
        led["calls"] = led.get("calls", 0) + 1
        _write_ledger(led)
    return cost


class _ledger_lock:
    """OS file lock around the ledger's read-add-write: the thread lock only covers one process, and the API server,
    eval runs and scripts all add to the same ledger (two of them once left a mangled file)."""
    def __enter__(self):
        import fcntl
        config.SPEND_LEDGER.parent.mkdir(parents=True, exist_ok=True)
        self.fh = open(config.SPEND_LEDGER.with_name(config.SPEND_LEDGER.name + ".lock"), "a")
        fcntl.flock(self.fh, fcntl.LOCK_EX)

    def __exit__(self, *exc):
        import fcntl
        fcntl.flock(self.fh, fcntl.LOCK_UN)
        self.fh.close()


def _write_ledger(led):
    tmp = config.SPEND_LEDGER.with_name(f"{config.SPEND_LEDGER.name}.{os.getpid()}.{threading.get_ident()}.tmp")
    tmp.write_text(json.dumps(led))
    os.replace(tmp, config.SPEND_LEDGER)  # atomic rename of a file only this writer used


def structured(model, system, user, schema, name, reasoning_effort="low"):
    """Return (parsed_json, meta). meta = {cached, usage, cost, cache_key}."""
    request = {"model": model, "system": system, "user": user, "schema": schema, "name": name,
               "reasoning_effort": reasoning_effort}
    key = hashlib.sha256(json.dumps(request, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    path = config.CASSETTES / f"{key[:2]}" / f"{key}.json"
    if path.exists():
        rec = json.loads(path.read_text())
        return rec["output"], {"cached": True, "usage": rec["usage"], "cost": 0.0, "cache_key": key}
    if config.LLM_MODE == "replay":
        raise CacheMiss(f"replay mode and no recorded response for {name}")
    est = _estimate(model, system, user)
    _reserve(est)
    try:
        return _call(model, system, user, schema, name, reasoning_effort, path, key)
    finally:
        _release(est)


def _call(model, system, user, schema, name, reasoning_effort, path, key):
    kwargs = dict(model=model, messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                  response_format={"type": "json_schema", "json_schema": {"name": name, "schema": schema, "strict": True}},
                  store=False)
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    try:
        resp = client().chat.completions.create(**kwargs)
    except Exception as e:  # some models reject reasoning_effort; retry once without it
        if reasoning_effort and "reasoning" in str(e).lower():
            kwargs.pop("reasoning_effort")
            resp = client().chat.completions.create(**kwargs)
        else:
            raise
    usage = {"prompt_tokens": resp.usage.prompt_tokens, "completion_tokens": resp.usage.completion_tokens}
    cost = _record(model, usage)  # billed even if the model refused
    msg = resp.choices[0].message
    if getattr(msg, "refusal", None) or not msg.content:
        raise ModelRefusal(f"{name}: model refused ({(getattr(msg, 'refusal', None) or 'empty output')[:120]})")
    try:
        output = json.loads(msg.content)
    except json.JSONDecodeError as e:  # e.g. truncated at the token limit
        raise ModelRefusal(f"{name}: unparseable output ({e})") from e
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"request_name": name, "model": model, "output": output, "usage": usage},
                               ensure_ascii=False))
    return output, {"cached": False, "usage": usage, "cost": cost, "cache_key": key}
