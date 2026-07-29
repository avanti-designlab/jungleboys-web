import type { MetadataRoute } from 'next'
import { PRODUCT_LINES } from '@/lib/products'
import { SITE_ORIGIN } from '@/lib/storyblok/seo'

// Dynamic sitemap. Built from the same PRODUCT_LINES array the routes are
// generated from, so a new line cannot appear on the site without appearing
// here — the failure mode a hand-maintained list always eventually hits.
//
// Only routes that EXIST today are listed. The Phase 3 surfaces (location
// menus, the auth suite, /drops, /710-deals) are deliberately absent until they
// resolve; a sitemap that advertises 404s is worse than a short sitemap.
//
// Auth and utility routes stay out entirely — they are noindex by mandate.

const STATIC_ROUTES: Array<[path: string, priority: number, freq: MetadataRoute.Sitemap[number]['changeFrequency']]> = [
  ['', 1, 'weekly'],
  ['/products', 0.9, 'weekly'],
  ['/locations', 0.8, 'monthly'],
  ['/find-jb-products', 0.8, 'monthly'],
  ['/rewards', 0.8, 'monthly'],
  ['/media', 0.7, 'weekly'],
  ['/phenos', 0.6, 'monthly'],
  ['/wholesale', 0.6, 'monthly'],
  ['/contact', 0.6, 'monthly'],
  ['/blog', 0.6, 'weekly'],
  ['/faq', 0.5, 'monthly'],
  ['/terms', 0.3, 'yearly'],
  ['/privacy', 0.3, 'yearly'],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const statics = STATIC_ROUTES.map(([path, priority, changeFrequency]) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const lines = PRODUCT_LINES.map((line) => ({
    url: `${SITE_ORIGIN}/products/${line.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...statics, ...lines]
}
