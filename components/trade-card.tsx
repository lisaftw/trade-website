"use client"

import { MessageCircle, ArrowRightLeft, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/use-user"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TradeInteractionModal } from "@/components/trade-interaction-modal"
import Image from "next/image"
import { getProxiedImageUrl } from "@/lib/utils/image-proxy"

interface Trade {
  id: string
  discord_id: string
  game: string
  offering: string[]
  requesting: string[]
  notes: string
  created_at: string
  status?: string
  creator?: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
}

interface ItemWithImage {
  id?: string
  name: string
  image_url?: string
  value?: number
}

interface TradeCardProps {
  trade: Trade
  onDelete?: (id: string) => void
  onEdit?: (trade: Trade) => void
  isOwnTrade?: boolean
}

export default function TradeCard({ trade, onDelete, onEdit, isOwnTrade = false }: TradeCardProps) {
  const { user } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showInteractionModal, setShowInteractionModal] = useState(false)
  const [offeringItems, setOfferingItems] = useState<ItemWithImage[]>([])
  const [requestingItems, setRequestingItems] = useState<ItemWithImage[]>([])
  const [loadingItems, setLoadingItems] = useState(true)

  const timeAgo = new Date(trade.created_at)
  const now = new Date()
  const diffMs = now.getTime() - timeAgo.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let timeStr = "just now"
  if (diffMins > 0) timeStr = `${diffMins}m ago`
  if (diffHours > 0) timeStr = `${diffHours}h ago`
  if (diffDays > 0) timeStr = `${diffDays}d ago`

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trade?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: "DELETE",
      })
      if (response.ok && onDelete) {
        onDelete(trade.id)
      }
    } catch (error) {
      console.error("Error deleting trade:", error)
      alert("Failed to delete trade")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTradeRequest = async (message: string) => {
    try {
      const response = await fetch(`/api/trades/${trade.id}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error("Failed to send trade request")
      }

      alert("Trade request sent successfully!")
    } catch (error) {
      console.error("Error sending trade request:", error)
      throw error
    }
  }

  useEffect(() => {
    const fetchItemImages = async () => {
      try {
        const response = await fetch(`/api/items?game=${trade.game}`)
        if (!response.ok) throw new Error("Failed to fetch items")

        const data = await response.json()
        const allItems: ItemWithImage[] = data.items || data

        const offeringWithImages = trade.offering.map((itemName) => {
          const item = allItems.find((i) => i.name === itemName)
          return {
            id: item?.id,
            name: itemName,
            image_url: item?.image_url,
            value: item?.value || item?.rap_value,
          }
        })

        const requestingWithImages = trade.requesting.map((itemName) => {
          const item = allItems.find((i) => i.name === itemName)
          return {
            id: item?.id,
            name: itemName,
            image_url: item?.image_url,
            value: item?.value || item?.rap_value,
          }
        })

        setOfferingItems(offeringWithImages)
        setRequestingItems(requestingWithImages)
      } catch (error) {
        console.error("Error fetching item images:", error)
        setOfferingItems(trade.offering.map((name) => ({ name })))
        setRequestingItems(trade.requesting.map((name) => ({ name })))
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItemImages()
  }, [trade.offering, trade.requesting, trade.game])

  const displayName = trade.creator?.global_name || trade.creator?.username || "Trader"
  const avatarUrl = trade.creator?.avatar_url || null

  return (
    <>
      <div className="card-neo space-y-3 md:space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            )}
            <div>
              <p className="text-sm md:text-base font-semibold text-foreground">{displayName}</p>
              <p className="text-xs md:text-sm text-foreground/50">{timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="gap-2 flex-1 sm:flex-initial text-xs md:text-sm">
              <MessageCircle className="h-3.5 md:h-4 w-3.5 md:w-4" />
              Chat
            </Button>
            {!isOwnTrade && (
              <Button
                onClick={() => setShowInteractionModal(true)}
                className="btn-neo gap-2 flex-1 sm:flex-initial text-xs md:text-sm"
              >
                <ArrowRightLeft className="h-3.5 md:h-4 w-3.5 md:w-4" />
                Trade
              </Button>
            )}

            {isOwnTrade && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-3.5 md:h-4 w-3.5 md:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(trade)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Trade Info */}
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
          <span className="rounded-full bg-purple-500/20 px-2 md:px-3 py-0.5 md:py-1 text-purple-300 text-[10px] md:text-xs">
            📤 Offering
          </span>
          <span className="text-foreground/60 text-xs md:text-sm">{trade.game}</span>
        </div>

        {/* Items Grid */}
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
          {/* Offering */}
          <div>
            <p className="mb-2 md:mb-3 text-xs md:text-sm font-semibold text-foreground/70">Offering</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {loadingItems ? (
                <p className="text-[10px] md:text-xs text-foreground/50">Loading items...</p>
              ) : (
                offeringItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 md:gap-2 rounded-lg bg-foreground/5 p-1.5 md:p-2">
                    {item.id && (
                      <Image
                        src={getProxiedImageUrl(item.id) || "/placeholder.svg"}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="h-6 w-6 md:h-8 md:w-8 rounded object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="text-[10px] md:text-xs font-medium text-foreground">{item.name}</p>
                      {item.value && (
                        <p className="text-[9px] md:text-[10px] text-foreground/50">{item.value.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Requesting */}
          <div>
            <p className="mb-2 md:mb-3 text-xs md:text-sm font-semibold text-foreground/70">Requesting</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {loadingItems ? (
                <p className="text-[10px] md:text-xs text-foreground/50">Loading items...</p>
              ) : (
                requestingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 md:gap-2 rounded-lg bg-foreground/5 p-1.5 md:p-2">
                    {item.id && (
                      <Image
                        src={getProxiedImageUrl(item.id) || "/placeholder.svg"}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="h-6 w-6 md:h-8 md:w-8 rounded object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="text-[10px] md:text-xs font-medium text-foreground">{item.name}</p>
                      {item.value && (
                        <p className="text-[9px] md:text-[10px] text-foreground/50">{item.value.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {trade.notes && (
          <div className="rounded-lg bg-foreground/5 p-2 md:p-3">
            <p className="text-[10px] md:text-xs text-foreground/70">{trade.notes}</p>
          </div>
        )}
      </div>

      <TradeInteractionModal
        isOpen={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        tradeId={trade.id}
        onSubmit={handleTradeRequest}
      />
    </>
  )
}
