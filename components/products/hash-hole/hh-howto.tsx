// How to Smoke — the four steps, each an illustration card + copy, revealing
// in sequence. Uses the Figma "HOW TO SMOKE" wordmark (with the golf-cart
// mascot) as the heading. Server component.

const STEPS = [
  {
    img: '/products/hash-hole/howto-1.webp',
    title: 'Light the Tip Properly',
    body: 'Use a lighter or hemp wick. Toast the end evenly (like lighting a cigar) instead of torching one side. Once it’s evenly lit, take a slow first pull.',
  },
  {
    img: '/products/hash-hole/howto-2.webp',
    title: 'Pace Your Hits',
    body: 'Take slow, steady inhales instead of big rips. Hash burns hotter and stronger than flower. Exhale fully and wait a moment before your next hit.',
  },
  {
    img: '/products/hash-hole/howto-3.webp',
    title: 'Rotate as You Smoke',
    body: 'Rotate the joint as you puff so the cherry burns evenly. If the flower starts to canoe, gently touch it up with your lighter.',
  },
  {
    img: '/products/hash-hole/howto-4.webp',
    title: 'Let Ash Fall Naturally',
    body: 'Let the cherry fall naturally into the ashtray instead of tapping too hard — this helps the hash line burn through.',
  },
]

export default function HhHowTo() {
  return (
    <section className="relative px-6 py-16 md:py-24">
      {/* wordmark heading */}
      {/* eslint-disable-next-line @next/next/no-img-element -- section wordmark */}
      <img src="/products/hash-hole/wm-howtosmoke.webp" alt="How to Smoke" className="media-reveal mx-auto w-[min(80vw,620px)]" />

      <div className="mx-auto mt-14 grid max-w-[1240px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="media-reveal flex flex-col overflow-hidden rounded-[1.5rem] border-4 border-white bg-white/85 shadow-[0_14px_40px_rgba(19,92,43,0.18)] backdrop-blur"
            style={{ transitionDelay: `${Math.min(i, 3) * 0.08}s` }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[color-mix(in_srgb,var(--hh-sky-top)_55%,white)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- step art */}
              <img src={s.img} alt={s.title} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-3" />
              <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hh-green)] text-sm font-extrabold text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                {i + 1}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-display text-xl uppercase leading-none text-[var(--hh-green-deep)]">{s.title}</h3>
              <p className="text-[12px] font-medium leading-relaxed text-[var(--hh-ink)]/75" style={{ fontFamily: 'var(--font-brand)' }}>
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
