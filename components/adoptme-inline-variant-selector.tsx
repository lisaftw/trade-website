"use client"

import { useState, useEffect } from "react"

interface InlineVariantSelectorProps {
  item: {
    value_f?: number | string | null
    value_r?: number | string | null
    value_n?: number | string | null
    value_fr?: number | string | null
    value_nfr?: number | string | null
    value_nf?: number | string | null
    value_nr?: number | string | null
    value_m?: number | string | null
    value_mf?: number | string | null
    value_mr?: number | string | null
    value_mfr?: number | string | null
    rap_value?: number | string | null
  }
  onSelect: (variant: string, value: number) => void
  onQuantityChange?: (quantity: number) => void
  initialQuantity?: number
  showQuantity?: boolean
  onValueChange?: (variant: string, value: number) => void
}

type Variant = "F" | "R" | "N" | "M"

const VARIANT_CONFIG = {
  F: { label: "F", color: "bg-cyan-500" },
  R: { label: "R", color: "bg-pink-500" },
  N: { label: "N", color: "bg-[#8dc43e]" },
  M: { label: "M", color: "bg-purple-500" },
}

export function AdoptMeInlineVariantSelector({
  item,
  onSelect,
  onQuantityChange,
  initialQuantity = 1,
  showQuantity = true,
  onValueChange,
}: InlineVariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Set<Variant>>(() => {
    return new Set<Variant>(["F", "R"])
  })
  const [quantity, setQuantity] = useState(initialQuantity)

  useEffect(() => {
    updateSelection(selectedVariants)
  }, [])

  const toggleVariant = (variant: Variant) => {
    const newVariants = new Set(selectedVariants)

    if (variant === "N" || variant === "M") {
      // Clear N and M, then add the clicked one
      newVariants.delete("N")
      newVariants.delete("M")
      if (!selectedVariants.has(variant)) {
        newVariants.add(variant)
      }
    } else {
      // Toggle F or R
      if (newVariants.has(variant)) {
        newVariants.delete(variant)
      } else {
        newVariants.add(variant)
      }
    }

    setSelectedVariants(newVariants)
    updateSelection(newVariants)
  }

  const updateSelection = (variants: Set<Variant>) => {
    const hasF = variants.has("F")
    const hasR = variants.has("R")
    const hasN = variants.has("N")
    const hasM = variants.has("M")

    let variantKey: keyof typeof item
    let variantLabel: string

    if (hasM) {
      if (hasF && hasR) {
        variantKey = "value_mfr"
        variantLabel = "MFR"
      } else if (hasF) {
        variantKey = "value_mf"
        variantLabel = "MF"
      } else if (hasR) {
        variantKey = "value_mr"
        variantLabel = "MR"
      } else {
        variantKey = "value_m"
        variantLabel = "M"
      }
    } else if (hasN) {
      if (hasF && hasR) {
        variantKey = "value_nfr"
        variantLabel = "NFR"
      } else if (hasF) {
        variantKey = "value_nf"
        variantLabel = "NF"
      } else if (hasR) {
        variantKey = "value_nr"
        variantLabel = "NR"
      } else {
        variantKey = "value_n"
        variantLabel = "N"
      }
    } else {
      // Normal pet (not Neon or Mega)
      if (hasF && hasR) {
        variantKey = "value_fr"
        variantLabel = "FR"
      } else if (hasF) {
        variantKey = "value_f"
        variantLabel = "F"
      } else if (hasR) {
        variantKey = "value_r"
        variantLabel = "R"
      } else {
        variantKey = "rap_value"
        variantLabel = "Normal"
      }
    }

    const value = item[variantKey]
    let numValue = value != null ? (typeof value === "string" ? Number.parseFloat(value) : value) : 0
    
    if ((!numValue || numValue === 0) && variantKey !== "rap_value") {
      // Define smarter fallback hierarchy based on the requested variant
      const fallbackKeys: Array<keyof typeof item> = []
      
      if (hasM && hasF && hasR) {
        // MFR fallbacks
        fallbackKeys.push("value_mfr", "value_m", "value_fr", "rap_value")
      } else if (hasM && hasF) {
        // MF fallbacks  
        fallbackKeys.push("value_mf", "value_mfr", "value_m", "value_f", "rap_value")
      } else if (hasM && hasR) {
        // MR fallbacks
        fallbackKeys.push("value_mr", "value_mfr", "value_m", "value_r", "rap_value")
      } else if (hasM) {
        // M fallbacks
        fallbackKeys.push("value_m", "value_mfr", "rap_value")
      } else if (hasN && hasF && hasR) {
        // NFR fallbacks
        fallbackKeys.push("value_nfr", "value_n", "value_fr", "rap_value")
      } else if (hasN && hasF) {
        // NF fallbacks - try other neon+fly combos before plain neon
        fallbackKeys.push("value_nf", "value_nfr", "value_f", "value_n", "rap_value")
      } else if (hasN && hasR) {
        // NR fallbacks - try other neon+ride combos before plain neon
        fallbackKeys.push("value_nr", "value_nfr", "value_r", "value_n", "rap_value")
      } else if (hasN) {
        // N fallbacks
        fallbackKeys.push("value_n", "value_nfr", "rap_value")
      } else if (hasF && hasR) {
        // FR fallbacks
        fallbackKeys.push("value_fr", "value_f", "value_r", "rap_value")
      } else if (hasF) {
        // F fallbacks
        fallbackKeys.push("value_f", "value_fr", "rap_value")
      } else if (hasR) {
        // R fallbacks
        fallbackKeys.push("value_r", "value_fr", "rap_value")
      } else {
        // Base fallbacks
        fallbackKeys.push("rap_value")
      }
      
      // Remove the primary key if it's already in fallbacks
      const filteredFallbacks = fallbackKeys.filter(key => key !== variantKey)
      
      // Find first available fallback value
      for (const fallbackKey of filteredFallbacks) {
        const fallbackValue = item[fallbackKey]
        if (fallbackValue != null) {
          const fallbackNum = typeof fallbackValue === "string" ? Number.parseFloat(fallbackValue) : fallbackValue
          if (!isNaN(fallbackNum) && fallbackNum > 0) {
            numValue = fallbackNum
            break
          }
        }
      }
    }
    
    const finalValue = !isNaN(numValue) && numValue > 0 ? numValue : 0

    onSelect(variantLabel, finalValue)

    if (onValueChange) {
      onValueChange(variantLabel, finalValue)
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(99, quantity + delta))
    setQuantity(newQuantity)
    if (onQuantityChange) {
      onQuantityChange(newQuantity)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Variant buttons */}
      <div className="flex items-center gap-1">
        {(Object.keys(VARIANT_CONFIG) as Variant[]).map((variant) => {
          const isSelected = selectedVariants.has(variant)
          const config = VARIANT_CONFIG[variant]

          return (
            <button
              key={variant}
              onClick={(e) => {
                e.stopPropagation()
                toggleVariant(variant)
              }}
              className={`
                w-6 h-6 rounded-full font-bold text-[10px] text-white
                transition-all duration-200 shadow-md
                ${isSelected ? config.color : "bg-gray-600"}
                ${isSelected ? "scale-110 ring-2 ring-white" : "hover:scale-105"}
              `}
            >
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Quantity controls */}
      {showQuantity && (
        <div className="flex items-center gap-1.5 bg-white rounded-md px-1.5 py-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleQuantityChange(-1)
            }}
            disabled={quantity <= 1}
            className="text-gray-700 font-bold text-base px-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            −
          </button>
          <span className="text-gray-900 font-bold text-xs min-w-[1.5rem] text-center">{quantity}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleQuantityChange(1)
            }}
            disabled={quantity >= 99}
            className="text-gray-700 font-bold text-base px-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
