import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import HhSky from '@/components/products/hash-hole/hh-sky'
import HhRevealRoot from '@/components/products/hash-hole/hh-reveal-root'
import HhHero from '@/components/products/hash-hole/hh-hero'
import HhIntro from '@/components/products/hash-hole/hh-intro'
import HhProduct from '@/components/products/hash-hole/hh-product'
import HhBreakdown from '@/components/products/hash-hole/hh-breakdown'
import HhHowTo from '@/components/products/hash-hole/hh-howto'
import HhVideos from '@/components/products/hash-hole/hh-videos'
import HhShop from '@/components/products/hash-hole/hh-shop'
import HhMarquee from '@/components/products/hash-hole/hh-marquee'
import HhFinale from '@/components/products/hash-hole/hh-finale'

// Hash Hole — second Phase 2 flagship. A sky-day journey: video hero → intro
// specs → product twirl → inside-the-hole breakdown → how to smoke → roll/smoke
// videos → shop → golf-course finale. Static folder overrides the [line] stub.
// JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/hash-hole', {
    title: 'Hash Hole — Infused Pre-Roll',
    description:
      '2g premium indoor flower, a .5g live hash rosin core, organic wood tip, all-natural paper. One perfect hole. Shop Jungle Boys Hash Holes — Gelato Z, Private Reserve, Blu Frootz.',
  })
}

export default function HashHolePage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="hh-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'Hash Hole', path: '/products/hash-hole' },
            ])
          ),
        }}
      />
      <HhSky />
      <HhRevealRoot />
      {/* all content rides above the fixed sky (z-0) */}
      <div className="relative z-10">
        <HhHero />
        <HhMarquee />
        <HhIntro />
        <HhProduct />
        <HhBreakdown />
        <HhMarquee reverse />
        <HhHowTo />
        <HhVideos />
        <HhShop />
        <HhFinale />
        {/* sky breathing room so the green scene never touches the footer */}
        <div aria-hidden className="h-[16vh] min-h-[110px]" />
      </div>
    </main>
  )
}
