'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, ProductVariant, StrainType } from '@/lib/dutchie'
import { addToCart } from '@/lib/cart'
import { categoryLabel, STRAIN_STYLE } from './labels'
import { CATEGORY_ICONS, iconScale } from '@/lib/category-icons'
import { FIXED_CATEGORIES } from '@/lib/collections'

// Category + strain filtering over a store's menu. Client-side because the whole
// menu is already on the page: filtering 13-200 products in the browser is
// instant and costs no round trip. When Dutchie's catalogue is large enough that
// this stops being true, the filter moves into getProducts() — which the frozen
// interface already supports via ProductFilter, so only this file changes.

const STRAIN_LABEL: Record<StrainType, string> = {
  indica: 'Indica', sativa: 'Sativa', hybrid: 'Hybrid',
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
export function AddToCartButton({
  product,
  variant,
  storeSlug,
  tone = 'dark',
  fit,
}: {
  product: Product
  variant: ProductVariant
  storeSlug: string
  /** 'gold' for dark grounds where a black pill disappears */
  tone?: 'dark' | 'gold'
  /** 'card' = full-width centered inside a narrow @container card row */
  fit?: 'card'
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
  // PillCta language (Avanti, 2026-08-04): label + the cart icon in a
  // contrasting circle on the right, like every CTA pill across the site.
  return (
    <button
      type="button"
      onClick={add}
      aria-label={`Add ${product.name} (${variant.option}) to cart`}
      className={`group/atc relative z-20 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-3 pr-1 text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-200 ${fit === 'card' ? 'w-full justify-center @[16rem]:w-auto @[16rem]:justify-start' : ''} ${
        added
          ? tone === 'gold'
            ? 'bg-white text-black'
            : 'bg-[var(--color-accent)] text-black'
          : tone === 'gold'
            ? 'bg-[var(--color-accent)] text-black hover:bg-white'
            : 'bg-black text-white hover:bg-[var(--color-accent)] hover:text-black'
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ${
          tone === 'gold'
            ? 'bg-black text-[var(--color-accent)]'
            : 'bg-white text-black group-hover/atc:bg-black group-hover/atc:text-[var(--color-accent)]'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
          <circle cx="9.5" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.15 11a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.78L20.2 8H6.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
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
  const strain = product.strainType ? STRAIN_STYLE[product.strainType] : null

  return (
    <article
      className={`group @container relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-[var(--color-ink)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${
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

        {/* ONE line on desktop-width cards (Avanti: "on one line"); on
            narrow mobile 2-col cards the pill goes FULL WIDTH below the
            price (Avanti, 2026-08-04 mobile pass) — container query on the
            CARD, not the viewport, so shelf and grid cards each do the
            right thing */}
        <div className="mt-auto flex flex-col gap-2 pt-1 @[16rem]:flex-row @[16rem]:items-center @[16rem]:justify-between">
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
                  <span className={`font-display text-[1.7rem] leading-none ${onSale ? 'text-[var(--color-danger-solid)]' : ''}`}>
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
          {!soldOut && <AddToCartButton product={product} variant={best} storeSlug={storeSlug} fit="card" />}
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

export interface CategoryNavItem {
  href: string
  label: string
  icon?: string | null
  active?: boolean
}

export default function MenuBrowser({
  products,
  storeSlug,
  heading,
  categoryNav,
}: {
  products: Product[]
  storeSlug: string
  /** collection pages pass null — their hero already carries the title */
  heading?: string | null
  /** collection pages: category tiles become LINKS to sibling pages
      (Avanti, 2026-08-04 — every category/line is its own shopping page) */
  categoryNav?: CategoryNavItem[]
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

  // FIXED set (Avanti, 2026-08-04) — never derived from what happens to be
  // stocked; an empty pick shows the honest empty state.
  const categories = FIXED_CATEGORIES

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

  // Facet group = eyebrow + PILL ROWS (Avanti, 2026-08-04: pills over
  // checkboxes across every sticky rail). Multi-select: a tapped pill goes
  // gold; the count rides the right edge.
  const facetGroup = (
    title: string,
    options: [string, number][],
    set: Set<string>,
    apply: (s: Set<string>) => void,
    label: (v: string) => string = (v) => v
  ) =>
    options.length > 1 ? (
      <div data-facet={title.toLowerCase()} className="border-t border-[var(--color-border)] pt-4">
        <p className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
          {title}
        </p>
        <ul className="mb-4 mt-2.5 space-y-1">
          {options.map(([v, n]) => {
            const on = set.has(v)
            return (
              <li key={v}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(set, apply, v)}
                  className={`flex w-full items-center justify-between gap-3 rounded-full py-2 pl-4 pr-3 text-left transition-colors duration-150 ${
                    on
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'text-[var(--color-foreground)]/85 hover:bg-[var(--color-background)]'
                  }`}
                >
                  <span className="font-display min-w-0 flex-1 truncate text-[16px] uppercase leading-none tracking-[0.03em]">
                    {label(v)}
                  </span>
                  <span className={`text-[10px] font-bold ${on ? 'text-black/60' : 'text-[var(--color-muted)]'}`} style={{ fontFamily: 'var(--font-brand)' }}>
                    {n}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    ) : null

  return (
    <section className="px-6 pt-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        <Suspense>
          <FiltersFromQuery categories={categories} onCategory={setCategory} onLine={setLine} />
        </Suspense>

        {/* header — big Bebas, live count riding it; collection pages pass
            heading={null} because their hero already says it */}
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          {heading !== null && (
            <h2 className="font-display text-5xl uppercase leading-none md:text-7xl">
              {heading ?? (category === 'all' ? 'Shop all' : categoryLabel(category))}
            </h2>
          )}
          <p aria-live="polite" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
            {shown.length} {shown.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* MOBILE keeps the one-tap pill rows; on desktop categories + types
            live in the rail (Avanti, 2026-08-04) */}
        <div className="mt-5 flex flex-wrap gap-2 lg:hidden" style={{ fontFamily: 'var(--font-brand)' }}>
          {categoryNav ? (
            categoryNav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={n.active ? 'page' : undefined} className={pill(!!n.active)}>
                {n.label}
              </Link>
            ))
          ) : (
            <>
              <button type="button" onClick={() => setCategory('all')} className={pill(category === 'all')}>
                All
              </button>
              {categories.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)} className={pill(category === c)}>
                  {categoryLabel(c)}
                </button>
              ))}
            </>
          )}
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

        <div className="mt-3 flex flex-wrap gap-2 lg:hidden" style={{ fontFamily: 'var(--font-brand)' }}>
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
            The rail is the whole filter story on desktop: category TILES,
            type pills, on-sale toggle, then Dutchie-style facets — every
            option derived from the live menu with a count. */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[270px_1fr]">
          <aside
            data-facet-rail
            className="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:block"
          >
            {/* categories as icon tiles — client filters on the store menu,
                LINKS to sibling pages on collection pages */}
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Categories
            </p>
            <div className="mb-4 mt-2.5 grid grid-cols-2 gap-1.5">
              {categoryNav ? (
                categoryNav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={n.active ? 'page' : undefined}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 pb-2.5 pt-3 transition-colors duration-150 ${
                      n.active ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-background)] hover:bg-[var(--color-accent)]/20'
                    }`}
                  >
                    {n.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element -- brand icon
                      <img src={n.icon} alt="" className={`h-9 w-9 object-contain ${iconScale(n.icon)}`} />
                    ) : (
                      <span aria-hidden className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black/60">
                        {n.label.slice(0, 1)}
                      </span>
                    )}
                    <span className="font-display text-center text-[13px] uppercase leading-none tracking-[0.04em]">
                      {n.label}
                    </span>
                  </Link>
                ))
              ) : (
                <>
                  <button
                    type="button"
                    aria-pressed={category === 'all'}
                    onClick={() => setCategory('all')}
                    className={`font-display col-span-2 rounded-2xl py-2.5 text-[16px] uppercase leading-none tracking-[0.04em] transition-colors duration-150 ${
                      category === 'all' ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-background)] hover:bg-[var(--color-accent)]/20'
                    }`}
                  >
                    All products
                  </button>
                  {categories.map((c) => {
                    const icon = CATEGORY_ICONS[c]
                    const on = category === c
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setCategory(on ? 'all' : c)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 pb-2.5 pt-3 transition-colors duration-150 ${
                          on ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-background)] hover:bg-[var(--color-accent)]/20'
                        }`}
                      >
                        {icon ? (
                          // eslint-disable-next-line @next/next/no-img-element -- brand icon
                          <img src={icon} alt="" className={`h-9 w-9 object-contain ${iconScale(icon)}`} />
                        ) : (
                          <span aria-hidden className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black/60">
                            {categoryLabel(c).slice(0, 1)}
                          </span>
                        )}
                        <span className="font-display text-[13px] uppercase leading-none tracking-[0.04em]">
                          {categoryLabel(c)}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>

            {/* type pills */}
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Type
            </p>
            <div className="mb-4 mt-2.5 flex flex-wrap gap-1.5">
              {(['all', 'indica', 'sativa', 'hybrid'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={strain === s}
                  onClick={() => setStrain(s as StrainType | 'all')}
                  className={`font-display rounded-full px-3.5 py-2 text-[14px] uppercase leading-none tracking-[0.04em] transition-colors duration-150 ${
                    strain === s ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-background)] hover:bg-[var(--color-accent)]/20'
                  }`}
                >
                  {s === 'all' ? 'Any' : STRAIN_LABEL[s as StrainType]}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={dealsOnly}
              onClick={() => setDealsOnly((d) => !d)}
              className={`font-display mb-4 w-full rounded-full py-2.5 text-[15px] uppercase leading-none tracking-[0.05em] transition-colors duration-150 ${
                dealsOnly ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-background)] hover:bg-[var(--color-accent)]/20'
              }`}
            >
              {dealsOnly ? 'On sale only ✓' : 'On sale only'}
            </button>

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
