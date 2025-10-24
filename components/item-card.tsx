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

  const variant = item.rarity || "Normal"
  const rapValue = toNumber(item.rap_value)
  const existCount = toNumber(item.exist_count)

  const demandRating = item.demand || (item.rating ? `${toNumber(item.rating)}/10` : null)

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
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-600/50 bg-black p-4 transition-all hover:border-gray-500/70">
        {/* Logo */}
        <div className="mb-3 flex justify-center">
          <Image src="/ui/logo-tr3de.png" alt="TR3DE" width={120} height={36} className="h-auto w-24 opacity-90" />
        </div>

        {/* Item Image */}
        <div className="relative mx-auto mb-3 aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border-2 border-gray-700/50 bg-gray-900/60">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Last Updated */}
        <p className="mb-3 text-center font-mono text-xs text-gray-400">
          Last Updated: {getTimeAgo(item.last_updated_at)}
        </p>

        {/* Item Name */}
        <h3 className="mb-4 text-center font-mono text-lg font-bold uppercase tracking-wider text-white">
          {item.name}
        </h3>

        {/* Variant Row */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-700/50 pb-2">
          <span className="font-mono text-sm text-gray-300">Variant</span>
          <span className="font-mono text-sm text-white">{variant}</span>
        </div>

        {/* Value Row */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-700/50 pb-2">
          <span className="font-mono text-sm text-gray-300">Value</span>
          <div className="flex items-center gap-2">
            {changePercent !== 0 && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ChevronUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`font-mono text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(changePercent).toFixed(1)}%
                </span>
              </div>
            )}
            <span className="font-mono text-sm text-white">{formatValue(rapValue)}</span>
          </div>
        </div>

        {/* Demand Row */}
        {demandRating && (
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">Demand</span>
            <span className="font-mono text-base font-bold text-yellow-500">{demandRating}</span>
          </div>
        )}

        {/* Add to Inventory Button */}
        {!hideAddButton && (
          <Button
            onClick={handleAddToInventory}
            disabled={isAdding || userLoading}
            variant="secondary"
            className="w-full rounded-lg bg-gray-700/60 font-mono text-xs font-medium uppercase tracking-widest text-gray-300 hover:bg-gray-700/80 disabled:opacity-50"
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
