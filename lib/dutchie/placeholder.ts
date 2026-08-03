import { CA_OWNED } from '@/lib/owned-stores'
import type { Location, Menu, Product, ProductCategory, ProductFilter } from './types'

// Placeholder data provider — serves design/dev data through the FROZEN interface
// so Phases 1–2 build every template without Dutchie credentials (05 Phase 2).
// Phase 3 replaces the provider wired in lib/dutchie/index.ts with the GraphQL
// implementation. Templates never change.

// Locations are DERIVED from lib/owned-stores.ts, not re-typed here.
//
// Store facts (address, phone, hours, coordinates) already have one source, and
// a second copy would drift from it — that is the failure this codebase has paid
// for repeatedly. Phase 3 replaces this provider with the GraphQL one, at which
// point Dutchie becomes the source for retailerId and licenseNumber; the street
// facts stay ours.
//
// licenseNumber is deliberately EMPTY. It is regulatory data and we do not have
// the real numbers in the repo — inventing one on a cannabis site is the same
// mistake as a fabricated uploadDate, and templates must render nothing rather
// than something plausible. Fill from Dutchie (or Avanti) before cutover.
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const locations: Location[] = CA_OWNED.filter((s) => !s.external).map((s) => ({
  id: `loc-${s.slug}`,
  slug: s.slug,
  name: s.name.startsWith('Jungle Boys') ? s.name : `Jungle Boys ${s.name}`,
  state: 'CA' as const,
  address: s.street,
  city: s.city,
  zip: s.zip,
  phone: s.phone,
  licenseNumber: '',
  retailerId: `placeholder-${s.slug}`,
  lat: s.lat,
  lng: s.lng,
  hours: DAY_ORDER.flatMap((day) => {
    const spec = s.hoursSpec.find((h) => h.days.some((d) => d.toLowerCase().startsWith(day)))
    return spec ? [{ day, opens: spec.opens, closes: spec.closes }] : []
  }),
}))

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

// Gas Tank AIO — three tiers (Flavors / Live Resin / Live Rosin), each its own
// device finish. Placeholder values until Dutchie (Phase 3).

// 10 Pack Pre-Rolls — ten 0.7g mini joints per jar, 7g total. Jar art is
// normalised the same way as the Gas Tank devices: solid-pixel crop, one shared
// body width, one shared canvas, so every card renders at a matching size.
function tenPack(
  slug: string,
  strain: string,
  lineage: string,
  strainType: Product['strainType'],
  thc: number,
  topTerp: string,
  featured = false,
  deal?: number
): Product {
  return {
    id: `prod-tp-${slug}`,
    slug: `${slug}-10-pack`,
    name: strain,
    brand: 'Jungle Boys',
    category: 'pre-rolls',
    subcategory: '10-pack',
    strainType,
    strain: lineage,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: `/products/10-pack/jar-${slug}.webp`, alt: `${strain} 10 Pack Pre-Rolls` }],
    variants: [{ id: `v-tp-${slug}`, option: '7g', price: 6000, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [{ name: topTerp, percentage: 1.6 }, { name: 'Caryophyllene', percentage: 0.8 }],
    },
    effects: ['euphoric', 'relaxed'],
    featured,
    retailerId: 'placeholder-dtla',

  }
}

