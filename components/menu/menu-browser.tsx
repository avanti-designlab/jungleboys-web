'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
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

// Strain colours are TOKENS, not literals: the same label rendered in three
// different blues across six shop files before these existed, and two of the
// palettes failed AA. The -card set THEMES: the label sits on --color-surface,
// which is white in light mode, where the on-dark set measured 2.2–2.7:1.
const STRAIN_TOKEN: Record<StrainType, string> = {
  indica: 'var(--strain-card-indica)',
  sativa: 'var(--strain-card-sativa)',
  hybrid: 'var(--strain-card-hybrid)',
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

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

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 ${
        soldOut ? 'opacity-60' : 'hover:-translate-y-1'
      }`}
    >
      {/* media-well, not ink: Dutchie shots are white-background JPGs, and on
          a dark well every one reads as a floating white box */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-media-well)]">
        {shot && (
          <Image
            src={shot.url}
            alt={shot.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {soldOut && (
          <span
            className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Sold out
          </span>
        )}
        {!soldOut && onSale && (
          <span
            className="absolute left-3 top-3 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-accent)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Special
          </span>
        )}
        {hot && !soldOut && (
          <span
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
          >
            Hot
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4" style={{ fontFamily: 'var(--font-brand)' }}>
        {/* House-brand products stay unlabelled; on a multi-brand menu the
            third-party name is the information (Jeeter vs JB at a glance). */}
        {!/^jungle boys/i.test(product.brand) && (
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {product.brand}
          </span>
        )}
        {product.strainType && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: STRAIN_TOKEN[product.strainType] }}
          >
            {STRAIN_LABEL[product.strainType]}
          </span>
        )}
        <h3 className="mt-1 text-base font-extrabold uppercase leading-tight">
          {/* Stretched link: the whole card is clickable but the ACCESSIBLE
              name is the product name, not a div soup. ?store= tells the PDP
              buy box which store's menu the shopper came from. */}
          <Link
            href={`/shop/${product.slug}?store=${storeSlug}`}
            className="after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>

        {product.labResult?.potency?.thc && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            THC {product.labResult.potency.thc.value}
            {product.labResult.potency.thc.unit}
          </p>
        )}

        <div className="mt-auto pt-3 text-sm font-extrabold">
          {soldOut ? (
            <span className="text-[var(--color-muted)]">Unavailable</span>
          ) : onSale ? (
            <span className="flex flex-wrap items-baseline gap-x-2">
              {/* The original is struck AND labelled for assistive tech: a line
                  through a number is a visual convention screen readers do not
                  convey, so "was $45" carries the meaning the strike implies. */}
              <span className="sr-only">Was </span>
              <s className="font-bold text-[var(--color-muted)]">{money(best.price)}</s>
              <span className="sr-only">, now </span>
              <span>{money(from)}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-ink)]">
                {percentOff}% off
              </span>
            </span>
          ) : (
            <>
              <span className="text-[var(--color-muted)]">from </span>
              {money(from)}
            </>
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
      <div className="mx-auto max-w-6xl">
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
