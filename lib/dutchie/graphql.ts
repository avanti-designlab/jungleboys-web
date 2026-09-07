// ─── GraphQL provider — the REAL Dutchie Plus API (Phase 3) ─────────────────
//
// Implements the frozen DutchieProvider interface against the documented
// 2021-07 schema (docs.dutchie.com/dutchie-plus, read 2026-08-07; live schema
// introspected the same day). Components never see raw Dutchie shapes — every
// payload maps into lib/dutchie/types here.
//
// Wire facts (recorded in CLAUDE.md):
// • ONE endpoint for all stores; the PLUS key in `Authorization: Bearer …`
//   scopes ACCESS, while queries still take a retailerId argument — resolved
//   once per key via the `retailers` query and cached.
// • Rate limits: 5 req/s sustained, 18k burst, per IP + key (docs) — ISR at
//   60s makes our load negligible; 429s still back off.
// • menuType: RECREATIONAL | MEDICAL exists (docs + introspection).
//
// ⚠ VERIFY-ON-FIRST-PAYLOAD (every mapper below tagged): category enum set,
// money units (docs show med/rec prices — assumed DOLLARS, converted to our
// cents), terpene/cannabinoid row shapes, slug stability, special→product
// membership, and the JB-vs-outsource group signal. scripts/dutchie-probe.mjs
// is the harness for that verification.
//
// SECURITY: keys come from env only (server-side); never logged, never thrown
// in error messages.

import type {
  Location,
  Menu,
  Product,
  ProductCategory,
  ProductFilter,
  ProductVariant,
  Special,
  StrainType,
} from './types'
import { placeholderProvider } from './placeholder'

const ENDPOINT =
  process.env.DUTCHIE_PLUS_ENDPOINT ?? 'https://plus.dutchie.com/plus/2021-07/graphql'

/** our store slug → env var carrying that store's PLUS key */
const KEY_ENV: Record<string, string> = {
  'downtown-los-angeles': 'DUTCHIE_PLUS_KEY_DOWNTOWN_LOS_ANGELES',
  'orange-county': 'DUTCHIE_PLUS_KEY_ORANGE_COUNTY',
  pomona: 'DUTCHIE_PLUS_KEY_POMONA',
  'san-diego': 'DUTCHIE_PLUS_KEY_SAN_DIEGO',
}

function keyForSlug(slug: string): string | null {
  const env = KEY_ENV[slug]
  return env ? (process.env[env] ?? null) : null
}

async function gql<T>(key: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables }),
    // ISR-aligned: menu data may be 60s stale, same as the pages that show it
    next: { revalidate: 60 },
  })
  if (res.status === 429) throw new Error('dutchie: rate limited (429)')
  const json = (await res.json().catch(() => null)) as {
    data?: T
    errors?: { message: string }[]
  } | null
  if (!json?.data) {
    // never include the key; the first error message is safe (API-authored)
    throw new Error(`dutchie: ${json?.errors?.[0]?.message ?? `HTTP ${res.status}`}`)
  }
  return json.data
}

// ── retailer-id resolution: one per key, cached for the process ─────────────
const retailerIdByKey = new Map<string, string>()

async function resolveRetailerId(key: string): Promise<string> {
  const hit = retailerIdByKey.get(key)
  if (hit) return hit
  const data = await gql<{ retailers: { id: string }[] }>(key, `{ retailers { id } }`)
  const id = data.retailers?.[0]?.id
  if (!id) throw new Error('dutchie: key sees no retailers')
  retailerIdByKey.set(key, id)
  return id
}

// ── mappers (⚠ every one carries a verify note) ─────────────────────────────

/** ⚠ VERIFY: Dutchie's category enum set. VAPORIZERS is documented; the rest
 *  follow the embed's known taxonomy. Unknowns land in 'accessories' rather
 *  than vanishing — a miscategorised product is visible, a dropped one is not. */
const CATEGORY_MAP: Record<string, ProductCategory> = {
  FLOWER: 'flower',
  PRE_ROLLS: 'pre-rolls',
  VAPORIZERS: 'vape-pens',
  CONCENTRATES: 'concentrates',
  EDIBLES: 'edibles',
  CBD: 'cbd',
  ACCESSORIES: 'accessories',
  APPAREL: 'apparel',
  TOPICALS: 'cbd', // wellness shelf ⚠ VERIFY with Avanti once real data shows
  TINCTURES: 'cbd',
  ORALS: 'edibles',
}

const STRAIN_MAP: Record<string, StrainType> = {
  INDICA: 'indica',
  SATIVA: 'sativa',
  HYBRID: 'hybrid',
}

