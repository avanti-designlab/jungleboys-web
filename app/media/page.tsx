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

      <h1 className="sr-only">Media — Jungle Boys Films</h1>

      {/* full-width rounded character banner — sits near the top; the character
          is pushed down so it clears the sticky header. Dark in both themes. */}
      <section className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="relative flex items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0d0d0d] px-6 pb-10 pt-28 md:min-h-[520px] md:rounded-[2.5rem] md:pt-32"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[58%] h-[130%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(254,207,14,0.25), transparent 60%)' }}
          />
          <img
            src="/media/media-character.png"
            alt="Jungle Boys Media"
            className="rw-breathe relative w-[min(72vw,440px)]"
          />
        </div>
      </section>

      {/* headline row: big header left, subtext right */}
      <section className="px-4 pt-10 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-4 md:grid-cols-[1.15fr_1fr] md:gap-10">
          <h2 className="font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
            The Culture Runs Deep
          </h2>
          <p
            className="text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
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
        </div>
      </section>

      <MediaHub videos={videos} />
    </main>
  )
}
