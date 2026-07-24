import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import PopsStripes from '@/components/products/pops/pops-stripes'
import PopsHero from '@/components/products/pops/pops-hero'
import PopsFacts from '@/components/products/pops/pops-facts'
import PopsMarquee from '@/components/products/pops/pops-marquee'
import PopsLineup from '@/components/products/pops/pops-lineup'
import PopsShop from '@/components/products/pops/pops-shop'

// Pops — third Phase 2 flagship. Candy-stripe surface: the bucket erupts with
// baby nugs and clears to the POPS reveal → a 3D fact drum → the lineup as a
// scroll-linked coverflow → shop. Static folder overrides the [line] stub.
// JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/pops', {
    title: '5G Pops — Small Nug Indoor Flower',
    description:
      'Five grams of small-nug indoor flower in the candy-striped jar. The same premium exotic strains and terpene-rich profiles, hand-selected from the top of each harvest — better value, nothing sacrificed.',
  })
}

export default function PopsPage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="pops-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: '5G Pops', path: '/products/pops' },
            ])
          ),
        }}
      />
      <PopsStripes />

      {/* all content rides above the fixed stripe field (z-0) */}
      <div className="relative z-10">
        <PopsHero />
        <PopsMarquee />
        <PopsFacts />
        <PopsLineup />
        <PopsMarquee reverse />
        <PopsShop />
        <div aria-hidden className="h-[10vh] min-h-[70px]" />
      </div>
    </main>
  )
}
