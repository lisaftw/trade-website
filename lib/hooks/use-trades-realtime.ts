"use client"

import { useEffect, useState, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"

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

export function useTradesRealtime(userId?: string) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (fetchingRef.current) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const fetchInitialTrades = async () => {
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        setLoading(true)
        setError(null)

        let query = supabase.from("trades").select("*").eq("status", "active")

        if (userId) {
          query = query.eq("discord_id", userId)
        }

        const { data, error: err } = await query.order("created_at", { ascending: false })

        if (err) throw err
        setTrades(data || [])
      } catch (err) {
        console.error("Error fetching trades:", err)
        setError(err instanceof Error ? err.message : "Failed to load trades")
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    fetchInitialTrades()

    if (channelRef.current) {
      return
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTrades((prev) => {
              if (prev.some((t) => t.id === payload.new.id)) return prev
              return [payload.new as Trade, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setTrades((prev) => prev.map((t) => (t.id === payload.new.id ? (payload.new as Trade) : t)))
          } else if (payload.eventType === "DELETE") {
            setTrades((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      fetchingRef.current = false
    }
  }, [userId])

  return { trades, loading, error }
}
