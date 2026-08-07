import type { ProductCategory, StrainType } from '@/lib/dutchie'

// Shared by the client browser (filter pills) and the server storefront
// (shelf headings) — one spelling of every category label. Overrides carry
// Avanti's namings (2026-08-03: "Vapes", not "Vape Pens"; 2026-08-04: the
// cbd category reads "Wellness" — the CANNABINOID stays "CBD" in lab panels).
const LABEL_OVERRIDES: Partial<Record<ProductCategory, string>> = {
  'vape-pens': 'Vapes',
  cbd: 'Wellness',
}

export function categoryLabel(c: ProductCategory): string {
  return LABEL_OVERRIDES[c] ?? c.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

// The ONE site-wide strain palette (indica blue / sativa red / hybrid green,
// outlined, fixed ON-WHITE values). Lives here — not in a 'use client'
// module — because SERVER components (PDP, drops) read it too, and value
// imports from client modules arrive as broken client references.
export const STRAIN_STYLE: Record<StrainType, { label: string; cls: string }> = {
  indica: { label: 'Indica', cls: 'border-[var(--strain-indica)] text-[var(--strain-indica)]' },
  sativa: { label: 'Sativa', cls: 'border-[var(--strain-sativa)] text-[var(--strain-sativa)]' },
  hybrid: { label: 'Hybrid', cls: 'border-[var(--strain-hybrid)] text-[var(--strain-hybrid)]' },
}
