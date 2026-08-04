// Brand helpers shared by the Brands page and the storefront's Shop-by-Brand
// quick-shop band — one slug rule so tile anchors always hit page sections.

export const brandAnchor = (brand: string): string =>
  brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Brand logos land in public/shop/brands/<anchor-slug>.<ext> and get wired
// here (same pattern as CATEGORY_ICONS). Until a logo exists the quick-shop
// tile renders the brand NAME as a wordmark — never an invented logo.
export const BRAND_LOGOS: Record<string, string> = {}
