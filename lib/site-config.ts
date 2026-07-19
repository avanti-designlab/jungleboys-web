// Site-wide navigation + brand config. Edit here, never inline in components.

export const NAV_LINKS = [
  { label: 'Products', href: '/products' }, // curated JB collection (Phase 2 landings)
  { label: 'Locations', href: '/locations' },
  { label: 'Phenos', href: '/phenos' },
  { label: 'Media', href: '/media' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Product Finder', href: '/find-jb-products' },
  { label: 'Contact', href: '/contact' },
] as const

export const FOOTER_LINKS = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Verify Product', href: '/verify' },
] as const

export const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys' },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms' },
  { label: 'X', href: 'https://x.com/jungleboys' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@jungleboys' },
] as const

export const LICENSE_NUMBERS = [
  'C10-0000125-LIC',
  'C10-0000103-LIC',
  'C10-0000904-LIC',
  'C10-0001146-LIC',
  'C12-0000542-LIC',
] as const

export const BRAND = {
  name: 'Jungle Boys',
  tagline: 'Playing With Fire®',
  since: 'Since 2006',
} as const
