'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product, ProductCategory, StrainType } from '@/lib/dutchie'

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
// palettes failed AA. These are the on-dark set.
const STRAIN_TOKEN: Record<StrainType, string> = {
  indica: 'var(--strain-indica-on-dark)',
  sativa: 'var(--strain-sativa-on-dark)',
  hybrid: 'var(--strain-hybrid-on-dark)',
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

function categoryLabel(c: ProductCategory): string {
  return c.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function ProductCard({ product }: { product: Product }) {
  const inStock = product.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
  const soldOut = inStock.length === 0
  const from = inStock.length
    ? Math.min(...inStock.map((v) => v.specialPrice ?? v.price))
    : Math.min(...product.variants.map((v) => v.specialPrice ?? v.price))
  const onSale = inStock.some((v) => v.specialPrice != null)
  const shot = product.images[0]

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 ${
        soldOut ? 'opacity-60' : 'hover:-translate-y-1'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-ink)]">
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
      </div>

      <div className="flex flex-1 flex-col p-4" style={{ fontFamily: 'var(--font-brand)' }}>
        {product.strainType && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: STRAIN_TOKEN[product.strainType] }}
          >
            {STRAIN_LABEL[product.strainType]}
          </span>
        )}
        <h3 className="mt-1 text-base font-extrabold uppercase leading-tight">{product.name}</h3>

        {product.labResult?.potency?.thc && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            THC {product.labResult.potency.thc.value}
            {product.labResult.potency.thc.unit}
          </p>
        )}

        <p className="mt-auto pt-3 text-sm font-extrabold">
          {soldOut ? (
            <span className="text-[var(--color-muted)]">Unavailable</span>
          ) : (
            <>
              <span className="text-[var(--color-muted)]">from </span>
              {money(from)}
            </>
          )}
        </p>
      </div>
    </article>
  )
}

export default function MenuBrowser({ products }: { products: Product[] }) {
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
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
