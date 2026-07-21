// The curated Jungle Boys product lines (the "Products" collection — JB-only,
// separate from the Dutchie-powered Shop). Matches the Figma product-homepage
// grid: nine lines, each links to /products/<slug>. Images are the exact card
// cut-outs exported from the Figma product frames. No API — static collection.

// One item that pops out from behind the product on hover. tx/ty are the resting
// transform (relative to the item's own box, like the original nug pop), w is its
// width as a % of the stage.
export type PopOut = { src: string; tx: string; ty: string; rot: number; w: number }

export type ProductLine = {
  slug: string
  name: string
  tag: string
  blurb: string
  image: string
  isNew?: boolean
  popOut?: PopOut[] // items that pop out to the sides on hover (buds, pre-rolls…)
  popcorn?: string[] // images that burst up from the bottom, popcorn-style, on hover
  splash?: string // a splash/liquid overlay that pours over the product on hover
}

// Shared pop-out layouts, reused across products.
const PRE = '/products/fx/pre-roll.png'
// A single pre-roll popping from each side (1G Pre-Rolls — same image both sides).
const ONE_EACH_SIDE: PopOut[] = [
  { src: PRE, tx: '-122%', ty: '-30%', rot: -15, w: 20 },
  { src: PRE, tx: '22%', ty: '-30%', rot: 15, w: 20 },
]
// Two pre-rolls fanned out each side (Twins — 2 per pack, shown as pairs).
const TWO_EACH_SIDE: PopOut[] = [
  { src: PRE, tx: '-150%', ty: '-46%', rot: -22, w: 18 },
  { src: PRE, tx: '-120%', ty: '-2%', rot: -9, w: 18 },
  { src: PRE, tx: '50%', ty: '-46%', rot: 22, w: 18 },
  { src: PRE, tx: '20%', ty: '-2%', rot: 9, w: 18 },
]
const POPS_NUGS = [1, 2, 3, 4, 5, 6].map((n) => `/products/fx/pops-${n}.png`)

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: 'all-in-one',
    name: 'All-In-One Gas Tanks',
    tag: 'Vapes',
    blurb: 'Ready-to-go all-in-one devices — charged, filled, and done. No cart, no hassle.',
    image: '/products/v10/all-in-one.png',
    isNew: true,
    splash: '/products/fx/honey-splash.png',
  },
  {
    slug: 'hash-hole',
    name: 'Hash Hole',
    tag: 'Infused Pre-Roll',
    blurb: 'Indoor flower wrapped around a molten hash-rosin core. The one that started the frenzy.',
    image: '/products/v10/hash-hole.png',
    isNew: true,
  },
  {
    slug: 'twins',
    name: 'Twins',
    tag: '2-PK Pre-Rolls',
    blurb: 'Double-infused, double trouble. Two-strain blends rolled for a heavier hit.',
    image: '/products/v10/twins.png',
    isNew: true,
    popOut: TWO_EACH_SIDE,
  },
  {
    slug: 'pops',
    name: 'Pops',
    tag: 'Premium Indoor Smalls',
    blurb: 'Bite-size infused minis in the candy-striped jar. Small format, full send.',
    image: '/products/v10/pops.png',
    popcorn: POPS_NUGS,
  },
  {
    slug: 'premium-flower',
    name: 'Flower Gold Mylars',
    tag: 'Premium Indoor Flower',
    blurb: 'Top-shelf, hand-trimmed indoor — sealed fresh in the gold pouch.',
    image: '/products/v10/premium-flower.png',
    popOut: [
      { src: '/phenos/nug-1.png', tx: '-116%', ty: '-30%', rot: -16, w: 42 },
      { src: '/phenos/nug-4.png', tx: '16%', ty: '-34%', rot: 15, w: 42 },
    ],
  },
  {
    slug: 'pre-rolls',
    name: 'Pre-Rolls',
    tag: '1G Pre-Rolls',
    blurb: 'Single-strain infused pre-rolls, packed with the same flower we jar. Spark and go.',
    image: '/products/v10/pre-rolls.png',
    popOut: ONE_EACH_SIDE,
  },
  {
    slug: '10-pack-prerolls',
    name: '10PK Pre-Rolls',
    tag: 'Multipack',
    blurb: 'Ten mini pre-rolls to a pack — the everyday carry for when one is never enough.',
    image: '/products/v10/10-pack-prerolls.png',
  },
  {
    slug: 'rosin',
    name: 'Rosin',
    tag: 'Solventless Live Rosin',
    blurb: 'Solventless live rosin, pressed from fresh-frozen flower. Pure, full-spectrum flavor.',
    image: '/products/v10/rosin.png',
  },
  {
    slug: 'orc',
    name: 'Oil Refinery Co.',
    tag: 'Concentrates',
    blurb: 'Our concentrate line — potent, terp-forward extracts for the connoisseur.',
    image: '/products/v10/orc.png',
  },
]
