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
      className="absolute z-50 bg-popover/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-3 mt-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {COMMON_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-11 w-11 text-2xl hover:scale-125 hover:bg-accent/50 transition-all rounded-xl p-0"
            onClick={() => {
              console.log("Emoji button clicked:", emoji)
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
