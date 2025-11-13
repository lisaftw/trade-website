"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Plus, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GameItem {
  id: string
  name: string
  value: number
  imageUrl?: string
  game: string
}

export function IngameCalculator() {
  const [selectedItems, setSelectedItems] = useState<GameItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [game, setGame] = useState<"MM2" | "SAB" | "Adopt Me" | null>(null)
  const [allItems, setAllItems] = useState<GameItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0)

  const handleGameSelect = (selectedGame: "MM2" | "SAB" | "Adopt Me") => {
    if (selectedGame === "SAB") {
      router.push("/sab-calculator")
    } else {
      setGame(selectedGame)
    }
  }

  useEffect(() => {
    if (!game) return

    const fetchItems = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/items?game=${game}`)
        const data = await response.json()

        const transformedItems = (data.items || []).map((item: any) => ({
          id: item._id || item.id || item.name,
          name: item.name,
          value: item.value ?? item.rap_value ?? 0,
          game: item.game,
          imageUrl: item.imageUrl || item.image_url,
        }))

        setAllItems(transformedItems)
      } catch (error) {
        console.error("[v0] Failed to fetch items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [game])

  const removeItem = useCallback((id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addItem = useCallback((item: GameItem) => {
    const newItem = { ...item, id: `${item.id}-${Date.now()}` }
    setSelectedItems((prev) => [...prev, newItem])
    setIsSearchOpen(false)
    setSearchQuery("")
  }, [])

  const displayedItems = searchQuery.trim()
    ? allItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems

  const visibleGames = ["Adopt Me"] as const

  if (!game) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-wide text-white md:text-4xl">In-game Calculator</h1>
          <p className="mt-2 text-sm text-gray-400">Select a game to calculate your items</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {visibleGames.map((g) => (
            <button
              key={g}
              onClick={() => handleGameSelect(g)}
              className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 text-left transition-all hover:border-gray-600 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <p className="text-lg font-semibold text-white">{g}</p>
              <p className="mt-1 text-xs text-gray-400">Calculate {g} items</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/80 px-4 py-2 text-sm text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            Game: <span className="ml-1 font-medium">{game}</span>
            <button
              onClick={() => {
                setSelectedItems([])
                setSearchQuery("")
                setIsSearchOpen(false)
                setGame(null)
              }}
              className="ml-3 rounded-full border border-gray-600 px-3 py-0.5 text-xs transition-colors hover:bg-gray-700"
            >
              Change
            </button>
          </div>
        </div>

        <div className="relative rounded-[2rem] border-2 border-gray-700/50 bg-gradient-to-b from-gray-900/40 to-black/60 p-6 backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center justify-center">
            <Image src="/trader-logo.png" alt="TRADER" width={280} height={84} className="h-auto w-56" priority />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Your Items</h2>
            <p className="text-sm text-gray-400">Add items to calculate total value</p>
          </div>

          {/* Items Grid */}
          <div className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-4">
            {/* Add Item Button */}
            <div
              className={cn(
                "relative aspect-square rounded-2xl border-2 transition-all",
                "border-gray-800/50 bg-[#0d0d0d]",
              )}
            >
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <Plus className="h-8 w-8 stroke-[2.5]" />
                <span className="text-xs font-semibold tracking-wide">Add Item</span>
              </button>
            </div>

            {/* Selected Items */}
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative aspect-square rounded-2xl border-2 transition-all",
                  "border-gray-700/50 bg-[#1a1a1a] hover:border-gray-600",
                )}
              >
                <div className="relative h-full w-full p-2">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="rounded-xl object-contain"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-black/90 p-2 text-center">
                    <p className="truncate text-xs font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Value Display */}
          <div className="rounded-xl border-2 border-brand/50 bg-brand/10 p-6 text-center">
            <p className="text-sm text-gray-400">Total Value</p>
            <p className="mt-2 text-4xl font-bold text-brand">{totalValue.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-400">{selectedItems.length} items</p>
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  setSelectedItems([])
                  setSearchQuery("")
                }}
                variant="outline"
              >
                Clear All Items
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-2xl border-2 border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Item</h3>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                }}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                  <p>Loading {game} items...</p>
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  {searchQuery ? `No items found matching "${searchQuery}"` : `No items available for ${game}`}
                </div>
              ) : (
                <>
                  <div className="mb-2 text-center text-sm text-gray-400">
                    Showing {displayedItems.length} {displayedItems.length === 1 ? "item" : "items"}
                  </div>
                  {displayedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="flex w-full items-center gap-4 rounded-xl border border-gray-700 bg-gray-800 p-3 text-left transition-all hover:border-gray-600 hover:bg-gray-750"
                    >
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-contain"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.game}</p>
                      </div>
                      <p className="text-lg font-bold text-white">{item.value.toLocaleString()}</p>
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
