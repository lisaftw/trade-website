"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"

// Mutations data with multipliers
const MUTATIONS = [
  { id: "normal", name: "Normal", multiplier: 1.0, color: "bg-gray-500" },
  { id: "gold", name: "Gold", multiplier: 1.25, color: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
  { id: "diamond", name: "Diamond", multiplier: 1.5, color: "bg-gradient-to-r from-cyan-300 to-blue-400" },
  { id: "lava", name: "Lava", multiplier: 6.0, color: "bg-gradient-to-r from-orange-500 to-red-600" },
  {
    id: "rainbow",
    name: "Rainbow",
    multiplier: 10.0,
    color: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
  },
  { id: "bloodrot", name: "Bloodrot", multiplier: 2.0, color: "bg-gradient-to-r from-red-600 to-red-800" },
  { id: "candy", name: "Candy", multiplier: 4.0, color: "bg-gradient-to-r from-pink-400 to-pink-600" },
  { id: "galaxy", name: "Galaxy", multiplier: 7.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  { id: "yinyang", name: "YinYang", multiplier: 7.0, color: "bg-gradient-to-r from-gray-300 to-gray-600" },
]

// Traits data with multipliers
const TRAITS = [
  { id: "sleepy", name: "Sleepy", multiplier: 0.5, color: "bg-gradient-to-r from-blue-900 to-blue-950" },
  { id: "rain", name: "Rain", multiplier: 1.5, color: "bg-gradient-to-r from-blue-300 to-blue-400" },
  { id: "snow", name: "Snow", multiplier: 2.0, color: "bg-gradient-to-r from-cyan-100 to-white" },
  { id: "starfall", name: "Starfall", multiplier: 2.5, color: "bg-gradient-to-r from-blue-700 to-blue-900" },
  { id: "shark-fin", name: "Shark Fin", multiplier: 3.0, color: "bg-gradient-to-r from-blue-600 to-blue-800" },
  { id: "taco", name: "Taco", multiplier: 3.0, color: "bg-gradient-to-r from-yellow-500 to-green-500" },
  { id: "ufo", name: "UFO", multiplier: 3.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  { id: "matteo-hat", name: "Matteo Hat", multiplier: 3.5, color: "bg-gradient-to-r from-amber-700 to-amber-900" },
  { id: "10b-visits", name: "10B Visits", multiplier: 4.0, color: "bg-gradient-to-r from-cyan-400 to-purple-500" },
  { id: "bombardiro", name: "Bombardiro", multiplier: 4.0, color: "bg-gradient-to-r from-orange-500 to-orange-700" },
  { id: "bubblegum", name: "Bubblegum", multiplier: 4.0, color: "bg-gradient-to-r from-pink-300 to-pink-500" },
  { id: "extinct", name: "Extinct", multiplier: 4.0, color: "bg-gradient-to-r from-gray-400 to-gray-600" },
  { id: "galactic", name: "Galactic", multiplier: 4.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  {
    id: "sammyni",
    name: "Sammyni Spyderini",
    multiplier: 4.5,
    color: "bg-gradient-to-r from-purple-700 to-purple-900",
  },
  { id: "concert", name: "Concert", multiplier: 5.0, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "crab-rave", name: "Crab Rave", multiplier: 5.0, color: "bg-gradient-to-r from-orange-500 to-red-500" },
  { id: "sombrero", name: "Sombrero", multiplier: 5.0, color: "bg-gradient-to-r from-gray-300 to-gray-400" },
  { id: "tung-tung", name: "Tung Tung Attack", multiplier: 5.0, color: "bg-gradient-to-r from-pink-500 to-purple-500" },
  { id: "brazil", name: "Brazil", multiplier: 6.0, color: "bg-gradient-to-r from-green-500 to-yellow-400" },
  { id: "dragon", name: "Dragon", multiplier: 6.0, color: "bg-gradient-to-r from-blue-600 to-blue-800" },
  { id: "fire", name: "Fire", multiplier: 6.0, color: "bg-gradient-to-r from-orange-500 to-red-600" },
  { id: "fireworks", name: "Fireworks", multiplier: 6.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  { id: "glitch", name: "Glitch", multiplier: 6.0, color: "bg-gradient-to-r from-cyan-400 to-purple-500" },
  {
    id: "nyan-cats",
    name: "Nyan Cats",
    multiplier: 6.0,
    color: "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400",
  },
  { id: "paint", name: "Paint", multiplier: 6.0, color: "bg-gradient-to-r from-white to-gray-300" },
  { id: "strawberry", name: "Strawberry", multiplier: 8.0, color: "bg-gradient-to-r from-pink-400 to-pink-600" },
]

interface Item {
  id: string
  name: string
  game: string
  rapValue: number
  imageUrl?: string
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  return isNaN(num) ? 0 : num
}

export function SABCalculator() {
  const [pets, setPets] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPet, setSelectedPet] = useState<Item | null>(null)
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null)
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const fetchPets = async () => {
      try {
        console.log("[v0] Fetching SAB pets from database")
        const response = await fetch("/api/items?game=SAB")
        const data = await response.json()
        console.log("[v0] Received SAB pets:", data.items?.length || 0)
        const mappedPets = (data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          game: item.game,
          rapValue: toNumber(item.rapValue || item.rap_value),
          imageUrl: item.imageUrl || item.image_url,
        }))
        setPets(mappedPets)
      } catch (error) {
        console.error("[v0] Error fetching SAB pets:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPets()
  }, [])

  const filteredPets = useMemo(() => {
    if (!searchQuery) return pets
    return pets.filter((pet) => pet.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [pets, searchQuery])

  const calculatedValue = useMemo(() => {
    if (!selectedPet) return 0

    const base = toNumber(selectedPet.rapValue)
    if (base === 0) return 0

    const mutationMultiplier = selectedMutation ? MUTATIONS.find((m) => m.id === selectedMutation)?.multiplier || 1 : 1

    const traitsMultiplier = selectedTraits.reduce((acc, traitId) => {
      const trait = TRAITS.find((t) => t.id === traitId)
      return acc * (trait?.multiplier || 1)
    }, 1)

    return base * mutationMultiplier * traitsMultiplier
  }, [selectedPet, selectedMutation, selectedTraits])

  const toggleMutation = (mutationId: string) => {
    setSelectedMutation((prev) => (prev === mutationId ? null : mutationId))
  }

  const toggleTrait = (traitId: string) => {
    setSelectedTraits((prev) => (prev.includes(traitId) ? prev.filter((t) => t !== traitId) : [...prev, traitId]))
  }

  const formatNumber = (num: number) => {
    const safeNum = toNumber(num)
    if (safeNum >= 1000000) {
      return `${(safeNum / 1000000).toFixed(2)}m/1s`
    } else if (safeNum >= 1000) {
      return `${(safeNum / 1000).toFixed(2)}k/1s`
    }
    return safeNum % 1 === 0 ? `${safeNum.toFixed(0)}/1s` : `${safeNum.toFixed(2)}/1s`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">SAB Value Calculator</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">Calculate pet values with mutations and traits</p>
      </div>

      {/* Pet Selection */}
      <Card className="p-3 md:p-4">
        {!selectedPet ? (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-700 p-6 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
          >
            <Search className="h-5 w-5" />
            <span className="text-sm font-semibold">Select a Pet</span>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border-2 border-brand/50 bg-brand/10 p-3">
            <div className="flex items-center gap-2.5">
              {selectedPet.imageUrl && (
                <img
                  src={selectedPet.imageUrl || "/placeholder.svg"}
                  alt={selectedPet.name}
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div>
                <p className="text-sm font-semibold">{selectedPet.name}</p>
                <p className="text-xs text-muted-foreground">Base: {formatNumber(selectedPet.rapValue)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPet(null)
                setSelectedMutation(null)
                setSelectedTraits([])
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {selectedPet && (
        <>
          {/* Calculated Value */}
          <div className="rounded-lg border-2 border-brand/50 bg-brand/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">Calculated Value</p>
            <p className="mt-1 text-3xl md:text-4xl font-bold text-brand">{formatNumber(calculatedValue)}</p>
          </div>

          {/* Mutations */}
          <Card className="p-3 md:p-4">
            <h3 className="mb-3 text-sm font-semibold">Mutation</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MUTATIONS.map((mutation) => (
                <button
                  key={mutation.id}
                  onClick={() => toggleMutation(mutation.id)}
                  className={`relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 ${
                    mutation.color
                  } ${
                    selectedMutation === mutation.id ? "ring-2 ring-white/50 scale-105" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">{mutation.name}</span>
                  <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-gray-900">
                    {mutation.multiplier}x
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Traits */}
          <Card className="p-3 md:p-4">
            <h3 className="mb-3 text-sm font-semibold">Traits (Multiple Selection)</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TRAITS.map((trait) => (
                <button
                  key={trait.id}
                  onClick={() => toggleTrait(trait.id)}
                  className={`relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 ${
                    trait.color
                  } ${
                    selectedTraits.includes(trait.id)
                      ? "ring-2 ring-white/50 scale-105"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">{trait.name}</span>
                  <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-gray-900">
                    {trait.multiplier}x
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-xl border-2 border-gray-700 bg-gray-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Select SAB Pet</h3>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                }}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-700 bg-gray-800 pl-9 text-sm text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            <div className="max-h-80 space-y-1.5 overflow-y-auto rounded-lg border p-2">
              {loading ? (
                <p className="text-center text-xs text-muted-foreground py-6">Loading pets...</p>
              ) : filteredPets.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">No pets found</p>
              ) : (
                filteredPets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet)
                      setIsSearchOpen(false)
                      setSearchQuery("")
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-accent transition-colors text-left"
                  >
                    {pet.imageUrl && (
                      <img
                        src={pet.imageUrl || "/placeholder.svg"}
                        alt={pet.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">RAP: {formatNumber(pet.rapValue)}</p>
                    </div>
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
