'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'

// The live jar: auto-spins, and visitors can grab and turn it. Textured HD
// model (the Smart Mesh export had no label textures). Kept isolated so the
// three.js bundle only loads when this component is dynamically imported.

function Jar({ src }: { src: string }) {
  const { scene } = useGLTF(src)
  return <primitive object={scene} />
}

export default function PopsJar3DCanvas({ src }: { src: string }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        {/* Stage auto-frames + lights the model; environment gives the label
            realistic reflections without shipping HDR files */}
        <Stage environment="city" intensity={0.5} adjustCamera={1.1} shadows={false}>
          <Jar src={src} />
        </Stage>
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
