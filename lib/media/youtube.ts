// YouTube uploads for the Media hub, no API key required. YouTube now 404s the
// Atom feed from datacenter IPs (Vercel), so the primary source is the channel's
// public /videos page — its embedded ytInitialData lists recent uploads. The RSS
// feed is kept as a fast first-try in case it works. Parsed server-side, ISR-cached.
// A full archive / view counts would need the YouTube Data API key (deferred).

export const JB_CHANNEL_ID = 'UC3FkXgy37Xc5tRBl4ltHuDA'
export const JB_CHANNEL_URL = 'https://www.youtube.com/@JungleBoysfilms'
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${JB_CHANNEL_ID}`
const VIDEOS_URL = `${JB_CHANNEL_URL}/videos`
// A desktop browser UA — YouTube serves the full ytInitialData payload for it.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

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

function base(id: string, i: number): Omit<Video, 'title' | 'description'> {
  return {
    id,
    source: 'youtube',
    thumbnail: youtubeThumb(id),
    // channel order is newest-first; synthesize a descending timestamp so the
    // merge sort keeps that order (exact upload dates need the Data API).
    publishedAt: new Date(Date.now() - i * 60_000).toISOString(),
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: toEmbed(id),
  }
}

// ── Source 1: the RSS Atom feed (clean dates when it isn't blocked) ──────────
async function fromFeed(): Promise<Video[]> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { 'user-agent': UA },
      next: { revalidate: 3600, tags: ['media'] },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)
    return entries
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
  } catch {
    return []
  }
}

// Pull the ytInitialData object out of a channel page (brace-balanced).
function extractInitialData(html: string): unknown | null {
  const marker = 'ytInitialData = '
  const start = html.indexOf(marker)
  if (start === -1) return null
  let i = start + marker.length
  if (html[i] !== '{') return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let j = i; j < html.length; j++) {
    const c = html[j]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') inStr = false
    } else if (c === '"') inStr = true
    else if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}

// ── Source 2: scrape the channel /videos page (new lockupViewModel format) ───
async function fromChannelPage(): Promise<Video[]> {
  try {
    const res = await fetch(VIDEOS_URL, {
      headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' },
      next: { revalidate: 3600, tags: ['media'] },
    })
    if (!res.ok) return []
    const html = await res.text()
    const data = extractInitialData(html)
    if (!data) return []
    const found: { id: string; title: string }[] = []
    const seen = new Set<string>()
    const walk = (o: unknown) => {
      if (Array.isArray(o)) {
        for (const v of o) walk(v)
      } else if (o && typeof o === 'object') {
        const rec = o as Record<string, unknown>
        if (rec.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && typeof rec.contentId === 'string') {
          const id = rec.contentId
          const meta = (rec.metadata as Record<string, unknown>)?.lockupMetadataViewModel as
            | Record<string, unknown>
            | undefined
          const title = ((meta?.title as Record<string, unknown>)?.content as string) ?? ''
          if (!seen.has(id)) {
            seen.add(id)
            found.push({ id, title })
          }
        }
        for (const v of Object.values(rec)) walk(v)
      }
    }
    walk(data)
    return found.map((v, i) => ({ ...base(v.id, i), title: v.title, description: '' }))
  } catch {
    return []
  }
}

// Try the feed first (cleanest), fall back to the channel page. Returns [] on
// total failure so the page still renders (Storyblok videos + empty state).
export async function fetchYouTubeUploads(): Promise<Video[]> {
  let parsed = await fromFeed()
  if (parsed.length === 0) parsed = await fromChannelPage()
  if (parsed.length === 0) return []
  // tag orientation + use the 9:16 thumbnail for verticals
  const verticals = await Promise.all(parsed.map((v) => isVertical(v.id)))
  return parsed.map((v, i) => (verticals[i] ? { ...v, vertical: true, thumbnail: oarThumb(v.id) } : v))
}
