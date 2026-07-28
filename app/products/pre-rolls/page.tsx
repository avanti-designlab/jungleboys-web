import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import PrHero from '@/components/products/pre-rolls/pr-hero'
import PrDifferent from '@/components/products/pre-rolls/pr-different'
import PrProcess from '@/components/products/pre-rolls/pr-process'
import PrCrossover from '@/components/products/pre-rolls/pr-crossover'
import PrShop from '@/components/products/pre-rolls/pr-shop'

// 1G Pre-Rolls — sixth Phase 2 flagship, and the green one.
// The name at full bleed over a row of oversized tubes → WE ROLL DIFFERENT as a
// real 3D ring orbiting the joint → how it's made → NO PREP. ALL FIRE. running
// vertically and flipping to outline across the pre-roll → shop on white.
// Static folder overrides the [line] stub.
// JSON-LD breadcrumb-only (placeholder prices until Dutchie, Phase 3).

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/pre-rolls', {
    title: '1G Pre-Rolls — Single-Strain, Rolled from Whole Nugs',
    description:
      'One gram, one strain, rolled from the same indoor flower we jar — never trim, never shake. Even burn, smooth draw, lab-tested every batch.',
  })
}

export default function PreRollsPage() {
  return (
    // overflow-x-clip, never overflow-hidden: hidden makes this a scroll
    // container and every ScrollTrigger inside freezes at a fixed progress
    <main className="pr-page relative overflow-x-clip">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'Pre-Rolls', path: '/products/pre-rolls' },
            ])
          ),
        }}
      />

      <PrHero />
      <PrDifferent />
      <PrProcess />
      <PrCrossover />
      <PrShop />
      <div aria-hidden className="h-[8vh] min-h-[60px]" />
    </main>
  )
}
