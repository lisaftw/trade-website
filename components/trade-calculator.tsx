"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search, Plus, Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { AdoptMeInlineVariantSelector } from "./adoptme-inline-variant-selector"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatValue } from "@/lib/utils/format-value"

interface TradeItem {
  id: string
  name: string
  value: number
  imageUrl?: string
  game: string
  variantLabel?: string
  value_f?: number | string | null
  value_r?: number | string | null
  value_n?: number | string | null
  value_fr?: number | string | null
  value_nf?: number | string | null
  value_nr?: number | string | null
  value_nfr?: number | string | null
  value_m?: number | string | null
  value_mf?: number | string | null
  value_mr?: number | string | null
  value_mfr?: number | string | null
  rap_value?: number | string | null
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

  const updateItemValue = useCallback((id: string, column: "yours" | "theirs", newValue: number, newVariant: string) => {
    if (column === "yours") {
      setYourItems((prev) => prev.map(item => 
        item.id === id ? { ...item, value: newValue, variantLabel: newVariant } : item
      ))
    } else {
      setTheirItems((prev) => prev.map(item => 
        item.id === id ? { ...item, value: newValue, variantLabel: newVariant } : item
      ))
    }
  }, [])

  const handleItemClick = useCallback((item: any, column: "yours" | "theirs") => {
    const newItem: TradeItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      value: item.value ?? item.rap_value ?? 0,
      imageUrl: item.imageUrl || item.image_url,
      game: item.game,
      value_f: item.value_f,
      value_r: item.value_r,
      value_n: item.value_n,
      value_fr: item.value_fr,
      value_nf: item.value_nf,
      value_nr: item.value_nr,
      value_nfr: item.value_nfr,
      value_m: item.value_m,
      value_mf: item.value_mf,
      value_mr: item.value_mr,
      value_mfr: item.value_mfr,
      variantLabel: item.variantLabel,
      rap_value: item.rap_value,
    }
    if (column === "yours") {
      setYourItems((prev) => [...prev, newItem])
    } else {
      setTheirItems((prev) => [...prev, newItem])
    }
    setActiveColumn(null)
    setSearchQuery("")
  }, [])

  const visibleGames = ["Adopt Me"] as const

  if (!game) {
    return (
      <div className="space-y-3 md:space-y-4 px-3 md:px-0">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide text-white">Trade Calculator</h1>
          <p className="mt-1 text-[10px] md:text-xs text-gray-400">Select a game to start trading</p>
        </div>

        <div className="mb-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <span aria-hidden="true">←</span>
              <span className="ml-2">Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-2 md:gap-3 grid-cols-1 max-w-xs mx-auto">
          {visibleGames.map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 md:p-4 text-left transition-all hover:border-gray-600 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <p className="text-sm md:text-base font-semibold text-white">{g}</p>
              <p className="mt-0.5 text-[9px] md:text-[10px] text-gray-400">Load items for {g}</p>
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
            <span className="hidden sm:inline">Selected game: </span>
            <span className="ml-1 font-medium">{game}</span>
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
              src="/logo-white.png"
              alt="TRADER"
              width={160}
              height={48}
              className="h-auto w-28 md:w-36 lg:w-40"
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
              onAddItem={(item) => handleItemClick(item, "yours")}
              selectedGame={game}
              onUpdateItemValue={(id, value, variant) => updateItemValue(id, "yours", value, variant)}
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
              onAddItem={(item) => handleItemClick(item, "theirs")}
              selectedGame={game}
              onUpdateItemValue={(id, value, variant) => updateItemValue(id, "theirs", value, variant)}
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
  onUpdateItemValue: (id: string, value: number, variant: string) => void
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
  onUpdateItemValue,
}: TradeGridProps) {
  const [allItems, setAllItems] = useState<TradeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"all" | "pets" | "eggs">("all")
  const [displayLimit, setDisplayLimit] = useState(100)

  useEffect(() => {
    if (!isActive) {
      onSearchChange("")
      setDisplayLimit(100)
      return
    }

    const fetchAllItems = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ game: selectedGame })
        const response = await fetch(`/api/items?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch items")
        }

        const data = await response.json()

        const transformedItems = (data.items || []).map((item: any) => {
          let displayValue = 0

          const hasVariants =
            (item.value_fr && Number(item.value_fr) > 0) ||
            (item.value_f && Number(item.value_f) > 0) ||
            (item.value_r && Number(item.value_r) > 0) ||
            (item.value_n && Number(item.value_n) > 0)

          if (hasVariants) {
            const frValue = typeof item.value_fr === "string" ? Number.parseFloat(item.value_fr) : item.value_fr
            displayValue = !isNaN(frValue) && frValue > 0 ? frValue : item.value || 0
          } else {
            displayValue = Number(item.rap_value) || 0
          }

          return {
            id: item._id || item.id || item.name,
            name: item.name,
            value: displayValue,
            game: item.game,
            imageUrl: item.image_url?.startsWith("http")
              ? item.image_url
              : item.image_url
                ? `/api/item-image/${item.image_url}`
                : "/itemplaceholder.png",
            value_f: item.value_f,
            value_r: item.value_r,
            value_n: item.value_n,
            value_fr: item.value_fr,
            value_nf: item.value_nf,
            value_nr: item.value_nr,
            value_nfr: item.value_nfr,
            value_m: item.value_m,
            value_mf: item.value_mf,
            value_mr: item.value_mr,
            value_mfr: item.value_mfr,
            rap_value: item.rap_value,
          }
        })

        setAllItems(transformedItems)
      } catch (err) {
        setError("Failed to load items. Please try again.")
        setAllItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllItems()
  }, [isActive, selectedGame])

  const filterItemsByCategory = (items: TradeItem[]) => {
    if (selectedGame !== "Adopt Me" || selectedCategory === "all") return items

    return items.filter((item) => {
      const hasVariants =
        (item.value_fr && Number(item.value_fr) > 0) ||
        (item.value_f && Number(item.value_f) > 0) ||
        (item.value_r && Number(item.value_r) > 0) ||
        (item.value_n && Number(item.value_n) > 0)

      const isEgg = !hasVariants

      if (selectedCategory === "eggs") return isEgg
      if (selectedCategory === "pets") return !isEgg

      return true
    })
  }

  const searchFiltered = searchQuery.trim()
    ? allItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems

  const displayedItems = filterItemsByCategory(searchFiltered)

  const slots = Array.from({ length: 9 }, (_, i) => items[i] || null)

  return (
    <div className="flex flex-col">
      <div className="mb-1.5 md:mb-2 flex justify-center">
        <div className="rounded-full border border-gray-600/80 md:border-2 bg-black/90 px-3 md:px-4 py-0.5 md:py-1 shadow-lg">
          <span className="text-xs md:text-sm font-bold tracking-wide text-white">{title}</span>
        </div>
      </div>

      <div className="mb-2 md:mb-3 grid grid-cols-3 gap-1 md:gap-1.5">
        {slots.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md md:rounded-lg border border-gray-700/50 md:border-2 bg-[#0d0d0d] transition-all hover:border-gray-600"
          >
            {index === items.length && !item ? (
              <button
                onClick={onAddClick}
                className="flex h-full w-full flex-col items-center justify-center gap-0.5 md:gap-1 text-gray-400 transition-colors hover:text-white"
              >
                <Plus className="h-4 md:h-5 w-4 md:w-5 stroke-[2.5]" />
                <span className="text-[8px] md:text-[9px] font-semibold tracking-wide">Add Item</span>
              </button>
            ) : item ? (
              selectedGame === "Adopt Me" ? (
                <AdoptMeGridCard item={item} onRemove={() => onRemove(item.id)} onUpdateValue={onUpdateItemValue} />
              ) : (
                <div className="group relative h-full w-full p-0.5 md:p-1">
                  <div className="relative w-full h-full">
                    <Image
                      src={item.imageUrl || "/itemplaceholder.png"}
                      alt={item.name}
                      fill
                      className="rounded-md object-contain"
                    />
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="absolute right-0.5 md:right-1 top-0.5 md:top-1 rounded-full bg-red-500/90 p-0.5 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <X className="h-2 md:h-2.5 w-2 md:w-2.5 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/90 p-0.5 md:p-1 text-center">
                    <p className="truncate text-[8px] md:text-[9px] font-semibold text-white">{item.name}</p>
                  </div>
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-0.5 md:px-1">
        <span className="text-xs md:text-sm font-bold tracking-wide text-white">VALUE</span>
        <span className="text-xs md:text-sm font-bold text-white">{formatValue(total)}</span>
      </div>

      {isActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-4">
          <div className="w-full max-w-2xl rounded-lg md:rounded-xl border border-gray-700 md:border-2 bg-gray-900 p-3 md:p-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-2 md:mb-3 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-white">Add Item to {title}</h3>
              <button
                onClick={() => {
                  onClose()
                  setSelectedCategory("all")
                  setDisplayLimit(100)
                }}
                className="rounded-full p-1 md:p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-3.5 md:h-4 w-3.5 md:w-4" />
              </button>
            </div>

            {selectedGame === "Adopt Me" && (
              <div className="mb-2 md:mb-3">
                <Tabs
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as "all" | "pets" | "eggs")}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="pets">Pets</TabsTrigger>
                    <TabsTrigger value="eggs">Eggs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <div className="relative mb-2 md:mb-3">
              <Search className="absolute left-2 md:left-2.5 top-1/2 h-3.5 md:h-4 w-3.5 md:w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  setDisplayLimit(100)
                }}
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
                  No {selectedCategory === 'all' ? 'items' : selectedCategory} found matching "{searchQuery}"
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="py-8 md:py-10 text-center text-xs md:text-sm text-gray-400">
                  No {selectedCategory === 'all' ? 'items' : selectedCategory} available for {selectedGame}
                </div>
              ) : (
                <>
                  <div className="mb-1 md:mb-1.5 text-center text-[10px] md:text-xs text-gray-400">
                    Showing {Math.min(displayLimit, displayedItems.length)} of {displayedItems.length}{' '}
                    {displayedItems.length === 1 ? 'item' : 'items'}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                  {displayedItems.slice(0, displayLimit).map((item) => (
                    <AdoptMeItemButton
                      key={item.id}
                      item={item}
                      onAddItem={onAddItem}
                      isAdoptMe={selectedGame === 'Adopt Me'}
                    />
                  ))}
                  
                  {displayLimit < displayedItems.length && (
                    <div className="relative flex justify-center pt-3 pb-2">
                      <Button
                        onClick={() => setDisplayLimit(prev => prev + 100)}
                        variant="outline"
                        size="sm"
                        className="w-full"
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

interface AdoptMeItemButtonProps {
  item: any
  onAddItem: (item: any) => void
  isAdoptMe: boolean
}

function AdoptMeItemButton({ item, onAddItem, isAdoptMe }: AdoptMeItemButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState("FR")
  const [selectedValue, setSelectedValue] = useState(item.value)
  const [quantity, setQuantity] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasVariants =
    (item.value_fr && Number(item.value_fr) > 0) ||
    (item.value_f && Number(item.value_f) > 0) ||
    (item.value_r && Number(item.value_r) > 0) ||
    (item.value_n && Number(item.value_n) > 0)
  const isEgg = !hasVariants

  const handleVariantSelect = (variant: string, value: number) => {
    setSelectedVariant(variant)
    setSelectedValue(value)
  }

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddItem({
        ...item,
        value: selectedValue,
        variantLabel: selectedVariant,
        id: `${item.id}-${selectedVariant}-${Date.now()}-${i}`,
      })
    }
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 1000)
  }

  if (!isAdoptMe) {
    return (
      <button
        onClick={() => onAddItem(item)}
        className="flex w-full items-center gap-2 md:gap-3 rounded-lg border border-gray-700 bg-gray-800 p-2 md:p-2.5 text-left transition-all hover:border-gray-600 hover:bg-gray-750"
      >
        <Image
          src={item.imageUrl || "/itemplaceholder.png"}
          alt={item.name}
          width={40}
          height={40}
          className="h-8 w-8 md:h-10 md:w-10 rounded-lg"
        />
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-white">{item.name}</p>
          <p className="text-[10px] md:text-xs text-gray-400">{item.game}</p>
        </div>
        <p className="text-sm md:text-base font-bold text-white">
          {typeof item.value === "number" && !isNaN(item.value)
            ? item.value % 1 === 0
              ? item.value.toLocaleString()
              : item.value.toString()
            : "0"}
        </p>
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-card p-3 transition-all hover:border-gray-600">
      <div className="flex items-start gap-3">
        <Image
          src={item.imageUrl || "/itemplaceholder.png"}
          alt={item.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-lg flex-shrink-0 bg-gray-700"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          <p className="text-xs text-gray-400 mb-2">{selectedVariant}</p>

          {!isEgg && (
            <AdoptMeInlineVariantSelector
              item={item}
              onSelect={handleVariantSelect}
              onQuantityChange={setQuantity}
              initialQuantity={quantity}
            />
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-base font-bold text-white whitespace-nowrap">
            {formatValue(selectedValue)}
          </p>
          <button
            onClick={handleAdd}
            className={cn(
              "px-4 py-2 rounded-lg font-bold text-sm transition-all",
              showConfirm ? "bg-green-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
            )}
          >
            {showConfirm ? <Check className="h-4 w-4" /> : "Add"}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AdoptMeGridCardProps {
  item: TradeItem
  onRemove: () => void
  onUpdateValue: (id: string, value: number, variant: string) => void
}

function AdoptMeGridCard({ item, onRemove, onUpdateValue }: AdoptMeGridCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>(item.variantLabel || "FR")
  const [currentValue, setCurrentValue] = useState<number>(item.value)

  const hasVariants =
    (item.value_fr && Number(item.value_fr) > 0) ||
    (item.value_f && Number(item.value_f) > 0) ||
    (item.value_r && Number(item.value_r) > 0) ||
    (item.value_n && Number(item.value_n) > 0)
  const isEgg = !hasVariants

  const handleVariantSelect = (variant: string, value: number) => {
    setSelectedVariant(variant)
    setCurrentValue(value)
    onUpdateValue(item.id, value, variant)
  }

  return (
    <div className="group relative h-full w-full flex flex-col p-2">
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 z-10 rounded-full bg-red-500/90 p-1 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
      >
        <X className="h-3 w-3 text-white" />
      </button>

      <div className="relative w-full h-16 md:h-20 mb-1">
        <Image src={item.imageUrl || "/itemplaceholder.png"} alt={item.name} fill className="rounded-md object-contain" />
      </div>

      <p className="truncate text-[9px] md:text-[10px] font-semibold text-white text-center mb-1">{item.name}</p>

      {!isEgg && (
        <CompactVariantSelector item={item} onSelect={handleVariantSelect} selectedVariant={selectedVariant} />
      )}
    </div>
  )
}

interface CompactVariantSelectorProps {
  item: TradeItem
  onSelect: (variant: string, value: number) => void
  selectedVariant: string
}

type Variant = "F" | "R" | "N" | "M"

const VARIANT_CONFIG = {
  F: { label: "F", color: "bg-cyan-500" },
  R: { label: "R", color: "bg-pink-500" },
  N: { label: "N", color: "bg-[#8dc43e]" },
  M: { label: "M", color: "bg-purple-500" },
}

function CompactVariantSelector({ item, onSelect, selectedVariant }: CompactVariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Set<Variant>>(() => {
    const initial = new Set<Variant>()
    if (selectedVariant.includes("F")) initial.add("F")
    if (selectedVariant.includes("R")) initial.add("R")
    if (selectedVariant.includes("N") && !selectedVariant.includes("M")) initial.add("N")
    if (selectedVariant.includes("M")) initial.add("M")
    if (initial.size === 0) {
      initial.add("F")
      initial.add("R")
    }
    return initial
  })

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
    updateSelection(newVariants)
  }

  const updateSelection = (variants: Set<Variant>) => {
    const hasF = variants.has("F")
    const hasR = variants.has("R")
    const hasN = variants.has("N")
    const hasM = variants.has("M")

    let variantKey: keyof TradeItem
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
    let numValue = value != null ? (typeof value === "string" ? Number.parseFloat(value) : value) : 0
    
    if ((!numValue || numValue === 0) && variantKey !== "rap_value") {
      const fallbackKeys: Array<keyof TradeItem> = []
      
      if (hasM && hasF && hasR) {
        fallbackKeys.push("value_mfr", "value_m", "value_fr", "rap_value")
      } else if (hasM && hasF) {
        fallbackKeys.push("value_mf", "value_mfr", "value_m", "value_f", "rap_value")
      } else if (hasM && hasR) {
        fallbackKeys.push("value_mr", "value_mfr", "value_m", "value_r", "rap_value")
      } else if (hasM) {
        fallbackKeys.push("value_m", "value_mfr", "rap_value")
      } else if (hasN && hasF && hasR) {
        fallbackKeys.push("value_nfr", "value_n", "value_fr", "rap_value")
      } else if (hasN && hasF) {
        // NF fallbacks - prioritize neon+fly combinations
        fallbackKeys.push("value_nf", "value_nfr", "value_f", "value_n", "rap_value")
      } else if (hasN && hasR) {
        // NR fallbacks - prioritize neon+ride combinations
        fallbackKeys.push("value_nr", "value_nfr", "value_r", "value_n", "rap_value")
      } else if (hasN) {
        fallbackKeys.push("value_n", "value_nfr", "rap_value")
      } else if (hasF && hasR) {
        fallbackKeys.push("value_fr", "value_f", "value_r", "rap_value")
      } else if (hasF) {
        fallbackKeys.push("value_f", "value_fr", "rap_value")
      } else if (hasR) {
        fallbackKeys.push("value_r", "value_fr", "rap_value")
      } else {
        fallbackKeys.push("rap_value")
      }
      
      const filteredFallbacks = fallbackKeys.filter(key => key !== variantKey)
      
      for (const fallbackKey of filteredFallbacks) {
        const fallbackValue = item[fallbackKey]
        if (fallbackValue != null) {
          const fallbackNum = typeof fallbackValue === "string" ? Number.parseFloat(fallbackValue) : fallbackValue
          if (!isNaN(fallbackNum) && fallbackNum > 0) {
            numValue = fallbackNum
            break
          }
        }
      }
    }
    
    const finalValue = !isNaN(numValue) && numValue > 0 ? numValue : 0

    onSelect(variantLabel, finalValue)
  }

  return (
    <div className="flex items-center justify-center gap-1">
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
              w-6 h-6 md:w-7 md:h-7 rounded-full font-bold text-[9px] md:text-[10px] text-white
              transition-all duration-200 shadow-sm
              ${isSelected ? config.color : "bg-gray-600"}
              ${isSelected ? "scale-105 ring-1 ring-white/50" : "hover:scale-105 opacity-70"}
            `}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
