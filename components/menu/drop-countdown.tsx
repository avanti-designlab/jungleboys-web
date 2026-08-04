'use client'

import { useEffect, useState } from 'react'

// The Friday drop clock (Avanti, 2026-08-04: "some type of calendar
// animation… we really want a wow factor"). Two pieces:
//   1. a week strip — seven day chips with FRIDAY lit gold and pulsing
//   2. a live countdown to the next drop, in STORE-LOCAL time (same
//      America/Los_Angeles rule as the header's open/closed chip — a
//      prerendered countdown would be wrong for every visitor)
// On Fridays the clock flips to a "DROP DAY" badge instead of counting to
// next week — the honest state while the drop is live.
//
// SSR renders em-dash placeholders; the interval fills real numbers after
// mount, so server HTML and first client paint agree.

const TZ = 'America/Los_Angeles'

function storeNow(): Date {
  // wall-clock time in store TZ, expressed as a local Date for arithmetic
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
}

function nextFriday(from: Date): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 5 = Friday
  const ahead = (5 - day + 7) % 7 || 7
  d.setDate(d.getDate() + ahead)
  return d
}

const DAYS = ['S', 'S', 'M', 'T', 'W', 'T', 'F'] as const // Sat-first, Friday last

export default function DropCountdown() {
  const [state, setState] = useState<
    { live: true } | { live: false; d: number; h: number; m: number; s: number; date: string } | null
  >(null)

  useEffect(() => {
    const tick = () => {
      const now = storeNow()
      if (now.getDay() === 5) {
        setState({ live: true })
        return
      }
      const target = nextFriday(now)
      const ms = target.getTime() - now.getTime()
      const d = Math.floor(ms / 86_400_000)
      const h = Math.floor((ms % 86_400_000) / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      const s = Math.floor((ms % 60_000) / 1_000)
      const date = target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      setState({ live: false, d, h, m, s, date })
    }
    tick()
    const id = window.setInterval(tick, 1_000)
    return () => window.clearInterval(id)
  }, [])

  const cell = (value: string, label: string) => (
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl leading-none tabular-nums text-white md:text-6xl">{value}</span>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
        {label}
      </span>
    </div>
  )

  return (
    <div data-drop-clock>
      {/* week strip — Friday lit and pulsing */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {DAYS.map((d, i) => {
          const friday = i === DAYS.length - 1
          return (
            <span
              key={i}
              className={`font-display flex h-9 w-9 items-center justify-center rounded-xl text-[15px] leading-none md:h-10 md:w-10 ${
                friday
                  ? 'drop-friday-pulse bg-[var(--color-accent)] text-black'
                  : 'border border-white/15 text-white/45'
              }`}
            >
              {d}
            </span>
          )
        })}
      </div>

      <div className="mt-5">
        {state?.live ? (
          <p className="font-display inline-flex items-center gap-3 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-3xl uppercase leading-none text-black md:text-4xl">
            <span aria-hidden className="drop-live-dot h-3 w-3 rounded-full bg-black" />
            Drop day — it&rsquo;s live
          </p>
        ) : (
          <>
            <div className="flex items-start gap-4 md:gap-6">
              {cell(state ? String(state.d) : '—', 'days')}
              {cell(state ? String(state.h).padStart(2, '0') : '—', 'hours')}
              {cell(state ? String(state.m).padStart(2, '0') : '—', 'min')}
              {cell(state ? String(state.s).padStart(2, '0') : '—', 'sec')}
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Next drop · Friday{state && !state.live ? `, ${state.date}` : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
