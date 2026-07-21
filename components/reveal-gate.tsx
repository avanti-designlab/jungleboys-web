'use client'

import { useEffect } from 'react'

// The banner intro animations (giant wordmark letters dropping in, hero zoom)
// play on mount. On a first visit that happens *underneath* the loading intro +
// age gate, so they finish before the visitor can see them — on refresh (gate
// already passed) they're visible. This controller holds those animations until
// the intro + gate have cleared, then adds `jb-reveal` to <html> to release them.
// Lives in the root layout, so it runs once; later client-side navigations
// already have `jb-reveal` set and play their banners immediately.
export default function RevealGate() {
  useEffect(() => {
    const html = document.documentElement
    if (html.classList.contains('jb-reveal')) return
    const reveal = () => html.classList.add('jb-reveal')

    let gateVerified = false
    let introDone = false
    try {
      gateVerified = !!localStorage.getItem('jb-age-gate')
    } catch {}
    try {
      introDone = sessionStorage.getItem('jb-intro-done') === '1'
    } catch {}

    // Nothing is covering the page — reveal right away (refresh / return visit).
    if (gateVerified && introDone) {
      reveal()
      return
    }

    const onGate = () => reveal()
    // If the gate is already passed it never shows, so release once the intro ends.
    const onIntro = () => {
      if (gateVerified) reveal()
    }
    window.addEventListener('jb:gate-passed', onGate, { once: true })
    window.addEventListener('jb:intro-done', onIntro, { once: true })

    // Safety net: never leave the banner hidden if an event doesn't fire.
    const t = window.setTimeout(reveal, 5000)

    return () => {
      window.removeEventListener('jb:gate-passed', onGate)
      window.removeEventListener('jb:intro-done', onIntro)
      window.clearTimeout(t)
    }
  }, [])

  return null
}
