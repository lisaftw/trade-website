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
    value_m?: number | string | null
    value_mf?: number | string | null
    value_mr?: number | string | null
    value_mfr?: number | string | null
  }
  onSelect: (variant: string, quantity: number, value: number) => void
}

type Variant = "F" | "R" | "N" | "M"

const VARIANT_INFO: Record<Variant, { label: string; color: string; valueKeys: string[]; description: string }> = {
  F: {
    label: "Fly",
    color: "bg-blue-500 hover:bg-blue-600",
    valueKeys: ["value_f", "value_nf", "value_mf"],
    description: "Fly potion",
  },
  R: {
    label: "Ride",
    color: "bg-pink-500 hover:bg-pink-600",
    valueKeys: ["value_r", "value_nr", "value_mr"],
    description: "Ride potion",
  },
  N: {
    label: "Normal",
    color: "bg-gray-600 hover:bg-gray-700",
    valueKeys: ["value_n", "value_np"],
    description: "No potions",
  },
  M: {
    label: "Mega",
    color: "bg-purple-600 hover:bg-purple-700",
    valueKeys: ["value_m", "value_mf", "value_mr", "value_mfr"],
    description: "Mega/Neon",
  },
}

export function AdoptMeVariantSelector({ open, onOpenChange, item, onSelect }: AdoptMeVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)

  console.log("[v0] AdoptMeVariantSelector received item:", {
    name: item.name,
    value_f: item.value_f,
    value_r: item.value_r,
    value_n: item.value_n,
    value_m: item.value_m,
    value_fr: item.value_fr,
    value_nfr: item.value_nfr,
  })

  const getVariantValue = (variant: Variant): number => {
    const valueKeys = VARIANT_INFO[variant].valueKeys
    for (const key of valueKeys) {
      const value = item[key as keyof typeof item]
      if (value != null) {
        const numValue = typeof value === "string" ? Number.parseFloat(value) : value
        if (!isNaN(numValue) && numValue > 0) {
          return numValue
        }
      }
    }
    return 0
  }

  const handleSelect = () => {
    if (!selectedVariant) return
    const value = getVariantValue(selectedVariant)
    onSelect(selectedVariant, quantity, value)
    onOpenChange(false)
    // Reset state
    setSelectedVariant(null)
    setQuantity(1)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)))
  }

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

          {/* Variant Selector */}
          <div className="flex gap-3 bg-gray-700/30 rounded-2xl p-3">
            {(Object.keys(VARIANT_INFO) as Variant[]).map((variant) => {
              const value = getVariantValue(variant)
              const isSelected = selectedVariant === variant
              const isDisabled = value === 0

              return (
                <button
                  key={variant}
                  onClick={() => !isDisabled && setSelectedVariant(variant)}
                  disabled={isDisabled}
                  className={`
                    relative w-14 h-14 rounded-full font-bold text-xl text-white
                    transition-all duration-200 shadow-lg
                    ${isDisabled ? "opacity-30 cursor-not-allowed bg-gray-600" : VARIANT_INFO[variant].color}
                    ${isSelected ? "ring-4 ring-white scale-110" : "hover:scale-105"}
                  `}
                  title={`${VARIANT_INFO[variant].description} - Value: ${value}`}
                >
                  {variant}
                </button>
              )
            })}
          </div>

          {/* Show value when variant is selected */}
          {selectedVariant && (
            <div className="text-center">
              <p className="text-sm text-gray-400">{VARIANT_INFO[selectedVariant].description}</p>
              <p className="text-lg font-bold text-white">Value: {getVariantValue(selectedVariant)}</p>
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
