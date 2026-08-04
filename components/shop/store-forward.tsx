'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { readStore } from '@/lib/store-selection'

// Door-page enhancement (/deals, /drops): a visitor with a saved CA store
// skips the chooser and lands straight on that store's surface. FL saved
// stores stay on the door (their shopping lives on jungleboysflorida.com).
// Server HTML renders the full chooser either way — this only fast-forwards.

export default function StoreForward({ surface }: { surface: 'deals' | 'drops' }) {
  const router = useRouter()
  useEffect(() => {
    const s = readStore()
    if (s?.state === 'CA') router.replace(`/menu/california/${s.slug}/${surface}`)
  }, [router, surface])
  return null
}
