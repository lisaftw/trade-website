"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/hooks/use-user"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

interface ItemCardProps {
  item: {
    id: string
    name: string
    game: string
    image_url: string
    rap_value: number | null | undefined
    exist_count: number | null | undefined
    change_percent: number | null | undefined
    rating: number | null | undefined
    last_updated_at: string
    section?: string
    rarity?: string
    demand?: string
    pot?: string
  }
  hideAddButton?: boolean
}

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

function getActualImageUrl(imageUrl: string, itemId: string): string {
  // The proxy endpoint will handle Discord CDN, Roblox assets, and other image sources
  return `/api/item-image/${itemId}`
}

export function ItemCard({ item, hideAddButton = false }: ItemCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { user, loading: userLoading, refetch } = useUser()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkLoginStatus = () => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("welcome") === "true" || document.referrer.includes("/api/auth/discord")) {
        refetch()
      }
    }
    checkLoginStatus()
  }, [refetch])

  const imageUrl = imageError
    ? "/placeholder.svg?height=200&width=200"
    : getActualImageUrl(item.image_url || "/placeholder.svg?height=200&width=200", item.id)

  const shouldUnoptimize = false

  return (
    <>
      <div className="relative w-full max-w-[200px] select-none">
        {/* Background layer */}
        <div className="relative w-full aspect-[3/5]">
          <Image
            src="/card-ui/backgroundforeachitem.png"
            alt="Card background"
            fill
            style={{ imageRendering: "pixelated" }}
            className="object-fill"
            draggable={false}
            priority
          />

          {/* Content overlay */}
          <div className="relative h-full flex flex-col items-center justify-start p-3" style={{ zIndex: 1 }}>
            {/* Item holder with image */}
            <div className="relative w-full aspect-[4/3] mt-1">
              <Image
                src="/card-ui/itemimageholderandlastupdatedholder.png"
                alt="Item holder"
                fill
                style={{ imageRendering: "pixelated" }}
                className="object-contain"
                draggable={false}
                priority
              />

              {/* Item image */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    onError={() => setImageError(true)}
                    unoptimized={shouldUnoptimize}
                  />
                </div>
              </div>
            </div>

            {/* Item name holder */}
            <div className="relative w-full h-auto mt-1.5">
              <Image
                src="/card-ui/boxtodisplayname.png"
                alt="Name holder"
                width={200}
                height={32}
                style={{ imageRendering: "pixelated" }}
                className="w-full h-auto object-contain"
                draggable={false}
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center px-2">
                <span
                  className="text-white font-semibold text-[11px] text-center truncate"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {item.name}
                </span>
              </div>
            </div>

            <div className="relative w-full h-auto mt-1.5">
              <Image
                src="/card-ui/raritydemandvalue.png"
                alt="Stats holder"
                width={200}
                height={80}
                style={{ imageRendering: "pixelated" }}
                className="w-full h-auto object-contain"
                draggable={false}
                priority
              />

              <div className="absolute inset-0 flex flex-col justify-evenly px-8 py-2">
                {/* Rarity */}
                <div className="flex items-center justify-end h-[20px]">
                  <span className="text-white font-bold text-[10px]" style={{ textShadow: "1px 1px 1px #000" }}>
                    {item.rarity || item.section || "N/A"}
                  </span>
                </div>

                {/* Demand */}
                <div className="flex items-center justify-end h-[20px]">
                  <span className="text-white font-bold text-[10px]" style={{ textShadow: "1px 1px 1px #000" }}>
                    {item.demand || "N/A"}
                  </span>
                </div>

                {/* Value */}
                <div className="flex items-center justify-end h-[20px]">
                  <span className="text-white font-bold text-[10px]" style={{ textShadow: "1px 1px 1px #000" }}>
                    {toNumber(item.rap_value)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add to Inventory button */}
            {!hideAddButton && (
              <button
                onClick={handleAddToInventory}
                disabled={isAdding || userLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative w-auto h-auto mt-2 cursor-pointer transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Image
                  src="/card-ui/add to inventory.png"
                  alt="Add to Inventory"
                  width={160}
                  height={32}
                  style={{ imageRendering: "pixelated" }}
                  className="object-contain pointer-events-none"
                  draggable={false}
                  priority
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign in to save items
            </DialogTitle>
            <DialogDescription>
              Sign in with Discord to add {item.name} to your inventory. Your inventory will be saved and available
              whenever you log in.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-2">
            <a href="/api/auth/discord" className="w-full">
              <Button className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Continue with Discord
              </Button>
            </a>
            <Button variant="secondary" className="w-full" onClick={() => setShowLoginDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function handleAddToInventory() {
  // Implementation of handleAddToInventory
}
