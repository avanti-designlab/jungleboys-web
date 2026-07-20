import type { Metadata } from 'next'
import MediaHub from '@/components/media/media-hub'
import { getMediaVideos } from '@/lib/media'
import { JB_CHANNEL_URL } from '@/lib/media/youtube'
import { breadcrumbSchema, videoSchema } from '@/lib/schema'

// Media = video hub (Avanti, 2026-07-19). Documentaries + drops auto-pulled
// from youtube.com/@JungleBoysfilms (ISR, hourly) and merged with any curated
// Storyblok `media_video` entries. Preserved /media URL. Theme-aware.

export const metadata: Metadata = {
  title: 'Media — Jungle Boys Films & Documentaries',
  description:
    'Watch Jungle Boys documentaries, pheno-hunt series, and drops — two decades of the hunt, straight from the jungle. New episodes from @JungleBoysfilms.',
}

// Revalidate hourly at the route level too (belt + suspenders with the fetch).
export const revalidate = 3600

export default async function MediaPage() {
  const videos = await getMediaVideos()

  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      {videos.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              breadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: 'Media', path: '/media' },
              ]),
              ...videos.slice(0, 12).map((v) =>
                videoSchema({
                  title: v.title,
                  description: v.description,
                  thumbnailUrl: v.thumbnail,
                  uploadDate: v.publishedAt,
                  embedUrl: v.embedUrl,
                  contentUrl: v.watchUrl,
                })
              ),
            ]),
          }}
        />
      )}

      <section className="px-6 pt-28 text-center md:px-12 md:pt-36 lg:px-20">
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent-ink)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          The Culture Runs Deep
        </p>
        <h1 className="font-display mt-3 text-6xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-8xl">
          Media
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Documentaries, drops, and the hunt — straight from the jungle. New
          episodes land here automatically from{' '}
          <a
            href={JB_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent-ink)] underline underline-offset-2"
          >
            @JungleBoysfilms
          </a>
          .
        </p>
      </section>

      <MediaHub videos={videos} />
    </main>
  )
}
