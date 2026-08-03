import CommerceHeader from '@/components/commerce/commerce-header'

// /shop (entry + PDPs) shares the same ecom shell as the /menu surfaces.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommerceHeader />
      {children}
    </>
  )
}
