// Storyblok content client — SERVER ONLY (token is not NEXT_PUBLIC).
// Component mapping for @storyblok/react is added as templates are built (Phase 1).

// The space is EU-hosted. Verified live 2026-07-30 against all four regional
// endpoints: api.storyblok.com returns 200 with the real `home` story, api-us
// returns 401.
//
// This default used to be api-us, and the comment above it asserted the space
// was US-hosted. Both were wrong, and the failure was SILENT: getStory() returns
// null on any error so every caller fell through to its code defaults, which
// render perfectly. The homepage and /blog were serving fallbacks for a week
// with nothing to show for it. Region belongs in the default, not in an env var
// that has to be set identically in local, preview and production — miss one and
// that environment quietly goes back to fallbacks. STORYBLOK_API_BASE still
// overrides, for an actual migration.
const CDN_API = process.env.STORYBLOK_API_BASE || 'https://api.storyblok.com/v2/cdn'

type StoryVersion = 'draft' | 'published'

// Fetch a Storyblok story. Storyblok is OPTIONAL by design: with no token (space
// not connected yet) or on any error, returns null so callers fall back to the
// code defaults — the site never depends on the CMS to render.
// Reject traversal and empty segments before a slug reaches the API path.
// Not currently reachable — Next's [slug] is a single segment and %2F does not
// survive routing — but it is one catch-all route away from being reachable,
// and every caller of getStory() inherits whatever this allows.
function safeSlug(slug: string): string | null {
  const parts = slug.split('/')
  if (parts.some((p) => p === '' || p === '.' || p === '..')) return null
  return parts.map(encodeURIComponent).join('/')
}

export async function getStory(slug: string, version: StoryVersion = 'draft') {
  const token = process.env.STORYBLOK_TOKEN
  if (!token) return null
  const safe = safeSlug(slug)
  if (safe === null) return null

  try {
    const res = await fetch(
      // Each path SEGMENT is encoded separately: the slug arrives from the
      // [slug] route param, and Next decodes %3F back into it, so a raw
      // interpolation let `blog/x%3Fversion%3Ddraft%26` append a second
      // `version` param — first-wins — and serve DRAFT content on a public URL.
      //
      // Encoding alone does NOT stop `..` — dots are unreserved, so
      // encodeURIComponent('..') is '..' and fetch's URL parser still resolves
      // the dot segments, reaching /v2/cdn/datasources with our token attached.
      // An earlier version of this comment claimed the encoding handled that.
      // It did not. Hence the explicit reject in safeSlug() above.
      `${CDN_API}/stories/${safe}` +
        `?version=${encodeURIComponent(version)}&token=${token}`,
      // ISR: on-demand via /api/revalidate (Storyblok publish webhook) AND a 60s
      // time-based fallback so published edits appear within a minute even before
      // the webhook is configured.
      { next: { revalidate: 60, tags: [`story:${slug}`] } }
    )
    if (!res.ok) return null
    const json = await res.json()
    return json.story ?? null
  } catch {
    return null
  }
}

// Fetch a LIST of stories (e.g. all blog posts). Same fallback-safe contract:
// returns [] with no token or on error. `query` is a raw querystring, e.g.
// "content_type=blog_post&sort_by=content.published_date:desc".
export async function getStories(query: string, version: StoryVersion = 'published') {
  const token = process.env.STORYBLOK_TOKEN
  if (!token) return []
  try {
    const res = await fetch(`${CDN_API}/stories?${query}&version=${version}&token=${token}`, {
      next: { revalidate: 60, tags: ['stories'] },
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.stories) ? json.stories : []
  } catch {
    return []
  }
}

// Storyblok asset field → URL string (falls back to a code default).
export function assetUrl(asset: unknown, fallback = ''): string {
  if (asset && typeof asset === 'object' && 'filename' in asset) {
    const f = (asset as { filename?: unknown }).filename
    if (typeof f === 'string' && f) return f
  }
  return fallback
}
