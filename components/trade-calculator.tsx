"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { X, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useDebounce } from "@/lib/hooks/use-debounce"

interface TradeItem {
  id: string
  name: string
  value: number
  imageUrl?: string
  game: string
}

export function TradeCalculator() {
  const [yourItems, setYourItems] = useState<TradeItem[]>([])
  const [theirItems, setTheirItems] = useState<TradeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeColumn, setActiveColumn] = useState<"yours" | "theirs" | null>(null)
  const [game, setGame] = useState<"MM2" | "SAB" | "GAG" | "Adopt Me" | null>(null)

  const yourTotal = yourItems.reduce((sum, item) => sum + item.value, 0)
  const theirTotal = theirItems.reduce((sum, item) => sum + item.value, 0)

  const removeItem = useCallback((id: string, column: "yours" | "theirs") => {
    if (column === "yours") {
      setYourItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setTheirItems((prev) => prev.filter((item) => item.id !== id))
    }
  }, [])

  const addItem = useCallback((item: TradeItem, column: "yours" | "theirs") => {
    const newItem = { ...item, id: `${item.id}-${Date.now()}` }
    if (column === "yours") {
      setYourItems((prev) => [...prev, newItem])
    } else {
      setTheirItems((prev) => [...prev, newItem])
    }
    setActiveColumn(null)
    setSearchQuery("")
  }, [])

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide text-white md:text-4xl">Trade Calculator</h1>
          <p className="mt-2 text-sm text-gray-400">Select a game to start trading</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {(["MM2", "SAB", "GAG", "Adopt Me"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 text-left transition-all hover:border-gray-600 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <p className="text-lg font-semibold text-white">{g}</p>
              <p className="mt-1 text-xs text-gray-400">Load items for {g}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header with game selection */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/80 px-4 py-2 text-sm text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            Selected game: <span className="ml-1 font-medium">{game}</span>
            <button
              onClick={() => {
                setYourItems([])
                setTheirItems([])
                setSearchQuery("")
                setActiveColumn(null)
                setGame(null)
              }}
              className="ml-3 rounded-full border border-gray-600 px-3 py-0.5 text-xs transition-colors hover:bg-gray-700"
            >
              Change
            </button>
          </div>
        </div>

        {/* Main Trade Interface */}
        <div className="relative rounded-[2rem] border-2 border-gray-700/50 bg-gradient-to-b from-gray-900/40 to-black/60 p-8 backdrop-blur-sm md:p-12">
          {/* TRADER Logo */}
          <div className="mb-10 flex items-center justify-center">
            <Image src="/trader-logo.png" alt="TRADER" width={400} height={120} className="h-auto w-80" priority />
          </div>

          {/* Two Column Layout: You vs Them */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Your Side */}
            <TradeGrid
              title="You"
              items={yourItems}
              total={yourTotal}
              onRemove={(id) => removeItem(id, "yours")}
              onAddClick={() => setActiveColumn("yours")}
              isActive={activeColumn === "yours"}
              onClose={() => setActiveColumn(null)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddItem={(item) => addItem(item, "yours")}
              selectedGame={game}
            />

            {/* Their Side */}
            <TradeGrid
              title="Them"
              items={theirItems}
              total={theirTotal}
              onRemove={(id) => removeItem(id, "theirs")}
              onAddClick={() => setActiveColumn("theirs")}
              isActive={activeColumn === "theirs"}
              onClose={() => setActiveColumn(null)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddItem={(item) => addItem(item, "theirs")}
              selectedGame={game}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface TradeGridProps {
  title: string
  items: TradeItem[]
  total: number
  onRemove: (id: string) => void
  onAddClick: () => void
  isActive: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddItem: (item: TradeItem) => void
  selectedGame: "MM2" | "SAB" | "GAG" | "Adopt Me"
}

function TradeGrid({
  title,
  items,
  total,
  onRemove,
  onAddClick,
  isActive,
  onClose,
  searchQuery,
  onSearchChange,
  onAddItem,
  selectedGame,
}: TradeGridProps) {
  const [searchResults, setSearchResults] = useState<TradeItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (!isActive || debouncedSearch.length < 2) {
      setSearchResults([])
      return
    }

    const fetchItems = async () => {
      setIsSearching(true)
      try {
        const params = new URLSearchParams({ game: selectedGame, q: debouncedSearch })
        const response = await fetch(`/api/items?${params.toString()}`)
        const data = await response.json()
        setSearchResults(
          (data.items || []).map((item: any) => ({
            id: item._id || item.id || item.name,
            name: item.name,
            value: item.value ?? item.rap_value ?? 0,
            game: item.game,
            imageUrl: item.imageUrl || item.image_url,
          })),
        )
      } catch (error) {
        console.error("[v0] Failed to fetch items:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    fetchItems()
  }, [debouncedSearch, isActive, selectedGame])

  // Create 9 slots for the 3x3 grid
  const slots = Array.from({ length: 9 }, (_, i) => items[i] || null)

  return (
    <div className="flex flex-col">
      {/* Title Button */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-full border-2 border-gray-600/80 bg-black/90 px-10 py-2.5 shadow-lg">
          <span className="text-xl font-bold tracking-wide text-white">{title}</span>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {slots.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative aspect-square rounded-2xl border-2 transition-all",
              item ? "border-gray-700/50 bg-[#1a1a1a] hover:border-gray-600" : "border-gray-800/50 bg-[#0d0d0d]",
            )}
          >
            {index === 0 && !item ? (
              // Updated Add Item button styling
              <button
                onClick={onAddClick}
                className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400 transition-colors hover:text-white"
              >
                <Plus className="h-10 w-10 stroke-[2.5]" />
                <span className="text-sm font-semibold tracking-wide">Add Item</span>
              </button>
            ) : item ? (
              // Slot with item
              <div className="group relative h-full w-full p-2">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="rounded-xl object-cover"
                />
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-black/90 p-2 text-center">
                  <p className="truncate text-xs font-semibold text-white">{item.name}</p>
                </div>
              </div>
            ) : (
              // Empty slot
              <div className="h-full w-full" />
            )}
          </div>
        ))}
      </div>

      {/* VALUE Display */}
      <div className="flex items-center justify-between px-2">
        <span className="text-2xl font-bold tracking-wide text-white">VALUE</span>
        <span className="text-2xl font-bold text-white">${total.toLocaleString()}</span>
      </div>

      {/* Search Modal */}
      {isActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Item to {title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {isSearching ? (
                <div className="py-12 text-center text-gray-400">Searching...</div>
              ) : searchResults.length === 0 && debouncedSearch.length >= 2 ? (
                <div className="py-12 text-center text-gray-400">No items found</div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-gray-400">Type to search items</div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onAddItem(item)}
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-3 text-left transition-all hover:border-gray-600 hover:bg-gray-750"
                  >
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.game}</p>
                    </div>
                    <p className="text-lg font-bold text-white">${item.value.toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
