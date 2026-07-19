import Link from 'next/link'

// GG-style CTA pill: label + circular arrow disc on the right.
// Hover = color change (yellow → white), never scale.

const sizes = {
  md: {
    pill: 'gap-3 pl-6 pr-1.5 py-1.5 text-xs',
    circle: 'h-9 w-9',
    arrow: 'h-4 w-4',
  },
  sm: {
    pill: 'gap-2 pl-4 pr-1 py-1 text-[11px]',
    circle: 'h-7 w-7',
    arrow: 'h-3.5 w-3.5',
  },
} as const

function Arrow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PillCta({
  label,
  href,
  onClick,
  size = 'md',
  className = '',
}: {
  label: string
  href?: string
  onClick?: () => void
  size?: keyof typeof sizes
  className?: string
}) {
  const s = sizes[size]
  const cls = `group inline-flex cursor-pointer items-center rounded-full bg-[var(--color-accent)] font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-white ${s.pill} ${className}`
  const inner = (
    <>
      <span style={{ fontFamily: 'var(--font-brand)' }}>{label}</span>
      <span className={`flex items-center justify-center rounded-full bg-black text-white ${s.circle}`}>
        <Arrow className={s.arrow} />
      </span>
    </>
  )
  return href ? (
    <Link href={href} onClick={onClick} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
