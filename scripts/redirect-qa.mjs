// Redirect QA — every old_url in seo/url-inventory.csv must resolve to a
// single-hop 200, or a single permanent redirect that lands on a 200. No chains.
//
// Next emits 308 for `permanent: true`, never 301: 308 preserves the request
// method where 301 lets a user agent rewrite POST to GET. Google treats the two
// identically for consolidation. An earlier version of this script asserted
// '-301->' and therefore reported FAIL for every correctly-configured redirect
// in the map — a gate that fails on its own passing condition gates nothing.
// 307 is the temporary form, used deliberately by the interim deal/drop rules.
import { readFileSync } from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:3222'
const CSV = new URL('../seo/url-inventory.csv', import.meta.url)

const rows = readFileSync(CSV, 'utf8').split('\n').slice(1).filter(Boolean)
const urls = [...new Set(rows.map((r) => r.split(',')[0].trim()).filter((u) => u.startsWith('/')))]

// Phase-2 surfaces + the two live placeholders, checked explicitly too.
const EXTRA = [
  '/products', '/products/hash-hole', '/products/twins', '/products/all-in-one',
  '/products/pops', '/products/premium-flower', '/products/pre-rolls',
  '/products/10-pack-prerolls', '/products/rosin', '/products/orc',
]
for (const u of EXTRA) if (!urls.includes(u)) urls.push(u)

// The Phase-3 exemption list is RETIRED (2026-11-12, pre-cutover run): the
// menus, auth suite and profile shells all exist now, and its own note said
// the pending bucket "MUST be green before cutover". Nothing is excused any
// more: a redirect either resolves correctly, is a DECLARED interim above, or
// fails the run.
const isPending = () => false

// Redirects where TEMPORARY is the correct answer, each with the reason it is.
// Everything else must be 301/308: a legacy URL that has to transfer its signal
// cannot do it through a 307, and the /verify ruling turns entirely on that
// distinction. Declared here rather than accepted silently — an undeclared
// temporary redirect is now a failure, and an entry here that stops being
// temporary is a failure too, so this list cannot rot into a rubber stamp.
const INTERIM_TEMPORARY = {
  '/710-deals': 'seasonal deal page — rotates back into use, so it is not gone',
  '/420-deals': 'seasonal deal page — rotates back into use',
  '/april-deals': 'seasonal deal page — rotates back into use',
  '/may-deals': 'seasonal deal page — rotates back into use',
  '/june-deals': 'seasonal deal page — rotates back into use',
  '/about': 'inventory still intends a real /about; 308 would say it is never coming back',
  '/420-pre-game': 'seasonal deal page — rotates back into use (2026-09-08)',
}
// Pattern-declared interim: Florida menus 307 to jungleboysflorida.com by
// ruling (Avanti, 2026-09-25: "leaving as is for now") — deliberately NOT
// permanent so FL embed shells can return without an SEO fight.
const INTERIM_PATTERNS = [
  [/^\/menu\/florida\//, 'FL shops off-site for launch; temporary by ruling 2026-09-25'],
]
const interimReason = (u) =>
  Object.prototype.hasOwnProperty.call(INTERIM_TEMPORARY, u)
    ? INTERIM_TEMPORARY[u]
    : (INTERIM_PATTERNS.find(([re]) => re.test(u)) || [])[1]

// robots.txt is part of redirect correctness, not a separate concern: a
// disallowed URL's redirect is never fetched, so the two rules interact.
const robotsTxt = await fetch(BASE + '/robots.txt').then((r) => r.text()).catch(() => '')
const DISALLOWED = robotsTxt
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^disallow:/i.test(l))
  .map((l) => l.split(':').slice(1).join(':').trim())
  .filter(Boolean)
const isDisallowed = (u) => DISALLOWED.some((d) => d !== '/' && u.startsWith(d.replace(/\*$/, '')))

let fails = 0
let pending = 0
for (const u of urls) {
  const chain = []
  let cur = u
  let status = 0
  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(BASE + cur, { redirect: 'manual' })
    status = res.status
    if (status >= 300 && status < 400) {
      const loc = res.headers.get('location')
      chain.push(`${cur} -${status}-> ${loc}`)
      // an OFF-SITE destination is a terminal state, not a hop to follow —
      // the FL menus 308 to jungleboysflorida.com by ruling (2026-09-08)
      if (/^https?:\/\//.test(loc) && !loc.startsWith(BASE)) {
        status = 200
        break
      }
      cur = loc.replace(BASE, '')
      continue
    }
    break
  }
  const hops = chain.length
  const ok = hops <= 1 && status === 200
  // 301/308 ONLY. This used to accept 307 under a variable named `permanent`,
  // which meant the script guarding the redirect map could not fail the single
  // property the /verify ruling turns on: a 307 tells Google the URL is coming
  // back, and it is not. Every legacy URL that must transfer its signal has to
  // be permanent; a temporary redirect here is a silent ranking loss.
  const declaredInterim = interimReason(u) !== undefined
  const permanent = declaredInterim
    ? chain.every((c) => c.includes('-307->') || c.includes('-302->'))
    : chain.every((c) => c.includes('-308->') || c.includes('-301->'))
  // A redirect Googlebot is forbidden to fetch is never followed, so a URL that
  // is BOTH disallowed and redirected is the "indexed though blocked" recipe —
  // and the old script printed a green ok for exactly that.
  const blocked = isDisallowed(u)
  const good = ok && (hops === 0 || permanent) && !(hops > 0 && blocked)

  if (good) {
    const tag = declaredInterim ? 'interim' : 'ok    '
    console.log(`${tag}  ${u}  hops=${hops} final=${status}${hops ? '  ' + chain.join(' | ') : ''}${declaredInterim ? '  — ' + interimReason(u) : ''}`)
  } else if (isPending(u)) {
    pending++
    console.log(`PENDING ${u}  hops=${hops} final=${status}  ${chain.join(' | ')}  (Phase 3)`)
  } else {
    fails++
    console.log(`FAIL    ${u}  hops=${hops} final=${status}  ${chain.join(' | ')}`)
  }
}
console.log(`\n${urls.length} urls, ${fails} failures, ${pending} pending Phase 3`)
process.exit(fails ? 1 : 0)
