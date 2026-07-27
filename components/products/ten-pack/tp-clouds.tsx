// ONE smoke plate per section — deliberately.
//
// This used to stack six plates to build "more weather", and every plate
// contributed an edge. Even with the alpha faded at the boundary, six
// overlapping semi-transparent rectangles per section stack into visible density
// bands, and the hero had twelve. That is what was drawing cut lines across the
// panels.
//
// So: a single plate, but a BIG one. It is sized at 220% of the panel and
// offset so it overhangs on all sides, which means its faded edges sit well
// outside the visible area and can never resolve into a line no matter how it
// drifts or scales. Density comes from opacity and scale, not from layering.
//
// The plate is smoke-alpha.webp: RGB pure white, alpha from the source
// luminance, with a cosine falloff to zero on all four edges.

export default function TpClouds({
  density = 1,
  className = '',
  from = 'bank',
}: { density?: number; className?: string; from?: 'bank' | 'left' }) {
  const exhale = from === 'left'
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className={exhale ? 'tp-puff' : 'tp-cloud'}
        style={
          exhale
            ? { position: 'absolute', left: '-78%', top: '-60%', width: '250%', height: '230%' }
            : { position: 'absolute', left: '-60%', top: '-60%', width: '220%', height: '220%' }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
        <img
          src="/products/10-pack/smoke-alpha.webp"
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: Math.min(1, 0.95 * density) }}
        />
      </div>
    </div>
  )
}
