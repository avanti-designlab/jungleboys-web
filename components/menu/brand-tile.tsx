import Link from 'next/link'
import { BRAND_LOGOS, brandAnchor } from '@/lib/brands'

// One quick-shop brand tile — shared by the storefront's Shop-by-Brand band
// and the Brands page's own quick-shop row, so the logo/wordmark rule and the
// anchor slugs cannot drift. Logo when BRAND_LOGOS has one; the brand NAME as
// a Bebas wordmark until then — never an invented logo.
export default function BrandTile({
  brand,
  href,
  className = '',
}: {
  brand: string
  href: string
  className?: string
}) {
  const slug = brandAnchor(brand)
  const logo = BRAND_LOGOS[slug]
  return (
    <Link
      href={href}
      data-brand-tile={slug}
      className={`flex aspect-[7/4] items-center justify-center rounded-2xl bg-white px-3 text-black shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand logo
        <img src={logo} alt={brand} className="max-h-[70%] max-w-[85%] object-contain" />
      ) : (
        <span className="font-display text-center text-[19px] uppercase leading-[0.95]">{brand}</span>
      )}
    </Link>
  )
}
