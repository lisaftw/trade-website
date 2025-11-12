"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

const GAMES = ["MM2", "SAB", "Adopt Me"] as const
type Game = (typeof GAMES)[number]

interface Item {
  id: string
  game: Game
  name: string
  section?: string
  image_url: string
  rap_value: number
  exist_count: number
  change_percent: number
  rating: number
  last_updated_at: string
}

const ADOPT_ME_RARITIES = ["All", "Common", "Uncommon", "Rare", "Ultra-Rare", "Legendary", "Mega Neon", "Neon"] as const

export function ValuesContent() {
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState<Game>("MM2")
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRarity, setSelectedRarity] = useState("All")

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

    const interval = setInterval(fetchItems, 30000)
    return () => clearInterval(interval)
  }, [selectedGame])

  const filteredItems = items.filter((item) => (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()))

  const normalizeSection = (section: string | null | undefined): string => {
    if (!section) return "Common"
    const normalized = section.trim()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
  }

  const getGroupedItems = () => {
    let filtered = [...filteredItems]

    if (selectedGame === "Adopt Me" && selectedRarity !== "All") {
      filtered = filtered.filter((item) => {
        const itemSection = normalizeSection(item.section)
        return itemSection === selectedRarity
      })
    }

    if (selectedGame !== "Adopt Me") {
      return { ungrouped: filtered }
    }

    const grouped: Record<string, Item[]> = {}
    filtered.forEach((item) => {
      const section = normalizeSection(item.section)
      if (!grouped[section]) {
        grouped[section] = []
      }
      grouped[section].push(item)
    })

    Object.keys(grouped).forEach((section) => {
      grouped[section].sort((a, b) => (b.rap_value || 0) - (a.rap_value || 0))
    })

    return grouped
  }

  const groupedItems = getGroupedItems()
  const displayCount = Object.values(groupedItems).reduce((sum, group) => sum + group.length, 0)

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GAMES.map((game) => {
          if (game === "SAB") {
            return (
              <Button
                key={game}
                onClick={() => router.push("/sab")}
                variant="secondary"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                size="sm"
              >
                {game}
              </Button>
            )
          }

          return (
            <Button
              key={game}
              onClick={() => {
                setSelectedGame(game)
                setSelectedRarity("All")
              }}
              variant={selectedGame === game ? "default" : "secondary"}
              className="rounded-full whitespace-nowrap flex-shrink-0"
              size="sm"
            >
              {game}
            </Button>
          )
        })}
      </div>

      {selectedGame === "Adopt Me" && (
        <div className="flex flex-wrap gap-2 pb-2">
          {ADOPT_ME_RARITIES.map((rarity) => (
            <Button
              key={rarity}
              variant={selectedRarity === rarity ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedRarity(rarity)}
              className="rounded-full whitespace-nowrap"
            >
              {rarity}
            </Button>
          ))}
        </div>
      )}

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
      ) : displayCount === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/10 p-8 md:p-12 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            {searchQuery
              ? "No items found matching your search."
              : `No ${selectedGame} items available yet. Add items using the Discord bot!`}
          </p>
        </div>
      ) : selectedGame === "Adopt Me" && selectedRarity === "All" ? (
        <div className="space-y-8">
          {ADOPT_ME_RARITIES.filter((rarity) => rarity !== "All" && groupedItems[rarity]?.length > 0).map((rarity) => (
            <div key={rarity} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold">{rarity}</h2>
                <span className="text-xs md:text-sm text-muted-foreground">({groupedItems[rarity].length} items)</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
                {groupedItems[rarity].map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
          {(groupedItems.ungrouped || Object.values(groupedItems).flat()).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
