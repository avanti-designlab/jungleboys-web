import type { ProductCategory } from '@/lib/dutchie'

// Shared by the client browser (filter pills) and the server storefront
// (shelf headings) — one spelling of every category label. Overrides carry
// Avanti's namings (2026-08-03: "Vapes", not "Vape Pens"; CBD is an acronym).
const LABEL_OVERRIDES: Partial<Record<ProductCategory, string>> = {
  'vape-pens': 'Vapes',
  cbd: 'CBD',
}

export function categoryLabel(c: ProductCategory): string {
  return LABEL_OVERRIDES[c] ?? c.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
