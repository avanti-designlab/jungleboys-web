import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocations, getMenu, getProductBySlug, getProducts } from '@/lib/dutchie'
import { jsonLdHtml, breadcrumbSchema, productSchema } from '@/lib/schema'
import PdpBuyBox, { type StoreOffer } from '@/components/shop/pdp-buy-box'

// Product detail — ONE canonical page per product, store switched in the buy box.
//
// Nesting the PDP per store would have meant ~180 pages today and thousands once
// third-party brands land, differing only in price and stock. Google reads that
// as near-duplicate and picks one winner, so four weak pages replace one strong
// one. Local intent is already owned by the store menu pages — /menu/jungle-boys-dtla
// alone carries 21k clicks/yr — so the PDP does not need to carry it too.
// `?store=<slug>` deep-links resolve in the buy box; the canonical stays clean.
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

  const Fact = ({ label, value }: { label: string; value: string }) => (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-1 text-sm leading-snug">{value}</dd>
    </div>
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

      <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-10 md:grid-cols-2 md:px-12 md:pt-14 lg:px-20">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-media-well)]">
          {shot && (
            <Image
              src={shot.url}
              alt={shot.alt}
              fill
              priority
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-contain p-8"
            />
          )}
        </div>

        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {product.brand}
          </p>
          <h1 className="font-display mt-2 text-5xl uppercase leading-[0.9] md:text-6xl">{product.name}</h1>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-foreground-soft)]">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <PdpBuyBox offers={offers} />
          </div>
        </div>
      </div>

      {(lab || profile || product.effects?.length) && (
        <section className="mx-auto mt-14 max-w-6xl px-6 md:px-12 lg:px-20">
          <dl
            className="grid gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 sm:grid-cols-2 lg:grid-cols-4"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {lab?.potency?.thc && (
              <Fact label="THC" value={`${lab.potency.thc.value}${lab.potency.thc.unit}`} />
            )}
            {lab?.potency?.cbd && (
              <Fact label="CBD" value={`${lab.potency.cbd.value}${lab.potency.cbd.unit}`} />
            )}
            {profile?.genetics && <Fact label="Genetics" value={profile.genetics} />}
            {profile?.taste?.length ? <Fact label="Taste" value={profile.taste.join(', ')} /> : null}
            {product.effects?.length ? <Fact label="Effects" value={product.effects.join(', ')} /> : null}
            {lab?.terpenes?.length ? (
              <Fact
                label="Terpenes"
                value={lab.terpenes.map((t) => `${t.name} ${t.percentage}%`).join(' · ')}
              />
            ) : null}
          </dl>

          {/* The full COA panel (2026-08-03 contract amendment). Distinct from
              the THC/CBD headline above: that is the summary every card reads,
              this is the eight-row detail the reference PDP carries. Rendered
              only when the panel exists — thc/cbd alone stays a two-fact dl. */}
          {lab?.cannabinoids?.length ? (
            <div
              className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Cannabinoid panel
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {lab.cannabinoids.map((c) => (
                  <div key={c.name} className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                    <dt className="text-xs font-bold uppercase tracking-widest">{c.name}</dt>
                    <dd className="text-sm font-extrabold">
                      {c.value}
                      {c.unit}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {/* Only rendered when a real COA exists. A lab-results link that goes
              nowhere is worse than none at all on a cannabis product page. */}
          {lab?.coaUrl && (
            <p className="mt-4" style={{ fontFamily: 'var(--font-brand)' }}>
              <Link
                href={lab.coaUrl}
                className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
              >
                Certificate of analysis →
              </Link>
            </p>
          )}
        </section>
      )}
    </main>
  )
}
