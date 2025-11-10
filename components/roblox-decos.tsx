"use client"

export function RobloxDecos() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Subtle studs grid */}
      <div className="deco-studs absolute inset-[-15%] opacity-50" />

      {/* Low-contrast floating tiles that echo Roblox UI cards */}
      <div className="tile-neo absolute left-6 top-10 size-16 md:left-10 md:top-14 md:size-20 animate-float-slow" />
      <div className="tile-neo absolute right-8 top-24 size-12 md:right-16 md:top-28 md:size-16 animate-float" />
      <div className="tile-neo absolute bottom-10 left-1/2 size-20 -translate-x-1/2 md:bottom-16 md:size-24 animate-float-slower" />
      <div className="tile-neo absolute bottom-24 left-8 hidden size-10 md:block md:left-20 animate-float" />
    </div>
  )
}

export default RobloxDecos
