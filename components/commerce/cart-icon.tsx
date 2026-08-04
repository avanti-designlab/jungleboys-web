'use client'

// The bag icon with the item count filling its CENTER circle (Avanti,
// 2026-08-03) — not a corner badge. The circle sits in the bag body: empty
// and quiet at 0, filled brand-yellow with the count once items land.
//
// Avanti's custom icon replaces the drawn bag: drop the file at
// public/shop/icons/cart.svg and set CART_ICON_SRC — the count circle overlay
// stays exactly as it is. Until the file exists this renders the drawn bag;
// a null here must never render a broken <img>.
const CART_ICON_SRC: string | null = '/shop/icons/cart.svg'

// Where the count circle sits. Avanti's art carries its OWN badge circle
// (cx 115.8, cy 54.3 in a 150.51x113.97 viewBox → 77%/48% of the contain box),
// so the count centers on it; the drawn bag kept the original center spot.
const COUNT_POS = CART_ICON_SRC ? 'left-[77%] top-[48%]' : 'left-1/2 top-[58%]'

// Proportions (Avanti, 2026-08-03: "the circle takes over the entire cart —
// make the cart bigger so it's more visible"): the icon runs 40px and the
// count circle stays SMALL (16px, on the art's badge spot) so the cart art
// reads first and the number rides it, instead of eclipsing it.
export default function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      {CART_ICON_SRC ? (
        // The supplied art is two-tone #151515/#fff, drawn for a light ground;
        // the pill is near-black in both themes, so invert renders the same
        // art white-on-dark without editing the file.
        // eslint-disable-next-line @next/next/no-img-element -- brand SVG
        <img src={CART_ICON_SRC} alt="" className="h-10 w-10 object-contain invert" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10" aria-hidden>
          <path d="M5.2 8.2h13.6l-1.1 11.2a1.9 1.9 0 0 1-1.9 1.7H8.2a1.9 1.9 0 0 1-1.9-1.7L5.2 8.2Z" strokeLinejoin="round" />
          <path d="M9 8.2V6.5a3 3 0 0 1 6 0v1.7" />
        </svg>
      )}
      <span
        data-cart-count
        className={`absolute ${COUNT_POS} flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] leading-none transition-[background-color,opacity] duration-200 ${
          count > 0
            ? 'h-4 w-4 bg-[var(--color-accent)] text-black'
            : CART_ICON_SRC
              ? // the custom art carries its own badge circle, white in the
                // original; inverted it becomes a black hole. At 0 a white dot
                // the badge's own size (~10px of the 40px box) restores the art.
                'h-[0.65rem] w-[0.65rem] bg-white text-transparent'
              : 'h-4 w-4 border border-white/30 text-white/50'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {count}
      </span>
    </span>
  )
}
