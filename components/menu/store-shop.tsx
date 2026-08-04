import Image from 'next/image'
import Link from 'next/link'
import type { Menu, Product, ProductCategory } from '@/lib/dutchie'
import type { ShopBanner, ShopBanners } from '@/lib/shop-banners'
import { bannerHref } from '@/lib/shop-banners'
import { ProductCard } from './menu-browser'
import { categoryLabel } from './labels'
import { CATEGORY_ICONS } from '@/lib/category-icons'
import { brandAnchor } from '@/lib/brands'
import { collectionPath } from '@/lib/collections'
import BrandTile from './brand-tile'
import Reveal from '@/components/reveal'

// The merchandised storefront (Avanti's redesign brief, 2026-08-03): the store
// menu is an ECOM page built to sell, not a bare product grid. Structure:
//   1. hero banner trio — one large tile left, two stacked right, rounded
//   2. HOT ITEMS — the red-highlighted push shelf (product.featured)
//   3. category shelves, with CMS-editable promo banners between them
// The full filterable grid stays below at #browse — shelves sell, the grid
// serves the shopper who knows what they came for.
//
// Server component ON PURPOSE: every banner, shelf and hot item is in the
// crawlable HTML. Banners come from lib/shop-banners (Storyblok-overlaid with
// code fallbacks, per the recorded banner rule).

function BannerTile({
  banner,
  slot,
  storeSlug,
  className = '',
  priority = false,
}: {
  banner: ShopBanner
  slot: string
  storeSlug: string
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href={bannerHref(banner.href, storeSlug)}
      data-shop-banner={slot}
      className={`group relative block overflow-hidden rounded-3xl bg-[var(--color-ink)] ${className}`}
    >
      <Image
        src={banner.image}
        alt={banner.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 92vw, 60vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* bottom scrim keeps the copy AA on any art */}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <span
          className="block text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {banner.kicker}
        </span>
        <span className="font-display mt-1 block text-3xl uppercase leading-[0.9] text-white md:text-5xl">
          {banner.title}
        </span>
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition-colors duration-200 group-hover:bg-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {banner.cta} →
        </span>
      </span>
    </Link>
  )
}

function PromoBanner({ banner, index, storeSlug }: { banner: ShopBanner; index: number; storeSlug: string }) {
  return (
    <Link
      href={bannerHref(banner.href, storeSlug)}
      data-shop-promo={index}
      className="group relative mt-12 block overflow-hidden rounded-3xl bg-[var(--color-ink)]"
    >
      <div className="relative aspect-[16/6] md:aspect-[16/4]">
        <Image
          src={banner.image}
          alt={banner.alt}
          fill
          sizes="92vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <span className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 md:p-10">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {banner.kicker}
          </span>
          <span className="font-display mt-1 text-3xl uppercase leading-[0.9] text-white md:text-5xl">
            {banner.title}
          </span>
          <span
            className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white underline-offset-4 group-hover:underline"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {banner.cta} →
          </span>
        </span>
      </div>
    </Link>
  )
}

/** Shelf = an exact 4-card row (Avanti, 2026-08-03: the snap scroller left
 *  the fifth card as a cut-off strip — no partials). 2×2 on mobile, 4-up on
 *  desktop; View All carries everything past the first four. Cards keep the
 *  shared ProductCard, so price rules, badges and PDP links stay identical
 *  to the grid. */
function Shelf({ products, storeSlug, hot = false }: { products: Product[]; storeSlug: string; hot?: boolean }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.slice(0, 4).map((p) => (
        <ProductCard key={p.id} product={p} storeSlug={storeSlug} hot={hot} />
      ))}
    </div>
  )
}

