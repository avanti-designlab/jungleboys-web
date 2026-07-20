'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SocialIcons } from '@/components/social-icons'

// The contact "console": a dark control panel (dark in both themes so the color
// pills stay vivid). Pick a reason from the colored pill grid, then send a
// message. Posts to /api/lead (consent ledger + Klaviyo forward). Scroll reveals
// use the shared .media-reveal / .is-in utility, toggled by one scroll handler.

type Topic = { id: string; label: string; color: string; hint: string }

const TOPICS: Topic[] = [
  { id: 'General', label: 'General', color: '#FECF0E', hint: 'Questions & everything else' },
  { id: 'Wholesale', label: 'Wholesale', color: '#34D399', hint: 'Stock Jungle Boys' },
  { id: 'Press & Media', label: 'Press & Media', color: '#A78BFA', hint: 'Interviews & assets' },
  { id: 'Collabs', label: 'Collabs', color: '#FB923C', hint: 'Partnerships & drops' },
  { id: 'Careers', label: 'Careers', color: '#38BDF8', hint: 'Join the jungle' },
  { id: 'Feedback', label: 'Feedback', color: '#F472B6', hint: 'Tell us how we did' },
]

const QUICK_LINKS = [
  { label: 'California Locations', href: '/locations' },
  { label: 'Wholesale Inquiries', href: '/wholesale' },
  { label: 'PWF Rewards', href: '/rewards' },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: SocialIcons.instagram },
  { label: 'Weedmaps', href: 'https://weedmaps.com/brands/jungleboys/products', icon: SocialIcons.weedmaps },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: SocialIcons.youtube },
]

export default function ContactConsole({ consentText }: { consentText: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [topic, setTopic] = useState<string>('General')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  // scroll reveal for .media-reveal blocks in this section (+ failsafe)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add('is-in')
        }
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    const failsafe = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 2600)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      clearTimeout(failsafe)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const active = TOPICS.find((t) => t.id === topic) ?? TOPICS[0]

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone ? `+1${String(data.phone).replace(/\D/g, '')}` : '',
          message: data.message,
          topic,
          company: data.company, // honeypot
          sourcePage: window.location.pathname,
        }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? 'Something went wrong — please try again.')
      }
      setState('done')
      form.reset()
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const inputCls =
    'w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-[var(--tint)] focus:bg-white/[0.07] focus:ring-2 focus:ring-[var(--tint)]/30'

  return (
    <div ref={rootRef} className="mx-auto grid max-w-[1300px] items-start gap-10 px-4 pb-20 md:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
      {/* LEFT — big headline + tagline + quick links */}
      <div className="lg:sticky lg:top-28">
        <h1 className="media-reveal font-display text-7xl uppercase leading-[0.82] text-[var(--color-foreground)] md:text-8xl xl:text-9xl">
          Get In <span className="text-[var(--color-accent-ink)]">Touch</span>
        </h1>
        <p
          className="media-reveal mt-6 max-w-sm text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Questions, collabs, or business? Pick a lane and tap in — we read every message.
        </p>

        <div className="media-reveal mt-8 flex flex-wrap gap-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="media-reveal mt-4 flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)] [&_svg]:h-4 [&_svg]:w-4"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* RIGHT — dark console */}
      <div
        className="media-reveal overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c0f] p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] md:p-8"
        style={{ ['--tint' as string]: active.color }}
      >
        {/* topic pill grid */}
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>
          What&apos;s it about?
        </p>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((t) => {
            const selected = t.id === topic
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                aria-pressed={selected}
                className="group relative flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-200"
                style={{
                  borderColor: selected ? t.color : 'rgba(255,255,255,0.1)',
                  background: selected ? `${t.color}1f` : 'rgba(255,255,255,0.02)',
                  boxShadow: selected ? `0 0 0 1px ${t.color}, 0 12px 40px -12px ${t.color}80` : 'none',
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full transition-transform duration-200 group-hover:scale-125"
                    style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }}
                  />
                  <span
                    className="text-sm font-extrabold uppercase tracking-wide text-white"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    {t.label}
                  </span>
                </span>
                <span className="text-[11px] leading-tight text-white/45">{t.hint}</span>
              </button>
            )
          })}
        </div>

        {state === 'done' ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl text-black"
              style={{ background: active.color, boxShadow: `0 0 30px ${active.color}80` }}
            >
              ✓
            </span>
            <h3 className="font-display text-3xl uppercase text-white">Message sent</h3>
            <p className="max-w-sm text-sm text-white/55">
              Thanks for reaching out — the team will get back to you. Welcome to the jungle. 🌴
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="mt-2 rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-1">
              <span className="sr-only">Name</span>
              <input name="name" required autoComplete="name" placeholder="Your name" maxLength={80} className={inputCls} />
            </label>
            <label className="md:col-span-1">
              <span className="sr-only">Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="Email address" maxLength={120} className={inputCls} />
            </label>
            <label className="md:col-span-2">
              <span className="sr-only">Phone (optional)</span>
              <div className="flex items-stretch overflow-hidden rounded-full border border-white/15 bg-white/[0.04] transition focus-within:border-[var(--tint)] focus-within:ring-2 focus-within:ring-[var(--tint)]/30">
                <span className="flex items-center border-r border-white/15 px-4 text-sm font-bold text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
                  US +1
                </span>
                <input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone (optional)" maxLength={14} className="w-full bg-transparent px-5 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none" />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="sr-only">Message</span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder={`Tell us about your ${active.label.toLowerCase()} inquiry…`}
                maxLength={2000}
                className="w-full resize-none rounded-[1.4rem] border border-white/15 bg-white/[0.04] px-5 py-4 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-[var(--tint)] focus:bg-white/[0.07] focus:ring-2 focus:ring-[var(--tint)]/30"
              />
            </label>

            {/* honeypot */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            {state === 'error' && (
              <p className="text-sm text-red-400 md:col-span-2" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className="max-w-md text-[11px] leading-relaxed text-white/35">{consentText}</p>
              <button
                type="submit"
                disabled={state === 'sending'}
                className="shrink-0 cursor-pointer rounded-full px-8 py-4 text-base font-extrabold uppercase tracking-widest text-black transition-transform duration-200 hover:scale-[1.03] disabled:opacity-50"
                style={{ background: active.color, boxShadow: `0 12px 40px -10px ${active.color}`, fontFamily: 'var(--font-brand)' }}
              >
                {state === 'sending' ? 'Sending…' : 'Send Message →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
