import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocations, getMenu, getProductBySlug, getProducts } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema, productSchema } from '@/lib/schema'
import PdpBuyBox, { type StoreOffer } from '@/components/shop/pdp-buy-box'
import { ProductCard } from '@/components/menu/menu-browser'
import { categoryLabel } from '@/components/menu/labels'

// Product detail — ONE canonical page per product, store switched in the buy box.
//
// Nesting the PDP per store would have meant ~180 pages today and thousands once
// third-party brands land, differing only in price and stock. Google reads that
// as near-duplicate and picks one winner, so four weak pages replace one strong
// one. Local intent is already owned by the store menu pages — /menu/jungle-boys-dtla
// alone carries 21k clicks/yr — so the PDP does not need to carry it too.
// `?store=<slug>` deep-links resolve in the buy box; the canonical stays clean.
//
// REDESIGNED (Avanti, 2026-08-04, reference: the jungleboysflorida.com PDP):
// same DATA ELEMENTS — every one pullable from Dutchie through the frozen
// contract — laid out in the shell's own language: dark hero (stage left,
// name/chips/buy-ticket right), THE FACTS band (Genetics/Taste/Effects),
// CERTIFIED ANALYSIS with proportional bars for the cannabinoid panel and
// terpenes (bars scale to the MEASURED values, nothing invented), lab + COA
// line, and a shoppable same-category row. Every section renders only when
// its data exists — an absent fact stays absent.
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

  // Same-category row (the reference's "current top sellers" slot) — from the
  // catalogue, linked through the first store that stocks this product.
  const relatedStore = offers[0]?.slug ?? 'downtown-los-angeles'
  const related = (await getProducts({ category: product.category }))
    .filter((p) => p.slug !== slug)
    .slice(0, 4)

  const chip = (label: string) => (
    <span
      key={label}
      className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/85"
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
            // productSchema() finally has a consumer. It was kept through the
            // Phase 2 schema cleanup and marked NOT WIRED precisely because it
            // had no live counterpart to drift from — this is that counterpart.
            productSchema(product),
          ]),
        }}
      />

      {/* ── HERO — stage left, identity + buy ticket right ── */}
      <header className="px-2 pt-2 md:px-3">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-10 pt-20 text-white md:rounded-[2.5rem] md:px-12 md:pb-12 md:pt-24 lg:px-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_30%_0%,rgba(254,207,14,0.18),transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-[1400px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
            {/* stage */}
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[var(--color-media-well)]">
              {shot && (
                <Image
                  src={shot.url}
                  alt={shot.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 45vw"
                  className="object-contain p-10 drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)]"
                />
              )}
              {product.featured && (
                <span
                  className="absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white"
                  style={{ fontFamily: 'var(--font-brand)', background: 'var(--color-danger-solid)' }}
                >
                  Hot
                </span>
              )}
            </div>

            {/* identity + ticket */}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
                {product.brand}
              </p>
              <h1 className="font-display mt-2 uppercase leading-[0.85]" style={{ fontSize: 'min(11vw, 5.5rem)' }}>
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.strainType && chip(product.strainType)}
                {thc && chip(`THC ${thc.value}${thc.unit}`)}
                {cbd && chip(`CBD ${cbd.value}${cbd.unit}`)}
                {terpTotal ? chip(`Terps ${terpTotal.toFixed(1)}%`) : null}
                {product.subcategory && chip(categoryLabel(product.category))}
              </div>

              {product.description && (
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">{product.description}</p>
              )}

              {/* the buy ticket — the store-dependent piece, on its own
                  surface card so the theme-var styling reads on the dark hero */}
              <div className="mt-7 rounded-[2rem] bg-[var(--color-surface)] p-6 text-[var(--color-foreground)] md:p-7">
                <PdpBuyBox offers={offers} product={{ slug: product.slug, name: product.name }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── THE FACTS — the reference card's Genetics / Taste / Effects ── */}
      {(profile?.genetics || profile?.taste?.length || product.effects?.length) && (
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
                  Effects
                </p>
                <p className="font-display mt-2 text-[26px] uppercase capitalize leading-[0.95] md:text-[30px]">{product.effects.join(' · ')}</p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* ── CERTIFIED ANALYSIS — the full panel + terpenes, as measured ── */}
      {(lab?.cannabinoids?.length || lab?.terpenes?.length) && (
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

            {lab?.terpenes?.length ? (
              <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-9">
                <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">Terpenes</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  The key to the smell and the taste — measured for this batch.
                </p>
                <div className="mt-6 space-y-3.5">
                  {lab.terpenes.map((t) => (
                    <BarRow key={t.name} name={t.name} value={t.percentage} unit="%" max={terpMax} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {(lab?.lab || lab?.testedAt || lab?.coaUrl) && (
            <p
              className="mx-auto mt-5 flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {lab?.lab && <span>Tested by {lab.lab}</span>}
              {lab?.testedAt && <span>· {lab.testedAt}</span>}
              {/* Only rendered when a real COA exists. A lab-results link that
                  goes nowhere is worse than none on a cannabis product page. */}
              {lab?.coaUrl && (
                <Link href={lab.coaUrl} className="text-[var(--color-accent-ink)] underline-offset-4 hover:underline">
                  Certificate of analysis →
                </Link>
              )}
            </p>
          )}
        </section>
      )}

      {/* ── same-category row — the reference's top-sellers slot ── */}
      {related.length > 0 && (
        <section aria-labelledby="pdp-related" className="px-6 pt-14 md:px-12 lg:px-20">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="pdp-related" className="font-display text-4xl uppercase leading-none md:text-6xl">
                More {categoryLabel(product.category)}
              </h2>
              <Link
                href={`/menu/california/${relatedStore}/shop/${product.category}`}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                View all →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} storeSlug={relatedStore} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
