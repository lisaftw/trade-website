import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { requireCSRF } from "@/lib/security/csrf"
import { verifySignature } from "@/lib/security/request-signing"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import {
  safeJsonParse,
  validateArrayBounds,
  normalizeUnicode,
  getSingleParam,
} from "@/lib/security/low-level-protection"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const csrfValid = await requireCSRF(request)
    if (!csrfValid) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "You must be logged in to create a trade" }, { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(request, "write", session.discordId)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const signature = request.headers.get("x-request-signature")
    const timestamp = Number.parseInt(request.headers.get("x-request-timestamp") || "0")

    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json({ error: "Request payload too large" }, { status: 413 })
    }

    const body = await request.json()

    if (signature && timestamp) {
      const signatureValid = verifySignature(body, timestamp, signature)
      if (!signatureValid) {
        return NextResponse.json({ error: "Invalid request signature" }, { status: 403 })
      }
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

    const { game, offering, requesting, notes } = body

    const normalizedGame = normalizeUnicode(game || "")
    const normalizedNotes = notes ? normalizeUnicode(notes) : null

    if (!normalizedGame || typeof normalizedGame !== "string") {
      return NextResponse.json({ error: "Please select a valid game" }, { status: 400 })
    }

    if (!validateArrayBounds(offering, 100)) {
      return NextResponse.json({ error: "Too many items in offering (max 100)" }, { status: 400 })
    }

    if (!validateArrayBounds(requesting, 100)) {
      return NextResponse.json({ error: "Too many items in requesting (max 100)" }, { status: 400 })
    }

    if (!Array.isArray(offering) || offering.length === 0) {
      return NextResponse.json({ error: "Please add at least one item you're offering" }, { status: 400 })
    }

    if (!Array.isArray(requesting) || requesting.length === 0) {
      return NextResponse.json({ error: "Please add at least one item you're requesting" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("trades")
      .insert({
        discord_id: session.discordId,
        game: normalizedGame,
        offering: JSON.stringify(offering),
        requesting: JSON.stringify(requesting),
        notes: normalizedNotes,
        status: "active",
      })
      .select()

    if (error) {
      return NextResponse.json({ error: `Failed to create trade: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
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

    const game = getSingleParam(new URL(request.url), "game")

    let query = supabase.from("trades").select("*").eq("status", "active")

    if (game) {
      query = query.eq("game", game)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching trades:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const tradesWithCreators = await Promise.all(
      (data || []).map(async (trade) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("discord_id, username, global_name, avatar_url")
          .eq("discord_id", trade.discord_id)
          .single()

        const offering = safeJsonParse(
          typeof trade.offering === "string" ? trade.offering : JSON.stringify(trade.offering),
        )
        const requesting = safeJsonParse(
          typeof trade.requesting === "string" ? trade.requesting : JSON.stringify(trade.requesting),
        )

        return {
          ...trade,
          offering: offering || [],
          requesting: requesting || [],
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
    console.error("Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
