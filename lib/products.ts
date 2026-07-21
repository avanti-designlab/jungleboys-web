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
  image: string // product cutout, exported from the Figma line frames
}

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'hash-hole',
    name: 'Hash Hole',
    tag: 'Infused Pre-Roll',
    blurb: 'Indoor flower wrapped around a molten hash-rosin core. The one that started the frenzy.',
    image: '/products/hash-hole.png',
  },
  {
    slug: 'premium-flower',
    name: 'Premium Flower',
    tag: 'Indoor Flower',
    blurb: 'Top-shelf, hand-trimmed indoor — jarred at peak and never rushed.',
    image: '/products/premium-flower.png',
  },
  {
    slug: 'pre-rolls',
    name: 'Pre-Rolls',
    tag: 'Pre-Roll',
    blurb: 'Single-strain pre-rolls packed with the same flower we jar. Spark and go.',
    image: '/products/pre-rolls.png',
  },
  {
    slug: '10-pack-prerolls',
    name: '10-Pack Pre-Rolls',
    tag: 'Multipack',
    blurb: 'Ten mini pre-rolls to a pack — the everyday carry for when one is never enough.',
    image: '/products/10-pack-prerolls.png',
  },
  {
    slug: 'twins',
    name: 'Twins',
    tag: 'Infused Pre-Roll',
    blurb: 'Double-infused, double trouble. Two-strain blends rolled for a heavier hit.',
    image: '/products/twins.png',
  },
  {
    slug: 'pops',
    name: 'Pops',
    tag: 'Infused Mini',
    blurb: 'Bite-size infused minis in the candy-striped jar. Small format, full send.',
    image: '/products/pops.png',
  },
]
