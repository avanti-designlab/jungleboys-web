// Storyblok content client — SERVER ONLY (token is not NEXT_PUBLIC).
// Component mapping for @storyblok/react is added as templates are built (Phase 1).

const CDN_API = 'https://api.storyblok.com/v2/cdn'

type StoryVersion = 'draft' | 'published'

export async function getStory(slug: string, version: StoryVersion = 'draft') {
  const token = process.env.STORYBLOK_TOKEN
  if (!token) throw new Error('STORYBLOK_TOKEN is not set')

  const res = await fetch(
    `${CDN_API}/stories/${slug}?version=${version}&token=${token}`,
    // ISR: revalidated on-demand via /api/revalidate (Storyblok publish webhook, Step 7)
    { next: { tags: [`story:${slug}`] } }
  )
  if (!res.ok) {
    throw new Error(`Storyblok ${res.status} for story "${slug}"`)
  }
  const json = await res.json()
  return json.story
}
