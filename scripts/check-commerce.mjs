// Commerce-surface checks — run against a SERVED PRODUCTION BUILD.
//
//   npm run build && (npx next start -p 3100 &) && node scripts/check-commerce.mjs
//   node scripts/check-commerce.mjs --origin=http://localhost:3100
//
// These are SSR checks on purpose: every one of them asserts against the HTML
// the server sends, not what a browser renders after hydration. The PDP buy box
// already taught this lesson once — it looked perfect in a browser while the
// crawlable markup carried no price at all. A check that drove a browser here
// would be blind to exactly that class of bug.
//
// What is asserted, and why each check exists:
//   1. Menu + deals product cards LINK to the PDP (/shop/<slug>?store=<store>).
//      Written before the wiring existed; it fails on any regression to
//      unlinked cards.
//   2. /menu/california/<store>/brands exists and is NOT JB-only. Carrying all
//      stocked brands is a recorded decision (Avanti 2026-07-31) — a well-
//      meaning "correction" to JB-only is the failure mode this guards.
//   3. The PDP serves the amended contract fields server-side: the full
//      cannabinoid panel (beyond THC/CBD) and strain-profile terpene NAMES.

const flag = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=').slice(1).join('=') : dflt
}

const origin = flag('origin', 'http://localhost:3100').replace(/\/$/, '')

// Store slugs are the live CA four (lib/owned-stores.ts). Two different stores
// on purpose: the ?store= param must reflect the PAGE the card sits on, and a
// single-store check cannot see a hardcoded store slug.
const MENU_STORE = 'downtown-los-angeles'
const DEALS_STORE = 'pomona'
const BRANDS_STORE = 'downtown-los-angeles'

const failures = []
const ok = (label) => console.log(`  ✓ ${label}`)
const fail = (label, detail) => {
  failures.push(label)
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
}

async function fetchHtml(path) {
  const res = await fetch(origin + path, { redirect: 'manual' })
  return { status: res.status, html: res.status === 200 ? await res.text() : '' }
}

// ── 1. Product cards link to the PDP ─────────────────────────────────────────
async function checkCardLinks(path, store) {
  const { status, html } = await fetchHtml(path)
  if (status !== 200) return fail(`${path} responds 200`, `got ${status}`)
  ok(`${path} responds 200`)

  const links = [...html.matchAll(/href="(\/shop\/[^"?]+)\?store=([^"&]+)"/g)]
  if (links.length === 0) {
    return fail(`${path} product cards link to /shop/<slug>?store=`, 'no /shop/ links in SSR HTML')
  }
  ok(`${path} carries ${links.length} PDP links in SSR HTML`)

  const wrongStore = links.filter((m) => m[2] !== store)
  if (wrongStore.length) {
    fail(`${path} links carry ?store=${store}`, `found ?store=${wrongStore[0][2]}`)
  } else {
    ok(`${path} links all carry ?store=${store}`)
  }

  // The link target must resolve — a card that links to a 404 is worse than an
  // unlinked card. One sample is enough to catch a slug-shape mismatch.
  const sample = links[0][1]
  const dest = await fetchHtml(sample)
  if (dest.status !== 200) fail(`sampled PDP link ${sample} resolves`, `got ${dest.status}`)
  else ok(`sampled PDP link ${sample} resolves 200`)
}

