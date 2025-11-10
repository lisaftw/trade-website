"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"

interface AdoptMeItemCardProps {
  name: string
  rarity: string
  demand: string
  value: number
  image: string
  lastUpdated: string
  onAddToInventory?: () => void
}

export function AdoptMeItemCard({
  name,
  rarity,
  demand,
  value,
  image,
  lastUpdated,
  onAddToInventory,
}: AdoptMeItemCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      const textElements = cardRef.current.querySelectorAll("span")
      const seen = new Set<string>()

      textElements.forEach((el) => {
        const text = el.textContent || ""
        const position = `${el.style.top}-${el.style.right}-${el.style.left}`
        const key = `${text}-${position}`

        if (seen.has(key) && el.parentElement) {
          // Remove duplicate
          el.parentElement.remove()
        } else {
          seen.add(key)
        }
      })
    }
  }, [name, rarity, demand, value, lastUpdated])

  return (
    <div ref={cardRef} className="relative w-[240px] h-[340px] select-none">
      {/* Background layer */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/adoptme-card/backgroundofeachcard.png"
          alt="Card background"
          fill
          style={{ imageRendering: "pixelated" }}
          className="object-fill"
          draggable={false}
          priority
        />
      </div>

      {/* Content layer */}
      <div className="relative h-full flex flex-col items-center px-3 py-5" style={{ zIndex: 1, isolation: "isolate" }}>
        {/* Item holder with image */}
        <div className="relative w-[170px] h-[170px] mt-1" style={{ isolation: "isolate" }}>
          <Image
            src="/adoptme-card/itemholder.png"
            alt="Item frame"
            fill
            style={{ imageRendering: "pixelated", zIndex: 0 }}
            className="object-contain"
            draggable={false}
            priority
          />

          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-sm px-3 py-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              top: "7px",
              zIndex: 20,
            }}
          >
            <span
              className="text-white text-[11px] font-bold whitespace-nowrap block"
              style={{
                textShadow: "none",
                WebkitFontSmoothing: "antialiased",
                lineHeight: "1",
              }}
            >
              {lastUpdated}
            </span>
          </div>

          {/* Item image */}
          <div className="absolute inset-0 flex items-center justify-center p-7" style={{ zIndex: 10 }}>
            <div className="relative w-full h-full">
              <Image
                src={image || "/placeholder.svg"}
                alt={name}
                fill
                className="object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Item name holder */}
        <div className="relative w-[200px] h-[32px] mt-3" style={{ isolation: "isolate" }}>
          <Image
            src="/adoptme-card/itemnameholder.png"
            alt="Name holder"
            fill
            style={{ imageRendering: "pixelated", zIndex: 0 }}
            className="object-fill"
            draggable={false}
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
            <span
              className="text-[#ffaa00] font-black text-[18px] tracking-wide block"
              style={{
                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                WebkitFontSmoothing: "antialiased",
                lineHeight: "1",
              }}
            >
              {name}
            </span>
          </div>
        </div>

        {/* Stats holder */}
        <div className="relative w-[200px] h-[70px] mt-4" style={{ isolation: "isolate" }}>
          <Image
            src="/adoptme-card/raritydemandvalueholder.png"
            alt="Stats holder"
            fill
            style={{ imageRendering: "pixelated", zIndex: 0 }}
            className="object-contain"
            draggable={false}
            priority
          />

          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            {/* Rarity value */}
            <div
              className="absolute"
              style={{
                top: "10px",
                right: "18px",
              }}
            >
              <span
                className="text-white font-bold text-[13px] block"
                style={{
                  textShadow: "0 2px 2px rgba(0,0,0,0.8)",
                  WebkitFontSmoothing: "antialiased",
                  lineHeight: "1",
                }}
              >
                {rarity}
              </span>
            </div>

            {/* Demand value */}
            <div
              className="absolute"
              style={{
                top: "30px",
                right: "18px",
              }}
            >
              <span
                className="text-white font-bold text-[13px] block"
                style={{
                  textShadow: "0 2px 2px rgba(0,0,0,0.8)",
                  WebkitFontSmoothing: "antialiased",
                  lineHeight: "1",
                }}
              >
                {demand}
              </span>
            </div>

            {/* Value number */}
            <div
              className="absolute"
              style={{
                top: "50px",
                right: "18px",
              }}
            >
              <span
                className="text-white font-bold text-[13px] block"
                style={{
                  textShadow: "0 2px 2px rgba(0,0,0,0.8)",
                  WebkitFontSmoothing: "antialiased",
                  lineHeight: "1",
                }}
              >
                {value}
              </span>
            </div>
          </div>
        </div>

        {/* Add to Inventory button */}
        <button
          onClick={onAddToInventory}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-[160px] h-[36px] mt-3 cursor-pointer transition-transform duration-150 active:scale-95"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            zIndex: 10,
          }}
        >
          <Image
            src="/adoptme-card/addtoinventorybutton.png"
            alt="Add to Inventory"
            fill
            style={{ imageRendering: "pixelated" }}
            className="object-fill pointer-events-none"
            draggable={false}
            priority
          />
        </button>
      </div>
    </div>
  )
}
