"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { moderateContent } from "@/lib/utils/content-moderation"

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

interface EditTradeDialogProps {
  trade: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedTrade: Trade) => void
}

export function EditTradeDialog({ trade, open, onOpenChange, onSuccess }: EditTradeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (trade) {
      setNotes(trade.notes || "")
    }
  }, [trade])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trade || loading) return

    const moderationResult = await moderateContent(notes)
    if (!moderationResult.safe) {
      alert(`Cannot update trade: ${moderationResult.reason}`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error("Failed to update trade")
      }

      const updatedTrade = await response.json()
      onSuccess(updatedTrade)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating trade:", error)
      alert("Failed to update trade")
    } finally {
      setLoading(false)
    }
  }

  if (!trade) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>Update your trade notes and description</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trade Summary */}
          <div className="rounded-lg bg-foreground/5 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Game</p>
              <p className="text-sm text-foreground">{trade.game}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground/70 mb-1">Offering</p>
                <div className="space-y-1">
                  {trade.offering.map((item, idx) => (
                    <p key={idx} className="text-xs text-foreground/80">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/70 mb-1">Requesting</p>
                <div className="space-y-1">
                  {trade.requesting.map((item, idx) => (
                    <p key={idx} className="text-xs text-foreground/80">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Trade Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your trade preferences, what you're looking for, etc."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-foreground/50">
              Update any additional information about this trade. Items cannot be changed after creation.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
