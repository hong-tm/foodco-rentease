#!/usr/bin/env node
// check-design — taste-rule lint, report-only (exit 0).
// Rules come from DESIGN.md (learn-taste 2026-11-12). It never rewrites code.
// Run from the repo root: node scripts/check-design.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'fc-front', 'src')
const UI = /components[/\\]ui[/\\]/

const lineRules = [
  {
    id: 'arbitrary-class',
    re: /\b(?:text|bg|border|rounded|w|h|min-w|max-w|p|m|gap|size)-\[[^\]]+\]/,
    why: 'no arbitrary values at call sites — use named type/spacing/radius tokens',
  },
  {
    id: 'faded-structural-border',
    re: /\bborder-(?:border|input|ring)\/\d{2}\b/,
    why: 'structural borders are fully opaque border-border, never /40-/80',
  },
  {
    id: 'raw-hex-class',
    re: /(?:bg|text|border|border-b|border-t|ring)-\[#[0-9a-fA-F]{3,8}\]/,
    why: 'colours come from tokens only, one --brand derives the rest',
  },
]

const fileRules = [
  {
    id: 'alert-dialog-on-delete',
    test: (src) => (src.includes('AlertDialog') ? (src.match(/AlertDialog/g) || []).length : 0),
    why: 'destructive ops execute immediately with a 5s countdown-ring undo toast; confirmation dialogs retire (migration tracker — count should fall toward 0)',
  },
  {
    id: 'font-mono-usage',
    test: (src) => (src.match(/font-mono/g) || []).length,
    why: 'font-mono is for IDs / UUIDs / reference codes only — review each use by hand',
  },
]

const files = []
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) {
      if (e !== 'node_modules') walk(p)
    } else if (/\.(tsx|ts|jsx|js)$/.test(e)) files.push(p)
  }
}
walk(SRC)

let total = 0
const summary = {}
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const rel = f.slice(ROOT.length + 1)
  const ui = UI.test(f)
  src.split('\n').forEach((line, i) => {
    for (const r of lineRules) {
      const m = line.match(r.re)
      if (m) {
        total++
        summary[r.id] = (summary[r.id] ?? 0) + 1
        console.log(`${r.id}${ui ? ' [ui-primitive]' : ''} ${rel}:${i + 1}: ${m[0]}`)
      }
    }
  })
  for (const r of fileRules) {
    const n = r.test(src)
    if (n > 0) {
      total += n
      summary[r.id] = (summary[r.id] ?? 0) + n
      console.log(`${r.id} ${rel}: ${n} use(s) — ${r.why}`)
    }
  }
}

console.log('---')
console.log(
  `check-design: ${total} findings ` +
    `(${Object.entries(summary).map(([k, v]) => `${k}=${v}`).join(', ') || 'clean'})`
)
console.log('Report-only. ui-primitive hits are shadcn stock files — fix app code first.')
