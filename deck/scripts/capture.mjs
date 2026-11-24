// Capture 2x screenshots of the Proof-or-Silence UI for the deck (read-only; replay API on a scratch DB).
// Usage: node scripts/capture.mjs <step-name ...>   (UI on :5180, API on :8010)
import { chromium } from 'playwright-core'
const BASE = process.env.UI ?? 'http://localhost:5180'
const OUT = new URL('../assets/ui/', import.meta.url).pathname
const browser = await chromium.launch({ channel: 'chrome', headless: true })
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: process.env.DARK ? 'dark' : 'light' })
let page = await ctx.newPage()
const shot = (n) => page.screenshot({ path: OUT + n + '.png' })
const settle = async (ms = 1500) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms) }
async function ask(cardTitle, { done = /checks passed|passed every check|Abstained|withheld|Conflict|Key points/i, timeout = 120000 } = {}) {
  await page.close(); const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: process.env.DARK ? 'dark' : 'light' }); page = await c.newPage()
  await page.goto(BASE + '/#/ask'); await settle(800)
  await page.getByText(cardTitle, { exact: true }).first().click()
  await page.waitForFunction(() => !document.body.innerText.match(/Verifying sentence|Understanding|Searching 2|Drafting/), null, { timeout }).catch(() => {})
  await settle(2500)
}
const steps = {
  async hero() { await ask('Tier 3 · ₹40 lakh MSE loan'); await shot('01-answer-full') },
  async asof() {
    await ask('EMI reset · as of 15-Sep-2025'); await shot('03a-asof-sep-full')
    await ask('EMI reset · as of 15-Oct-2025'); await shot('03b-asof-oct-full')
  },
  async conflict() { await ask('Home-loan clause 9.3 (2%)'); await shot('04-conflict-full') },
  async refusal() { await ask('RBI repo rate today'); await shot('08a-abstain-full'); await ask('Gold-loan FAQ (hidden injection)'); await shot('08b-flagged-full') },
  async calc() { await ask('EMI ₹25 lakh · 8.5% · 240 months'); await shot('09-calc-full') },
  async landing() { await page.goto(BASE + '/#/'); await settle(3000); await shot('13a-landing-full') },
  async pages() {
    for (const [r, n] of [['conflicts', '12-conflicts'], ['impact', '11-impact'], ['audit', '10-audit'], ['governance', '15-governance'], ['uploads', '05-uploads'], ['history', '14-history'], ['review', '16-review']]) {
      await page.goto(BASE + '/#/' + r); await settle(3000); await shot(n + '-full')
    }
  },
}
for (const s of process.argv.slice(2)) { try { await steps[s](); console.log('ok', s) } catch (e) { console.log('FAIL', s, e.message.split('\n')[0]) } }
await browser.close()
