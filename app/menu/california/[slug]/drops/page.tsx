import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import BackPill from '@/components/menu/back-pill'
import type { Product, ProductCategory, StrainType } from '@/lib/dutchie'
import { getLocations, getLocationBySlug } from '@/lib/dutchie'
import { getDrops, getDropsHero, type DropsHero } from '@/lib/drops'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import { AddToCartButton, ProductCard } from '@/components/menu/menu-browser'
import { categoryLabel, STRAIN_STYLE } from '@/components/menu/labels'
import BrandShelf from '@/components/menu/brand-shelf'
import DropCountdown from '@/components/menu/drop-countdown'
import Reveal from '@/components/reveal'

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
      className="relative flex min-h-[560px] w-full flex-col overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] p-6 text-white md:rounded-[2rem] md:p-9"
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
        {/* badge alone up top — strain/THC live on the buy line below
            (Avanti, 2026-08-04: "move sativa and thc to the bottom") */}
        <div className="flex items-center">
          <span className="font-display rounded-full bg-[var(--color-accent)] px-4 py-2 text-[16px] uppercase leading-none tracking-[0.06em] text-black">
            Strain of the week
          </span>
        </div>

        {/* the shot, BIG, on a gold glow ring */}
        {shot && (
          <div className="relative mx-auto mt-6">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(254,207,14,0.28),transparent_72%)]"
            />
            <Link
              href={`/shop/${product.slug}?store=${storeSlug}`}
              aria-label={product.name}
              className="relative block h-72 w-72 -rotate-2 overflow-hidden rounded-[2.25rem] bg-white shadow-[0_36px_70px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:rotate-0 md:h-[24rem] md:w-[24rem]"
            >
              <Image
                src={shot.url}
                alt={shot.alt}
                fill
                priority
                sizes="(max-width: 768px) 75vw, 400px"
                className="object-contain p-6"
              />
            </Link>
          </div>
        )}

        <h2
          className="font-display mt-6 text-center uppercase leading-[0.82]"
          style={{ fontSize: 'min(13vw, 6rem)' }}
        >
          <Link href={`/shop/${product.slug}?store=${storeSlug}`} className="hover:text-[var(--color-accent)]">
            {product.name}
          </Link>
        </h2>

        {/* facts as twin panels, not floating text */}
        <div className="mx-auto mt-5 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2" style={{ fontFamily: 'var(--font-brand)' }}>
          {profile?.genetics && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">Genetics</p>
              <p className="mt-1.5 text-sm leading-snug text-white">{profile.genetics}</p>
            </div>
          )}
          {profile?.taste?.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">Taste</p>
              <p className="mt-1.5 text-sm capitalize leading-snug text-white">{profile.taste.join(', ')}</p>
            </div>
          ) : null}
        </div>

        {/* the buy line — strain facts left, money + action right, one
            organized bar instead of a centered float */}
        <div className="mx-auto mt-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white/12 pt-5">
          <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: 'var(--font-brand)' }}>
            {product.strainType && (
              <span className={`rounded-full border-2 bg-white/90 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-widest ${STRAIN_STYLE[product.strainType].cls}`}>
                {STRAIN_STYLE[product.strainType].label}
              </span>
            )}
            {thc && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-white">
                THC <span className="text-[var(--color-accent)]">{thc.value}{thc.unit}</span>
              </span>
            )}
          </div>
          {inStock.length === 0 ? (
            <span className="text-sm font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Sold out
            </span>
          ) : (
            <div className="flex items-center gap-4">
              <span className="whitespace-nowrap">
                <span className="font-display text-[2.6rem] leading-none text-white">{money(from)}</span>
                <span className="ml-1.5 text-xs font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  · {best.option}
                </span>
              </span>
              <AddToCartButton product={product} variant={best} storeSlug={storeSlug} tone="gold" />
            </div>
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
            <Reveal slide className="flex flex-1">
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] p-7 pt-16 text-white md:rounded-[2rem] md:p-10 md:pt-20">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_100%_at_40%_0%,rgba(254,207,14,0.2),transparent_70%)]"
              />
              {/* faint brand cart art fills the tile's shoulder — decorative */}
              {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
              <img
                src="/shop/icons/cart.svg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-8 -right-6 h-56 w-56 object-contain opacity-[0.08] invert"
              />
              <div className="relative flex flex-1 flex-col">
                <BackPill href={`/menu/california/${slug}`} label={`${location.name} menu`} />
                <h1 className="font-display mt-3 whitespace-nowrap uppercase leading-[0.85]" style={{ fontSize: 'min(9vw, 5.75rem)' }}>
                  Fresh Drops
                </h1>
                <p className="mt-3 max-w-sm text-sm text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                  The weekly release at {location.name}. Small batches — gone when they&rsquo;re gone.
                </p>

                {/* what's IN this week's drop — quick-jump chips per category
                    (fills the tile with the drop's own facts, Avanti 2026-08-04) */}
                {byCategory.length > 0 && (
                  <div className="mt-6" style={{ fontFamily: 'var(--font-brand)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      In this week&rsquo;s drop
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {byCategory.map((g) => (
                        <a
                          key={g.category}
                          href={`#drop-${g.category}`}
                          className="rounded-full border border-white/20 px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest text-white/85 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          {categoryLabel(g.category)} · {g.products.length}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href="#drop-list"
                  className="font-display mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 pt-3.5 text-[17px] uppercase leading-none tracking-[0.06em] text-black transition-transform duration-200 hover:-translate-y-0.5"
                >
                  See the full drop list
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
                    <path d="M12 5v14m-6-6 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            </Reveal>

            {/* the gold clock tile — glow orbits the box */}
            <Reveal delay={0.1}>
              <DropCountdown opensAt={location.hours.find((h) => h.day === 'fri')?.opens ?? '00:00'} />
            </Reveal>
          </div>

          {strainOfWeek && (
            <Reveal slide delay={0.05} className="flex">
              <StrainOfTheWeek product={strainOfWeek} storeSlug={slug} bg={dropsHero} />
            </Reveal>
          )}
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
                <Reveal key={g.category}>
                <section id={`drop-${g.category}`} data-drop-category={g.category} aria-label={categoryLabel(g.category)} className="scroll-mt-28">
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
