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

      {/* full-width rounded character banner — a lit "stage": spotlight cone,
          warm floor glow, drifting embers and a vignette fill the frame so the
          character reads cinematic rather than lonely. Sits near the top; the
          character is pushed down to clear the sticky header. Dark both themes.
          (Swap the layered lighting for a Higgsfield 3D plate later by dropping
          it in as an absolute inset-0 <img> behind the character.) */}
      <section className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="relative flex items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 pb-8 pt-24 md:min-h-[420px] md:rounded-[2.5rem] md:pt-24"
        >
          {/* spotlight cone from the top */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/3 left-1/2 h-[150%] w-[70%] -translate-x-1/2"
            style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 158deg, rgba(254,207,14,0.16) 174deg, rgba(255,238,190,0.22) 180deg, rgba(254,207,14,0.16) 186deg, transparent 202deg)' }}
          />
          {/* warm floor glow behind the character */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[95%] w-[92%] -translate-x-1/2 rounded-[100%] opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(254,207,14,0.30), rgba(254,207,14,0.06) 55%, transparent 72%)' }}
          />
          {/* drifting embers — playing-with-fire flecks */}
          {[
            { l: '14%', b: '22%', s: 6, d: '0s' },
            { l: '26%', b: '46%', s: 4, d: '1.1s' },
            { l: '72%', b: '30%', s: 7, d: '0.5s' },
            { l: '84%', b: '52%', s: 4, d: '1.7s' },
            { l: '62%', b: '64%', s: 5, d: '2.3s' },
            { l: '38%', b: '70%', s: 3, d: '0.9s' },
          ].map((e, i) => (
            <span
              key={i}
              aria-hidden
              className="rw-float pointer-events-none absolute rounded-full"
              style={{
                left: e.l,
                bottom: e.b,
                width: e.s,
                height: e.s,
                animationDelay: e.d,
                background: 'rgba(254,207,14,0.9)',
                boxShadow: '0 0 10px 2px rgba(254,207,14,0.7)',
              }}
            />
          ))}
          {/* vignette so the edges fall to black */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 90% at 50% 62%, transparent 42%, rgba(0,0,0,0.55) 100%)' }}
          />
          <img
            src="/media/media-character.png"
            alt="Jungle Boys Media"
            className="rw-breathe relative w-[min(86vw,560px)] drop-shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
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
