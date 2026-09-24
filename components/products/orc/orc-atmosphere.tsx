// Fixed molten atmosphere behind the whole ORC page (the hash-hole fixed-sky
// pattern, z-0 with all content riding z-10): two slow-drifting furnace
// glows, a faint script watermark, and gold embers rising the full height.
// Everything decorative, aria-hidden, and cheap (transform/opacity only).
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 100}%`,
  size: 3 + ((i * 5) % 6),
  t: 11 + ((i * 3) % 9),
  d: -((i * 1.7) % 12),
  o: 0.25 + ((i * 7) % 10) / 28,
}))

export default function OrcAtmosphere() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
      {/* furnace glows */}
      <span className="orc-glow absolute -left-[20%] top-[15%] h-[55vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(245,163,0,0.13),transparent_70%)]" />
      <span
        className="orc-glow absolute -right-[25%] top-[55%] h-[65vh] w-[75vw] rounded-full bg-[radial-gradient(closest-side,rgba(255,212,0,0.09),transparent_70%)]"
        style={{ animationDelay: '-8s' }}
      />
      {/* script watermark, barely there */}
      {/* eslint-disable-next-line @next/next/no-img-element -- watermark */}
      <img
        src="/products/orc/script-drip.webp"
        alt=""
        className="absolute left-[-6%] top-[38%] w-[min(52vw,620px)] opacity-[0.05]"
      />
      {/* rising embers */}
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="orc-ember"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            '--e-t': `${e.t}s`,
            '--e-d': `${e.d}s`,
            '--e-o': e.o,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
