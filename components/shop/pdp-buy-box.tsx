'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { ProductVariant } from '@/lib/dutchie'
import { addToCart } from '@/lib/cart'
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
export default function PdpBuyBox({
  offers,
  product,
}: {
  offers: StoreOffer[]
  product: { slug: string; name: string }
}) {
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
  const [added, setAdded] = useState(false)

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

  const doAdd = () => {
    if (!variant) return
    addToCart({
      slug: product.slug,
      name: product.name,
      variantId: variant.id,
      option: variant.option,
      price: variant.specialPrice ?? variant.price,
      storeSlug: offer.slug,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

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
      {/* no store dropdown (Avanti, 2026-08-04): the shopper arrives from a
          store's menu, so the context is already chosen. The line states it;
          Change opens the site's one picker. chooseStore stays for the
          ?store= deep-link resolution above. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Shopping at <span className="text-[var(--color-foreground)]">{offer.name}</span>
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('jb:pick-store'))}
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
        >
          Change
        </button>
      </div>

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

      <p className="mt-5" aria-live="polite">
        {!variant ? null : soldOut ? (
          <span className="text-xl font-extrabold text-[var(--color-muted)]">Sold out at {offer.name}</span>
        ) : onSale ? (
          <span className="flex flex-wrap items-baseline gap-x-4">
            <span className="sr-only">Was </span>
            <s className="text-xl font-bold text-[var(--color-muted)]">{money(variant.price)}</s>
            <span className="sr-only">, now </span>
            <span className="font-display text-[3.6rem] leading-none text-[var(--color-danger-solid)]">{money(variant.specialPrice!)}</span>
            <span className="rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-black">
              {pct}% off
            </span>
          </span>
        ) : (
          <span className="font-display text-[3.6rem] leading-none">{money(variant.price)}</span>
        )}
      </p>

      {/* Add to bag fills the local pre-checkout cart (lib/cart.ts) — the
          count lands in the header icon's center circle. CHECKOUT stays
          Dutchie's; the secondary link hands off to the store menu. */}
      {!soldOut && variant && (
        <button
          type="button"
          onClick={doAdd}
          className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-accent)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:text-[var(--color-accent)] hover:shadow-xl"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden>
            <path d="M5.2 8.2h13.6l-1.1 11.2a1.9 1.9 0 0 1-1.9 1.7H8.2a1.9 1.9 0 0 1-1.9-1.7L5.2 8.2Z" strokeLinejoin="round" />
            <path d="M9 8.2V6.5a3 3 0 0 1 6 0v1.7" />
          </svg>
          {added ? 'Added to bag ✓' : 'Add to bag'}
        </button>
      )}
      {/* mobile sticky buy bar (CRO, Avanti 2026-08-04): the CURRENT
          selection's price + Add stay on screen while scrolling. Sits above
          the mobile tab bar (bottom-3, z-30); hidden once the desktop
          two-column layout keeps the ticket in view. */}
      {!soldOut && variant && (
        <div className="fixed inset-x-3 bottom-20 z-40 lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-black/10 bg-[#0b0b0b]/95 py-1.5 pl-5 pr-1.5 text-white shadow-2xl backdrop-blur-md">
            <span className="min-w-0">
              <span className="font-display block text-2xl leading-none">
                {money(variant.specialPrice ?? variant.price)}
              </span>
              <span className="block truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {variant.option} · {offer.name}
              </span>
            </span>
            <button
              type="button"
              onClick={doAdd}
              className="shrink-0 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black transition hover:bg-white"
            >
              {added ? 'Added ✓' : 'Add to bag'}
            </button>
          </div>
        </div>
      )}
      <Link
        href={menuPathFor(offer.slug, offer.state)}
        className={`mt-3 inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-sm font-extrabold uppercase tracking-widest transition ${
          soldOut
            ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-90'
            : 'border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
        }`}
      >
        {soldOut ? `Browse ${offer.name}` : `Shop more at ${offer.name}`}
      </Link>
    </div>
  )
}
