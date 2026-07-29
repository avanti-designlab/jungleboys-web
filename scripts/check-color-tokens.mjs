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
const BRAND = /^--(tw|tp|gt|pr|pops|hh|fl|strain)-/
const SKIP = new Set(['gt-fire.tsx', 'gt-snow.tsx'])

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
      const src = fs.readFileSync(p, 'utf8')
      for (const m of src.matchAll(/#[0-9a-fA-F]{6}/g)) {
        const hex = m[0].toLowerCase()
        if (tokens[hex]) hits.push(`${p}  ${hex} is ${tokens[hex]}`)
      }
    }
  }
})('components')

if (hits.length) {
  console.error(`${hits.length} hard-coded colour(s) duplicate a brand token:`)
  for (const h of [...new Set(hits)]) console.error('  ' + h)
  process.exit(1)
}
console.log('OK: no component hard-codes a value that is already a brand token')
