import type { ProductCategory } from '@/lib/dutchie/types'

// Avanti's supplied category icons (2026-08-03 + the 2026-08-04 second
// batch) — ONE map so the shop tiles and the header's SHOP dropdown cannot
// drift apart. Traced-art SVGs over ~50KB (flower, concentrates, edibles,
// cbd, accessories) ship as 224px WebP rasters for their ~56px render; true
// small vectors (vapes 20KB) stay SVG. The remaining supplied files
// (HASH HOLE, BUDDER, INDICA…) are subcategory/strain marks with no category
// slot; unmapped categories (apparel — no icon supplied yet) render a
// letter-mark, never an invented icon.
export const CATEGORY_ICONS: Partial<Record<ProductCategory, string>> = {
  flower: '/shop/icons/flower.webp',
  pops: '/shop/icons/pops.svg',
  'pre-rolls': '/shop/icons/pre-rolls.svg',
  'vape-pens': '/shop/icons/vapes.svg',
  concentrates: '/shop/icons/concentrates.webp',
  edibles: '/shop/icons/edibles.webp',
  cbd: '/shop/icons/cbd.webp',
  accessories: '/shop/icons/accessories.webp',
}
