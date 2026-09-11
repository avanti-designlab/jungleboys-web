import type { Product } from './dutchie'

// Display name for product CARDS: live Dutchie names lead with the brand
// ("JUNGLE BOYS | ZOURZ - 3.5G GOLD MYLAR") — surfaces that already state
// the brand (chip row, or a Jungle Boys line page) strip the prefix so the
// heading carries only the product. Cart, PDP link and aria keep the full
// name. Shared by ProductCard and the /products line strips — one rule.
export function displayName(p: Product): string {
  const brand = p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const stripped = p.name
    .replace(new RegExp(`^\\s*${brand}\\s*[|:]\\s*`, 'i'), '')
    .replace(/^\s*jungle\s*boys\s*[|:]\s*/i, '')
    .trim()
  return stripped || p.name
}
