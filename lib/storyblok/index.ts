// Storyblok content client — SERVER ONLY (token is not NEXT_PUBLIC).
// Component mapping for @storyblok/react is added as templates are built (Phase 1).

const CDN_API = 'https://api.storyblok.com/v2/cdn'

type StoryVersion = 'draft' | 'published'

// Fetch a Storyblok story. Storyblok is OPTIONAL by design: with no token (space
// not connected yet) or on any error, returns null so callers fall back to the
// code defaults — the site never depends on the CMS to render.
export async function getStory(slug: string, version: StoryVersion = 'draft') {
  const token = process.env.STORYBLOK_TOKEN
  if (!token) return null

  try {
    const res = await fetch(
      `${CDN_API}/stories/${slug}?version=${version}&token=${token}`,
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

// Storyblok asset field → URL string (falls back to a code default).
export function assetUrl(asset: unknown, fallback = ''): string {
  if (asset && typeof asset === 'object' && 'filename' in asset) {
    const f = (asset as { filename?: unknown }).filename
    if (typeof f === 'string' && f) return f
  }
  return fallback
}
