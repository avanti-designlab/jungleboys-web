import type { ProductCategory } from '@/lib/dutchie'

// Shared by the client browser (filter pills) and the server storefront
// (shelf headings) — one spelling of every category label.
export function categoryLabel(c: ProductCategory): string {
  return c.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
