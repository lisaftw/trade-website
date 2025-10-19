"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, X, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
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
  const difference = yourTotal - theirTotal
  const percentDiff = theirTotal > 0 ? ((difference / theirTotal) * 100).toFixed(1) : "0"

  const getTradeStatus = () => {
    if (yourItems.length === 0 || theirItems.length === 0) {
      return { label: "Add Items", color: "text-muted-foreground", icon: Minus }
    }
    if (Math.abs(difference) < theirTotal * 0.05) {
      return { label: "Fair Trade", color: "text-foreground", icon: Minus }
    }
    if (difference > 0) {
      return { label: "You Lose", color: "text-destructive", icon: TrendingDown }
    }
    return { label: "You Win", color: "text-green-600 dark:text-green-400", icon: TrendingUp }
  }

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

  const status = getTradeStatus()
  const StatusIcon = status.icon

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide md:text-4xl">Trade Calculator</h1>
          <p className="mt-2 text-sm text-muted-foreground">Compare item values to determine if your trade is fair</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {(["MM2", "SAB", "GAG", "Adopt Me"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className="rounded-xl border border-border bg-card/50 p-6 text-left transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-lg font-semibold">{g}</p>
              <p className="mt-1 text-xs text-muted-foreground">Load items for {g}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-wide md:text-4xl">Trade Calculator</h1>
        <p className="mt-2 text-sm text-muted-foreground">Compare item values to determine if your trade is fair</p>
        <div className="mt-3 inline-flex items-center rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs text-foreground">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Selected game: <span className="ml-1 font-medium">{game}</span>
          <button
            onClick={() => {
              setYourItems([])
              setTheirItems([])
              setSearchQuery("")
              setActiveColumn(null)
              setGame(null)
            }}
            className="ml-3 rounded-full px-2 py-0.5 text-[11px] btn-neo-outline"
          >
            Change
          </button>
        </div>
      </div>

      {/* Trade Status Display */}
      <Card className="card-neo p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">Trade Assessment</p>
            <div className={cn("mt-1 flex items-center gap-2 text-2xl font-bold", status.color)}>
              <StatusIcon className="h-6 w-6" />
              {status.label}
            </div>
            {yourItems.length > 0 && theirItems.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {difference > 0 ? "You're giving" : "You're getting"} {Math.abs(Number(percentDiff))}% more value
              </p>
            )}
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Your Value</p>
              <p className="mt-1 text-xl font-bold">{yourTotal.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Their Value</p>
              <p className="mt-1 text-xl font-bold">{theirTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Items Column */}
        <TradeColumn
          title="Your Items"
          items={yourItems}
          onRemove={(id) => removeItem(id, "yours")}
          onAddClick={() => setActiveColumn("yours")}
          isActive={activeColumn === "yours"}
          onClose={() => setActiveColumn(null)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddItem={(item) => addItem(item, "yours")}
          selectedGame={game}
        />

        {/* Their Items Column */}
        <TradeColumn
          title="Their Items"
          items={theirItems}
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
  )
}

interface TradeColumnProps {
  title: string
  items: TradeItem[]
  onRemove: (id: string) => void
  onAddClick: () => void
  isActive: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddItem: (item: TradeItem) => void
  selectedGame: "MM2" | "SAB" | "GAG" | "Adopt Me"
}

function TradeColumn({
  title,
  items,
  onRemove,
  onAddClick,
  isActive,
  onClose,
  searchQuery,
  onSearchChange,
  onAddItem,
  selectedGame,
}: TradeColumnProps) {
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

  return (
    <Card className="card-neo p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button size="sm" onClick={onAddClick} className="btn-neo h-8 gap-1 rounded-full">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Item Search Modal */}
      {isActive && (
        <div className="mb-4 space-y-3 rounded-lg border border-border bg-secondary/20 p-3 backdrop-blur-glass">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {isSearching ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : searchResults.length === 0 && debouncedSearch.length >= 2 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No items found</div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Type to search items</div>
            ) : (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAddItem(item)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2 text-left transition-transform hover:scale-[1.01] hover:bg-accent"
                >
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.game}</p>
                  </div>
                  <p className="text-sm font-semibold">{item.value.toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No items added yet
            <br />
            Click "Add Item" to get started
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
            >
              <Image
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.name}
                width={48}
                height={48}
                className="rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.game}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{item.value.toLocaleString()}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(item.id)}
                  className="mt-1 h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex justify-between text-sm font-semibold">
            <span>Total Value:</span>
            <span>{items.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
