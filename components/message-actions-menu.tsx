"use client"

import type React from "react"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Reply, Copy, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MessageActionsMenuProps = {
  messageId: string
  content: string
  isOwnMessage: boolean
  onEdit: () => void
  onDelete: () => void
  onReply: () => void
  onReact: () => void
}

export function MessageActionsMenu({
  messageId,
  content,
  isOwnMessage,
  onEdit,
  onDelete,
  onReply,
  onReact,
}: MessageActionsMenuProps) {
  const [open, setOpen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setOpen(false)
  }

  const handleReact = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("React button clicked for message:", messageId)
    setOpen(false)
    onReact()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleReact}>
          <Smile className="h-4 w-4 mr-2" />
          React
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReply}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </DropdownMenuItem>
        {isOwnMessage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
