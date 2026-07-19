import Image from 'next/image'
import Reveal from '@/components/reveal'
import { CLUB_PERKS } from '@/lib/rewards-content'

// The Connoisseur Club — invite-only top tier. Theater-scene art from Figma,
// perks as gold pills inside a gold-outlined panel.

export default function ConnoisseurClub() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="sr-only">The Connoisseur Club</h2>
          <Image
            src="/rewards/club-scene.png"
            alt="The Connoisseur Club — Jungle Boys mascots in a private lounge"
            width={1648}
            height={1249}
            sizes="(max-width: 1024px) 96vw, 1100px"
            className="mx-auto w-full max-w-5xl"
          />
        </Reveal>

        <Reveal>
          <div
            className="mx-auto mt-6 max-w-4xl rounded-[2rem] border border-[var(--color-accent)]/60 px-6 py-10 md:px-12"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <p className="text-center text-xl font-extrabold uppercase tracking-wide text-[var(--color-accent)] md:text-2xl">
              Invite Only. Limited Availability.
            </p>
            <p className="mx-auto mt-3 max-w-md text-center text-xs font-bold uppercase leading-relaxed tracking-wide text-white">
              Reserved for a select group of OG customers and brand loyalists.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CLUB_PERKS.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-[#8a6b00] via-[var(--color-accent)] to-[#8a6b00] px-5 py-4"
                >
                  <img src={p.icon} alt="" aria-hidden className="h-8 w-8 shrink-0" />
                  <span className="text-[13px] font-extrabold uppercase leading-tight tracking-wide text-black">
                    {p.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
