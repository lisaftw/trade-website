"use client"

import { useEffect, useState } from "react"

interface Trade {
  id: string
  discord_id: string
  game: string
  offering: string[]
  requesting: string[]
  notes: string
  created_at: string
  status: string
}

export function useTrades(game?: string) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (game) params.append("game", game)

        const response = await fetch(`/api/trades?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch trades")

        const data = await response.json()
        setTrades(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("[v0] Error fetching trades:", err)
        setError(err instanceof Error ? err.message : "Failed to load trades")
        setTrades([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [game])

  return { trades, loading, error }
}
