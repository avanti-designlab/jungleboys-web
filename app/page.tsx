import type { Metadata } from 'next'
import HeroDeck from '@/components/home/hero-deck'
import QuickCards from '@/components/home/quick-cards'
import { getHomeContent } from '@/lib/home-content'
import { jsonLdHtml, organizationSchema, websiteSchema } from '@/lib/schema'
import { pageMetadata } from '@/lib/storyblok/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('home', {
    title: 'Jungle Boys | Premium Cannabis — Los Angeles',
    description:
      'Jungle Boys — premium cannabis cultivated in Los Angeles since 2006. Shop flower, pre-rolls, vapes and more at our California dispensaries. Playing With Fire®.',
  })
}

export default async function Home() {
  const { heroSlides, quickCards } = await getHomeContent()
  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml([organizationSchema(), websiteSchema()]),
        }}
      />
      {/* The homepage's one h1. The hero slides are rotating promos and now use
          h2 — same sr-only pattern already used on /locations. */}
      <h1 className="sr-only">Jungle Boys — Premium Cannabis Flower, Pre-Rolls &amp; Hash Holes</h1>

      <HeroDeck slides={heroSlides} />
      <QuickCards cards={quickCards} />
    </main>
  )
}
