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

export interface Product {
  id: string
  slug: string
  name: string
  brand: string // "Jungle Boys", "Jungle Boys Vapes", …
  category: ProductCategory
  subcategory?: string // "premium-flower", "pops", …
  strainType?: StrainType
  strain?: string // parent strain name for /strains catalog
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
