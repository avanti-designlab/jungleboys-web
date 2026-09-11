import type { Product } from './dutchie'

// Display name for product CARDS — the ONE choke point every card heading
// renders through (ProductCard + all /products line strips).
//
// RULING (Avanti, 2026-09-10): "the names should be displayed how they are
// from Dutchie, not edited." A brand-prefix strip shipped here briefly the
// same day and was reverted within hours — the menu name is what the team
// wrote in the POS, verbatim. Do not get clever with it again without her
// explicit say-so.
export function displayName(p: Product): string {
  return p.name
}
