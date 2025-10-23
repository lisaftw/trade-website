"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { Search } from "lucide-react"
import Link from "next/link"

const GAMES = ["MM2", "SAB", "GAG", "Adopt Me"] as const
type Game = (typeof GAMES)[number]

interface Item {
  id: string
  game: Game
  name: string
  image_url: string
  rap_value: number
  exist_count: number
  change_percent: number
  rating: number
  last_updated_at: string
}

export function ValuesContent() {
  const [selectedGame, setSelectedGame] = useState<Game>("MM2")
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      try {
        console.log("[v0] Fetching items for game:", selectedGame)
        const res = await fetch(`/api/items?game=${encodeURIComponent(selectedGame)}`)
        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Received items:", data.items?.length || 0)
          setItems(data.items || [])
        } else {
          console.error("[v0] Failed to fetch items:", res.status, res.statusText)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch items:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()

    const interval = setInterval(fetchItems, 30000)
    return () => clearInterval(interval)
  }, [selectedGame])

  const filteredItems = items.filter((item) => (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GAMES.map((game) => {
          // SAB navigates to dedicated page
          if (game === "SAB") {
            return (
              <Button
                key={game}
                asChild
                variant="secondary"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                size="sm"
              >
                <Link href="/sab">{game}</Link>
              </Button>
            )
          }

          // Other games filter on this page
          return (
            <Button
              key={game}
              onClick={() => setSelectedGame(game)}
              variant={selectedGame === game ? "default" : "secondary"}
              className="rounded-full whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              {game}
            </Button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[380px] md:h-[420px] animate-pulse rounded-2xl bg-secondary/20" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/10 p-8 md:p-12 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            {searchQuery
              ? "No items found matching your search."
              : `No ${selectedGame} items available yet. Add items using the Discord bot!`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
