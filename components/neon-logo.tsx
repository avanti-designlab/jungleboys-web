import { LOGO_PATHS, LOGO_VIEWBOX } from '@/lib/logo-paths'

// JB logo with a neon-sign tracer: a glowing yellow segment travels the script
// outline on an endless loop over the solid white mark. Pure CSS animation
// (stroke-dashoffset), frozen automatically for reduced-motion users.

export default function NeonLogo({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} aria-label="Jungle Boys">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#ffffff" />
      ))}
      <path d={LOGO_PATHS[0]} fill="none" stroke="#FECF0E" strokeWidth="1.6" className="neon-trace" />
    </svg>
  )
}
