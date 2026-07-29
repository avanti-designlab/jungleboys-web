import LineShop from '@/components/products/line-shop'

// Shop Twins — the opposite colour to the rest of the page: a light room
// against all that black, with the cards carrying the Twins red. The tubes are
// dark and glossy and need a light ground to read against.
// Structure lives in <LineShop>; this file is the line's values.

export default function TwShop() {
  return (
    <LineShop
      id="tw-shop"
      filter={{ category: 'pre-rolls', subcategory: 'twins-2pack' }}
      kicker="Two in every tube"
      title="Shop"
      titleAccent="Twins"
      panel="#fdf3f3"
      ink="var(--tw-shop-ink)"
      accent="var(--tw-red)"
      accentHot="var(--tw-red-hot)"
      cardFrom="var(--tw-red-hot)"
      cardMid="var(--tw-red)"
      cardTo="var(--tw-red-deep)"
      shotTo="#faeced"
      strainText="#ffd2d4"
      shadow="0 16px 44px rgba(100,10,16,0.28)"
      featuredBg="var(--tw-navy)"
    />
  )
}
