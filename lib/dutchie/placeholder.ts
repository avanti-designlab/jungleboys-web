import type { Location, Menu, Product, ProductCategory, ProductFilter } from './types'

// Placeholder data provider — serves design/dev data through the FROZEN interface
// so Phases 1–2 build every template without Dutchie credentials (05 Phase 2).
// Phase 3 replaces the provider wired in lib/dutchie/index.ts with the GraphQL
// implementation. Templates never change.

const locations: Location[] = [
  {
    id: 'loc-dtla',
    slug: 'downtown-los-angeles',
    name: 'Jungle Boys DTLA',
    state: 'CA',
    address: '1370 S Flower St',
    city: 'Los Angeles',
    zip: '90015',
    phone: '(213) 000-0000',
    licenseNumber: 'C10-0000000-LIC',
    retailerId: 'placeholder-dtla',
    lat: 34.0326,
    lng: -118.2687,
    hours: [
      { day: 'mon', opens: '09:00', closes: '21:00' },
      { day: 'tue', opens: '09:00', closes: '21:00' },
      { day: 'wed', opens: '09:00', closes: '21:00' },
      { day: 'thu', opens: '09:00', closes: '21:00' },
      { day: 'fri', opens: '09:00', closes: '22:00' },
      { day: 'sat', opens: '09:00', closes: '22:00' },
      { day: 'sun', opens: '10:00', closes: '20:00' },
    ],
  },
]

