// Rolling cloud bank. One smoke plate is a flat texture; this stacks six of
// them at different scales, offsets, opacities and drift speeds — some blown
// left, some right, some slowly swelling — so the frame reads as weather.
//
// IMPORTANT: this uses smoke-alpha.webp, which carries REAL alpha (RGB is pure
// white, alpha is the source luminance). The original plate is white smoke on a
// fully OPAQUE black card, which only looked right under mix-blend-screen — and
// the animated wrappers carry will-change:transform, which creates a stacking
// context, so the blend resolved against the transparent wrapper instead of the
// section behind it. Every section ended up covered by opaque black rectangles
// with visible seams. Baked alpha needs no blend mode and composites anywhere.
//
// `from="left"` swings the bank into an exhale: the plates start off the left
// edge and roll across, filling the panel like someone just blew it in.

const BANK = [
  { cls: 'tp-cloud-1', top: '-18%', h: '92%', op: 0.5, w: '150%', left: '-25%' },
  { cls: 'tp-cloud-2', top: '6%', h: '80%', op: 0.34, w: '135%', left: '-18%' },
  { cls: 'tp-cloud-3', top: '28%', h: '96%', op: 0.6, w: '160%', left: '-30%' },
  { cls: 'tp-cloud-4', top: '46%', h: '86%', op: 0.7, w: '140%', left: '-20%' },
  { cls: 'tp-cloud-5', top: '-6%', h: '70%', op: 0.28, w: '125%', left: '-12%' },
  { cls: 'tp-cloud-6', top: '58%', h: '90%', op: 0.55, w: '170%', left: '-35%' },
]

// the exhale: everything enters from off-left, biggest and densest low
const EXHALE = [
  { cls: 'tp-puff-1', top: '-10%', h: '96%', op: 0.5, w: '150%', left: '-62%' },
  { cls: 'tp-puff-2', top: '12%', h: '104%', op: 0.72, w: '170%', left: '-78%' },
  { cls: 'tp-puff-3', top: '-24%', h: '84%', op: 0.36, w: '138%', left: '-50%' },
  { cls: 'tp-puff-4', top: '34%', h: '110%', op: 0.85, w: '185%', left: '-88%' },
  { cls: 'tp-puff-5', top: '4%', h: '90%', op: 0.44, w: '155%', left: '-66%' },
  { cls: 'tp-puff-6', top: '46%', h: '96%', op: 0.6, w: '160%', left: '-72%' },
]

export default function TpClouds({
  density = 1,
  className = '',
  from = 'bank',
}: { density?: number; className?: string; from?: 'bank' | 'left' }) {
  const layers = from === 'left' ? EXHALE : BANK
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {layers.map((l) => (
        <div key={l.cls} className={`${l.cls} absolute will-change-transform`}
          style={{ top: l.top, left: l.left, width: l.w, height: l.h }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
          <img
            src="/products/10-pack/smoke-alpha.webp"
            alt=""
            className="h-full w-full object-cover"
            style={{ opacity: Math.min(1, l.op * density) }}
          />
        </div>
      ))}
    </div>
  )
}
