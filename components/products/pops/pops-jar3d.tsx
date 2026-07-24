'use client'

import dynamic from 'next/dynamic'

// Lazy so three.js never touches the initial bundle. Falls back to the flat jar
// image while the canvas loads (and for anyone without WebGL).
const Canvas = dynamic(() => import('./pops-jar3d-canvas'), {
  ssr: false,
  loading: () => (
    // eslint-disable-next-line @next/next/no-img-element -- 3D fallback
    <img src="/products/pops/jar-bluog.webp" alt="Blu OG 5G Pops jar" className="h-full w-full object-contain" />
  ),
})

export default function PopsJar3D({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas src="/products/pops/jar-3d.glb" />
    </div>
  )
}
