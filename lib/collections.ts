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
const CATEGORY_SLUGS: ProductCategory[] = [
  'flower', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel', 'pops',
]

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
  match: (p) => p.category === c,
}))

export const LINE_COLLECTIONS: Collection[] = [
  { slug: 'premium-flower', title: 'Premium Flower', sub: 'premium-flower' },
  { slug: 'hash-holes', title: 'Hash Holes', sub: 'hash-hole' },
  { slug: '5g-pops', title: '5G Pops', sub: '5g-pops' },
  { slug: '10-pack-pre-rolls', title: '10-Pack Pre-Rolls', sub: '10-pack' },
  { slug: '1g-pre-rolls', title: '1G Pre-Rolls', sub: '1g-preroll' },
  { slug: 'twins-2-pack', title: 'Twins 2-Pack', sub: 'twins-2pack' },
  { slug: 'gas-tanks', title: 'Gas Tanks', sub: 'gas-tank' },
].map(({ slug, title, sub }) => ({
  slug,
  title,
  kind: 'line' as const,
  icon:
    slug === 'premium-flower'
      ? CATEGORY_ICONS.flower ?? null
      : slug === 'hash-holes'
        ? '/shop/icons/hash-hole.webp'
        : slug === '5g-pops'
          ? CATEGORY_ICONS.pops ?? null
          : slug === 'gas-tanks'
            ? null
            : CATEGORY_ICONS['pre-rolls'] ?? null,
  // gas-tanks unions its three sibling subcategories by prefix
  match: (p: Product) =>
    slug === 'gas-tanks' ? (p.subcategory ?? '').startsWith('gas-tank') : p.subcategory === sub,
}))

export const COLLECTIONS: Collection[] = [...CATEGORY_COLLECTIONS, ...LINE_COLLECTIONS]

export const getCollection = (slug: string): Collection | undefined =>
  COLLECTIONS.find((c) => c.slug === slug)

export const collectionPath = (storeSlug: string, collection: string): string =>
  // accepts a category key too — maps it to its URL slug (cbd → wellness)
  `/menu/california/${storeSlug}/shop/${CATEGORY_URL_SLUGS[collection as ProductCategory] ?? collection}`
