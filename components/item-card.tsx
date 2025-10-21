"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

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

export function ItemCard({ item }: ItemCardProps) {
  const changePercent = toNumber(item.change_percent)
  const isPositive = changePercent >= 0
  const existCount = toNumber(item.exist_count)
  const rating = toNumber(item.rating)

  const [imageError, setImageError] = useState(false)
  const imageUrl = item.image_url || "/placeholder.svg"

  useState(() => {
    console.log("[v0] ItemCard rendering:", {
      name: item.name,
      image_url: item.image_url,
      imageUrl: imageUrl,
    })
  })

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/10 p-3 md:p-4 transition-all hover:border-border/60 hover:bg-secondary/20">
      <div className="mb-2 md:mb-3 flex items-center justify-between gap-2">
        <div className="rounded-full bg-muted/60 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-muted-foreground">
          {item.section || "VALUE"}: {formatValue(item.rap_value)}
        </div>
        {item.rarity && (
          <div className="rounded-full bg-purple-500/20 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-purple-300">
            {item.rarity}
          </div>
        )}
        {item.pot && (
          <div className="rounded-full bg-blue-500/20 px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium text-blue-300">
            {item.pot}
          </div>
        )}
      </div>

      {/* Item image */}
      <div className="relative mx-auto aspect-square w-full max-w-[200px] md:max-w-[240px] overflow-hidden rounded-xl border border-border bg-card/60 shadow-lg">
        <Image
          src={imageError ? "/placeholder.svg?height=200&width=200" : imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => {
            console.error("[v0] Image failed to load:", {
              itemName: item.name,
              imageUrl: imageUrl,
              originalUrl: item.image_url,
              error: e,
            })
            setImageError(true)
          }}
          onLoad={() => {
            console.log("[v0] Image loaded successfully:", item.name, imageUrl)
          }}
        />
      </div>

      <h3 className="mt-2 md:mt-3 text-center text-xs md:text-sm font-semibold line-clamp-2">{item.name}</h3>

      {item.demand && (
        <p className="mt-1 text-center text-[10px] md:text-xs text-muted-foreground">Demand: {item.demand}</p>
      )}

      <p className="mt-1 text-center text-[10px] md:text-xs text-muted-foreground">
        Last Updated: {getTimeAgo(item.last_updated_at)}
      </p>

      <div className="mt-3 md:mt-4 flex items-center justify-center gap-1">
        {isPositive ? (
          <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
        ) : (
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
        )}
        <span className={`text-xs md:text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {Math.abs(changePercent).toFixed(1)}%
        </span>
      </div>

      <div className="mt-2 text-center text-base md:text-lg font-bold text-yellow-500">{rating.toFixed(1)}/10</div>

      <Button
        variant="secondary"
        className="mt-3 md:mt-4 w-full rounded-lg bg-muted/60 text-[10px] md:text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-muted/80"
      >
        Add to Inventory
      </Button>
    </div>
  )
}
