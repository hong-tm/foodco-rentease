// Feature journey: admin creates a water bill for leased stall 1.
// Proves UI -> POST /api/payments/... -> Payments row -> table row. Exit 0 = pass.
// Usage: NODE_PATH=/usr/local/lib/node_modules node journey-utility-bill.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { evidenceDir, open } from './drive.mjs'

const pgPort = process.env.FOODCO_PG_PORT ?? '55432'
const sql = (q) =>
  execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', 'localhost', '-p', pgPort, '-U', 'foodco', '-d', 'foodco', '-tAc', q], { encoding: 'utf8' }).trim()
const bills = () => sql(`select count(*) from "Payments" where "stallId" = 1 and "paymentType" = 'water' and "paymentAmount"::numeric = 42.50`)

const log = []
const step = (msg) => { log.push(msg); console.log(msg) }

const before = Number(bills())
step(`db water bills before: ${before}`)
const { browser, page, errors, shot } = await open('admin', '/dashboard/stall-payment')
await page.getByRole('button', { name: 'New bill' }).click()
const dialog = page.getByRole('dialog', { name: 'New bill' })
await dialog.getByRole('combobox', { name: 'Stall' }).click()
await page.getByRole('option', { name: /^1\b|Verify Noodle House/ }).first().click()
await dialog.getByRole('combobox', { name: 'Type' }).click()
await page.getByRole('option', { name: /water/i }).click()
await dialog.getByRole('spinbutton', { name: 'Amount (RM)' }).fill('42.50')
await dialog.getByRole('button', { name: 'Bill date' }).click()
await page.getByRole('grid').getByRole('button', { name: /\b10(st|nd|rd|th)?\b/ }).first().click()

const posted = page
  .waitForResponse((r) => r.url().includes('/api/payments') && r.request().method() === 'POST', { timeout: 10_000 })
  .catch(() => null)
await dialog.getByRole('button', { name: 'Create bill' }).click()
const res = await posted
step(`POST ${res ? `${new URL(res.url()).pathname} -> ${res.status()}` : '/api/payments -> never sent'}`)
if (res) await page.getByRole('row', { name: /42\.50/ }).first().waitFor()
step(`screenshot after: ${await shot('utility-bill-after')}`)

const after = bills()
step(`db water bills after: ${after}`)
await browser.close()

const ok = res?.ok() && Number(after) === before + 1 && errors.length === 0
step(errors.length ? `browser errors:\n  ${errors.join('\n  ')}` : 'browser errors: none')
step(ok ? 'PASS utility-bill' : 'FAIL utility-bill')
writeFileSync(`${evidenceDir}/utility-bill.log`, `${log.join('\n')}\n`)
process.exit(ok ? 0 : 1)
