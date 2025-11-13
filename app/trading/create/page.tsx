"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, X, Search } from 'lucide-react'
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
      console.log("[v0] Publishing trade:", {
        game: selectedGame,
        offering: offering.map((item) => item.name),
        requesting: requesting.map((item) => item.name),
        notes: notes.slice(0, 100),
      })

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
        console.log("[v0] Trade published successfully")
        router.push("/trading")
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to publish trade:", errorData)
        alert(errorData.error || "Failed to publish trade")
      }
    } catch (error) {
      console.error("[v0] Error publishing trade:", error)
      alert("Error publishing trade. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
                    <h1 className="text-3xl font-bold tracking-wide md:text-4xl">Create Trade Ad</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Set up your trade offer and find the perfect match
                    </p>
                  </div>

                  <Card className="card-neo p-6 border-2 border-primary/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                        1
                      </div>
                      <label className="text-base font-bold">Select Game</label>
                    </div>
                    <div className="relative z-50">
                      <button
                        onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
                        className="btn-neo w-full justify-between px-4 py-3 text-base font-semibold"
                      >
                        <span className={selectedGame ? "text-foreground" : "text-muted-foreground"}>
                          {selectedGame || "Choose a game..."}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${gameDropdownOpen ? "rotate-180" : ""}`}
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

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                        2
                      </div>
                      <h2 className="text-xl font-bold">Set Up Your Trade</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <h3 className="font-bold text-green-400">What I'm Offering</h3>
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
                        <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <h3 className="font-bold text-blue-400">What I'm Requesting</h3>
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
                  <Card className="card-neo p-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-muted-foreground">Trade Summary</p>
                        <p className="mt-1 text-lg font-semibold">
                          {offering.length} items for {requesting.length} items
                        </p>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">YOUR OFFER</p>
                          <p className="mt-1 text-xl font-bold text-green-400">{offeringTotal.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">YOU WANT</p>
                          <p className="mt-1 text-xl font-bold text-blue-400">{requestingTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Notes */}
                  <Card className="card-neo p-6">
                    <label className="block text-sm font-semibold mb-3">
                      Trade Notes <span className="text-muted-foreground font-normal">({notes.length}/100)</span>
                    </label>
                    <Textarea
                      placeholder="Add any additional details about your trade..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 100))}
                      className="min-h-24 resize-none"
                    />
                  </Card>

                  {/* Publish Button */}
                  <Button
                    onClick={handlePublish}
                    disabled={isSubmitting || !selectedGame || offering.length === 0 || requesting.length === 0}
                    className="btn-neo w-full py-6 text-lg font-bold"
                  >
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
  const debouncedSearch = useDebounce(searchQuery, 300)

  React.useEffect(() => {
    if (!showSearch) {
      setSearchResults([])
      return
    }

    const fetchItems = async () => {
      setIsSearching(true)
      try {
        const params = new URLSearchParams({ game: selectedGame })
        if (debouncedSearch) {
          params.append("q", debouncedSearch)
        }
        const response = await fetch(`/api/items?${params.toString()}`)
        const data = await response.json()
        setSearchResults(
          (data.items || []).map((item: any) => {
            let displayValue = 0

            const hasVariants =
              (item.value_fr && Number(item.value_fr) > 0) ||
              (item.value_f && Number(item.value_f) > 0) ||
              (item.value_r && Number(item.value_r) > 0) ||
              (item.value_n && Number(item.value_n) > 0)

            if (hasVariants) {
              displayValue = item.value_fr || item.value || 0
            } else {
              displayValue = item.rap_value || item.value || 0
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
            }
          }),
        )
      } catch (error) {
        console.error("[v0] Failed to fetch items:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    fetchItems()
  }, [debouncedSearch, showSearch, selectedGame])

  const itemTotal = items.reduce((sum, item) => {
    const value = typeof item.value === "number" ? item.value : Number.parseFloat(String(item.value)) || 0
    return sum + value
  }, 0)

  return (
    <Card className="card-neo p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="btn-neo h-8 gap-1 rounded-full"
          disabled={!selectedGame}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Item Search Modal */}
      {showSearch && (
        <div className="mb-4 space-y-3 rounded-lg border border-border bg-secondary/20 p-3 backdrop-blur-glass">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowSearch(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {isSearching ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {debouncedSearch ? "No items found" : "No items available"}
              </div>
            ) : (
              searchResults.map((item) =>
                selectedGame === "Adopt Me" ? (
                  <AdoptMeItemButton
                    key={item.id}
                    item={item}
                    onAddItem={onAddItem}
                    onClose={() => {
                      setSearchQuery("")
                      setShowSearch(false)
                    }}
                  />
                ) : (
                  <button
                    key={item.id}
                    onClick={() => {
                      onAddItem(item)
                      setSearchQuery("")
                      setShowSearch(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2 text-left transition-transform hover:scale-[1.01] hover:bg-accent"
                  >
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=40&width=40"}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.game}</p>
                    </div>
                    <p className="text-sm font-semibold">{item.value.toString()}</p>
                  </button>
                ),
              )
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
                src={item.imageUrl || "/placeholder.svg?height=48&width=48"}
                alt={item.name}
                width={48}
                height={48}
                className="rounded flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.game}
                  {item.variantLabel && ` - ${item.variantLabel}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{item.value.toString()}</p>
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
            <span>{itemTotal.toFixed(2)}</span>
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

  const [selectedVariant, setSelectedVariant] = useState("FR")
  const [selectedValue, setSelectedValue] = useState(() => {
    if (isEgg) {
      return item.value
    }
    const frValue = item.value_fr
    const numValue = frValue != null ? (typeof frValue === "string" ? Number.parseFloat(frValue) : frValue) : 0
    return !isNaN(numValue) && numValue > 0 ? numValue : item.value
  })

  const handleVariantSelect = (variant: string, value: number) => {
    setSelectedVariant(variant)
    setSelectedValue(value)
  }

  const handleAdd = () => {
    onAddItem({
      ...item,
      value: selectedValue,
      variantLabel: selectedVariant,
    })
    onClose()
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start gap-3">
        <Image
          src={item.imageUrl || "/placeholder.svg?height=48&width=48"}
          alt={item.name}
          width={48}
          height={48}
          className="rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{isEgg ? "Egg" : selectedVariant}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold whitespace-nowrap">
            {typeof selectedValue === "number" && !isNaN(selectedValue) ? selectedValue.toString() : "0"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {!isEgg && <AdoptMeInlineVariantSelector item={item} onSelect={handleVariantSelect} showQuantity={false} />}
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          Add
        </Button>
      </div>
    </div>
  )
}
