// Home page content config — mirrors the current Webflow home (source-of-truth
// policy). Interim hardcode; moves to Storyblok when the home story is modeled.

const CDN = 'https://cdn.prod.website-files.com/6981ad8672f6252d7d7bb320'

// Banner art contract: `image` = 16:9 (desktop), `imageMobile` = 9:16 (phones).
// imageMobile falls back to the desktop art until vertical crops are supplied.
export const HERO_SLIDES = [
  {
    kicker: 'JULY 13–31',
    title: 'JULY DEALS',
    cta: 'Learn more',
    href: '/710-deals',
    image: `${CDN}/69e7ee53bc94e5cc8f331c78_JB%20April%20Deals%20BG%20Desktop.png`,
    imageMobile: undefined,
    alt: 'July deals — premium flower background',
  },
  {
    kicker: 'NEW! ALL-IN-ONE',
    title: 'GASTANK',
    cta: 'Shop now',
    href: '/products',
    image: `${CDN}/69b9a86185994e827f464b24_JB%20AIO%20GAS%20TANK%20WEB%20BANNER%20Horizontal%201.jpg`,
    imageMobile: undefined,
    alt: 'GasTank all-in-one vape banner',
  },
  {
    kicker: '20 YEAR ANNIVERSARY EDITION',
    title: 'GOLD MYLARS',
    cta: 'Shop now',
    href: '/products',
    image: `${CDN}/69b9a8dd0896bcf8850494fb_JB%20GOLD%20MYLAR%20WEB%20BANNER%20Horizontal%201.jpg`,
    imageMobile: undefined,
    alt: 'Gold Mylars 20 year anniversary edition banner',
  },
] as { kicker: string; title: string; cta: string; href: string; image: string; imageMobile?: string; alt: string }[]

export const QUICK_CARDS = [
  {
    title: 'Shop',
    href: '/products',
    image: `${CDN}/69b99e2a0a6ed0851aacc074_JB_Website_Product1_2X3.jpg`,
    alt: 'Jungle Boys products collage',
  },
  {
    title: 'Locations',
    href: '/locations',
    image: `${CDN}/69b34477ef35cdcbdfd3580c_JB%20Locations%20Image.jpg`,
    alt: 'Jungle Boys dispensary locations',
  },
  {
    title: 'Clothing',
    href: 'https://jungleboysclothing.com/',
    external: true,
    image: `${CDN}/69b9ab57cce87b1cc19d0add_jbclothing-p-800.jpg`,
    alt: 'Jungle Boys clothing',
  },
  {
    title: 'Phenos',
    href: '/phenos',
    image: `${CDN}/69b3446029edcd55bd76425d_JBC%20Image.jpg`,
    alt: 'Pheno hunt macro flower',
  },
] as const

export const MARQUEE_TILES = [
  74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85,
].map((n) => ({
  image:
    n === 83
      ? `${CDN}/699d79a8997e77f11b5cf575_Rectangle%2083.png`
      : `${CDN}/699d78${
          {
            74: '19c50634032ae3d380', 75: '193cbaf6cef823a9da', 76: '191f0ee4764fa8165a',
            77: '1984b05d522a53f889', 78: '1999dce0a1ed9448a5', 79: '19b1f6f889dde1a19a',
            80: '182dfae27cfc1efc81', 81: '1947a1c40aca3bacd4', 82: '19050c538096d226f9',
            84: '193f928dc8ff629e27', 85: '189871d6b47f8e36a2',
          }[n]
        }_Rectangle%20${n}.png`,
  alt: `Jungle Boys product tile ${n}`,
}))

export const MEDIA_BANNER = {
  kicker: 'As seen on',
  title: 'The culture runs deep',
  copy: 'Documentaries, drops, and two decades of the hunt — straight from the jungle.',
  cta: 'Watch on Media',
  href: '/media',
  image: `${CDN}/69b3324153cf4c36d0ced471_SNL%205x.1.jpg`,
  alt: 'Jungle Boys media feature',
}
