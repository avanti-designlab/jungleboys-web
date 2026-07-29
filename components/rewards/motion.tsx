'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Scroll-scrubbed motion system matching the live Webflow pwf-reward page:
// every reveal is tied to scroll progress (scrub, ease none), not one-shot.
// Two pieces:
//   <SplitHeading> — headline split into letters/words that rise in staggered.
//   <Scrub>        — wrapper that animates its [data-reveal] descendants in
//                    DOM order: up | fade | left | right | grow | scale.
// All frozen for prefers-reduced-motion (content renders server-side, visible).

gsap.registerPlugin(ScrollTrigger)

type Line = { text: string; accent?: boolean; block?: boolean; nowrap?: boolean }

export function SplitHeading({
  lines,
  as = 'h2',
  mode = 'letters',
  className = '',
  pin = false,
  start = 'top 80%',
  load = false,
  accentClass = 'text-[var(--color-accent-ink)]',
}: {
  lines: Line[]
  as?: 'h1' | 'h2' | 'h3'
  mode?: 'letters' | 'words'
  className?: string
  pin?: boolean
  start?: string
  /** animate once on mount (hero) instead of scrubbing with scroll */
  load?: boolean
  /** color class for accent lines — pass text-[var(--color-accent)] on always-dark surfaces */
  accentClass?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const spans = el.querySelectorAll('[data-split]')
      gsap.set(spans, { opacity: 0, yPercent: 90 })
      if (load) {
        gsap.to(spans, {
          opacity: 1,
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.15,
        })
      } else {
        gsap.to(spans, {
          opacity: 1,
          yPercent: 0,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start,
            end: pin ? '+=35%' : 'bottom 100%',
            scrub: true,
            pin,
            pinSpacing: false,
          },
        })
      }
    })
    return () => mm.revert()
  }, [pin, start, load])

  const label = lines.map((l) => l.text).join(' ')
  const Tag = as
  return (
    <Tag
      ref={ref}
      aria-label={label}
      className={className}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {lines.map((l, li) => (
        <span
          key={li}
          aria-hidden
          className={`${l.block ? 'block' : ''} ${l.nowrap ? 'md:whitespace-nowrap' : ''} ${l.accent ? accentClass : ''}`}
        >
          {/* Split to WORDS first, always. In letters mode each character is its
              own inline-block, and the browser is free to break a line between
              any two inline-blocks — which is why headings were breaking
              mid-word ("TO K/EEP", "LIMITE/D", "JUN/GLE", "TOD/AY"). Wrapping
              each word in a nowrap inline-block keeps the per-letter stagger
              (data-split is still on every character) while making a space the
              only legal break point. */}
          {l.text.split(/(\s+)/).map((part, i) =>
            /^\s+$/.test(part) || part === ' ' ? (
              ' '
            ) : mode === 'letters' ? (
              <span key={i} className="inline-block whitespace-nowrap">
                {[...part].map((ch, j) => (
                  <span key={j} data-split className="inline-block whitespace-pre will-change-transform">
                    {ch}
                  </span>
                ))}
              </span>
            ) : (
              <span key={i} data-split className="inline-block whitespace-pre will-change-transform">
                {part}
              </span>
            )
          )}{' '}
        </span>
      ))}
    </Tag>
  )
}

const INITIAL: Record<string, gsap.TweenVars> = {
  up: { opacity: 0, y: 80 },
  rise: { opacity: 0, yPercent: 100 },
  fade: { opacity: 0 },
  left: { opacity: 0, xPercent: -12 },
  right: { opacity: 0, xPercent: 12 },
  grow: { scale: 0.6, transformOrigin: '50% 100%' },
  scale: { opacity: 0, scale: 0.75, transformOrigin: '50% 100%' },
}

export function Scrub({
  children,
  className,
  start = 'top 80%',
  end = 'bottom 100%',
  enter = false,
  perItem = false,
}: {
  children: React.ReactNode
  className?: string
  start?: string
  end?: string
  /** play once on enter (slow, smooth) instead of scrubbing with scroll */
  enter?: boolean
  /** one ScrollTrigger per child instead of one staggered timeline for the lot */
  perItem?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const items = [...el.querySelectorAll<HTMLElement>('[data-reveal]')]
      if (!items.length) return
      // A single staggered timeline reveals late items on a TIMER, so on a long
      // list (the FAQ) you scroll past questions 4-8 before their turn comes up.
      // perItem gives every child its own trigger, so each one appears as it
      // enters the viewport regardless of how fast you scroll.
      if (enter && perItem) {
        // One IntersectionObserver per list, revealing each row as it actually
        // becomes visible.
        //
        // Two things ruled out the obvious approaches. A single staggered
        // timeline reveals later rows on a TIMER, so on a long list you scroll
        // past rows 4-8 before their turn arrives — that was the reported bug.
        // A ScrollTrigger per row then failed too: "rise" starts at
        // yPercent:100, displacing each row by its own height, and the trigger
        // is measured where the transform puts it, so every start point moved
        // down with it. An observer watches the box the visitor can actually
        // see, so neither problem applies.
        const small = { opacity: 0, y: 40 }
        items.forEach((item) => gsap.set(item, small))
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return
              io.unobserve(e.target)
              gsap.to(e.target, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
            })
          },
          { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
        )
        items.forEach((item) => io.observe(item))
        return () => io.disconnect()
      }

      const tl = gsap.timeline({
        scrollTrigger: enter
          ? { trigger: el, start, once: true }
          : { trigger: el, start, end, scrub: true },
      })
      items.forEach((item, i) => {
        const kind = item.dataset.reveal || 'up'
        const vars = INITIAL[kind] || INITIAL.up
        gsap.set(item, vars)
        if (enter) {
          tl.to(
            item,
            { opacity: 1, y: 0, yPercent: 0, xPercent: 0, scale: 1, duration: 1.1, ease: 'power3.out' },
            i * 0.18
          )
        } else {
          tl.to(item, {
            opacity: 1,
            y: 0,
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            duration: kind === 'grow' || kind === 'scale' ? 1 : 0.45,
            ease: 'none',
          })
        }
      })
    })
    return () => mm.revert()
  }, [start, end, enter, perItem])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
