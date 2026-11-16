#!/usr/bin/env node
// Ratchet for agent mistakes: counts per file may fall, never rise. Usage in AGENTS.md.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE = join(ROOT, 'scripts', 'guardrails-baseline.json')
const FRONT = 'fc-front/src'
const BACK = 'fc-back'
const SHADCN = /components\/ui\//

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const DIRECTIVE =
  /(?:eslint-|oxlint-|@ts-expect-error|@ts-ignore|@ts-nocheck|<reference|prettier-ignore|@vite-ignore|#__PURE__|@__PURE__|knip-ignore|@jsx)/

function commentLines(src) {
  const out = new Set()
  let line = 0
  let i = 0
  const n = src.length
  const mark = (from, to) => {
    const text = src.slice(from, to)
    if (DIRECTIVE.test(text)) return
    let l = line
    for (const c of text) {
      out.add(l)
      if (c === '\n') l++
    }
  }
  while (i < n) {
    const c = src[i]
    if (c === '\n') {
      line++
      i++
    } else if (c === '"' || c === "'" || c === '`') {
      i++
      while (i < n && src[i] !== c) {
        if (src[i] === '\\') i++
        else if (src[i] === '\n') line++
        i++
      }
      i++
    } else if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i) === -1 ? n : src.indexOf('\n', i)
      mark(i, end)
      i = end
    } else if (c === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2)
      const end = close === -1 ? n : close + 2
      mark(i, end)
      for (let k = i; k < end; k++) if (src[k] === '\n') line++
      i = end
    } else if (c === '/' && /[(,=:[!&|?{;]/.test(src.slice(0, i).trimEnd().slice(-1) || ';')) {
      let cls = false
      i++
      while (i < n && src[i] !== '\n' && (cls || src[i] !== '/')) {
        if (src[i] === '\\') i++
        else if (src[i] === '[') cls = true
        else if (src[i] === ']') cls = false
        i++
      }
      if (src[i] === '/') i++
    } else i++
  }
  return out
}

const RULES = [
  {
    id: 'use-effect',
    roots: [FRONT],
    skip: SHADCN,
    re: /\buseEffect\s*\(/g,
    fix: 'derive the value during render, move the work into the event handler, or use a query/collection; useEffect only syncs with an external system',
  },
  {
    id: 'raw-type-scale',
    roots: [FRONT],
    skip: SHADCN,
    re: /\btext-(?:lg|xl|[2-9]xl)\b/g,
    fix: 'use a type-* role from the theme css instead of a raw Tailwind size',
  },
  {
    id: 'raw-colour',
    roots: [FRONT],
    skip: SHADCN,
    re: new RegExp(
      String.raw`\b(?:text|bg|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|shadow|accent|caret)-(?:(?:${PALETTE})-\d{2,3}|white\b|black\b|\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab)\())`,
      'g'
    ),
    fix: 'use a semantic colour token (primary, muted, destructive, --brand) instead of a palette shade or hex',
  },
  {
    id: 'code-comment',
    roots: [FRONT, BACK],
    skip: SHADCN,
    lines: commentLines,
    fix: 'delete it: encode the constraint as a type, test or check, and put the why in the commit message',
  },
]

const files = (dir) => {
  const out = []
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e === 'node_modules' || e === 'dist' || e === 'webpage' || e.startsWith('.')) continue
      const p = join(d, e)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(?:tsx?|jsx?|mjs)$/.test(e) && !/\.(?:d|gen)\.ts$/.test(e)) out.push(p)
    }
  }
  if (existsSync(dir)) walk(dir)
  return out
}

const current = {}
const hits = {}
for (const rule of RULES) {
  current[rule.id] = {}
  for (const root of rule.roots) {
    for (const f of files(join(ROOT, root))) {
      const rel = relative(ROOT, f).split(sep).join('/')
      if (rule.skip?.test(rel)) continue
      let n = 0
      const src = readFileSync(f, 'utf8')
      const lines = src.split('\n')
      const flagged = rule.lines ? rule.lines(src) : null
      lines.forEach((line, i) => {
        const k = flagged ? (flagged.has(i) ? 1 : 0) : (line.match(rule.re) || []).length
        if (k > 0) {
          n += k
          ;(hits[`${rule.id} ${rel}`] ??= []).push(`${i + 1}: ${line.trim().slice(0, 100)}`)
        }
      })
      if (n > 0) current[rule.id][rel] = n
    }
  }
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : null

if (process.argv.includes('--update')) {
  const next = {}
  for (const rule of RULES) {
    const now = current[rule.id]
    const was = baseline?.[rule.id]
    if (!was) {
      next[rule.id] = Object.fromEntries(Object.entries(now).sort())
      continue
    }
    const kept = {}
    for (const [file, n] of Object.entries(now)) if (was[file]) kept[file] = Math.min(n, was[file])
    let budget = Object.values(was).reduce((a, b) => a + b, 0) - Object.values(kept).reduce((a, b) => a + b, 0)
    for (const [file, n] of Object.entries(now).sort()) {
      if (was[file] || budget <= 0) continue
      kept[file] = Math.min(n, budget)
      budget -= kept[file]
    }
    next[rule.id] = Object.fromEntries(Object.entries(kept).filter(([, n]) => n > 0).sort())
  }
  writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n')
  const total = (b) => Object.values(b).reduce((a, r) => a + Object.values(r).reduce((x, y) => x + y, 0), 0)
  console.log(`check-guardrails: baseline written, total ${baseline ? total(baseline) : 0} -> ${total(next)}`)
  process.exit(0)
}

if (!baseline) {
  console.error('check-guardrails: no baseline; run with --update once')
  process.exit(1)
}

let failed = 0
let slack = 0
for (const rule of RULES) {
  for (const [file, n] of Object.entries(current[rule.id])) {
    const allowed = baseline[rule.id]?.[file] ?? 0
    if (n > allowed) {
      failed++
      console.error(`✗ ${rule.id} ${file}: ${n} (baseline ${allowed}) — ${rule.fix}`)
      for (const h of hits[`${rule.id} ${file}`]) console.error(`    ${file}:${h}`)
    }
  }
  for (const [file, allowed] of Object.entries(baseline[rule.id] ?? {}))
    if ((current[rule.id][file] ?? 0) < allowed) slack++
}

if (failed) {
  console.error(
    `check-guardrails: ${failed} finding(s) over baseline. Fix the code; raising the baseline needs a hand edit of scripts/guardrails-baseline.json that a reviewer can see.`
  )
  process.exit(1)
}
console.log(
  `check-guardrails: ok${slack ? ` (${slack} count(s) under baseline — run --update to lock the gain)` : ''}`
)
