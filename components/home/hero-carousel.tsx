'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HERO_SLIDES } from '@/lib/home-content'

// Promo hero — manual navigation only (no autoplay: conversion + a11y rule).

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const slide = HERO_SLIDES[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative mx-auto w-full max-w-[1500px] px-4 pt-4"
    >
      <div className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-[var(--radius-lg)]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1500px) 100vw, 1500px"
              className={`object-cover transition-transform duration-[3000ms] ease-out ${
                i === index ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 p-8 md:p-14 text-white">
              <p
                className="text-sm md:text-base font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s.kicker}
              </p>
              <h1
                className="text-6xl md:text-8xl xl:text-9xl uppercase leading-[0.9]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.title}
              </h1>
              <Link
                href={s.href}
                className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-[1.03]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s.cta}
              </Link>
            </div>
          </div>
        ))}

        {/* controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Show slide ${i + 1} of ${HERO_SLIDES.length}: ${s.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 cursor-pointer rounded-full transition-all duration-200 ${
                i === index ? 'w-8 bg-[var(--color-accent)]' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
