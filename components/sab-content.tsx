"use client"

import { useState, useEffect } from "react"
import { ItemCard } from "./item-card"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { Button } from "./ui/button"

interface SABItem {
  id: string
  name: string
  game: string
  section: string
  image_url: string
  rarity: string
  demand: string
  pot?: string
  value?: number
}

const RARITIES = ["All", "Common", "Rare", "Epic", "Legendary", "Mythic", "Brainrot God", "Secret", "OG", "Admin"]

export function SABContent() {
  const [items, setItems] = useState<SABItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("All")

  useEffect(() => {
    fetchSABItems()
  }, [])

  const fetchSABItems = async () => {
    try {
      console.log("[v0] Fetching SAB brainrots from database")
      const response = await fetch("/api/items?game=SAB")
      const data = await response.json()
      console.log("[v0] Received SAB brainrots:", data.items?.length || 0)
      if (data.items && data.items.length > 0) {
        const rarities = [...new Set(data.items.map((item: SABItem) => item.rarity))]
        console.log("[v0] Unique rarity values in database:", rarities)
        console.log(
          "[v0] First 5 items:",
          data.items.slice(0, 5).map((item: SABItem) => ({ name: item.name, rarity: item.rarity })),
        )
      }
      setItems(data.items || [])
    } catch (error) {
      console.error("[v0] Error fetching SAB brainrots:", error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeRarity = (rarity: string): string => {
    if (!rarity) return "Common"

    // Normalize to title case and handle special cases
    const normalized = rarity.trim()

    // Map common variations to standard names
    const rarityMap: Record<string, string> = {
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
      mythic: "Mythic",
      "brainrot god": "Brainrot God",
      "brainrot god tier": "Brainrot God",
      secret: "Secret",
      og: "OG",
      admin: "Admin",
    }

    const lowerRarity = normalized.toLowerCase()
    return rarityMap[lowerRarity] || normalized
  }

  const getGroupedAndSortedItems = () => {
    let filtered = [...items]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Rarity filter
    if (selectedRarity !== "All") {
      filtered = filtered.filter((item) => normalizeRarity(item.rarity) === selectedRarity)
    }

    // Group by rarity
    const grouped: Record<string, SABItem[]> = {}

    filtered.forEach((item) => {
      const rarity = normalizeRarity(item.rarity)
      if (!grouped[rarity]) {
        grouped[rarity] = []
      }
      grouped[rarity].push(item)
    })

    console.log(
      "[v0] Grouped items by rarity:",
      Object.keys(grouped).map((r) => `${r}: ${grouped[r].length}`),
    )

    // Sort items within each group by value (lowest to highest)
    Object.keys(grouped).forEach((rarity) => {
      grouped[rarity].sort((a, b) => (a.value || 0) - (b.value || 0))
    })

    return grouped
  }

  const groupedItems = getGroupedAndSortedItems()
  const totalItems = items.length
  const filteredCount = Object.values(groupedItems).reduce((sum, group) => sum + group.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading SAB brainrots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">Steal a Brainrot Values</h1>
        <p className="text-muted-foreground text-balance">
          Real-time trading values for all SAB brainrots. Find the value of your brainrots and make better trades.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-3 pb-2">
          {RARITIES.map((rarity) => (
            <Button
              key={rarity}
              variant={selectedRarity === rarity ? "default" : "secondary"}
              size="lg"
              onClick={() => setSelectedRarity(rarity)}
              className="shrink-0 rounded-full px-6 text-base"
            >
              {rarity}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search brainrots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total: {totalItems} brainrots</span>
        <span>•</span>
        <span>Showing: {filteredCount} brainrots</span>
      </div>

      {filteredCount === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No brainrots found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {RARITIES.filter((rarity) => rarity !== "All" && groupedItems[rarity]?.length > 0).map((rarity) => (
            <div key={rarity} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{rarity}</h2>
                <span className="text-sm text-muted-foreground">({groupedItems[rarity].length} items)</span>
              </div>

              {/* Items Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedItems[rarity].map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
