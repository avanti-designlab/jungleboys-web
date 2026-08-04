import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/lib/dutchie'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import { ProductCard } from '@/components/menu/menu-browser'
import { brandAnchor } from '@/lib/brands'
import BrandTile from '@/components/menu/brand-tile'
import BrandSpyNav from '@/components/menu/brand-spy-nav'
import BrandShelf from '@/components/menu/brand-shelf'
import Reveal from '@/components/reveal'

// Brands at one store — EVERY brand on the shelf, not JB only. That is the
// recorded decision (Avanti, 2026-07-31): the CA stores stock third-party
// brands (Jeeter, 1904, Barrett Farms…) and the goal is to drive traffic for
// those too. This is the one commerce surface that is explicitly NOT
// JB-curated; do not "correct" it. It does not touch the Products-vs-Shop
// rule — /products/* stays the curated JB-only collection.
//
// REIMAGINED (Avanti, 2026-08-04): big dark hero, an 8-tile quick-shop of the
// most popular brands (logos when supplied), a sticky left rail that follows
// the scroll (BrandSpyNav — list derived from the live menu, enhancement
// only), and each brand as a BOLD Bebas section on its own tinted card —
// the house section dark, the rest rotating through theme-aware tints.
//
// Derived entirely from product.brand on the store's menu. No brand list is
// maintained anywhere: a brand exists here exactly as long as the store
// stocks it, which is the only definition that stays true without upkeep.

export const revalidate = 60

export async function generateStaticParams() {
  return (await getLocations()).map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) return {}
  return {
    title: `Brands — ${location.name}, ${location.city} CA`,
    description: `Every cannabis brand stocked at ${location.name}, ${location.address}, ${location.city} — Jungle Boys and the third-party brands on the shelf, with live availability.`,
    alternates: { canonical: `/menu/california/${slug}/brands` },
  }
}

// Section tint rotation — "some brand sections can be different colors"
// (Avanti, 2026-08-04). color-mix from theme vars so every tint works in both
// modes; the FIRST (largest, in practice the house brand) section is the dark
// brand card, like every other brand surface on the site.
const SECTION_TINTS = [
  'color-mix(in srgb, var(--color-accent) 9%, var(--color-surface))',
  'var(--color-surface)',
  'color-mix(in srgb, var(--color-success) 8%, var(--color-surface))',
  'color-mix(in srgb, var(--color-danger) 6%, var(--color-surface))',
]

export default async function StoreBrandsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) notFound()

  const menu = await getMenu(location.retailerId)

  const byBrand = new Map<string, Product[]>()
  for (const p of menu.products) {
    byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p])
  }
  // Largest shelf first, then alphabetical — the house brand leads naturally by
  // count, without a hardcoded "JB first" rule that would misorder the day a
  // third-party brand out-stocks it.
  const brands = [...byBrand.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
  )
  const spyItems = brands.map(([brand, list]) => ({
    brand,
    anchor: brandAnchor(brand),
    count: list.length,
  }))

  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Locations', path: '/locations' },
              { name: location.name, path: `/menu/california/${slug}` },
              { name: 'Brands', path: `/menu/california/${slug}/brands` },
            ])
          ),
        }}
      />

      {/* ── HERO — the big bump: dark brand card, giant Bebas wordmark ── */}
      <header className="px-2 pt-2 md:px-3">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-8 pt-14 text-white md:rounded-[2.5rem] md:px-12 md:pb-10 md:pt-16 lg:px-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.16),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-[1400px]">
            <Link
              href={`/menu/california/${slug}`}
              className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)] transition hover:opacity-80"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              ← {location.name} menu
            </Link>
            <h1
              className="font-display mt-3 uppercase leading-[0.85]"
              style={{ fontSize: 'min(11vw, 7rem)' }}
            >
              Brands
            </h1>
            {/* compact hero (Avanti, 2026-08-04): no subtext, shorter tiles,
                FEATURED BRANDS label — the sections peek above the fold */}
            <p
              className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Featured brands
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {brands.slice(0, 8).map(([brand]) => (
                <BrandTile
                  key={brandAnchor(brand)}
                  brand={brand}
                  href={`#${brandAnchor(brand)}`}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* mobile jump list — the sticky rail is desktop-only */}
      <nav
        aria-label="Brands on the menu"
        className="px-6 pt-8 lg:hidden"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-2">
          {spyItems.map((i) => (
            <a
              key={i.anchor}
              href={`#${i.anchor}`}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)] transition hover:border-[var(--color-accent)]"
            >
              {i.brand}
              <span className="ml-2 text-[var(--color-muted)]">{i.count}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── sticky rail + brand sections ── */}
      <div className="px-6 pt-10 md:px-12 lg:px-20 lg:pt-12">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-4xl uppercase leading-none md:text-6xl">Shop all brands</h2>
        </div>
        <div className="mx-auto mt-6 grid max-w-[1400px] gap-8 lg:grid-cols-[250px_1fr]">
          <BrandSpyNav items={spyItems} />

          <div className="min-w-0 space-y-8">
            {brands.map(([brand, list], i) => {
              const dark = i === 0
              return (
                <Reveal key={brand}>
                <section
                  id={brandAnchor(brand)}
                  data-brand={brand}
                  className={`scroll-mt-28 rounded-[2rem] p-6 md:p-9 ${
                    dark ? 'bg-[#0b0b0b] text-white' : 'border border-[var(--color-border)]'
                  }`}
                  style={dark ? undefined : { background: SECTION_TINTS[(i - 1) % SECTION_TINTS.length] }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">
                      {brand}
                    </h2>
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.2em] ${
                        dark ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
                      }`}
                      style={{ fontFamily: 'var(--font-brand)' }}
                    >
                      {list.length} {list.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                  {/* one line per brand with arrows; View All expands in
                      place (Avanti, 2026-08-04). Cards stay SSR children. */}
                  <div className="mt-2">
                    <BrandShelf count={list.length}>
                      {list.map((p) => (
                        <ProductCard key={p.id} product={p} storeSlug={slug} />
                      ))}
                    </BrandShelf>
                  </div>
                </section>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
