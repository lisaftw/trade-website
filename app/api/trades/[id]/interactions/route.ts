import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth/session-postgres"
import { query } from "@/lib/db/postgres"
import { moderateContent } from "@/lib/utils/content-moderation"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const session = await getSession(cookieStore)

    console.log("Trade request - User:", session?.discordId)

    if (!session?.discordId) {
      console.log("Trade request - No user found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (message) {
      const moderation = await moderateContent(message)
      if (moderation.isInappropriate) {
        console.log("Trade request blocked: Inappropriate content detected")
        return NextResponse.json({ error: moderation.reason }, { status: 400 })
      }
    }

    // Verify trade exists
    const tradeCheck = await query("SELECT id FROM trades WHERE id = $1", [params.id])

    if (tradeCheck.rows.length === 0) {
      console.log("Trade not found:", params.id)
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    const result = await query(
      `INSERT INTO trade_interactions (initiator_id, trade_id, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [session.discordId, params.id, message, "pending"],
    )

    console.log("Trade request created successfully")
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating interaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await query(
      `SELECT ti.*, 
              p.discord_id, p.username, p.global_name, p.avatar_url
       FROM trade_interactions ti
       LEFT JOIN profiles p ON ti.initiator_id = p.discord_id
       WHERE ti.trade_id = $1
       ORDER BY ti.created_at DESC`,
      [params.id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
