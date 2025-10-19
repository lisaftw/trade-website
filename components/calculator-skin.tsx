"use client"

import Image from "next/image"
import type { ReactNode } from "react"

export function CalculatorSkin({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl">
      {/* spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,_hsl(var(--ring)/0.45),_transparent_70%)]"
      />
      {/* subtle dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,_currentColor_1px,_transparent_1px)] [background-size:22px_22px] [color:hsl(var(--foreground))]"
      />
      {/* grain overlay (uses shading asset added earlier) */}
      <div className="absolute inset-0 mix-blend-overlay opacity-40">
        <Image src="/home/bg-shading.jpg" alt="" fill priority className="object-cover" />
      </div>

      <div className="relative">{children}</div>
    </section>
  )
}
