'use client'

// The bag icon with the item count filling its CENTER circle (Avanti,
// 2026-08-03) — not a corner badge. The circle sits in the bag body: empty
// and quiet at 0, filled brand-yellow with the count once items land.
//
// Avanti's custom icon replaces the drawn bag: drop the file at
// public/shop/icons/cart.svg and set CART_ICON_SRC — the count circle overlay
// stays exactly as it is. Until the file exists this renders the drawn bag;
// a null here must never render a broken <img>.
const CART_ICON_SRC: string | null = null

export default function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center">
      {CART_ICON_SRC ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand SVG
        <img src={CART_ICON_SRC} alt="" className="h-8 w-8 object-contain" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8" aria-hidden>
          <path d="M5.2 8.2h13.6l-1.1 11.2a1.9 1.9 0 0 1-1.9 1.7H8.2a1.9 1.9 0 0 1-1.9-1.7L5.2 8.2Z" strokeLinejoin="round" />
          <path d="M9 8.2V6.5a3 3 0 0 1 6 0v1.7" />
        </svg>
      )}
      <span
        data-cart-count
        className={`absolute left-1/2 top-[58%] flex h-[1.15rem] w-[1.15rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-extrabold leading-none transition-colors duration-200 ${
          count > 0
            ? 'bg-[var(--color-accent)] text-black'
            : 'border border-white/30 text-white/50'
        }`}
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        {count}
      </span>
    </span>
  )
}