/** ⚠ VERIFY: docs show med/rec prices without stating units; DOLLARS assumed
 *  (the embed displays $ floats). Our contract is integer cents. */
const cents = (n: unknown): number | undefined =>
  typeof n === 'number' && Number.isFinite(n) ? Math.round(n * 100) : undefined

const lower = (s: unknown): string | undefined =>
  typeof s === 'string' && s.length ? s.toLowerCase().replace(/_/g, ' ') : undefined

// raw wire product — loose on purpose; the mapper is the checkpoint
interface WireProduct {
  id: string
  slug?: string
  name: string
  category?: string
  subcategory?: string
  strainType?: string
  description?: string
  staffPick?: boolean
  effects?: string[]
  brand?: { name?: string; imageUrl?: string }
  images?: { url?: string; label?: string }[]
  image?: string
  potencyThc?: { formatted?: string; range?: number[]; unit?: string }
  potencyCbd?: { formatted?: string; range?: number[]; unit?: string }
  terpenes?: ({ name?: string; terpene?: { name?: string }; value?: number; unitSymbol?: string } | null)[]
  cannabinoids?: ({ cannabinoid?: { name?: string }; name?: string; value?: number; unit?: string } | null)[]
  variants?: {
    id: string
    option?: string
    priceRec?: number
    priceMed?: number
    specialPriceRec?: number
    specialPriceMed?: number
    quantity?: number
  }[]
}

const PRODUCT_SELECTION = `
  id slug name category subcategory strainType description staffPick effects
  brand { name imageUrl }
  images { url label }
  image
  potencyThc { formatted range unit }
  potencyCbd { formatted range unit }
  variants { id option priceRec priceMed specialPriceRec specialPriceMed quantity }
`

/** potency: prefer the top of the range; unit "PERCENTAGE" → '%'.
 *  ⚠ VERIFY range semantics ([min,max]) and unit strings on real data. */
function mapPotency(p?: { range?: number[]; unit?: string }): { value: number; unit: '%' | 'mg' } | undefined {
  const v = p?.range?.length ? p.range[p.range.length - 1] : undefined
  if (typeof v !== 'number' || v <= 0) return undefined
  return { value: v, unit: p?.unit === 'MILLIGRAMS' ? 'mg' : '%' }
}

function mapVariant(v: NonNullable<WireProduct['variants']>[number]): ProductVariant | null {
  // rec price first (CA adult-use); med fills in where rec is absent
  const price = cents(v.priceRec) ?? cents(v.priceMed)
  if (price === undefined) return null
  const special = cents(v.specialPriceRec) ?? cents(v.specialPriceMed)
  return {
    id: v.id,
    option: v.option ?? '',
    price,
    ...(special !== undefined && special < price ? { specialPrice: special } : {}),
    ...(typeof v.quantity === 'number' ? { quantityAvailable: v.quantity } : {}),
  }
}

function mapProduct(w: WireProduct, retailerId: string): Product | null {
  const variants = (w.variants ?? []).map(mapVariant).filter((v): v is ProductVariant => v !== null)
  if (!variants.length) return null // a product nobody can price is not a product
  const category = CATEGORY_MAP[w.category ?? ''] ?? 'accessories'
  const thc = mapPotency(w.potencyThc)
  const cbd = mapPotency(w.potencyCbd)
  const images = (w.images ?? [])
    .filter((i): i is { url: string; label?: string } => typeof i?.url === 'string')
    .map((i) => ({ url: i.url, alt: i.label || w.name }))
  if (!images.length && typeof w.image === 'string' && w.image) {
    images.push({ url: w.image, alt: w.name })
  }
  return {
    id: w.id,
    // ⚠ VERIFY slug stability + per-product-vs-per-SKU shape — the recorded
    // sitemap/PDP open question hangs on this field
    slug: w.slug || w.id,
    name: w.name,
    brand: w.brand?.name || 'Jungle Boys',
    category,
    ...(w.subcategory ? { subcategory: w.subcategory.toLowerCase().replace(/_/g, '-') } : {}),
    ...(STRAIN_MAP[w.strainType ?? ''] ? { strainType: STRAIN_MAP[w.strainType ?? ''] } : {}),
    ...(w.description ? { description: w.description } : {}),
    images,
    variants,
    ...(thc || cbd ? { labResult: { potency: { ...(thc ? { thc } : {}), ...(cbd ? { cbd } : {}) } } } : {}),
    ...(w.effects?.length ? { effects: w.effects.map((e) => lower(e)!).filter(Boolean) } : {}),
    ...(w.staffPick ? { featured: true } : {}),
    retailerId,
  }
}

