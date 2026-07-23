// Intro — laid out to match the Figma frame exactly (1440-wide artboard).
// Measured positions, relative to the composition box (x:0-1440, y:185-795):
//   logo          x 456  y 185  549×610
//   2G            x 177  y 358  214×121
//   .5G           x 180  y 533  214×121
//   ORGANIC       x 1050 y 358  214×121
//   ALL NATURAL   x 1050 y 533  214×121
// The desktop stage keeps that aspect ratio and positions each box by percent,
// so it scales but never drifts from the design. Mobile stacks (logo, then a
// 2×2 grid) since the artboard proportions would be unreadable at phone width.

const STAGE_W = 1440
const STAGE_H = 610 // logo top (185) → logo bottom (795)
const ORIGIN_Y = 185

type Box = { big: string; small: string; x: number; y: number; bigVw: number }
// bigVw tuned per label so the longest ones still sit on a single line in the
// 214px Figma box (Bebas is condensed, so short labels can run much larger)
const BOXES: Box[] = [
  { big: '2G', small: 'Indoor Flower', x: 177, y: 358, bigVw: 3.05 },
  { big: '.5G', small: 'Hash Rosin', x: 180, y: 533, bigVw: 3.05 },
  { big: 'Organic', small: 'Wood Tip', x: 1050, y: 358, bigVw: 2.35 },
  { big: 'All Natural', small: 'Unrefined Paper', x: 1050, y: 533, bigVw: 2.15 },
]
const BOX_W = 214
const BOX_H = 121

function pct(v: number, total: number) {
  return `${(v / total) * 100}%`
}

function BoxInner({ big, small, bigVw }: { big: string; small: string; bigVw: number }) {
  return (
    <>
      <span className="font-display whitespace-nowrap uppercase leading-none" style={{ fontSize: `min(${bigVw}vw, ${Math.round(bigVw * 14.4)}px)` }}>
        {big}
      </span>
      <span
        className="whitespace-nowrap font-extrabold uppercase leading-tight tracking-tight"
        style={{ fontFamily: 'var(--font-brand)', fontSize: 'min(1.15vw, 16px)' }}
      >
        {small}
      </span>
    </>
  )
}

export default function HhIntro() {
  return (
    <section id="hh-intro" className="relative px-6 pb-14 pt-20 md:pt-24">
      <p
        className="media-reveal text-center font-extrabold uppercase tracking-[0.3em] text-[var(--hh-green-deep)]"
        style={{ fontFamily: 'var(--font-brand)', fontSize: 'min(3.2vw, 42px)' }}
      >
        Introducing the all new
      </p>

      {/* ── desktop: exact Figma stage ── */}
      <div
        className="relative mx-auto mt-6 hidden w-full max-w-[1440px] md:block"
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img
          src="/products/hash-hole/hashhole-logo.webp"
          alt="Jungle Boys Hash Hole"
          className="hh-float absolute"
          style={{ left: pct(456, STAGE_W), top: 0, width: pct(549, STAGE_W), height: '100%', objectFit: 'contain' }}
        />
        {BOXES.map((b) => (
          <div
            key={b.big}
            data-hh-plx={b.y === 358 ? -0.04 : 0.04}
            className="hh-spec media-reveal absolute flex flex-col justify-center overflow-hidden px-[1.1%] text-white"
            style={{
              left: pct(b.x, STAGE_W),
              top: pct(b.y - ORIGIN_Y, STAGE_H),
              width: pct(BOX_W, STAGE_W),
              height: pct(BOX_H, STAGE_H),
            }}
          >
            <BoxInner big={b.big} small={b.small} bigVw={b.bigVw} />
          </div>
        ))}
      </div>

      {/* ── mobile: logo then a 2×2 grid in the same reading order ── */}
      <div className="mt-6 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img src="/products/hash-hole/hashhole-logo.webp" alt="Jungle Boys Hash Hole" className="hh-float mx-auto w-[78vw]" />
        <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-4">
          {[BOXES[0], BOXES[2], BOXES[1], BOXES[3]].map((b) => (
            <div key={b.big} className="hh-spec media-reveal flex aspect-[214/121] flex-col justify-center px-4 text-white">
              <span className="font-display text-3xl uppercase leading-none">{b.big}</span>
              <span className="text-xs font-extrabold uppercase leading-tight tracking-wide" style={{ fontFamily: 'var(--font-brand)' }}>
                {b.small}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
