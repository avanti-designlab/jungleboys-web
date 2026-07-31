// Fails if a component hard-codes a colour that already exists as a BRAND token.
//
// Scoped to brand/line tokens deliberately. Theme-semantic tokens
// (--color-foreground, --color-on-accent, --color-background) are excluded:
// they flip between light and dark, so "this literal equals that token" is a
// match on VALUE, not on INTENT — substituting one for a stop that must stay a
// fixed colour silently breaks the other theme. Canvas simulations are skipped;
// they compute per-particle colour every frame and need numbers.
import fs from 'node:fs'
import path from 'node:path'

const css = fs.readFileSync('app/globals.css', 'utf8')
// Includes --color-* deliberately. The design gate found this regex was the
// hole: by never looking at --color-*, the checker certified 15 literal
// duplicates of single-declaration --color-* tokens — including three copies of
// #c21f1f, the exact value of --color-danger-solid, a token created in the same
// remediation pass the checker was supposed to be guarding. A checker that
// green-lights violations of the freeze rule it exists to enforce is worse than
// no checker, because it reads as a pass.
//
// The theme-varying guard below still applies: tokens declared more than once
// are skipped, so --color-accent-ink and friends cannot be mis-substituted.
// `rw` (rewards tier palette) added 2026-07-30. Without it this script would
// not have policed the tier tokens even after they were tokenised — the nine
// hexes it missed had already drifted across two files.
const BRAND = /^--(tw|tp|gt|pr|pops|hh|fl|rw|strain|color)-/
const SKIP = new Set(['gt-fire.tsx', 'gt-snow.tsx'])

// NOT ALL REMAINING HITS ARE FALSE POSITIVES — read this before dismissing the
// list. The design gate checked, and the `#fecf0e` hits are REAL: --color-accent
// is the brand yellow, declared once, identical in both themes, and meaning-
// equal at every one of those sites. It also disproved the mechanical objection
// — `var()` DOES resolve in SVG `fill`/`stroke`/`stop-color` in this Chrome.
// Genuinely exempt classes, which should be encoded here rather than argued in
// prose: (a) the literal is the right-hand side of a custom-property DEFINITION
// rather than a consumption; (b) design-check, whose job is to print token
// hexes; (c) GSAP tween targets, which cannot interpolate a var() string — the
// same exemption the canvas sims already have.
//
// READ THE SUGGESTION BEFORE APPLYING IT. This tool matches on VALUE, and
// value-equal is not meaning-equal. It will offer --color-surface-light for a
// white text fill or SVG stroke; a surface token is not a text colour, and
// swapping it there is the same class of error as the --color-accent-ink
// incident below — right hex, wrong concept. Fix the ones where the token
// genuinely names what the literal is FOR; leave the rest and say why.

// A token declared with DIFFERENT values under different theme selectors can
// never stand in for a fixed literal — substituting it silently changes the
// colour in one theme. --color-accent-ink is the cautionary tale: #8a6a00 in
// light, #fecf0e in dark. Mapping the brand yellow onto it turned the loading
// screen dark gold in light mode. So: count declarations per token, and only
// trust the ones declared exactly once.
const declCount = {}
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  declCount['--' + m[1]] = (declCount['--' + m[1]] || 0) + 1
}

const tokens = {}
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  const name = '--' + m[1]
  if (!BRAND.test(name)) continue
  if (declCount[name] > 1) continue            // theme-varying: not substitutable
  if (!(m[2].toLowerCase() in tokens)) tokens[m[2].toLowerCase()] = name
}

const hits = []
;(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.tsx?$/.test(f) && !SKIP.has(f)) {
      // Strip comments first. A checker that flags its own documentation —
      // "this used to be #6f9bff" — is a checker people learn to ignore.
      const src = fs.readFileSync(p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
      for (const m of src.matchAll(/#[0-9a-fA-F]{6}/g)) {
        const hex = m[0].toLowerCase()
        if (tokens[hex]) hits.push(`${p}  ${hex} is ${tokens[hex]}`)
      }
    }
  }
})('components')
;(function walkApp(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) walkApp(p)
    else if (/\.tsx?$/.test(f)) {
      const src = fs.readFileSync(p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
      for (const m of src.matchAll(/#[0-9a-fA-F]{6}/g)) {
        const hex = m[0].toLowerCase()
        if (tokens[hex]) hits.push(`${p}  ${hex} is ${tokens[hex]}`)
      }
    }
  }
})('app')

if (hits.length) {
  console.error(`${hits.length} hard-coded colour(s) duplicate a brand token:`)
  for (const h of [...new Set(hits)]) console.error('  ' + h)
  process.exit(1)
}
console.log('OK: no component hard-codes a value that is already a brand token')
