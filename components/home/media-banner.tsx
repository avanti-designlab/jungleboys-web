import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/reveal'
import { MEDIA_BANNER } from '@/lib/home-content'

export default function MediaBanner() {
  const m = MEDIA_BANNER
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-10">
      <Reveal>
        <Link
          href={m.href}
          className="group relative block h-[420px] overflow-hidden rounded-[var(--radius-lg)]"
        >
          <Image
            src={m.image}
            alt={m.alt}
            fill
            sizes="(max-width: 1500px) 100vw, 1500px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-8 md:p-12 text-white">
            <p
              className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {m.kicker}
            </p>
            <h2
              className="text-5xl md:text-7xl uppercase leading-[0.9]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {m.title}
            </h2>
            <p className="max-w-xl text-sm md:text-base text-white/80">{m.copy}</p>
            <span
              className="mt-3 rounded-[var(--radius-sm)] border border-white/70 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-on-accent)] group-hover:border-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {m.cta}
            </span>
          </div>
        </Link>
      </Reveal>
    </section>
  )
}
