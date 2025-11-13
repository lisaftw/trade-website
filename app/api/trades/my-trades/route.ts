import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { getUserTrades } from "@/lib/db/queries/trades"
import { getProfile } from "@/lib/db/queries/profiles"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trades = await getUserTrades(session.discordId)

    const profile = await getProfile(session.discordId)
    const tradesWithCreator = trades.map((trade) => ({
      ...trade,
      offering: typeof trade.offering === "string" ? JSON.parse(trade.offering) : trade.offering,
      requesting: typeof trade.requesting === "string" ? JSON.parse(trade.requesting) : trade.requesting,
      creator: profile || {
        discord_id: session.discordId,
        username: "Unknown User",
        global_name: null,
        avatar_url: null,
      },
    }))

    return NextResponse.json(tradesWithCreator)
  } catch (error) {
    console.error("Error fetching user trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
