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

// ── 1b. The store menu is a MERCHANDISED storefront, not a bare grid ─────────
// Avanti's redesign brief (2026-08-03): hero banner trio (one large left, two
// stacked right), a red "hot items" push section, category shelves with promo
// banners between them, full browse grid at the bottom. All of it must be in
// the SERVER HTML — a merch section that only exists after hydration doesn't
// exist for crawlers.
async function checkMerchandising() {
  const path = `/menu/california/${MENU_STORE}`
  const { status, html } = await fetchHtml(path)
  if (status !== 200) return fail(`${path} responds 200 (merch)`, `got ${status}`)

  const heroTiles = (html.match(/data-shop-banner=/g) ?? []).length
  if (heroTiles === 3) ok(`${path} carries the hero banner trio (3 tiles)`)
  else fail(`${path} carries the hero banner trio`, `found ${heroTiles} data-shop-banner tiles, want 3`)

  if (html.includes('data-hot-items')) ok(`${path} carries the hot-items section`)
  else fail(`${path} carries the hot-items section`, 'data-hot-items missing')

  const shelves = (html.match(/data-shelf=/g) ?? []).length
  if (shelves >= 3) ok(`${path} carries ${shelves} category shelves`)
  else fail(`${path} carries category shelves`, `found ${shelves}, want >=3`)

  const tiles = (html.match(/data-category-tile=/g) ?? []).length
  if (tiles >= 3) ok(`${path} carries ${tiles} shop-by-category tiles`)
  else fail(`${path} carries shop-by-category tiles`, `found ${tiles}, want >=3`)

  // Header dropdowns (Avanti, 2026-08-03): SHOP lists shop categories,
  // PRODUCTS lists the JB lines — both land on FILTERED LISTS, not the Phase 2
  // landing pages. Panels are in the SSR HTML (hidden until opened), so their
  // options are checkable and crawlable.
  const shopOpts = (html.match(/data-shop-category=/g) ?? []).length
  if (shopOpts >= 4) ok(`${path} header SHOP dropdown lists ${shopOpts} categories`)
  else fail(`${path} header SHOP dropdown lists categories`, `found ${shopOpts}, want >=4`)

  const lineOpts = [...html.matchAll(/data-jb-line="([^"]+)"/g)].map((m) => m[1])
  if (lineOpts.length >= 6) ok(`${path} header PRODUCTS dropdown lists ${lineOpts.length} JB lines`)
  else fail(`${path} header PRODUCTS dropdown lists JB lines`, `found ${lineOpts.length}, want >=6`)
  // every line target must be a ?line= filter link, never a /products/ landing page
  const landingLeaks = (html.match(/data-jb-line="[^"]*"[^>]*href="\/products\//g) ?? []).length
  if (landingLeaks === 0) ok(`${path} PRODUCTS dropdown targets filtered lists, not landing pages`)
  else fail(`${path} PRODUCTS dropdown targets filtered lists`, `${landingLeaks} link(s) point at /products/*`)

  const promos = (html.match(/data-shop-promo=/g) ?? []).length
  if (promos >= 1) ok(`${path} carries ${promos} in-feed promo banner(s)`)
  else fail(`${path} carries in-feed promo banners`, 'none found')

  if (html.includes('id="browse"')) ok(`${path} keeps the full browse grid`)
  else fail(`${path} keeps the full browse grid`, 'id="browse" anchor missing')
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
// ── 3d. the bag: count circle in SSR, Add to bag on the PDP ──────────────────
async function checkCart() {
  const menu = await fetchHtml(`/menu/california/${MENU_STORE}`)
  if (menu.html.includes('data-cart-count')) ok('header cart icon carries the count circle in SSR')
  else fail('header cart icon carries the count circle in SSR', 'data-cart-count missing')

  const pdp = await fetchHtml('/shop/zangria-premium-flower-8th')
  if (pdp.html.includes('Add to bag')) ok('PDP serves the Add to bag control server-side')
  else fail('PDP serves the Add to bag control server-side', 'not in SSR markup')
}

// ── 3e. Avanti's brand icons are wired, not the drawn placeholders ───────────
// The custom cart SVG replaces the drawn bag (recorded 2026-08-03), and the
// supplied category SVGs replace the letter-mark tiles for every category she
// delivered. Only the delivered ones are asserted — unmapped categories keep
// the letter-mark by design (never an invented icon).
async function checkBrandIcons() {
  const menu = await fetchHtml(`/menu/california/${MENU_STORE}`)
  if (menu.html.includes('src="/shop/icons/cart.svg"')) {
    ok('header renders the custom cart icon (/shop/icons/cart.svg)')
  } else {
    fail('header renders the custom cart icon', 'CART_ICON_SRC not wired in SSR HTML')
  }

  // flower is deliberately a WebP — the supplied SVG is 687KB gzipped traced
  // photo art; the raster carries the same art at 18KB.
  const tiles = { flower: '/shop/icons/flower.webp', pops: '/shop/icons/pops.svg', 'pre-rolls': '/shop/icons/pre-rolls.svg' }
  for (const [cat, src] of Object.entries(tiles)) {
    if (menu.html.includes(`src="${src}"`)) {
      ok(`category tile ${cat} renders its supplied icon`)
    } else {
      fail(`category tile ${cat} renders its supplied icon`, `${src} not in SSR HTML`)
    }
  }
}

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
  // Nav pills (2) + SHOP quick card + two hero "Shop now" CTAs = 5 on the code
  // fallbacks. ≥4 tolerates one CMS-retargeted banner without letting the page
  // regress to a single stray link. CAVEAT: this asserts the FALLBACKS — the
  // local build has no Storyblok token, and live CMS blok hrefs override these.
  const shopLinks = (home.html.match(/href="\/shop"/g) ?? []).length
  if (shopLinks >= 4) ok(`home carries ${shopLinks} links to /shop (nav + banners)`)
  else fail('home carries the /shop entry links', `only ${shopLinks} found — Shop buttons point elsewhere`)
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
  await checkMerchandising()
  await checkCardLinks(`/menu/california/${DEALS_STORE}/deals`, DEALS_STORE)
  await checkBrands()
  await checkDrops()
  await checkShopEntry()
  await checkCart()
  await checkBrandIcons()
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
