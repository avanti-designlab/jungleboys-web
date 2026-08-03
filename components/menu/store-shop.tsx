import Image from 'next/image'
import Link from 'next/link'
import type { Menu, Product, ProductCategory } from '@/lib/dutchie'
import type { ShopBanner, ShopBanners } from '@/lib/shop-banners'
import { bannerHref } from '@/lib/shop-banners'
import { ProductCard } from './menu-browser'
import { categoryLabel } from './labels'

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

/** Horizontal snap shelf — cards keep the shared ProductCard, so price rules,
 *  badges and PDP links stay identical to the grid. */
function Shelf({ products, storeSlug, hot = false }: { products: Product[]; storeSlug: string; hot?: boolean }) {
  return (
    <div className="-mx-1 mt-5 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
      {products.map((p) => (
        <div key={p.id} className="w-72 shrink-0 snap-start md:w-80">
          <ProductCard product={p} storeSlug={storeSlug} hot={hot} />
        </div>
      ))}
    </div>
  )
}

const CATEGORY_ORDER: ProductCategory[] = [
  'flower', 'pops', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'accessories',
]

// Avanti's custom category icons (2026-08-03) drop into public/shop/icons/ —
// set each entry to its file when it lands, e.g. '/shop/icons/flower.svg'.
// Until then the tile renders the designed letter-mark placeholder; a null
// here must NEVER render a broken <img> or a stand-in icon we invented.
const CATEGORY_ICONS: Partial<Record<ProductCategory, string>> = {
  // flower: '/shop/icons/flower.svg',
}

function CategoryTile({ category, count }: { category: ProductCategory; count: number }) {
  const icon = CATEGORY_ICONS[category]
  return (
    <Link
      href={`?category=${category}#browse`}
      data-category-tile={category}
      className="group flex min-w-36 flex-1 flex-col items-center gap-3 rounded-3xl bg-white px-4 pb-6 pt-5 text-[var(--color-ink)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="text-sm font-extrabold uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--font-brand)' }}>
        {categoryLabel(category)}
      </span>
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand SVG icon
        <img src={icon} alt="" className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-110" />
      ) : (
        <span
          aria-hidden
          className="font-display flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/15 text-2xl leading-none transition-colors duration-300 group-hover:border-[var(--color-accent)]"
        >
          {categoryLabel(category).slice(0, 1)}
        </span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]/50" style={{ fontFamily: 'var(--font-brand)' }}>
        {count} products
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
        <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2">
          {shelves.map((s) => (
            <CategoryTile key={s.category} category={s.category} count={s.products.length} />
          ))}
        </div>
      </section>

      {/* ── HOT ITEMS — the red push shelf ── */}
      {hot.length > 0 && (
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
              <h2 id="hot-items" className="font-display text-3xl uppercase leading-none md:text-4xl">
                Hot right now
              </h2>
            </div>
            <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Staff picks, moving fast
            </span>
          </div>
          <Shelf products={hot} storeSlug={storeSlug} hot />
        </section>
      )}

      {/* ── category shelves, promo banners woven between ── */}
      {shelves.map((shelf, i) => (
        <div key={shelf.category}>
          <section aria-labelledby={`shelf-${shelf.category}`} data-shelf={shelf.category} className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <h2 id={`shelf-${shelf.category}`} className="font-display text-3xl uppercase leading-none md:text-4xl">
                  {categoryLabel(shelf.category)}
                </h2>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {shelf.products.length}
                </span>
              </div>
              <Link
                href={`?category=${shelf.category}#browse`}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                View all →
              </Link>
            </div>
            <Shelf products={shelf.products.slice(0, 8)} storeSlug={storeSlug} />
          </section>

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
