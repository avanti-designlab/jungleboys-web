// POST /api/checkout — hands the local bag to DUTCHIE'S hosted checkout.
//
// Approved by Avanti 2026-09-08 ("yes to this" on the API handoff): the bag
// creates a Dutchie checkout server-side (createCheckout + addItem per line)
// and returns the redirectUrl to Dutchie's hosted flow
// (jungleboys-<store>.batchsys.com — verified live). PAYMENT AND PII STAY
// DUTCHIE'S (invariant §9.2): this route handles product ids and quantities
// only, nothing about the person.
//
// Active only when the site runs the live provider — in placeholder mode the
// bag's variant ids aren't real Dutchie ids, so the route answers 503 and the
// bag falls back to the store-menu handoff (progressive enhancement).

import { NextResponse } from 'next/server'
import { getLocations } from '@/lib/dutchie'

const ENDPOINT =
  process.env.DUTCHIE_PLUS_ENDPOINT ?? 'https://plus.dutchie.com/plus/2021-07/graphql'

// same per-instance limiter + unspoofable client key as /api/lead (§9.4)
const hits = new Map<string, number[]>()
const LIMIT = 10
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
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json().catch(() => null)) as { data?: T; errors?: { message: string }[] } | null
  if (!json?.data) throw new Error(json?.errors?.[0]?.message ?? `HTTP ${res.status}`)
  return json.data
}

export async function POST(req: Request) {
  if (rateLimited(clientKey(req))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }
  const key = process.env.DUTCHIE_PLUS_PUBLIC_KEY
  if (process.env.DUTCHIE_PLUS_PROVIDER !== 'graphql' || !key) {
    // fixture mode: the bag falls back to the store-menu handoff
    return NextResponse.json({ error: 'Checkout API not active.' }, { status: 503 })
  }

  let body: { storeSlug?: unknown; menuType?: unknown; items?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // ── validation (§9.5): every field shape-checked, hard caps ──
  const storeSlug = typeof body.storeSlug === 'string' ? body.storeSlug : ''
  if (!RETAILER_MATCH[storeSlug]) {
    return NextResponse.json({ error: 'Unknown store.' }, { status: 400 })
  }
  const pricingType = body.menuType === 'medical' ? 'MEDICAL' : 'RECREATIONAL'
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
    const quantity = Math.min(Math.max(1, Math.floor(Number(qty) || 1)), 20)
    items.push({ productId, option, quantity })
  }
  if (!items.length) {
    return NextResponse.json({ error: 'No valid items.' }, { status: 400 })
  }

  try {
    // resolve the store's retailer id (name-matched — [0] is the sandbox)
    const locations = await getLocations()
    if (!locations.some((l) => l.slug === storeSlug)) {
      return NextResponse.json({ error: 'Unknown store.' }, { status: 400 })
    }
    const { retailers } = await gql<{ retailers: { id: string; name: string }[] }>(
      key,
      `{ retailers { id name } }`,
      {}
    )
    const retailer = retailers.find(
      (r) => RETAILER_MATCH[storeSlug].test(r.name) && !/sandbox/i.test(r.name)
    )
    if (!retailer) throw new Error('retailer not found')

    const created = await gql<{ createCheckout: { id: string; redirectUrl?: string } }>(
      key,
      `mutation ($rid: ID!, $pt: PricingType!) {
         createCheckout(retailerId: $rid, orderType: PICKUP, pricingType: $pt) { id redirectUrl }
       }`,
      { rid: retailer.id, pt: pricingType }
    )
    const checkoutId = created.createCheckout.id
    let redirectUrl = created.createCheckout.redirectUrl ?? null

    // sequential adds — well inside the 5 req/s budget for a real bag
    for (const it of items) {
      const added = await gql<{ addItem: { redirectUrl?: string } }>(
        key,
        `mutation ($rid: ID!, $cid: ID!, $pid: ID!, $q: Int!, $opt: String!) {
           addItem(retailerId: $rid, checkoutId: $cid, productId: $pid, quantity: $q, option: $opt) { redirectUrl }
         }`,
        { rid: retailer.id, cid: checkoutId, pid: it.productId, q: it.quantity, opt: it.option }
      )
      redirectUrl = added.addItem.redirectUrl ?? redirectUrl
    }

    if (!redirectUrl) throw new Error('no redirect url')
    return NextResponse.json({ url: redirectUrl })
  } catch {
    // never leak upstream detail; the bag falls back to the menu handoff
    return NextResponse.json({ error: 'Checkout unavailable.' }, { status: 502 })
  }
}
