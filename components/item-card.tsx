"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
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
    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/022_Pumpkin_Cat__1_-KgFBfjNe5rCVXH3emJfq2O26eauX5c.png"
    : item.image_url ||
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/022_Pumpkin_Cat__1_-KgFBfjNe5rCVXH3emJfq2O26eauX5c.png"

  const displayRarity = item.rarity || "Common"
  const sectionLabel = item.section ? item.section.toUpperCase() : item.game?.toUpperCase() || "ITEM"
  const itemCount = item.exist_count || 0

  const handleAddToInventory = async () => {
    // If user is not logged in, show login dialog
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
      <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 p-4 border border-zinc-700/50 transition-all hover:border-zinc-600/70 hover:bg-zinc-900/80">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="text-xs font-medium text-white/70">
            {sectionLabel}: {itemCount}
          </div>
          <div className="rounded-full bg-purple-600/80 px-3 py-1 text-xs font-medium text-white">
            Rarity: {displayRarity}
          </div>
        </div>

        {/* Image container */}
        <div className="relative mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-xl bg-zinc-800/50 border border-white/5">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              console.log("[v0] Image failed to load:", item.name)
              setImageError(true)
            }}
          />
        </div>

        <h3 className="mt-3 text-center text-sm font-semibold text-white line-clamp-2">{item.name}</h3>

        <div className="mt-2 flex flex-col items-center gap-1">
          {item.demand && (
            <div className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/017_Demand-Y4uzjjeAYLX0q8WmJfmT7e1ODBskTB.png"
                alt="Demand"
                width={60}
                height={16}
                className="h-4 w-auto"
              />
              <span className="text-xs text-white/50">{item.demand}</span>
            </div>
          )}
          <p className="text-xs text-white/50">Last Updated: {getTimeAgo(item.last_updated_at)}</p>
        </div>

        <div className="mt-3 text-center text-lg font-bold text-yellow-400">{displayRarity}</div>

        {!hideAddButton && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddToInventory}
              disabled={isAdding || userLoading}
              className="relative overflow-hidden transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/029_Rectangle_2_copy-r4C30HJgtLcx1gqDHFUUyCfEaLSXC6.png"
                alt="Button background"
                width={240}
                height={48}
                className="h-12 w-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  {isAdding ? "Adding..." : user ? "Add to Inventory" : "Login to Add"}
                </span>
              </div>
            </button>
          </div>
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
