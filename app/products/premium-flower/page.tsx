import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import FlowerHero from '@/components/products/flower/flower-hero'
import FlowerJourney from '@/components/products/flower/flower-journey'
import WhyPacks from '@/components/products/flower/why-packs'
import StrainMarquee from '@/components/products/flower/strain-marquee'
import AnnivReveal from '@/components/products/flower/anniv-reveal'
import Anniversary from '@/components/products/flower/anniversary'
import FlowerShop from '@/components/products/flower/flower-shop'
import GrowMarquee from '@/components/products/flower/grow-marquee'

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
      {/* brand surface: dark body + full-bleed footer, no light gutter seam
          (same treatment as /rewards) */}
      <style>{`
        body { background: #000; }
        footer { padding: 0; }
        footer > div { border-radius: 0; background: #000; }
      `}</style>
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
      <AnnivReveal />
      <Anniversary />
      <FlowerShop />
      <GrowMarquee />
    </main>
  )
}
