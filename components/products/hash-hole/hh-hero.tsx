// Hero — the intro film plays full-bleed in a wide rounded pill. No overlay
// wordmark (the film carries the HASH HOLE branding); just a white SCROLL
// bubble at the bottom with a gently bouncing arrow.

export default function HhHero() {
  return (
    <section className="relative px-2 pt-2 md:px-3">
      <div className="relative h-[92vh] min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] md:rounded-[2.5rem]">
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

        <a
          href="#hh-intro"
          className="absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-[var(--hh-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Scroll
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="hh-arrow-bounce" aria-hidden>
            <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
