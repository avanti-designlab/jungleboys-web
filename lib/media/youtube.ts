// YouTube uploads feed for the Media hub. The channel's public Atom feed lists
// the ~15 most recent uploads with no API key required, so new videos appear
// automatically. Parsed server-side and cached via ISR (see getMediaVideos).
// A full archive / view counts would need the YouTube Data API key (deferred).

export const JB_CHANNEL_ID = 'UC3FkXgy37Xc5tRBl4ltHuDA'
export const JB_CHANNEL_URL = 'https://www.youtube.com/@JungleBoysfilms'
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${JB_CHANNEL_ID}`

export type Video = {
  id: string // YouTube video id
  source: 'youtube' | 'storyblok'
  title: string
  description: string
  thumbnail: string
  publishedAt: string // ISO
  watchUrl: string
  embedUrl: string // privacy-enhanced nocookie embed
  vertical?: boolean // Short / 9:16
  featured?: boolean
}

// YouTube generates an "original aspect ratio" thumbnail (oardefault.jpg) only
// for non-16:9 videos — i.e. vertical Shorts. Its presence flags orientation
// and doubles as the 9:16 thumbnail.
export function oarThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/oardefault.jpg`
}
async function isVertical(id: string): Promise<boolean> {
  try {
    const res = await fetch(oarThumb(id), { method: 'HEAD', next: { revalidate: 86400 } })
    return res.ok
  } catch {
    return false
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))
  return m ? decodeEntities(m[1].trim()) : ''
}

export function youtubeThumb(id: string, quality: 'hq' | 'maxres' = 'hq') {
  // maxresdefault isn't guaranteed on every video; hqdefault always exists.
  return `https://i.ytimg.com/vi/${id}/${quality === 'maxres' ? 'maxresdefault' : 'hqdefault'}.jpg`
}

export function toEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`
}

// Fetch + parse the uploads feed. Returns [] on any failure so the page still
// renders (Storyblok videos + a graceful empty state).
export async function fetchYouTubeUploads(): Promise<Video[]> {
  try {
    const res = await fetch(FEED_URL, {
      // ISR: refresh hourly so new uploads surface without a rebuild
      next: { revalidate: 3600, tags: ['media'] },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)
    const parsed = entries
      .map((block) => {
        const id = tag(block, 'yt:videoId')
        return {
          id,
          source: 'youtube' as const,
          title: tag(block, 'media:title') || tag(block, 'title'),
          description: tag(block, 'media:description'),
          thumbnail: youtubeThumb(id),
          publishedAt: tag(block, 'published'),
          watchUrl: `https://www.youtube.com/watch?v=${id}`,
          embedUrl: toEmbed(id),
        }
      })
      .filter((v) => v.id)
    // tag orientation + use the 9:16 thumbnail for verticals
    const verticals = await Promise.all(parsed.map((v) => isVertical(v.id)))
    return parsed.map((v, i) =>
      verticals[i] ? { ...v, vertical: true, thumbnail: oarThumb(v.id) } : v
    )
  } catch {
    return []
  }
}
