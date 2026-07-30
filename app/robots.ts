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
          // NOT '/auth' — /verify 308s here (permanently, since /verify is
          // retired), and a redirect target Google cannot crawl consolidates
          // nothing. The page carries its own robots: noindex instead, so it is
          // crawlable but not indexable.
          // NOT '/login' either, for the same reason as /auth above and one
          // more: it is linked from the site nav on every page AND 307s to
          // /rewards. Disallowed + linked + redirected is the textbook
          // "Indexed, though blocked by robots.txt" recipe — Google sees the
          // links, is forbidden to fetch the URL, and so never learns about the
          // redirect. Crawlable-but-noindex is the correct treatment; when the
          // real auth shell lands it carries robots: noindex itself.
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
