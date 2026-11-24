// The UI names no model company or provider (user, 24-Nov): no OpenAI, no GPT model ids, no org prefixes such as
// "BAAI/". Local model names (HHEM-2.1, MiniCheck, bge-small) stay. Server text (reasons, badge details, X-ray notes, audit
// payloads) can carry names such as "HHEM 0.06 < 0.5" or a model id; these are reworded to their role. Check CODES
// (e.g. "e:hhem 0.71" in Sentence.checks) are left alone: the UI maps them to labels in lib/checks.ts.
const RULES: [RegExp, string][] = [
  [/\b(?:openai\/)?gpt-[\w.-]*?nano[\w.-]*/gi, 'planning model'],
  [/\b(?:openai\/)?gpt-[\w.-]*?mini[\w.-]*/gi, 'drafting model'],
  [/\b(?:openai\/)?gpt-[\w.-]+/gi, 'language model'],
  [/\bOpenAI-compatible\b/g, 'compatible'],
  [/\bOpenAI(?:'s)? (API|models?)\b/g, 'hosted $1'],
  [/\bOpenAI\b/g, 'hosted model'],
  // local models keep their names; only the publishing organisation is dropped
  [/\bvectara\/hallucination_evaluation_model\b/gi, 'HHEM-2.1'],
  [/\b(?:BAAI|vectara|microsoft|lytton|bespokelabs)\//gi, ''],
]
export function brandless(text: string): string {
  let t = text
  for (const [re, to] of RULES) t = t.replace(re, to)
  return t
}
/** Deep-applies brandless() to every string in an API response, except Sentence.checks codes. */
export function scrubResponse<T>(x: T, key = ''): T {
  if (typeof x === 'string') return brandless(x) as unknown as T
  if (Array.isArray(x)) return (key === 'checks' ? x : x.map((v) => scrubResponse(v))) as unknown as T
  if (x && typeof x === 'object') {
    const o: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) o[k] = scrubResponse(v, k)
    return o as T
  }
  return x
}
