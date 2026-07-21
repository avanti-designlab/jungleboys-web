// One-time Storyblok setup — creates the JB content-type blocks and pre-fills the
// Home story with the current banners/deals so they're immediately editable.
//
// Run it yourself (it needs WRITE access, so you provide the token — never shared):
//   1. Storyblok → https://app.storyblok.com/#/me/account?tab=token → create a
//      "Personal access token".
//   2. In this folder:  STORYBLOK_MANAGEMENT_TOKEN=xxxxx node scripts/storyblok-setup.mjs
//   (Space id defaults to jungleboys-web; override with STORYBLOK_SPACE_ID / _MAPI.)
//
// Idempotent: re-running updates the blocks and refreshes the Home story.

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN
const SPACE = process.env.STORYBLOK_SPACE_ID || '293954269213768'
const MAPI = process.env.STORYBLOK_MAPI || 'https://mapi.storyblok.com/v1'
const SITE = process.env.STORYBLOK_ASSET_BASE || 'https://jungleboys-web.vercel.app'

if (!TOKEN) {
  console.error('✗ Set STORYBLOK_MANAGEMENT_TOKEN (Storyblok → Account → Personal access tokens).')
  process.exit(1)
}

// Try the given management host, then other regions if it returns 401 (region
// mismatch looks like Unauthorized). Cache whichever host authorizes.
const HOSTS = [MAPI, 'https://api-us.storyblok.com/v1', 'https://api-ca.storyblok.com/v1', 'https://api-ap.storyblok.com/v1']
let host = null

const call = async (h, method, url, body) =>
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
    if (res.status === 401 && !host && h !== candidates[candidates.length - 1]) continue // wrong region → try next
    host = h
    break
  }
  if (!res.ok) {
    const txt = await res.text()
    if (res.status === 401)
      throw new Error(`401 Unauthorized. The token lacks access — regenerate it with "Full user permission" toggled ON (green).`)
    throw new Error(`${method} ${url} → ${res.status} ${txt}`)
  }
  return res.status === 204 ? null : res.json()
}

// ── 1) create/update the content-type blocks from content/models/*.json ──────
async function syncComponents() {
  const dir = path.join(process.cwd(), 'content/models')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
  const { components: existing } = await api('GET', '/components')
  const byName = new Map(existing.map((c) => [c.name, c.id]))

  for (const file of files) {
    const model = JSON.parse(await readFile(path.join(dir, file), 'utf-8'))
    const payload = { component: model }
    const id = byName.get(model.name)
    if (id) {
      await api('PUT', `/components/${id}`, payload)
      console.log(`  ↻ updated block: ${model.name}`)
    } else {
      await api('POST', '/components', payload)
      console.log(`  ＋ created block: ${model.name}`)
    }
  }
}

// ── 2) pre-fill the Home story with the current banners/deals ────────────────
// (inline copy of lib/home-content.ts defaults so this runs with plain `node`)
const CDN = 'https://cdn.prod.website-files.com/6981ad8672f6252d7d7bb320'
const HERO_SLIDES = [
  { kicker: 'JULY 13–31', title: 'JULY DEALS', cta: 'Learn more', href: '/710-deals', image: '/hero/july-deals-fireworks.jpg', imageMobile: '/hero/july-deals-mobile.jpg', alt: 'Fourth of July fireworks over the downtown LA skyline and the 6th Street Viaduct', overlay: 'scrim' },
  { kicker: 'NEW! ALL-IN-ONE', title: 'GAS TANK', cta: 'Shop now', href: '/products', image: '/hero/gas-tank-beach.jpg', imageMobile: '/hero/gas-tank-mobile.jpg', alt: 'Jungle Boys Gas Tank all-in-one vapes standing in the sand at the beach', overlay: false },
  { kicker: '20 YEAR ANNIVERSARY EDITION', title: 'GOLD MYLARS', cta: 'Shop now', href: '/products', image: '/hero/gold-mylar-skyline.jpg', imageMobile: '/hero/gold-mylar-mobile.jpg', alt: 'Gold Jungle Boys mylar bag towering over the LA skyline at sunset', overlay: false },
]
const QUICK_CARDS = [
  { title: 'Shop', href: '/products', image: `${CDN}/69b99e2a0a6ed0851aacc074_JB_Website_Product1_2X3.jpg`, alt: 'Jungle Boys products collage' },
  { title: 'Locations', href: '/locations', image: `${CDN}/69b34477ef35cdcbdfd3580c_JB%20Locations%20Image.jpg`, alt: 'Jungle Boys dispensary locations' },
  { title: 'Clothing', href: 'https://jungleboysclothing.com/', external: true, image: `${CDN}/69b3446029edcd55bd76425d_JBC%20Image.jpg`, alt: 'Jungle Boys clothing' },
  { title: 'Pheno Hunt', href: '/phenos', image: `${CDN}/69b3324153cf4c36d0ced471_SNL%205x.1.jpg`, alt: 'Pheno hunt trichome macro' },
]

// keep the current filename as-is (relative /hero/… renders locally; CDN URLs
// render remotely). Avanti replaces images by uploading in Storyblok later.
const asset = (url) => ({ fieldtype: 'asset', filename: url })
const uid = () => crypto.randomUUID()

async function seedHome() {
  const body = [
    ...HERO_SLIDES.map((s) => ({
      _uid: uid(), component: 'hero_slide',
      kicker: s.kicker, title: s.title, cta: s.cta, href: s.href, alt: s.alt,
      overlay: s.overlay === 'scrim' ? 'scrim' : s.overlay === false ? 'none' : 'wash',
      image: asset(s.image), image_mobile: s.imageMobile ? asset(s.imageMobile) : { fieldtype: 'asset', filename: '' },
    })),
    ...QUICK_CARDS.map((c) => ({
      _uid: uid(), component: 'quick_card',
      title: c.title, href: c.href, alt: c.alt, external: !!c.external, image: asset(c.image),
    })),
  ]

  const found = await api('GET', '/stories?with_slug=home')
  const content = { component: 'home', body, seo: [] }
  if (found.stories?.[0]) {
    const id = found.stories[0].id
    await api('PUT', `/stories/${id}`, { story: { name: 'Home', slug: 'home', content }, publish: 1 })
    console.log('  ↻ updated + published Home story')
  } else {
    await api('POST', '/stories', { story: { name: 'Home', slug: 'home', content }, publish: 1 })
    console.log('  ＋ created + published Home story')
  }
}

console.log(`Storyblok setup → space ${SPACE}`)
await syncComponents()
await seedHome()
console.log('✓ Done. Open Storyblok → Home to edit the banners/deals.')
