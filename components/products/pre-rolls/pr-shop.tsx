import LineShop from '@/components/products/line-shop'

// Shop 1G Pre-Rolls — white room, GREEN cards, with the tube on a light pill
// inside: the tubes are dark and glossy, so they need a light ground to read
// against, and the card itself carries the green.
// Structure lives in <LineShop>; this file is the line's values.

export default function PrShop() {
  return (
    <LineShop
      id="pr-shop"
      line="1g-pre-rolls"
      kicker="One gram, one strain"
      title="Shop"
      titleAccent="1G Pre-Rolls"
      panel="#f2faf4"
      ink="var(--pr-shop-ink)"
      // the kicker renders in `accent` on the #f2faf4 panel, where --pr-green is
      // 3.21:1. The deep end of the same ramp is the same hue and clears AA.
      accent="var(--pr-green-deep)"
      accentHot="var(--pr-green)"
      cardFrom="#1a1e1b"
      cardMid="#0d100e"
      cardTo="#050706"
      shotTo="#eef7f1"
      strainText="#8fe6ac"
      shadow="0 16px 44px rgba(0,0,0,0.45)"
      featuredBg="var(--pr-shop-ink)"
      cols={4}
    />
  )
}
