'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GtFire, { type GtFireHandle } from './gt-fire'

gsap.registerPlugin(ScrollTrigger)

// THE PAGE BURNS OUT. The same simulation as the hero, running as a band across
// the very bottom of the page, so the footer's black pill sits on a burning
// horizon rather than on dead black.
//
// It sits ABOVE the footer rather than behind it on purpose: the footer pill is
// opaque and spans nearly the full width, so a layer behind it would only ever
// show through 12px of gutter. A band here reads.
//
// The burn banks up as you arrive — the fire idles low until the band enters
// frame, then climbs, so it feels like the page catching rather than a loop
// that has been running out of sight the whole time.
export default function GtOutro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const fireRef = useRef<GtFireHandle>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          fireRef.current?.setIntensity(0.3 + self.progress * 0.6)
        },
      })
      return () => st.kill()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} aria-hidden className="relative h-[26vh] min-h-[190px] overflow-hidden">
      <GtFire
        ref={fireRef}
        initial={0.3}
        className="z-0 h-full opacity-90 mix-blend-screen [mask-image:linear-gradient(to_top,#000_18%,rgba(0,0,0,0.6)_58%,transparent_94%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-full"
        style={{ background: 'radial-gradient(120% 90% at 50% 100%, rgba(255,122,24,0.28) 0%, rgba(225,27,11,0.12) 38%, rgba(10,9,8,0) 74%)' }} />
    </div>
  )
}
