'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// GA4, CONSENT-GATED (07 §3: privacy-preserving defaults). The tag loads
// ONLY after the visitor chooses "Accept All" on the cookie card — never on
// "Necessary Only", never before a choice. Reacts to jb:consent-changed so
// acceptance starts collection without a reload.
//
// The measurement id is PUBLIC by design (it ships in every visitor's HTML
// on any GA site); env override kept for a future property swap.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-39SKNEFHPB'
const CONSENT_KEY = 'jb-cookie-consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function loadGa() {
  if (window.gtag) return
  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  // manual page_view (send_page_view false): App Router navigations are
  // client-side and the config hit only covers the first document load
  window.gtag('config', GA_ID, { send_page_view: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

export default function Analytics() {
  const pathname = usePathname()
  const started = useRef(false)

  useEffect(() => {
    const startIfConsented = () => {
      try {
        if (localStorage.getItem(CONSENT_KEY) !== 'accepted') return
      } catch {
        return
      }
      if (!started.current) {
        started.current = true
        loadGa()
      }
    }
    startIfConsented()
    const onChange = () => startIfConsented()
    window.addEventListener('jb:consent-changed', onChange)
    return () => window.removeEventListener('jb:consent-changed', onChange)
  }, [])

  // one page_view per route (covers the first load too — gtag queues into
  // dataLayer even while the script is still fetching)
  useEffect(() => {
    if (!started.current || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return null
}
