import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocations, getMenu, getProductBySlug, getProducts, getSpecials } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema, productSchema } from '@/lib/schema'
import PdpBuyBox, { type StoreOffer } from '@/components/shop/pdp-buy-box'
import { ProductCard } from '@/components/menu/menu-browser'
import { categoryLabel, STRAIN_STYLE } from '@/components/menu/labels'
import { EffectPills, TerpenePills } from '@/components/shop/trait-pills'
import EffectsRadar from '@/components/shop/effects-radar'
import Reveal from '@/components/reveal'

// Product detail — ONE canonical page per product, store switched in the buy box.
//
// Nesting the PDP per store would have meant ~180 pages today and thousands once
// third-party brands land, differing only in price and stock. Google reads that
// as near-duplicate and picks one winner, so four weak pages replace one strong
// one. Local intent is already owned by the store menu pages — /menu/jungle-boys-dtla
// alone carries 21k clicks/yr — so the PDP does not need to carry it too.
// `?store=<slug>` deep-links resolve in the buy box; the canonical stays clean.
//
// v2 (Avanti, 2026-08-04: "missing a lot of things… the black pill tile
// shouldn't be black… really redo this page"): LIGHT layout on the theme
// ground — no dark hero card. Sticky media stage + badges left; identity,
// chips, buy ticket, per-store availability and the lab line right; THE
// FACTS on the gold tint; Certified Analysis + Terpenes bar cards; an
// evergreen PWF Rewards band; the shoppable same-category row. Every element
// maps to a Dutchie-pullable field and hides when its data is absent.
//
// Lives at /shop/ rather than /products/, which is the curated JB line
// collection from Phase 2 and stays exactly as it is.

