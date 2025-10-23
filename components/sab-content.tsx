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
const DEMANDS = ["All", "Very High", "High", "Medium", "Low", "Very Low"]

export function SABContent() {
  const [items, setItems] = useState<SABItem[]>([])
  const [filteredItems, setFilteredItems] = useState<SABItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("All")
  const [selectedDemand, setSelectedDemand] = useState("All")

  useEffect(() => {
    fetchSABItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, selectedRarity, selectedDemand])

  const fetchSABItems = async () => {
    try {
      console.log("[v0] Fetching SAB brainrots from database")
      const response = await fetch("/api/items?game=SAB")
      const data = await response.json()
      console.log("[v0] Received SAB brainrots:", data.items?.length || 0)
      setItems(data.items || [])
    } catch (error) {
      console.error("[v0] Error fetching SAB brainrots:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Rarity filter
    if (selectedRarity !== "All") {
      filtered = filtered.filter((item) => item.rarity === selectedRarity)
    }

    // Demand filter
    if (selectedDemand !== "All") {
      filtered = filtered.filter((item) => item.demand === selectedDemand)
    }

    setFilteredItems(filtered)
  }

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
        {/* Rarity Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {RARITIES.map((rarity) => (
            <Button
              key={rarity}
              variant={selectedRarity === rarity ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedRarity(rarity)}
              className="shrink-0 rounded-full"
            >
              {rarity}
            </Button>
          ))}
        </div>

        {/* Demand Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DEMANDS.map((demand) => (
            <Button
              key={demand}
              variant={selectedDemand === demand ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedDemand(demand)}
              className="shrink-0 rounded-full"
            >
              {demand}
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
        <span>Total: {items.length} brainrots</span>
        <span>•</span>
        <span>Showing: {filteredItems.length} brainrots</span>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No brainrots found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
