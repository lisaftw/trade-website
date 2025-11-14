"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface Item {
  id: string
  game: string
  name: string
  image_url: string
  rap_value: number
  neon_value?: number
  mega_value?: number
  fly_bonus?: number
  ride_bonus?: number
  exist_count?: number
  rating?: number
  change_percent?: number
  last_updated_at?: string
  section?: string
  rarity?: string
  demand?: string
  pot?: string
  value_f?: number | null
  value_r?: number | null
  value_n?: number | null
  value_fr?: number | null
  value_h?: number | null
  value_nfr?: number | null
  value_np?: number | null
  value_nr?: number | null
  value_mfr?: number | null
  value_mf?: number | null
  value_mr?: number | null
  value_m?: number | null
}

interface ItemsContextValue {
  items: Item[]
  isLoading: boolean
  error: string | null
  getItemsByGame: (game: string) => Item[]
  searchItems: (query: string, game?: string) => Item[]
  refetch: () => Promise<void>
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined)

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllItems = useCallback(async () => {
    try {
      console.log("[v0] Preloading all items...")
      setIsLoading(true)
      setError(null)

      // Fetch items without game filter to get all at once
      const response = await fetch("/api/items?limit=10000")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Successfully preloaded", data.items?.length || 0, "items")
      
      setItems(data.items || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load items"
      console.error("[v0] Error preloading items:", err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Preload items on mount
  useEffect(() => {
    fetchAllItems()
  }, [fetchAllItems])

  const getItemsByGame = useCallback(
    (game: string): Item[] => {
      return items.filter((item) => item.game === game)
    },
    [items]
  )

  const searchItems = useCallback(
    (query: string, game?: string): Item[] => {
      const lowerQuery = query.toLowerCase()
      let filtered = items.filter((item) => item.name.toLowerCase().includes(lowerQuery))

      if (game) {
        filtered = filtered.filter((item) => item.game === game)
      }

      return filtered.slice(0, 50) // Limit search results
    },
    [items]
  )

  const refetch = useCallback(async () => {
    await fetchAllItems()
  }, [fetchAllItems])

  const value: ItemsContextValue = {
    items,
    isLoading,
    error,
    getItemsByGame,
    searchItems,
    refetch,
  }

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
}

export function useItems() {
  const context = useContext(ItemsContext)
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider")
  }
  return context
}
