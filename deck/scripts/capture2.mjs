// Element-level 2x captures for the deck. Replay API (:8010, scratch DB) + UI (:5180). Read-only for the repo.
import { chromium } from 'playwright-core'
const BASE = 'http://localhost:5180'
const OUT = new URL('../assets/ui/', import.meta.url).pathname
const browser = await chromium.launch({ channel: 'chrome', headless: true })
let page
async function fresh() { if (page) await page.context().close(); const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' }); page = await c.newPage(); page.setDefaultTimeout(8000) }
const wait = (ms) => page.waitForTimeout(ms)
const full = (n) => page.screenshot({ path: OUT + n + '.png' })
async function el(sel, n) { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); await wait(400); await l.screenshot({ path: OUT + n + '.png' }) }
async function domain(name) { if (name) { await page.getByRole('button', { name, exact: true }).first().click().catch(() => page.getByText(name, { exact: true }).first().click()); await wait(800) } }
async function ask(title, dom) {
  await fresh(); await page.goto(BASE + '/#/ask'); await wait(1200); await domain(dom)
  const card = page.getByText(title, { exact: true }).first()
  if (await card.isVisible().catch(() => false)) await card.click()
  else { await page.getByText('Rehearsed questions', { exact: true }).first().click(); await wait(600); await page.getByText(title, { exact: true }).first().click() }
  await page.locator('.proofmeter, .abstain, .kp-cov').first().waitFor({ state: 'visible', timeout: 150000 })
  await wait(2500); await page.mouse.move(5, 890); await wait(300)
}
const steps = {
  async hero() { await ask('Tier 3 · ₹40 lakh MSE loan'); await full('01-answer-full') },
  async withheld() { await ask('EMI reset · as of 15-Sep-2025'); await full('02-sep-full'); await page.locator('.tray-head').first().click(); await wait(800); await el('.tray', '02-withheld-tray'); await full('02-sep-tray-full') },
  async conflict() { await ask('Home-loan clause 9.3 (2%)'); await full('04-conflict-full'); await el('.conflict', '04-conflict-card') },
  async refusal() { await ask('RBI repo rate today'); await el('.abstain', '08a-abstain-card'); await ask('Gold-loan FAQ (hidden injection)'); await full('08b-flagged-full'); await el('.abstain', '08b-flagged-card') },
  async calc() { await ask('EMI ₹25 lakh · 8.5% · 240 months'); await full('09-calc-full'); await el('.calc', '09-calc-card') },
  async hindi() { await ask('Hinglish question'); await full('07-hindi-full') },
  async insurance() { await ask('Pre-existing disease wait · today', 'Insurance'); await full('12-ins-full'); await el('.conflict', '12-ins-conflict') },
  async upload() {
    await fresh(); await page.goto(BASE + '/#/uploads'); await wait(1500)
    await page.getByText('Try the demo upload', { exact: true }).first().click(); await wait(1500); await full('05a-upload-dialog')
    for (const b of ['Upload', 'Upload and check', 'Start', 'Add']) { const x = page.getByRole('button', { name: b, exact: true }); if (await x.isVisible().catch(() => false)) { await x.click(); break } }
    await page.getByText('Impact on the bank’s documents').first().waitFor({ state: 'visible', timeout: 240000 }).catch(() => {})
    await wait(2500); await full('05b-upload-report')
  },
  async upask() { await ask('New circular: 3% foreclosure', 'Your uploads'); await full('05c-upload-answer'); await el('.conflict', '05c-upload-conflict') },
  async summary() { await ask('Summarise the circular', 'Your uploads'); await full('06a-summary-full'); await ask('सारांश (Hindi summary)', 'Your uploads'); await full('06b-summary-hi-full') },
  async audit() { await fresh(); await page.goto(BASE + '/#/audit'); await wait(2500); const v = page.getByText('Verify chain', { exact: true }).first(); if (await v.isVisible().catch(() => false)) { await v.click(); await wait(6000) } await full('10-audit-verified') },
}
for (const s of process.argv.slice(2)) { const t = Date.now(); try { await steps[s](); console.log('ok', s, ((Date.now() - t) / 1000).toFixed(0) + 's') } catch (e) { console.log('FAIL', s, e.message.split('\n')[0]); await full('FAIL-' + s).catch(() => {}) } }
await browser.close()
