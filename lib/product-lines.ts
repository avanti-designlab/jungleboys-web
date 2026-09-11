// Products for the /products/<line> LANDING pages (the flagship brand pages,
// not the store shop). Built 2026-09-10 when the live flip left every line
// page's shop strip empty: they filtered on fixture subcategories
// ('premium-flower', 'hash-hole', '5g-pops'…) that live Dutchie products
// never carry. The store shop solved the same problem with the dual-mode
// LINE_DEFS matchers — this routes the landing pages through those matchers.
//
// The landing pages are store-agnostic, so products aggregate across every
// keyed store and DEDUPE by slug (the same strain at four stores is one
// card; the PDP's own store logic takes over from there). In-stock and
// imaged entries win the dedupe; featured (staff-pick) products lead; capped
// because these are curated brand strips, not a browse grid.

import type { Product } from './dutchie'
import { getProducts } from './dutchie'
import { lineMatcher } from './collections'

const inStock = (p: Product) => p.variants.some((v) => (v.quantityAvailable ?? 0) > 0)

/** Where an empty line sends the shopper instead: the nearest live category
    (key = FIXED_CATEGORIES slug for the ?category= grid filter). */
export const LINE_FALLBACK: Record<string, { category: string; label: string }> = {
  'premium-flower': { category: 'flower', label: 'Flower' },
  'hash-holes': { category: 'pre-rolls', label: 'Pre-Rolls' },
  '5g-pops': { category: 'pops', label: 'Pops' },
  '10-pack-pre-rolls': { category: 'pre-rolls', label: 'Pre-Rolls' },
  '1g-pre-rolls': { category: 'pre-rolls', label: 'Pre-Rolls' },
  'twins-2-pack': { category: 'pre-rolls', label: 'Pre-Rolls' },
  'gas-tanks': { category: 'vape-pens', label: 'Vapes' },
}

// Landing-page-only lines that are NOT store-shop LINE_DEFS collections —
// ORC is a brand page, not a shop line (the 7-line shop set is a closed
// decision). Live names: "Oil Refinery Co. | <Strain> - <size> <Type>".
const PAGE_ONLY_MATCHERS: Record<string, (p: Product) => boolean> = {
  orc: (p) => /^\s*oil\s*refinery/i.test(p.brand) || /^\s*(oil\s*refinery|orc\b)/i.test(p.name),
}

export async function getLineProducts(lineSlug: string, cap = 12): Promise<Product[]> {
  const match = lineMatcher(lineSlug) ?? PAGE_ONLY_MATCHERS[lineSlug]
  if (!match) return []
  const all = await getProducts()
  const bySlug = new Map<string, Product>()
  for (const p of all) {
    if (!match(p) || !p.images[0]) continue
    const prev = bySlug.get(p.slug)
    if (!prev || (!inStock(prev) && inStock(p))) bySlug.set(p.slug, p)
  }
  return [...bySlug.values()]
    .sort(
      (a, b) =>
        Number(inStock(b)) - Number(inStock(a)) ||
        Number(b.featured ?? false) - Number(a.featured ?? false)
    )
    .slice(0, cap)
}
