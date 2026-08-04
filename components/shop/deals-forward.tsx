'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { readStore } from '@/lib/store-selection'

// /deals door enhancement: a visitor with a saved CA store skips the chooser
// and lands straight on that store's deals. FL saved stores stay on the door
// (their deals live on jungleboysflorida.com). Server HTML renders the full
// chooser either way — this only fast-forwards.

export default function DealsForward() {
  const router = useRouter()
  useEffect(() => {
    const s = readStore()
    if (s?.state === 'CA') router.replace(`/menu/california/${s.slug}/deals`)
  }, [router])
  return null
}