// SHOP BY BRAND quick-shop band (Avanti, 2026-08-03): yellow gradient card —
// no photo background — with the header/CTA left and the store's top 8 brands
// as white quick-shop tiles right, each landing on that brand's section of
// the Brands page. Brands are ranked by shelf presence (product count), so
// the band is data-derived and can never go stale; logos come from
// BRAND_LOGOS as Avanti supplies them, with the brand NAME as the wordmark
// fallback — never an invented logo.
function BrandQuickShop({ menu, storeSlug }: { menu: Menu; storeSlug: string }) {
  const counts = new Map<string, number>()
  for (const p of menu.products) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1)
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([b]) => b)
  if (top.length < 2) return null

  return (
    <section
      aria-labelledby="brand-quickshop"
      data-brand-quickshop
      className="mt-12 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#ffe27a_0%,#fecf0e_55%,#e7b30c_100%)] p-6 text-black md:p-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
            Everything on the shelf
          </p>
          <h2 id="brand-quickshop" className="font-display mt-1 text-5xl uppercase leading-none md:text-7xl">
            Shop by brand
          </h2>
          <Link
            href={`/menu/california/${storeSlug}/brands`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition-opacity duration-200 hover:opacity-85"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Browse brands →
          </Link>
        </div>
        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 lg:max-w-2xl">
          {top.map((brand) => (
            <BrandTile
              key={brandAnchor(brand)}
              brand={brand}
              href={`/menu/california/${storeSlug}/brands#${brandAnchor(brand)}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const CATEGORY_ORDER: ProductCategory[] = [
  'flower', 'pops', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'accessories',
]

// The category row is Avanti's FIXED 8 (2026-08-03) — Flower, Pre-Rolls,
// Vapes, Concentrates, Edibles, CBD, Accessories, Apparel — independent of
// what the placeholder inventory stocks: a category with nothing in it lands
// on the grid's honest empty state, which is the recorded philosophy for
// drifted filters. Pops left the row (still reachable via the PRODUCTS
// dropdown's 5G Pops line and the grid filters).
const TILE_ROW: ProductCategory[] = [
  'flower', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel',
]

// Boxless tiles (Avanti, 2026-08-03): no white card, no product count — the
// icon floats big on the page with a label pill under it. Icon map lives in
// lib/category-icons (shared with the header's SHOP dropdown); a category
// without supplied art renders the letter-mark disc, never an invented icon.

function CategoryTile({ category, storeSlug }: { category: ProductCategory; storeSlug: string }) {
  const icon = CATEGORY_ICONS[category]
  return (
    <Link
      href={collectionPath(storeSlug, category)}
      data-category-tile={category}
      className="group flex min-w-24 flex-1 snap-start flex-col items-center gap-4 pt-2 text-[var(--color-ink)]"
    >
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand icon
        <img
          src={icon}
          alt=""
          className="h-20 w-20 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105 md:h-24 md:w-24"
        />
      ) : (
        <span
          aria-hidden
          className="font-display flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl leading-none text-[var(--color-ink)]/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:-translate-y-1.5 md:h-24 md:w-24"
        >
          {categoryLabel(category).slice(0, 1)}
        </span>
      )}
      <span
        data-category-pill
        className="font-display rounded-full bg-white px-5 py-2 text-[16px] uppercase leading-none tracking-[0.05em] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-black md:text-[17px]"
      >
        {categoryLabel(category)}
      </span>
    </Link>
  )
}

export default function StoreShop({
  menu,
  banners,
  storeSlug,
}: {
  menu: Menu
  banners: ShopBanners
  storeSlug: string
}) {
  const hot = menu.products.filter(
    (p) => p.featured && p.variants.some((v) => (v.quantityAvailable ?? 0) > 0)
  )

  const shelves = CATEGORY_ORDER.map((c) => ({
    category: c,
    products: menu.products.filter((p) => p.category === c),
  })).filter((s) => s.products.length > 0)

  return (
    <div className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
      {/* ── hero banner trio: one large left, two stacked right ── */}
      <section aria-label="Featured" className="mt-8 grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
        <BannerTile
          banner={banners.hero[0]}
          slot="large"
          storeSlug={storeSlug}
          priority
          className="aspect-[16/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:h-full"
        />
        <BannerTile banner={banners.hero[1]} slot="stack-top" storeSlug={storeSlug} className="aspect-[16/8]" />
        <BannerTile banner={banners.hero[2]} slot="stack-bottom" storeSlug={storeSlug} className="aspect-[16/8]" />
      </section>

      {/* ── shop by category — custom icon tiles (Avanti's SVGs slot in) ── */}
      <section aria-labelledby="shop-by-category" className="mt-12">
        <h2
          id="shop-by-category"
          className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Shop by category
        </h2>
        <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 md:gap-6">
          {TILE_ROW.map((c) => (
            <CategoryTile key={c} category={c} storeSlug={storeSlug} />
          ))}
        </div>
      </section>

      {/* ── HOT ITEMS — the red push shelf ── */}
      {hot.length > 0 && (
        <Reveal>
        <section
          aria-labelledby="hot-items"
          data-hot-items
          className="mt-12 rounded-3xl border p-5 md:p-7"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-danger) 40%, transparent)',
            background: 'color-mix(in srgb, var(--color-danger) 5%, transparent)',
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
              >
                Don&rsquo;t miss
              </span>
              <h2 id="hot-items" className="font-display text-4xl uppercase leading-none md:text-6xl">
                Hot right now
              </h2>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
            >
              Moving fast
            </span>
          </div>
          <Shelf products={hot} storeSlug={storeSlug} hot />
        </section>
        </Reveal>
      )}

      <Reveal>
        <BrandQuickShop menu={menu} storeSlug={storeSlug} />
      </Reveal>

      {/* ── category shelves, promo banners woven between ── */}
      {shelves.map((shelf, i) => (
        <div key={shelf.category}>
          <Reveal>
          <section aria-labelledby={`shelf-${shelf.category}`} data-shelf={shelf.category} className="mt-12">
            {/* WAY bigger, no count (Avanti, 2026-08-03) */}
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`shelf-${shelf.category}`} className="font-display text-5xl uppercase leading-none md:text-7xl">
                {categoryLabel(shelf.category)}
              </h2>
              <Link
                href={collectionPath(storeSlug, shelf.category)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                View all →
              </Link>
            </div>
            <Shelf products={shelf.products.slice(0, 8)} storeSlug={storeSlug} />
          </section>
          </Reveal>

          {/* a promo slot after every second shelf — brand discounts, JB deals,
              whatever the CMS carries that week */}
          {i % 2 === 1 && banners.promos.length > 0 && (
            <PromoBanner
              banner={banners.promos[Math.floor(i / 2) % banners.promos.length]}
              index={Math.floor(i / 2)}
              storeSlug={storeSlug}
            />
          )}
        </div>
      ))}
      </div>
    </div>
  )
}
