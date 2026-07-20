import type { Metadata } from 'next'
import ProductFinderMap from '@/components/product-finder/product-finder-map'
import { breadcrumbSchema } from '@/lib/schema'

// Product Finder — /find-jb-products. Where to buy Jungle Boys at 3rd-party
// stockists (SEPARATE from owned /locations, two-map rule). Same banner
// treatment as /contact + /media + /wholesale, then a searchable full-width map.

export const metadata: Metadata = {
  title: 'Product Finder — Find Jungle Boys Near You',
  description:
    'Find Jungle Boys products near you. Search your address or ZIP, or use your location, to find dispensaries that carry Jungle Boys across California and Florida.',
}

export default function ProductFinderPage() {
  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Product Finder', path: '/find-jb-products' },
            ])
          ),
        }}
      />

      <h1 className="sr-only">Product Finder — Find Jungle Boys Products Near You</h1>

      {/* character banner — same treatment as /contact + /media + /wholesale */}
      <section data-pf-banner className="px-2 pt-2 md:px-3">
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
          {/* giant wordmark — drops in letter-by-letter, below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap uppercase leading-none text-white/90"
            style={{ fontSize: 'min(20.5vw, 500px)' }}
          >
            {'PRODUCT FINDER'.split('').map((ch, i) => (
              <span key={i} className={ch === ' ' ? '' : 'contact-letter'} style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- character art */}
          <img
            src="/product-finder/pf-header.svg"
            alt="Find Jungle Boys products"
            className="contact-alive relative z-10 h-[104%] w-auto max-w-none translate-y-[5%] drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* heading */}
      <section className="px-4 pt-14 text-center md:px-8 md:pt-20 lg:px-12">
        <h2 className="font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
          Find Jungle Boys Products Near You
        </h2>
      </section>

      <div className="pt-10 md:pt-12">
        <ProductFinderMap />
      </div>
    </main>
  )
}
