'use client'

import { useEffect, useRef } from 'react'

// "Why our packs hit different" — editorial, not icon boxes. Eight claims as
// oversized alternating filled/outlined statements that reveal on scroll, with
// nug cutouts riding a scroll parallax at the edges. Reveals use the shared
// .media-reveal / .is-in pattern; parallax writes the `translate`/`rotate`
// properties so it composes with the reveal transform.

const CLAIMS = [
  '100% Indoor-Grown',
  'Hand-Trimmed Buds Only',
  'Exotic Genetics',
  'High THC & Terpene-Rich',
  'Fresh, Small-Batch Harvests',
  'New Gold Mylar Packaging',
  'Strain-Specific Excellence',
  'Trusted & Lab-Tested',
]

// plx: parallax factor (px of drift per px of scroll offset, signed)
const NUGS = [
  { src: '/products/flower/nug-a.webp', top: '6%', left: '-3%', w: 170, plx: -0.16, rot: -8 },
  { src: '/products/flower/nug-b.webp', top: '24%', right: '-4%', w: 210, plx: 0.12, rot: 10 },
  { src: '/products/flower/nug-c.webp', top: '48%', left: '-5%', w: 240, plx: 0.2, rot: -12 },
  { src: '/products/flower/nug-d.webp', top: '66%', right: '-3%', w: 180, plx: -0.12, rot: 7 },
  { src: '/products/flower/anug-5.webp', top: '82%', left: '4%', w: 140, plx: 0.16, rot: -9 },
]

export default function WhyPacks() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal'))
    const nugs = Array.from(root.querySelectorAll<HTMLElement>('[data-plx]'))
    let raf = 0
    const tick = () => {
      raf = 0
      const vh = window.innerHeight
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.88) el.classList.add('is-in')
      })
      // parallax: drift each nug against its distance from viewport center
      nugs.forEach((n) => {
        const r = n.getBoundingClientRect()
        const d = (r.top + r.height / 2 - vh / 2) / vh // -1..1-ish
        n.style.translate = `0 ${(d * parseFloat(n.dataset.plx!) * vh).toFixed(1)}px`
        n.style.rotate = `${(d * parseFloat(n.dataset.rot!)).toFixed(2)}deg`
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const t = setTimeout(tick, 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-black pb-24 pt-14 md:pb-36 md:pt-20">
      {/* parallax nugs */}
      {NUGS.map((n, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative cutouts
        <img
          key={i}
          src={n.src}
          alt=""
          aria-hidden
          data-plx={n.plx}
          data-rot={n.rot}
          className="media-reveal pointer-events-none absolute z-0 will-change-transform"
          style={{ top: n.top, left: n.left, right: n.right, width: n.w }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <h2 className="font-display text-center uppercase leading-[0.86]" style={{ fontSize: 'min(15vw, 11rem)' }}>
          <span className="media-reveal block text-white">Why Our Packs</span>
          <span className="media-reveal block text-[var(--color-accent)]">Hit Different</span>
        </h2>

        <ol className="mt-16 md:mt-24">
          {CLAIMS.map((c, i) => (
            <li key={c} className={`media-reveal flex items-baseline gap-4 py-3 md:gap-8 md:py-4 ${i % 2 ? 'fl-claim-r flex-row-reverse text-right' : 'fl-claim-l'}`}>
              <span className="shrink-0 text-xs font-bold tracking-[0.3em] text-[var(--fl-gold,#e9c15a)]" style={{ fontFamily: 'var(--font-brand)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`font-display uppercase leading-[0.92] ${i % 2 ? 'fl-stroke' : 'text-white'}`}
                style={{ fontSize: 'min(8.4vw, 5.6rem)' }}
              >
                {c}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
