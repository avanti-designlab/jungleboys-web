'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { QUICK_CARDS } from '@/lib/home-content'

// Cards fall in from above as the row enters the viewport (staggered), then
// each card's label/arrow drops in a beat behind. Label left, arrow right.

gsap.registerPlugin(ScrollTrigger)

export default function QuickCards() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = grid.querySelectorAll('[data-card]')
      const bars = grid.querySelectorAll('[data-card-bar]')
      gsap.set(cards, { y: -80, autoAlpha: 0 })
      gsap.set(bars, { y: -24, autoAlpha: 0 })
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
          })
          gsap.to(bars, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 0.25,
          })
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="w-full px-2 py-10 md:px-3">
      <div ref={gridRef} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK_CARDS.map((c) => {
          const card = (
            <div
              data-card
              className="group relative aspect-[2/3] overflow-hidden rounded-[var(--radius-lg)] will-change-transform"
            >
              <Image
                src={c.image}
                alt={c.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div
                data-card-bar
                className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white"
              >
                <span className="font-display text-4xl uppercase md:text-5xl xl:text-6xl">
                  {c.title}
                </span>
                <span
                  aria-hidden
                  className="text-3xl text-[var(--color-accent)] transition-transform duration-200 group-hover:translate-x-1 md:text-4xl"
                >
                  →
                </span>
              </div>
            </div>
          )
          return 'external' in c && c.external ? (
            <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer">
              {card}
            </a>
          ) : (
            <Link key={c.title} href={c.href}>
              {card}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
