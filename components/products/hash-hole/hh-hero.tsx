'use client'

// Hero — the intro film plays in a wide rounded "pill" that fills most of the
// viewport; HASH HOLE drops in on one line over the lower third with a white
// SCROLL bubble beneath it (same banner motion family as the other pages,
// gated by RevealGate). Video is muted/looped/autoplay; poster covers load.

const WORD = 'HASH HOLE'

export default function HhHero() {
  let li = 0
  return (
    <section className="relative px-2 pt-2 md:px-3">
      <div className="relative h-[86vh] min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] md:rounded-[2.5rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/products/hash-hole/hero-poster.webp"
        >
          <source src="/products/hash-hole/hero.mp4" type="video/mp4" />
        </video>
        {/* legibility gradient at the bottom for the wordmark */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute inset-x-0 bottom-[7vh] z-10 flex flex-col items-center px-4">
          <h1 className="hh-gold-head font-display select-none text-center uppercase leading-[0.82]" style={{ fontSize: 'min(17vw, 13rem)' }}>
            {WORD.split('').map((ch) => (
              <span key={li} className="hh-letter" style={{ animationDelay: `${0.15 + li++ * 0.05}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <a
            href="#hh-intro"
            className="hh-scrollbtn mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-[var(--hh-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Scroll
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
