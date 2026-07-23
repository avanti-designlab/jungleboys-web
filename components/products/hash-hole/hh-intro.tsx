// Intro — "INTRODUCING THE ALL NEW" over a big HASH HOLE logo, flanked by the
// four spec boxes (2G indoor flower / .5G hash rosin / organic wood tip / all
// natural paper). Everything scaled up and bolder. Reveals via the page-wide
// controller; the boxes drift on a light scroll parallax.

const SPECS_LEFT = [
  { big: '2G', small: 'Indoor Flower', plx: -0.05 },
  { big: '.5G', small: 'Hash Rosin', plx: 0.05 },
]
const SPECS_RIGHT = [
  { big: 'Organic', small: 'Wood Tip', plx: 0.05 },
  { big: 'All Natural', small: 'Unrefined Paper', plx: -0.05 },
]

function Spec({ big, small, plx }: { big: string; small: string; plx: number }) {
  return (
    <div data-hh-plx={plx} className="hh-spec media-reveal flex flex-col px-6 py-4 text-white md:px-8 md:py-5">
      <span className="font-display text-4xl uppercase leading-none md:text-6xl">{big}</span>
      <span className="mt-1 text-sm font-extrabold uppercase leading-tight tracking-wide md:text-lg" style={{ fontFamily: 'var(--font-brand)' }}>
        {small}
      </span>
    </div>
  )
}

export default function HhIntro() {
  return (
    <section id="hh-intro" className="relative px-6 pb-16 pt-24 md:pt-32">
      <p className="media-reveal text-center text-2xl font-extrabold uppercase tracking-[0.32em] text-[var(--hh-green-deep)] md:text-4xl" style={{ fontFamily: 'var(--font-brand)' }}>
        Introducing the all new
      </p>

      <div className="mx-auto mt-10 grid max-w-[1300px] grid-cols-2 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
        <div className="order-2 flex flex-col items-center gap-6 md:order-1 md:items-end">
          {SPECS_LEFT.map((s) => (
            <Spec key={s.big} {...s} />
          ))}
        </div>

        {/* logo center — full width on mobile, big on desktop */}
        <div className="order-1 col-span-2 md:order-2 md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
          <img src="/products/hash-hole/hashhole-logo.webp" alt="Jungle Boys Hash Hole" className="hh-float mx-auto w-[min(78vw,520px)]" />
        </div>

        <div className="order-3 flex flex-col items-center gap-6 md:items-start">
          {SPECS_RIGHT.map((s) => (
            <Spec key={s.big} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
