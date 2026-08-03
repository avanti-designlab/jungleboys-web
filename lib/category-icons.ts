import type { ProductCategory } from '@/lib/dutchie/types'

// Avanti's supplied category icons (2026-08-03) — ONE map so the shop tiles
// and the header's SHOP dropdown cannot drift apart. flower is a WebP raster:
// the supplied SVG is vector-traced photo art (2MB, 687KB gzipped),
// rasterized at 224px for its ~56px render. The other supplied SVGs
// (HASH HOLE, BUDDER, INDICA…) are subcategory/strain marks with no category
// slot; unmapped categories render a letter-mark, never an invented icon.
export const CATEGORY_ICONS: Partial<Record<ProductCategory, string>> = {
  flower: '/shop/icons/flower.webp',
  pops: '/shop/icons/pops.svg',
  'pre-rolls': '/shop/icons/pre-rolls.svg',
}
