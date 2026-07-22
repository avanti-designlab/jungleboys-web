// Scrolling editorial marquee — two rows moving opposite directions, one filled
// one outlined. Pure CSS transform loop (frozen motion rules; reduced-motion
// freezes it via the global rule on .marquee-track).

const ROW_A = ['The Journal', 'Playing With Fire', 'Since 2006', 'Straight From The Jungle']
const ROW_B = ['Stories From The Jungle', 'Culture Runs Deep', 'The Hunt Never Stops', 'Stay Lit']

function Flame({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`h-5 w-5 shrink-0 md:h-7 md:w-7 ${className}`}>
      <path
        fill="var(--color-accent)"
        d="M12 2c1.2 3.2-1.4 4.7-1.4 7.2 0 1.3.9 2.3 2 2.3 1.4 0 2.2-1.2 1.9-2.8 1.9 1.3 3 3.3 3 5.6 0 3.4-2.9 6.2-6.5 6.2S4.5 17.7 4.5 14.3c0-4 3-6.2 4.3-8.6C10 3.6 11.4 2.8 12 2Z"
      />
    </svg>
  )
}

function Row({ words, reverse, outlined }: { words: string[]; reverse?: boolean; outlined?: boolean }) {
  const track = [...words, ...words, ...words]
  return (
    <div className="overflow-hidden">
      <div className={`flex w-max items-center gap-8 md:gap-14 ${reverse ? 'marquee-track-reverse' : 'marquee-track'} marquee-pause`}>
        {track.map((w, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-14">
            <span
              className={`font-display whitespace-nowrap text-4xl uppercase leading-none md:text-6xl ${
                outlined ? 'blog-stroke' : 'text-[var(--color-foreground)]'
              }`}
            >
              {w}
            </span>
            <Flame />
          </span>
        ))}
      </div>
    </div>
  )
}

export default function BlogMarquee() {
  return (
    <section aria-hidden className="flex flex-col gap-3 overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] py-6 md:gap-4 md:py-9">
      <Row words={ROW_A} />
      <Row words={ROW_B} reverse outlined />
    </section>
  )
}
