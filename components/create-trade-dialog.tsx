"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export function CreateTradeDialog({
  open,
  onOpenChange,
  currentUserId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    game: "Adopt Me", // Default to Adopt Me
    type: "offer" as "offer" | "request",
    item_name: "",
    item_value: "",
    description: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("trade_requests").insert({
        creator_id: currentUserId,
        game: formData.game,
        type: formData.type,
        item_name: formData.item_name,
        item_value: formData.item_value ? Number.parseFloat(formData.item_value) : null,
        description: formData.description || null,
        status: "active",
      })

      if (error) throw error

      onSuccess()
      onOpenChange(false)
      setFormData({
        game: "Adopt Me", // Default to Adopt Me
        type: "offer",
        item_name: "",
        item_value: "",
        description: "",
      })
    } catch (error) {
      console.error("Error creating trade:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Trade Request</DialogTitle>
          <DialogDescription>Post a trade offer or request to connect with other traders</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Trade Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "offer" | "request" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offer" id="offer" />
                <Label htmlFor="offer" className="font-normal cursor-pointer">
                  I'm offering an item
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="request" id="request" />
                <Label htmlFor="request" className="font-normal cursor-pointer">
                  I'm requesting an item
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select value={formData.game} onValueChange={(value) => setFormData({ ...formData, game: value })}>
              <SelectTrigger id="game">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adopt Me">Adopt Me</SelectItem>
                {/* MM2 and SAB hidden for future launch
                <SelectItem value="MM2">Murder Mystery 2</SelectItem>
                <SelectItem value="SAB">Steal a Brainrot</SelectItem>
                */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Chroma Gaunter"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_value">Item Value (optional)</Label>
            <Input
              id="item_value"
              type="number"
              step="0.01"
              value={formData.item_value}
              onChange={(e) => setFormData({ ...formData, item_value: e.target.value })}
              placeholder="e.g., 150000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details about your trade..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Trade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
