"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

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
  {
    id: "nyan-cats",
    name: "Nyan Cats",
    multiplier: 6.0,
    color: "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400",
  },
  { id: "paint", name: "Paint", multiplier: 6.0, color: "bg-gradient-to-r from-white to-gray-300" },
  { id: "strawberry", name: "Strawberry", multiplier: 8.0, color: "bg-gradient-to-r from-pink-400 to-pink-600" },
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
  { id: "crab-rave", name: "Crab Rave", multiplier: 5.0, color: "bg-gradient-to-r from-orange-500 to-red-500" },
  { id: "sombero", name: "Sombero", multiplier: 5.0, color: "bg-gradient-to-r from-gray-300 to-gray-400" },
  { id: "tung-tung", name: "Tung Tung Attack", multiplier: 5.0, color: "bg-gradient-to-r from-pink-500 to-purple-500" },
  { id: "brazil", name: "Brazil", multiplier: 6.0, color: "bg-gradient-to-r from-green-500 to-yellow-400" },
  { id: "dragon", name: "Dragon", multiplier: 6.0, color: "bg-gradient-to-r from-blue-600 to-blue-800" },
  { id: "fire", name: "Fire", multiplier: 6.0, color: "bg-gradient-to-r from-orange-500 to-red-600" },
  { id: "fireworks", name: "Fireworks", multiplier: 6.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  { id: "glitch", name: "Glitch", multiplier: 6.0, color: "bg-gradient-to-r from-cyan-400 to-purple-500" },
  { id: "galaxy", name: "Galaxy", multiplier: 7.0, color: "bg-gradient-to-r from-purple-600 to-purple-800" },
  { id: "yinyang", name: "YinYang", multiplier: 7.0, color: "bg-gradient-to-r from-gray-800 to-gray-600" },
]

export function SABCalculator() {
  const [baseValue, setBaseValue] = useState<string>("")
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null)
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])

  // Calculate final value
  const calculatedValue = useMemo(() => {
    const base = Number.parseFloat(baseValue) || 0
    if (base === 0) return 0

    const mutationMultiplier = selectedMutation ? MUTATIONS.find((m) => m.id === selectedMutation)?.multiplier || 1 : 1

    const traitsMultiplier = selectedTraits.reduce((acc, traitId) => {
      const trait = TRAITS.find((t) => t.id === traitId)
      return acc * (trait?.multiplier || 1)
    }, 1)

    return base * mutationMultiplier * traitsMultiplier
  }, [baseValue, selectedMutation, selectedTraits])

  const toggleTrait = (traitId: string) => {
    setSelectedTraits((prev) => (prev.includes(traitId) ? prev.filter((id) => id !== traitId) : [...prev, traitId]))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">SAB Value Calculator</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Calculate pet values with mutations and traits
        </p>
      </div>

      {/* Base Value Input */}
      <Card className="p-4 md:p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="base-value" className="text-base font-semibold">
              Base RAP Value
            </Label>
            <Input
              id="base-value"
              type="number"
              placeholder="Enter base value (e.g., 10000)"
              value={baseValue}
              onChange={(e) => setBaseValue(e.target.value)}
              className="mt-2 h-12 text-lg"
            />
          </div>

          {/* Result Display */}
          {baseValue && Number.parseFloat(baseValue) > 0 && (
            <div className="rounded-lg border-2 border-brand/50 bg-brand/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Calculated Value</p>
              <p className="mt-1 text-3xl md:text-4xl font-bold text-brand">{formatNumber(calculatedValue)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Base: {formatNumber(Number.parseFloat(baseValue))} × Mutation:{" "}
                {selectedMutation ? MUTATIONS.find((m) => m.id === selectedMutation)?.multiplier : 1}x × Traits:{" "}
                {selectedTraits.length > 0
                  ? selectedTraits
                      .reduce((acc, id) => acc * (TRAITS.find((t) => t.id === id)?.multiplier || 1), 1)
                      .toFixed(2)
                  : 1}
                x
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mutations Section */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Mutation (Select One)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MUTATIONS.map((mutation) => (
            <button
              key={mutation.id}
              onClick={() => setSelectedMutation(mutation.id === selectedMutation ? null : mutation.id)}
              className={`relative flex items-center justify-between rounded-xl p-3 transition-all duration-200 ${
                mutation.color
              } ${
                selectedMutation === mutation.id
                  ? "ring-4 ring-white/50 scale-105 shadow-lg"
                  : "opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="font-semibold text-white drop-shadow-md">{mutation.name}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-900">
                  {mutation.multiplier}x
                </span>
                {selectedMutation === mutation.id && <X className="h-5 w-5 text-white" />}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Traits Section */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Traits (Select Multiple)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRAITS.map((trait) => (
            <button
              key={trait.id}
              onClick={() => toggleTrait(trait.id)}
              className={`relative flex items-center justify-between rounded-xl p-3 transition-all duration-200 ${
                trait.color
              } ${
                selectedTraits.includes(trait.id)
                  ? "ring-4 ring-white/50 scale-105 shadow-lg"
                  : "opacity-70 hover:opacity-100 hover:scale-102"
              }`}
            >
              <span className="font-semibold text-white drop-shadow-md">{trait.name}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-900">
                  {trait.multiplier}x
                </span>
                {selectedTraits.includes(trait.id) && <X className="h-5 w-5 text-white" />}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Reset Button */}
      {(baseValue || selectedMutation || selectedTraits.length > 0) && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setBaseValue("")
              setSelectedMutation(null)
              setSelectedTraits([])
            }}
            variant="outline"
            className="h-12 px-8"
          >
            Reset Calculator
          </Button>
        </div>
      )}
    </div>
  )
}