// Premium-flower lineup — strain names/logos match the Figma flower frame. All
// prices/THC/terps are PLACEHOLDER values; real data flows from Dutchie (Phase 3).
// images[0] = pack shot, images[1] = strain logo (cards overlay it on the bag).
function flower(
  slug: string,
  name: string,
  logo: string,
  strainType: 'indica' | 'sativa' | 'hybrid',
  thc: number,
  terp: string,
  featured = false,
  deal?: number // specialPrice in cents — Dutchie deals populate this in Phase 3
): Product {
  return {
    id: `prod-${slug}`,
    slug: `${slug}-premium-flower-8th`,
    name,
    brand: 'Jungle Boys',
    category: 'flower',
    subcategory: 'premium-flower',
    strainType,
    strain: name,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [
      { url: '/products/flower/gold-mylar-bag.webp', alt: `${name} 3.5g gold mylar` },
      { url: `/products/flower/${logo}.webp`, alt: `${name} strain art` },
    ],
    variants: [{ id: `v-${slug}-8th`, option: '3.5g', price: 5000, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [
        { name: terp, percentage: 1.1 },
        { name: 'Caryophyllene', percentage: 0.7 },
      ],
    },
    effects: ['relaxed', 'euphoric'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

// Hash Hole lineup — infused pre-roll (2g indoor flower + .5g live hash rosin).
// Each card pairs a flower strain with a rosin strain. Placeholder values until
// Dutchie (Phase 3); the tube shot is shared until real per-strain photos flow.
function hashHole(
  slug: string,
  flowerStrain: string,
  rosinStrain: string,
  thc: number,
  featured = false,
  deal?: number
): Product {
  return {
    id: `prod-hh-${slug}`,
    slug: `${slug}-hash-hole`,
    name: flowerStrain,
    brand: 'Jungle Boys',
    category: 'pre-rolls',
    subcategory: 'hash-hole',
    strainType: 'hybrid',
    strain: rosinStrain, // the live hash rosin pairing (shown on the card)
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: '/products/hash-hole/product.webp', alt: `${flowerStrain} Hash Hole` }],
    variants: [{ id: `v-hh-${slug}`, option: '2.5g', price: 4000, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [
        { name: 'Caryophyllene', percentage: 1.4 },
        { name: 'Limonene', percentage: 0.9 },
      ],
    },
    effects: ['relaxed', 'euphoric'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

// Pops — 5g jars of small-nug indoor flower. Each jar has its own mockup shot;
// placeholder values until Dutchie (Phase 3).
function pops(
  slug: string,
  strain: string,
  jar: string,
  strainType: Product['strainType'],
  thc: number,
  topTerp: string,
  featured = false,
  deal?: number
): Product {
  return {
    id: `prod-pops-${slug}`,
    slug: `${slug}-pops`,
    name: strain,
    brand: 'Jungle Boys',
    category: 'pops',
    subcategory: '5g-pops',
    strainType,
    strain,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: `/products/pops/jar-${jar}.webp`, alt: `${strain} Pops 5g jar` }],
    variants: [{ id: `v-pops-${slug}`, option: '5g', price: 4500, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 12 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [
        { name: topTerp, percentage: 1.6 },
        { name: 'Caryophyllene', percentage: 0.8 },
      ],
    },
    effects: ['relaxed', 'euphoric'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

const products: Product[] = [
  hashHole('gelato-z', 'Gelato Z', 'Gator Breath', 40.9, false, 3200),
  hashHole('private-reserve', 'Private Reserve', 'Rainbow Belts', 45.7, true),
  hashHole('blu-frootz', 'Blu Frootz', 'G-Ride', 29.7),
  flower('motor-breath', 'Motor Breath', 'strain-motorbreath', 'indica', 31.2, 'Myrcene', true, 3999),
  flower('06-og', '06 OG', 'strain-06og', 'indica', 29.8, 'Limonene'),
  flower('zudz', 'Zudz', 'strain-zudz', 'hybrid', 28.4, 'Linalool'),
  flower('blam', 'Blam!', 'strain-blam', 'hybrid', 30.1, 'Limonene', false, 3500),
  flower('blu-zerdz', 'Blu Zerdz', 'strain-bluzerdz', 'indica', 27.9, 'Myrcene'),
  flower('la-gelato', 'LA Gelato', 'strain-lagelato', 'hybrid', 28.8, 'Caryophyllene'),
  flower('rs1000', 'RS1000', 'strain-rs1000', 'hybrid', 32.6, 'Limonene'),
  flower('zangria', 'Zangria', 'strain-zangria', 'sativa', 26.7, 'Terpinolene'),
  pops('blu-og', 'Blu OG', 'bluog', 'indica', 27.4, 'Myrcene', true),
  pops('blu-zerdz', 'Blu Zerdz', 'bluzerdz', 'indica', 26.8, 'Myrcene', false, 3600),
  pops('all-cherriez', 'All Cherriez', 'cherriez', 'hybrid', 28.1, 'Limonene'),
  pops('la-gelato', 'La Gelato', 'lagelato', 'hybrid', 27.9, 'Caryophyllene'),
  pops('cherry-gelato', 'Cherry Gelato', 'cherrygelato', 'hybrid', 28.6, 'Limonene'),
  pops('do-si-dos', 'Do-Si-Dos', 'dosidos', 'indica', 29.2, 'Linalool'),
  pops('gator-breath', 'Gator Breath', 'gatorbreath', 'indica', 30.4, 'Caryophyllene', false, 3600),
  pops('jungle-cake', 'Jungle Cake', 'junglecake', 'hybrid', 29.7, 'Limonene'),
  pops('cochino', 'Cochino', 'cochino', 'sativa', 26.3, 'Terpinolene'),
]

const categories: ProductCategory[] = [
  'flower',
  'pops',
  'pre-rolls',
  'edibles',
  'vape-pens',
  'concentrates',
  'accessories',
]

function applyFilter(list: Product[], filter?: ProductFilter): Product[] {
  if (!filter) return list
  return list.filter(
    (p) =>
      (!filter.retailerId || p.retailerId === filter.retailerId) &&
      (!filter.category || p.category === filter.category) &&
      (!filter.subcategory || p.subcategory === filter.subcategory) &&
      (!filter.strainType || p.strainType === filter.strainType) &&
      (filter.featured === undefined || p.featured === filter.featured) &&
      (!filter.search ||
        p.name.toLowerCase().includes(filter.search.toLowerCase()))
  )
}

export const placeholderProvider = {
  async getLocations(): Promise<Location[]> {
    return locations
  },
  async getLocationBySlug(slug: string): Promise<Location | null> {
    return locations.find((l) => l.slug === slug) ?? null
  },
  async getMenu(retailerId: string): Promise<Menu> {
    return { retailerId, products: applyFilter(products, { retailerId }), categories }
  },
  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    return applyFilter(products, filter)
  },
  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null
  },
  async getCategories(): Promise<ProductCategory[]> {
    return categories
  },
}

export type DutchieProvider = typeof placeholderProvider
