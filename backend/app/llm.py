"""OpenAI-compatible client: structured outputs, disk cache ("cassettes"), spend ledger with a hard cap.

The API key is read from a key file (default: the organizer-approved key in ~/Janmitra/.env) and never printed.
Every request is cached by sha256(request); LLM_MODE=replay serves only from cache (tests, canary gate).
"""
import hashlib
import json
import threading

from . import config

_lock = threading.Lock()
_client = None


class BudgetExceeded(RuntimeError):
    pass


class CacheMiss(RuntimeError):
    pass


def _key():
    for line in config.LLM_KEY_FILE.read_text().splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError(f"OPENAI_API_KEY not found in {config.LLM_KEY_FILE}")


def client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=_key(), base_url=config.LLM_BASE_URL)
    return _client


def spent():
    try:
        return json.loads(config.SPEND_LEDGER.read_text())["usd"]
    except FileNotFoundError:
        return 0.0


def _record(model, usage):
    base = next((k for k in config.PRICES if model.startswith(k)), None)
    pin, pout = config.PRICES.get(base, (2.5, 10.0))
    cost = usage["prompt_tokens"] / 1e6 * pin + usage["completion_tokens"] / 1e6 * pout
    with _lock:
        led = json.loads(config.SPEND_LEDGER.read_text()) if config.SPEND_LEDGER.exists() else {"usd": 0.0, "calls": 0}
        led["usd"] = led["usd"] + cost
        led["calls"] = led.get("calls", 0) + 1
        config.SPEND_LEDGER.parent.mkdir(parents=True, exist_ok=True)
        config.SPEND_LEDGER.write_text(json.dumps(led))
    return cost


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
        raise CacheMiss(f"replay mode and no cassette for {name}")
    if spent() >= config.SPEND_CAP_USD:
        raise BudgetExceeded(f"spend cap ${config.SPEND_CAP_USD} reached (ledger ${spent():.3f})")
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
    cost = _record(model, usage)
    output = json.loads(resp.choices[0].message.content)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"request_name": name, "model": model, "output": output, "usage": usage},
                               ensure_ascii=False))
    return output, {"cached": False, "usage": usage, "cost": cost, "cache_key": key}
