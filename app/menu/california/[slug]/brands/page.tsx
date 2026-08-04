import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/lib/dutchie'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import { ProductCard } from '@/components/menu/menu-browser'
import { brandAnchor } from '@/lib/brands'

// Brands at one store — EVERY brand on the shelf, not JB only. That is the
// recorded decision (Avanti, 2026-07-31): the CA stores stock third-party
// brands (Jeeter, 1904, Barrett Farms…) and the goal is to drive traffic for
// those too. This is the one commerce surface that is explicitly NOT
// JB-curated; do not "correct" it. It does not touch the Products-vs-Shop
// rule — /products/* stays the curated JB-only collection.
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

// anchor rule shared with the storefront's quick-shop tiles (lib/brands)
const anchor = brandAnchor

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

      <header className="border-b border-[var(--color-border)] px-6 pb-10 pt-10 md:px-12 md:pt-14 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href={`/menu/california/${slug}`}
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] transition hover:opacity-80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            ← {location.name} menu
          </Link>
          <h1 className="font-display mt-4 text-5xl uppercase leading-[0.9] md:text-7xl">Brands</h1>
          <p
            className="mt-3 max-w-xl text-sm text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Every brand on the shelf at {location.name} — the house catalogue and the third-party
            brands we stock, straight from the live menu.
          </p>
        </div>
      </header>

      {/* Brand jump list — one pill per brand, mirroring the section order. */}
      <nav
        aria-label="Brands on the menu"
        className="px-6 pt-8 md:px-12 lg:px-20"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-2">
          {brands.map(([brand, list]) => (
            <a
              key={brand}
              href={`#${anchor(brand)}`}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)] transition hover:border-[var(--color-accent)]"
            >
              {brand}
              <span className="ml-2 text-[var(--color-muted)]">{list.length}</span>
            </a>
          ))}
        </div>
      </nav>

      {brands.map(([brand, list]) => (
        <section
          key={brand}
          id={anchor(brand)}
          data-brand={brand}
          className="scroll-mt-28 px-6 pt-12 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">{brand}</h2>
              <span
                className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {list.length} {list.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={slug} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  )
}
