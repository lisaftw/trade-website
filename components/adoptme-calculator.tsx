"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search } from "lucide-react"

interface AdoptMePet {
  id: string
  name: string
  game: string
  baseValue: number
  neonValue: number
  megaValue: number
  imageUrl?: string
}

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  return isNaN(num) ? 0 : num
}

export function AdoptMeCalculator() {
  const [pets, setPets] = useState<AdoptMePet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPet, setSelectedPet] = useState<AdoptMePet | null>(null)

  // Potion states
  const [isFly, setIsFly] = useState(false)
  const [isRide, setIsRide] = useState(false)

  // Variant state
  const [variant, setVariant] = useState<"normal" | "neon" | "mega">("normal")

  useEffect(() => {
    const fetchPets = async () => {
      try {
        console.log("[v0] Fetching Adopt Me pets from database")
        const response = await fetch("/api/items?game=Adopt Me")
        const data = await response.json()
        console.log("[v0] Received Adopt Me pets:", data.items?.length || 0)

        const mappedPets = (data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          game: item.game,
          baseValue: toNumber(item.rapValue || item.rap_value || item.value),
          neonValue: toNumber(item.neonValue || item.neon_value || 0),
          megaValue: toNumber(item.megaValue || item.mega_value || 0),
          imageUrl: item.imageUrl || item.image_url,
        }))
        setPets(mappedPets)
      } catch (error) {
        console.error("[v0] Error fetching Adopt Me pets:", error)
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

    // Get base value based on variant
    let baseValue = 0
    switch (variant) {
      case "normal":
        baseValue = selectedPet.baseValue
        break
      case "neon":
        baseValue = selectedPet.neonValue
        break
      case "mega":
        baseValue = selectedPet.megaValue
        break
    }

    // Add potion values (example values, adjust as needed)
    let potionBonus = 0
    if (isFly) potionBonus += 50
    if (isRide) potionBonus += 50

    return baseValue + potionBonus
  }, [selectedPet, variant, isFly, isRide])

  const getPetDisplayName = () => {
    if (!selectedPet) return ""

    const parts: string[] = []

    // Add variant prefix
    if (variant === "neon") parts.push("Neon")
    if (variant === "mega") parts.push("Mega")

    // Add potion prefixes
    if (isFly && isRide) {
      parts.push("Fly Ride")
    } else if (isFly) {
      parts.push("Fly")
    } else if (isRide) {
      parts.push("Ride")
    } else {
      parts.push("No Potion")
    }

    parts.push(selectedPet.name)

    return parts.join(" ")
  }

  const getShortDisplayName = () => {
    if (!selectedPet) return ""

    const parts: string[] = []

    if (variant === "mega") {
      if (isFly && isRide) parts.push("MFR")
      else if (isFly) parts.push("MF")
      else if (isRide) parts.push("MR")
      else parts.push("M")
    } else if (variant === "neon") {
      if (isFly && isRide) parts.push("NFR")
      else if (isFly) parts.push("NF")
      else if (isRide) parts.push("NR")
      else parts.push("N")
    } else {
      // Normal variant
      if (isFly && isRide) parts.push("FR")
      else if (isFly) parts.push("F")
      else if (isRide) parts.push("R")
    }

    parts.push(selectedPet.name)

    return parts.join(" ")
  }

  const formatNumber = (num: number) => {
    const safeNum = toNumber(num)
    return safeNum.toLocaleString()
  }

  const resetCalculator = () => {
    setSelectedPet(null)
    setIsFly(false)
    setIsRide(false)
    setVariant("normal")
    setSearchQuery("")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Adopt Me Value Calculator</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">Calculate pet values with potions and variants</p>
      </div>

      <Card className="p-3 md:p-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="pet-search" className="text-sm font-semibold">
              Select Pet
            </Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pet-search"
                type="text"
                placeholder="Search for a pet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          {/* Selected Pet Display */}
          {selectedPet && (
            <div className="rounded-lg border-2 border-brand/50 bg-brand/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {selectedPet.imageUrl && (
                    <img
                      src={selectedPet.imageUrl || "/placeholder.svg"}
                      alt={selectedPet.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{getShortDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{getPetDisplayName()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPet(null)} className="h-7 w-7 p-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Pet List */}
          {!selectedPet && (
            <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-lg border p-2">
              {loading ? (
                <p className="text-center text-xs text-muted-foreground py-6">Loading pets...</p>
              ) : filteredPets.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">No pets found</p>
              ) : (
                filteredPets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
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
                      <p className="text-xs text-muted-foreground">Base: {formatNumber(pet.baseValue)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Result Display */}
          {selectedPet && (
            <div className="rounded-lg border-2 border-brand/50 bg-brand/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Calculated Value</p>
              <p className="mt-0.5 text-2xl md:text-3xl font-bold text-brand">{formatNumber(calculatedValue)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {variant === "normal" && "Base Value"}
                {variant === "neon" && "Neon Value"}
                {variant === "mega" && "Mega Value"}
                {(isFly || isRide) && " + Potions"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Potions Section */}
      {selectedPet && (
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold mb-2.5">Potions</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsFly(!isFly)}
              className={`relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 ${
                isFly
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 ring-2 ring-white/50 scale-105 shadow-lg"
                  : "bg-gray-700 opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="text-sm font-semibold text-white drop-shadow-md">Fly</span>
              {isFly && <X className="h-4 w-4 text-white" />}
            </button>

            <button
              onClick={() => setIsRide(!isRide)}
              className={`relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 ${
                isRide
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 ring-2 ring-white/50 scale-105 shadow-lg"
                  : "bg-gray-700 opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="text-sm font-semibold text-white drop-shadow-md">Ride</span>
              {isRide && <X className="h-4 w-4 text-white" />}
            </button>
          </div>
        </Card>
      )}

      {/* Variants Section */}
      {selectedPet && (
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold mb-2.5">Variant (Select One)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setVariant("normal")}
              className={`relative flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 ${
                variant === "normal"
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 ring-2 ring-white/50 scale-105 shadow-lg"
                  : "bg-gray-700 opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="text-sm font-semibold text-white drop-shadow-md">Normal</span>
            </button>

            <button
              onClick={() => setVariant("neon")}
              className={`relative flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 ${
                variant === "neon"
                  ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105 shadow-lg"
                  : "bg-gray-700 opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="text-sm font-semibold text-white drop-shadow-md">Neon</span>
            </button>

            <button
              onClick={() => setVariant("mega")}
              className={`relative flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 ${
                variant === "mega"
                  ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105 shadow-lg"
                  : "bg-gray-700 opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="text-sm font-semibold text-white drop-shadow-md">Mega</span>
            </button>
          </div>
        </Card>
      )}

      {/* Reset Button */}
      {selectedPet && (
        <div className="flex justify-center">
          <Button onClick={resetCalculator} variant="outline" className="h-9 px-6 text-sm bg-transparent">
            Reset Calculator
          </Button>
        </div>
      )}
    </div>
  )
}
