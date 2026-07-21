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
  nugs?: [string, string] // two nugs that pop out each side of the product on hover
}

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'all-in-one',
    name: 'All-In-One Gas Tanks',
    tag: 'Vapes',
    blurb: 'Ready-to-go all-in-one devices — charged, filled, and done. No cart, no hassle.',
    image: '/products/v3/all-in-one.png',
    isNew: true,
  },
  {
    slug: 'hash-hole',
    name: 'Hash Hole',
    tag: 'Infused Pre-Roll',
    blurb: 'Indoor flower wrapped around a molten hash-rosin core. The one that started the frenzy.',
    image: '/products/v3/hash-hole.png',
    isNew: true,
  },
  {
    slug: 'twins',
    name: 'Twins',
    tag: '2-PK Pre-Rolls',
    blurb: 'Double-infused, double trouble. Two-strain blends rolled for a heavier hit.',
    image: '/products/v3/twins.png',
    isNew: true,
  },
  {
    slug: 'pops',
    name: 'Pops',
    tag: 'Premium Indoor Smalls',
    blurb: 'Bite-size infused minis in the candy-striped jar. Small format, full send.',
    image: '/products/v3/pops.png',
  },
  {
    slug: 'premium-flower',
    name: 'Flower Gold Mylars',
    tag: 'Premium Indoor Flower',
    blurb: 'Top-shelf, hand-trimmed indoor — sealed fresh in the gold pouch.',
    image: '/products/v3/premium-flower.png',
    nugs: ['/phenos/nug-1.png', '/phenos/nug-4.png'],
  },
  {
    slug: 'pre-rolls',
    name: 'Pre-Rolls',
    tag: '1G Pre-Rolls',
    blurb: 'Single-strain infused pre-rolls, packed with the same flower we jar. Spark and go.',
    image: '/products/v3/pre-rolls.png',
  },
  {
    slug: '10-pack-prerolls',
    name: '10PK Pre-Rolls',
    tag: 'Multipack',
    blurb: 'Ten mini pre-rolls to a pack — the everyday carry for when one is never enough.',
    image: '/products/v3/10-pack-prerolls.png',
  },
  {
    slug: 'rosin',
    name: 'Rosin',
    tag: 'Solventless Live Rosin',
    blurb: 'Solventless live rosin, pressed from fresh-frozen flower. Pure, full-spectrum flavor.',
    image: '/products/v3/rosin.png',
  },
  {
    slug: 'orc',
    name: 'Oil Refinery Co.',
    tag: 'Concentrates',
    blurb: 'Our concentrate line — potent, terp-forward extracts for the connoisseur.',
    image: '/products/v3/orc.png',
  },
]
