import type { Product, ProductCategory } from '@/lib/dutchie'
import { CATEGORY_ICONS } from '@/lib/category-icons'
import { categoryLabel } from '@/components/menu/labels'

// Shop collections (Avanti, 2026-08-04): every SHOP category and every
// PRODUCTS line is its OWN shopping page at
// /menu/california/<store>/shop/<collection> — the dropdowns and tiles were
// landing on the main grid with a filter, which read as "going back to the
// main page". One registry so the header, the tiles, the shelves and the
// routes all agree on slugs.
//
// SEO split (per the URL mandate's faceted-filter rule): CATEGORY collections
// are primary categories — indexable, self-canonical, in the sitemap. LINE
// collections are subcategory facets — noindex, canonical to the store menu.

export interface Collection {
  slug: string
  title: string
  kind: 'category' | 'line'
  icon: string | null
  match: (p: Product) => boolean
}

// The fixed 8 (recorded 2026-08-03) plus pops — pops products exist and its
// shelf needs a landing page even though it left the tile row.
export const FIXED_CATEGORIES: ProductCategory[] = [
  'flower', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel', 'pops',
]
const CATEGORY_SLUGS = FIXED_CATEGORIES

// URL slugs where the display name diverges from the Dutchie category key
// (Avanti, 2026-08-04: cbd reads AND routes as "wellness"; the frozen
// ProductCategory value stays 'cbd' — that is Dutchie's taxonomy, not ours).
const CATEGORY_URL_SLUGS: Partial<Record<ProductCategory, string>> = {
  cbd: 'wellness',
}

/** category key → the collection URL slug it routes to */
export const categorySlug = (c: ProductCategory): string => CATEGORY_URL_SLUGS[c] ?? c

export const CATEGORY_COLLECTIONS: Collection[] = CATEGORY_SLUGS.map((c) => ({
  slug: categorySlug(c),
  title: categoryLabel(c),
  kind: 'category',
  icon: CATEGORY_ICONS[c] ?? null,
  // pops is OUR shelf, not a Dutchie category — live pops arrive as FLOWER
  // named "… Pops" (2026-09-08 census), so that page matches either signal
  match: (p) =>
    p.category === c || (c === 'pops' && p.category === 'flower' && /\bpops\b/i.test(p.name)),
}))

// LINE MATCHERS — dual-mode (2026-09-08, from the 203-product live JB census):
// the fixture taxonomy matches on SUBCATEGORY, but the real Dutchie payload
// identifies lines by NAME ("… 5g Pops", "… Hash Hole", "… AIO Gas Tank",
// "… Twins Pre-Roll Pack") with inconsistent subcats (SMALL_BUDS, INFUSED,
// SINGLES, PACKS, PREMIUM, DEFAULT). Each matcher accepts EITHER signal so
// both providers serve the same pages. NOTE: no 10-packs are on any live menu
// today — that collection renders its honest empty state until they return.
// admits "Jungle Boys" and collabs ("Jungle Boys x Pistil Whip"), excludes
// "Jungle Boys Clothing" (apparel brand, its own shelf)
const JB_BRAND = /^jungle boys(?!\s+clothing)/i
const LINE_DEFS: { slug: string; title: string; icon: string | null; match: (p: Product) => boolean }[] = [
  {
    slug: 'premium-flower',
    title: 'Premium Flower',
    icon: CATEGORY_ICONS.flower ?? null,
    match: (p) =>
      p.subcategory === 'premium-flower' ||
      p.subcategory === 'premium' ||
      (JB_BRAND.test(p.brand) && p.category === 'flower' && !/\bpops\b/i.test(p.name)),
  },
  {
    slug: 'hash-holes',
    title: 'Hash Holes',
    icon: '/shop/icons/hash-hole.webp',
    match: (p) => p.subcategory === 'hash-hole' || (JB_BRAND.test(p.brand) && /hash ?hole/i.test(p.name)),
  },
  {
    slug: '5g-pops',
    title: '5G Pops',
    icon: CATEGORY_ICONS.pops ?? null,
    match: (p) =>
      p.subcategory === '5g-pops' ||
      (JB_BRAND.test(p.brand) && (p.category === 'flower' || p.category === 'pops') && /\bpops\b/i.test(p.name)),
  },
  {
    slug: '10-pack-pre-rolls',
    title: '10-Pack Pre-Rolls',
    icon: '/shop/icons/pre-rolls-10pk.webp',
    match: (p) =>
      p.subcategory === '10-pack' ||
      (JB_BRAND.test(p.brand) && p.category === 'pre-rolls' && /10[- ]?(?:pack|pk)/i.test(p.name)),
  },
  {
    slug: '1g-pre-rolls',
    title: '1G Pre-Rolls',
    icon: '/shop/icons/pre-roll-1g.svg',
    match: (p) =>
      p.subcategory === '1g-preroll' ||
      (JB_BRAND.test(p.brand) && p.category === 'pre-rolls' && /1g pre-?roll/i.test(p.name) && !/twins/i.test(p.name) && !/hash ?hole/i.test(p.name)),
  },
  {
    slug: 'twins-2-pack',
    title: 'Twins 2-Pack',
    icon: '/shop/icons/pre-rolls.svg',
    match: (p) => p.subcategory === 'twins-2pack' || (JB_BRAND.test(p.brand) && /\btwins\b/i.test(p.name)),
  },
  {
    slug: 'gas-tanks',
    title: 'Gas Tanks',
    icon: '/shop/icons/gas-tank.svg',
    // fixture subcats are gas-tank-* (prefix union); live ALL_IN_ONE maps to
    // 'gas-tank' in the provider — but THIRD-PARTY AIOs (Micro Bar, Plug
    // Play, Sluggers…) carry it too, so the JB line requires the brand on
    // BOTH branches (2026-09-08 live catch)
    match: (p) =>
      JB_BRAND.test(p.brand) &&
      ((p.subcategory ?? '').startsWith('gas-tank') || /gas ?tank/i.test(p.name)),
  },
]

export const LINE_COLLECTIONS: Collection[] = LINE_DEFS.map((d) => ({ ...d, kind: 'line' as const }))

export const COLLECTIONS: Collection[] = [...CATEGORY_COLLECTIONS, ...LINE_COLLECTIONS]

export const getCollection = (slug: string): Collection | undefined =>
  COLLECTIONS.find((c) => c.slug === slug)

export const collectionPath = (storeSlug: string, collection: string): string =>
  // accepts a category key too — maps it to its URL slug (cbd → wellness)
  `/menu/california/${storeSlug}/shop/${CATEGORY_URL_SLUGS[collection as ProductCategory] ?? collection}`
