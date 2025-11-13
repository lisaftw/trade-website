"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

interface AdoptMeVariantSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    name: string
    image_url: string
    value_f?: number | string | null
    value_r?: number | string | null
    value_n?: number | string | null
    value_fr?: number | string | null
    value_nfr?: number | string | null
    value_np?: number | string | null
    value_nr?: number | string | null
    value_nf?: number | string | null
    value_m?: number | string | null
    value_mf?: number | string | null
    value_mr?: number | string | null
    value_mfr?: number | string | null
    rap_value?: number | string | null
  }
  onSelect: (variant: string, quantity: number, value: number) => void
}

type VariantCombo = "Base" | "FR" | "F" | "R" | "N" | "NFR" | "NF" | "NR" | "MFR" | "MF" | "MR" | "M"

const VARIANT_COMBOS: Record<
  VariantCombo,
  { label: string; color: string; valueKey: keyof AdoptMeVariantSelectorProps["item"]; description: string }
> = {
  Base: {
    label: "Base",
    color: "bg-gray-600 hover:bg-gray-700",
    valueKey: "rap_value",
    description: "Base value (no potions, not neon/mega)",
  },
  FR: {
    label: "FR",
    color: "bg-purple-600 hover:bg-purple-700",
    valueKey: "value_fr",
    description: "Fly + Ride",
  },
  F: {
    label: "F",
    color: "bg-blue-500 hover:bg-blue-600",
    valueKey: "value_f",
    description: "Fly only",
  },
  R: {
    label: "R",
    color: "bg-pink-500 hover:bg-pink-600",
    valueKey: "value_r",
    description: "Ride only",
  },
  N: {
    label: "N",
    color: "hover:bg-[#7ab838]",
    valueKey: "value_n",
    description: "Neon (no potions)",
  },
  NFR: {
    label: "NFR",
    color: "bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90",
    valueKey: "value_nfr",
    description: "Neon Fly + Ride",
  },
  NF: {
    label: "NF",
    color: "bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90",
    valueKey: "value_nf",
    description: "Neon Fly",
  },
  NR: {
    label: "NR",
    color: "bg-gradient-to-r from-pink-500 to-cyan-400 hover:opacity-90",
    valueKey: "value_nr",
    description: "Neon Ride",
  },
  MFR: {
    label: "MFR",
    color: "bg-gradient-to-r from-red-500 via-yellow-500 to-purple-600 hover:opacity-90",
    valueKey: "value_mfr",
    description: "Mega Fly + Ride",
  },
  MF: {
    label: "MF",
    color: "bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 hover:opacity-90",
    valueKey: "value_mf",
    description: "Mega Fly",
  },
  MR: {
    label: "MR",
    color: "bg-gradient-to-r from-pink-500 via-yellow-500 to-red-500 hover:opacity-90",
    valueKey: "value_mr",
    description: "Mega Ride",
  },
  M: {
    label: "M",
    color: "bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90",
    valueKey: "value_m",
    description: "Mega (no potions)",
  },
}

