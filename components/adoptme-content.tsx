"use client"

import { useState, useEffect, useMemo } from "react"
import { ItemCard } from "./item-card"
import { Input } from "./ui/input"
import { Search, Loader2 } from 'lucide-react'
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { useItems, type Item } from "@/lib/contexts/items-context"

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
  value_f?: number
  value_r?: number
  value_n?: number
}

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Ultra-Rare", "Legendary", "Mythic"]

function formatValue(value: any): string {
  if (value === null || value === undefined) return "0"
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (isNaN(num)) return "0"
  // For whole numbers, use locale formatting; for decimals, show full precision
  return num % 1 === 0 ? num.toLocaleString() : num.toString()
}

function getSortValue(item: AdoptMeItem): number {
  if (item.value_fr !== null && item.value_fr !== undefined) {
    const frValue = typeof item.value_fr === "string" ? Number.parseFloat(item.value_fr) : item.value_fr
    if (!isNaN(frValue) && frValue > 0) return frValue
  }
  return item.rap_value || 0
}

function isEgg(item: AdoptMeItem): boolean {
  const hasVariants =
    (item.value_fr !== null && item.value_fr !== undefined && item.value_fr > 0) ||
    (item.value_f !== null && item.value_f !== undefined && item.value_f > 0) ||
    (item.value_r !== null && item.value_r !== undefined && item.value_r > 0) ||
    (item.value_n !== null && item.value_n !== undefined && item.value_n > 0)
  
  return !hasVariants
}

export function AdoptMeContent() {
  const { getItemsByGame, isLoading } = useItems()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRarity, setSelectedRarity] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "pets" | "eggs">("all")
  const [displayLimit, setDisplayLimit] = useState(100)

  const allItems = useMemo(() => getItemsByGame("Adopt Me"), [getItemsByGame])

  const getGroupedAndSortedItems = () => {
    let filtered = [...allItems]

    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedRarity !== "All") {
      filtered = filtered.filter((item) => {
        const itemSection = normalizeSection(item.section)
        return itemSection === selectedRarity
      })
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const itemIsEgg = isEgg(item)
        if (selectedCategory === "eggs") return itemIsEgg
        if (selectedCategory === "pets") return !itemIsEgg
        return true
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

  const groupedItems = getGroupedAndSortedItems()
  const filteredCount = Object.values(groupedItems).reduce((sum, group) => sum + group.length, 0)

  if (isLoading) {
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="lg"
            onClick={() => setSelectedCategory("all")}
            className="shrink-0 rounded-lg px-6"
          >
            All Items
          </Button>
          <Button
            variant={selectedCategory === "pets" ? "default" : "outline"}
            size="lg"
            onClick={() => setSelectedCategory("pets")}
            className="shrink-0 rounded-lg px-6"
          >
            Pets
          </Button>
          <Button
            variant={selectedCategory === "eggs" ? "default" : "outline"}
            size="lg"
            onClick={() => setSelectedCategory("eggs")}
            className="shrink-0 rounded-lg px-6"
          >
            Eggs
          </Button>
        </div>

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
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total: {allItems.length} pets</span>
        <span>•</span>
        <span>Showing: {filteredCount} pets</span>
      </div>

      {filteredCount === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No pets found matching your filters.</p>
        </div>
      ) : (
        <div className="relative space-y-12">
          {RARITIES.filter((rarity) => rarity !== 'All' && groupedItems[rarity]?.length > 0).map((rarity) => (
            <div key={rarity} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{rarity}</h2>
                <span className="text-sm text-muted-foreground">({groupedItems[rarity].length} items)</span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,200px))]">
                {groupedItems[rarity].slice(0, displayLimit).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}

          {filteredCount > displayLimit && (
            <div className="relative flex justify-center pt-8 pb-4">
              <Button onClick={() => setDisplayLimit(displayLimit + 100)} size="lg" className="min-w-[200px]">
                Load More ({filteredCount - displayLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
