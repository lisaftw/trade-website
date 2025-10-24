"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥", "👏", "✨", "💯", "🤔", "😍", "🥳", "😎"]

type EmojiPickerProps = {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Add a small delay before attaching the listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg p-2 mt-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-5 gap-1">
        {COMMON_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-10 w-10 text-2xl hover:scale-125 transition-transform p-0"
            onClick={() => {
              console.log("[v0] Emoji button clicked:", emoji)
              onSelect(emoji)
              onClose()
            }}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}
