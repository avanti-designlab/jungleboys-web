// Shop-page banners — CMS-EDITABLE BY REQUIREMENT, code fallbacks only.
//
// The recorded Phase 3 rule (2026-07-30): every banner on the shop / store
// surfaces is modelled as Storyblok bloks with per-field code fallbacks, never
// hardcoded — banners are promotional and time-dated, exactly the content that
// must not require a deploy. Same overlay pattern as getHomeContent().
//
// Structure (Avanti's redesign brief, 2026-08-03): a hero TRIO — one large
// tile left, two stacked right — plus promo slots that sit BETWEEN the
// category shelves for brand discounts, JB deals, etc.
//
// The fallbacks are deliberately EVERGREEN navigation promos (drops / deals /
// rewards / brands), not invented discounts: a fabricated "20% off" in a code
// fallback is a compliance bug, and promo copy with dates belongs in the CMS
// where it can be taken down without a deploy.
//
// Hrefs support a `@store/` prefix meaning "relative to the store the visitor
// is browsing" — `@store/deals` renders as /menu/california/<slug>/deals. One
// banner set serves all four stores without hardcoding any of them.

import { getStory, assetUrl } from '@/lib/storyblok'

export interface ShopBanner {
  kicker: string
  title: string
  cta: string
  href: string // absolute path or @store/<surface>
  image: string
  alt: string
}

export interface ShopBanners {
  /** hero trio: [0] large left, [1] stack top right, [2] stack bottom right */
  hero: [ShopBanner, ShopBanner, ShopBanner]
  /** in-feed promos, inserted between category shelves in order */
  promos: ShopBanner[]
}

const HERO_FALLBACK: [ShopBanner, ShopBanner, ShopBanner] = [
  {
    kicker: 'Every Friday',
    title: 'Fresh Drops',
    cta: 'See this week’s drop',
    href: '@store/drops',
    image: '/hero/gold-mylar-skyline.webp',
    alt: 'Gold Jungle Boys mylar bag towering over the LA skyline at sunset',
  },
  {
    kicker: 'Live discounts',
    title: 'Deals',
    cta: 'Shop deals',
    href: '@store/deals',
    image: '/home/deals-bg.webp',
    alt: 'Jungle Boys deals',
  },
  {
    kicker: 'Playing with fire',
    title: 'PWF Rewards',
    cta: 'Earn on every visit',
    href: '/rewards',
    image: '/hero/gas-tank-beach.webp',
    alt: 'Jungle Boys Gas Tank all-in-one vapes standing in the sand at the beach',
  },
]

const PROMO_FALLBACK: ShopBanner[] = [
  {
    kicker: 'Everything on the shelf',
    title: 'Shop by brand',
    cta: 'Browse brands',
    href: '@store/brands',
    image: '/home/tiles/tile-77.webp',
    alt: 'Jungle Boys product tile collage',
  },
  {
    kicker: 'The collection',
    title: 'Jungle Boys lines',
    cta: 'Explore the lines',
    href: '/products',
    image: '/home/card-products.webp',
    alt: 'Jungle Boys products collage',
  },
]

/** Resolve a banner href against the store being browsed. */
export function bannerHref(href: string, storeSlug: string): string {
  return href.startsWith('@store/')
    ? `/menu/california/${storeSlug}/${href.slice('@store/'.length)}`
    : href
}

type Blok = Record<string, unknown> & { component?: string }

export async function getShopBanners(): Promise<ShopBanners> {
  const story = await getStory('shop', 'published')
  const body = (story?.content as { body?: unknown } | undefined)?.body
  if (!Array.isArray(body)) return { hero: HERO_FALLBACK, promos: PROMO_FALLBACK }

  const str = (v: unknown, fb: string) => (typeof v === 'string' && v.trim() ? v : fb)
  const overlay = (b: Blok | undefined, d: ShopBanner): ShopBanner =>
    b
      ? {
          kicker: str(b.kicker, d.kicker),
          title: str(b.title, d.title),
          cta: str(b.cta, d.cta),
          href: str(b.href, d.href),
          image: assetUrl(b.image, d.image),
          alt: str(b.alt, d.alt),
        }
      : d

  const bloks = body as Blok[]
  const heroBloks = bloks.filter((b) => b.component === 'shop_banner')
  const promoBloks = bloks.filter((b) => b.component === 'shop_promo')

  return {
    hero: [
      overlay(heroBloks[0], HERO_FALLBACK[0]),
      overlay(heroBloks[1], HERO_FALLBACK[1]),
      overlay(heroBloks[2], HERO_FALLBACK[2]),
    ],
    promos: promoBloks.length
      ? promoBloks.map((b, i) => overlay(b, PROMO_FALLBACK[i % PROMO_FALLBACK.length]))
      : PROMO_FALLBACK,
  }
}
