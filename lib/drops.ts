import { getMenu } from '@/lib/dutchie'
import type { Product } from '@/lib/dutchie'

// Fresh Drops — the curated weekly release. Drops FRIDAYS; editorial, not a
// computed "new this week" filter (recorded decision, 2026-07-31).
//
// THE CURATION MECHANISM IS THE OPEN QUESTION, AND THIS FILE IS ITS SEAM.
// The Phase 3 handoff says the drop is "set in Dutchie so it pulls through" —
// but the collection field has never been verified against a real payload
// (we have no Dutchie API access yet), and the 2026-07-31 scope note said
// Storyblok curation instead. Avanti ruled 2026-08-03: build the LAYOUT now,
// resolve the source when the Dutchie item lands. So this slug list stands in
// for whichever source wins, and swapping it in means rewriting getDrops()'s
// body only — no template changes, same as the provider freeze.
//
// PRE-CUTOVER CHECK: this list must be replaced by the real curation source.
// A hardcoded drop list live in production is a stale-promo bug waiting for
// its second Friday.

// This week's drop, in display order. Slugs are the placeholder provider's.
const FEATURED_DROP_SLUGS = [
  'zangria-premium-flower-8th',
  '06-og-10-pack',
  'rainbow-belts-10-pack',
]

const DROP_LIST_SLUGS = [
  'motor-breath-premium-flower-8th',
  'rs1000-premium-flower-8th',
  'private-reserve-hash-hole',
  'blu-frootz-gas-tank',
  'apple-jam-gas-tank',
  'blu-og-pops',
  'cherry-gelato-1g-preroll',
  'blu-zerdz-twins-2pack',
]

export interface Drops {
  featured: Product[]
  list: Product[]
}

/**
 * The current drop at one store, from that store's live menu — so pricing,
 * discounts and stock are the store's own, and a product the store does not
 * carry simply drops out rather than rendering an unbuyable card.
 */
export async function getDrops(retailerId: string): Promise<Drops> {
  const menu = await getMenu(retailerId)
  const bySlug = new Map(menu.products.map((p) => [p.slug, p]))
  const pick = (slugs: string[]) =>
    slugs.map((s) => bySlug.get(s)).filter((p): p is Product => p != null)
  return {
    featured: pick(FEATURED_DROP_SLUGS),
    list: pick(DROP_LIST_SLUGS),
  }
}
