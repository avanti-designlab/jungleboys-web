import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, StrainType } from '@/lib/dutchie'
import { getLocations, getLocationBySlug } from '@/lib/dutchie'
import { getDrops } from '@/lib/drops'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import MenuBrowser from '@/components/menu/menu-browser'

// Fresh Drops for one store — the curated weekly release, dropping FRIDAYS.
// Editorial by design (recorded decision, 2026-07-31): a person picks the drop,
// nothing here is computed from "newest products". The LAYOUT is live now with
// curation stubbed in lib/drops.ts (Avanti, 2026-08-03); when the Dutchie
// collection field is verified, only that stub changes.
//
// The featured band is what data-model amendment #1 exists for: it shows
// Genetics and Taste from StrainProfile, mirroring the reference cards on
// jungleboysflorida.com/drops/.

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
    title: `Fresh Drops — ${location.name}, ${location.city} CA`,
    description: `This week's Jungle Boys drop at ${location.name}, ${location.city}. New heat lands every Friday — small batches, live pricing and availability.`,
    alternates: { canonical: `/menu/california/${slug}/drops` },
  }
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

const STRAIN_LABEL: Record<StrainType, string> = {
  indica: 'Indica', sativa: 'Sativa', hybrid: 'Hybrid',
}

function FeaturedDrop({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const inStock = product.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
  const pool = inStock.length ? inStock : product.variants
  const best = pool.reduce((a, b) => ((b.specialPrice ?? b.price) < (a.specialPrice ?? a.price) ? b : a))
  const from = best.specialPrice ?? best.price
  const shot = product.images[0]
  const profile = product.strainProfile

  return (
    // Same white-card language as every commerce card (Avanti, 2026-08-03) —
    // gold radial stage, bottom-anchored shot, Bebas name and price.
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-[var(--color-ink)] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_68%,rgba(233,193,90,0.28),transparent_72%)]" />
        {shot && (
          <Image
            src={shot.url}
            alt={shot.alt}
            fill
            sizes="(max-width: 768px) 90vw, 30vw"
            className="object-contain p-6 drop-shadow-[0_24px_36px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
          />
        )}
        <span
          className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-black"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          This week&rsquo;s drop
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {product.strainType && (
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]/60"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {STRAIN_LABEL[product.strainType]}
          </p>
        )}
        <h3 className="font-display text-[2.5rem] uppercase leading-[0.9]">
          <Link href={`/shop/${product.slug}?store=${storeSlug}`} className="after:absolute after:inset-0 after:z-10">
            {product.name}
          </Link>
        </h3>

        {/* The reference-card facts — rendered ONLY when the profile carries
            them. An absent lineage stays absent; nothing is padded in. */}
        <dl className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-brand)' }}>
          {profile?.genetics && (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">Genetics</dt>
              <dd className="mt-0.5 leading-snug">{profile.genetics}</dd>
            </div>
          )}
          {profile?.taste?.length ? (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">Taste</dt>
              <dd className="mt-0.5 leading-snug capitalize">{profile.taste.join(', ')}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-auto pt-2 leading-none">
          {inStock.length === 0 ? (
            <span className="text-sm font-bold uppercase text-[var(--color-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Sold out
            </span>
          ) : (
            <>
              <span className="mr-1 text-xs font-bold uppercase text-[var(--color-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
                from
              </span>
              <span className="font-display text-[1.9rem] leading-none">{money(from)}</span>
            </>
          )}
        </p>
      </div>
    </article>
  )
}

export default async function StoreDropsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) notFound()

  const drops = await getDrops(location.retailerId)
  const empty = drops.featured.length === 0 && drops.list.length === 0

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
              { name: 'Fresh Drops', path: `/menu/california/${slug}/drops` },
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
          <h1 className="font-display mt-4 text-5xl uppercase leading-[0.9] md:text-7xl">
            Fresh Drops
          </h1>
          <p
            className="mt-3 max-w-xl text-sm text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            The weekly release at {location.name}. New heat lands every Friday — small batches,
            gone when they&rsquo;re gone.
          </p>
        </div>
      </header>

      {empty ? (
        // Honest empty state — same rule as Deals: a drops page quietly showing
        // the full menu would advertise a release that does not exist.
        <section className="px-6 py-20 text-center md:px-12 lg:px-20">
          <p className="text-[var(--color-muted)]">
            No drop live at {location.name} right now. New drops land Fridays.
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
        <>
          {drops.featured.length > 0 && (
            <section className="px-6 pt-10 md:px-12 lg:px-20" aria-labelledby="featured-drops">
              <div className="mx-auto max-w-[1400px]">
                <h2
                  id="featured-drops"
                  className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  Featured this week
                </h2>
                <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {drops.featured.map((p) => (
                    <FeaturedDrop key={p.id} product={p} storeSlug={slug} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {drops.list.length > 0 && (
            <section className="pt-14" aria-labelledby="drop-list">
              <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
                <h2 id="drop-list" className="font-display text-3xl uppercase leading-none md:text-4xl">
                  The Drop List
                </h2>
              </div>
              <MenuBrowser products={drops.list} storeSlug={slug} />
            </section>
          )}
        </>
      )}
    </main>
  )
}
