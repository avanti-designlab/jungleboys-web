import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import TwHero from '@/components/products/twins/tw-hero'
import TwDouble from '@/components/products/twins/tw-double'
import TwClaims from '@/components/products/twins/tw-claims'
import TwBand from '@/components/products/twins/tw-band'
import TwShop from '@/components/products/twins/tw-shop'
import MoreLines from '@/components/products/more-lines'

// Twins 2PK Pre-Rolls — the last Phase 2 flagship, and the red-and-navy one.
// Colours are sampled out of the TWINS mark itself, not eyeballed.
//
// The page is built around one idea — you get two — and every section performs
// it rather than captioning it: the mark lands massive while a single mascot
// splits into its twin → two joints scissor apart in real 3D and the grams
// count up → six claims laid out as a mirrored pair → the mural band with type
// running in opposite directions → shop in the opposite colour on white.
// JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/twins', {
    title: 'Twins 2 Pack Pre-Rolls — Two 0.75g Rolls, 1.5g Total',
    description:
      'Two 0.75g pre-rolls in every tube — 1.5g total. Premium indoor flower, no cones, all natural unrefined paper and crutch. Perfect solo or shared.',
  })
}

export default function TwinsPage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="tw-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'Twins 2 Pack Pre-Rolls', path: '/products/twins' },
            ])
          ),
        }}
      />

      <TwHero />
      <TwDouble />
      <TwClaims />
      <TwBand />
      <TwShop />
      <div aria-hidden className="h-[8vh] min-h-[60px]" />
          <MoreLines current="twins" />
</main>
  )
}
