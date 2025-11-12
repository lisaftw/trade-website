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

function getActualImageUrl(imageUrl: string): string {
  // If it's already a full URL (Adopt Me CDN), return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // Extract asset ID from proxy path like "/api/item-image/12345?size=150"
  const proxyMatch = imageUrl.match(/\/api\/item-image\/(\d+)/)
  if (proxyMatch) {
    const assetId = proxyMatch[1]
    return `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`
  }

  // If it's just a number, treat it as asset ID
  if (/^\d+$/.test(imageUrl)) {
    return `https://assetdelivery.roblox.com/v1/asset/?id=${imageUrl}`
  }

  // Fallback to placeholder
  return "/placeholder.svg?height=200&width=200"
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const updated = new Date(timestamp)
  const diffMs = now.getTime() - updated.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "Less than 1 hour ago"
  if (diffHours === 1) return "1 hour ago"
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
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
    : getActualImageUrl(item.image_url || "/placeholder.svg?height=200&width=200")

  const handleAddToInventory = async () => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || data.error || "Failed to add to inventory")
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-lg font-bold">Added to your inventory</span>
          </div>
        ),
        description: (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-background/50 p-3 border border-green-500/30">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-card">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-foreground truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Value: {toNumber(item.rap_value)}</p>
            </div>
          </div>
        ),
        duration: 5000,
        className: "border-2 border-green-500 bg-green-500/5 shadow-xl shadow-green-500/20",
      })
    } catch (error) {
      toast({
        title: "Failed to add item",
        description: error instanceof Error ? error.message : "Please try again or check your connection.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsAdding(false)
    }
  }

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

            {/* Last updated section */}
            <div className="relative w-full h-auto mt-1.5">
              <Image
                src="/card-ui/itemimageholderandlastupdatedholder.png"
                alt="Last updated holder"
                width={200}
                height={24}
                style={{ imageRendering: "pixelated" }}
                className="w-full h-auto object-contain"
                draggable={false}
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center px-2">
                <span
                  className="text-white font-semibold text-[9px] text-center"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {getTimeAgo(item.last_updated_at)}
                </span>
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
