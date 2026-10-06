import { getLocations } from '@/lib/dutchie'

// Live bag quote (2026-10-05 feature audit #2): prices the local bag through
// a REAL Dutchie checkout so the panel can show exact discounts, taxes and
// total before the handoff. Returns the quoted checkout's redirectUrl too,
// so the Checkout button can reuse it instead of rebuilding. Same hardening
// family as /api/checkout; prices and totals are CENTS. The quote checkout
// is ephemeral on Dutchie's side; nothing is ordered until their page.

const hits = new Map<string, number[]>()
const LIMIT = 12
const WINDOW_MS = 60_000

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > LIMIT
}

function clientKey(req: Request): string {
  const vercel = req.headers.get('x-vercel-forwarded-for')
  if (vercel) return vercel.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return 'unknown'
}

const RETAILER_MATCH: Record<string, RegExp> = {
  'downtown-los-angeles': /dtla/i,
  'orange-county': /\boc\b|orange/i,
  pomona: /pomona/i,
  'san-diego': /san diego/i,
}

async function gql<T>(key: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://plus.dutchie.com/plus/2021-07/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => null)) as { data?: T; errors?: { message: string }[] } | null
  if (!json?.data) throw new Error(json?.errors?.[0]?.message ?? `HTTP ${res.status}`)
  return json.data
}

export async function POST(req: Request) {
  const ip = clientKey(req)
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests.' }, { status: 429 })
  }
  const key = process.env.DUTCHIE_PLUS_PUBLIC_KEY?.trim()
  if (process.env.DUTCHIE_PLUS_PROVIDER !== 'graphql' || !key) {
    return Response.json({ error: 'Quotes not active.' }, { status: 503 })
  }

  let body: { storeSlug?: unknown; menuType?: unknown; items?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const storeSlug = typeof body.storeSlug === 'string' ? body.storeSlug : ''
  const pricingType = body.menuType === 'medical' ? 'MEDICAL' : 'RECREATIONAL'
  const match = RETAILER_MATCH[storeSlug]
  if (!match) return Response.json({ error: 'Unknown store.' }, { status: 400 })
  const locations = await getLocations()
  if (!locations.some((l) => l.slug === storeSlug)) {
    return Response.json({ error: 'Unknown store.' }, { status: 400 })
  }

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : []
  const items: { productId: string; option: string; quantity: number }[] = []
  for (const it of rawItems) {
    if (!it || typeof it !== 'object') continue
    const variantId = (it as { variantId?: unknown }).variantId
    const qty = (it as { qty?: unknown }).qty
    if (typeof variantId !== 'string' || !variantId.includes('~')) continue
    const tilde = variantId.indexOf('~')
    const productId = variantId.slice(0, tilde)
    const option = variantId.slice(tilde + 1)
    if (!/^[\w-]{6,40}$/.test(productId) || option.length === 0 || option.length > 30) continue
    items.push({ productId, option, quantity: Math.min(Math.max(1, Math.floor(Number(qty) || 1)), 20) })
  }
  if (!items.length) return Response.json({ error: 'No valid items.' }, { status: 400 })

  try {
    const { retailers } = await gql<{ retailers: { id: string; name: string }[] }>(
      key,
      `{ retailers { id name } }`,
      {}
    )
    const retailer = retailers.find((r) => match.test(r.name) && !/sandbox/i.test(r.name))
    if (!retailer) throw new Error('retailer not found')

    const created = await gql<{ createCheckout: { id: string } }>(
      key,
      `mutation ($rid: ID!, $pt: PricingType!) {
         createCheckout(retailerId: $rid, orderType: PICKUP, pricingType: $pt) { id }
       }`,
      { rid: retailer.id, pt: pricingType }
    )
    const checkoutId = created.createCheckout.id
    for (const it of items) {
      await gql(
        key,
        `mutation ($rid: ID!, $cid: ID!, $pid: ID!, $q: Int!, $opt: String!) {
           addItem(retailerId: $rid, checkoutId: $cid, productId: $pid, quantity: $q, option: $opt) { id }
         }`,
        { rid: retailer.id, cid: checkoutId, pid: it.productId, q: it.quantity, opt: it.option }
      )
    }
    const read = await gql<{
      checkout: {
        redirectUrl?: string
        priceSummary?: { subtotal?: number; discounts?: number; taxes?: number; fees?: number; total?: number }
      }
    }>(
      key,
      `query ($rid: ID!, $cid: ID!) {
         checkout(retailerId: $rid, id: $cid) {
           redirectUrl
           priceSummary { subtotal discounts taxes fees total }
         }
       }`,
      { rid: retailer.id, cid: checkoutId }
    )
    const ps = read.checkout?.priceSummary
    if (!ps || typeof ps.total !== 'number') throw new Error('no summary')
    return Response.json({
      summary: {
        subtotal: ps.subtotal ?? 0,
        discounts: ps.discounts ?? 0,
        taxes: ps.taxes ?? 0,
        fees: ps.fees ?? 0,
        total: ps.total,
      },
      url: read.checkout?.redirectUrl ?? null,
    })
  } catch {
    return Response.json({ error: 'Quote unavailable.' }, { status: 502 })
  }
}
