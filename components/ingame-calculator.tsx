"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Plus, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatValue } from "@/lib/utils/format-value"

interface GameItem {
  id: string
  name: string
  value: number
  imageUrl?: string
  game: string
  value_f?: number
  value_r?: number
  value_n?: number
  value_fr?: number
  value_nfr?: number
  value_nf?: number
  value_nr?: number
  value_m?: number
  value_mf?: number
  value_mr?: number
  value_mfr?: number
  variant?: string
  rap_value?: number
  itemType?: string
}

type Variant = "F" | "R" | "N" | "M"

const VARIANT_CONFIG = {
  F: { label: "F", color: "bg-cyan-500" },
  R: { label: "R", color: "bg-pink-500" },
  N: { label: "N", color: "bg-[#8dc43e]" },
  M: { label: "M", color: "bg-purple-500" },
}

export function IngameCalculator() {
  const [selectedItems, setSelectedItems] = useState<GameItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [game, setGame] = useState<"MM2" | "SAB" | "Adopt Me" | null>(null)
  const [allItems, setAllItems] = useState<GameItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<"all" | "pets" | "eggs">("all")
  const [displayLimit, setDisplayLimit] = useState(100)
  const router = useRouter()

  const totalValue = selectedItems.reduce((sum, item) => {
    const itemValue = Number(item.value) || 0
    return sum + itemValue
  }, 0)

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
          value: item.rap_value ?? item.value ?? 0,
          game: item.game,
          imageUrl: item.imageUrl || item.image_url,
          value_f: item.value_f,
          value_r: item.value_r,
          value_n: item.value_n,
          value_fr: item.value_fr,
          value_nfr: item.value_nfr,
          value_nf: item.value_nf,
          value_nr: item.value_nr,
          value_m: item.value_m,
          value_mf: item.value_mf,
          value_mr: item.value_mr,
          value_mfr: item.value_mfr,
          rap_value: item.rap_value ?? 0,
        }))

        setAllItems(transformedItems)
      } catch (error) {
        console.error("Failed to fetch items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [game])

  const removeItem = useCallback((id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const addItem = useCallback(
    (item: GameItem) => {
      const hasVariants =
        (item.value_fr && item.value_fr > 0) ||
        (item.value_f && item.value_f > 0) ||
        (item.value_r && item.value_r > 0) ||
        (item.value_n && item.value_n > 0)
      
      const isEgg = !hasVariants

      const rawDefaultValue =
        game === "Adopt Me"
          ? isEgg 
            ? item.rap_value || 0
            : item.value_fr || item.value_n || item.value_f || item.value_r || item.value
          : item.value

      const defaultValue =
        typeof rawDefaultValue === "string" ? Number.parseFloat(rawDefaultValue) || 0 : rawDefaultValue || 0

      const newItem = {
        ...item,
        id: `${item.id}-${Date.now()}`,
        variant: isEgg ? undefined : "FR",
        value: defaultValue,
        itemType: isEgg ? "egg" : "pet",
      }
      setSelectedItems((prev) => [...prev, newItem])
      setIsSearchOpen(false)
      setSearchQuery("")
      setDisplayLimit(100)
    },
    [game],
  )

  const updateItemVariant = useCallback((itemId: string, selectedVariants: Set<Variant>) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item

        const hasF = selectedVariants.has("F")
        const hasR = selectedVariants.has("R")
        const hasN = selectedVariants.has("N")
        const hasM = selectedVariants.has("M")

        let variantKey: keyof GameItem
        let variantLabel: string

        if (hasM) {
          if (hasF && hasR) {
            variantKey = "value_mfr"
            variantLabel = "MFR"
          } else if (hasF) {
            variantKey = "value_mf"
            variantLabel = "MF"
          } else if (hasR) {
            variantKey = "value_mr"
            variantLabel = "MR"
          } else {
            variantKey = "value_m"
            variantLabel = "M"
          }
        } else if (hasN) {
          if (hasF && hasR) {
            variantKey = "value_nfr"
            variantLabel = "NFR"
          } else if (hasF) {
            variantKey = "value_nf"
            variantLabel = "NF"
          } else if (hasR) {
            variantKey = "value_nr"
            variantLabel = "NR"
          } else {
            variantKey = "value_n"
            variantLabel = "N"
          }
        } else {
          if (hasF && hasR) {
            variantKey = "value_fr"
            variantLabel = "FR"
          } else if (hasF) {
            variantKey = "value_f"
            variantLabel = "F"
          } else if (hasR) {
            variantKey = "value_r"
            variantLabel = "R"
          } else {
            variantKey = "value_fr"
            variantLabel = "FR"
          }
        }

        const value = item[variantKey]
        const numValue = value != null ? (typeof value === "string" ? Number.parseFloat(value) : value) : 0
        const finalValue = !isNaN(numValue) && numValue > 0 ? numValue : 0

        return {
          ...item,
          variant: variantLabel,
          value: finalValue,
        }
      }),
    )
  }, [])

  const filterItemsByCategory = (items: GameItem[]) => {
    if (game !== "Adopt Me" || selectedCategory === "all") return items
    
    return items.filter((item) => {
      const hasVariants =
        (item.value_fr && item.value_fr > 0) ||
        (item.value_f && item.value_f > 0) ||
        (item.value_r && item.value_r > 0) ||
        (item.value_n && item.value_n > 0)
      
      const isEgg = !hasVariants
      
      if (selectedCategory === "eggs") return isEgg
      if (selectedCategory === "pets") return !isEgg
      
      return true
    })
  }

  const displayedItems = filterItemsByCategory(
    searchQuery.trim()
      ? allItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : allItems
  )

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
    <div className="min-h-screen bg-black py-4 md:py-8">
      <div className="mx-auto max-w-4xl px-3 md:px-4">
        <div className="mb-3 md:mb-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 md:h-9 md:px-3">
            <Link href="/">
              <ArrowLeft className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4" />
              <span className="text-xs md:text-sm">Back</span>
            </Link>
          </Button>

          <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/80 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-white">
            <span className="mr-1 md:mr-2 inline-block h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-green-500" />
            <span className="hidden sm:inline">Game: </span>
            <span className="ml-1 font-medium">{game}</span>
            <button
              onClick={() => {
                setSelectedItems([])
                setSearchQuery("")
                setIsSearchOpen(false)
                setGame(null)
              }}
              className="ml-2 md:ml-3 rounded-full border border-gray-600 px-2 md:px-3 py-0.5 text-[10px] md:text-xs transition-colors hover:bg-gray-700"
            >
              Change
            </button>
          </div>
        </div>

        <div className="relative rounded-xl md:rounded-[2rem] border border-gray-700/50 md:border-2 bg-gradient-to-b from-gray-900/40 to-black/60 p-3 md:p-6 lg:p-8 backdrop-blur-sm">
          <div className="mb-4 md:mb-6 flex items-center justify-center">
            <Image 
              src="/logo-white.png" 
              alt="TRADER" 
              width={160} 
              height={48} 
              className="h-auto w-32 md:w-40 lg:w-48" 
              priority 
            />
          </div>

          <div className="mb-4 md:mb-6 text-center">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Your Items</h2>
            <p className="text-xs md:text-sm text-gray-400">Add items to calculate total value</p>
          </div>

          <div className="mb-4 md:mb-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
            <div
              className={cn(
                "relative aspect-square rounded-lg md:rounded-xl border border-gray-800/50 md:border-2",
                "bg-[#0d0d0d]",
              )}
            >
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 transition-colors hover:text-white"
              >
                <Plus className="h-5 w-5 md:h-6 md:w-6 stroke-[2.5]" />
                <span className="text-[7px] md:text-[8px] font-semibold tracking-wide">Add Item</span>
              </button>
            </div>

            {selectedItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative aspect-square rounded-lg md:rounded-xl border border-gray-700/50 md:border-2",
                  "bg-[#1a1a1a] hover:border-gray-600",
                )}
              >
                <div className="relative flex h-full w-full flex-col p-1 md:p-1.5">
                  <div className="relative flex-1">
                    <Image
                      src={item.imageUrl || "/itemplaceholder.png"}
                      alt={item.name}
                      fill
                      className="rounded-lg object-contain p-0.5 md:p-1"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute right-0 top-0 rounded-full bg-red-500/90 p-0.5 md:p-1 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      <X className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                    </button>
                  </div>

                  <div className="mt-0.5 md:mt-1 space-y-0.5 text-center">
                    <p className="truncate text-[8px] md:text-[9px] font-semibold leading-tight text-white">{item.name}</p>
                    <p className="text-[7px] md:text-[8px] text-gray-400">{formatValue(item.value)}</p>

                    {game === "Adopt Me" && item.itemType === "pet" && (
                      <VariantSelector itemId={item.id} onVariantChange={updateItemVariant} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg md:rounded-xl border border-brand/50 md:border-2 bg-brand/10 p-4 md:p-6 text-center">
            <p className="text-xs md:text-sm text-gray-400">Total Value</p>
            <p className="mt-1 md:mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-brand">{formatValue(totalValue)}</p>
            <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-gray-400">{selectedItems.length} items</p>
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-3 md:mt-4 flex justify-center">
              <Button
                onClick={() => {
                  setSelectedItems([])
                  setSearchQuery("")
                }}
                variant="outline"
                size="sm"
                className="text-xs md:text-sm"
              >
                Clear All Items
              </Button>
            </div>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-4">
          <div className="w-full max-w-2xl rounded-xl md:rounded-2xl border border-gray-700 md:border-2 bg-gray-900 p-4 md:p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="mb-3 md:mb-4 flex items-center justify-between">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">Add Item</h3>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setDisplayLimit(100)
                }}
                className="rounded-full p-1.5 md:p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {game === "Adopt Me" && (
              <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as "all" | "pets" | "eggs")} className="mb-3 md:mb-4">
                <TabsList className="grid w-full grid-cols-3 h-8 md:h-10">
                  <TabsTrigger value="all" className="text-xs md:text-sm">All Items</TabsTrigger>
                  <TabsTrigger value="pets" className="text-xs md:text-sm">Pets</TabsTrigger>
                  <TabsTrigger value="eggs" className="text-xs md:text-sm">Eggs</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="relative mb-3 md:mb-4">
              <Search className="absolute left-2.5 md:left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setDisplayLimit(100)
                }}
                className="border-gray-700 bg-gray-800 pl-9 md:pl-10 text-sm md:text-base text-white placeholder:text-gray-500 h-9 md:h-10"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-400">
                  <div className="mb-2 md:mb-3 h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
                  <p className="text-xs md:text-sm">Loading {game} items...</p>
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="py-8 md:py-12 text-center text-xs md:text-sm text-gray-400">
                  {searchQuery 
                    ? `No ${selectedCategory === "all" ? "items" : selectedCategory} found matching "${searchQuery}"` 
                    : `No ${selectedCategory === "all" ? "items" : selectedCategory} available for ${game}`
                  }
                </div>
              ) : (
                <>
                  <div className="mb-1.5 md:mb-2 text-center text-[10px] md:text-xs text-gray-400">
                    Showing {Math.min(displayLimit, displayedItems.length)} of {displayedItems.length} {displayedItems.length === 1 ? "item" : "items"}
                  </div>
                  {displayedItems.slice(0, displayLimit).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="flex w-full items-center gap-2 md:gap-4 rounded-lg md:rounded-xl border border-gray-700 bg-gray-800 p-2 md:p-3 text-left transition-all hover:border-gray-600 hover:bg-gray-750"
                    >
                      <Image
                        src={item.imageUrl || "/itemplaceholder.png"}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-contain flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-xs md:text-sm truncate">{item.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-400">{item.game}</p>
                      </div>
                      <p className="text-sm md:text-base lg:text-lg font-bold text-white whitespace-nowrap">{formatValue(item.value)}</p>
                    </button>
                  ))}
                  
                  {displayLimit < displayedItems.length && (
                    <div className="relative flex justify-center pt-3 md:pt-4 pb-2">
                      <Button
                        onClick={() => setDisplayLimit(prev => prev + 100)}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs md:text-sm"
                      >
                        Load More ({displayedItems.length - displayLimit} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VariantSelector({
  itemId,
  onVariantChange,
}: {
  itemId: string
  onVariantChange: (itemId: string, variants: Set<Variant>) => void
}) {
  const [selectedVariants, setSelectedVariants] = useState<Set<Variant>>(new Set(["F", "R"]))

  const toggleVariant = (variant: Variant) => {
    const newVariants = new Set(selectedVariants)

    if (variant === "N" || variant === "M") {
      newVariants.delete("N")
      newVariants.delete("M")
      if (!selectedVariants.has(variant)) {
        newVariants.add(variant)
      }
    } else {
      if (newVariants.has(variant)) {
        newVariants.delete(variant)
      } else {
        newVariants.add(variant)
      }
    }

    setSelectedVariants(newVariants)
    onVariantChange(itemId, newVariants)
  }

  return (
    <div className="flex items-center justify-center gap-0.5">
      {(Object.keys(VARIANT_CONFIG) as Variant[]).map((variant) => {
        const isSelected = selectedVariants.has(variant)
        const config = VARIANT_CONFIG[variant]

        return (
          <button
            key={variant}
            onClick={(e) => {
              e.stopPropagation()
              toggleVariant(variant)
            }}
            className={`
              w-4 h-4 md:w-5 md:h-5 rounded-full font-bold text-[7px] md:text-[8px] text-white
              transition-all duration-200 shadow-sm
              ${isSelected ? config.color : "bg-gray-600"}
              ${isSelected ? "scale-105 ring-1 ring-white" : "hover:scale-105"}
            `}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
