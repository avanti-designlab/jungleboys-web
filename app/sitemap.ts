import type { MetadataRoute } from 'next'
import { PRODUCT_LINES, isPlaceholderLine } from '@/lib/products'
import { getPublishedBlogPosts } from '@/lib/blog'
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const statics = STATIC_ROUTES.map(([path, priority, changeFrequency]) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  // Rosin and ORC render the generic placeholder and are noindex — a sitemap
  // that advertises a soft-404 is the same mistake as one that advertises a 404.
  const lines = PRODUCT_LINES.filter((l) => !isPlaceholderLine(l.slug)).map((line) => ({
    url: `${SITE_ORIGIN}/products/${line.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual posts — real CMS posts ONLY, never the sample fallback. A
  // published post appears here the moment it is live; a Storyblok outage
  // yields an empty list rather than three fabricated articles.
  const posts = (await getPublishedBlogPosts()).map((post) => ({
    url: `${SITE_ORIGIN}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...statics, ...lines, ...posts]
}
