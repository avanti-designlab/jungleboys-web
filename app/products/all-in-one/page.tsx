import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import GtHero from '@/components/products/gas-tank/gt-hero'
import GtRefresh from '@/components/products/gas-tank/gt-refresh'
import GtTape from '@/components/products/gas-tank/gt-tape'
import GtCharacter from '@/components/products/gas-tank/gt-character'
import GtUpgrade from '@/components/products/gas-tank/gt-upgrade'
import GtShowcase from '@/components/products/gas-tank/gt-showcase'
import GtDifference from '@/components/products/gas-tank/gt-difference'
import GtShop from '@/components/products/gas-tank/gt-shop'
import GtOutro from '@/components/products/gas-tank/gt-outro'

// Gas Tank — fourth Phase 2 flagship. A fire-surface cinematic scroll:
// ignition hero (three tiers arriving out of the dark, parallax depth) →
// caution tape → character reveal → the milk-cart upgrade head-to-head →
// a hazard field you travel through in four parallax depths → the three-tier
// difference ladder → shop split by tier. Static folder overrides the [line]
// stub. JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/all-in-one', {
    title: 'All-In-One Gas Tank — Flavors, Live Resin & Live Rosin',
    description:
      'The new All-In-One Gas Tank: bigger vapor, smoother pulls and a longer-lasting battery, powered by CCELL. Available in Flavors, Live Resin and Live Rosin.',
  })
}

export default function GasTankPage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="gt-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'All-In-One Gas Tank', path: '/products/all-in-one' },
            ])
          ),
        }}
      />

      <GtRefresh />
      <GtHero />
      <GtCharacter />
      <GtUpgrade />
      <GtShowcase />
      <GtTape reverse />
      <GtDifference />
      <GtShop />
      <GtOutro />
    </main>
  )
}
