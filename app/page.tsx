import type { Metadata } from 'next'
import HeroDeck from '@/components/home/hero-deck'
import QuickCards from '@/components/home/quick-cards'
import { getHomeContent } from '@/lib/home-content'
import { organizationSchema, websiteSchema } from '@/lib/schema'
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
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
      <HeroDeck slides={heroSlides} />
      <QuickCards cards={quickCards} />
    </main>
  )
}
