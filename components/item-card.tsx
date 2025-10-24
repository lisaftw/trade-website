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
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-dashed border-gray-700/80 bg-black p-8 transition-all hover:border-gray-600">
        {/* Inner container with dashed border around image section */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-dashed border-gray-700/60 bg-black/40 p-6">
          {/* TR3DE Logo */}
          <div className="mb-6 flex justify-center">
            <Image src="/ui/logo-tr3de.png" alt="TR3DE" width={160} height={45} className="h-auto w-36 opacity-95" />
          </div>

          {/* Item Image - Large square */}
          <div className="relative mx-auto mb-5 aspect-square w-full max-w-[280px] overflow-hidden rounded-lg bg-gradient-to-br from-gray-900/80 to-black/60">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Last Updated */}
          <p className="text-center font-mono text-sm tracking-wide text-gray-400">
            Last Updated: {getTimeAgo(item.last_updated_at)}
          </p>
        </div>

        {/* Item Name - Large, bold, centered */}
        <h3 className="mb-8 text-center font-mono text-3xl font-bold uppercase tracking-wider text-white">
          {item.name}
        </h3>

        {/* Horizontal dashed separator */}
        <div className="mb-6 border-t-2 border-dashed border-gray-700/60" />

        {/* Variant Row */}
        <div className="mb-5 flex items-center justify-between border-b border-gray-800/80 pb-4">
          <span className="font-mono text-lg text-white">Variant</span>
          <span className="font-mono text-lg text-white underline decoration-gray-600 underline-offset-4">
            {variant}
          </span>
        </div>

        {/* Value Row */}
        <div className="mb-5 flex items-center justify-between border-b border-gray-800/80 pb-4">
          <span className="font-mono text-lg text-white">Value</span>
          <div className="flex items-center gap-3">
            {changePercent !== 0 && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ChevronUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-mono text-lg font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(changePercent).toFixed(1)}%
                </span>
              </div>
            )}
            <span className="font-mono text-lg text-white">| {formatValue(rapValue)}</span>
          </div>
        </div>

        {/* Demand Row */}
        {demandRating && (
          <div className="mb-8 flex items-center justify-between border-b border-gray-800/80 pb-4">
            <span className="font-mono text-lg text-white">Demand</span>
            <span className="font-mono text-2xl font-bold text-yellow-500">{demandRating}</span>
          </div>
        )}

        {/* Add to Inventory Button */}
        {!hideAddButton && (
          <div className="relative">
            <Image
              src="/ui/button-gray.png"
              alt=""
              width={400}
              height={60}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <Button
              onClick={handleAddToInventory}
              disabled={isAdding || userLoading}
              className="relative w-full rounded-full border-2 border-gray-700/80 bg-transparent py-7 font-mono text-base font-bold uppercase tracking-[0.25em] text-gray-300 hover:bg-gray-700/40 hover:text-white disabled:opacity-50"
            >
              {isAdding ? "Adding..." : user ? "Add to Inventory" : "Login to Add"}
            </Button>
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
