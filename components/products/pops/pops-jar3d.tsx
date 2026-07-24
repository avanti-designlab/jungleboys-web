'use client'

import { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Lazy so three.js never touches the initial bundle. Falls back to the flat jar
// image while the canvas loads, for anyone without WebGL, AND if the 3D layer
// throws — the error boundary keeps a 3D failure from taking down the page.
const Canvas = dynamic(() => import('./pops-jar3d-canvas'), { ssr: false })

function Fallback() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 3D fallback
    <img src="/products/pops/jar-bluog.webp" alt="Blu OG 5G Pops jar" className="h-full w-full object-contain" />
  )
}

class Jar3DBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}

export default function PopsJar3D({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <Jar3DBoundary>
        <Canvas src="/products/pops/jar-3d.glb" />
      </Jar3DBoundary>
    </div>
  )
}
