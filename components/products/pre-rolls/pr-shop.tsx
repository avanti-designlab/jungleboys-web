import LineShop from '@/components/products/line-shop'

// Shop 1G Pre-Rolls — white room, GREEN cards, with the tube on a light pill
// inside: the tubes are dark and glossy, so they need a light ground to read
// against, and the card itself carries the green.
// Structure lives in <LineShop>; this file is the line's values.

export default function PrShop() {
  return (
    <LineShop
      id="pr-shop"
      filter={{ category: 'pre-rolls', subcategory: '1g-preroll' }}
      kicker="One gram, one strain"
      title="Shop"
      titleAccent="1G Pre-Rolls"
      panel="#f2faf4"
      ink="var(--pr-shop-ink)"
      accent="var(--pr-green)"
      accentHot="var(--pr-green)"
      cardFrom="var(--pr-green-hot)"
      cardMid="var(--pr-green)"
      cardTo="var(--pr-green-deep)"
      shotTo="#eef7f1"
      strainText="#c9f5d8"
      shadow="0 16px 44px rgba(6,60,30,0.26)"
      featuredBg="var(--pr-shop-ink)"
      cols={4}
    />
  )
}
