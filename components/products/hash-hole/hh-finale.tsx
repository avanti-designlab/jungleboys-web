// Finale — the golf-course scene (Hash Hole mascot on the cart, JB logo carved
// in the sand). Rises into place as the page lands on the green. The scene art
// is bottom-anchored so it reads as the ground the whole sky sits on.

export default function HhFinale() {
  return (
    <section className="relative mt-10 flex items-end justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- finale scene */}
      <img
        src="/products/hash-hole/golf-scene.webp"
        alt="Jungle Boys — Hash Hole on the course"
        className="media-reveal w-full max-w-[1400px] select-none"
      />
    </section>
  )
}
