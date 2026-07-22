'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Post hero: word-by-word headline reveal on load + a subtle parallax on the
// hero image as it scrolls. The <h1> text is rendered server-side (this
// component is SSR'd) so it's fully present for SEO; JS only enhances.

export function AnimatedHeading({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el.querySelectorAll('[data-word] > span'),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.06, delay: 0.15 }
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <h1
      ref={ref}
      className={`font-display mt-4 text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl ${className}`}
    >
      {text.split(' ').map((word, i) => (
        <span key={i} data-word className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className="inline-block">{word}</span>
          {i < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  )
}

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={wrapRef} className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.5rem]">
      <div ref={imgRef} className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <Image src={src} alt={alt} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
      </div>
    </div>
  )
}
