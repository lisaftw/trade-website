"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Plus, X, Search } from "lucide-react"
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

const GAMES = ["MM2", "SAB", "GAG", "Adopt Me"]

interface TradeItem {
  id: string
  name: string
  value: number
  imageUrl?: string
  game: string
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

                  {/* Game Selection */}
                  <Card className="card-neo p-6">
                    <label className="block text-sm font-semibold mb-3">Select Game</label>
                    <div className="relative">
                      <button
                        onClick={() => setGameDropdownOpen(!gameDropdownOpen)}
                        className="btn-neo w-full justify-between px-4 py-3 text-base"
                      >
                        <span className={selectedGame ? "text-foreground" : "text-muted-foreground"}>
                          {selectedGame || "Choose a game..."}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${gameDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {gameDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 space-y-2 rounded-lg border border-border bg-card/80 p-2 backdrop-blur-glass">
                          {GAMES.map((game) => (
                            <button
                              key={game}
                              onClick={() => {
                                setSelectedGame(game)
                                setGameDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full rounded-lg px-4 py-2 text-left transition-all",
                                selectedGame === game
                                  ? "bg-primary/20 text-primary border border-primary/50"
                                  : "bg-foreground/5 text-foreground hover:bg-foreground/10",
                              )}
                            >
                              {game}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Two Column Layout */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* I Have */}
                    <TradeColumn
                      title="I Have"
                      items={offering}
                      onRemove={(id) => setOffering(offering.filter((item) => item.id !== id))}
                      onAddItem={(item) => setOffering([...offering, { ...item, id: `${item.id}-${Date.now()}` }])}
                      selectedGame={selectedGame}
                      columnType="offering"
                    />

                    {/* I Want */}
                    <TradeColumn
                      title="I Want"
                      items={requesting}
                      onRemove={(id) => setRequesting(requesting.filter((item) => item.id !== id))}
                      onAddItem={(item) => setRequesting([...requesting, { ...item, id: `${item.id}-${Date.now()}` }])}
                      selectedGame={selectedGame}
                      columnType="requesting"
                    />
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
                          <p className="mt-1 text-xl font-bold">{offeringTotal.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">YOU WANT</p>
                          <p className="mt-1 text-xl font-bold">{requestingTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Notes */}
                  <Card className="card-neo p-6">
                    <label className="block text-sm font-semibold mb-3">
                      Trade Notes <span className="text-muted-foreground">({notes.length}/100)</span>
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
                    className="btn-neo w-full py-4 text-lg font-semibold"
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
  }, [debouncedSearch, showSearch, selectedGame])

  const itemTotal = items.reduce((sum, item) => sum + item.value, 0)

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
              searchResults.map((item) => (
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
                src={item.imageUrl || "/placeholder.svg?height=48&width=48"}
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
            <span>{itemTotal.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
