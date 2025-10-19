"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial, Environment } from "@react-three/drei"

function ParticlesField({ count = 800, speed = 0.02 }) {
  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // random sphere distribution
      const r = Math.cbrt(Math.random()) * 4.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      pts.set([x, y, z], i * 3)
    }
    return pts
  }, [count])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.scene.rotation.z = t * (speed * 0.25)
    state.scene.rotation.y = t * (speed * 0.15)
  })

  return (
    <group>
      {/* brighter white points */}
      <Points positions={positions} stride={3}>
        <PointMaterial transparent size={0.015} sizeAttenuation depthWrite={false} color="#ffffff" opacity={0.55} />
      </Points>
      {/* dim gray points for depth */}
      <Points positions={positions} stride={3}>
        <PointMaterial transparent size={0.008} sizeAttenuation depthWrite={false} color="#9ca3af" opacity={0.22} />
      </Points>
    </group>
  )
}

export default function AnimatedBackground() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handle = () => setEnabled(!mq.matches)
    handle()
    mq.addEventListener?.("change", handle)
    return () => mq.removeEventListener?.("change", handle)
  }, [])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Subtle grayscale radial underlay */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.10),transparent_60%),radial-gradient(40%_35%_at_80%_90%,rgba(255,255,255,0.06),transparent_70%)]" />
      <Canvas
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ParticlesField />
        </Suspense>
      </Canvas>
    </div>
  )
}
