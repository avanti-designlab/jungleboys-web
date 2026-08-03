'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { ProductVariant } from '@/lib/dutchie'
import { menuPathFor, readStore, writeStore } from '@/lib/store-selection'

export type StoreOffer = {
  slug: string
  name: string
  city: string
  state: 'CA' | 'FL'
  variants: ProductVariant[]
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

// The buy box — the only part of the PDP that is store-dependent.
//
// ONE canonical page per product, with the store switched here rather than in
// the URL. Nesting the PDP per store would have produced ~180 pages (thousands
// once third-party brands land) differing only in price and stock — textbook
// near-duplicates that compete with each other for the same product query.
// Local intent is already owned by the store menu pages, which are the
// highest-traffic URLs on the site. `?store=` deep-links still work and still
// resolve here; the canonical stays clean.
export default function PdpBuyBox({ offers }: { offers: StoreOffer[] }) {
  // Seeded from the first STOCKED offer so the server renders a real price.
  // Starting at null meant the buy box returned null during SSR — no price in
  // the crawlable HTML at all, on the one page whose entire purpose is ranking
  // for the product. The effect below refines the choice once the client knows
  // about ?store= and the saved store; it does not create the content.
  const [slug, setSlug] = useState<string | null>(
    () =>
      offers.find((o) => o.variants.some((v) => (v.quantityAvailable ?? 0) > 0))?.slug ??
      offers[0]?.slug ??
      null
  )
  const [variantId, setVariantId] = useState<string | null>(null)

  // Resolve the store once on the client: ?store= wins (a shared link is an
  // explicit intent), then the visitor's saved choice, then the first store
  // that actually has this product in stock — never an arbitrary first entry,
  // which would open on "Unavailable" while a neighbouring store has it.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('store')
    const saved = readStore()?.slug
    const stocked = offers.find((o) => o.variants.some((v) => (v.quantityAvailable ?? 0) > 0))
    const chosen =
      offers.find((o) => o.slug === param)?.slug ??
      offers.find((o) => o.slug === saved)?.slug ??
      stocked?.slug ??
      offers[0]?.slug ??
      null
    setSlug(chosen)
  }, [offers])

  const offer = useMemo(() => offers.find((o) => o.slug === slug) ?? null, [offers, slug])

  const variant = useMemo(() => {
    if (!offer) return null
    const inStock = offer.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
    const pool = inStock.length ? inStock : offer.variants
    return pool.find((v) => v.id === variantId) ?? pool[0] ?? null
  }, [offer, variantId])

  if (!offer) return null

  const soldOut = (variant?.quantityAvailable ?? 0) <= 0
  const onSale = variant?.specialPrice != null && variant.specialPrice < variant.price
  const pct = onSale ? Math.round((1 - variant!.specialPrice! / variant!.price) * 100) : 0

  const chooseStore = (next: string) => {
    setSlug(next)
    setVariantId(null)
    const o = offers.find((x) => x.slug === next)
    // Persist so the rest of the site follows the same store the shopper just
    // picked here — the picker, the menu and this page share one source.
    if (o) writeStore(o.slug, o.state)
  }

  return (
    <div style={{ fontFamily: 'var(--font-brand)' }}>
      <label htmlFor="pdp-store" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
        Store
      </label>
      <select
        id="pdp-store"
        value={offer.slug}
        onChange={(e) => chooseStore(e.target.value)}
        className="mt-1 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-bold text-[var(--color-foreground)]"
      >
        {offers.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name} — {o.city}
          </option>
        ))}
      </select>

      {offer.variants.length > 1 && (
        <fieldset className="mt-5">
          <legend className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {offer.variants.map((v) => {
              const out = (v.quantityAvailable ?? 0) <= 0
              const active = v.id === variant?.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                    active
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
                  } ${out ? 'opacity-50' : ''}`}
                >
                  {v.option}
                  {out && <span className="sr-only"> (sold out)</span>}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <p className="mt-5 text-2xl font-extrabold" aria-live="polite">
        {!variant ? null : soldOut ? (
          <span className="text-[var(--color-muted)]">Sold out at {offer.name}</span>
        ) : onSale ? (
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="sr-only">Was </span>
            <s className="text-base font-bold text-[var(--color-muted)]">{money(variant.price)}</s>
            <span className="sr-only">, now </span>
            <span>{money(variant.specialPrice!)}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-ink)]">
              {pct}% off
            </span>
          </span>
        ) : (
          money(variant.price)
        )}
      </p>

      {/* Checkout is Dutchie's, always — we never take payment or hold a cart.
          Until the Phase 3 cart lands this sends the shopper to the store menu
          rather than rendering a dead "Add to bag" that does nothing. */}
      <Link
        href={menuPathFor(offer.slug, offer.state)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-accent)] transition hover:opacity-90"
      >
        {soldOut ? `Browse ${offer.name}` : `Shop at ${offer.name}`}
      </Link>
    </div>
  )
}
