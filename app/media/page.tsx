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

      {/* full-width rounded character banner — cinematic Higgsfield stage plate
          (spotlight, embers, film reels, jungle) behind the character, which
          stands in the light cone. Sits near the top; character pushed down to
          clear the sticky header. Dark in both themes. */}
      <section className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="relative flex items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 pb-8 pt-24 md:min-h-[460px] md:rounded-[2.5rem] md:pt-24"
        >
          <img
            src="/media/media-banner-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* gentle darken + edge vignette for character separation */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 85% 95% at 50% 55%, transparent 45%, rgba(0,0,0,0.5) 100%)' }}
          />
          <img
            src="/media/media-character.png"
            alt="Jungle Boys Media"
            className="rw-breathe relative w-[min(82vw,520px)] drop-shadow-[0_28px_70px_rgba(0,0,0,0.7)]"
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
