'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, ProductVariant, StrainType } from '@/lib/dutchie'
import { addToCart } from '@/lib/cart'
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
// white card, outlined strain chip in the strain colour (gold stage removed —
// Avanti 2026-08-03: no glow around product shots).
// The card is WHITE IN BOTH THEMES — a brand-light surface like the line
// pages themselves — so the fixed on-white strain palette is the correct one.
const STRAIN_STYLE: Record<StrainType, { label: string; cls: string }> = {
  indica: { label: 'Indica', cls: 'border-[var(--strain-indica)] text-[var(--strain-indica)]' },
  sativa: { label: 'Sativa', cls: 'border-[var(--strain-sativa)] text-[var(--strain-sativa)]' },
  hybrid: { label: 'Hybrid', cls: 'border-[var(--strain-hybrid)] text-[var(--strain-hybrid)]' },
}

const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`

// Chip label for the active ?line= filter. A comma list (one dropdown item
// covering sibling subcategories) reads as the slugs' common prefix —
// "gas-tank-flavors,gas-tank-live-resin,…" → "gas tank".
function lineChipLabel(line: string): string {
  const slugs = line.split(',')
  if (slugs.length === 1) return line.replace(/-/g, ' ')
  const tokened = slugs.map((s) => s.split('-'))
  const prefix: string[] = []
  for (let i = 0; tokened.every((t) => t[i] && t[i] === tokened[0][i]); i++) prefix.push(tokened[0][i])
  return prefix.length ? prefix.join(' ') : slugs[0].replace(/-/g, ' ')
}

// The card CTA is a REAL bag action (Avanti, 2026-08-03: no "Shop" label —
// every card on the commerce pages adds to cart). Adds the card's displayed
// variant at its displayed price; flips to "Added ✓" for a beat so the action
// reads without a panel opening. The header count follows via jb:cart-changed.
function AddToCartButton({
  product,
  variant,
  storeSlug,
}: {
  product: Product
  variant: ProductVariant
  storeSlug: string
}) {
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])
  const add = () => {
    addToCart({
      slug: product.slug,
      name: product.name,
      variantId: variant.id,
      option: variant.option,
      price: variant.specialPrice ?? variant.price,
      storeSlug,
    })
    setAdded(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }
  return (
    <button
      type="button"
      onClick={add}
      aria-label={`Add ${product.name} (${variant.option}) to cart`}
      className={`relative z-20 inline-flex shrink-0 items-center rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-200 ${
        added
          ? 'bg-[var(--color-accent)] text-black'
          : 'bg-black text-white hover:bg-[var(--color-accent)] hover:text-black'
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  )
}

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
      {/* stage — the shot CONTAINED in a fixed
          centered box rather than bottom-anchored at 88% width. The line pages
          anchor deliberately (their art is curated cutouts); Dutchie uploads
          are 1:1 at wildly different framings, and width-anchoring rendered a
          tall jar cropped and a flat bag tiny (Avanti, 2026-08-03). Contain
          gives every product the SAME visual frame regardless of source. */}
      <div className="relative aspect-square overflow-hidden">
        {shot && (
          // eslint-disable-next-line @next/next/no-img-element -- pack shot
          <img
            src={shot.url}
            alt={shot.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-7 drop-shadow-[0_24px_36px_rgba(0,0,0,0.22)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
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
          {/* A REAL add-to-cart, not a Shop link (Avanti, 2026-08-03: every
              card on these pages carries the add-to-cart button). Adds the
              displayed variant — the one whose price the shopper is reading —
              at its shown price. z-20 lifts it above the stretched card link. */}
          {!soldOut && <AddToCartButton product={product} variant={best} storeSlug={storeSlug} />}
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
function FiltersFromQuery({
  categories,
  onCategory,
  onLine,
}: {
  categories: ProductCategory[]
  onCategory: (c: ProductCategory) => void
  onLine: (l: string) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    const c = searchParams.get('category')
    if (c && (categories as string[]).includes(c)) onCategory(c as ProductCategory)
    // ?line= filters by SUBCATEGORY (the JB lines in the header's PRODUCTS
    // dropdown). Deliberately NOT validated against the catalogue: a drifted
    // slug must surface as a loudly-empty list, not silently unfilter.
    const l = searchParams.get('line')
    if (l) onLine(l)
  }, [searchParams, categories, onCategory, onLine])
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
  const [line, setLine] = useState<string | 'all'>('all')
  // Facet rail selections (Avanti, 2026-08-04) — multi-select sets, all
  // derived from the live menu the way the Dutchie embed's rail is.
  const [brandSet, setBrandSet] = useState<Set<string>>(new Set())
  const [subcatSet, setSubcatSet] = useState<Set<string>>(new Set())
  const [weightSet, setWeightSet] = useState<Set<string>>(new Set())
  const [dealsOnly, setDealsOnly] = useState(false)

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  )

  // The pool the facets describe: category + line narrowed, before the rail's
  // own selections — so option counts stay stable as you tick them.
  const pool = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          // ?line= may carry a comma list — one dropdown item covering sibling
          // subcategories (Gas Tanks = flavors + live resin + live rosin,
          // Avanti 2026-08-03). Each slug still matches exactly; a drifted one
          // still yields a loudly-empty list.
          (line === 'all' || line.split(',').includes(p.subcategory ?? ''))
      ),
    [products, category, line]
  )

  const facet = (values: (string | undefined)[]) => {
    const m = new Map<string, number>()
    for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }
  const brandOptions = useMemo(() => facet(pool.map((p) => p.brand)), [pool])
  const subcatOptions = useMemo(() => facet(pool.map((p) => p.subcategory)), [pool])
  const weightOptions = useMemo(() => {
    const opts = facet(pool.flatMap((p) => p.variants.map((v) => v.option)))
    const grams = (o: string) => parseFloat(o.replace(/[^\d.]/g, '')) || 0
    return opts.sort((a, b) => grams(a[0]) - grams(b[0]))
  }, [pool])

  const toggle = (set: Set<string>, apply: (s: Set<string>) => void, v: string) => {
    const next = new Set(set)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    apply(next)
  }

  const shown = useMemo(
    () =>
      pool.filter(
        (p) =>
          (strain === 'all' || p.strainType === strain) &&
          (brandSet.size === 0 || brandSet.has(p.brand)) &&
          (subcatSet.size === 0 || subcatSet.has(p.subcategory ?? '')) &&
          (weightSet.size === 0 || p.variants.some((v) => weightSet.has(v.option))) &&
          (!dealsOnly || p.variants.some((v) => v.specialPrice != null && v.specialPrice < v.price))
      ),
    [pool, strain, brandSet, subcatSet, weightSet, dealsOnly]
  )

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
      active
        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]'
        : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
    }`

  const facetGroup = (
    title: string,
    options: [string, number][],
    set: Set<string>,
    apply: (s: Set<string>) => void,
    label: (v: string) => string = (v) => v
  ) =>
    options.length > 1 ? (
      <div data-facet={title.toLowerCase()} className="border-t border-[var(--color-border)] py-4 first:border-t-0 first:pt-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          {title}
        </p>
        <ul className="mt-3 space-y-1.5">
          {options.map(([v, n]) => (
            <li key={v}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--color-foreground)]/85 hover:text-[var(--color-foreground)]">
                <input
                  type="checkbox"
                  checked={set.has(v)}
                  onChange={() => toggle(set, apply, v)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="min-w-0 flex-1 truncate">{label(v)}</span>
                <span className="text-[11px] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {n}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    ) : null

  return (
    <section className="px-6 pt-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <Suspense>
          <FiltersFromQuery categories={categories} onCategory={setCategory} onLine={setLine} />
        </Suspense>

        {/* header — big Bebas, live count riding it */}
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-5xl uppercase leading-none md:text-7xl">
            {category === 'all' ? 'Shop all' : categoryLabel(category)}
          </h2>
          <p aria-live="polite" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
            {shown.length} {shown.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
          <button type="button" onClick={() => setCategory('all')} className={pill(category === 'all')}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={pill(category === c)}>
              {categoryLabel(c)}
            </button>
          ))}
        </div>

        {/* active JB-line filter (set by the header's PRODUCTS dropdown) —
            one chip, one clear action */}
        {line !== 'all' && (
          <div className="mt-3" style={{ fontFamily: 'var(--font-brand)' }}>
            <button type="button" onClick={() => setLine('all')} className={pill(true)}>
              {lineChipLabel(line)} ✕
            </button>
          </div>
        )}

        {/* strain pills stay up top on every viewport — the one-tap filter */}
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

        {/* ── sticky facet rail (desktop) + grid ──
            Facets mirror the Dutchie embed's rail — subcategories, weights,
            brands, deals — every option derived from the live menu with a
            count, so nothing filters to a surprise. */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside
            data-facet-rail
            className="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto pr-2 lg:block"
          >
            <label className="mb-4 flex cursor-pointer items-center gap-2.5 rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]">
              <input
                type="checkbox"
                checked={dealsOnly}
                onChange={() => setDealsOnly((d) => !d)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              On sale only
            </label>
            {facetGroup('Subcategories', subcatOptions, subcatSet, setSubcatSet, (v) => v.replace(/-/g, ' '))}
            {facetGroup('Weights', weightOptions, weightSet, setWeightSet)}
            {facetGroup('Brands', brandOptions, brandSet, setBrandSet)}
          </aside>

          <div className="min-w-0">
            {shown.length === 0 ? (
              <p className="py-16 text-center text-[var(--color-muted)]">
                Nothing matches that combination right now.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
