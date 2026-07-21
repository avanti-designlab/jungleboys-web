// The curated Jungle Boys product lines (the "Products" collection — JB-only,
// separate from the Dutchie-powered Shop). Each links to its own line page under
// /products/<slug> (the flagship Phase 2 landing pages). Sourced from the Figma
// product-line frames (Hash Hole, Twins, Pops, Flower, Pre-Rolls, 10-Pack).
// No API — this is a static curated collection.

export type ProductLine = {
  slug: string
  name: string
  tag: string
  blurb: string
}

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'hash-hole',
    name: 'Hash Hole',
    tag: 'Infused Pre-Roll',
    blurb: 'Indoor flower wrapped around a molten hash-rosin core. The one that started the frenzy.',
  },
  {
    slug: 'premium-flower',
    name: 'Premium Flower',
    tag: 'Indoor Flower',
    blurb: 'Top-shelf, hand-trimmed indoor — jarred at peak and never rushed.',
  },
  {
    slug: 'pre-rolls',
    name: 'Pre-Rolls',
    tag: '1G Pre-Roll',
    blurb: 'Single-strain gram pre-rolls, packed with the same flower we jar. Spark and go.',
  },
  {
    slug: '10-pack-prerolls',
    name: '10-Pack Pre-Rolls',
    tag: 'Multipack',
    blurb: 'Ten mini pre-rolls to a pack — the everyday carry for when one is never enough.',
  },
  {
    slug: 'twins',
    name: 'Twins',
    tag: 'Infused Pre-Roll',
    blurb: 'Double-infused, double trouble. Two-strain blends rolled for a heavier hit.',
  },
  {
    slug: 'pops',
    name: 'Pops',
    tag: 'Infused Mini',
    blurb: 'Bite-size infused minis in the candy-striped jar. Small format, full send.',
  },
]
