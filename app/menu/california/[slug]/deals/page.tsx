import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product, Special } from '@/lib/dutchie'
import { getLocations, getLocationBySlug, getMenu, getSpecials } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import { ProductCard } from '@/components/menu/menu-browser'
import DealsExperience, { type DealRailItem } from '@/components/menu/deals-experience'
import Reveal from '@/components/reveal'

// Deals for one store. "Deals", not "Specials" — same surface, the site says
// Deals (Avanti, 2026-07-31). Nested under the store because discounts are
// per-location.
//
// REVAMPED (Avanti, 2026-08-04): deals are the NAMED specials set up in the
// Dutchie backend (amendment #4), shown as bold sections with their member
// products — organised into JB CA's two groups, Jungle Boys Deals and
// Outsource Deals, behind a split selector, with a sticky rail that follows
// the scroll. Sale-priced products that belong to NO named special still show
// in a synthetic "More markdowns" section per group — everything set up in
// the backend is on this page, and nothing discounted hides.

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

const onSale = (p: Product) =>
  p.variants.some((v) => v.specialPrice != null && v.specialPrice < v.price)

function DealSection({
  special,
  products,
  storeSlug,
}: {
  special: Special
  products: Product[]
  storeSlug: string
}) {
  const jb = special.group === 'jungle-boys'
  return (
    <Reveal>
    <section
      id={`deal-${special.slug}`}
      data-deal={special.slug}
      data-deal-group={special.group}
      className="scroll-mt-28 rounded-[2rem] border border-[var(--color-border)] p-6 md:p-9"
      style={{
        background: jb
          ? 'color-mix(in srgb, var(--color-accent) 9%, var(--color-surface))'
          : 'color-mix(in srgb, var(--color-danger) 6%, var(--color-surface))',
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {special.percentOff != null && (
          <span
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.14em] ${
              jb ? 'bg-[var(--color-accent)] text-black' : 'text-white'
            }`}
            style={{
              fontFamily: 'var(--font-brand)',
              ...(jb ? {} : { background: 'var(--color-danger-solid)' }),
            }}
          >
            {special.percentOff}% off
          </span>
        )}
        <span
          className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>
      <h2 className="font-display mt-2 text-4xl uppercase leading-[0.9] md:text-6xl">
        {special.name}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
        ))}
      </div>
    </section>
    </Reveal>
  )
}

export default async function StoreDealsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocationBySlug(slug)
  if (!location) notFound()

  const [menu, specials] = await Promise.all([
    getMenu(location.retailerId),
    getSpecials(location.retailerId),
  ])
  const bySlug = new Map(menu.products.map((p) => [p.slug, p]))

  // Resolve each named special against the live menu; a special whose products
  // are all gone renders nothing rather than an empty promise.
  const resolved = specials
    .map((s) => ({
      special: s,
      products: s.productSlugs
        .map((ps) => bySlug.get(ps))
        .filter((p): p is Product => !!p && onSale(p)),
    }))
    .filter((r) => r.products.length > 0)

  // Anything discounted on the menu that no named special claims — grouped by
  // house vs outsource so the split still covers it.
  const claimed = new Set(resolved.flatMap((r) => r.products.map((p) => p.slug)))
  const stray = menu.products.filter((p) => onSale(p) && !claimed.has(p.slug))
  const strayJb = stray.filter((p) => /^jungle boys/i.test(p.brand))
  const strayOs = stray.filter((p) => !/^jungle boys/i.test(p.brand))
  const withStrays: { special: Special; products: Product[] }[] = [
    ...resolved,
    ...(strayJb.length
      ? [{
          special: { id: 'sp-more-jb', slug: 'more-jungle-boys-markdowns', name: 'More Jungle Boys Markdowns', group: 'jungle-boys' as const, productSlugs: [] },
          products: strayJb,
        }]
      : []),
    ...(strayOs.length
      ? [{
          special: { id: 'sp-more-os', slug: 'more-markdowns', name: 'More Markdowns', group: 'outsource' as const, productSlugs: [] },
          products: strayOs,
        }]
      : []),
  ]

  const jbDeals = withStrays.filter((r) => r.special.group === 'jungle-boys')
  const osDeals = withStrays.filter((r) => r.special.group === 'outsource')
  const railItems: DealRailItem[] = withStrays.map((r) => ({
    slug: r.special.slug,
    name: r.special.name,
    count: r.products.length,
    group: r.special.group,
    percentOff: r.special.percentOff,
  }))
  const totalProducts = new Set(withStrays.flatMap((r) => r.products.map((p) => p.slug))).size

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

      {/* ── HERO — the big bump ── */}
      <header className="px-2 pt-2 md:px-3">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-12 pt-20 text-white md:rounded-[2.5rem] md:px-12 md:pb-14 md:pt-24 lg:px-20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(50%_100%_at_30%_0%,rgba(254,207,14,0.18),transparent_70%),radial-gradient(50%_100%_at_75%_0%,color-mix(in_srgb,var(--color-danger-solid)_28%,transparent),transparent_70%)]"
          />
          {/* Avanti's DEALS character (DEALS HEADER.svg → webp) rides the
              right edge, full height, behind nothing that matters on mobile */}
          {/* eslint-disable-next-line @next/next/no-img-element -- brand character */}
          <img
            src="/deals/deals-character.webp"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-2 hidden h-full w-auto object-contain object-bottom lg:block xl:right-10"
          />
          <div className="relative mx-auto max-w-[1400px] lg:pr-72 xl:pr-80">
            <Link
              href={`/menu/california/${slug}`}
              className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)] transition hover:opacity-80"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              ← {location.name} menu
            </Link>
            <h1 className="font-display mt-4 uppercase leading-[0.85]" style={{ fontSize: 'min(16vw, 11rem)' }}>
              Deals
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
              {withStrays.length} live {withStrays.length === 1 ? 'deal' : 'deals'} · {totalProducts}{' '}
              products marked down at {location.name}. Straight from the menu — what you see is what
              is on the shelf right now.
            </p>
          </div>
        </div>
      </header>

      {withStrays.length === 0 ? (
        // An honest empty state — never render the full menu as fake "deals".
        <section className="px-6 py-20 text-center md:px-12 lg:px-20">
          <p className="text-[var(--color-muted)]">No deals running at {location.name} right now.</p>
          <Link
            href={`/menu/california/${slug}`}
            className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] hover:opacity-80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Browse the full menu →
          </Link>
        </section>
      ) : (
        <div className="px-6 pt-8 md:px-12 lg:px-20 lg:pt-10">
          <div className="mx-auto max-w-[1400px]">
            <DealsExperience
              jbCount={jbDeals.length}
              outsourceCount={osDeals.length}
              rail={railItems}
              jb={jbDeals.map((r) => (
                <DealSection key={r.special.id} special={r.special} products={r.products} storeSlug={slug} />
              ))}
              outsource={osDeals.map((r) => (
                <DealSection key={r.special.id} special={r.special} products={r.products} storeSlug={slug} />
              ))}
            />
          </div>
        </div>
      )}
    </main>
  )
}
