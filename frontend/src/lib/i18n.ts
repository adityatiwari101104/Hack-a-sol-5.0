// UI chrome in English and Hindi (GIGW 3.0: prominent language switch, Unicode text).
// Verbatim law text is never translated; answers stay in verified English until the backend returns a
// translation labelled "अनुवाद (सत्यापित नहीं)".

export type Lang = 'en' | 'hi'

const T = {
  ask: ['Ask', 'प्रश्न'],
  conflicts: ['Conflicts', 'विरोधाभास'],
  alerts: ['Impact alerts', 'प्रभाव अलर्ट'],
  reviews: ['Review queue', 'समीक्षा कतार'],
  audit: ['Audit trail', 'ऑडिट ट्रेल'],
  history: ['Clause history', 'खंड इतिहास'],
  rules: ['Rule simulator', 'नियम सिम्युलेटर'],
  governance: ['AI governance', 'एआई शासन'],
  uploads: ['Uploads', 'अपलोड'],
  recent: ['Recent questions', 'हाल के प्रश्न'],
  rehearsed: ['Rehearsed questions', 'रिकॉर्ड किए गए प्रश्न'],
  asOf: ['As of', 'तिथि'],
  viewingAsOf: ['Viewing law as of', 'इस तिथि का कानून'],
  backToToday: ['Back to today', 'आज पर लौटें'],
  placeholder: ['Ask a compliance question…', 'अनुपालन प्रश्न पूछें…'],
  proofLine: ['Every sentence shown is backed by a located, in-force quote. Unproven sentences are withheld.',
    'दिखाया गया हर वाक्य एक प्रमाणित, लागू उद्धरण पर आधारित है। अप्रमाणित वाक्य रोके जाते हैं।'],
  withheld: ['Withheld', 'रोके गए'],
  evidence: ['Evidence', 'साक्ष्य'],
  ANSWER: ['Answer', 'उत्तर'],
  PARTIAL: ['Partial', 'आंशिक'],
  CONFLICT: ['Conflict', 'विरोधाभास'],
  ABSTAIN: ['Abstained', 'उत्तर रोका'],
  NEEDS_INFO: ['Needs details', 'जानकारी चाहिए'],
  xray: ['Pipeline X-ray', 'पाइपलाइन एक्स-रे'],
  inForce: ['In force', 'लागू'],
  superseded: ['Superseded', 'अधिक्रमित'],
} as const

export type Key = keyof typeof T

export function t(key: Key, lang: Lang): string {
  return T[key][lang === 'hi' ? 1 : 0]
}
