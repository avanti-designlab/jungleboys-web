'use client'

import { useEffect, useRef } from 'react'

// "Why our packs hit different" — editorial, not icon boxes. Eight claims as
// oversized alternating filled/outlined statements that reveal on scroll, with
// nug cutouts drifting at the edges. Reveals use the shared .media-reveal /
// .is-in pattern (scroll handler, works with the frozen-preview constraint).

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

const NUGS = [
  { src: '/products/flower/nug-a.webp', top: '6%', left: '-3%', w: 170, delay: 0 },
  { src: '/products/flower/nug-b.webp', top: '24%', right: '-4%', w: 210, delay: 0.6 },
  { src: '/products/flower/nug-c.webp', top: '48%', left: '-5%', w: 240, delay: 1.2 },
  { src: '/products/flower/nug-d.webp', top: '66%', right: '-3%', w: 180, delay: 0.3 },
  { src: '/products/flower/anug-5.webp', top: '86%', left: '2%', w: 150, delay: 0.9 },
]

export default function WhyPacks() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('is-in')
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-black py-24 md:py-36">
      {/* drifting nugs */}
      {NUGS.map((n, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative cutouts
        <img
          key={i}
          src={n.src}
          alt=""
          aria-hidden
          className="fl-float media-reveal pointer-events-none absolute z-0"
          style={{ top: n.top, left: n.left, right: n.right, width: n.w, animationDelay: `${n.delay}s` }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <p className="media-reveal text-center text-xs font-bold uppercase tracking-[0.4em] text-[var(--fl-gold,#e9c15a)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Why our packs
        </p>
        <h2 className="media-reveal font-display mt-2 text-center uppercase leading-[0.86] text-white" style={{ fontSize: 'min(15vw, 11rem)' }}>
          Hit Different
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
