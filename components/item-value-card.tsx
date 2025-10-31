"use client"

import Image from "next/image"

interface ItemValueCardProps {
  itemName: string
  itemImage: string
  rarity: string
  demand: string
  value: string
  lastUpdated: string
}

export function ItemValueCard({ itemName, itemImage, rarity, demand, value, lastUpdated }: ItemValueCardProps) {
  const handleAddToInventory = () => {
    console.log(`[v0] Adding ${itemName} to inventory`)
    // TODO: Implement actual inventory logic
  }

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Main card container with shadow layer */}
      <div className="relative">
        {/* Shadow/border layer */}
        <div className="absolute inset-0 rounded-[24px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Main_Rectangle%202%20copy-pGji1P3Kc08gUeYc779eGZUMXfq8cY.png"
            alt=""
            fill
            className="object-cover rounded-[24px]"
          />
        </div>

        {/* Main card base */}
        <div className="relative rounded-[24px] overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Main_Rectangle%202-XPIwKDlq7iBaD4CR0bEWC8Ua7q7aQ5.png"
            alt=""
            fill
            className="object-cover"
          />

          {/* Woven texture overlay */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Main_Layer%202-Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Crumpled paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Main_Layer%203-gaCbXEAcWrjwNrCLzyqGSHmQic1GnA.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Card content */}
          <div className="relative p-5 space-y-4">
            {/* Item name section */}
            <div className="relative h-[42px] flex items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Name%20Holder_Rectangle%202%20copy%203-yrDxcp7eKRq96pdTkwOrt27ri3bkah.png"
                alt=""
                fill
                className="object-cover rounded-[12px]"
              />
              <span className="relative z-10 text-[20px] font-bold bg-gradient-to-b from-[#FFB84D] to-[#FF8C1A] bg-clip-text text-transparent">
                {itemName}
              </span>
            </div>

            {/* Item image holder section */}
            <div className="relative">
              {/* Background */}
              <div className="relative h-[180px] rounded-[16px] overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Item%20Image%20Holder_Rectangle%202%20copy%202-Vn2dN9nBPi4nE8KettCgJ2kUFD1nvv.png"
                  alt=""
                  fill
                  className="object-cover"
                />

                {/* Item image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[140px] h-[140px]">
                    <Image
                      src={itemImage || "/placeholder.svg"}
                      alt={itemName}
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Last updated timestamp */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="relative h-[24px] rounded-[8px] overflow-hidden">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Item%20Image%20Holder_Group%201_Rectangle%205-W562ADrCuPnLd6YY1ZVvKsVaFEO6bc.png"
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="relative z-10 flex items-center justify-center h-full px-3 text-[10px] text-white/90">
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-1.5 font-normal">{lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Values section */}
            <div className="relative">
              <div className="relative rounded-[14px] overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Values_Main_Rectangle%202%20copy%205-kRZC0nlm2NAGQn33PdZNy6LKAZWyBX.png"
                  alt=""
                  fill
                  className="object-cover"
                />

                <div className="relative z-10 p-4 space-y-3">
                  {/* Rarity row */}
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/80 font-medium">Rarity:</span>
                    <span className="text-white font-semibold">{rarity}</span>
                  </div>

                  {/* Separator */}
                  <div className="h-[1px] bg-white/10" />

                  {/* Demand row */}
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/80 font-medium">Demand:</span>
                    <span className="text-white font-semibold">{demand}</span>
                  </div>

                  {/* Separator */}
                  <div className="h-[1px] bg-white/10" />

                  {/* Value row */}
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/80 font-medium">Value:</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to inventory button */}
            <button
              onClick={handleAddToInventory}
              className="relative w-full h-[48px] rounded-[14px] overflow-hidden group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Button_Rectangle%202%20copy%204-Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0.png"
                alt=""
                fill
                className="object-cover"
              />
              <div className="relative z-10 flex items-center justify-center gap-2 h-full">
                <div className="relative w-[18px] h-[18px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Button_Group%202_-Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0.png"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[14px] font-bold bg-gradient-to-b from-[#FFB84D] to-[#FF8C1A] bg-clip-text text-transparent">
                  Add To Inventory
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
