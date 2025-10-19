"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ItemCardProps {
  item: {
    id: string
    name: string
    image_url: string
    rap_value: number
    exist_count: number
    change_percent: number
    rating: number
    last_updated_at: string
  }
}

function formatValue(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  return value.toString()
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
  const isPositive = item.change_percent >= 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/10 p-4 transition-all hover:border-border/60 hover:bg-secondary/20">
      {/* Top stats */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          RAP: {formatValue(item.rap_value)}
        </div>
        <div className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          EXIST: {item.exist_count.toLocaleString()}
        </div>
      </div>

      {/* Item image */}
      <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card/60 shadow-lg">
        <Image
          src={item.image_url || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Item name */}
      <h3 className="mt-3 text-center text-sm font-semibold line-clamp-2">{item.name}</h3>

      {/* Last updated */}
      <p className="mt-1 text-center text-xs text-muted-foreground">Last Updated: {getTimeAgo(item.last_updated_at)}</p>

      {/* Change percent */}
      <div className="mt-4 flex items-center justify-center gap-1">
        {isPositive ? (
          <ChevronUp className="h-4 w-4 text-green-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {Math.abs(item.change_percent)}%
        </span>
      </div>

      {/* Rating */}
      <div className="mt-2 text-center text-lg font-bold text-yellow-500">{item.rating.toFixed(1)}/10</div>

      {/* Add to inventory button */}
      <Button
        variant="secondary"
        className="mt-4 w-full rounded-lg bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-muted/80"
      >
        Add to Inventory
      </Button>
    </div>
  )
}
