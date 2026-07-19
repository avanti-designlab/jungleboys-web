import Image from 'next/image'
import { MARQUEE_TILES } from '@/lib/home-content'

// Infinite product-tile marquee — pure CSS transform loop (GPU-only), pauses on
// hover; the global reduced-motion rule freezes it entirely.

export default function ProductMarquee() {
  const row = [...MARQUEE_TILES, ...MARQUEE_TILES]
  return (
    <section aria-label="Product highlights" className="overflow-hidden py-8">
      <div className="marquee-track flex w-max gap-4">
        {row.map((t, i) => (
          <div
            key={i}
            aria-hidden={i >= MARQUEE_TILES.length}
            className="relative h-44 w-44 shrink-0 overflow-hidden rounded-[var(--radius-md)] md:h-56 md:w-56"
          >
            <Image
              src={t.image}
              alt={i < MARQUEE_TILES.length ? t.alt : ''}
              fill
              sizes="224px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
