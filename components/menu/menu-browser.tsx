'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, StrainType } from '@/lib/dutchie'
import { categoryLabel } from './labels'

// Category + strain filtering over a store's menu. Client-side because the whole
// menu is already on the page: filtering 13-200 products in the browser is
// instant and costs no round trip. When Dutchie's catalogue is large enough that
// this stops being true, the filter moves into getProducts() — which the frozen
// interface already supports via ProductFilter, so only this file changes.

const STRAIN_LABEL: Record<StrainType, string> = {
  indica: 'Indica', sativa: 'Sativa', hybrid: 'Hybrid',
}

// Same card language as the Phase 2 line pages (Avanti, 2026-08-03: "all
// product cards should match the designs we built on the JB product pages"):
// white card, gold radial stage, outlined strain chip in the strain colour.
// The card is WHITE IN BOTH THEMES — a brand-light surface like the line
// pages themselves — so the fixed on-white strain palette is the correct one.
const STRAIN_STYLE: Record<StrainType, { label: string; cls: string }> = {
  indica: { label: 'Indica', cls: 'border-[var(--strain-indica)] text-[var(--strain-indica)]' },
  sativa: { label: 'Sativa', cls: 'border-[var(--strain-sativa)] text-[var(--strain-sativa)]' },
  hybrid: { label: 'Hybrid', cls: 'border-[var(--strain-hybrid)] text-[var(--strain-hybrid)]' },
}

