// Feature journey: admin leases free stall 2 to the seeded rental user.
// Proves UI -> POST /api/stalls/2 -> Postgres row -> UI state. Exit 0 = pass.
// Usage: NODE_PATH=/usr/local/lib/node_modules node journey-lease-stall.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { evidenceDir, open } from './drive.mjs'

const pgPort = process.env.FOODCO_PG_PORT ?? '55432'
const sql = (q) =>
  execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', 'localhost', '-p', pgPort, '-U', 'foodco', '-d', 'foodco', '-tAc', q], { encoding: 'utf8' }).trim()
const stallRow = () =>
  sql(`select s."stallName", s."rentStatus", u.email from "Stalls" s join "user" u on u.id = s."stallOwner" where s."stallNumber" = 2`)

const log = []
const step = (msg) => { log.push(msg); console.log(msg) }

step(`db before: ${stallRow()}`)
const { browser, page, errors, shot } = await open('admin', '/dashboard/stall-availability')
step(`screenshot before: ${await shot('lease-stall-before')}`)

await page.getByRole('button', { name: /^2 Still Empty/ }).click()
const dialog = page.getByRole('dialog', { name: /Stall 2/ })
await dialog.getByRole('textbox', { name: 'Stall Name' }).fill('Verify Satay Corner')
await dialog.getByRole('combobox').filter({ hasText: 'admin@verify.test' }).click()
await page.getByRole('option', { name: 'rental@verify.test' }).click()
await dialog.getByRole('checkbox', { name: 'Rent Status' }).check()
// Day buttons in react-day-picker's grid; 10 -> 20 of the visible month keeps end > start on any run date.
for (const [field, day] of [['Start Date', '10'], ['End Date', '20']]) {
  await dialog.getByRole('button', { name: field }).click()
  await page.getByRole('grid').getByRole('button', { name: new RegExp(`\\b${day}(st|nd|rd|th)?\\b`) }).first().click()
  await page.getByRole('grid').waitFor({ state: 'detached' })
}
const saved = page
  .waitForResponse((r) => r.url().endsWith('/api/stalls/2') && r.request().method() === 'POST', { timeout: 10_000 })
  .catch(() => null)
const toastSeen = page.getByText('Stall updated successfully').waitFor({ timeout: 10_000 }).then(() => true, () => false)
await dialog.getByRole('button', { name: 'Update Stall' }).click()
const [res, toast] = await Promise.all([saved, toastSeen])
step(`POST /api/stalls/2 -> ${res ? res.status() : 'never sent'}`)
step(`success toast shown: ${toast}`)
if (res) {
  await page.getByRole('tab', { name: /On lease/ }).click()
  await page.getByRole('button', { name: /Stall 2, Verify Satay Corner/ }).waitFor()
}
step(`screenshot after: ${await shot('lease-stall-after')}`)

const after = stallRow()
step(`db after: ${after}`)
await browser.close()

const ok = res?.status() === 200 && after === 'Verify Satay Corner|t|rental@verify.test' && errors.length === 0
step(errors.length ? `browser errors:\n  ${errors.join('\n  ')}` : 'browser errors: none')
step(ok ? 'PASS lease-stall' : 'FAIL lease-stall')
writeFileSync(`${evidenceDir}/lease-stall.log`, `${log.join('\n')}\n`)
process.exit(ok ? 0 : 1)
