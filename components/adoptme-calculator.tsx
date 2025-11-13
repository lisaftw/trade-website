"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, Info } from "lucide-react"

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
  const [isFly, setIsFly] = useState(false)
  const [isRide, setIsRide] = useState(false)
  const [variant, setVariant] = useState<"normal" | "neon" | "mega">("normal")
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

  const calculatedValue = useMemo(() => {
    if (!selectedPet) return 0

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

    let potionBonus = 0
    if (isFly) potionBonus += selectedPet.flyBonus
    if (isRide) potionBonus += selectedPet.rideBonus

    return baseValue + potionBonus
  }, [selectedPet, isFly, isRide, variant])

  const formatNumber = (num: number) => {
    const safeNum = toNumber(num)
    return safeNum % 1 === 0 ? safeNum.toLocaleString() : safeNum.toString()
  }

  const getDisplayName = () => {
    if (!selectedPet) return ""
    const parts: string[] = []
    if (variant === "neon") parts.push("Neon")
    if (variant === "mega") parts.push("Mega")
    if (isFly && isRide) parts.push("Fly Ride")
    else if (isFly) parts.push("Fly")
    else if (isRide) parts.push("Ride")
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
      if (isFly && isRide) parts.push("FR")
      else if (isFly) parts.push("F")
      else if (isRide) parts.push("R")
    }
    parts.push(selectedPet.name)
    return parts.join(" ")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-balance">Adopt Me Value Calculator</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">Calculate pet values with potions and variants</p>
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
                <p className="text-sm font-semibold">{getShortDisplayName()}</p>
                <p className="text-xs text-muted-foreground">Base: {formatNumber(selectedPet.baseValue)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPet(null)
                setIsFly(false)
                setIsRide(false)
                setVariant("normal")
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
            <p className="mt-1 text-xs text-muted-foreground">{getDisplayName()}</p>
          </div>

          {/* Potions */}
          <Card className="p-3 md:p-4">
            <h3 className="mb-3 text-sm font-semibold">Potions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsFly(!isFly)}
                className={`relative flex items-center justify-between rounded-lg p-3 transition-all duration-200 ${
                  isFly
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 ring-2 ring-white/50 scale-105"
                    : "bg-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-sm font-semibold text-white drop-shadow-md">Fly</span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-900">
                  +{selectedPet.flyBonus}
                </span>
              </button>

              <button
                onClick={() => setIsRide(!isRide)}
                className={`relative flex items-center justify-between rounded-lg p-3 transition-all duration-200 ${
                  isRide
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 ring-2 ring-white/50 scale-105"
                    : "bg-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-sm font-semibold text-white drop-shadow-md">Ride</span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-900">
                  +{selectedPet.rideBonus}
                </span>
              </button>
            </div>
          </Card>

          {/* Variants */}
          <Card className="p-3 md:p-4">
            <h3 className="mb-3 text-sm font-semibold">Variant</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setVariant("normal")}
                className={`relative flex flex-col items-center justify-center rounded-lg p-3 transition-all duration-200 ${
                  variant === "normal"
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 ring-2 ring-white/50 scale-105"
                    : "bg-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-sm font-semibold text-white drop-shadow-md">Normal</span>
                <span className="mt-1 text-xs text-white/70">{formatNumber(selectedPet.baseValue)}</span>
              </button>

              <button
                onClick={() => setVariant("neon")}
                className={`relative flex flex-col items-center justify-center rounded-lg p-3 transition-all duration-200 ${
                  variant === "neon"
                    ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105"
                    : "bg-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-sm font-semibold text-white drop-shadow-md">Neon</span>
                <span className="mt-1 text-xs text-white/70">
                  {selectedPet.neonValue > 0 ? formatNumber(selectedPet.neonValue) : "Not set"}
                </span>
              </button>

              <button
                onClick={() => setVariant("mega")}
                className={`relative flex flex-col items-center justify-center rounded-lg p-3 transition-all duration-200 ${
                  variant === "mega"
                    ? "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 ring-2 ring-white/50 scale-105"
                    : "bg-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <span className="text-sm font-semibold text-white drop-shadow-md">Mega</span>
                <span className="mt-1 text-xs text-white/70">
                  {selectedPet.megaValue > 0 ? formatNumber(selectedPet.megaValue) : "Not set"}
                </span>
              </button>
            </div>
          </Card>

          {/* Information Cards */}
          {variant === "neon" && selectedPet.neonValue === 0 && (
            <Card className="p-3 bg-blue-500/10 border-blue-500/20">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Neon Value Information</p>
                  <p>Neon pets require 4 identical pets to create. Values are manually set and vary by pet.</p>
                  <p className="mt-1 text-yellow-500 font-medium">⚠️ Neon value not set for this pet yet.</p>
                </div>
              </div>
            </Card>
          )}

          {variant === "mega" && selectedPet.megaValue === 0 && (
            <Card className="p-3 bg-blue-500/10 border-blue-500/20">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Mega Value Information</p>
                  <p>Mega pets require 4 identical Neon pets to create. Values are manually set and vary by pet.</p>
                  <p className="mt-1 text-yellow-500 font-medium">⚠️ Mega value not set for this pet yet.</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-xl border-2 border-gray-700 bg-gray-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Select Adopt Me Pet</h3>
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
