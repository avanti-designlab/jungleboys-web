import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/reveal'
import { QUICK_CARDS } from '@/lib/home-content'

export default function QuickCards() {
  return (
    <section className="mx-auto w-full max-w-[1560px] px-3 py-10 md:px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_CARDS.map((c, i) => {
          const card = (
            <div className="group relative aspect-[2/3] overflow-hidden rounded-[var(--radius-lg)]">
              <Image
                src={c.image}
                alt={c.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex justify-center p-6 text-white">
                <span className="font-display text-5xl uppercase md:text-6xl">
                  {c.title}
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
