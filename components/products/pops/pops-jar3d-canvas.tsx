'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Bounds, Center, useGLTF } from '@react-three/drei'

// The live jar: auto-spins, and visitors can grab and turn it. Lit with plain
// lights only — NO drei <Environment>/<Stage environment>, which fetches an HDR
// from a remote CDN that our CSP blocks (that fetch threw and crashed the whole
// route). Bounds auto-frames the model regardless of its export scale.

function Jar({ src }: { src: string }) {
  const { scene } = useGLTF(src)
  return <primitive object={scene} />
}

export default function PopsJar3DCanvas({ src }: { src: string }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Center>
            <Jar src={src} />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.6}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  )
}

useGLTF.preload('/products/pops/jar-3d.glb')
