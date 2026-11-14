// Open a page as a seeded role, print its accessibility snapshot, save a screenshot.
// Usage: NODE_PATH=/usr/local/lib/node_modules node drive.mjs <admin|rental|user|anon> <path> [shot-name]
// For multi-step journeys, import { open } from this file.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const { chromium } = createRequire(import.meta.url)('playwright')
const base = `http://localhost:${process.env.FOODCO_APP_PORT ?? 3100}`
const run = process.env.FOODCO_VERIFY_RUN ?? '/tmp/foodco-verify'
export const evidenceDir = process.env.FOODCO_VERIFY_EVIDENCE ?? '/tmp/foodco-verify-evidence'
mkdirSync(evidenceDir, { recursive: true })

export async function open(role, path) {
  const state = `${run}/state-${role}.json`
  if (role !== 'anon' && !existsSync(state)) {
    execFileSync('node', [new URL('./login.mjs', import.meta.url).pathname, role, state], { stdio: 'inherit' })
  }
  const browser = await chromium.launch()
  const context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1440, height: 900 },
    storageState: role === 'anon' ? undefined : state,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  page.on('response', (r) => r.url().includes('/api/') && r.status() >= 400 && errors.push(`http ${r.status()} ${r.url()}`))
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  const shot = async (name) => {
    const file = `${evidenceDir}/${new Date().toISOString().replace(/[:.]/g, '-')}-${name}.png`
    await page.screenshot({ path: file, fullPage: true })
    return file
  }
  return { browser, page, errors, shot }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [role = 'admin', path = '/dashboard', name] = process.argv.slice(2)
  const { browser, page, errors, shot } = await open(role, path)
  console.log(`url: ${page.url()}`)
  console.log(await page.locator('body').ariaSnapshot())
  if (name) console.log(`screenshot: ${await shot(name)}`)
  if (errors.length) console.log(`errors:\n  ${errors.join('\n  ')}`)
  await browser.close()
}
