import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CA_OWNED } from '@/lib/owned-stores'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import ContinueAtStore from '@/components/shop/continue-at-store'

// The storefront ENTRY — where every "Shop" button on the site lands.
//
// Shop is store-scoped by decision (inventory, pricing and deals differ per
// location), so this page's whole job is answering "which store?" and getting
// out of the way. The store picker overlay auto-opens here for visitors who
// have never chosen (store-picker-mount matches /shop), and choosing routes
// straight into that store's menu; this server-rendered page underneath is the
// crawlable, no-JS answer to the same question.
//
// Distinct from /products on purpose (recorded, 2026-07-29): Products is the
// curated JB-only collection with the design-heavy line pages; Shop is live
// dispensary inventory. Do not merge them.

export const metadata: Metadata = {
  title: 'Shop — Live Jungle Boys Menus',
  description:
    'Shop Jungle Boys California — live menus, pricing and deals at Downtown LA, Orange County, Pomona and San Diego. Florida menus via our locations page.',
  alternates: { canonical: '/shop' },
}

export default function ShopEntryPage() {
  const stores = CA_OWNED.filter((s) => !s.external)

  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
            ])
          ),
        }}
      />

      <header className="border-b border-[var(--color-border)] px-6 pb-10 pt-10 md:px-12 md:pt-14 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">Shop</h1>
          <p
            className="mt-3 max-w-xl text-sm text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Pick your store — menus, pricing and deals are live per location.
          </p>
          <ContinueAtStore />
        </div>
      </header>

      <section className="px-6 pt-10 md:px-12 lg:px-20" aria-labelledby="shop-ca">
        <div className="mx-auto max-w-[1400px]">
          <h2
            id="shop-ca"
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            California
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((s) => (
              <Link
                key={s.slug}
                href={s.menuUrl}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="relative aspect-[4/3] overflow-hidden bg-[var(--color-ink)]">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="flex flex-1 flex-col p-5" style={{ fontFamily: 'var(--font-brand)' }}>
                  <span className="text-lg font-extrabold uppercase leading-tight">{s.name}</span>
                  <span className="mt-1 text-xs leading-snug text-[var(--color-muted)]">
                    {s.street}, {s.city}
                  </span>
                  <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)]">
                    Shop this store →
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {/* Florida stays honest: those menus are Dutchie embeds that have not
              landed on the new site yet, so this links to the locations page
              rather than to routes that would 404 today. */}
          <p
            className="mt-10 max-w-xl text-sm text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            In Florida?{' '}
            <Link
              href="/locations"
              className="font-bold text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
            >
              Find your store on the locations page →
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
