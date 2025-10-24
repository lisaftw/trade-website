"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, LogIn } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/hooks/use-user"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const changePercent = toNumber(item.change_percent)
  const isPositive = changePercent >= 0
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

  const imageUrl = imageError
    ? "/placeholder.svg?height=200&width=200"
    : item.image_url || "/placeholder.svg?height=200&width=200"

  const displayRating = item.rarity || item.rating || 0
  const sectionLabel = item.section ? item.section.toUpperCase() : "VALUE"

  const handleAddToInventory = async () => {
    // If user is not logged in, show login dialog
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    setIsAdding(true)
    try {
      console.log("[v0] Attempting to add item to inventory:", {
        itemId: item.id,
        itemName: item.name,
        userId: user?.discordId,
      })

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const data = await response.json()
        console.error("[v0] API error response:", data)
        throw new Error(data.details || data.error || "Failed to add to inventory")
      }

      toast({
        title: "✓ Added to your inventory",
        description: (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-base">{item.name}</span>
            <span className="text-sm text-muted-foreground">Successfully added to your collection</span>
          </div>
        ),
        duration: 4000,
        className: "border-green-500/50 bg-green-500/10",
      })
    } catch (error) {
      console.error("[v0] Error adding to inventory:", error)
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
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/10 p-3 md:p-4 transition-all hover:border-border/60 hover:bg-secondary/20">
        <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="rounded-full bg-muted/60 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-muted-foreground">
            {sectionLabel}: {formatValue(item.rap_value)}
          </div>
          {item.rarity && (
            <div className="rounded-full bg-purple-500/20 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-purple-300">
              Rarity: {item.rarity}
            </div>
          )}
          {item.pot && (
            <div className="rounded-full bg-blue-500/20 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-blue-300">
              Pot: {item.pot}
            </div>
          )}
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[200px] md:max-w-[240px] overflow-hidden rounded-xl border border-border bg-card/60 shadow-lg">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              console.error("[v0] Image failed to load:", {
                itemName: item.name,
                imageUrl: item.image_url,
                error: e,
              })
              setImageError(true)
            }}
            onLoad={() => {
              console.log("[v0] Image loaded successfully:", item.name)
            }}
          />
        </div>

        <h3 className="mt-2 md:mt-3 text-center text-xs md:text-sm font-semibold line-clamp-2">{item.name}</h3>

        {item.demand && (
          <p className="mt-1 text-center text-[10px] md:text-xs text-muted-foreground">Demand: {item.demand}</p>
        )}

        <p className="mt-1 text-center text-[10px] md:text-xs text-muted-foreground">
          Last Updated: {getTimeAgo(item.last_updated_at)}
        </p>

        {changePercent !== 0 && (
          <div className="mt-3 md:mt-4 flex items-center justify-center gap-1">
            {isPositive ? (
              <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            ) : (
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
            )}
            <span className={`text-xs md:text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {Math.abs(changePercent).toFixed(1)}%
            </span>
          </div>
        )}

        {displayRating !== 0 && (
          <div className="mt-2 text-center text-base md:text-lg font-bold text-yellow-500">
            {typeof displayRating === "string" ? displayRating : `${toNumber(displayRating).toFixed(1)}/10`}
          </div>
        )}

        {!hideAddButton && (
          <Button
            onClick={handleAddToInventory}
            disabled={isAdding || userLoading}
            variant="secondary"
            className="mt-3 md:mt-4 w-full rounded-lg bg-muted/60 text-[10px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            {isAdding ? "Adding..." : user ? "Add to Inventory" : "Login to Add"}
          </Button>
        )}
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
