"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { Suspense, useRef } from "react"

function LogoMesh() {
  const ref = useRef<any>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.8
    ref.current.rotation.x += delta * 0.2
  })
  return (
    <mesh ref={ref}>
      {/* Torus knot gives a sleek “trading ring” feel */}
      <torusKnotGeometry args={[0.5, 0.18, 90, 12]} />
      <meshStandardMaterial color="#16a34a" metalness={0.45} roughness={0.2} />
    </mesh>
  )
}

export default function ThreeLogo({
  className = "",
  title = "TRADE",
}: {
  className?: string
  title?: string
}) {
  return (
    <div className={`relative inline-block h-8 w-8 ${className}`} aria-hidden>
      <Canvas
        className="h-full w-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.5], fov: 40 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.1} />
        <Suspense
          fallback={
            <Html center className="text-xs opacity-60">
              ...
            </Html>
          }
        >
          <LogoMesh />
        </Suspense>
      </Canvas>
      <span className="sr-only">{title}</span>
    </div>
  )
}