export const revalidate = 60

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.name} — ${product.brand}`,
    description:
      product.description?.slice(0, 155) ??
      `Shop ${product.name} by ${product.brand} at Jungle Boys California. Live pricing and availability by store.`,
    alternates: { canonical: `/shop/${slug}` },
  }
}

// Proportional bar row — width scales to the MEASURED value against the set's
// max, so the visual is the data, not decoration.
function BarRow({ name, value, unit, max }: { name: string; value: number; unit: string; max: number }) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 md:grid-cols-[9rem_1fr_auto]">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
        {name}
      </span>
      <span aria-hidden className="h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]">
        <span className="block h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${width}%` }} />
      </span>
      <span className="font-display text-[19px] leading-none tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  )
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  // Availability per store, resolved at build. The catalogue facts (name, art,
  // description, lab results) are store-independent; only variants differ.
  const locations = await getLocations()
  const offers: StoreOffer[] = (
    await Promise.all(
      locations.map(async (l) => {
        const menu = await getMenu(l.retailerId)
        const match = menu.products.find((p) => p.slug === slug)
        return match
          ? { slug: l.slug, name: l.name, city: l.city, state: l.state, variants: match.variants }
          : null
      })
    )
  ).filter((o): o is StoreOffer => o !== null)

  const shot = product.images[0]
  const lab = product.labResult
  const profile = product.strainProfile
  const thc = lab?.potency?.thc
  const cbd = lab?.potency?.cbd
  const terpTotal = lab?.terpenes?.reduce((s, t) => s + t.percentage, 0)
  const cannaMax = Math.max(...(lab?.cannabinoids?.map((c) => c.value) ?? [0]))
  const terpMax = Math.max(...(lab?.terpenes?.map((t) => t.percentage) ?? [0]))
  const onSale = product.variants.some((v) => v.specialPrice != null && v.specialPrice < v.price)
  const percentOff = onSale
    ? Math.max(
        ...product.variants
          .filter((v) => v.specialPrice != null && v.specialPrice < v.price)
          .map((v) => Math.round((1 - v.specialPrice! / v.price) * 100))
      )
    : 0

  const relatedStore = offers[0]?.slug ?? 'downtown-los-angeles'
  // The named Dutchie special covering this product (amendment #4) — the
  // reference PDP's purple callout, ours in brand yellow.
  const specials = await getSpecials(locations.find((l) => l.slug === relatedStore)?.retailerId ?? '')
  const special = specials.find((sp) => sp.productSlugs.includes(slug))
  // "Current top sellers" — curated from the product's own category, the
  // featured (staff-pick) items first. Same honest ranking as the Hot shelf.
  const related = (await getProducts({ category: product.category }))
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, 4)

  const chip = (label: ReactNode, key: string) => (
    <span
      key={key}
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-bold uppercase tracking-widest text-[var(--color-foreground)]/85"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {label}
    </span>
  )

  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml([
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              { name: product.name, path: `/shop/${slug}` },
            ]),
            productSchema(product),
          ]),
        }}
      />

      {/* ── TOP — stage left (sticky), identity + buy right. LIGHT, on the
          theme ground (v2: no black hero card). ── */}
      <section className="px-6 pt-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-[1400px] items-start gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
          {/* media stage + badges */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-media-well)] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              {shot && (
                <Image
                  src={shot.url}
                  alt={shot.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-contain p-10"
                />
              )}
              {onSale && (
                <span
                  className="absolute left-5 top-5 rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-widest text-black"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {percentOff}% off
                </span>
              )}
              {product.featured && (
                <span
                  className="absolute right-5 top-5 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-widest text-white"
                  style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
                >
                  Hot
                </span>
              )}
            </div>
            {/* badge strip — the reference PDP's marks, from real fields only */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chip(categoryLabel(product.category), 'cat')}
              {product.subcategory && chip(product.subcategory.replace(/-/g, ' '), 'sub')}
              {!/^jungle boys/i.test(product.brand) && chip(product.brand, 'brand')}
              {product.strain && chip(<>Strain · {product.strain}</>, 'strain')}
            </div>
          </div>

          {/* identity + ticket */}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
              {product.brand}
            </p>
            <h1 className="font-display mt-2 uppercase leading-[0.85]" style={{ fontSize: 'min(10vw, 5rem)' }}>
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {/* the ONE site-wide strain palette (Avanti, 2026-08-04) —
                  indica blue / sativa red / hybrid green, outlined */}
              {product.strainType && (
                <span
                  className={`rounded-full border-2 px-4 py-2 text-[13px] font-extrabold uppercase tracking-widest ${STRAIN_STYLE[product.strainType].cls}`}
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {STRAIN_STYLE[product.strainType].label}
                </span>
              )}
              {thc && chip(<>THC <span className="text-[var(--color-accent-ink)]">{thc.value}{thc.unit}</span></>, 'thc')}
              {cbd && chip(<>CBD <span className="text-[var(--color-accent-ink)]">{cbd.value}{cbd.unit}</span></>, 'cbd')}
              {terpTotal ? chip(<>Terps <span className="text-[var(--color-accent-ink)]">{terpTotal.toFixed(1)}%</span></>, 'terps') : null}
            </div>

            {product.description && (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-foreground-soft)]">
                {product.description}
              </p>
            )}

            {/* buy ticket — bordered surface card on the light ground */}
            <div className="mt-7 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.07)] md:p-7">
              <PdpBuyBox offers={offers} product={{ slug: product.slug, name: product.name }} />
            </div>

            {/* the named special, in yellow (Avanti: "the specials in purple
                will showcase the deal from dutchie, made in yellow") — links
                straight to that deal's section on the Deals page */}
            {(special || onSale) && (
              <Link
                href={special ? `/menu/california/${relatedStore}/deals#deal-${special.slug}` : `/menu/california/${relatedStore}/deals`}
                className="group mt-4 flex items-center gap-3.5 rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/15 px-4 py-3.5 transition-colors duration-200 hover:bg-[var(--color-accent)]/25"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-black">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
                    <path d="M20 13 11 22 2 13V4h9l9 9ZM6.5 8.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-foreground)]">
                    <span className="text-[var(--color-accent-ink)]">Special:</span>{' '}
                    {special
                      ? `${special.name}${special.percentOff != null ? ` — ${special.percentOff}% off` : ''}`
                      : `${percentOff}% off right now`}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-ink)] underline-offset-4 group-hover:underline">
                    Shop this special →
                  </span>
                </span>
              </Link>
            )}


            {/* lab line — only real facts, only when present */}
            {(lab?.lab || lab?.testedAt || lab?.coaUrl) && (
              <p
                className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {lab?.lab && <span>Tested by {lab.lab}</span>}
                {lab?.testedAt && <span>· {lab.testedAt}</span>}
                {lab?.coaUrl && (
                  <Link href={lab.coaUrl} className="text-[var(--color-accent-ink)] underline-offset-4 hover:underline">
                    Certificate of analysis →
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── THE FACTS — Genetics / Taste / Effects on the gold tint ── */}
      {(profile?.genetics || profile?.taste?.length || product.effects?.length) && (
        <Reveal>
        <section aria-label="The facts" className="px-6 pt-10 md:px-12 lg:px-20">
          <div
            className="mx-auto grid max-w-[1400px] gap-8 rounded-[2rem] border border-[var(--color-border)] p-7 sm:grid-cols-3 md:p-10"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 9%, var(--color-surface))' }}
          >
            {profile?.genetics && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Genetics
                </p>
                <p className="font-display mt-2 text-[26px] uppercase leading-[0.95] md:text-[30px]">{profile.genetics}</p>
              </div>
            )}
            {profile?.taste?.length ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Taste
                </p>
                <p className="font-display mt-2 text-[26px] uppercase leading-[0.95] md:text-[30px]">{profile.taste.join(' · ')}</p>
              </div>
            ) : null}
            {product.effects?.length ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Anticipated effects
                </p>
                <div className="mt-3">
                  <EffectPills effects={product.effects} />
                </div>
              </div>
            ) : null}
          </div>
        </section>
        </Reveal>
      )}

      {/* ── CERTIFIED ANALYSIS + TERPENES, as measured ── */}
      {(lab?.cannabinoids?.length || lab?.terpenes?.length) && (
        <Reveal>
        <section aria-labelledby="certified-analysis" className="px-6 pt-8 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-2">
            {lab?.cannabinoids?.length ? (
              <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9">
                <h2 id="certified-analysis" className="font-display text-3xl uppercase leading-none md:text-4xl">
                  Certified analysis
                </h2>
                <div className="mt-6 space-y-3.5">
                  {lab.cannabinoids.map((c) => (
                    <BarRow key={c.name} name={c.name} value={c.value} unit={c.unit} max={cannaMax} />
                  ))}
                </div>
              </div>
            ) : null}

            {profile?.effectScores?.length ? (
              <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9">
                <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">Effects profile</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  How this strain tends to land.
                </p>
                <div className="mt-4 text-[var(--color-foreground)]">
                  <EffectsRadar scores={profile.effectScores} />
                </div>
              </div>
            ) : null}

            {lab?.terpenes?.length ? (
              <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9">
                <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">Primary terpenes</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  The key to the smell and the taste — measured for this batch.
                </p>
                <div className="mt-5">
                  <TerpenePills names={lab.terpenes.map((t) => t.name)} />
                </div>
                <div className="mt-6 space-y-3.5">
                  {lab.terpenes.map((t) => (
                    <BarRow key={t.name} name={t.name} value={t.percentage} unit="%" max={terpMax} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* PWF Rewards fills the fourth slot (Avanti, 2026-08-04: no
                empty space) — evergreen navigation promo, never an invented
                discount */}
            <Link
              href="/rewards"
              className="group flex flex-col justify-between gap-6 rounded-[2rem] bg-[linear-gradient(120deg,#ffe27a_0%,#fecf0e_55%,#e7b30c_100%)] p-7 text-black transition-transform duration-200 hover:-translate-y-0.5 md:p-9"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  Playing with fire
                </span>
                <span className="font-display mt-1 block text-4xl uppercase leading-[0.9] md:text-5xl">
                  Earn points on every order
                </span>
              </span>
              <span
                className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Join PWF Rewards →
              </span>
            </Link>
          </div>
        </section>
        </Reveal>
      )}

      {/* ── same-category row ── */}
      {related.length > 0 && (
        <Reveal>
        <section aria-labelledby="pdp-related" className="px-6 pt-10 md:px-12 lg:px-20">
          {/* its own pill card (Avanti, 2026-08-04) */}
          <div className="mx-auto max-w-[1400px] rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-9">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="pdp-related" className="font-display text-4xl uppercase leading-none md:text-6xl">
                Current top sellers
              </h2>
              <Link
                href={`/menu/california/${relatedStore}/shop/${product.category}`}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                View all {categoryLabel(product.category)} →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={relatedStore} />
              ))}
            </div>
          </div>
        </section>
        </Reveal>
      )}
    </main>
  )
}
