import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/reveal'
import { QUICK_CARDS } from '@/lib/home-content'

export default function QuickCards() {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_CARDS.map((c, i) => {
          const card = (
            <div className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)]">
              <Image
                src={c.image}
                alt={c.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <span
                  className="text-3xl uppercase"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {c.title}
                </span>
                <span
                  aria-hidden
                  className="text-[var(--color-accent)] text-2xl transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </div>
          )
          return (
            <Reveal key={c.title} delay={i * 0.08}>
              {'external' in c && c.external ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
              ) : (
                <Link href={c.href}>{card}</Link>
              )}
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
