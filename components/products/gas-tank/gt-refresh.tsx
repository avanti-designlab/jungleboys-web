'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Why this exists: arriving here by CLICKING a link behaved differently from
// arriving by refresh. On a refresh this page's images are already in the
// browser cache, so every ScrollTrigger measures a settled layout. On a
// client-side navigation they are fetched after mount — the device art and the
// thirteen shop shots are unique to this route — so the page grows underneath
// triggers that have already computed their start/end offsets, and the pinned
// sections end up anchored to the wrong scroll positions.
//
// Re-measuring once the real layout exists fixes it. Cheap: ScrollTrigger.refresh
// is idempotent and this runs a handful of times on mount only.
export default function GtRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    const timers = [200, 900, 2200].map((ms) => window.setTimeout(refresh, ms))
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh).catch(() => {})

    // and once the last late image actually lands
    const pending = Array.from(document.images).filter((i) => !i.complete)
    let left = pending.length
    const onSettled = () => {
      if (--left <= 0) refresh()
    }
    pending.forEach((i) => {
      i.addEventListener('load', onSettled, { once: true })
      i.addEventListener('error', onSettled, { once: true })
    })

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('load', refresh)
      pending.forEach((i) => {
        i.removeEventListener('load', onSettled)
        i.removeEventListener('error', onSettled)
      })
    }
  }, [])

  return null
}
