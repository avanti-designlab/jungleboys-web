import CommerceHeader from '@/components/commerce/commerce-header'

// The shop pages are their own ecom shell (Avanti, 2026-08-03): every /menu
// surface shares the sticky commerce header. SiteNav stands down on these
// routes — see the guard in components/site-nav.tsx.
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommerceHeader />
      {children}
    </>
  )
}
