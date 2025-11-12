"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

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
  const [game, setGame] = useState<"MM2" | "SAB" | "Adopt Me" | null>(null)

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
      <div className="space-y-6 md:space-y-8 px-3 md:px-0">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide text-white">Trade Calculator</h1>
          <p className="mt-2 text-xs md:text-sm text-gray-400">Select a game to start trading</p>
        </div>

        <div className="mb-6 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <span aria-hidden="true">←</span>
              <span className="ml-2">Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
          {(
            [
              { name: "MM2", icon: "/game-icons/mm2-gray.png", desc: "Murder Mystery 2" },
              { name: "SAB", icon: "/game-icons/sab-gray.png", desc: "Sword Art Blade" },
              { name: "Adopt Me", icon: "/game-icons/adoptme-gray.png", desc: "Adopt Me Pets" },
            ] as const
          ).map((g) => (
            <button
              key={g.name}
              onClick={() => setGame(g.name)}
              className="group relative overflow-hidden rounded-xl border-2 border-gray-700/50 bg-gradient-to-b from-gray-900/60 to-black/80 p-6 md:p-8 text-center transition-all hover:border-gray-600 hover:shadow-xl hover:shadow-gray-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 h-24 md:h-32 w-24 md:w-32 relative">
                  <Image
                    src={g.icon || "/placeholder.svg"}
                    alt={g.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <p className="text-xl md:text-2xl font-bold text-white mb-1">{g.name}</p>
                <p className="text-xs md:text-sm text-gray-400">{g.desc}</p>
              </div>
              {/* Decorative gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-4 md:py-6">
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        <div className="mb-2 md:mb-3 text-center">
          <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/80 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-white">
            <span className="mr-1 md:mr-1.5 inline-block h-1 md:h-1.5 w-1 md:w-1.5 rounded-full bg-green-500" />
            Selected game: <span className="ml-1 font-medium">{game}</span>
            <button
              onClick={() => {
                setYourItems([])
                setTheirItems([])
                setSearchQuery("")
                setActiveColumn(null)
                setGame(null)
              }}
              className="ml-1.5 md:ml-2 rounded-full border border-gray-600 px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] transition-colors hover:bg-gray-700"
            >
              Change
            </button>
          </div>
        </div>

        <div className="relative rounded-xl md:rounded-2xl border border-gray-700/50 md:border-2 bg-gradient-to-b from-gray-900/40 to-black/60 p-3 md:p-4 lg:p-6 backdrop-blur-sm">
          <div className="mb-3 md:mb-4 flex items-center justify-center">
            <Image
              src="/trader-logo.png"
              alt="TRADER"
              width={200}
              height={60}
              className="h-auto w-32 md:w-40"
              priority
            />
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
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
  selectedGame: "MM2" | "SAB" | "Adopt Me"
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
  const [allItems, setAllItems] = useState<TradeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive) {
      onSearchChange("")
      return
    }

    const fetchAllItems = async () => {
      setIsLoading(true)
      setError(null)
      console.log("[v0] Loading all items for game:", selectedGame)

      try {
        const params = new URLSearchParams({ game: selectedGame })
        const response = await fetch(`/api/items?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch items")
        }

        const data = await response.json()
        console.log("[v0] Loaded items count:", data.items?.length || 0)

        const transformedItems = (data.items || []).map((item: any) => ({
          id: item._id || item.id || item.name,
          name: item.name,
          value: item.value ?? item.rap_value ?? 0,
          game: item.game,
          imageUrl: item.image_url || "/placeholder.svg",
        }))

        setAllItems(transformedItems)
      } catch (err) {
        console.error("[v0] Failed to fetch items:", err)
        setError("Failed to load items. Please try again.")
        setAllItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllItems()
  }, [isActive, selectedGame])

  const displayedItems = searchQuery.trim()
    ? allItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems

  const slots = Array.from({ length: 9 }, (_, i) => items[i] || null)

  return (
    <div className="flex flex-col">
      <div className="mb-2 md:mb-3 flex justify-center">
        <div className="rounded-full border border-gray-600/80 md:border-2 bg-black/90 px-4 md:px-6 py-1 md:py-1.5 shadow-lg">
          <span className="text-sm md:text-base font-bold tracking-wide text-white">{title}</span>
        </div>
      </div>

      <div className="mb-3 md:mb-4 grid grid-cols-3 gap-1.5 md:gap-2.5">
        {slots.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative h-20 md:h-24 rounded-lg md:rounded-xl border border-gray-700/50 md:border-2 transition-all",
              item ? "bg-[#1a1a1a] hover:border-gray-600" : "bg-[#0d0d0d]",
            )}
          >
            {index === items.length && !item ? (
              <button
                onClick={onAddClick}
                className="flex h-full w-full flex-col items-center justify-center gap-1 md:gap-1.5 text-gray-400 transition-colors hover:text-white"
              >
                <Plus className="h-5 md:h-6 w-5 md:w-6 stroke-[2.5]" />
                <span className="text-[9px] md:text-[10px] font-semibold tracking-wide">Add Item</span>
              </button>
            ) : item ? (
              <div className="group relative h-full w-full p-1 md:p-1.5">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="rounded-lg object-contain"
                />
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute right-1 md:right-1.5 top-1 md:top-1.5 rounded-full bg-red-500/90 p-0.5 md:p-1 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <X className="h-2.5 md:h-3 w-2.5 md:w-3 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/90 p-1 md:p-1.5 text-center">
                  <p className="truncate text-[9px] md:text-[10px] font-semibold text-white">{item.name}</p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-1 md:px-2">
        <span className="text-sm md:text-base font-bold tracking-wide text-white">VALUE</span>
        <span className="text-sm md:text-base font-bold text-white">{total.toLocaleString()}</span>
      </div>

      {isActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-4">
          <div className="w-full max-w-2xl rounded-lg md:rounded-xl border border-gray-700 md:border-2 bg-gray-900 p-3 md:p-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-2 md:mb-3 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-white">Add Item to {title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1 md:p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-3.5 md:h-4 w-3.5 md:w-4" />
              </button>
            </div>

            <div className="relative mb-2 md:mb-3">
              <Search className="absolute left-2 md:left-2.5 top-1/2 h-3.5 md:h-4 w-3.5 md:w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-gray-700 bg-gray-800 pl-8 md:pl-9 text-xs md:text-sm text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            <div className="max-h-60 md:max-h-80 space-y-1 md:space-y-1.5 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-10 text-gray-400">
                  <div className="mb-2 h-5 w-5 md:h-6 md:w-6 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                  <p className="text-xs md:text-sm">Loading {selectedGame} items...</p>
                </div>
              ) : error ? (
                <div className="py-8 md:py-10 text-center text-xs md:text-sm text-red-400">{error}</div>
              ) : displayedItems.length === 0 && searchQuery ? (
                <div className="py-8 md:py-10 text-center text-xs md:text-sm text-gray-400">
                  No items found matching "{searchQuery}"
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="py-8 md:py-10 text-center text-xs md:text-sm text-gray-400">
                  No items available for {selectedGame}
                </div>
              ) : (
                <>
                  <div className="mb-1 md:mb-1.5 text-center text-[10px] md:text-xs text-gray-400">
                    Showing {displayedItems.length} {displayedItems.length === 1 ? "item" : "items"}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                  {displayedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onAddItem(item)}
                      className="flex w-full items-center gap-2 md:gap-3 rounded-lg border border-gray-700 bg-gray-800 p-2 md:p-2.5 text-left transition-all hover:border-gray-600 hover:bg-gray-750"
                    >
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-8 w-8 md:h-10 md:w-10 rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium text-white">{item.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-400">{item.game}</p>
                      </div>
                      <p className="text-sm md:text-base font-bold text-white">{item.value.toLocaleString()}</p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
