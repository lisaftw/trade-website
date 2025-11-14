import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { createTrade, getActiveTrades, getActiveTradesCount, deleteExpiredTrades } from "@/lib/db/queries/trades"
import { getProfile } from "@/lib/db/queries/profiles"
import { moderateContent } from "@/lib/utils/content-moderation"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    console.log("[v0] Trade creation - Session:", session?.discordId)

    if (!session) {
      console.error("[v0] Trade creation failed: No authenticated user")
      return NextResponse.json({ error: "You must be logged in to create a trade" }, { status: 401 })
    }

    const activeCount = await getActiveTradesCount(session.discordId)
    if (activeCount >= 3) {
      console.error("[v0] Trade creation failed: User has reached maximum active trades")
      return NextResponse.json(
        { error: "You can only have 3 active trades at once. Please delete an existing trade before creating a new one." },
        { status: 429 },
      )
    }

    const body = await request.json()
    const { game, offering, requesting, notes } = body

    console.log("[v0] Trade creation request:", { game, offering, requesting, notes, userId: session.discordId })

    if (!game || typeof game !== "string") {
      console.error("[v0] Trade creation failed: Invalid game")
      return NextResponse.json({ error: "Please select a valid game" }, { status: 400 })
    }

    if (!Array.isArray(offering) || offering.length === 0) {
      console.error("[v0] Trade creation failed: Invalid offering")
      return NextResponse.json({ error: "Please add at least one item you're offering" }, { status: 400 })
    }

    if (!Array.isArray(requesting) || requesting.length === 0) {
      console.error("[v0] Trade creation failed: Invalid requesting")
      return NextResponse.json({ error: "Please add at least one item you're requesting" }, { status: 400 })
    }

    if (notes) {
      const moderation = await moderateContent(notes)
      if (moderation.isInappropriate) {
        console.error("[v0] Trade creation failed: Inappropriate content in notes")
        return NextResponse.json({ error: moderation.reason }, { status: 400 })
      }
    }

    const trade = await createTrade({
      discordId: session.discordId,
      game,
      offering,
      requesting,
      notes,
    })

    console.log("[v0] Trade created successfully:", trade.id)
    return NextResponse.json(trade)
  } catch (error) {
    console.error("[v0] Error creating trade:", error)
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const deletedCount = await deleteExpiredTrades()
    if (deletedCount > 0) {
      console.log(`[v0] Deleted ${deletedCount} expired trades`)
    }

    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")

    const trades = await getActiveTrades(game || undefined)

    // Fetch creator profiles for each trade
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
    console.error("[v0] Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