export function AdoptMeVariantSelector({ open, onOpenChange, item, onSelect }: AdoptMeVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantCombo | null>(null)
  const [quantity, setQuantity] = useState(1)

  const getVariantValue = (variant: VariantCombo): number => {
    const valueKey = VARIANT_COMBOS[variant].valueKey
    const value = item[valueKey]
    if (value != null) {
      const numValue = typeof value === "string" ? Number.parseFloat(value) : value
      if (!isNaN(numValue) && numValue > 0) {
        return numValue
      }
    }
    return 0
  }

  const handleSelect = () => {
    if (!selectedVariant) return
    const value = getVariantValue(selectedVariant)
    onSelect(selectedVariant, quantity, value)
    onOpenChange(false)
    setSelectedVariant(null)
    setQuantity(1)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)))
  }

  const normalVariants: VariantCombo[] = ["Base", "FR", "F", "R"]
  const neonVariants: VariantCombo[] = ["N", "NFR", "NF", "NR"]
  const megaVariants: VariantCombo[] = ["M", "MFR", "MF", "MR"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Item Image */}
          <div className="relative w-32 h-32 bg-gray-700/50 rounded-lg border-2 border-gray-600">
            <Image src={item.image_url || "/placeholder.svg"} alt={item.name} fill className="object-contain p-2" />
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs text-gray-400 text-center font-semibold">Normal</p>
            <div className="grid grid-cols-4 gap-2">
              {normalVariants.map((variant) => {
                const value = getVariantValue(variant)
                const isSelected = selectedVariant === variant
                const isDisabled = value === 0

                return (
                  <button
                    key={variant}
                    onClick={() => !isDisabled && setSelectedVariant(variant)}
                    disabled={isDisabled}
                    className={`
                      relative px-3 py-2 rounded-lg font-bold text-sm text-white
                      transition-all duration-200 shadow-lg
                      ${isDisabled ? "opacity-30 cursor-not-allowed bg-gray-600" : VARIANT_COMBOS[variant].color}
                      ${isSelected ? "ring-4 ring-white scale-105" : "hover:scale-105"}
                    `}
                    title={`${VARIANT_COMBOS[variant].description} - Value: ${value.toString()}`}
                  >
                    {variant}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs text-gray-400 text-center font-semibold">Neon</p>
            <div className="grid grid-cols-4 gap-2">
              {neonVariants.map((variant) => {
                const value = getVariantValue(variant)
                const isSelected = selectedVariant === variant
                const isDisabled = value === 0
                // Apply special green color for N variant
                const buttonColor = variant === "N" ? "bg-[#8dc43e] hover:bg-[#7ab838]" : VARIANT_COMBOS[variant].color

                return (
                  <button
                    key={variant}
                    onClick={() => !isDisabled && setSelectedVariant(variant)}
                    disabled={isDisabled}
                    className={`
                      relative px-3 py-2 rounded-lg font-bold text-sm text-white
                      transition-all duration-200 shadow-lg
                      ${isDisabled ? "opacity-30 cursor-not-allowed bg-gray-600" : buttonColor}
                      ${isSelected ? "ring-4 ring-white scale-105" : "hover:scale-105"}
                    `}
                    title={`${VARIANT_COMBOS[variant].description} - Value: ${value.toString()}`}
                  >
                    {variant}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs text-gray-400 text-center font-semibold">Mega</p>
            <div className="grid grid-cols-4 gap-2">
              {megaVariants.map((variant) => {
                const value = getVariantValue(variant)
                const isSelected = selectedVariant === variant
                const isDisabled = value === 0

                return (
                  <button
                    key={variant}
                    onClick={() => !isDisabled && setSelectedVariant(variant)}
                    disabled={isDisabled}
                    className={`
                      relative px-3 py-2 rounded-lg font-bold text-sm text-white
                      transition-all duration-200 shadow-lg
                      ${isDisabled ? "opacity-30 cursor-not-allowed bg-gray-600" : VARIANT_COMBOS[variant].color}
                      ${isSelected ? "ring-4 ring-white scale-105" : "hover:scale-105"}
                    `}
                    title={`${VARIANT_COMBOS[variant].description} - Value: ${value.toString()}`}
                  >
                    {variant}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedVariant && (
            <div className="text-center">
              <p className="text-sm text-gray-400">{VARIANT_COMBOS[selectedVariant].description}</p>
              <p className="text-lg font-bold text-white">Value: {getVariantValue(selectedVariant).toString()}</p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 bg-white rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 bg-gray-100 rounded-md">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-2 hover:bg-gray-200 rounded-l-md transition-colors"
                disabled={quantity <= 1}
              >
                <ChevronDown className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-2 hover:bg-gray-200 rounded-r-md transition-colors"
                disabled={quantity >= 99}
              >
                <ChevronUp className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Select Button */}
          <Button
            onClick={handleSelect}
            disabled={!selectedVariant}
            size="lg"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold text-lg py-6 rounded-xl shadow-xl disabled:opacity-50"
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
