import LineShop from '@/components/products/line-shop'

// Shop 10PK Pre-Rolls — light blue room, blue cards.
// Structure lives in <LineShop>; this file is the line's values.

export default function TpShop() {
  return (
    <LineShop
      id="tp-shop"
      filter={{ category: 'pre-rolls', subcategory: '10-pack' }}
      kicker="Ten in every jar"
      title="Shop"
      titleAccent="10PK Pre-Rolls"
      panel="#f2f7fc"
      ink="var(--tp-shop-ink)"
      accent="#0d63a8"
      accentHot="var(--tp-cyan)"
      cardFrom="var(--tp-blue-hot)"
      cardMid="var(--tp-blue)"
      cardTo="var(--tp-blue-deep)"
      shotTo="#eef4fa"
      strainText="#9fd0ff"
      shadow="0 16px 44px rgba(10,50,100,0.28)"
      featuredBg="var(--tp-shop-ink)"
    />
  )
}
