// Recorded decisions, as executable checks.
//
//   node scripts/check-invariants.mjs
//
// A decision written only in prose gets re-argued every gate and quietly rots
// when the code moves. Each check here corresponds to a ruling in CLAUDE.md and
// fails when the tree stops matching it. Add one whenever a decision is made
// that a future change could silently reverse.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

let failed = 0
const check = (name, ok, detail) => {
  process.stdout.write(`${ok ? '  ok  ' : '  FAIL'}  ${name}${detail ? '  — ' + detail : ''}\n`)
  if (!ok) failed++
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.next') walk(rel, out) }
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(rel)
  }
  return out
}
const SRC = [...walk('app'), ...walk('components'), ...walk('lib')]

console.log('\nrecorded decisions')

// ── Product Finder data stays in code (Avanti 2026-07-30, provisional) ───────
// The Supabase `retailers` table is deliberately unseeded. Querying it creates a
// second source of truth that disagrees with lib/product-finder/retailers.ts.
{
  const offenders = SRC.filter((f) => /from\(\s*['"]retailers['"]\s*\)/.test(read(f)))
  check('nothing queries the Supabase `retailers` table', offenders.length === 0, offenders.join(', '))
  const retailers = read('lib/product-finder/retailers.ts')
  check('the retailer list is still non-empty', (retailers.match(/"name":/g) || []).length > 50)
}

// ── Theme-invariance scope (Avanti 2026-07-30) ──────────────────────────────
// The dark sweep's exclusion list must track the real product-line routes, or
// the ruling silently covers the wrong set. CLAUDE.md said "ten" while the code
// had nine for some time, and nothing noticed.
{
  const routes = read('scripts/lib/routes.mjs')
  const invariant = [...routes.matchAll(/'\/products\/([a-z0-9-]+)'/g)].map((m) => m[1]).sort()
  const lines = [...read('lib/products.ts').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]).sort()
  check('routes.mjs THEME_INVARIANT === PRODUCT_LINES',
    JSON.stringify(invariant) === JSON.stringify(lines),
    `routes=${invariant.length} product_lines=${lines.length}`)
  const claude = read('CLAUDE.md')
  const claimsTen = /ten\s+`?\/products/i.test(claude) || /the ten .{0,24}line pages/i.test(claude)
  check(`CLAUDE.md's product-line count matches the code (${lines.length})`, !claimsTen || lines.length === 10,
    claimsTen ? `doc says "ten", code has ${lines.length}` : '')
}

// ── Blog raw-HTML path is gated on provenance, not shape (SEC-P2-24) ─────────
{
  const page = read('app/blog/[slug]/page.tsx')
  check('blog raw-HTML branch is gated on isSamplePost, not typeof',
    /isSamplePost\(slug\)\s*&&\s*typeof post\.body === 'string'/.test(page))
}

// ── Rate limiting keys on a value the client cannot choose (SEC-P2-XFF) ──────
{
  const route = read('app/api/lead/route.ts')
  check('/api/lead does not key its rate limiter on the FIRST x-forwarded-for entry',
    !/x-forwarded-for'\s*\)\s*\?\?\s*'unknown'\s*\)\s*\.split\(','\)\[0\]/.test(route))
}

console.log(`\n${failed ? `${failed} INVARIANT(S) BROKEN` : 'all recorded decisions hold'}\n`)
process.exit(failed ? 1 : 0)
