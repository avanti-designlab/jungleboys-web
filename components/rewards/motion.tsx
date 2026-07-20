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
          {(mode === 'letters' ? [...l.text] : l.text.split(/(\s+)/)).map((part, i) =>
            /^\s+$/.test(part) || part === ' ' ? (
              ' '
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
}: {
  children: React.ReactNode
  className?: string
  start?: string
  end?: string
  /** play once on enter (slow, smooth) instead of scrubbing with scroll */
  enter?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const items = [...el.querySelectorAll<HTMLElement>('[data-reveal]')]
      if (!items.length) return
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
  }, [start, end, enter])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
