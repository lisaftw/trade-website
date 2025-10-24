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
      <div className="relative w-[340px] overflow-hidden rounded-[32px] border-[3px] border-dashed border-gray-600/70 bg-black p-5">
        {/* Inner container with dashed border around image section */}
        <div className="mb-5 overflow-hidden rounded-[24px] border-[3px] border-dashed border-gray-600/60 bg-black/50 p-4">
          {/* TR3DE Logo */}
          <div className="mb-3 flex justify-center">
            <Image src="/ui/logo-tr3de.png" alt="TR3DE" width={120} height={35} className="h-auto w-28" />
          </div>

          {/* Item Image - Square with brightness overlay */}
          <div className="relative mx-auto mb-3 aspect-square w-[220px] overflow-hidden rounded-lg bg-gradient-to-br from-gray-900/50 to-black/40">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-contain p-3"
              sizes="220px"
              onError={() => setImageError(true)}
            />
            {/* Brightness overlay */}
            <div className="pointer-events-none absolute inset-0">
              <Image src="/ui/brightness-overlay.png" alt="" fill className="object-cover opacity-30" />
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-center font-mono text-[12px] tracking-wide text-gray-400">
            Last Updated: {getTimeAgo(item.last_updated_at)}
          </p>
        </div>

        {/* Item Name */}
        <h3 className="mb-4 text-center font-mono text-[24px] font-bold uppercase leading-tight tracking-wider text-white">
          {item.name}
        </h3>

        {/* Divider line using image */}
        <div className="relative mb-4 h-[2px] w-full">
          <Image src="/ui/divider-line-1.png" alt="" fill className="object-cover" />
        </div>

        {/* Variant Row */}
        <div className="mb-3 flex items-center justify-between pb-2">
          <span className="font-mono text-[16px] text-white">Variant</span>
          <span className="font-mono text-[16px] text-white underline decoration-gray-600 decoration-[1.5px] underline-offset-4">
            {variant}
          </span>
        </div>
        {/* Divider line using image */}
        <div className="relative mb-3 h-[1px] w-full">
          <Image src="/ui/divider-line-2.png" alt="" fill className="object-cover opacity-60" />
        </div>

        {/* Value Row */}
        <div className="mb-3 flex items-center justify-between pb-2">
          <span className="font-mono text-[16px] text-white">Value</span>
          <div className="flex items-center gap-2">
            {changePercent !== 0 && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-mono text-[15px] font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(changePercent).toFixed(1)}%
                </span>
              </div>
            )}
            <span className="font-mono text-[15px] text-gray-400">|</span>
            <span className="font-mono text-[16px] text-white">{formatValue(rapValue)}</span>
          </div>
        </div>
        {/* Divider line using image */}
        <div className="relative mb-3 h-[1px] w-full">
          <Image src="/ui/divider-line-2.png" alt="" fill className="object-cover opacity-60" />
        </div>

        {/* Demand Row */}
        {demandRating && (
          <>
            <div className="mb-5 flex items-center justify-between pb-2">
              <span className="font-mono text-[16px] text-white">Demand</span>
              <span className="font-mono text-[20px] font-bold text-yellow-400">{demandRating}</span>
            </div>
            {/* Divider line using image */}
            <div className="relative mb-5 h-[1px] w-full">
              <Image src="/ui/divider-line-2.png" alt="" fill className="object-cover opacity-60" />
            </div>
          </>
        )}

        {!hideAddButton && (
          <div className="relative h-[52px] w-full">
            {/* Button background image */}
            <Image src="/ui/button-gray.png" alt="" fill className="rounded-full object-cover" />
            <Button
              onClick={handleAddToInventory}
              disabled={isAdding || userLoading}
              className="relative h-full w-full rounded-full border-none bg-transparent font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
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
