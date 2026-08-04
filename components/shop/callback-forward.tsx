'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { menuPathFor, readStore } from '@/lib/store-selection'

// /callback's forward: saved store → its menu, otherwise the shop door.
// Brief delay so the "signing you in" frame doesn't strobe.

export default function CallbackForward() {
  const router = useRouter()
  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = readStore()
      router.replace(s ? menuPathFor(s.slug, s.state) : '/shop')
    }, 900)
    return () => window.clearTimeout(t)
  }, [router])
  return null
}
