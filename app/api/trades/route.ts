import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    console.log("[v0] Trade creation - Session:", session?.discordId)

    if (!session) {
      console.error("[v0] Trade creation failed: No authenticated user")
      return NextResponse.json({ error: "You must be logged in to create a trade" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

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

    const { data, error } = await supabase
      .from("trades")
      .insert({
        discord_id: session.discordId,
        game,
        offering: JSON.stringify(offering),
        requesting: JSON.stringify(requesting),
        notes: notes || null,
        status: "active",
      })
      .select()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ error: `Failed to create trade: ${error.message}` }, { status: 400 })
    }

    console.log("[v0] Trade created successfully:", data[0]?.id)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("[v0] Error creating trade:", error)
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")

    let query = supabase.from("trades").select("*").eq("status", "active")

    if (game) {
      query = query.eq("game", game)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching trades:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const parsedData = (data || []).map((trade) => ({
      ...trade,
      offering: typeof trade.offering === "string" ? JSON.parse(trade.offering) : trade.offering,
      requesting: typeof trade.requesting === "string" ? JSON.parse(trade.requesting) : trade.requesting,
    }))

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error("[v0] Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
