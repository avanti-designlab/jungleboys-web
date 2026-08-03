// ─── FROZEN DATA MODEL (Phase 0 data-model freeze, 01 §3) ────────────────────
// These types are the contract every template builds against. Changing a field
// or signature after the freeze requires Orchestrator approval + doc update.
// Phase 3 maps the real Dutchie Plus GraphQL payloads INTO these types inside
// lib/dutchie/ — components never see raw Dutchie shapes.

export type StateCode = 'CA' | 'FL'

export interface BusinessHours {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  opens: string // "09:00"
  closes: string // "21:00"
}

export interface Location {
  id: string
  slug: string // e.g. "downtown-los-angeles"
  name: string
  state: StateCode
  address: string
  city: string
  zip: string
  phone: string
  licenseNumber: string
  retailerId: string // Dutchie Plus retailer ID — the multi-location backbone
  lat: number
  lng: number
  hours: BusinessHours[]
}

export type ProductCategory =
  | 'flower'
  | 'pops'
  | 'pre-rolls'
  | 'edibles'
  | 'vape-pens'
  | 'concentrates'
  | 'accessories'

export type StrainType = 'indica' | 'sativa' | 'hybrid'

export interface Potency {
  thc?: { value: number; unit: '%' | 'mg' }
  cbd?: { value: number; unit: '%' | 'mg' }
}

export interface Terpene {
  name: string
  percentage: number
}

export interface LabResult {
  lab?: string
  testedAt?: string // ISO date
  coaUrl?: string
  potency?: Potency
  terpenes?: Terpene[]
}

export interface ProductVariant {
  id: string
  option: string // "3.5g", "10g", "1g"
  price: number // cents
  specialPrice?: number // cents, present when discounted
  quantityAvailable?: number
}

/**
 * Strain-level identity — the same for every SKU of a strain.
 *
 * AMENDMENT to the frozen data model (Avanti approved, 2026-07-31). Added
 * because the Drops design needs Genetics ("Thin Mint Cookies x Z") and Taste
 * ("Citrus cherry, grape candy, gas"), and neither had anywhere to live:
 * `strain` is a NAME, `effects` is not flavour, and `labResult.terpenes` is
 * chemistry rather than tasting notes.
 *
 * Deliberately a nested object rather than two loose fields on Product. These
 * are strain attributes, not product attributes — Zangria has the same genetics
 * as an eighth or a pre-roll — so when the Strains library is built this shape
 * lifts out to become the Strain entity and `Product.strain` becomes the key
 * that points at it. Flattening genetics onto Product would mean populating it
 * hundreds of times and migrating later.
 */
export interface StrainProfile {
  genetics?: string // "Cherry Gelato × Lemon Cherry Gelato"
  taste?: string[] // ["cherry", "lemon", "diesel"]
  description?: string // the strain narrative, distinct from the SKU description
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string // "Jungle Boys", "Jungle Boys Vapes", …
  category: ProductCategory
  subcategory?: string // "premium-flower", "pops", …
  strainType?: StrainType
  strain?: string // parent strain NAME — becomes the key into the Strains library
  strainProfile?: StrainProfile // strain-level identity; see the note above
  description?: string
  images: { url: string; alt: string }[]
  variants: ProductVariant[]
  labResult?: LabResult
  effects?: string[]
  featured?: boolean
  retailerId: string
}

export interface ProductFilter {
  retailerId?: string
  category?: ProductCategory
  subcategory?: string
  strainType?: StrainType
  search?: string
  featured?: boolean
}

export interface Menu {
  retailerId: string
  products: Product[]
  categories: ProductCategory[]
}
