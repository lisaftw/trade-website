import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { createTrade, getActiveTrades } from "@/lib/db/queries/trades"
import { getProfile } from "@/lib/db/queries/profiles"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    console.log(" Trade creation - Session:", session?.discordId)

    if (!session) {
      console.error(" Trade creation failed: No authenticated user")
      return NextResponse.json({ error: "You must be logged in to create a trade" }, { status: 401 })
    }

    const body = await request.json()
    const { game, offering, requesting, notes } = body

    console.log(" Trade creation request:", { game, offering, requesting, notes, userId: session.discordId })

    if (!game || typeof game !== "string") {
      console.error(" Trade creation failed: Invalid game")
      return NextResponse.json({ error: "Please select a valid game" }, { status: 400 })
    }

    if (!Array.isArray(offering) || offering.length === 0) {
      console.error(" Trade creation failed: Invalid offering")
      return NextResponse.json({ error: "Please add at least one item you're offering" }, { status: 400 })
    }

    if (!Array.isArray(requesting) || requesting.length === 0) {
      console.error(" Trade creation failed: Invalid requesting")
      return NextResponse.json({ error: "Please add at least one item you're requesting" }, { status: 400 })
    }

    const trade = await createTrade({
      discordId: session.discordId,
      game,
      offering,
      requesting,
      notes,
    })

    console.log(" Trade created successfully:", trade.id)
    return NextResponse.json(trade)
  } catch (error) {
    console.error(" Error creating trade:", error)
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")

    const trades = await getActiveTrades(game || undefined)

    const tradesWithCreators = await Promise.all(
      trades.map(async (trade) => {
        const profile = await getProfile(trade.discord_id)

        return {
          ...trade,
          offering: typeof trade.offering === "string" ? JSON.parse(trade.offering) : trade.offering,
          requesting: typeof trade.requesting === "string" ? JSON.parse(trade.requesting) : trade.requesting,
          creator: profile || {
            discord_id: trade.discord_id,
            username: "Unknown User",
            global_name: null,
            avatar_url: null,
          },
        }
      }),
    )

    return NextResponse.json(tradesWithCreators)
  } catch (error) {
    console.error(" Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
