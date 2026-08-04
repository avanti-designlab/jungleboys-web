'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import StorePicker from './store-picker'
import { isAgeVerified } from './age-gate'
import { readStore } from '@/lib/store-selection'

/** Routes that cannot render honestly without knowing the store. */
const COMMERCE = [/^\/menu(\/|$)/, /^\/shop(\/|$)/, /^\/drops(\/|$)/, /^\/specials(\/|$)/, /^\/strains(\/|$)/, /^\/brands(\/|$)/]

// Opens the location picker when a commerce surface is reached without a store
// chosen. Deliberately NOT on every first visit to the site: the age gate is
// already an entry modal, and stacking a second one in front of the homepage
// makes the brand's first impression two dialogs. A visitor browsing /products
// or /rewards has no need to pick a store yet.
//
// Sequenced BEHIND the age gate (z-1000 vs this at z-1100 — the picker would
// otherwise render on top of an unanswered 21+ gate, which is a compliance
// surface). It waits for verification rather than racing it.
export default function StorePickerMount() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  // Close on ARRIVAL, not on click: StorePicker keeps itself open through
  // router.push so the page behind never flashes; this effect is the actual
  // close. Runs before the open-effect below, which re-opens where required
  // (e.g. landing back on /shop).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!pathname) return
    // /shop is the storefront DOOR, and the picker IS the door (Avanti,
    // 2026-08-03): every Shop button lands here, the modal opens — even for a
    // visitor with a saved store — and choosing routes into that store's menu.
    // The page underneath stays the crawlable no-JS fallback. Other commerce
    // routes keep the quieter rule: open only when no store is chosen yet.
    const shopEntry = pathname === '/shop'
    // /deals and /drops are the same kind of DOOR (Avanti, 2026-08-04: "lead
    // to the store picker popup, once they select location, routes to the
    // deals page") — except a saved CA store skips the modal entirely:
    // StoreForward on the page is already replacing the route with that
    // store's surface.
    const doorEntry = pathname === '/deals' || pathname === '/drops'
    if (doorEntry && readStore()?.state === 'CA') return
    if (!shopEntry && !doorEntry) {
      if (!COMMERCE.some((re) => re.test(pathname))) return
      if (readStore()) return
    }

    // Poll briefly for age verification rather than assuming it: the gate
    // resolves asynchronously and a visitor may answer it seconds later.
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      if (!isAgeVerified()) { window.setTimeout(tick, 400); return }
      if (shopEntry || doorEntry || !readStore()) setOpen(true)
    }
    tick()
    return () => { cancelled = true }
  }, [pathname])

  // Any control anywhere can request the picker — the header's store chip, a
  // "change location" link, an empty menu state. One event, no context provider
  // threaded through the tree.
  useEffect(() => {
    const onRequest = () => setOpen(true)
    window.addEventListener('jb:pick-store', onRequest)
    return () => window.removeEventListener('jb:pick-store', onRequest)
  }, [])

  // picking from a door routes into that store's matching surface
  const dest = pathname === '/deals' ? ('deals' as const) : pathname === '/drops' ? ('drops' as const) : undefined
  return <StorePicker open={open} onClose={close} dest={dest} />
}
