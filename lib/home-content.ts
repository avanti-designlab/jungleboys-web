// Home page content config — mirrors the current Webflow home (source-of-truth
// policy). Hardcoded values are the DEFAULT/fallback; getHomeContent() overlays
// the editable versions from Storyblok (the `home` story) when connected.

import { getStory, assetUrl } from '@/lib/storyblok'


// Banner art contract: `image` = 16:9 (desktop), `imageMobile` = 9:16 (phones).
// imageMobile falls back to the desktop art until vertical crops are supplied.
export const HERO_SLIDES = [
  {
    kicker: 'JULY 13–31',
    title: 'JULY DEALS',
    cta: 'Learn more',
    href: '/710-deals',
    image: '/hero/july-deals-fireworks.webp',
    imageMobile: '/hero/july-deals-mobile.webp',
    alt: 'Fourth of July fireworks over the downtown LA skyline and the 6th Street Viaduct',
    // bright fireworks stay crisp; a bottom scrim keeps the headline legible
    // over the lit bridge arches
    overlay: 'scrim',
  },
  {
    kicker: 'NEW! ALL-IN-ONE',
    title: 'GAS TANK',
    cta: 'Shop now',
    // "Shop now" means the storefront, not the curated collection — /shop is
    // the commerce entry as of Phase 3. CMS-editable: a hero_slide blok's href
    // OVERRIDES this, so per-campaign retargeting (e.g. straight to a line
    // page) is a Storyblok edit, not a deploy.
    href: '/shop',
    image: '/hero/gas-tank-beach.webp',
    imageMobile: '/hero/gas-tank-mobile.webp',
    alt: 'Jungle Boys Gas Tank all-in-one vapes standing in the sand at the beach',
    overlay: false, // bright + crisp per Avanti
  },
  {
    kicker: '20 YEAR ANNIVERSARY EDITION',
    title: 'GOLD MYLARS',
    cta: 'Shop now',
    href: '/shop', // same rule as the Gas Tank slide above

    image: '/hero/gold-mylar-skyline.webp',
    imageMobile: '/hero/gold-mylar-mobile.webp',
    alt: 'Gold Jungle Boys mylar bag towering over the LA skyline at sunset',
    overlay: false, // art is bright + crisp on its own (Avanti)
  },
] as {
  kicker: string
  title: string
  cta: string
  href: string
  image: string
  imageMobile?: string
  alt: string
  /** dark readability overlay: true/undefined = full wash, 'scrim' = bottom
   *  gradient only (keeps image bright), false = none */
  overlay?: boolean | 'scrim'
}[]

export const QUICK_CARDS = [
  {
    title: 'Shop',
    // The SHOP card is the storefront door, not the collection — Products has
    // its own route in the nav. Like the hero slides, a quick_card blok href
    // in Storyblok overrides this fallback.
    href: '/shop',
    image: '/home/card-products.webp',
    alt: 'Jungle Boys products collage',
  },
  {
    title: 'Locations',
    href: '/locations',
    image: '/home/card-locations.webp',
    alt: 'Jungle Boys dispensary locations',
  },
  {
    title: 'Clothing',
    href: 'https://jungleboysclothing.com/',
    external: true,
    image: '/home/card-clothing.webp',
    alt: 'Jungle Boys clothing',
  },
  {
    title: 'Pheno Hunt',
    href: '/phenos',
    image: '/home/card-snl.webp',
    alt: 'Pheno hunt trichome macro',
  },
] as const

export const MARQUEE_TILES = [
  74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85,
].map((n) => ({
  image: `/home/tiles/tile-${n}.webp`,
  alt: `Jungle Boys product tile ${n}`,
}))

export const MEDIA_BANNER = {
  kicker: 'As seen on',
  title: 'The culture runs deep',
  copy: 'Documentaries, drops, and two decades of the hunt — straight from the jungle.',
  cta: 'Watch on Media',
  href: '/media',
  image: '/home/deals-bg.webp',
  alt: 'Jungle Boys media feature',
}

// ── Storyblok overlay ────────────────────────────────────────────────────────
// Editable via the `home` story: a body of `hero_slide` + `quick_card` bloks.
// Any missing field falls back to the hardcoded defaults above, and if the story
// isn't there at all (no token / not created yet) the defaults are used wholesale.

export type HeroSlide = (typeof HERO_SLIDES)[number]
export type QuickCard = (typeof QUICK_CARDS)[number]

type Blok = Record<string, unknown> & { component?: string }

function toOverlay(v: unknown): boolean | 'scrim' {
  if (v === 'scrim') return 'scrim'
  if (v === 'none' || v === false || v === '') return false
  return true
}

export async function getHomeContent(): Promise<{ heroSlides: HeroSlide[]; quickCards: QuickCard[] }> {
  const story = await getStory('home', 'published')
  const body = (story?.content as { body?: unknown } | undefined)?.body
  if (!Array.isArray(body)) return { heroSlides: [...HERO_SLIDES], quickCards: [...QUICK_CARDS] }

  const bloks = body as Blok[]
  const str = (v: unknown, fb: string) => (typeof v === 'string' && v.trim() ? v : fb)

  const heroSlides: HeroSlide[] = bloks
    .filter((b) => b.component === 'hero_slide')
    .map((b, i) => {
      const d = HERO_SLIDES[i] ?? HERO_SLIDES[0]
      return {
        kicker: str(b.kicker, d.kicker),
        title: str(b.title, d.title),
        cta: str(b.cta, d.cta),
        href: str(b.href, d.href),
        image: assetUrl(b.image, d.image),
        imageMobile: assetUrl(b.image_mobile, d.imageMobile ?? d.image),
        alt: str(b.alt, d.alt),
        overlay: b.overlay === undefined ? d.overlay : toOverlay(b.overlay),
      }
    })

  const quickCards: QuickCard[] = bloks
    .filter((b) => b.component === 'quick_card')
    .map((b, i) => {
      const d = QUICK_CARDS[i] ?? QUICK_CARDS[0]
      return {
        title: str(b.title, d.title),
        href: str(b.href, d.href),
        image: assetUrl(b.image, d.image),
        alt: str(b.alt, d.alt),
        external: typeof b.external === 'boolean' ? b.external : (d as QuickCard & { external?: boolean }).external,
      } as QuickCard
    })

  return {
    heroSlides: heroSlides.length ? heroSlides : [...HERO_SLIDES],
    quickCards: quickCards.length ? quickCards : [...QUICK_CARDS],
  }
}
