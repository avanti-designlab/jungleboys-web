// Media hub data: YouTube auto-pull + optional manually-curated Storyblok
// videos, merged into one list. Storyblok is optional — if the `media` story
// isn't modeled yet the page still works from the YouTube feed alone.

import { getStory } from '@/lib/storyblok'
import {
  fetchYouTubeUploads,
  toEmbed,
  youtubeThumb,
  type Video,
} from './youtube'

// Pull a YouTube id out of any watch/share/embed URL (or a raw id).
function youtubeId(input: string): string | null {
  if (!input) return null
  const s = input.trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

// Expected Storyblok shape (model when ready): a `media` story whose body is a
// list of `media_video` blocks: { youtube_url|video_id, title?, description?,
// thumbnail? (asset), featured? (bool) }. Anything missing falls back to the
// YouTube-derived value. Returns [] if the story doesn't exist yet.
async function fetchStoryblokVideos(): Promise<Video[]> {
  try {
    const story = await getStory('media', 'published')
    const blocks: Record<string, unknown>[] = story?.content?.body ?? []
    return blocks
      .filter((b) => b.component === 'media_video')
      .map((b): Video | null => {
        const id = youtubeId(String(b.youtube_url ?? b.video_id ?? ''))
        if (!id) return null
        const asset = b.thumbnail as { filename?: string } | undefined
        return {
          id,
          source: 'storyblok',
          title: String(b.title ?? ''),
          description: String(b.description ?? ''),
          thumbnail: asset?.filename || youtubeThumb(id),
          publishedAt: String(b.published_at ?? story?.published_at ?? ''),
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
          embedUrl: toEmbed(id),
          featured: Boolean(b.featured),
        }
      })
      .filter((v): v is Video => v !== null)
  } catch {
    return []
  }
}

// One merged, de-duplicated, newest-first list. Storyblok entries win on
// conflicts (curated title/thumbnail) and can flag a `featured` hero.
export async function getMediaVideos(): Promise<Video[]> {
  const [yt, sb] = await Promise.all([fetchYouTubeUploads(), fetchStoryblokVideos()])
  const byId = new Map<string, Video>()
  for (const v of yt) byId.set(v.id, v)
  for (const v of sb) byId.set(v.id, { ...byId.get(v.id), ...v })
  return [...byId.values()].sort(
    (a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')
  )
}

export type { Video }
