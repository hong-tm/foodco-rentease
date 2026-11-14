// Sign in through the real better-auth endpoint and save a Playwright storageState.
// Usage: node login.mjs <admin|rental|user> [out.json]
// The UI form cannot be used on localhost: its Turnstile site key is bound to the prod domain.
// This sends Cloudflare's dummy token, which the test secret in env.sh accepts at the real siteverify.
import { writeFileSync } from 'node:fs'

const role = process.argv[2] ?? 'admin'
const out = process.argv[3] ?? `/tmp/foodco-verify/state-${role}.json`
const base = `http://localhost:${process.env.FOODCO_APP_PORT ?? 3100}`
const email = `${role}@verify.test`

const res = await fetch(`${base}/api/auth/sign-in/email`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: base, 'x-captcha-response': 'XXXX.DUMMY.TOKEN.XXXX' },
  body: JSON.stringify({ email, password: 'Verify-pass-123' }),
})
if (!res.ok) {
  console.error(`login ${email}: HTTP ${res.status} ${await res.text()}`)
  process.exit(1)
}
const cookies = res.headers.getSetCookie().map((c) => {
  const [pair] = c.split(';')
  const i = pair.indexOf('=')
  return { name: pair.slice(0, i), value: pair.slice(i + 1), domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax', expires: -1 }
})
writeFileSync(out, JSON.stringify({ cookies, origins: [] }, null, 2))
console.log(`login ${email}: OK -> ${out}`)
