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

// VERIFIED 2026-09-08: ONE public key covers the whole org (returns six
// retailers: the four live CA stores + a Sandbox + the closed TLC). The
// per-store key slots stay as an override in case Dutchie ever re-scopes.
const KEY_ENV: Record<string, string> = {
  'downtown-los-angeles': 'DUTCHIE_PLUS_KEY_DOWNTOWN_LOS_ANGELES',
  'orange-county': 'DUTCHIE_PLUS_KEY_ORANGE_COUNTY',
  pomona: 'DUTCHIE_PLUS_KEY_POMONA',
  'san-diego': 'DUTCHIE_PLUS_KEY_SAN_DIEGO',
}

function keyForSlug(slug: string): string | null {
  // the VERIFIED org-wide public key wins; per-store slots are the fallback
  // (the 2026-08 retail-key batch still occupies them, invalid)
  const env = KEY_ENV[slug]
  const perStore = env ? process.env[env] : null
  return process.env.DUTCHIE_PLUS_PUBLIC_KEY || perStore || null
}

// which wire retailer belongs to which of OUR stores — matched on the
// VERIFIED retailer names (never [0]: that is the Sandbox)
const RETAILER_MATCH: Record<string, RegExp> = {
  'downtown-los-angeles': /dtla/i,
  'orange-county': /\boc\b|orange/i,
  pomona: /pomona/i,
  'san-diego': /san diego/i,
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

// ── retailer-id resolution: per key+store, cached for the process ───────────
const retailerIdCache = new Map<string, string>()

async function resolveRetailerId(key: string, storeSlug: string): Promise<string> {
  const cacheKey = `${key.slice(-8)}:${storeSlug}`
  const hit = retailerIdCache.get(cacheKey)
  if (hit) return hit
  const data = await gql<{ retailers: { id: string; name: string }[] }>(
    key,
    `{ retailers { id name } }`
  )
  const match = RETAILER_MATCH[storeSlug]
  const found = match
    ? data.retailers?.find((r) => match.test(r.name) && !/sandbox/i.test(r.name))
    : undefined
  const id = found?.id ?? (data.retailers?.length === 1 ? data.retailers[0].id : undefined)
  if (!id) throw new Error(`dutchie: no retailer matches store '${storeSlug}'`)
  retailerIdCache.set(cacheKey, id)
  return id
}

// ── mappers (⚠ every one carries a verify note) ─────────────────────────────

/** VERIFIED 2026-09-08 (introspection): ACCESSORIES APPAREL CBD CLONES
 *  CONCENTRATES EDIBLES FLOWER NOT_APPLICABLE ORALS PRE_ROLLS SEEDS TINCTURES
 *  TOPICALS VAPORIZERS. Unknowns land in 'accessories' rather than vanishing —
 *  a miscategorised product is visible, a dropped one is not. */
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

// VERIFIED 2026-09-08 (introspection): full enum also carries INDICA_HYBRID /
// SATIVA_HYBRID (mapped to hybrid — accurate, revisit if Avanti wants
// lean-labels) and ratio/THC/CBD/NOT_APPLICABLE values (no chip).
const STRAIN_MAP: Record<string, StrainType> = {
  INDICA: 'indica',
  SATIVA: 'sativa',
  HYBRID: 'hybrid',
  INDICA_HYBRID: 'hybrid',
  SATIVA_HYBRID: 'hybrid',
}

/** VERIFIED 2026-09-08: prices are dollar floats on the wire (12.08). */
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
  terpenes { name unitSymbol value }
  cannabinoids { value unit cannabinoid { name } }
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
  // VERIFIED 2026-09-08: real subcategory enums (DEFAULT, ALL_IN_ONE,
  // SMALL_BUDS, SINGLES, PACKS, GUMMIES…) differ from the fixture taxonomy the
  // JB line collections match on. ALL_IN_ONE→gas-tank is unambiguous (the
  // collections' prefix union); the rest keep kebab-case until the line
  // mapping pass with Avanti. DEFAULT carries no signal → dropped.
  const subcategory =
    w.subcategory === 'ALL_IN_ONE'
      ? 'gas-tank'
      : w.subcategory && w.subcategory !== 'DEFAULT'
        ? w.subcategory.toLowerCase().replace(/_/g, '-')
        : undefined
  return {
    id: w.id,
    // VERIFIED 2026-09-08: slugs are per-product and human-readable
    // ("cannabiotix-white-walker-og-3-5g-flower") — the sitemap/PDP open
    // question resolves; add PDPs to the sitemap at cutover.
    slug: w.slug || w.id,
    name: w.name,
    brand: w.brand?.name || 'Jungle Boys',
    category,
    ...(subcategory ? { subcategory } : {}),
    ...(STRAIN_MAP[w.strainType ?? ''] ? { strainType: STRAIN_MAP[w.strainType ?? ''] } : {}),
    ...(w.description ? { description: w.description } : {}),
    images,
    variants,
    ...(() => {
      // VERIFIED 2026-09-08 row shapes: terpenes [{name,unitSymbol,value}],
      // cannabinoids [{value,unit:'PERCENTAGE',cannabinoid:{name:'CBD (Cannabidiol)'}}]
      const terpenes = (w.terpenes ?? [])
        .filter((t): t is { name: string; value: number } => typeof t?.name === 'string' && typeof t?.value === 'number' && t.value > 0)
        .map((t) => ({ name: t.name, percentage: t.value }))
      const cannabinoids = (w.cannabinoids ?? [])
        .filter((c): c is { value: number; unit?: string; cannabinoid?: { name?: string } } => typeof c?.value === 'number' && c.value > 0 && !!c?.cannabinoid?.name)
        .map((c) => ({
          name: (c.cannabinoid!.name ?? '').replace(/\s*\(.*\)\s*$/, ''),
          value: c.value,
          unit: (c.unit === 'MILLIGRAMS' ? 'mg' : '%') as 'mg' | '%',
        }))
      const potency = thc || cbd ? { ...(thc ? { thc } : {}), ...(cbd ? { cbd } : {}) } : undefined
      if (!potency && !terpenes.length && !cannabinoids.length) return {}
      return {
        labResult: {
          ...(potency ? { potency } : {}),
          ...(terpenes.length ? { terpenes } : {}),
          ...(cannabinoids.length ? { cannabinoids } : {}),
        },
      }
    })(),
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
  if (!key || !loc) return null
  return { key, retailerId: await resolveRetailerId(key, loc.slug) }
}

const CATEGORY_ORDER: ProductCategory[] = [
  'flower', 'pops', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel',
]

// standalone functions, never `this` — index.ts exports each method detached
// (`export const getMenu = provider.getMenu`), which strips `this` at the
// call site (the live-build crash that taught us).
async function getMenu(retailerId: string): Promise<Menu> {
  const ctx = await storeContext(retailerId)
  if (!ctx) return placeholderProvider.getMenu(retailerId) // un-keyed store: honest fixture
  const products = await fetchAllProducts(ctx.key, ctx.retailerId)
  const categories = CATEGORY_ORDER.filter((c) => products.some((p) => p.category === c))
  return { retailerId, products, categories }
}

async function getProducts(filter?: ProductFilter): Promise<Product[]> {
  // catalogue-wide reads (PDP availability) aggregate the keyed stores
  const locations = await placeholderProvider.getLocations()
  const keyed = locations.filter((l) => keyForSlug(l.slug))
  const all: Product[] = []
  for (const l of keyed) {
    const menu = await getMenu(l.retailerId)
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
}

export const graphqlProvider: typeof placeholderProvider = {
  // Locations are OUR data (NAP, hours, slugs) — never Dutchie's.
  getLocations: placeholderProvider.getLocations,
  getLocationBySlug: placeholderProvider.getLocationBySlug,
  getMenu,
  getProducts,

  async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await getProducts()
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
    // Membership is REAL, per special, via the menuSection filter — VERIFIED
    // live 2026-09-10: menu(filter: { menuSection: { type: SPECIALS,
    // specialId: [id] } }) returns exactly that special's members (DTLA
    // "MICRO BAR | 30% OFF" → 8, "BUILD A BAG | $75" → 20). specialId is
    // [String]. This replaced the discounted-superset placeholder, which on
    // San Diego's live menu put every markdown in all ~48 specials and built
    // a 6,960-card deals page. Slugs only — the deals page joins them back
    // onto its own menu fetch. Sequential (~1 req/special) stays inside the
    // 5 req/s budget the way fetchAllProducts does.
    const specials: Special[] = []
    for (const s of data.specials ?? []) {
      // EXPLICIT GROUP TAGS (Avanti, 2026-09-10): the team tags the INTERNAL
      // special name in the Dutchie admin with [JB] or [OS] — the API has no
      // tag field on specials, but the internal name never reaches shoppers
      // when a Menu Display Name is set, and we strip the tag if it leaks
      // through the fallback. A tag beats the name heuristic below.
      const tag = /\[\s*jb\s*\]/i.test(s.name)
        ? ('jungle-boys' as const)
        : /\[\s*os\s*\]/i.test(s.name)
          ? ('outsource' as const)
          : null
      const display = (s.menuDisplayConfiguration?.name || s.name)
        .replace(/\s*\[\s*(jb|os)\s*\]\s*/gi, ' ')
        .trim()
      const pct = display.match(/(\d{1,2})\s*%/)?.[1]
      const slugs: string[] = []
      const limit = 100
      for (let offset = 0; offset < 2000; offset += limit) {
        const page = await gql<{ menu: { products: { slug: string }[] } }>(
          ctx.key,
          `query ($id: ID!, $sid: [String], $offset: Int!, $limit: Int!) {
             menu(retailerId: $id, pagination: { offset: $offset, limit: $limit },
                  filter: { menuSection: { type: SPECIALS, specialId: $sid } }) {
               products { slug }
             }
           }`,
          { id: ctx.retailerId, sid: [s.id], offset, limit }
        )
        const rows = page.menu?.products ?? []
        slugs.push(...rows.map((r) => r.slug))
        if (rows.length < limit) break
      }
      specials.push({
        id: s.id,
        slug: display.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name: display,
        ...(pct ? { percentOff: Number(pct) } : {}),
        // Untagged fallback — house-deal prefixes seen on live data
        // (2026-09-10): "JUNGLE BOYS |" (DTLA convention), "JB:"/"JBSD:"
        // (San Diego's shorthand + store-suffixed variants), plus the house
        // programs that don't carry the JB name — BUILD A BAG and ORC are
        // Jungle Boys deals (Avanti, 2026-09-10).
        group:
          tag ??
          (/^\s*(jungle\s*boys|jb(sd|la|oc|dtla|pomona)?|build\s*a\s*bag|orc)\b/i.test(display)
            ? ('jungle-boys' as const)
            : ('outsource' as const)),
        productSlugs: slugs,
      })
    }
    return specials
  },
}
