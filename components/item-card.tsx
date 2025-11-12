"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/hooks/use-user"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getProxiedImageUrl } from "@/lib/utils/image-proxy"

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

function formatValue(value: number | null | undefined): string {
  const numValue = toNumber(value)
  if (numValue === 0) return "0"
  if (numValue >= 1_000_000_000) return `${(numValue / 1_000_000_000).toFixed(2)}B`
  if (numValue >= 1_000_000) return `${(numValue / 1_000_000).toFixed(2)}M`
  if (numValue >= 1_000) return `${(numValue / 1_000).toFixed(2)}K`
  return numValue.toString()
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const updated = new Date(timestamp)
  const diffMs = now.getTime() - updated.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "less than 1 hour ago"
  if (diffHours === 1) return "1 hour ago"
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export function ItemCard({ item, hideAddButton = false }: ItemCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
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

  const imageUrl = imageError ? "/placeholder.svg?height=200&width=200" : getProxiedImageUrl(item.id)

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
              <p className="text-sm text-muted-foreground mt-0.5">Value: {formatValue(item.rap_value)}</p>
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
      <div className="relative w-full max-w-[280px] mx-auto">
        {/* Main card with gradient background */}
        <div
          className="relative w-full rounded-[20px] border-4 border-white/20 shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(100,100,100,0.9) 0%, rgba(160,160,160,0.9) 50%, rgba(100,100,100,0.9) 100%)",
          }}
        >
          {/* Card content */}
          <div className="relative flex flex-col p-4">
            {/* Image container with Last Updated overlay */}
            <div className="relative w-full aspect-[4/3] rounded-2xl border-4 border-white/30 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 overflow-hidden mb-3">
              {/* Item image */}
              <div className="absolute inset-0 p-4 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    loading="lazy"
                    className="object-contain drop-shadow-2xl"
                    sizes="280px"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>

              {/* Last Updated badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 border-2 border-gray-300 shadow-lg">
                <p className="text-gray-700 text-xs font-bold whitespace-nowrap">
                  Last Updated: {getTimeAgo(item.last_updated_at)}
                </p>
              </div>
            </div>

            {/* Item name box */}
            <div className="relative w-full rounded-xl bg-gradient-to-b from-gray-600 to-gray-700 border-3 border-white/25 shadow-lg px-4 py-2.5 mb-3">
              <h3
                className="text-center font-black text-lg tracking-wide truncate"
                style={{
                  color: "white",
                  textShadow: "2px 2px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.2)",
                }}
              >
                {item.name}
              </h3>
            </div>

            {/* Rarity, Demand, Value box */}
            <div className="relative w-full rounded-xl bg-gradient-to-b from-gray-500 to-gray-600 border-3 border-white/25 shadow-lg px-4 py-3 mb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                  <span
                    className="font-black text-base"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9)",
                    }}
                  >
                    Rarity:
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{
                      color: "white",
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                    }}
                  >
                    {item.rarity || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                  <span
                    className="font-black text-base"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9)",
                    }}
                  >
                    Demand:
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{
                      color: "white",
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                    }}
                  >
                    {item.demand || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-black text-base"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.9)",
                    }}
                  >
                    Value:
                  </span>
                  <span
                    className="font-bold text-base"
                    style={{
                      color: "white",
                      textShadow: "1px 1px 0px rgba(0,0,0,0.8)",
                    }}
                  >
                    {formatValue(item.rap_value)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add to Inventory button */}
            {!hideAddButton && (
              <button
                onClick={handleAddToInventory}
                disabled={isAdding || userLoading}
                className="relative w-full rounded-xl bg-gradient-to-b from-gray-500 to-gray-600 border-3 border-white/25 shadow-lg px-6 py-3 transition-all duration-200 active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className="font-black text-base"
                  style={{
                    color: "white",
                    textShadow: "2px 2px 0px rgba(0,0,0,0.9)",
                  }}
                >
                  {isAdding ? "Adding..." : user ? "Add To Inventory" : "Login to Add"}
                </span>
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
