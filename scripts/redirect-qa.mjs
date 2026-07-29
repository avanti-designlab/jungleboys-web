// Redirect QA — every old_url in seo/url-inventory.csv must resolve to a
// single-hop 200, or a single 301 that lands on a 200. No chains.
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

let fails = 0
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
      cur = loc.replace(BASE, '')
      continue
    }
    break
  }
  const hops = chain.length
  const ok = (hops === 0 && status === 200) || (hops === 1 && status === 200)
  const perm = chain.every((c) => c.includes('-301->'))
  if (!ok || (hops === 1 && !perm)) {
    fails++
    console.log(`FAIL  ${u}  hops=${hops} final=${status}  ${chain.join(' | ')}`)
  } else {
    console.log(`ok    ${u}  hops=${hops} final=${status}${hops ? '  ' + chain.join(' | ') : ''}`)
  }
}
console.log(`\n${urls.length} urls, ${fails} failures`)
process.exit(fails ? 1 : 0)
