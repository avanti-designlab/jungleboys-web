// Site-wide navigation + brand config. Edit here, never inline in components.

const CDN = 'https://cdn.prod.website-files.com/6981ad8672f6252d7d7bb320'

export const BRAND_ASSETS = {
  logoWhite: `${CDN}/69bd11bc7c3329f84fc63900_JB-Stacked-Logo-R-White.svg`,
  logoBlack: `${CDN}/69bd11bc658e8d5d5b06e952_JB-Stacked-Logo-R-Black.svg`,
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
    { label: 'Products', href: '/products' },
    { label: 'Clothing', href: 'https://jungleboysclothing.com/', external: true },
    { label: 'Rewards', href: '/rewards' },
    { label: 'Profile', href: '/profile' },
  ],
  [
    { label: 'Locations', href: '/locations' },
    { label: 'Product Finder', href: '/find-jb-products' },
  ],
]

export const FOOTER_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Verify Product', href: '/verify' },
] as const

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
  { label: 'Phenos', href: '/phenos' },
  { label: 'Clothing', href: 'https://jungleboysclothing.com/', external: true },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Contact', href: '/contact' },
  { label: 'Locations', href: '/locations' },
] as const

export const BRAND = {
  name: 'Jungle Boys',
  tagline: 'Playing With Fire®',
  since: 'Since 2006',
} as const
