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

const products: Product[] = [
  {
    id: 'prod-jungle-cake-8th',
    slug: 'jungle-cake-premium-flower-8th',
    name: 'Jungle Cake',
    brand: 'Jungle Boys',
    category: 'flower',
    subcategory: 'premium-flower',
    strainType: 'hybrid',
    strain: 'Jungle Cake',
    description:
      'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: '/products/placeholder-jar.png', alt: 'Jungle Cake 8th jar' }],
    variants: [{ id: 'v-8th', option: '3.5g', price: 4500, quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: 29.4, unit: '%' } },
      terpenes: [
        { name: 'Limonene', percentage: 0.9 },
        { name: 'Caryophyllene', percentage: 0.7 },
      ],
    },
    effects: ['relaxed', 'euphoric'],
    featured: true,
    retailerId: 'placeholder-dtla',
  },
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