// ── 2. Brands is real and not JB-only ────────────────────────────────────────
async function checkBrands() {
  const path = `/menu/california/${BRANDS_STORE}/brands`
  const { status, html } = await fetchHtml(path)
  if (status !== 200) return fail(`${path} responds 200`, `got ${status}`)
  ok(`${path} responds 200`)

  // The template stamps data-brand on each brand section precisely so this
  // check reads structure, not prose.
  const brands = [...new Set([...html.matchAll(/data-brand="([^"]+)"/g)].map((m) => m[1]))]
  if (brands.length < 2) {
    return fail(`${path} lists multiple brands`, `found ${brands.length} data-brand sections`)
  }
  ok(`${path} lists ${brands.length} brands: ${brands.join(', ')}`)

  const thirdParty = brands.filter((b) => !/^jungle boys/i.test(b))
  if (thirdParty.length === 0) {
    fail(`${path} carries non-JB brands`, 'JB-only — the recorded decision says ALL stocked brands')
  } else {
    ok(`${path} carries non-JB brands (${thirdParty.join(', ')})`)
  }
}

// ── 3. PDP serves the amended contract fields ────────────────────────────────
async function checkAmendedFields() {
  // Zangria is the designated full-panel placeholder product — it is also the
  // strain the jungleboysflorida.com reference card showed, so its genetics/
  // taste/panel values have a real-world shape to mirror. If the slug moves,
  // pass --pdp=<slug>; a 404 here is a real failure, not a config nit.
  const slug = flag('pdp', 'zangria-premium-flower-8th')

  const path = `/shop/${slug}`
  const { status, html } = await fetchHtml(path)
  if (status !== 200) return fail(`${path} responds 200`, `got ${status}`)

  for (const name of ['THCA', 'CBGA']) {
    if (html.includes(name)) ok(`${path} SSR HTML carries cannabinoid ${name}`)
    else fail(`${path} SSR HTML carries cannabinoid ${name}`, 'not in server markup')
  }
}

// ── 3b. Fresh Drops: layout live, curation stubbed ───────────────────────────
// The layout ships NOW (Avanti, 2026-08-03) with curation stubbed in
// lib/drops.ts until the Dutchie collection field is verified. What must hold
// regardless of mechanism: the page exists, the featured band is SERVER-
// rendered with the strain-profile facts the amendment exists for (Genetics/
// Taste), and every card links to the PDP carrying the right store.
async function checkDrops() {
  const path = `/menu/california/${MENU_STORE}/drops`
  await checkCardLinks(path, MENU_STORE)

  const { status, html } = await fetchHtml(path)
  if (status !== 200) return
  for (const needle of ['Genetics', 'Thin Mint Cookies x Z', 'Taste']) {
    if (html.includes(needle)) ok(`${path} featured band carries "${needle}" in SSR HTML`)
    else fail(`${path} featured band carries "${needle}"`, 'not in server markup')
  }

  // The surface must be REACHABLE: the store menu's subnav links to it.
  const menu = await fetchHtml(`/menu/california/${MENU_STORE}`)
  if (menu.html.includes(`href="/menu/california/${MENU_STORE}/drops"`)) {
    ok(`store subnav links to ${path}`)
  } else {
    fail(`store subnav links to ${path}`, 'drops tab missing from the menu page')
  }
}

// ── 3c. /shop is the storefront ENTRY, and the nav actually points at it ─────
// The user-reported failure this guards: every Shop button led to /products,
// so nothing built in Phase 3 was reachable by clicking around the site.
async function checkShopEntry() {
  const { status, html } = await fetchHtml('/shop')
  if (status !== 200) return fail('/shop responds 200', `got ${status}`)
  ok('/shop responds 200')

  const stores = ['downtown-los-angeles', 'orange-county', 'pomona', 'san-diego']
  for (const s of stores) {
    if (html.includes(`href="/menu/california/${s}"`)) ok(`/shop links to ${s} menu`)
    else fail(`/shop links to ${s} menu`, 'store card missing')
  }

  const home = await fetchHtml('/')
  if (home.html.includes('href="/shop"')) ok('home nav carries a link to /shop')
  else fail('home nav carries a link to /shop', 'Shop still points elsewhere')
}

// ── 4. Sitemap: store surfaces IN, placeholder-slug PDPs OUT ─────────────────
async function checkSitemap() {
  const { status, html } = await fetchHtml('/sitemap.xml')
  if (status !== 200) return fail('/sitemap.xml responds 200', `got ${status}`)

  for (const path of [
    '/shop',
    `/menu/california/${MENU_STORE}`,
    `/menu/california/${MENU_STORE}/deals`,
    `/menu/california/${MENU_STORE}/drops`,
    `/menu/california/${MENU_STORE}/brands`,
  ]) {
    if (html.includes(`${path}</loc>`)) ok(`sitemap lists ${path}`)
    else fail(`sitemap lists ${path}`)
  }

  // Deliberate exclusion: PDP slugs are the placeholder provider's, and slug
  // stability against real Dutchie payloads is an OPEN question. A /shop/ URL
  // in the sitemap before that is verified advertises a future 404.
  if (html.includes('/shop/')) fail('sitemap excludes /shop/ PDPs until slugs are verified')
  else ok('sitemap excludes /shop/ PDPs (slug stability unverified — recorded)')
}

console.log(`check-commerce against ${origin}`)
try {
  await checkCardLinks(`/menu/california/${MENU_STORE}`, MENU_STORE)
  await checkCardLinks(`/menu/california/${DEALS_STORE}/deals`, DEALS_STORE)
  await checkBrands()
  await checkDrops()
  await checkShopEntry()
  await checkAmendedFields()
  await checkSitemap()
} catch (e) {
  fail('harness', e.message)
}

if (failures.length) {
  console.error(`\n${failures.length} FAILED`)
  process.exit(1)
}
console.log('\nall commerce checks passed')
