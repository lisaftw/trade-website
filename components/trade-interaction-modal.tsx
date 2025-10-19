"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface TradeInteractionModalProps {
  isOpen: boolean
  onClose: () => void
  tradeId: string
  onSubmit: (message: string) => Promise<void>
}

export function TradeInteractionModal({ isOpen, onClose, tradeId, onSubmit }: TradeInteractionModalProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Please enter a message")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(message)
      setMessage("")
      onClose()
    } catch (error) {
      console.error("Error submitting interaction:", error)
      alert("Failed to send trade request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Trade</DialogTitle>
          <DialogDescription>Send a message to the trader about this trade offer</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Add a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-neo flex-1">
              {isSubmitting ? "Sending..." : "Send Trade Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
