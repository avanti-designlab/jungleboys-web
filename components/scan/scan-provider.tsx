'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import ScanOverlay from './scan-overlay'

// App-wide access to the QR scanner. The footer VERIFY button and the /auth
// hub both call useScanner().open().

const ScanContext = createContext<{ open: () => void }>({ open: () => {} })

export function useScanner() {
  return useContext(ScanContext)
}

export default function ScanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const doOpen = useCallback(() => setOpen(true), [])
  const doClose = useCallback(() => setOpen(false), [])
  return (
    <ScanContext.Provider value={{ open: doOpen }}>
      {children}
      <ScanOverlay open={open} onClose={doClose} />
    </ScanContext.Provider>
  )
}