const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`

// Exported because the Brands page renders the same card grouped by brand —
// one card, one strain palette, one price rule across every commerce surface.
// `hot` adds the red push-badge for the storefront's Hot Items shelf.
export function ProductCard({
  product,
  storeSlug,
  hot = false,
}: {
  product: Product
  storeSlug: string
  hot?: boolean
}) {
  const inStock = product.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
  const soldOut = inStock.length === 0
  // Price off the CHEAPEST buyable variant, and the discount is derived from
  // that same variant rather than assembled from two different ones — otherwise
  // the struck-through figure belongs to a size the shopper is not being quoted.
  const pool = inStock.length ? inStock : product.variants
  const best = pool.reduce((a, b) => ((b.specialPrice ?? b.price) < (a.specialPrice ?? a.price) ? b : a))
  const from = best.specialPrice ?? best.price
  const onSale = best.specialPrice != null && best.specialPrice < best.price
  const percentOff = onSale ? Math.round((1 - best.specialPrice! / best.price) * 100) : 0
  const shot = product.images[0]
  const thc = product.labResult?.potency?.thc
  const terps = product.labResult?.terpenes?.reduce((sum, t) => sum + t.percentage, 0)
  const strain = product.strainType ? STRAIN_STYLE[product.strainType] : null

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-[var(--color-ink)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${
        soldOut ? 'opacity-60' : ''
      }`}
    >
      {/* stage — the line-page treatment: gold radial glow, pack shot anchored
          to the bottom, lift on hover. White stage also absorbs the baked-white
          backgrounds of real Dutchie JPGs. */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_68%,rgba(233,193,90,0.28),transparent_72%)]" />
        {shot && (
          // eslint-disable-next-line @next/next/no-img-element -- pack shot, same treatment as the line pages
          <img
            src={shot.url}
            alt={shot.alt}
            loading="lazy"
            className="absolute bottom-[-3%] left-1/2 w-[88%] -translate-x-1/2 drop-shadow-[0_24px_36px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
          />
        )}
        {soldOut ? (
          <span
            className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-ink)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Sold out
          </span>
        ) : onSale ? (
          <span
            className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-black"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {percentOff}% off
          </span>
        ) : null}
        {hot && !soldOut && (
          <span
            className="absolute right-4 top-4 z-20 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white"
            style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
          >
            Hot
          </span>
        )}
      </div>

      {/* info — chip row, Bebas name, Bebas price. Identical bones to the
          flower/pops/line shop cards. */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5" style={{ fontFamily: 'var(--font-brand)' }}>
          {/* House brand stays unlabelled; a third-party chip is information */}
          {!/^jungle boys/i.test(product.brand) && (
            <span className="rounded-full border border-[var(--color-ink)]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/75">
              {product.brand}
            </span>
          )}
          {strain && (
            <span className={`rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${strain.cls}`}>
              {strain.label}
            </span>
          )}
          {thc && (
            <span className="rounded-full border border-[var(--color-ink)]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/75">
              THC {thc.value}
              {thc.unit}
            </span>
          )}
          {terps ? (
            <span className="rounded-full border border-[var(--color-ink)]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/75">
              Terps {terps.toFixed(1)}%
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-[2rem] uppercase leading-[0.9]">
          {/* Stretched link: the whole card is clickable but the ACCESSIBLE
              name is the product name. ?store= tells the PDP buy box which
              store's menu the shopper came from. */}
          <Link
            href={`/shop/${product.slug}?store=${storeSlug}`}
            className="after:absolute after:inset-0 after:z-10"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <p className="leading-none">
            {onSale && (
              <span
                className="mb-1 block text-xs font-bold text-[var(--color-ink)]/60"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {/* struck AND labelled: a line through a number is a visual
                    convention screen readers do not convey */}
                <span className="sr-only">Was </span>
                <s>{money(best.price)}</s>
                <span className="sr-only">, now</span>
              </span>
            )}
            <span className="whitespace-nowrap">
              {soldOut ? (
                <span className="text-sm font-bold uppercase text-[var(--color-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  Unavailable here
                </span>
              ) : (
                <>
                  {pool.length > 1 && !onSale && (
                    <span className="mr-1 text-xs font-bold uppercase text-[var(--color-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
                      from
                    </span>
                  )}
                  <span className={`font-display text-[1.9rem] leading-none ${onSale ? 'text-[var(--color-danger-solid)]' : ''}`}>
                    {money(from)}
                  </span>
                  <span className="ml-1 text-xs font-bold uppercase text-[var(--color-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
                    · {best.option}
                  </span>
                </>
              )}
            </span>
          </p>
          {/* CTA reads as the line pages' pill; the stretched link above is the
              real control, so this is presentation only */}
          {!soldOut && (
            <span
              aria-hidden
              className="inline-flex shrink-0 items-center rounded-full bg-black px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-black"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Shop
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

// The storefront's shelf "View all" links deep-link a category into the grid
// via ?category=<c>#browse. useSearchParams makes its whole Suspense boundary
// bail out of static prerender, so it lives in THIS null-rendering child with
// its own boundary — putting it in MenuBrowser itself de-SSR'd every browse
// grid on the site (check-commerce caught the deals page shipping zero PDP
// links, the exact PDP-buy-box mistake again). The grid stays in server HTML;
// only the filter nudge is client-side.
function CategoryFromQuery({
  categories,
  onCategory,
}: {
  categories: ProductCategory[]
  onCategory: (c: ProductCategory) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const c = searchParams.get('category')
    if (c && (categories as string[]).includes(c)) onCategory(c as ProductCategory)
  }, [searchParams, categories, onCategory])
  return null
}

export default function MenuBrowser({
  products,
  storeSlug,
}: {
  products: Product[]
  storeSlug: string
}) {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [strain, setStrain] = useState<StrainType | 'all'>('all')

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  )


  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          (strain === 'all' || p.strainType === strain)
      ),
    [products, category, strain]
  )

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
      active
        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]'
        : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
    }`

  return (
    <section className="px-6 pt-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <Suspense>
          <CategoryFromQuery categories={categories} onCategory={setCategory} />
        </Suspense>
        <div className="flex flex-wrap gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
          <button type="button" onClick={() => setCategory('all')} className={pill(category === 'all')}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={pill(category === c)}>
              {categoryLabel(c)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
          <button type="button" onClick={() => setStrain('all')} className={pill(strain === 'all')}>
            Any type
          </button>
          {(['indica', 'sativa', 'hybrid'] as StrainType[]).map((s) => (
            <button key={s} type="button" onClick={() => setStrain(s)} className={pill(strain === s)}>
              {STRAIN_LABEL[s]}
            </button>
          ))}
        </div>

        {/* aria-live so a filter change is announced; the grid is the only thing
            that moves and a sighted user sees it immediately. */}
        <p aria-live="polite" className="mt-6 text-xs text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          {shown.length} {shown.length === 1 ? 'product' : 'products'}
        </p>

        {shown.length === 0 ? (
          <p className="py-16 text-center text-[var(--color-muted)]">
            Nothing matches that combination right now.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
