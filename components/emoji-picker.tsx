"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

const EMOJI_CATEGORIES = {
  Reactions: ["👍", "❤️", "😂", "😮", "😢", "🙏"],
  Celebrations: ["🎉", "🔥", "👏", "✨", "💯", "⭐"],
  Emotions: ["🤔", "😍", "🥳", "😎", "🤩", "😊"],
}

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
      className="absolute bottom-full left-0 mb-2 z-50 bg-popover/98 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl p-3 min-w-[280px] animate-in fade-in-0 zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              {category}
            </p>
            <div className="grid grid-cols-6 gap-1">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 text-xl hover:scale-125 hover:bg-accent/60 transition-all duration-200 rounded-xl p-0"
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
        ))}
      </div>
    </div>
  )
}
