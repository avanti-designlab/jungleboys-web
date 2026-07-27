// Rolling cloud bank. One smoke plate is a flat texture; this stacks SIX of
// them at different scales, offsets, opacities and drift speeds — some blown
// left, some right, some slowly swelling — so the frame reads as weather rather
// than as a texture sitting behind the content.
//
// Pure CSS transforms on `img` elements: no canvas, no per-frame JS, and the
// compositor does all of it. `density` just scales the whole bank's presence.

const LAYERS = [
  { cls: 'tp-cloud-1', top: '-18%', h: '92%', op: 0.5, w: '150%', left: '-25%' },
  { cls: 'tp-cloud-2', top: '6%', h: '80%', op: 0.34, w: '135%', left: '-18%' },
  { cls: 'tp-cloud-3', top: '28%', h: '96%', op: 0.6, w: '160%', left: '-30%' },
  { cls: 'tp-cloud-4', top: '46%', h: '86%', op: 0.7, w: '140%', left: '-20%' },
  { cls: 'tp-cloud-5', top: '-6%', h: '70%', op: 0.28, w: '125%', left: '-12%' },
  { cls: 'tp-cloud-6', top: '58%', h: '90%', op: 0.55, w: '170%', left: '-35%' },
]

export default function TpClouds({
  density = 1,
  className = '',
  blend = true,
}: { density?: number; className?: string; blend?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {LAYERS.map((l) => (
        <div key={l.cls} className={`${l.cls} absolute will-change-transform`}
          style={{ top: l.top, left: l.left, width: l.w, height: l.h }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
          <img
            src="/products/10-pack/smoke.webp"
            alt=""
            className={`h-full w-full object-cover ${blend ? 'mix-blend-screen' : ''}`}
            style={{ opacity: Math.min(1, l.op * density) }}
          />
        </div>
      ))}
    </div>
  )
}
