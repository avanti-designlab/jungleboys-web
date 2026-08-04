import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { getShopBanners } from '@/lib/shop-banners'
import { jsonLdHtml, breadcrumbSchema, storeSchema } from '@/lib/schema'
import { OWNED_STORES } from '@/lib/owned-stores'
import MenuBrowser from '@/components/menu/menu-browser'
import StoreHeader from '@/components/menu/store-header'
import StoreShop from '@/components/menu/store-shop'

// CA location menu — the NATIVE variant (Avanti, 2026-07-19): only the four
// California menus are built on the Dutchie Plus API. Florida stays as embeds in
// a branded shell, because we have their embed codes and not their API access.
//
// Everything here reads through lib/dutchie's frozen interface, which currently
// resolves to the placeholder provider. Swapping in the GraphQL provider changes
// nothing in this file — that is the whole point of the freeze.

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
  const title = `${location.name} Menu — ${location.city}, CA`
  return {
    title,
    description: `Shop the live Jungle Boys menu at ${location.name}, ${location.address}, ${location.city}. Premium flower, pre-rolls, Hash Holes and more.`,
    alternates: { canonical: `/menu/california/${slug}` },
  }
}

export default async function CaliforniaMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) notFound()

  const [menu, banners] = await Promise.all([getMenu(location.retailerId), getShopBanners()])
  // Store facts for schema come from OWNED_STORES, the same source /locations
  // uses — one Store node shape across the site rather than two that drift.
  const owned = OWNED_STORES.find((s) => s.slug === slug)

  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml([
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Locations', path: '/locations' },
              { name: `${location.name} Menu`, path: `/menu/california/${slug}` },
            ]),
            ...(owned ? [storeSchema(owned)] : []),
          ]),
        }}
      />

      {/* The merchandised storefront opens the page (Avanti, 2026-08-03 —
          no masthead on top): hero banner trio, hot items, category shelves
          with promo banners between them. Sells first ... */}
      <StoreShop menu={menu} banners={banners} storeSlug={slug} />

      {/* ... and the full filterable grid still serves the shopper who knows
          what they came for. Shelf "View all" links land here with a category
          pre-applied via ?category= (read client-side inside MenuBrowser). */}
      {/* MenuBrowser carries its own big header (SHOP ALL / the active
          category) — a second small heading here read as a stray eyebrow
          (Avanti, 2026-08-04). */}
      <section id="browse" aria-label="Browse the full menu" className="mt-16 scroll-mt-24">
        <MenuBrowser products={menu.products} storeSlug={slug} />
      </section>

      {/* Store identity + NAP at the page's end — carries the crawlable h1,
          address, hours and phone this local-SEO URL exists to rank on. */}
      <StoreHeader location={location} />
    </main>
  )
}
