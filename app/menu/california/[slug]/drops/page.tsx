import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductCategory, StrainType } from '@/lib/dutchie'
import { getLocations, getLocationBySlug } from '@/lib/dutchie'
import { getDrops } from '@/lib/drops'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import { AddToCartButton, ProductCard } from '@/components/menu/menu-browser'
import { categoryLabel } from '@/components/menu/labels'
import BrandShelf from '@/components/menu/brand-shelf'
import DropCountdown from '@/components/menu/drop-countdown'

// Fresh Drops for one store — the curated weekly release, dropping FRIDAYS.
// Editorial by design (recorded decision, 2026-07-31): a person picks the drop,
// nothing here is computed from "newest products". Curation stays stubbed in
// lib/drops.ts (Avanti, 2026-08-03); when the Dutchie collection field is
// verified, only that stub changes.
//
// REDESIGNED (Avanti, 2026-08-04): this is THE brand ritual, so the page
// leads with a cinematic STRAIN OF THE WEEK hero (the featured drop's
// amendment-#1 facts — Genetics/Taste — live here now), a Friday drop clock
// (week strip + store-local countdown, DROP DAY state on Fridays), and the
// drop list as one shoppable row PER CATEGORY with arrows — the same shelf
// mechanics as the Brands page.

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

// ── STRAIN OF THE WEEK — the hero's right half ───────────────────────────────
function StrainOfTheWeek({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const inStock = product.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
  const pool = inStock.length ? inStock : product.variants
  const best = pool.reduce((a, b) => ((b.specialPrice ?? b.price) < (a.specialPrice ?? a.price) ? b : a))
  const from = best.specialPrice ?? best.price
  const shot = product.images[0]
  const profile = product.strainProfile
  const thc = product.labResult?.potency?.thc

  return (
    <div data-strain-of-week className="relative">
      <span
        className="font-display inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-[15px] uppercase leading-none tracking-[0.06em] text-black"
      >
        Strain of the week
      </span>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        {shot && (
          <div className="relative h-52 w-52 shrink-0 overflow-hidden rounded-[1.75rem] bg-white sm:h-64 sm:w-64">
            <Image
              src={shot.url}
              alt={shot.alt}
              fill
              priority
              sizes="(max-width: 640px) 60vw, 300px"
              className="object-contain p-5 drop-shadow-[0_24px_36px_rgba(0,0,0,0.3)]"
            />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-display uppercase leading-[0.85] text-white" style={{ fontSize: 'min(11vw, 4.5rem)' }}>
            <Link href={`/shop/${product.slug}?store=${storeSlug}`} className="hover:text-[var(--color-accent)]">
              {product.name}
            </Link>
          </h2>

          <div className="mt-2 flex flex-wrap gap-1.5" style={{ fontFamily: 'var(--font-brand)' }}>
            {product.strainType && (
              <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                {STRAIN_LABEL[product.strainType]}
              </span>
            )}
            {thc && (
              <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                THC {thc.value}{thc.unit}
              </span>
            )}
          </div>

          {/* the amendment-#1 facts — only when the profile carries them */}
          <dl className="mt-4 space-y-2.5 text-sm text-white/85" style={{ fontFamily: 'var(--font-brand)' }}>
            {profile?.genetics && (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Genetics</dt>
                <dd className="mt-0.5 leading-snug">{profile.genetics}</dd>
              </div>
            )}
            {profile?.taste?.length ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Taste</dt>
                <dd className="mt-0.5 capitalize leading-snug">{profile.taste.join(', ')}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {inStock.length === 0 ? (
              <span className="text-sm font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
                Sold out
              </span>
            ) : (
              <>
                <span className="whitespace-nowrap">
                  <span className="font-display text-[2.2rem] leading-none text-white">{money(from)}</span>
                  <span className="ml-1.5 text-xs font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
                    · {best.option}
                  </span>
                </span>
                <AddToCartButton product={product} variant={best} storeSlug={storeSlug} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CATEGORY_ORDER: ProductCategory[] = [
  'flower', 'pops', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel',
]

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

  const strainOfWeek = drops.featured[0]
  const alsoFeatured = drops.featured.slice(1)
  // The drop list, one row per category (Avanti, 2026-08-04) — featured
  // overflow joins its category row so nothing curated goes missing.
  const listPool = [...alsoFeatured, ...drops.list]
  const byCategory = CATEGORY_ORDER.map((c) => ({
    category: c,
    products: listPool.filter((p) => p.category === c),
  })).filter((g) => g.products.length > 0)

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

      {/* ── HERO — the ritual: drop clock left, strain of the week right ── */}
      <header className="px-2 pt-2 md:px-3">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-12 pt-20 text-white md:rounded-[2.5rem] md:px-12 md:pb-14 md:pt-24 lg:px-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_25%_0%,rgba(254,207,14,0.2),transparent_70%),radial-gradient(45%_90%_at_80%_0%,rgba(254,207,14,0.08),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-[1400px]">
            <Link
              href={`/menu/california/${slug}`}
              className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)] transition hover:opacity-80"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              ← {location.name} menu
            </Link>

            <div className="mt-4 grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
              <div>
                <h1 className="font-display uppercase leading-[0.85]" style={{ fontSize: 'min(15vw, 8.5rem)' }}>
                  Fresh
                  <br />
                  Drops
                </h1>
                <p className="mt-3 max-w-sm text-sm text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                  The weekly release at {location.name}. Small batches — gone when they&rsquo;re gone.
                </p>
                <div className="mt-7">
                  <DropCountdown />
                </div>
              </div>

              {strainOfWeek && <StrainOfTheWeek product={strainOfWeek} storeSlug={slug} />}
            </div>
          </div>
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
        <section className="px-6 pt-12 md:px-12 lg:px-20" aria-labelledby="drop-list">
          <div className="mx-auto max-w-[1400px]">
            <h2 id="drop-list" className="font-display text-5xl uppercase leading-none md:text-7xl">
              The Drop List
            </h2>

            {/* one shoppable row per category, same arrow-shelf mechanics as
                the Brands page */}
            <div className="mt-8 space-y-10">
              {byCategory.map((g) => (
                <section key={g.category} data-drop-category={g.category} aria-label={categoryLabel(g.category)}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-3xl uppercase leading-none md:text-5xl">
                      {categoryLabel(g.category)}
                    </h3>
                  </div>
                  <BrandShelf count={g.products.length}>
                    {g.products.map((p) => (
                      <ProductCard key={p.id} product={p} storeSlug={slug} />
                    ))}
                  </BrandShelf>
                </section>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
