import type { Metadata } from 'next'
import HeroDeck from '@/components/home/hero-deck'
import QuickCards from '@/components/home/quick-cards'
import ProductMarquee from '@/components/home/product-marquee'
import MediaBanner from '@/components/home/media-banner'
import { organizationSchema, websiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Jungle Boys | Premium Cannabis — Los Angeles',
  description:
    'Jungle Boys — premium cannabis cultivated in Los Angeles since 2006. Shop flower, pre-rolls, vapes and more at our California dispensaries. Playing With Fire®.',
}

export default function Home() {
  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
      <HeroDeck />
      <QuickCards />
      <ProductMarquee />
      <MediaBanner />
    </main>
  )
}
