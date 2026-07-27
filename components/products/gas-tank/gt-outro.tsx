'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GtFire, { type GtFireHandle } from './gt-fire'

gsap.registerPlugin(ScrollTrigger)

// THE PAGE BURNS OUT. The same simulation as the hero, burning BEHIND the
// footer so the black pill sits on fire and reads as a pill again — the way it
// reads against the light gutter on every other page.
//
// The fire is a FIXED layer at the foot of the viewport rather than a block in
// the flow. The footer is rendered by the layout, after <main>, so a page-level
// element can't wrap it; and an absolutely-positioned band inside <main> would
// have to guess the footer's height to reach under it. Fixed + z-0 sits under
// everything (each section is relative/z-10, the footer is relative/z-1) and
// shows through exactly where nothing opaque covers it: the footer's gutter
// frame. The footer's own background is cleared to transparent for that.
//
// It stays at opacity 0 until the tail of the page reaches the viewport, so the
// glow never leaks through the section gutters higher up.
export default function GtOutro() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const fireRef = useRef<GtFireHandle>(null)

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const st = ScrollTrigger.create({
      trigger: anchor,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const p = self.progress
        gsap.set('[data-outro-fire]', { opacity: Math.min(1, p * 2.2) })
        fireRef.current?.setIntensity(0.3 + Math.min(1, p * 1.6) * 0.6)
      },
    })
    return () => st.kill()
  }, [])

  return (
    <>
      {/* keeps the shop panel off the footer, and anchors the fade */}
      <div ref={anchorRef} aria-hidden className="h-[16vh] min-h-[120px]" />

      <div data-outro-fire aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[38vh] opacity-0">
        <GtFire
          ref={fireRef}
          initial={0.3}
          className="z-0 h-full opacity-90 mix-blend-screen [mask-image:linear-gradient(to_top,#000_22%,rgba(0,0,0,0.6)_62%,transparent_96%)]"
        />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% 100%, rgba(255,122,24,0.26) 0%, rgba(225,27,11,0.1) 40%, rgba(10,9,8,0) 76%)' }} />
      </div>
    </>
  )
}
