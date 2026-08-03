// Local pre-checkout bag — the state behind the header's cart icon.
//
// SCOPE, deliberately narrow: this is a client-side list of what the shopper
// intends to buy, nothing more. Checkout is DUTCHIE'S, always (security
// invariant §9.2 — we never take payment or hold an order); until the Dutchie
// checkout wiring lands, the bag's checkout action hands off to the store
// menu. No PII, no payment data, no server round-trips — localStorage only,
// same entry-state pattern as jb-store/jb-theme.
//
// Prices are captured AT ADD TIME (the unit price the shopper saw). The bag
// restates totals from these; live repricing against the menu happens when
// real checkout wiring exists.

export const CART_KEY = 'jb-cart'
export const CART_EVENT = 'jb:cart-changed'

export interface CartItem {
  slug: string // product slug — the PDP link
  name: string
  variantId: string
  option: string // "3.5g"
  price: number // cents, unit price when added
  qty: number
  storeSlug: string // the store the item was added from
}

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // malformed rows are dropped, not trusted — the age-gate "1" lesson
    return parsed.filter(
      (i): i is CartItem =>
        i && typeof i.variantId === 'string' && typeof i.qty === 'number' && i.qty > 0
    )
  } catch {
    return []
  }
}

function write(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // storage unavailable — the bag lives for this render only
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT))
}

/** Add one of a variant; same variant at the same store merges into qty. */
export function addToCart(item: Omit<CartItem, 'qty'>): void {
  const items = readCart()
  const hit = items.find((i) => i.variantId === item.variantId && i.storeSlug === item.storeSlug)
  if (hit) hit.qty += 1
  else items.push({ ...item, qty: 1 })
  write(items)
}

export function removeFromCart(variantId: string, storeSlug: string): void {
  write(readCart().filter((i) => !(i.variantId === variantId && i.storeSlug === storeSlug)))
}

export function cartCount(items: CartItem[] = readCart()): number {
  return items.reduce((n, i) => n + i.qty, 0)
}

export function cartSubtotal(items: CartItem[] = readCart()): number {
  return items.reduce((n, i) => n + i.price * i.qty, 0)
}
