// Site-wide navigation + brand config. Edit here, never inline in components.

// ON-DOMAIN. These were served from the Webflow CDN, which is the very host the
// rebuild replaces: the day that Webflow site is torn down, the new site's own
// header logo 404s. Vector kept as vector — the header renders it at a different
// size at every breakpoint.
export const BRAND_ASSETS = {
  logoWhite: '/brand/jb-stacked-white.svg',
  logoBlack: '/brand/jb-stacked-black.svg',
} as const

export const NAV_LINKS = [
  { label: 'Products', href: '/products' }, // curated JB collection (Phase 2 landings)
  { label: 'Locations', href: '/locations' },
  { label: 'Phenos', href: '/phenos' },
  { label: 'Media', href: '/media' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Product Finder', href: '/find-jb-products' },
  { label: 'Clothing', href: 'https://jungleboysclothing.com/', external: true },
  { label: 'Contact', href: '/contact' },
] as const

// Full-screen menu — three-column layout matching the live site's overlay
export const MENU_COLUMNS: { label: string; href: string; external?: boolean }[][] = [
  [
    { label: 'Media', href: '/media' },
    { label: 'Phenos', href: '/phenos' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Contact', href: '/contact' },
  ],
  [
    // Shop and Products are two different destinations (Avanti, 2026-07-29):
    // Products is the curated JB-only collection; Shop is live dispensary
    // inventory. /shop exists as of Phase 3, so the entry the 2026-07-29 note
    // promised is now here — first, with its own href, so the two anchors no
    // longer collide the way the old double-/products listing did.
    { label: 'Shop', href: '/shop' },
    { label: 'Products', href: '/products' },
    { label: 'Clothing', href: 'https://jungleboysclothing.com/', external: true },
  ],
  [
    { label: 'Locations', href: '/locations' },
    { label: 'Product Finder', href: '/find-jb-products' },
    { label: 'Rewards', href: '/rewards' },
  ],
]

export const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys' },
  { label: 'Drops IG', href: 'https://www.instagram.com/jungleboysdrops' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms' },
  { label: 'X', href: 'https://x.com/jungleboysdrops' },
  { label: 'Facebook', href: 'https://www.facebook.com/JungleBoysDrops/' },
  { label: 'Weedmaps', href: 'https://weedmaps.com/brands/jungleboys/products' },
] as const

// Exact license row from the live footer (includes the FL MMTC license)
export const LICENSE_NUMBERS = [
  'C10-0001146-LIC',
  'C10-0000103-LIC',
  'C12-0000542-LIC',
  'C10-0000904-LIC',
  'MMTC-2019-00015',
] as const

// Footer nav row (matches live footer)
export const FOOTER_NAV = [
  { label: 'Media', href: '/media' },
  { label: 'Blog', href: '/blog' },
  { label: 'Phenos', href: '/phenos' },
  { label: 'Clothing', href: 'https://jungleboysclothing.com/', external: true },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Contact', href: '/contact' },
  { label: 'Locations', href: '/locations' },
  // FAQ was reachable ONLY from sitemap.xml — it sat in a dead export that
  // nothing imported, so it had zero internal links from any rendered page. A
  // page a crawler can only reach via the sitemap gets crawled slowly and
  // ranks accordingly. (That export is now deleted.)
  { label: 'FAQ', href: '/faq' },
] as const

export const BRAND = {
  name: 'Jungle Boys',
  tagline: 'Playing With Fire®',
  since: 'Since 2006',
} as const
