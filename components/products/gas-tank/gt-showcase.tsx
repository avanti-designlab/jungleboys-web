'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE HAZARD FIELD. A wall of caution triangles scrolls past in three parallax
// layers (far/mid/near, each at its own speed and angle) while the devices and
// their pouches float across at a fourth speed — so you're moving THROUGH the
// scene rather than watching a flat panel. A heat bloom tracks the centre.
//
// The triangles are one masked SVG tiled per layer, so they recolour and cost
// nothing extra to load.

function TriLayer({ size, opacity, className }: { size: number; opacity: number; className: string }) {
  return (
    <div
      aria-hidden
      className={`gt-tri-field pointer-events-none absolute ${className}`}
      style={{ backgroundSize: `${size}px`, opacity }}
    />
  )
}

export default function GtShowcase() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)', noPref: '(prefers-reduced-motion: no-preference)' },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return
          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.55, invalidateOnRefresh: true },
          })
          // four depths, four speeds — the parallax core
          tl.fromTo('[data-tri="far"]', { yPercent: -6 }, { yPercent: 10, ease: 'none' }, 0)
            .fromTo('[data-tri="mid"]', { yPercent: -14 }, { yPercent: 22, ease: 'none' }, 0)
            .fromTo('[data-tri="near"]', { yPercent: -26 }, { yPercent: 38, ease: 'none' }, 0)
            .fromTo('[data-float="pouch-a"]', { yPercent: 30, rotate: -16 }, { yPercent: -34, rotate: -6, ease: 'none' }, 0)
            .fromTo('[data-float="pouch-b"]', { yPercent: 40, rotate: 14 }, { yPercent: -26, rotate: 4, ease: 'none' }, 0)
            .fromTo('[data-float="dev-a"]', { yPercent: 46, rotate: -12 }, { yPercent: -30, rotate: -2, ease: 'none' }, 0)
            .fromTo('[data-float="dev-b"]', { yPercent: 58, rotate: 10 }, { yPercent: -18, rotate: 2, ease: 'none' }, 0)
            .fromTo('[data-float="dev-c"]', { yPercent: 70, scale: 0.92 }, { yPercent: -8, scale: 1.06, ease: 'none' }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative z-10 h-[150vh] min-h-[900px] overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#f6b800 0%,#fbcd03 42%,#ff9a10 100%)' }}
    >
      {/* three depths of hazard triangles */}
      <div data-tri="far" className="absolute -inset-x-[10%] -inset-y-[25%] will-change-transform">
        <TriLayer size={86} opacity={0.3} className="inset-0 -rotate-[8deg]" />
      </div>
      <div data-tri="mid" className="absolute -inset-x-[12%] -inset-y-[28%] will-change-transform">
        <TriLayer size={140} opacity={0.45} className="inset-0 rotate-[6deg]" />
      </div>
      <div data-tri="near" className="absolute -inset-x-[15%] -inset-y-[32%] will-change-transform">
        <TriLayer size={232} opacity={0.6} className="inset-0 -rotate-[3deg]" />
      </div>

      {/* heat bloom behind the products */}
      <div aria-hidden className="gt-heat pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.34) 0%, rgba(255,196,40,0.18) 42%, rgba(255,154,16,0) 72%)' }} />

      {/* the float layer */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- packaging */}
        <img data-float="pouch-a" src="/products/gas-tank/pouch-resin.webp" alt=""
          aria-hidden className="absolute left-[3%] top-[14%] w-[30vw] max-w-[330px] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- packaging */}
        <img data-float="pouch-b" src="/products/gas-tank/pouch-flavors.webp" alt=""
          aria-hidden className="absolute right-[2%] top-[9%] w-[32vw] max-w-[360px] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.28)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- product */}
        <img data-float="dev-a" src="/products/gas-tank/device-resin.webp" alt="Gas Tank Live Resin"
          className="absolute left-[8%] top-[38%] w-[30vw] max-w-[300px] will-change-transform drop-shadow-[0_40px_60px_rgba(0,0,0,0.4)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- product */}
        <img data-float="dev-b" src="/products/gas-tank/device-flavors.webp" alt="Gas Tank Flavors"
          className="absolute right-[9%] top-[33%] w-[29vw] max-w-[290px] will-change-transform drop-shadow-[0_40px_60px_rgba(0,0,0,0.38)]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- product */}
        <img data-float="dev-c" src="/products/gas-tank/device-rosin.webp" alt="Gas Tank Live Rosin"
          className="absolute left-1/2 top-[52%] w-[34vw] max-w-[330px] -translate-x-1/2 will-change-transform drop-shadow-[0_50px_80px_rgba(0,0,0,0.45)]" />
        <span className="absolute left-1/2 top-[48%] z-10 flex h-[76px] w-[76px] -translate-x-1/2 translate-x-[7vw] rotate-[14deg] items-center justify-center rounded-full bg-[var(--gt-red)] text-center text-[10px] font-extrabold uppercase leading-[1.1] text-white shadow-[0_10px_26px_rgba(0,0,0,0.35)] md:h-[92px] md:w-[92px] md:text-xs"
          style={{ fontFamily: 'var(--font-brand)' }}>
          New<br />Product
        </span>
      </div>
    </section>
  )
}
