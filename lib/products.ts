// The curated Jungle Boys product lines (the "Products" collection — JB-only,
// separate from the Dutchie-powered Shop). Matches the Figma product-homepage
// grid: nine lines, each links to /products/<slug>. Images are the exact card
// cut-outs exported from the Figma product frames. No API — static collection.

export type ProductLine = {
  slug: string
  name: string
  tag: string
  blurb: string
  image: string
  isNew?: boolean
}

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'all-in-one',
    name: 'All-In-One',
    tag: 'Disposable',
    blurb: 'Ready-to-go all-in-one devices — charged, filled, and done. No cart, no hassle.',
    image: '/products/all-in-one.png',
    isNew: true,
  },
  {
    slug: 'hash-hole',
    name: 'Hash Hole',
    tag: 'Infused Pre-Roll',
    blurb: 'Indoor flower wrapped around a molten hash-rosin core. The one that started the frenzy.',
    image: '/products/hash-hole.png',
    isNew: true,
  },
  {
    slug: 'twins',
    name: 'Twins',
    tag: 'Infused Pre-Roll',
    blurb: 'Double-infused, double trouble. Two-strain blends rolled for a heavier hit.',
    image: '/products/twins.png',
    isNew: true,
  },
  {
    slug: 'pops',
    name: 'Pops',
    tag: 'Infused Mini',
    blurb: 'Bite-size infused minis in the candy-striped jar. Small format, full send.',
    image: '/products/pops.png',
  },
  {
    slug: 'premium-flower',
    name: 'Flower',
    tag: 'Indoor Flower',
    blurb: 'Top-shelf, hand-trimmed indoor — sealed fresh in the gold pouch.',
    image: '/products/premium-flower.png',
  },
  {
    slug: 'pre-rolls',
    name: 'Pre-Rolls',
    tag: 'Infused Pre-Roll',
    blurb: 'Single-strain infused pre-rolls, packed with the same flower we jar. Spark and go.',
    image: '/products/pre-rolls.png',
  },
  {
    slug: '10-pack-prerolls',
    name: '10PK Pre-Rolls',
    tag: 'Multipack',
    blurb: 'Ten mini pre-rolls to a pack — the everyday carry for when one is never enough.',
    image: '/products/10-pack-prerolls.png',
  },
  {
    slug: 'rosin',
    name: 'Rosin',
    tag: 'Solventless',
    blurb: 'Solventless live rosin, pressed from fresh-frozen flower. Pure, full-spectrum flavor.',
    image: '/products/rosin.png',
  },
  {
    slug: 'orc',
    name: 'ORC',
    tag: 'Concentrate',
    blurb: 'Our concentrate line — potent, terp-forward extracts for the connoisseur.',
    image: '/products/orc.png',
  },
]
