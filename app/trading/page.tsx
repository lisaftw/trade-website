"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TradeCard from "@/components/trade-card"
import { useUser } from "@/lib/hooks/use-user"
import AuthGate from "@/components/auth-gate"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { RobloxDecos } from "@/components/roblox-decos"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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

export default function TradingPage() {
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [trades, setTrades] = useState<Trade[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "offering" | "requesting">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setError(null)
        const response = await fetch("/api/trades")
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status}`)
        }
        const data = await response.json()
        setTrades(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching trades:", error)
        setError("Failed to load trades")
        setTrades([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [])

  async function startConversation(traderId: string) {
    if (!user) {
      router.push("/login?redirect=/trading")
      return
    }

    try {
      // Check if conversation already exists (either direction)
      const { data: existing1 } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1_id", user.discordId)
        .eq("participant_2_id", traderId)
        .maybeSingle()

      if (existing1) {
        router.push(`/messages?conversation=${existing1.id}`)
        return
      }

      const { data: existing2 } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1_id", traderId)
        .eq("participant_2_id", user.discordId)
        .maybeSingle()

      if (existing2) {
        router.push(`/messages?conversation=${existing2.id}`)
        return
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: user.discordId,
          participant_2_id: traderId,
        })
        .select("id")
        .single()

      if (error) throw error

      router.push(`/messages?conversation=${newConvo.id}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      (Array.isArray(trade.offering) &&
        trade.offering.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (Array.isArray(trade.requesting) &&
        trade.requesting.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase())))

    return matchesSearch
  })

  const offeringTrades = filteredTrades.filter((t) => t.status === "active")
  const requestingTrades = filteredTrades.filter((t) => t.status === "active")

  return (
    <AuthGate>
      <main className="relative min-h-dvh bg-background">
        <PageBackground />
        <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
          <SiteHeader />
          <div className="relative">
            <RobloxDecos />
            <div className="relative z-[1] space-y-8">
              {/* Header Section */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Trade Ads</h1>
                  <p className="mt-2 text-foreground/60">Browse and find the perfect trade for your items.</p>
                </div>
                <Link href="/trading/create">
                  <Button className="btn-neo gap-2 whitespace-nowrap">
                    <Plus className="h-5 w-5" />
                    Create a Trade
                  </Button>
                </Link>
              </div>

              {/* Search and Filter Section */}
              <div className="card-neo space-y-4 p-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
                  <Input
                    placeholder="Search items by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      filterType === "all"
                        ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("offering")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      filterType === "offering"
                        ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    Offering
                  </button>
                  <button
                    onClick={() => setFilterType("requesting")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      filterType === "requesting"
                        ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    Requesting
                  </button>
                </div>

                {/* My Trades Button */}
                <Link href="/trading/my-trades">
                  <Button variant="outline" className="w-full bg-transparent">
                    View My Trades
                  </Button>
                </Link>
              </div>

              {/* Trade Listings */}
              <div className="space-y-4">
                {error && <div className="text-center text-red-500">{error}</div>}
                {loading ? (
                  <div className="text-center text-foreground/60">Loading trades...</div>
                ) : filteredTrades.length === 0 ? (
                  <div className="text-center text-foreground/60">No trades found. Create one to get started!</div>
                ) : (
                  filteredTrades.map((trade) => {
                    const isOwnTrade = trade.discord_id === user?.discordId
                    return (
                      <div key={trade.id} className="space-y-2">
                        <TradeCard trade={trade} isOwnTrade={isOwnTrade} />
                        {!isOwnTrade && user && (
                          <Button
                            onClick={() => startConversation(trade.discord_id)}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message Trader
                          </Button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          <SiteFooter />
        </div>
      </main>
    </AuthGate>
  )
}
