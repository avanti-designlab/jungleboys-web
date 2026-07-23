// Intro — "INTRODUCING THE ALL NEW" over the HASH HOLE logo, flanked by the
// four spec boxes (2G indoor flower / .5G hash rosin / organic wood tip / all
// natural paper). Server component; reveals via the page-wide controller.

const SPECS_LEFT = [
  { big: '2G', small: 'Indoor Flower' },
  { big: '.5G', small: 'Hash Rosin' },
]
const SPECS_RIGHT = [
  { big: 'Organic', small: 'Wood Tip' },
  { big: 'All Natural', small: 'Unrefined Paper' },
]

function Spec({ big, small }: { big: string; small: string }) {
  return (
    <div className="hh-spec media-reveal flex flex-col px-5 py-3 text-white">
      <span className="font-display text-2xl uppercase leading-none md:text-3xl">{big}</span>
      <span className="text-[11px] font-bold uppercase tracking-wide md:text-xs" style={{ fontFamily: 'var(--font-brand)' }}>
        {small}
      </span>
    </div>
  )
}

export default function HhIntro() {
  return (
    <section id="hh-intro" className="relative px-6 pt-20 pb-10 md:pt-28">
      <p className="media-reveal text-center text-lg font-extrabold uppercase tracking-[0.3em] text-[var(--hh-green-deep)] md:text-2xl" style={{ fontFamily: 'var(--font-brand)' }}>
        Introducing the all new
      </p>

      <div className="mx-auto mt-6 grid max-w-[1100px] grid-cols-2 items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <div className="order-2 flex flex-col items-end gap-4 md:order-1 md:items-end">
          {SPECS_LEFT.map((s) => (
            <Spec key={s.big} {...s} />
          ))}
        </div>

        {/* logo center — spans full width on mobile */}
        <div className="order-1 col-span-2 md:order-2 md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
          <img src="/products/hash-hole/hashhole-logo.webp" alt="Jungle Boys Hash Hole" className="hh-float mx-auto w-[min(60vw,360px)]" />
        </div>

        <div className="order-3 flex flex-col items-start gap-4">
          {SPECS_RIGHT.map((s) => (
            <Spec key={s.big} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
