"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Loader2 } from "lucide-react"
import { CreateTradeDialog } from "@/components/create-trade-dialog"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { UserSession } from "@/lib/auth/session"

type TradeRequest = {
  id: string
  creator_id: string
  game: string
  type: "offer" | "request"
  item_name: string
  item_value: number | null
  description: string | null
  status: string
  created_at: string
  creator: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
}

export function TradesContent({ currentUser }: { currentUser: UserSession | null }) {
  const [trades, setTrades] = useState<TradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState("Adopt Me")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTrades()
  }, [])

  async function fetchTrades() {
    try {
      const query = supabase
        .from("trade_requests")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      const { data: tradesData, error } = await query

      if (error) throw error

      // Fetch creator profiles
      const tradesWithCreators = await Promise.all(
        (tradesData || []).map(async (trade) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("discord_id, username, global_name, avatar_url")
            .eq("discord_id", trade.creator_id)
            .single()

          return {
            ...trade,
            creator: profile || {
              discord_id: trade.creator_id,
              username: "Unknown User",
              global_name: null,
              avatar_url: null,
            },
          }
        }),
      )

      setTrades(tradesWithCreators)
    } catch (error) {
      console.error("Error fetching trades:", error)
    } finally {
      setLoading(false)
    }
  }

  async function startConversation(traderId: string) {
    if (!currentUser) {
      router.push("/login?redirect=/trades")
      return
    }

    if (messagingUserId) return
    setMessagingUserId(traderId)

    try {
      // Check if conversation already exists (either direction)
      const { data: existing1 } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1_id", currentUser.discordId)
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
        .eq("participant_2_id", currentUser.discordId)
        .maybeSingle()

      if (existing2) {
        router.push(`/messages?conversation=${existing2.id}`)
        return
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: currentUser.discordId,
          participant_2_id: traderId,
        })
        .select("id")
        .single()

      if (error) throw error

      router.push(`/messages?conversation=${newConvo.id}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
    } finally {
      setMessagingUserId(null)
    }
  }

  const filteredTrades = selectedGame === "all" ? trades : trades.filter((t) => t.game === selectedGame)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trade Marketplace</h1>
          <p className="text-muted-foreground">Find trades and connect with other traders</p>
        </div>
        {currentUser && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Trade
          </Button>
        )}
      </div>

      <Tabs value={selectedGame} onValueChange={setSelectedGame}>
        <TabsList>
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="Adopt Me">Adopt Me</TabsTrigger>
          {/* MM2 and SAB hidden for future launch
          <TabsTrigger value="MM2">MM2</TabsTrigger>
          <TabsTrigger value="SAB">SAB</TabsTrigger>
          */}
        </TabsList>

        <TabsContent value={selectedGame} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTrades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No active trades found. Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrades.map((trade) => {
                const displayName = trade.creator.global_name || trade.creator.username || "Unknown User"
                const avatarUrl = trade.creator.avatar_url || "/placeholder.svg?height=40&width=40"
                const isOwnTrade = currentUser?.discordId === trade.creator_id

                return (
                  <Card key={trade.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Image
                            src={avatarUrl || "/placeholder.svg"}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-base">{displayName}</CardTitle>
                            <CardDescription className="text-xs">
                              @{trade.creator.username || "unknown"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={trade.type === "offer" ? "default" : "secondary"}>
                          {trade.type === "offer" ? "Offering" : "Requesting"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">{trade.item_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{trade.game}</Badge>
                          {trade.item_value && (
                            <span className="text-xs text-muted-foreground">Value: {trade.item_value}</span>
                          )}
                        </div>
                      </div>
                      {trade.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{trade.description}</p>
                      )}
                      {!isOwnTrade && currentUser && (
                        <Button
                          onClick={() => startConversation(trade.creator_id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={messagingUserId === trade.creator_id}
                        >
                          {messagingUserId === trade.creator_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="mr-2 h-4 w-4" />
                          )}
                          Message Trader
                        </Button>
                      )}
                      {!currentUser && (
                        <Button
                          onClick={() => router.push("/login?redirect=/trades")}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Login to Message
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentUser && (
        <CreateTradeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          currentUserId={currentUser.discordId}
          onSuccess={fetchTrades}
        />
      )}
    </div>
  )
}
