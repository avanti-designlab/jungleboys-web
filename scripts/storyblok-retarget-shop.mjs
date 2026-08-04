// Phase 3 Storyblok pass — run once, idempotent:
//
//   1. HOME story: any hero_slide / quick_card whose href is EXACTLY
//      "/products" is retargeted to "/shop" (Avanti, 2026-08-03: every Shop
//      button lands on the storefront entry). Deeper /products/* links are
//      deliberately untouched — that is the curated collection, not the shop.
//   2. Ensures the shop_banner / shop_promo components exist (from
//      content/models/*.json) and creates the `shop` story if missing, with
//      TEXT fields prefilled from the code fallbacks and IMAGE fields left
//      empty — a Storyblok asset field is a real upload or nothing (the home
//      story's stale-path trap, recorded 2026-07-30); the per-field overlay
//      keeps serving the code images until real uploads land.
//
// Needs WRITE access, so you provide the token (never shared/committed):
//   STORYBLOK_MANAGEMENT_TOKEN=xxxxx node scripts/storyblok-retarget-shop.mjs
//
// Nothing is published without --publish; add it to publish home + shop after
// reviewing the draft in the Storyblok UI.

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE = process.env.STORYBLOK_SPACE_ID || '293954269213768'
const MAPI = process.env.STORYBLOK_MAPI || 'https://mapi.storyblok.com/v1'
const PUBLISH = process.argv.includes('--publish')

if (!TOKEN) {
  console.error('✗ Set STORYBLOK_MANAGEMENT_TOKEN (Storyblok → Account → Personal access tokens).')
  process.exit(1)
}

const HOSTS = [MAPI, 'https://api-us.storyblok.com/v1', 'https://api-ca.storyblok.com/v1', 'https://api-ap.storyblok.com/v1']
let host = null

const call = (h, method, url, body) =>
  fetch(`${h}/spaces/${SPACE}${url}`, {
    method,
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

const api = async (method, url, body) => {
  const candidates = host ? [host] : HOSTS
  let res
  for (const h of candidates) {
    res = await call(h, method, url, body)
    if (res.status === 401 && !host && h !== candidates[candidates.length - 1]) continue
    host = h
    break
  }
  if (!res.ok) {
    const txt = await res.text()
    if (res.status === 401)
      throw new Error('401 Unauthorized. Regenerate the token with "Full user permission" toggled ON.')
    throw new Error(`${method} ${url} → ${res.status} ${txt}`)
  }
  return res.status === 204 ? null : res.json()
}

// ── 1) retarget home banner hrefs ────────────────────────────────────────────
async function retargetHome() {
  const { stories } = await api('GET', '/stories?with_slug=home')
  if (!stories?.length) throw new Error('home story not found')
  const { story } = await api('GET', `/stories/${stories[0].id}`)

  let changed = 0
  for (const blok of story.content?.body ?? []) {
    if ((blok.component === 'hero_slide' || blok.component === 'quick_card') && blok.href === '/products') {
      console.log(`  home: ${blok.component} "${blok.title ?? ''}" /products → /shop`)
      blok.href = '/shop'
      changed++
    }
    // The monthly deals slide rolls over (Avanti, 2026-08-04): "AUGUST DEALS",
    // pointed at the evergreen /deals door (routes visitors to their store's
    // live deals). Matches by title so a re-run after a manual rename is a
    // clean no-op.
    if (blok.component === 'hero_slide' && /^july deals$/i.test(blok.title ?? '')) {
      console.log(`  home: hero_slide "JULY DEALS" → "AUGUST DEALS", href ${blok.href} → /deals`)
      blok.title = 'AUGUST DEALS'
      blok.href = '/deals'
      changed++
    } else if (blok.component === 'hero_slide' && /^august deals$/i.test(blok.title ?? '') && blok.href !== '/deals') {
      console.log(`  home: hero_slide "AUGUST DEALS" href ${blok.href} → /deals`)
      blok.href = '/deals'
      changed++
    }
  }
  if (!changed) {
    console.log('  home: nothing to retarget (no exact /products hrefs)')
    return
  }
  await api('PUT', `/stories/${story.id}`, { story: { content: story.content }, ...(PUBLISH ? { publish: 1 } : {}) })
  console.log(`  home: ${changed} href(s) retargeted${PUBLISH ? ' + published' : ' (draft — review then publish)'}`)
}

// ── 2) components + shop story ───────────────────────────────────────────────
async function syncComponent(name) {
  const raw = JSON.parse(await readFile(path.join(process.cwd(), 'content/models', `${name}.json`), 'utf8'))
  const { components } = await api('GET', '/components')
  const existing = components.find((c) => c.name === name)
  if (existing) await api('PUT', `/components/${existing.id}`, { component: raw })
  else await api('POST', '/components', { component: raw })
  console.log(`  component ${name}: ok`)
}

// Text fields mirror lib/shop-banners.ts fallbacks; images stay empty on
// purpose (see header comment). Keep the two in sync by hand — the fallbacks
// are the source of truth for evergreen copy.
const HERO = [
  { kicker: 'Every Friday', title: 'Fresh Drops', cta: 'See this week’s drop', href: '@store/drops' },
  { kicker: 'Live discounts', title: 'Deals', cta: 'Shop deals', href: '@store/deals' },
  { kicker: 'Playing with fire', title: 'PWF Rewards', cta: 'Earn on every visit', href: '/rewards' },
]
const PROMOS = [
  { kicker: 'The collection', title: 'Jungle Boys lines', cta: 'Explore the lines', href: '/products' },
]

// Drops page CMS slot (Avanti, 2026-08-04): a `drops` story whose drops_hero
// blok carries the Strain-of-the-Week backdrop image. Created EMPTY — the
// tile has a designed fallback, and assets must be real uploads (asset trap).
async function ensureDropsStory() {
  const { stories } = await api('GET', '/stories?with_slug=drops')
  if (stories?.length) {
    console.log('  drops story: already exists — not touched')
    return
  }
  await api('POST', '/stories', {
    story: { name: 'Drops', slug: 'drops', content: { component: 'drops', body: [{ component: 'drops_hero', alt: '' }] } },
    ...(PUBLISH ? { publish: 1 } : {}),
  })
  console.log(`  drops story: created (empty backdrop slot)${PUBLISH ? ' + published' : ' (draft)'}`)
}

async function ensureShopStory() {
  const { stories } = await api('GET', '/stories?with_slug=shop')
  if (stories?.length) {
    console.log('  shop story: already exists — not touched')
    return
  }
  const body = [
    ...HERO.map((b) => ({ component: 'shop_banner', ...b, alt: '' })),
    ...PROMOS.map((b) => ({ component: 'shop_promo', ...b, alt: '' })),
  ]
  await api('POST', '/stories', {
    story: { name: 'Shop', slug: 'shop', content: { component: 'shop', body } },
    ...(PUBLISH ? { publish: 1 } : {}),
  })
  console.log(`  shop story: created (3 hero + ${PROMOS.length} promos)${PUBLISH ? ' + published' : ' (draft)'}`)
}

console.log(`storyblok-retarget-shop → space ${SPACE}${PUBLISH ? ' (publishing)' : ' (draft only)'}`)
await retargetHome()
await syncComponent('shop_banner')
await syncComponent('shop_promo')
await syncComponent('shop')
await syncComponent('drops_hero')
await syncComponent('drops')
await ensureShopStory()
await ensureDropsStory()
console.log('done')
