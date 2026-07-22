import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import FlowerHero from '@/components/products/flower/flower-hero'
import FlowerJourney from '@/components/products/flower/flower-journey'
import WhyPacks from '@/components/products/flower/why-packs'
import StrainMarquee from '@/components/products/flower/strain-marquee'
import Anniversary from '@/components/products/flower/anniversary'
import FlowerShop from '@/components/products/flower/flower-shop'

// Premium Flower / 3.5G Gold Mylars — first Phase 2 flagship line page.
// A scroll journey: letter-reveal intro → plant overlap → canvas grow sequence
// with nug blow-up → editorial claims → 20th-anniversary gold → shop panel.
// This static folder overrides the [line] placeholder for this slug.
//
// JSON-LD is breadcrumb-only on purpose: product prices/THC are placeholder
// until Dutchie connects (Phase 3) — we never feed fake offers to crawlers.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/premium-flower', {
    title: '3.5G Gold Mylars — Premium Cannabis Flower',
    description:
      'Top-shelf, hand-trimmed indoor flower sealed fresh in the 20th-anniversary gold mylar. 100% in-house grown, exotic genetics, lab-tested. Playing with fire since 2006.',
  })
}

export default function PremiumFlowerPage() {
  return (
    <main data-nav-theme="dark" className="fl-page bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: '3.5G Gold Mylars', path: '/products/premium-flower' },
            ])
          ),
        }}
      />
      <FlowerHero />
      <FlowerJourney />
      <WhyPacks />
      <StrainMarquee />
      <Anniversary />
      <FlowerShop />
    </main>
  )
}
