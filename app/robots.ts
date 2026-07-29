import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/storyblok/seo'

// Crawlers must always reach indexable content — the age gate is a client
// overlay and never blocks them (07 §7). Nothing here may disallow a content
// route; the disallow list is auth/utility only, matching the URL mandate's
// "auth/utility routes stay noindex".

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth',
          '/login',
          '/signup',
          '/callback',
          '/forgot-password',
          '/reset-password',
          '/delete-account',
          '/profile-reward',
        ],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
