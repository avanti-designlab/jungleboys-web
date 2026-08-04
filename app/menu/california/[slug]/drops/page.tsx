import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductCategory, StrainType } from '@/lib/dutchie'
import { getLocations, getLocationBySlug } from '@/lib/dutchie'
import { getDrops, getDropsHero, type DropsHero } from '@/lib/drops'
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

// ── STRAIN OF THE WEEK — its own dramatic tile (Avanti, 2026-08-04 v3:
// "bolder… option to put an image background with the strain graphics").
// The backdrop is the CMS drops_hero asset when one is uploaded (scrimmed for
// AA, per the banner pattern); otherwise the dark tile with the gold glow.
// The shot keeps its WHITE well — the recorded media-well rule: real Dutchie
// shots are white-background JPGs and float as boxes on ink otherwise.
function StrainOfTheWeek({
  product,
  storeSlug,
  bg,
}: {
  product: Product
  storeSlug: string
  bg: DropsHero
}) {
  const inStock = product.variants.filter((v) => (v.quantityAvailable ?? 0) > 0)
  const pool = inStock.length ? inStock : product.variants
  const best = pool.reduce((a, b) => ((b.specialPrice ?? b.price) < (a.specialPrice ?? a.price) ? b : a))
  const from = best.specialPrice ?? best.price
  const shot = product.images[0]
  const profile = product.strainProfile
  const thc = product.labResult?.potency?.thc

  return (
    <div
      data-strain-of-week
      className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] p-6 text-white md:rounded-[2rem] md:p-9"
    >
      {bg.image ? (
        <>
          <Image src={bg.image} alt={bg.alt} fill sizes="(max-width: 1024px) 92vw, 55vw" className="object-cover" />
          {/* scrim keeps every word AA on any uploaded art */}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        </>
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_18%,rgba(254,207,14,0.22),transparent_70%)]"
        />
      )}

      <div className="relative flex flex-1 flex-col">
        <span className="font-display self-start rounded-full bg-[var(--color-accent)] px-4 py-2 text-[16px] uppercase leading-none tracking-[0.06em] text-black">
          Strain of the week
        </span>

        {shot && (
          <div className="relative mx-auto mt-6 h-56 w-56 -rotate-2 overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.55)] md:h-72 md:w-72">
            <Image
              src={shot.url}
              alt={shot.alt}
              fill
              priority
              sizes="(max-width: 768px) 60vw, 320px"
              className="object-contain p-5"
            />
          </div>
        )}

        <h2
          className="font-display mt-5 text-center uppercase leading-[0.82]"
          style={{ fontSize: 'min(14vw, 6.5rem)' }}
        >
          <Link href={`/shop/${product.slug}?store=${storeSlug}`} className="hover:text-[var(--color-accent)]">
            {product.name}
          </Link>
        </h2>

        <div className="mt-2 flex flex-wrap justify-center gap-1.5" style={{ fontFamily: 'var(--font-brand)' }}>
          {product.strainType && (
            <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85">
              {STRAIN_LABEL[product.strainType]}
            </span>
          )}
          {thc && (
            <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85">
              THC {thc.value}{thc.unit}
            </span>
          )}
        </div>

        <dl
          className="mx-auto mt-5 grid w-full max-w-xl gap-x-8 gap-y-3 text-center sm:grid-cols-2"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {profile?.genetics && (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">Genetics</dt>
              <dd className="mt-1 text-sm leading-snug text-white/90">{profile.genetics}</dd>
            </div>
          )}
          {profile?.taste?.length ? (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">Taste</dt>
              <dd className="mt-1 text-sm capitalize leading-snug text-white/90">{profile.taste.join(', ')}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-center gap-4 pt-6">
          {inStock.length === 0 ? (
            <span className="text-sm font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Sold out
            </span>
          ) : (
            <>
              <span className="whitespace-nowrap">
                <span className="font-display text-[2.4rem] leading-none text-white">{money(from)}</span>
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

  const [drops, dropsHero] = await Promise.all([getDrops(location.retailerId), getDropsHero()])
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

      {/* ── HERO v3 — SEPARATE TILES (Avanti, 2026-08-04): title tile +
          gold clock tile stacked left, the Strain of the Week tile right ── */}
      <header className="px-2 pt-2 md:px-3">
        <div className="mx-auto grid max-w-[1560px] gap-2 md:gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* title tile */}
            <div className="relative flex-1 overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] p-7 pt-20 text-white md:rounded-[2rem] md:p-10 md:pt-24">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_100%_at_40%_0%,rgba(254,207,14,0.2),transparent_70%)]"
              />
              <div className="relative">
                <Link
                  href={`/menu/california/${slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)] transition hover:opacity-80"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  ← {location.name} menu
                </Link>
                <h1 className="font-display mt-3 uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 7.5rem)' }}>
                  Fresh
                  <br />
                  Drops
                </h1>
                <p className="mt-3 max-w-sm text-sm text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                  The weekly release at {location.name}. Small batches — gone when they&rsquo;re gone.
                </p>
              </div>
            </div>

            {/* the gold clock tile — glow orbits the box */}
            <DropCountdown />
          </div>

          {strainOfWeek && <StrainOfTheWeek product={strainOfWeek} storeSlug={slug} bg={dropsHero} />}
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
