// Value-prop icons with real internal motion (not wiggles): the coin drops
// into the tray, the shackle pops open, the bars climb, the gift lid lifts.
// Animation classes live in globals.css, gated by prefers-reduced-motion.

const stroke = 'var(--color-foreground)'

export function EarnIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <g className="rw-ic-coin">
        <circle cx="24" cy="14" r="7.5" stroke={stroke} strokeWidth="2.6" />
        <path d="M24 10.5v7M22 12.3c.4-.7 3.2-1 3.2.5s-2.9 1-2.9 2.6c0 1.4 2.6 1.3 3.1.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
      </g>
      <path d="M9 28h30v10a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V28Z" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M17 28c1.5 2.6 4 4 7 4s5.5-1.4 7-4" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <path className="rw-ic-sparkle" d="M39 18l1.2 2.6L42.8 22l-2.6 1.2L39 25.8l-1.2-2.6L35.2 22l2.6-1.4L39 18Z" fill="var(--color-accent)" />
    </svg>
  )
}

export function UnlockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <g className="rw-ic-shackle">
        <path d="M16 22v-7a8 8 0 0 1 16 0" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
      </g>
      <rect x="12" y="22" width="24" height="18" rx="4" stroke={stroke} strokeWidth="2.8" />
      <circle cx="24" cy="30" r="2.6" fill={stroke} />
      <path d="M24 32v4" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <path className="rw-ic-sparkle" d="M40 26l1 2.2 2.2 1-2.2 1L40 32.4l-1-2.2-2.2-1 2.2-1 1-2.2Z" fill="var(--color-accent)" />
    </svg>
  )
}

export function ClimbIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <rect className="rw-ic-bar" x="8" y="28" width="8" height="12" rx="1.5" fill={stroke} style={{ animationDelay: '0s' }} />
      <rect className="rw-ic-bar" x="20" y="22" width="8" height="18" rx="1.5" fill={stroke} style={{ animationDelay: '0.25s' }} />
      <rect className="rw-ic-bar" x="32" y="15" width="8" height="25" rx="1.5" fill={stroke} style={{ animationDelay: '0.5s' }} />
      <path
        className="rw-ic-sparkle"
        d="M36 4l1.6 3.4L41 9l-3.4 1.6L36 14l-1.6-3.4L31 9l3.4-1.6L36 4Z"
        fill="var(--color-accent)"
        style={{ animationDelay: '0.7s' }}
      />
    </svg>
  )
}

export function BonusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <g className="rw-ic-lid">
        <rect x="9" y="16" width="30" height="8" rx="2" stroke={stroke} strokeWidth="2.6" />
        <path d="M24 16c-5-7-11-4-9 0M24 16c5-7 11-4 9 0" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <path d="M12 24h24v13a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V24Z" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M24 24v16" stroke={stroke} strokeWidth="2.6" />
      <path className="rw-ic-sparkle" d="M42 10l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2Z" fill="var(--color-accent)" style={{ animationDelay: '0.4s' }} />
    </svg>
  )
}

// ——— ways-to-earn icons (black strokes on the yellow circle chips) ———

export function ReferIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="#111" strokeWidth="2.8">
      <circle cx="17" cy="17" r="6" />
      <path d="M6 40c1.5-8 6-11 11-11s9.5 3 11 11" strokeLinecap="round" />
      <g className="rw-ic-pop">
        <circle cx="36" cy="15" r="4.6" />
        <path d="M36 24.5c4 0 7 2.5 8 8.5" strokeLinecap="round" />
        <path d="M36 4v5M33.5 6.5h5" strokeLinecap="round" strokeWidth="2.2" />
      </g>
    </svg>
  )
}

export function BirthdayIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <g className="rw-ic-tilt">
        <path d="M14 44 24 20l10 14-20 10Z" fill="#111" />
        <path d="M18 38l10-6" stroke="#fecf0e" strokeWidth="2" />
      </g>
      <path className="rw-ic-sparkle" d="M30 10l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4 1.4-3Z" fill="#111" />
      <path className="rw-ic-sparkle" d="M40 22l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2Z" fill="#111" style={{ animationDelay: '0.5s' }} />
      <circle className="rw-ic-sparkle" cx="38" cy="8" r="2.2" fill="#111" style={{ animationDelay: '1s' }} />
      <circle className="rw-ic-sparkle" cx="44" cy="14" r="1.8" fill="#111" style={{ animationDelay: '1.4s' }} />
    </svg>
  )
}

export function FirstTimeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="#111" strokeWidth="2.8">
      <circle cx="24" cy="19" r="7" />
      <path d="M11 43c2-8.5 7-12 13-12s11 3.5 13 12" strokeLinecap="round" />
      <path
        className="rw-ic-pop"
        d="M38 2l1.8 3.8L43.6 7.6l-3.8 1.8L38 13.2l-1.8-3.8-3.8-1.8 3.8-1.8L38 2Z"
        fill="#111"
        stroke="none"
      />
    </svg>
  )
}
