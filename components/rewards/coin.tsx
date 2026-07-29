// Cartoon gold coin (matches the Figma illustration coins) — used by the
// slot-machine intro burst. Pure SVG so it stays crisp and transparent.

export default function Coin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="rw-coin-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe873" />
          <stop offset="0.55" stopColor="#fecf0e" />
          <stop offset="1" stopColor="#d9a400" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="#8a6200" />
      <circle cx="23" cy="23" r="21" fill="url(#rw-coin-face)" stroke="#111" strokeWidth="2" />
      <circle cx="23" cy="23" r="15.5" fill="none" stroke="#b98a00" strokeWidth="2.5" />
      <text
        x="23"
        y="31"
        textAnchor="middle"
        fontSize="24"
        fontWeight="900"
        fontFamily="Arial Black, Arial, sans-serif"
        fill="#111"
      >
        $
      </text>
      <path d="M12 10c2-2.5 5-4.2 8-5" stroke="#fff8d0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  )
}