function oneGram(
  slug: string,
  strain: string,
  lineage: string,
  strainType: Product['strainType'],
  thc: number,
  topTerp: string,
  featured = false,
  deal?: number
): Product {
  return {
    id: `prod-1g-${slug}`,
    slug: `${slug}-1g-preroll`,
    name: strain,
    brand: 'Jungle Boys',
    category: 'pre-rolls',
    subcategory: '1g-preroll',
    strainType,
    strain: lineage,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: `/products/pre-rolls/tube-${slug}.webp`, alt: `${strain} 1G Pre-Roll` }],
    variants: [{ id: `v-1g-${slug}`, option: '1g', price: 1800, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [{ name: topTerp, percentage: 1.6 }, { name: 'Caryophyllene', percentage: 0.8 }],
    },
    effects: ['euphoric', 'relaxed'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

function twins(
  slug: string,
  strain: string,
  lineage: string,
  strainType: Product['strainType'],
  thc: number,
  topTerp: string,
  featured = false,
  deal?: number
): Product {
  return {
    id: `prod-tw-${slug}`,
    slug: `${slug}-twins-2pack`,
    name: strain,
    brand: 'Jungle Boys',
    category: 'pre-rolls',
    subcategory: 'twins-2pack',
    strainType,
    strain: lineage,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [{ url: `/products/twins/tube-${slug}.webp`, alt: `${strain} Twins 2 Pack Pre-Rolls` }],
    // two 0.75g rolls per tube — 1.5g total, which is the whole point of the line
    variants: [{ id: `v-tw-${slug}`, option: '1.5g', price: 2400, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [{ name: topTerp, percentage: 1.6 }, { name: 'Caryophyllene', percentage: 0.8 }],
    },
    effects: ['euphoric', 'relaxed'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

function gasTank(
  slug: string,
  strain: string,
  tier: 'flavors' | 'live-resin' | 'live-rosin',
  strainType: Product['strainType'],
  thc: number,
  topTerp: string,
  featured = false,
  deal?: number
): Product {
  const device = tier === 'flavors' ? 'flavors' : tier === 'live-resin' ? 'resin' : 'rosin'
  const label = tier === 'flavors' ? 'Flavors' : tier === 'live-resin' ? 'Live Resin' : 'Live Rosin'
  return {
    id: `prod-gt-${slug}`,
    slug: `${slug}-gas-tank`,
    name: strain,
    brand: 'Jungle Boys',
    category: 'vape-pens',
    subcategory: `gas-tank-${tier}`,
    strainType,
    strain: label,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    // `-n`: the straight-on masters, one shared body width. The plain files are
    // the angled three-quarter shots and made the three tiers look unrelated.
    images: [{ url: `/products/gas-tank/device-${device}-n.webp`, alt: `${strain} Gas Tank ${label}` }],
    variants: [{ id: `v-gt-${slug}`, option: '1g', price: 5000, ...(deal ? { specialPrice: deal } : {}), quantityAvailable: 10 }],
    labResult: {
      lab: 'Placeholder Labs',
      testedAt: '2026-07-01',
      potency: { thc: { value: thc, unit: '%' } },
      terpenes: [{ name: topTerp, percentage: 1.7 }, { name: 'Caryophyllene', percentage: 0.9 }],
    },
    effects: ['euphoric', 'uplifted'],
    featured,
    retailerId: 'placeholder-dtla',
  }
}

// Third-party brands. Jeeter, 1904 and Barrett Farms are REAL names from the
// live CA menus — the Brands surface carries every brand stocked, not JB only
// (recorded decision, 2026-07-31), and a template built against a single-brand
// catalogue would never meet the layout it actually ships with. Everything else
// about these entries is placeholder. `images` is deliberately EMPTY: we do not
// have their pack art, and inventing it is the same mistake as a fabricated
// licence number — the card and PDP both render cleanly without a shot.
function thirdParty(
  slug: string,
  name: string,
  brand: string,
  category: ProductCategory,
  option: string,
  price: number,
  strainType?: Product['strainType']
): Product {
  return {
    id: `prod-3p-${slug}`,
    slug,
    name,
    brand,
    category,
    strainType,
    description: 'Placeholder description — real copy flows from Dutchie in Phase 3.',
    images: [],
    variants: [{ id: `v-3p-${slug}`, option, price, quantityAvailable: 8 }],
    retailerId: 'placeholder-dtla',
  }
}

// Zangria premium flower is the designated fixture for the 2026-08-03 contract
// amendment (LabResult.cannabinoids + StrainProfile.terpenes): ONE product that
// carries the widest data shape, so the PDP meets the full panel before real
// Dutchie payloads land — and scripts/check-commerce.mjs asserts it is actually
// server-rendered. Panel names mirror the jungleboysflorida.com reference card;
// the values are placeholders like every other number in this file.
const zangriaFlower: Product = (() => {
  const p = flower('zangria', 'Zangria', 'strain-zangria', 'sativa', 26.7, 'Terpinolene')
  p.labResult = {
    ...p.labResult,
    cannabinoids: [
      { name: 'THCA', value: 34.9, unit: '%' },
      { name: 'CBGA', value: 2.39, unit: '%' },
      { name: 'THC-D9', value: 0.7, unit: '%' },
      { name: 'THCVA', value: 0.19, unit: '%' },
      { name: 'CBG', value: 0.17, unit: '%' },
      { name: 'CBDA', value: 0.1, unit: '%' },
      { name: 'CBD', value: 0.05, unit: '%' },
      { name: 'CBC', value: 0.05, unit: '%' },
    ],
  }
  p.strainProfile = {
    genetics: 'Thin Mint Cookies x Z',
    taste: ['citrus cherry', 'grape candy', 'gas'],
    terpenes: ['Terpinolene', 'Caryophyllene', 'Limonene'],
  }
  return p
})()

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
  zangriaFlower,
  pops('blu-og', 'Blu OG', 'bluog', 'indica', 27.4, 'Myrcene', true),
  pops('blu-zerdz', 'Blu Zerdz', 'bluzerdz', 'indica', 26.8, 'Myrcene', false, 3600),
  pops('all-cherriez', 'All Cherriez', 'cherriez', 'hybrid', 28.1, 'Limonene'),
  pops('la-gelato', 'La Gelato', 'lagelato', 'hybrid', 27.9, 'Caryophyllene'),
  pops('cherry-gelato', 'Cherry Gelato', 'cherrygelato', 'hybrid', 28.6, 'Limonene'),
  pops('do-si-dos', 'Do-Si-Dos', 'dosidos', 'indica', 29.2, 'Linalool'),
  pops('gator-breath', 'Gator Breath', 'gatorbreath', 'indica', 30.4, 'Caryophyllene', false, 3600),
  pops('jungle-cake', 'Jungle Cake', 'junglecake', 'hybrid', 29.7, 'Limonene'),
  pops('cochino', 'Cochino', 'cochino', 'sativa', 26.3, 'Terpinolene'),
  // ── Gas Tank: Flavors
  gasTank('06-og', '06 OG', 'flavors', 'indica', 84.2, 'Limonene', true),
  gasTank('gelato-33', 'Gelato #33', 'flavors', 'hybrid', 82.7, 'Caryophyllene'),
  gasTank('strawnana', 'Strawnana', 'flavors', 'hybrid', 83.4, 'Myrcene', false, 4200),
  gasTank('motorbreath', 'Motorbreath', 'flavors', 'indica', 85.1, 'Myrcene'),
  gasTank('jungle-cake', 'Jungle Cake', 'flavors', 'hybrid', 83.9, 'Limonene'),
  // ── Gas Tank: Live Resin
  gasTank('blu-frootz', 'Blu Frootz', 'live-resin', 'indica', 78.6, 'Myrcene', true),
  gasTank('don-z', 'Don Z', 'live-resin', 'hybrid', 79.3, 'Limonene'),
  gasTank('orange-apricot', 'Orange Apricot', 'live-resin', 'sativa', 77.8, 'Terpinolene'),
  gasTank('strawcooler', 'Strawcooler', 'live-resin', 'hybrid', 80.1, 'Caryophyllene', false, 4400),
  // ── Gas Tank: Live Rosin
  gasTank('apple-jam', 'Apple Jam', 'live-rosin', 'hybrid', 74.5, 'Limonene', true),
  gasTank('zangria', 'Zangria', 'live-rosin', 'sativa', 73.2, 'Terpinolene'),
  gasTank('zom', 'ZOM', 'live-rosin', 'indica', 75.8, 'Myrcene'),
  gasTank('sherbanger', 'Sherbanger', 'live-rosin', 'hybrid', 76.4, 'Caryophyllene'),
  // ── 10 Pack Pre-Rolls
  tenPack('06-og', '06 OG', 'Motor Breath x Gator Breath', 'indica', 31.4, 'Myrcene', true),
  tenPack('rs1000', 'RS1000', 'RS11 x Obama Runtz', 'hybrid', 29.8, 'Limonene'),
  tenPack('all-cherriez', 'All Cherriez', 'Cherry Gelato x LCG', 'hybrid', 30.2, 'Caryophyllene', false, 5200),
  tenPack('la-gelato', 'LA Gelato', 'Lemon Cherry Gelato x Triangle Kush', 'hybrid', 28.9, 'Limonene'),
  tenPack('motor-breath', 'Motor Breath', 'SFV OG x Chem D', 'indica', 32.1, 'Myrcene'),
  tenPack('blu-zerdz', 'Blu Zerdz', 'Blu Frootz x LCG', 'hybrid', 29.4, 'Linalool'),
  tenPack('rainbow-belts', 'Rainbow Belts', 'Moonbow x Zkittlez', 'hybrid', 30.7, 'Terpinolene'),
  tenPack('vanilla-velvet', 'Vanilla Velvet', 'Gelato 41 x Kush Mints', 'indica', 28.3, 'Linalool'),
  // ── 1G Pre-Rolls
  oneGram('zangria', 'Zangria', 'Thin Mint Cookies x Z', 'sativa', 30.6, 'Terpinolene', true),
  oneGram('pop-rockets', 'Pop Rockets', 'Runtz x Zero Gravity', 'hybrid', 31.8, 'Limonene'),
  oneGram('cherry-gelato', 'Cherry Gelato', 'Cherry Punch x Mike Larry', 'hybrid', 29.9, 'Caryophyllene', false, 1500),
  oneGram('blu-og', 'Blu OG', 'Blu Frootz x 06 OG', 'indica', 32.4, 'Myrcene'),
  // ── Twins 2 Pack Pre-Rolls
  twins('blu-zerdz', 'Blu Zerdz', 'Blu Frootz x LCG', 'indica', 30.8, 'Linalool', true),
  twins('all-cherriez', 'All Cherriez', 'Cherry Gelato x LCG', 'indica', 31.5, 'Caryophyllene', false, 2000),
  twins('motor-breath', 'Motor Breath', 'SFV OG x Chem D', 'indica', 33.2, 'Myrcene'),
  // ── Third-party brands (see the note on thirdParty above)
  thirdParty('jeeter-baby-cannon', 'Baby Cannon', 'Jeeter', 'pre-rolls', '0.5g', 1200, 'indica'),
  thirdParty('jeeter-honeydew', 'Honeydew', 'Jeeter', 'pre-rolls', '1g', 1800, 'hybrid'),
  thirdParty('1904-blue-dream', 'Blue Dream', '1904', 'flower', '3.5g', 2500, 'sativa'),
  thirdParty('1904-wedding-cake', 'Wedding Cake', '1904', 'flower', '3.5g', 2500, 'hybrid'),
  thirdParty('barrett-farms-gmo', 'GMO', 'Barrett Farms', 'flower', '3.5g', 3000, 'indica'),
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
    // Every CA store serves the shared catalogue. Real per-store inventory comes
    // from Dutchie in Phase 3; what matters for design is that the template meets
    // BOTH in-stock and sold-out variants, so stock varies deterministically by
    // retailer rather than every store looking identically well-stocked.
    const seed = [...retailerId].reduce((n, c) => n + c.charCodeAt(0), 0)
    return {
      retailerId,
      products: products.map((p, i) => ({
        ...p,
        retailerId,
        variants: p.variants.map((v, j) => ({
          ...v,
          quantityAvailable: (seed + i * 7 + j * 3) % 11 === 0 ? 0 : ((seed + i + j) % 24) + 1,
        })),
      })),
      categories,
    }
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
