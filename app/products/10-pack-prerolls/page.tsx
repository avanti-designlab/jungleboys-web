import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import TpHero from '@/components/products/ten-pack/tp-hero'
import TpFacts from '@/components/products/ten-pack/tp-facts'
import TpTen from '@/components/products/ten-pack/tp-ten'
import TpCreed from '@/components/products/ten-pack/tp-creed'
import TpShop from '@/components/products/ten-pack/tp-shop'
import MoreLines from '@/components/products/more-lines'

// 10 Pack Pre-Rolls — fifth Phase 2 flagship. Smoke + electric blue:
// the pour (ten mini joints fanning out of the jar in real 3D) → the claims →
// the ten proving themselves in a rank under a giant numeral → the creed →
// shop on white pill stages. Static folder overrides the [line] stub.
// JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/10-pack-prerolls', {
    title: '10 Pack Pre-Rolls — Ten 0.7g Mini Joints, 7g Total',
    description:
      'Ten 0.7g pre-rolls in every jar. Strain-specific packs rolled in small batches from indoor nugs — no trim, no shake, no shortcuts.',
  })
}

export default function TenPackPage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="tp-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: '10 Pack Pre-Rolls', path: '/products/10-pack-prerolls' },
            ])
          ),
        }}
      />

      <TpHero />
      <TpFacts />
      <TpTen />
      <TpCreed />
      <TpShop />
      <div aria-hidden className="h-[8vh] min-h-[60px]" />
          <MoreLines current="10-pack-prerolls" />
</main>
  )
}
