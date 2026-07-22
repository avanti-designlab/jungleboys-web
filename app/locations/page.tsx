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
          className="media-hero-in relative flex h-[400px] items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[540px] md:rounded-[2.5rem]"
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
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[104px]"
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
            className="hero-alive relative z-10 drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* scrolling marquee — big Bebas, replaces the old static heading */}
      <section className="overflow-hidden py-10 md:py-14" aria-label={`${OWNED_STORES.length} locations across California and Florida`}>
        <div className="flex w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="marquee-track flex shrink-0 items-center" aria-hidden={dup === 1}>
              {[
                `${OWNED_STORES.length} Locations`,
                'California & Florida',
                'Doors Open Daily',
                'Visit the Jungle',
              ]
                .concat([
                  `${OWNED_STORES.length} Locations`,
                  'California & Florida',
                  'Doors Open Daily',
                  'Visit the Jungle',
                ])
                .map((phrase, i) => (
                  <span key={i} className="flex items-center">
                    <span className="font-display text-6xl uppercase leading-none text-[var(--color-foreground)] md:text-8xl">{phrase}</span>
                    <span className="mx-8 text-4xl text-[var(--color-accent)] md:mx-12 md:text-5xl">◆</span>
                  </span>
                ))}
            </div>
          ))}
        </div>
      </section>

      <LocationsDirectory />
    </main>
  )
}
