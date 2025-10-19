"use client"

import { useEffect, useRef } from "react"

export function ScrollParallax() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect user preference for reduced motion
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const container = containerRef.current
    if (!container) return

    let ticking = false
    let scrollY = window.scrollY

    const updateParallax = () => {
      if (!container) return

      const layers = container.querySelectorAll("[data-parallax-speed]")

      layers.forEach((layer) => {
        const speed = Number.parseFloat((layer as HTMLElement).dataset.parallaxSpeed || "0")
        const yPos = -(scrollY * speed)
        ;(layer as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`
      })

      ticking = false
    }

    const onScroll = () => {
      scrollY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(updateParallax)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    updateParallax() // Initial position

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]">
      <div
        data-parallax-speed="0.15"
        className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-brand/25 blur-[120px]"
        style={{ willChange: "transform" }}
      />
      <div
        data-parallax-speed="-0.1"
        className="absolute right-[8%] top-[25%] h-96 w-96 rounded-full bg-foreground/8 blur-[140px]"
        style={{ willChange: "transform" }}
      />
      <div
        data-parallax-speed="0.2"
        className="absolute left-[55%] top-[50%] h-64 w-64 rounded-full bg-brand/20 blur-[100px]"
        style={{ willChange: "transform" }}
      />
      <div
        data-parallax-speed="-0.08"
        className="absolute right-[20%] bottom-[15%] h-80 w-80 rounded-full bg-foreground/6 blur-[130px]"
        style={{ willChange: "transform" }}
      />
      <div
        data-parallax-speed="0.12"
        className="absolute left-[30%] bottom-[30%] h-56 w-56 rounded-full bg-brand/15 blur-[90px]"
        style={{ willChange: "transform" }}
      />
    </div>
  )
}
