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
            ? { position: 'absolute', left: '-52%', top: '-34%', width: '200%', height: '175%' }
            : { position: 'absolute', left: '-42%', top: '-38%', width: '180%', height: '180%' }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
        <img
          src="/products/10-pack/smoke-alpha.webp"
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: Math.min(1, 1 * density) }}
        />
      </div>

      {/* Smoke this defined is bright enough to eat white type, so a soft
          centre-weighted scrim sits between it and the content. It stays clear
          of the edges, so the smoke still reads at full strength around the
          outside of the panel. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(95% 78% at 50% 50%, rgba(3,16,34,0.52) 0%, rgba(3,16,34,0.3) 52%, rgba(3,16,34,0) 100%)',
        }}
      />
    </div>
  )
}
