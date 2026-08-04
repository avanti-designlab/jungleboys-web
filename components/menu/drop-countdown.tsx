'use client'

import { useEffect, useState } from 'react'

// The Friday drop clock, v3 (Avanti, 2026-08-04): a GOLD TILE with a glow
// that travels around the box (border-beam — conic highlight orbiting in the
// tile's 3px rim, reduced-motion stilled). No week strip — it's Friday every
// week, the tile says so. On Fridays the clock flips to "DROP DAY — IT'S
// LIVE" instead of counting to next week.
//
// Store-local time (America/Los_Angeles), same rule as the header's
// open/closed chip. SSR renders em-dashes; the interval fills after mount so
// server HTML and first client paint agree.

const TZ = 'America/Los_Angeles'

function storeNow(): Date {
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
      setState({
        live: false,
        d: Math.floor(ms / 86_400_000),
        h: Math.floor((ms % 86_400_000) / 3_600_000),
        m: Math.floor((ms % 3_600_000) / 60_000),
        s: Math.floor((ms % 60_000) / 1_000),
        date: target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      })
    }
    tick()
    const id = window.setInterval(tick, 1_000)
    return () => window.clearInterval(id)
  }, [])

  const cell = (value: string, label: string) => (
    <div className="flex flex-col items-center rounded-2xl bg-black/[0.92] py-4 md:py-6">
      <span className="font-display text-5xl leading-none tabular-nums text-[var(--color-accent)] md:text-7xl">
        {value}
      </span>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
        {label}
      </span>
    </div>
  )

  return (
    // outer = the beam track (3px rim the orbiting highlight rides in)
    <div data-drop-clock className="drop-beam relative overflow-hidden rounded-[2rem] p-[3px]">
      <div className="relative z-10 rounded-[calc(2rem-3px)] bg-[linear-gradient(135deg,#ffe27a_0%,#fecf0e_55%,#eab308_100%)] px-5 py-6 md:px-7 md:py-7">
        {state?.live ? (
          <div className="flex items-center gap-4 rounded-2xl bg-black/[0.92] px-6 py-7">
            <span aria-hidden className="drop-live-dot h-4 w-4 shrink-0 rounded-full bg-[var(--color-accent)]" />
            <p className="font-display text-4xl uppercase leading-[0.9] text-[var(--color-accent)] md:text-5xl">
              Drop day — it&rsquo;s live
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                Next drop
              </p>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-black/70" style={{ fontFamily: 'var(--font-brand)' }}>
                Every Friday{state && !state.live ? ` · ${state.date}` : ''}
              </p>
            </div>
            {/* four segment cells fill the tile edge-to-edge */}
            <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
              {cell(state ? String(state.d) : '—', 'days')}
              {cell(state ? String(state.h).padStart(2, '0') : '—', 'hours')}
              {cell(state ? String(state.m).padStart(2, '0') : '—', 'min')}
              {cell(state ? String(state.s).padStart(2, '0') : '—', 'sec')}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
