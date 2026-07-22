'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { extractCode } from '@/lib/auth/verify'

// Full-screen QR scanner. Opens the rear camera, reads a QR (native
// BarcodeDetector where available, else jsQR on a canvas), extracts the code
// and routes to /auth?code=…. Falls back to manual code entry when the camera
// is unavailable or blocked. Camera tracks are always stopped on close.

type Phase = 'starting' | 'scanning' | 'found' | 'error'

// minimal shape for the (not-yet-universal) BarcodeDetector API
type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> }

export default function ScanOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const doneRef = useRef(false)
  const [phase, setPhase] = useState<Phase>('starting')
  const [manual, setManual] = useState('')
  const [errMsg, setErrMsg] = useState('')

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function finish(rawValue: string) {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('found')
    stopCamera()
    const code = extractCode(rawValue)
    // brief success beat, then route
    setTimeout(() => {
      onClose()
      router.push(`/auth?code=${encodeURIComponent(code)}`)
    }, 650)
  }

  useEffect(() => {
    if (!open) return
    doneRef.current = false
    setPhase('starting')
    setErrMsg('')
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrMsg('Camera not available on this device.')
        setPhase('error')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        setPhase('scanning')
        beginDetection(video)
      } catch {
        setErrMsg('We couldn’t open the camera. Allow camera access, or enter the code below.')
        setPhase('error')
      }
    }

    async function beginDetection(video: HTMLVideoElement) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      // Prefer the native detector; fall back to jsQR.
      let detector: Detector | null = null
      const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector
      if (BD) {
        try {
          detector = new BD({ formats: ['qr_code'] })
        } catch {
          detector = null
        }
      }
      const jsQR = detector ? null : (await import('jsqr')).default

      const tick = async () => {
        if (doneRef.current || cancelled) return
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
          const w = video.videoWidth
          const h = video.videoHeight
          try {
            if (detector) {
              const codes = await detector.detect(video)
              if (codes[0]?.rawValue) return finish(codes[0].rawValue)
            } else if (jsQR && ctx) {
              canvas.width = w
              canvas.height = h
              ctx.drawImage(video, 0, 0, w, h)
              const img = ctx.getImageData(0, 0, w, h)
              const res = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })
              if (res?.data) return finish(res.data)
            }
          } catch {
            // transient decode error — keep scanning
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    start()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    if (manual.trim()) finish(manual.trim())
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Scan product code">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <span className="font-display text-2xl uppercase tracking-wide">Verify</span>
        <button
          onClick={() => {
            stopCamera()
            onClose()
          }}
          aria-label="Close scanner"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* camera stage */}
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        {(phase === 'scanning' || phase === 'starting') && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {/* viewfinder */}
            <div className="relative h-64 w-64 max-w-[70vw]">
              <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-lg border-l-4 border-t-4 border-[var(--color-accent)]" />
              <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-lg border-r-4 border-t-4 border-[var(--color-accent)]" />
              <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-lg border-b-4 border-l-4 border-[var(--color-accent)]" />
              <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-lg border-b-4 border-r-4 border-[var(--color-accent)]" />
              {phase === 'scanning' && <span className="scan-line absolute inset-x-1 top-0 h-0.5 bg-[var(--color-accent)]" />}
            </div>
            <p className="mt-8 max-w-xs text-center text-sm text-white/80" style={{ fontFamily: 'var(--font-body)' }}>
              {phase === 'starting' ? 'Starting camera…' : 'Point at the QR code on your product label.'}
            </p>
          </div>
        )}
        {phase === 'found' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)] text-black">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-10 w-10" aria-hidden><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="mt-5 font-display text-2xl uppercase">Got it</p>
          </div>
        )}
        {phase === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="max-w-xs text-sm text-white/80" style={{ fontFamily: 'var(--font-body)' }}>{errMsg}</p>
          </div>
        )}
      </div>

      {/* manual entry */}
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        <form onSubmit={submitManual} className="mx-auto flex w-full max-w-sm items-center gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Enter code manually"
            aria-label="Enter product code manually"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm uppercase tracking-wide text-white placeholder:text-white/40 focus:border-[var(--color-accent)] focus:outline-none"
            style={{ fontFamily: 'var(--font-brand)' }}
          />
          <button
            type="submit"
            disabled={!manual.trim()}
            className="shrink-0 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition-opacity disabled:opacity-40"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Go
          </button>
        </form>
      </div>
    </div>
  )
}
