"use client"

import Image from "next/image"
import { useState } from "react"

interface TradingItemCardProps {
  name: string
  rarity: string
  demand: string
  value: number
  image: string
  lastUpdated: string
}

export function TradingItemCard({ name, rarity, demand, value, image, lastUpdated }: TradingItemCardProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleAddToInventory = () => {
    console.log("Added to inventory")
  }

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Main card background */}
      <div className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden border-[3px] border-white/20 shadow-2xl">
        <Image
          src="/adoptme-card/backgroundofeachcard.png"
          alt="Card background"
          fill
          className="object-cover"
          priority
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full p-4 md:p-6">
          {/* Item holder with image */}
          <div className="relative w-full max-w-[240px] aspect-[4/3] mt-2">
            {/* Black bordered frame */}
            <div className="absolute inset-0 rounded-[16px] border-[4px] border-black/80 bg-black/40 shadow-inner" />

            {/* Item image */}
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={name}
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="240px"
                />
              </div>
            </div>

            {/* Last Updated overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 border-2 border-white/30 backdrop-blur-sm">
              <p className="text-white text-[11px] md:text-xs font-bold whitespace-nowrap">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>

          {/* Item name holder */}
          <div className="relative w-full mt-4">
            <div className="relative rounded-[12px] bg-gradient-to-b from-gray-600 to-gray-700 border-[3px] border-white/25 shadow-lg px-4 py-2">
              <h2
                className="text-center font-black text-2xl md:text-3xl tracking-wide"
                style={{
                  color: "#ffbb33",
                  textShadow: "3px 3px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.3)",
                  WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                }}
              >
                {name}
              </h2>
            </div>
          </div>

          {/* Rarity, Demand, Value holder */}
          <div className="relative w-full mt-3">
            <div className="relative rounded-[12px] bg-gradient-to-b from-gray-500 to-gray-600 border-[3px] border-white/25 shadow-lg px-4 py-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    Rarity:
                  </span>
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    {rarity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    Demand:
                  </span>
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    {demand}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    Value:
                  </span>
                  <span
                    className="font-black text-base md:text-lg"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                      WebkitTextStroke: "1px rgba(0,0,0,0.8)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add to Inventory button */}
          <button
            onClick={handleAddToInventory}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative w-full mt-3 rounded-[12px] bg-gradient-to-b from-gray-500 to-gray-600 border-[3px] border-white/25 shadow-lg px-6 py-3 transition-all duration-200 active:scale-95"
            style={{
              transform: isHovering ? "scale(1.05)" : "scale(1)",
            }}
          >
            <span
              className="font-black text-base md:text-lg"
              style={{
                color: "white",
                textShadow: "2px 2px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(0,0,0,0.5)",
                WebkitTextStroke: "1px rgba(0,0,0,0.8)",
              }}
            >
              Add To Inventory
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
