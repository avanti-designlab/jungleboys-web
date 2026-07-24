import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import PopsStripes from '@/components/products/pops/pops-stripes'
import PopsHero from '@/components/products/pops/pops-hero'
import PopsFacts from '@/components/products/pops/pops-facts'
import PopsMarquee from '@/components/products/pops/pops-marquee'
import PopsLineup from '@/components/products/pops/pops-lineup'
import PopsShop from '@/components/products/pops/pops-shop'
import PopsJar3D from '@/components/products/pops/pops-jar3d'
import PopsReveal from '@/components/products/pops/pops-reveal'
import { getProducts } from '@/lib/dutchie'
import type { LineupItem } from '@/components/products/pops/pops-lineup'

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

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function PopsPage() {
  // The lineup runs off the frozen lib/dutchie interface, so Phase 3 populates
  // it for real. IN-STOCK ONLY — filtered on variant quantityAvailable rather
  // than a new ProductFilter field, because that interface is frozen.
  const products = await getProducts({ category: 'pops', subcategory: '5g-pops' })
  const items: LineupItem[] = products
    .filter((p) => p.variants.some((v) => (v.quantityAvailable ?? 0) > 0))
    .map((p) => {
      const v = p.variants.find((x) => (x.quantityAvailable ?? 0) > 0) ?? p.variants[0]
      return {
        id: p.id,
        name: p.name,
        image: p.images[0]?.url ?? '',
        strainType: p.strainType,
        thc: p.labResult?.potency?.thc?.value,
        description: p.description,
        effects: p.effects,
        price: dollars(v.specialPrice ?? v.price),
        option: v.option,
      }
    })

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
      <PopsReveal />
      <div className="relative z-10">
        <PopsHero />
        {/* TEST: live 3D jar (auto-spin + drag) — placement TBD */}
        <section className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 py-16">
          <PopsJar3D className="h-[52vh] max-h-[560px] w-full max-w-[420px]" />
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[var(--pops-ink)]/60" style={{ fontFamily: 'var(--font-brand)' }}>
            Drag to spin
          </p>
        </section>
        <PopsFacts />
        <PopsLineup items={items} />
        <PopsMarquee reverse />
        <PopsShop />
        <div aria-hidden className="h-[10vh] min-h-[70px]" />
      </div>
    </main>
  )
}
