'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// HOW THEY GET ROLLED — two big process cards.
//
// Avanti is sending two clips. Until they land each card runs its still with a
// slow push-in so the section reads as finished rather than broken, and the
// card markup is already the final one. Dropping the files in is a one-line
// change per card: set `src`. Deliberately NOT pointing <video> at files that
// do not exist yet — that would 404 on every load for every visitor.

type Card = {
  step: string
  title: string
  copy: string
  src: string | null
}

const CARDS: Card[] = [
  {
    step: '01',
    title: 'Whole nugs, never trim',
    copy: 'Every roll starts from the same jarred flower we sell by the eighth — broken down by hand, never sweepings off the floor.',
    src: null,
  },
  {
    step: '02',
    title: 'Packed for an even burn',
    copy: 'Filled to a consistent density end to end, so it draws smooth from the first spark and never canoes down one side.',
    src: null,
  },
]

export default function PrProcess() {
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

          gsap.from('[data-pr-proc-card]', {
            opacity: 0, yPercent: 14, rotateX: 10, duration: 0.9, stagger: 0.14, ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 72%' },
          })
          // slow push-in on the stills, tied to scroll so it never loops idly
          gsap.to('[data-pr-proc-media]', {
            scale: 1.14, ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative overflow-hidden rounded-[1.75rem] px-4 py-14 md:rounded-[2.5rem] md:px-10 md:py-20"
        style={{ background: 'linear-gradient(168deg, #0a3f22 0%, #062916 46%, #02110a 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="pr-aurora-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 66% 30%, rgba(125,255,79,0.26) 0%, rgba(125,255,79,0) 72%)' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--pr-lime)] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)' }}>
              Inside the roll
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.84] text-white"
              style={{ fontSize: 'min(12vw, 6.5rem)', letterSpacing: '-0.035em' }}>
              How it&rsquo;s made
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 md:gap-7" style={{ perspective: '1200px' }}>
            {CARDS.map((card) => (
              <article key={card.step} data-pr-proc-card
                className="group overflow-hidden rounded-[1.6rem] border border-[var(--pr-lime)]/25 will-change-transform md:rounded-[2rem]"
                style={{
                  background: 'linear-gradient(160deg, rgba(12,70,36,0.7) 0%, rgba(3,22,12,0.85) 100%)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(182,255,138,0.22)',
                }}>
                <div className="relative m-3 aspect-[16/10] overflow-hidden rounded-[1.2rem] md:m-4 md:rounded-[1.5rem]"
                  style={{ background: 'radial-gradient(90% 90% at 50% 30%, #0e5c2e 0%, #04180d 100%)' }}>
                  {card.src ? (
                    <video
                      data-pr-proc-media
                      aria-hidden
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover will-change-transform"
                    >
                      <source src={card.src} type="video/mp4" />
                    </video>
                  ) : (
                    /* Empty video slot. A product shot sat here before and read
                       as the finished card rather than a gap, which made it look
                       like the section was meant to be a photo. This is honestly
                       a placeholder: a framed slot with a play mark. */
                    <div className="absolute inset-0 grid place-items-center">
                      <div aria-hidden className="absolute inset-4 rounded-[0.9rem] border border-dashed border-[var(--pr-lime)]/30" />
                      <div className="relative flex flex-col items-center gap-3">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--pr-lime)]/50 md:h-16 md:w-16"
                          style={{ background: 'radial-gradient(circle at 35% 30%, rgba(182,255,138,0.3) 0%, rgba(18,144,63,0.25) 100%)' }}>
                          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 md:h-7 md:w-7" fill="var(--pr-lime)" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[var(--pr-lime)]/70 md:text-[11px]"
                          style={{ fontFamily: 'var(--font-brand)' }}>
                          Video coming
                        </span>
                      </div>
                    </div>
                  )}
                  <span className="font-display absolute left-4 top-3 z-10 leading-none text-[var(--pr-lime)]"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}>
                    {card.step}
                  </span>
                </div>

                <div className="px-5 pb-6 md:px-7 md:pb-8">
                  <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.6rem)] uppercase leading-[0.92] text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70 md:text-[15px]">{card.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
