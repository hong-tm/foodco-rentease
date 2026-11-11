// Guard against the CSS minifier silently dropping keyframe frames.
//
// Failure mode (seen in production, PR #18 -> #19): a keyframes declaration
// the minifier cannot compute for the configured browser targets (e.g.
// color-mix() referencing var()) is dropped wholesale. The animation then
// degenerates (transparent animating to transparent) while every build is
// green. This check compares the built css against src/index.css.
//
// Contract: for every --animate-* token the source declares, IF the built
// css uses that utility class, THEN the keyframes it names must exist with
// at least as many frame selectors as the source block declares. Keyframes
// the source does not define (plugin provided, e.g. spin with a legitimate
// single to-frame) are only checked for presence.
//
// Run after a build: node scripts/check-keyframes.mjs   (exit 1 = lost frames)

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const fcFront = dirname(dirname(fileURLToPath(import.meta.url)))
const srcCss = readFileSync(join(fcFront, 'src/index.css'), 'utf8')
const assetsDir = resolve(fcFront, '../fc-back/webpage/assets')
const builtCss = readdirSync(assetsDir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(assetsDir, f), 'utf8'))
  .join('\n')

if (!builtCss) {
  console.error(
    'check-keyframes: no built css found (run pnpm -C fc-front build first)',
  )
  process.exit(1)
}

function frameCount(haystack, name) {
  // Locate "@keyframes <name>" without regex-string escapes: find the
  // declaration, skip to its opening brace, then brace-walk the block.
  const decl = '@keyframes '
  let at = haystack.indexOf(decl + name)
  while (at !== -1) {
    const after = at + decl.length + name.length
    const ch = haystack[after]
    if (
      ch === undefined ||
      ch === '{' ||
      ch === ' ' ||
      ch === '\n' ||
      ch === '\t' ||
      ch === '\r'
    )
      break
    at = haystack.indexOf(decl + name, after)
  }
  if (at === -1) return undefined
  const open = haystack.indexOf('{', at)
  if (open === -1) return undefined
  let depth = 1
  let i = open + 1
  while (i < haystack.length && depth > 0) {
    if (haystack[i] === '{') depth++
    else if (haystack[i] === '}') depth--
    i++
  }
  const body = haystack.slice(open + 1, i - 1)
  return (body.match(/(?:^|})\s*(?:from|to|\d+(?:\.\d+)?%)\s*\{/g) || []).length
}

const failures = []
let checked = 0

for (const m of srcCss.matchAll(/--animate-([\w-]+)\s*:\s*([\w-]+)/g)) {
  const slug = m[1]
  const kf = m[2]
  if (kf === 'none') continue
  if (!builtCss.includes('.animate-' + slug)) continue // utility tree-shaken

  checked++
  const srcFrames = frameCount(srcCss, kf)
  const builtFrames = frameCount(builtCss, kf)
  const required = srcFrames === undefined ? 1 : srcFrames

  if (builtFrames === undefined) {
    failures.push(
      '--animate-' +
        slug +
        ' is used but "@keyframes ' +
        kf +
        '" is missing from the built css',
    )
  } else if (builtFrames < required) {
    failures.push(
      '"@keyframes ' +
        kf +
        '" has ' +
        builtFrames +
        ' frame selector(s) in the build but ' +
        required +
        ' in src/index.css — the minifier likely dropped a declaration it could not compute',
    )
  }
}

if (failures.length > 0) {
  console.error('check-keyframes: FAILED\n  ' + failures.join('\n  '))
  process.exit(1)
}
console.log(
  'check-keyframes: ok (' + checked + ' used animate token(s) verified)',
)
