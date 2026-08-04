import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BackPill from '@/components/menu/back-pill'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import Reveal from '@/components/reveal'
import MenuBrowser, { type CategoryNavItem } from '@/components/menu/menu-browser'
import { CATEGORY_COLLECTIONS, COLLECTIONS, collectionPath, getCollection } from '@/lib/collections'

// One COLLECTION = one shopping page (Avanti, 2026-08-04): every SHOP
// category and every PRODUCTS line gets its own URL, hero and filterable
// grid, instead of dropping the shopper back on the main menu with a filter.
//
// SEO (URL mandate, faceted filters): CATEGORY collections are primary
// categories — indexable, self-canonical, in the sitemap. LINE collections
// are subcategory facets — noindex, canonical to the store menu.

export const revalidate = 60

export async function generateStaticParams() {
  const locations = await getLocations()
  return locations.flatMap((l) => COLLECTIONS.map((c) => ({ slug: l.slug, collection: c.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; collection: string }>
}): Promise<Metadata> {
  const { slug, collection } = await params
  const location = await getLocationBySlug(slug)
  const col = getCollection(collection)
  if (!location || !col) return {}
  const base = `/menu/california/${slug}`
  return col.kind === 'category'
    ? {
        title: `${col.title} — ${location.name}, ${location.city} CA`,
        description: `Shop ${col.title.toLowerCase()} at ${location.name}, ${location.address}, ${location.city}. Live menu, pricing and availability.`,
        alternates: { canonical: `${base}/shop/${col.slug}` },
      }
    : {
        title: `${col.title} — ${location.name}, ${location.city} CA`,
        robots: { index: false },
        alternates: { canonical: base },
      }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string; collection: string }>
}) {
  const { slug, collection } = await params
  const location = await getLocationBySlug(slug)
  const col = getCollection(collection)
  if (!location || !col) notFound()

  const menu = await getMenu(location.retailerId)
  const products = menu.products.filter(col.match)

  // Rail nav = the primary category pages for this store, current one lit.
  // Only categories the store stocks (or the current page) get a tile.
  const stocked = new Set(menu.products.map((p) => p.category))
  const nav: CategoryNavItem[] = [
    { href: `/menu/california/${slug}#browse`, label: 'All products' },
    ...CATEGORY_COLLECTIONS.filter((c) => stocked.has(c.slug as never) || c.slug === col.slug).map(
      (c) => ({
        href: collectionPath(slug, c.slug),
        label: c.title,
        icon: c.icon,
        active: c.slug === col.slug,
      })
    ),
  ]

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
              { name: col.title, path: `/menu/california/${slug}/shop/${col.slug}` },
            ])
          ),
        }}
      />

      {/* hero — same big-bump language as Deals/Brands: dark card, gold glow,
          giant Bebas title, the collection icon standing beside it */}
      <header className="px-2 pt-2 md:px-3">
        <Reveal slide>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-10 pt-20 text-white md:rounded-[2.5rem] md:px-12 md:pb-12 md:pt-24 lg:px-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.16),transparent_70%)]"
          />
          <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6">
            <div>
              <BackPill href={`/menu/california/${slug}`} label={`${location.name} menu`} />
              <h1 className="font-display mt-3 uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 9rem)' }}>
                {col.title}
              </h1>
              {/* count lives on the grid (it follows the facets); the hero
                  just says where the data comes from */}
              <p className="mt-3 text-sm text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                Live from the {location.name} menu
              </p>
            </div>
            {/* no hero icon — plain headers (Avanti, 2026-08-04) */}
          </div>
        </div>
        </Reveal>
      </header>

      {products.length === 0 ? (
        <section className="px-6 py-20 text-center md:px-12 lg:px-20">
          <p className="text-[var(--color-muted)]">
            Nothing in {col.title} at {location.name} right now.
          </p>
          <Link
            href={`/menu/california/${slug}`}
            className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] hover:opacity-80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Browse the full menu →
          </Link>
        </section>
      ) : (
        <Reveal delay={0.08}>
          <MenuBrowser products={products} storeSlug={slug} heading={null} categoryNav={nav} />
        </Reveal>
      )}
    </main>
  )
}
