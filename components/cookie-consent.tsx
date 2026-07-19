'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isAgeVerified } from './age-gate'

// Small cookie-consent card, bottom-left (07 §3: privacy-preserving defaults —
// nothing non-essential loads unless accepted). Analytics (GA4, Phase 1+) must
// check localStorage 'jb-cookie-consent' === 'accepted' before initializing.
// Appears only after the age gate has been passed.

const KEY = 'jb-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return
    } catch {
      return
    }
    // wait for the age gate to be dismissed before appearing
    const t = setInterval(() => {
      if (isAgeVerified()) {
        setVisible(true)
        clearInterval(t)
      }
    }, 800)
    return () => clearInterval(t)
  }, [])

  if (!visible) return null

  function choose(value: 'accepted' | 'declined') {
    try {
      localStorage.setItem(KEY, value)
    } catch {}
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="menu-socials fixed bottom-4 left-4 z-[900] w-[290px] rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-4 text-white shadow-2xl backdrop-blur-md"
    >
      <p className="text-[11px] leading-relaxed text-white/70">
        We use cookies to improve your experience and analyze site traffic.{' '}
        <Link href="/privacy" className="underline hover:text-[var(--color-accent)]">
          Privacy policy
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => choose('accepted')}
          className="cursor-pointer rounded-full bg-[var(--color-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-105"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Accept
        </button>
        <button
          onClick={() => choose('declined')}
          className="cursor-pointer rounded-full border border-white/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/80 transition-colors duration-200 hover:border-white hover:text-white"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
