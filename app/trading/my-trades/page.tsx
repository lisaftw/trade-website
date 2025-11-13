"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import TradeCard from "@/components/trade-card"
import { EditTradeDialog } from "@/components/edit-trade-dialog"
import { useUser } from "@/lib/hooks/use-user"
import AuthGate from "@/components/auth-gate"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { RobloxDecos } from "@/components/roblox-decos"

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

export default function MyTradesPage() {
  const router = useRouter()
  const { user } = useUser()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const fetchMyTrades = async () => {
      try {
        setError(null)
        const response = await fetch("/api/trades/my-trades")
        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status}`)
        }
        const data = await response.json()
        setTrades(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching trades:", error)
        setError("Failed to load your trades")
        setTrades([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyTrades()
  }, [])

  const handleDelete = (id: string) => {
    setTrades(trades.filter((t) => t.id !== id))
  }

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade)
    setShowEditDialog(true)
  }

  const handleEditSuccess = (updatedTrade: Trade) => {
    setTrades(trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)))
  }

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
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">My Trades</h1>
                  <p className="mt-2 text-foreground/60">Manage all your active trade listings.</p>
                </div>
              </div>

              {/* Trade Listings */}
              <div className="space-y-4">
                {error && <div className="text-center text-red-500">{error}</div>}
                {loading ? (
                  <div className="text-center text-foreground/60">Loading your trades...</div>
                ) : trades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">No Trade Ads Yet</h3>
                      <p className="text-foreground/60">Create your first trade ad to get started</p>
                    </div>
                    <Button
                      onClick={() => router.push("/trading/create")}
                      size="lg"
                      className="btn-neo gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Create a Trade
                    </Button>
                  </div>
                ) : (
                  trades.map((trade) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      isOwnTrade={true}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          <SiteFooter />
        </div>
      </main>

      <EditTradeDialog
        trade={editingTrade}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </AuthGate>
  )
}
