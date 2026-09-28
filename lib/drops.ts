import { getDropProducts } from '@/lib/dutchie'
import type { Product } from '@/lib/dutchie'
import { getStory, assetUrl } from '@/lib/storyblok'

// Fresh Drops — the curated weekly release. Drops FRIDAYS; editorial, not a
// computed "new this week" filter (recorded decision, 2026-07-31).
//
// CURATION RESOLVED (2026-09-28): the Dutchie CUSTOM homepage section named
// "Fresh Drops" per store (see lib/dutchie/graphql.ts getDropProducts). The
// note below is history:
// The Phase 3 handoff says the drop is "set in Dutchie so it pulls through" —
// but the collection field has never been verified against a real payload
// (we have no Dutchie API access yet), and the 2026-07-31 scope note said
// Storyblok curation instead. Avanti ruled 2026-08-03: build the LAYOUT now,
// resolve the source when the Dutchie item lands. So this slug list stands in
// for whichever source wins, and swapping it in means rewriting getDrops()'s
// body only — no template changes, same as the provider freeze.
//
// (Resolved — the fixture slug list moved into the placeholder provider.)

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
  // The real curation source (RESOLVED 2026-09-28): the store's "Fresh
  // Drops" CUSTOM homepage section in the Dutchie E-Commerce admin, in the
  // team's drag order. Position 1 = Strain of the Week. A store with no
  // section (or an empty one) gets the page's honest empty state.
  const products = await getDropProducts(retailerId)
  return {
    featured: products.slice(0, 1),
    list: products.slice(1),
  }
}

export interface DropsHero {
  /** CMS strain-graphics backdrop for the Strain of the Week tile — a real
      Storyblok upload or null (the tile falls back to the dark/gold look).
      Per the recorded banner rule: CMS-editable with a code fallback, and
      assetUrl() ignores anything that is not an absolute CMS-host URL. */
  image: string | null
  alt: string
}

export async function getDropsHero(): Promise<DropsHero> {
  const story = await getStory('drops', 'published')
  const body = (story?.content as { body?: unknown } | undefined)?.body
  if (Array.isArray(body)) {
    const blok = body.find(
      (b): b is Record<string, unknown> =>
        !!b && typeof b === 'object' && (b as { component?: string }).component === 'drops_hero'
    )
    if (blok) {
      const url = assetUrl(blok.image, '')
      if (url) return { image: url, alt: typeof blok.alt === 'string' ? blok.alt : '' }
    }
  }
  return { image: null, alt: '' }
}
