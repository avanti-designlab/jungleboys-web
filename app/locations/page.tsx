import type { Metadata } from 'next'
import LocationsDirectory from '@/components/locations/locations-directory'
import { OWNED_STORES } from '@/lib/owned-stores'
import { breadcrumbSchema } from '@/lib/schema'

// Locations — Jungle Boys owned dispensaries (/locations). Same banner treatment
// as the other pages (LOCATIONS wordmark + the Product Finder character), then
// hand-drawn store cards grouped under animated California / Florida postcards.
// Owned stores only — SEPARATE from the Product Finder stockist map.

export const metadata: Metadata = {
  title: 'Locations — Jungle Boys Dispensaries',
  description:
    'Visit a Jungle Boys dispensary. Find our stores across California and Florida — addresses, hours, and menus. Playing With Fire® since 2006.',
}

const SITE_URL = 'https://www.jungleboys.com'

export default function LocationsPage() {
  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Locations', path: '/locations' },
            ]),
            ...OWNED_STORES.map((s) => ({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: `Jungle Boys ${s.name}`,
              url: `${SITE_URL}${s.menuUrl}`,
              telephone: s.phone,
              address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'US' },
            })),
          ]),
        }}
      />

      <h1 className="sr-only">Jungle Boys Locations — California & Florida Dispensaries</h1>

      {/* character banner — same treatment as the other pages */}
      <section data-loc-banner className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[520px] md:rounded-[2.5rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
          <img
            src="/contact/contact-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant LOCATIONS wordmark — drops in letter-by-letter, at 65% like the others */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[65%] z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap uppercase leading-none text-white/90"
            style={{ fontSize: 'min(25vw, 620px)' }}
          >
            {'LOCATIONS'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.18 + i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- character art (shared with product finder) */}
          <img
            src="/product-finder/pf-header.svg"
            alt="Jungle Boys Locations"
            className="contact-alive relative z-10 h-[104%] w-auto max-w-none translate-y-[5%] drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* heading */}
      <section className="px-4 pt-16 text-center md:px-8 md:pt-24 lg:px-12">
        <span
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--color-muted)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" />
          Come Through
        </span>
        <h2 className="mt-5 font-display text-6xl uppercase leading-[0.85] text-[var(--color-foreground)] md:text-8xl">
          Visit the <span className="text-[var(--color-accent-ink)]">Jungle</span>
        </h2>
        <div
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] md:text-base"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <span className="text-[var(--color-foreground)]">{OWNED_STORES.length} Locations</span>
          <span className="text-[var(--color-accent)]">◆</span>
          <span>California &amp; Florida</span>
          <span className="text-[var(--color-accent)]">◆</span>
          <span>Doors Open Daily</span>
        </div>
      </section>

      <LocationsDirectory />
    </main>
  )
}
