// Finale — a contained full-bleed scene (no pin, no endless scroll). The golf
// course fills a single tall viewport via object-cover, with a headline over
// the green. Normal flow so the footer sits right beneath it.

export default function HhFinale() {
  return (
    <section
      className="relative h-[85vh] min-h-[520px] w-full overflow-hidden"
      // bottom edge arcs down into the sky — same horizon language as the
      // fairway caps, so the scene rolls out instead of hard-cutting
      style={{ borderRadius: '0 0 50% 50% / 0 0 5.5vw 5.5vw' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- finale scene */}
      <img
        src="/products/hash-hole/golf-scene.webp"
        alt="Jungle Boys — Hash Hole on the course"
        className="absolute inset-x-0 bottom-0 top-[22vh] w-full select-none object-cover object-top md:top-0"
      />
      <div className="absolute inset-x-0 top-[11vh] z-10 text-center md:top-[8vh]">
        <p className="text-sm font-extrabold uppercase tracking-[0.4em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Playing with fire since 2006
        </p>
        <h2 className="hh-gold-head font-display mt-2 uppercase leading-[0.85]" style={{ fontSize: 'min(11vw, 7rem)' }}>
          See You on the Course
        </h2>
      </div>
    </section>
  )
}
