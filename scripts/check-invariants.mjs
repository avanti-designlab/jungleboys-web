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

// ── Blog raw-HTML path is gated on OBJECT provenance (SEC-P2-24, 2nd pass) ───
// Gating on isSamplePost(slug) was not provenance: it tests the route param,
// and getBlogPost() queries Storyblok BEFORE falling back, so a CMS story
// published at `blog/july-deals-are-live` shadowed the sample and inherited its
// trust. The flag must travel on the object the CMS cannot set.
{
  const page = read('app/blog/[slug]/page.tsx')
  check('blog raw-HTML branch gates on post.trustedHtml, not the slug',
    /post\.trustedHtml === true\s*&&\s*typeof post\.body === 'string'/.test(page))
  check('blog raw-HTML branch does NOT gate on isSamplePost(slug)',
    !/rawIsTrusted\s*=\s*isSamplePost\(slug\)/.test(page))
  const blog = read('lib/blog.ts')
  check('trustedHtml is set only on the hardcoded SAMPLE_POSTS',
    (blog.match(/trustedHtml: true,/g) || []).length === 3
      && blog.indexOf('trustedHtml: true,') > blog.indexOf('const SAMPLE_POSTS'))
}

// ── `class` is not an allowed richtext attribute at all ─────────────────────
// A value-denylist lost twice: ^-anchored, so Tailwind variant prefixes
// (md:absolute, md:w-full) walked past it, and it only knew Tailwind, so
// component classes carrying their own z-index were borrowable by name.
{
  const rt = read('lib/richtext-safe.ts')
  const allowed = rt.slice(rt.indexOf('const ALLOWED_ATTRS'), rt.indexOf('])', rt.indexOf('const ALLOWED_ATTRS')))
  check("richtext ALLOWED_ATTRS does not contain 'class'", !/'class'/.test(allowed))
}

// ── Rate limiting keys on a value the client cannot choose (SEC-P2-XFF) ──────
{
  const route = read('app/api/lead/route.ts')
  check('/api/lead does not key its rate limiter on the FIRST x-forwarded-for entry',
    !/x-forwarded-for'\s*\)\s*\?\?\s*'unknown'\s*\)\s*\.split\(','\)\[0\]/.test(route))
}

// ── A local run cannot write to the production consent ledger ───────────────
// .env.local holds live keys; five fabricated consents were written from a
// laptop before this guard existed and had to be deleted by hand.
{
  const route = read('app/api/lead/route.ts')
  const guarded = /!process\.env\.VERCEL_ENV\s*&&\s*process\.env\.ALLOW_LOCAL_LEAD_WRITES !== 'true'/.test(route)
  const beforeInsert = route.indexOf('ALLOW_LOCAL_LEAD_WRITES') < route.indexOf(".from('leads')\n    .insert")
    || route.indexOf('ALLOW_LOCAL_LEAD_WRITES') < route.indexOf('.insert(')
  check('/api/lead refuses to write the consent ledger from a local run', guarded && beforeInsert)
}

console.log(`\n${failed ? `${failed} INVARIANT(S) BROKEN` : 'all recorded decisions hold'}\n`)
process.exit(failed ? 1 : 0)
