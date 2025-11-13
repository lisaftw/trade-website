"use client"

import { useState, useEffect } from "react"
import { ItemCard } from "./item-card"
import { Input } from "./ui/input"
import { Search, Loader2 } from "lucide-react"
import { Button } from "./ui/button"

interface AdoptMeItem {
  id: string
  name: string
  game: string
  section: string
  image_url: string
  demand: string
  pot?: string
  rap_value?: number
  value_fr?: number
}

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Ultra-Rare", "Legendary", "Mythic"]

function formatValue(value: any): string {
  if (value === null || value === undefined) return "0"
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (isNaN(num)) return "0"
  return num % 1 === 0 ? num.toLocaleString() : num.toFixed(2)
}

function getSortValue(item: AdoptMeItem): number {
  if (item.value_fr !== null && item.value_fr !== undefined) {
    const frValue = typeof item.value_fr === "string" ? Number.parseFloat(item.value_fr) : item.value_fr
    if (!isNaN(frValue) && frValue > 0) return frValue
  }
  return item.rap_value || 0
}

export function AdoptMeContent() {
  const [items, setItems] = useState<AdoptMeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("All")
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchAdoptMeItems()
  }, [])

  const fetchAdoptMeItems = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const offset = loadMore ? items.length : 0
      const limit = 50

      const response = await fetch(`/api/items?game=Adopt Me&limit=${limit}&offset=${offset}`)
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        setItems((prev) => (loadMore ? [...prev, ...data.items] : data.items))
        setHasMore(data.pagination?.hasMore || false)
        setTotalCount(data.pagination?.total || data.items.length)
      }
    } catch (error) {
      console.error("Error fetching Adopt Me pets:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const normalizeSection = (section: string | null | undefined): string => {
    if (!section) return "Common"

    const normalized = section.trim().toLowerCase()

    const sectionMap: Record<string, string> = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      "ultra-rare": "Ultra-Rare",
      "ultra rare": "Ultra-Rare",
      ultrarare: "Ultra-Rare",
      legendary: "Legendary",
      mythic: "Mythic",
    }

    return sectionMap[normalized] || section.charAt(0).toUpperCase() + section.slice(1).toLowerCase()
  }

  const getGroupedAndSortedItems = () => {
    let filtered = [...items]

    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedRarity !== "All") {
      filtered = filtered.filter((item) => {
        const itemSection = normalizeSection(item.section)
        return itemSection === selectedRarity
      })
    }

    const grouped: Record<string, AdoptMeItem[]> = {}

    filtered.forEach((item) => {
      const section = normalizeSection(item.section)
      if (!grouped[section]) {
        grouped[section] = []
      }
      grouped[section].push(item)
    })

    Object.keys(grouped).forEach((section) => {
      grouped[section].sort((a, b) => getSortValue(b) - getSortValue(a))
    })

    return grouped
  }

  const handleLoadMore = () => {
    fetchAdoptMeItems(true)
  }

  const groupedItems = getGroupedAndSortedItems()
  const filteredCount = Object.values(groupedItems).reduce((sum, group) => sum + group.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading Adopt Me pets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">Adopt Me Pet Values</h1>
        <p className="text-muted-foreground text-balance">
          Real-time trading values for all Adopt Me pets. Find the value of your pets and make better trades.
        </p>
      </div>

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

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total: {totalCount} pets</span>
        <span>•</span>
        <span>Showing: {filteredCount} pets</span>
      </div>

      {filteredCount === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No pets found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {RARITIES.filter((rarity) => rarity !== "All" && groupedItems[rarity]?.length > 0).map((rarity) => (
            <div key={rarity} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{rarity}</h2>
                <span className="text-sm text-muted-foreground">({groupedItems[rarity].length} items)</span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
                {groupedItems[rarity].map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}

          {hasMore && !searchQuery && selectedRarity === "All" && (
            <div className="flex justify-center pt-8">
              <Button onClick={handleLoadMore} disabled={loadingMore} size="lg" className="min-w-[200px]">
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${totalCount - items.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
