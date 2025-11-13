"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

const GAMES = ["MM2", "SAB", "Adopt Me"] as const
const VISIBLE_GAMES = ["Adopt Me"] as const
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
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState<Game>("Adopt Me")
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      try {
        const res = await fetch(`/api/items?game=${encodeURIComponent(selectedGame)}`)
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
        }
      } catch (error) {
        console.error("Failed to fetch items:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()

    const interval = setInterval(fetchItems, 600000)
    return () => clearInterval(interval)
  }, [selectedGame])

  const filteredItems = items.filter((item) => (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {VISIBLE_GAMES.map((game) => {
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
