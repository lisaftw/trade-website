"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, X, Search, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import AuthGate from "@/components/auth-gate"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { CalculatorSkin } from "@/components/calculator-skin"
import { RobloxDecos } from "@/components/roblox-decos"
import Image from "next/image"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { AdoptMeInlineVariantSelector } from "@/components/adoptme-inline-variant-selector"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatValue } from "@/lib/utils/format-value"
import { ItemsProvider } from "@/lib/contexts/items-context"
import { ItemsLoadingOverlay } from "@/components/items-loading-overlay"
import { useItems } from "@/lib/contexts/items-context"

const GAMES = ["MM2", "SAB", "Adopt Me"]
const VISIBLE_GAMES = ["Adopt Me"]

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

export default function CreateTradePage() {
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [offering, setOffering] = useState<TradeItem[]>([])
  const [requesting, setRequesting] = useState<TradeItem[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gameDropdownOpen, setGameDropdownOpen] = useState(false)

  const offeringTotal = offering.reduce((sum, item) => sum + item.value, 0)
  const requestingTotal = requesting.reduce((sum, item) => sum + item.value, 0)

  const handlePublish = async () => {
    if (!selectedGame || offering.length === 0 || requesting.length === 0) {
      alert("Please select a game and add items to both sections")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: selectedGame,
          offering: offering.map((item) => item.name),
          requesting: requesting.map((item) => item.name),
          notes: notes.slice(0, 100),
        }),
      })

      if (response.ok) {
        router.push("/trading")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to publish trade")
      }
    } catch (error) {
      alert("Error publishing trade. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ItemsProvider>
      <AuthGate feature="create trades">
        <main className="relative min-h-dvh bg-background">
          <PageBackground />
          <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
            <SiteHeader />
            <div className="relative">
              <RobloxDecos />
              <div className="relative z-[1]">
                <CalculatorSkin>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">Create Trade Ad</h1>
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
                        Set up your trade offer and find the perfect match
                      </p>
                    </div>

                    <Card className="card-neo p-4 md:p-6 border-2 border-primary/30">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm md:text-base">
                          1
                        </div>
                        <label className="text-sm md:text-base font-bold">Select Game</label>
                      </div>
                      <div className="relative z-50">
                        <button
                          onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
                          className="btn-neo w-full justify-between px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold"
                        >
                          <span className={selectedGame ? "text-foreground" : "text-muted-foreground"}>
                            {selectedGame || "Choose a game..."}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${gameDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {gameDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50 space-y-2 rounded-lg border border-border bg-card/95 p-2 backdrop-blur-lg shadow-xl">
                            {VISIBLE_GAMES.map((game) => (
                              <button
                                key={game}
                                onClick={() => {
                                  setSelectedGame(game)
                                  setGameDropdownOpen(false)
                                }}
                                className={cn(
                                  "w-full rounded-lg px-4 py-3 text-left font-semibold transition-all",
                                  selectedGame === game
                                    ? "bg-primary/20 text-primary border-2 border-primary/50"
                                    : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-transparent",
                                )}
                              >
                                {game}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>

                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm md:text-base">
                          2
                        </div>
                        <h2 className="text-lg md:text-xl font-bold">Set Up Your Trade</h2>
                      </div>
                      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 md:px-4 py-1.5 md:py-2">
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500" />
                            <h3 className="text-sm md:text-base font-bold text-green-400">What I'm Offering</h3>
                          </div>
                          <TradeColumn
                            title="I Have"
                            items={offering}
                            onRemove={(id) => setOffering(offering.filter((item) => item.id !== id))}
                            onAddItem={(item) => setOffering([...offering, { ...item, id: `${item.id}-${Date.now()}` }])}
                            selectedGame={selectedGame}
                            columnType="offering"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 md:px-4 py-1.5 md:py-2">
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500" />
                            <h3 className="text-sm md:text-base font-bold text-blue-400">What I'm Requesting</h3>
                          </div>
                          <TradeColumn
                            title="I Want"
                            items={requesting}
                            onRemove={(id) => setRequesting(requesting.filter((item) => item.id !== id))}
                            onAddItem={(item) =>
                              setRequesting([...requesting, { ...item, id: `${item.id}-${Date.now()}` }])
                            }
                            selectedGame={selectedGame}
                            columnType="requesting"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trade Summary */}
                    <Card className="card-neo p-4 md:p-6">
                      <div className="flex flex-col items-center justify-between gap-3 md:gap-4 md:flex-row">
                        <div className="text-center md:text-left">
                          <p className="text-xs md:text-sm text-muted-foreground">Trade Summary</p>
                          <p className="mt-1 text-base md:text-lg font-semibold">
                            {offering.length} items for {requesting.length} items
                          </p>
                        </div>
                        <div className="flex gap-6 md:gap-8">
                          <div className="text-center">
                            <p className="text-[10px] md:text-xs text-muted-foreground">YOUR OFFER</p>
                            <p className="mt-1 text-lg md:text-xl font-bold text-green-400">{formatValue(offeringTotal)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] md:text-xs text-muted-foreground">YOU WANT</p>
                            <p className="mt-1 text-lg md:text-xl font-bold text-blue-400">{formatValue(requestingTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Notes */}
                    <Card className="card-neo p-4 md:p-6">
                      <label className="block text-xs md:text-sm font-semibold mb-2 md:mb-3">
                        Trade Notes <span className="text-muted-foreground font-normal">({notes.length}/100)</span>
                      </label>
                      <Textarea
                        placeholder="Add any additional details about your trade..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 100))}
                        className="min-h-20 md:min-h-24 resize-none text-sm md:text-base"
                      />
                    </Card>

                    {/* Publish Button */}
                    <Button
                      onClick={handlePublish}
                      disabled={isSubmitting || !selectedGame || offering.length === 0 || requesting.length === 0}
                      className="btn-neo w-full py-4 md:py-6 text-base md:text-lg font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/50 gap-2"
                    >
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                      {isSubmitting ? "Publishing..." : "Publish Trade Ad"}
                    </Button>
                  </div>
                </CalculatorSkin>
              </div>
            </div>
            <SiteFooter />
          </div>
        </main>
      </AuthGate>
      <ItemsLoadingOverlay />
    </ItemsProvider>
  )
}

interface TradeColumnProps {
  title: string
  items: TradeItem[]
  onRemove: (id: string) => void
  onAddItem: (item: TradeItem) => void
  selectedGame: string
  columnType: "offering" | "requesting"
}

function TradeColumn({ title, items, onRemove, onAddItem, selectedGame, columnType }: TradeColumnProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TradeItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<"all" | "pets" | "eggs">("all")
  const [displayLimit, setDisplayLimit] = useState(100)
  const debouncedSearch = useDebounce(searchQuery, 300)
  const { searchItems, getItemsByGame } = useItems()

  React.useEffect(() => {
    if (!showSearch) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      let results = debouncedSearch 
        ? searchItems(debouncedSearch, selectedGame)
        : getItemsByGame(selectedGame)
      
      setSearchResults(
        results.map((item: any) => {
          let displayValue = 0

          const hasVariants =
            (item.value_fr && Number(item.value_fr) > 0) ||
            (item.value_f && Number(item.value_f) > 0) ||
            (item.value_r && Number(item.value_r) > 0) ||
            (item.value_n && Number(item.value_n) > 0)

          if (hasVariants) {
            displayValue = Number(item.value_fr) || Number(item.value) || 0
          } else {
            displayValue = Number(item.rap_value) || 0
          }

          return {
            id: item._id || item.id || item.name,
            name: item.name,
            value: displayValue,
            game: item.game,
            imageUrl: item.imageUrl || item.image_url,
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
        }),
      )
    } catch (error) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [debouncedSearch, showSearch, selectedGame, searchItems, getItemsByGame])

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

  const displayedItems = filterItemsByCategory(searchResults)

  const itemTotal = items.reduce((sum, item) => {
    const value = typeof item.value === "number" ? item.value : Number.parseFloat(String(item.value)) || 0
    return sum + value
  }, 0)

  return (
    <Card className="card-neo p-3 md:p-4">
      <div className="mb-3 md:mb-4 flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        <Button
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="btn-neo h-7 md:h-8 gap-1 rounded-full text-xs md:text-sm px-2 md:px-3"
          disabled={!selectedGame}
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Item Search Modal */}
      {showSearch && (
        <div className="mb-3 md:mb-4 space-y-2 md:space-y-3 rounded-lg border border-border bg-secondary/20 p-2 md:p-3 backdrop-blur-glass">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 md:left-3 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setDisplayLimit(100)
                }}
                className="pl-8 md:pl-9 text-sm md:text-base h-8 md:h-10"
                autoFocus
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowSearch(false)
                setSearchQuery("")
                setSelectedCategory("all")
                setDisplayLimit(100)
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>

          {selectedGame === "Adopt Me" && (
            <Tabs
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as "all" | "pets" | "eggs")}
            >
              <TabsList className="grid w-full grid-cols-3 h-8 md:h-10">
                <TabsTrigger value="all" className="text-xs md:text-sm">All Items</TabsTrigger>
                <TabsTrigger value="pets" className="text-xs md:text-sm">Pets</TabsTrigger>
                <TabsTrigger value="eggs" className="text-xs md:text-sm">Eggs</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="max-h-56 md:max-h-64 space-y-1.5 md:space-y-2 overflow-y-auto">
            {isSearching ? (
              <div className="py-6 md:py-8 text-center text-xs md:text-sm text-muted-foreground">Searching...</div>
            ) : displayedItems.length === 0 ? (
              <div className="py-6 md:py-8 text-center text-xs md:text-sm text-muted-foreground">
                {debouncedSearch
                  ? `No ${selectedCategory === "all" ? "items" : selectedCategory} found`
                  : `No ${selectedCategory === "all" ? "items" : selectedCategory} available`}
              </div>
            ) : (
              <>
                <div className="text-center text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">
                  Showing {Math.min(displayLimit, displayedItems.length)} of {displayedItems.length} items
                </div>
                {displayedItems.slice(0, displayLimit).map((item) =>
                  selectedGame === "Adopt Me" ? (
                    <AdoptMeItemButton
                      key={item.id}
                      item={item}
                      onAddItem={onAddItem}
                      onClose={() => {
                        setSearchQuery("")
                        setShowSearch(false)
                        setSelectedCategory("all")
                        setDisplayLimit(100)
                      }}
                    />
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => {
                        onAddItem(item)
                        setSearchQuery("")
                        setShowSearch(false)
                        setDisplayLimit(100)
                      }}
                      className="flex w-full items-center gap-2 md:gap-3 rounded-lg border border-border bg-card p-1.5 md:p-2 text-left transition-transform hover:scale-[1.01] hover:bg-accent"
                    >
                      <Image
                        src={item.imageUrl || "/itemplaceholder.png"}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="rounded w-9 h-9 md:w-10 md:h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{item.game}</p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold whitespace-nowrap">{formatValue(item.value)}</p>
                    </button>
                  ),
                )}
                
                {displayLimit < displayedItems.length && (
                  <div className="flex justify-center pt-2 md:pt-3">
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
      )}

      {/* Items List */}
      <div className="space-y-1.5 md:space-y-2">
        {items.length === 0 ? (
          <div className="py-8 md:py-12 text-center text-xs md:text-sm text-muted-foreground">
            No items added yet
            <br />
            Click "Add Item" to get started
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 md:gap-3 rounded-lg border border-border bg-card p-2 md:p-3 transition-colors hover:bg-accent/50"
            >
              <Image
                src={item.imageUrl || "/itemplaceholder.png"}
                alt={item.name}
                width={40}
                height={40}
                className="rounded flex-shrink-0 w-10 h-10 md:w-12 md:h-12"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {item.game}
                  {item.variantLabel && ` - ${item.variantLabel}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm font-semibold">{formatValue(item.value)}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(item.id)}
                  className="mt-0.5 md:mt-1 h-5 w-5 md:h-6 md:w-6 p-0 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-3 md:mt-4 border-t border-border pt-2 md:pt-3">
          <div className="flex justify-between text-xs md:text-sm font-semibold">
            <span>Total Value:</span>
            <span>{formatValue(itemTotal)}</span>
          </div>
        </div>
      )}
    </Card>
  )
}

interface AdoptMeItemButtonProps {
  item: TradeItem
  onAddItem: (item: TradeItem) => void
  onClose: () => void
}

function AdoptMeItemButton({ item, onAddItem, onClose }: AdoptMeItemButtonProps) {
  const hasVariants =
    (item.value_fr && Number(item.value_fr) > 0) ||
    (item.value_f && Number(item.value_f) > 0) ||
    (item.value_r && Number(item.value_r) > 0) ||
    (item.value_n && Number(item.value_n) > 0)
  const isEgg = !hasVariants

  const [selectedVariant, setSelectedVariant] = useState(() => (isEgg ? undefined : "FR"))
  const [selectedValue, setSelectedValue] = useState(() => (isEgg ? Number(item.rap_value) || 0 : item.value))

  const handleVariantSelect = (variant: string, value: number) => {
    setSelectedVariant(variant)
    setSelectedValue(value)
  }

  const handleAdd = () => {
    onAddItem({
      ...item,
      value: selectedValue,
      variantLabel: isEgg ? undefined : selectedVariant,
    })
    onClose()
  }

  return (
    <div className="rounded-lg border border-border bg-card p-2 md:p-3 space-y-1.5 md:space-y-2">
      <div className="flex items-start gap-2 md:gap-3">
        <Image
          src={item.imageUrl || "/itemplaceholder.png"}
          alt={item.name}
          width={40}
          height={40}
          className="rounded flex-shrink-0 w-10 h-10 md:w-12 md:h-12"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium truncate">{item.name}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">{isEgg ? "Egg" : selectedVariant}</p>
        </div>
        <div className="text-right">
          <p className="text-xs md:text-sm font-semibold whitespace-nowrap">
            {formatValue(selectedValue)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {!isEgg && <AdoptMeInlineVariantSelector item={item} onSelect={handleVariantSelect} showQuantity={false} />}
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold ml-auto border border-gray-600 h-7 md:h-8 text-xs md:text-sm px-3 md:px-4"
        >
          Add
        </Button>
      </div>
    </div>
  )
}
