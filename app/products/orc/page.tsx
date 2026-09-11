import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import OrcRevealRoot from '@/components/products/orc/orc-reveal-root'
import OrcHero from '@/components/products/orc/orc-hero'
import OrcHazard from '@/components/products/orc/orc-hazard'
import OrcManifesto from '@/components/products/orc/orc-manifesto'
import OrcHunt from '@/components/products/orc/orc-hunt'
import OrcPipeline from '@/components/products/orc/orc-pipeline'
import OrcFreshFrozen from '@/components/products/orc/orc-fresh-frozen'
import OrcLineup from '@/components/products/orc/orc-lineup'
import OrcWhy from '@/components/products/orc/orc-why'
import OrcBuilt from '@/components/products/orc/orc-built'
import OrcShop from '@/components/products/orc/orc-shop'
import MoreLines from '@/components/products/more-lines'

// Oil Refinery Co. — the extracts flagship (2026-09-10), reimagined from the
// Figma brief rather than transcribed: refinery-at-night surface (black crude
// + hazard yellow + molten gold), hazard-tape marquee dividers, the pipeline
// process rail, and the lineup cut to ORC's REAL four forms — Live Resin,
// Batter, Budder, Sugar Trim. NO Live Rosin anywhere (Avanti: it is not part
// of ORC; rosin is its own line). Shop strip is live Dutchie inventory.
// Static folder overrides the [line] stub; leaving PLACEHOLDER_LINES made
// this page indexable + sitemap/ItemList-listed automatically.

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products/orc', {
    title: 'Oil Refinery Co. — Jungle Boys Extracts',
    description:
      'From the best flower comes the best oil. Oil Refinery Co. turns Jungle Boys genetics into flavor-first extracts — Live Resin, Batter, Budder and Sugar Trim. Est 2014.',
  })
}

export default function OrcPage() {
  return (
    <main className="orc-page relative overflow-x-clip bg-[var(--orc-ink)] text-white">
      {/* brand surface: black to the page edges, footer flush (the flower
          page pattern) */}
      <style>{`body{background:#0b0a07} footer{padding:0} footer>div{border-radius:0;background:#0b0a07}`}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: 'Oil Refinery Co.', path: '/products/orc' },
            ])
          ),
        }}
      />
      <OrcRevealRoot />
      <OrcHero />
      <OrcHazard />
      <OrcManifesto />
      <OrcHunt />
      <OrcPipeline />
      <OrcHazard text="FROM THE BEST FLOWER COMES THE BEST OIL" />
      <OrcFreshFrozen />
      <OrcLineup />
      <OrcWhy />
      <OrcBuilt />
      <OrcHazard />
      <OrcShop />
      <div className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1240px]">
          <MoreLines current="orc" />
        </div>
      </div>
    </main>
  )
}
