import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import MenuBrowser from '@/components/menu/menu-browser'
import StoreSubnav from '@/components/menu/store-subnav'

// Deals for one store. "Deals", not "Specials" — they are the same surface and
// the site says Deals (Avanti, 2026-07-31). Nested under the store because
// discounts are per-location, so this page is genuinely different at Pomona
// than at DTLA rather than being the same page with a filter on it.
//
// Derived from the menu, not a separate feed: a deal IS a variant carrying a
// specialPrice, which the frozen Product type already models. Nothing new was
// needed to build this.

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
    title: `Deals — ${location.name}, ${location.city} CA`,
    description: `Current cannabis deals and discounts at ${location.name}, ${location.address}, ${location.city}. Live pricing on flower, pre-rolls, vapes and more.`,
    alternates: { canonical: `/menu/california/${slug}/deals` },
  }
}

export default async function StoreDealsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) notFound()

  const menu = await getMenu(location.retailerId)

  // A product is on offer when a BUYABLE variant is actually discounted.
  // Both halves matter: `specialPrice` alone would list sold-out items as deals,
  // and skipping the `< price` test would list a "special" that saves nothing.
  const deals = menu.products.filter((p) =>
    p.variants.some(
      (v) => (v.quantityAvailable ?? 0) > 0 && v.specialPrice != null && v.specialPrice < v.price
    )
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
              { name: 'Deals', path: `/menu/california/${slug}/deals` },
            ])
          ),
        }}
      />

      <header className="border-b border-[var(--color-border)] px-6 pb-10 pt-28 md:px-12 md:pt-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/menu/california/${slug}`}
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] transition hover:opacity-80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            ← {location.name} menu
          </Link>
          <h1 className="font-display mt-4 text-5xl uppercase leading-[0.9] md:text-7xl">Deals</h1>
          <p
            className="mt-3 max-w-xl text-sm text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Live discounts at {location.name}. Prices update with the menu — what you see here is
            what is on the shelf right now.
          </p>
          <StoreSubnav storeSlug={slug} active="deals" />
        </div>
      </header>

      {deals.length === 0 ? (
        // An honest empty state. The alternative — quietly rendering the full
        // menu when nothing is discounted — advertises deals that do not exist,
        // which on a cannabis domain is the same class of mistake as a
        // fabricated promo date.
        <section className="px-6 py-20 text-center md:px-12 lg:px-20">
          <p className="text-[var(--color-muted)]">
            No deals running at {location.name} right now.
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
        <MenuBrowser products={deals} storeSlug={slug} />
      )}
    </main>
  )
}
