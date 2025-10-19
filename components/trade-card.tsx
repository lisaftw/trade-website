"use client"

import { MessageCircle, ArrowRightLeft, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/use-user"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TradeInteractionModal } from "@/components/trade-interaction-modal"

interface Trade {
  id: string
  discord_id: string
  game: string
  offering: string[]
  requesting: string[]
  notes: string
  created_at: string
  status?: string
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

  return (
    <>
      <div className="card-neo space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            <div>
              <p className="font-semibold text-foreground">Trader</p>
              <p className="text-sm text-foreground/50">{timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
            {!isOwnTrade && (
              <Button onClick={() => setShowInteractionModal(true)} className="btn-neo gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Trade
              </Button>
            )}

            {isOwnTrade && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
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
        <div className="flex items-center gap-4 text-sm">
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-300">📤 Offering</span>
          <span className="text-foreground/60">{trade.game}</span>
        </div>

        {/* Items Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Offering */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground/70">Offering</p>
            <div className="flex flex-wrap gap-2">
              {trade.offering.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-foreground/5 p-2 text-xs">
                  <p className="font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requesting */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground/70">Requesting</p>
            <div className="flex flex-wrap gap-2">
              {trade.requesting.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-foreground/5 p-2 text-xs">
                  <p className="font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        {trade.notes && (
          <div className="rounded-lg bg-foreground/5 p-3">
            <p className="text-xs text-foreground/70">{trade.notes}</p>
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
