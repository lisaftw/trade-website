"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, Info, Plus } from "lucide-react"

interface AdoptMePet {
  id: string
  name: string
  game: string
  baseValue: number
  neonValue: number
  megaValue: number
  flyBonus: number
  rideBonus: number
  imageUrl?: string
  section?: string
  rarity?: string
}

interface SelectedPet {
  id: string
  pet: AdoptMePet
  isFly: boolean
  isRide: boolean
  variant: "normal" | "neon" | "mega"
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
  const [selectedPets, setSelectedPets] = useState<SelectedPet[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch("/api/items?game=Adopt Me")
        const data = await response.json()

        const mappedPets = (data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          game: item.game,
          baseValue: toNumber(item.rap_value || item.value),
          neonValue: toNumber(item.neon_value),
          megaValue: toNumber(item.mega_value),
          flyBonus: toNumber(item.fly_bonus || 50),
          rideBonus: toNumber(item.ride_bonus || 50),
          imageUrl: item.image_url,
          section: item.section,
          rarity: item.rarity,
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

  const totalValue = useMemo(() => {
    return selectedPets.reduce((total, selectedPet) => {
      let baseValue = 0
      switch (selectedPet.variant) {
        case "normal":
          baseValue = selectedPet.pet.baseValue
          break
        case "neon":
          baseValue = selectedPet.pet.neonValue
          break
        case "mega":
          baseValue = selectedPet.pet.megaValue
          break
      }

      let potionBonus = 0
      if (selectedPet.isFly) potionBonus += selectedPet.pet.flyBonus
      if (selectedPet.isRide) potionBonus += selectedPet.pet.rideBonus

      return total + baseValue + potionBonus
    }, 0)
  }, [selectedPets])

  const addPet = (pet: AdoptMePet) => {
    const newPet: SelectedPet = {
      id: `${pet.id}-${Date.now()}`,
      pet,
      isFly: false,
      isRide: false,
      variant: "normal",
    }
    setSelectedPets((prev) => [...prev, newPet])
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  const removePet = (id: string) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePet = (id: string, updates: Partial<Omit<SelectedPet, "id" | "pet">>) => {
    setSelectedPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const formatNumber = (num: number) => {
    const safeNum = toNumber(num)
    return safeNum.toLocaleString()
  }

  const getPetDisplayName = (selectedPet: SelectedPet) => {
    const parts: string[] = []
    if (selectedPet.variant === "neon") parts.push("Neon")
    if (selectedPet.variant === "mega") parts.push("Mega")
    if (selectedPet.isFly && selectedPet.isRide) parts.push("Fly Ride")
    else if (selectedPet.isFly) parts.push("Fly")
    else if (selectedPet.isRide) parts.push("Ride")
    parts.push(selectedPet.pet.name)
    return parts.join(" ")
  }

  const getShortDisplayName = (selectedPet: SelectedPet) => {
    const parts: string[] = []
    if (selectedPet.variant === "mega") {
      if (selectedPet.isFly && selectedPet.isRide) parts.push("MFR")
      else if (selectedPet.isFly) parts.push("MF")
      else if (selectedPet.isRide) parts.push("MR")
      else parts.push("M")
    } else if (selectedPet.variant === "neon") {
      if (selectedPet.isFly && selectedPet.isRide) parts.push("NFR")
      else if (selectedPet.isFly) parts.push("NF")
      else if (selectedPet.isRide) parts.push("NR")
      else parts.push("N")
    } else {
      if (selectedPet.isFly && selectedPet.isRide) parts.push("FR")
      else if (selectedPet.isFly) parts.push("F")
      else if (selectedPet.isRide) parts.push("R")
    }
    parts.push(selectedPet.pet.name)
    return parts.join(" ")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Adopt Me Value Calculator</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">Calculate pet values with potions and variants</p>
      </div>

      <Card className="p-3 bg-blue-500/10 border-blue-500/20">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Values from Your Value List</p>
            <p>
              This calculator uses values from your items database. NFR (Neon) and MFR (Mega) values must be manually
              set for each pet in the database.
            </p>
          </div>
        </div>
      </Card>

      {selectedPets.length > 0 && (
        <div className="rounded-lg border-2 border-brand/50 bg-brand/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="mt-0.5 text-2xl md:text-3xl font-bold text-brand">{formatNumber(totalValue)}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{selectedPets.length} pets selected</p>
        </div>
      )}

      {selectedPets.map((selectedPet) => {
        const petValue = (() => {
          let baseValue = 0
          switch (selectedPet.variant) {
            case "normal":
              baseValue = selectedPet.pet.baseValue
              break
            case "neon":
              baseValue = selectedPet.pet.neonValue
              break
            case "mega":
              baseValue = selectedPet.pet.megaValue
              break
          }
          let potionBonus = 0
          if (selectedPet.isFly) potionBonus += selectedPet.pet.flyBonus
          if (selectedPet.isRide) potionBonus += selectedPet.pet.rideBonus
          return baseValue + potionBonus
        })()

        return (
          <Card key={selectedPet.id} className="p-3 md:p-4">
            {/* Pet Header */}
            <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-brand/50 bg-brand/10 p-3">
              <div className="flex items-center gap-2.5">
                {selectedPet.pet.imageUrl && (
                  <img
                    src={selectedPet.pet.imageUrl || "/placeholder.svg"}
                    alt={selectedPet.pet.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold">{getShortDisplayName(selectedPet)}</p>
                  <p className="text-xs text-muted-foreground">Value: {formatNumber(petValue)}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removePet(selectedPet.id)} className="h-7 w-7 p-0">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Potions */}
            <div className="mb-3">
              <h3 className="mb-2 text-sm font-semibold">Potions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updatePet(selectedPet.id, { isFly: !selectedPet.isFly })}
                  className={`relative flex items-center justify-between rounded-lg p-2 transition-all duration-200 ${
                    selectedPet.isFly
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 ring-2 ring-white/50 scale-105"
                      : "bg-gray-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">Fly</span>
                  {selectedPet.isFly && <X className="h-3.5 w-3.5 text-white" />}
                </button>

                <button
                  onClick={() => updatePet(selectedPet.id, { isRide: !selectedPet.isRide })}
                  className={`relative flex items-center justify-between rounded-lg p-2 transition-all duration-200 ${
                    selectedPet.isRide
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 ring-2 ring-white/50 scale-105"
                      : "bg-gray-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">Ride</span>
                  {selectedPet.isRide && <X className="h-3.5 w-3.5 text-white" />}
                </button>
              </div>
            </div>

            {/* Variants */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Variant</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updatePet(selectedPet.id, { variant: "normal" })}
                  className={`relative flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    selectedPet.variant === "normal"
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 ring-2 ring-white/50 scale-105"
                      : "bg-gray-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">Normal</span>
                </button>

                <button
                  onClick={() => updatePet(selectedPet.id, { variant: "neon" })}
                  className={`relative flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    selectedPet.variant === "neon"
                      ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105"
                      : "bg-gray-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">Neon</span>
                </button>

                <button
                  onClick={() => updatePet(selectedPet.id, { variant: "mega" })}
                  className={`relative flex items-center justify-center rounded-lg p-2 transition-all duration-200 ${
                    selectedPet.variant === "mega"
                      ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105"
                      : "bg-gray-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-md">Mega</span>
                </button>
              </div>
            </div>
          </Card>
        )
      })}

      <Card className="p-3 md:p-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-700 p-4 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-semibold">Add Pet</span>
        </button>
      </Card>

      {/* Reset Button */}
      {selectedPets.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setSelectedPets([])
              setSearchQuery("")
            }}
            variant="outline"
            className="h-9 px-6 text-sm bg-transparent"
          >
            Clear All Pets
          </Button>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-xl border-2 border-gray-700 bg-gray-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Adopt Me Pet</h3>
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
                    onClick={() => addPet(pet)}
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
          </div>
        </div>
      )}
    </div>
  )
}