// ── menu fetch: paginated to completion (docs default page = 20) ────────────
async function fetchAllProducts(key: string, retailerId: string): Promise<Product[]> {
  const out: Product[] = []
  const limit = 100
  for (let offset = 0; offset < 5000; offset += limit) {
    const data = await gql<{ menu: { products: WireProduct[] } }>(
      key,
      `query ($id: ID!, $offset: Int!, $limit: Int!) {
         menu(retailerId: $id, pagination: { offset: $offset, limit: $limit }) {
           products { ${PRODUCT_SELECTION} }
         }
       }`,
      { id: retailerId, offset, limit }
    )
    const page = data.menu?.products ?? []
    for (const w of page) {
      const p = mapProduct(w, retailerId)
      if (p) out.push(p)
    }
    if (page.length < limit) break
  }
  return out
}

// getMenu receives OUR location.retailerId (fixture ids live in owned data) —
// translate: fixture id → location → slug → env key → real Dutchie retailerId.
async function storeContext(ourRetailerId: string): Promise<{ key: string; retailerId: string } | null> {
  const locations = await placeholderProvider.getLocations()
  const loc = locations.find((l) => l.retailerId === ourRetailerId || l.slug === ourRetailerId)
  const key = loc ? keyForSlug(loc.slug) : null
  if (!key) return null
  return { key, retailerId: await resolveRetailerId(key) }
}

const CATEGORY_ORDER: ProductCategory[] = [
  'flower', 'pops', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel',
]

export const graphqlProvider: typeof placeholderProvider = {
  // Locations are OUR data (NAP, hours, slugs) — never Dutchie's.
  getLocations: placeholderProvider.getLocations,
  getLocationBySlug: placeholderProvider.getLocationBySlug,

  async getMenu(retailerId: string): Promise<Menu> {
    const ctx = await storeContext(retailerId)
    if (!ctx) return placeholderProvider.getMenu(retailerId) // un-keyed store: honest fixture
    const products = await fetchAllProducts(ctx.key, ctx.retailerId)
    const categories = CATEGORY_ORDER.filter((c) => products.some((p) => p.category === c))
    return { retailerId, products, categories }
  },

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    // catalogue-wide reads (PDP availability) aggregate the keyed stores
    const locations = await placeholderProvider.getLocations()
    const keyed = locations.filter((l) => keyForSlug(l.slug))
    const all: Product[] = []
    for (const l of keyed) {
      const menu = await this.getMenu(l.retailerId)
      all.push(...menu.products)
    }
    if (!filter) return all
    return all.filter(
      (p) =>
        (!filter.retailerId || p.retailerId === filter.retailerId) &&
        (!filter.category || p.category === filter.category) &&
        (!filter.subcategory || p.subcategory === filter.subcategory) &&
        (!filter.strainType || p.strainType === filter.strainType) &&
        (filter.featured === undefined || p.featured === filter.featured) &&
        (!filter.search || p.name.toLowerCase().includes(filter.search.toLowerCase()))
    )
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await this.getProducts()
    return all.find((p) => p.slug === slug) ?? null
  },

  async getCategories(): Promise<ProductCategory[]> {
    return CATEGORY_ORDER
  },

  async getSpecials(retailerId: string): Promise<Special[]> {
    const ctx = await storeContext(retailerId)
    if (!ctx) return []
    const data = await gql<{
      specials: {
        id: string
        name: string
        menuDisplayConfiguration?: { name?: string }
      }[]
    }>(
      ctx.key,
      `query ($id: ID!) { specials(retailerId: $id) { id name menuDisplayConfiguration { name } } }`,
      { id: ctx.retailerId }
    )
    const products = await fetchAllProducts(ctx.key, ctx.retailerId)
    return (data.specials ?? []).map((s) => {
      const display = s.menuDisplayConfiguration?.name || s.name
      const pct = display.match(/(\d{1,2})\s*%/)?.[1]
      return {
        id: s.id,
        slug: display.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name: display,
        ...(pct ? { percentOff: Number(pct) } : {}),
        // ⚠ VERIFY the group signal on real data — name-prefix heuristic
        // mirrors the live embed's "JUNGLE BOYS | …" convention
        group: /^\s*jungle\s*boys/i.test(display) ? ('jungle-boys' as const) : ('outsource' as const),
        // ⚠ VERIFY: special→product membership needs the menuSection filter
        // (docs: "Using filters" under Menu Operations). Until that shape is
        // confirmed on a real payload, members = discounted products — the
        // same honest superset the deals page's "More Markdowns" absorbs.
        productSlugs: products
          .filter((p) => p.variants.some((v) => v.specialPrice != null))
          .map((p) => p.slug),
      }
    })
  },
}
