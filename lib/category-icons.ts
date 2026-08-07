import type { ProductCategory } from '@/lib/dutchie/types'

// Avanti's supplied category icons (2026-08-03 + the 2026-08-04 second
// batch) — ONE map so the shop tiles and the header's SHOP dropdown cannot
// drift apart. Traced-art SVGs over ~50KB (flower, concentrates, edibles,
// cbd, accessories) ship as 224px WebP rasters for their ~56px render; true
// small vectors (vapes 20KB) stay SVG. The remaining supplied files
// (HASH HOLE, BUDDER, INDICA…) are subcategory/strain marks with no category
// slot; an unmapped category would render a letter-mark, never an invented
// icon. Apparel's icon landed 2026-08-04 (jb-apparel.png) — the set is
// complete.
export const CATEGORY_ICONS: Partial<Record<ProductCategory, string>> = {
  flower: '/shop/icons/flower.webp',
  pops: '/shop/icons/pops.svg',
  'pre-rolls': '/shop/icons/pre-rolls.svg',
  'vape-pens': '/shop/icons/vapes.svg',
  concentrates: '/shop/icons/concentrates.webp',
  edibles: '/shop/icons/edibles.webp',
  cbd: '/shop/icons/cbd.webp',
  accessories: '/shop/icons/accessories.webp',
  apparel: '/shop/icons/apparel.webp',
}

// Visual-mass equalizer: tall-skinny (cbd) and wide-short (edibles, apparel)
// art reads smaller than the square-ish marks in the same contain box, so
// those render scaled up wherever icons appear — tile row, facet rails,
// mobile sheet (Avanti, 2026-08-04). Keyed by icon PATH so every renderer
// shares it. Tailwind-safe static class strings — do not compute these.
const ICON_MASS_SCALE: Record<string, string> = {
  '/shop/icons/cbd.webp': 'scale-[1.3]',
  '/shop/icons/edibles.webp': 'scale-[1.35]',
  '/shop/icons/apparel.webp': 'scale-[1.15]',
}
export const iconScale = (src?: string | null): string => (src ? ICON_MASS_SCALE[src] ?? '' : '')
