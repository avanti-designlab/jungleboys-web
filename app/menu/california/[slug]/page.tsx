import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocations, getLocationBySlug, getMenu } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema, storeSchema } from '@/lib/schema'
import { OWNED_STORES } from '@/lib/owned-stores'
import MenuBrowser from '@/components/menu/menu-browser'
import StoreHeader from '@/components/menu/store-header'

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

  const menu = await getMenu(location.retailerId)
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

      <StoreHeader location={location} />
      <MenuBrowser products={menu.products} />
    </main>
  )
}
