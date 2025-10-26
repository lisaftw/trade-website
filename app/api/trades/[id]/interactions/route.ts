import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { tradeInteractionSchema, sanitizeHtml, isValidUUID } from "@/lib/security/input-validator"
import { handleApiError, AppError } from "@/lib/security/error-handler"
import { checkRateLimit } from "@/lib/security/rate-limiter"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidUUID(params.id)) {
      throw new AppError(400, "Invalid trade ID format")
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AppError(401, "Unauthorized")
    }

    const rateLimitResult = await checkRateLimit(request, "write", user.id)
    if (!rateLimitResult.success) {
      throw new AppError(429, "Too many requests")
    }

    const body = await request.json()

    const validationResult = tradeInteractionSchema.safeParse(body)
    if (!validationResult.success) {
      throw new AppError(400, "Invalid message format")
    }

    const sanitizedMessage = sanitizeHtml(validationResult.data.message)

    const { data: trade, error: tradeError } = await supabase.from("trades").select("id").eq("id", params.id).single()

    if (tradeError || !trade) {
      throw new AppError(404, "Trade not found")
    }

    const { data, error } = await supabase
      .from("trade_interactions")
      .insert({
        initiator_id: user.id,
        trade_id: params.id,
        message: sanitizedMessage,
        status: "pending",
      })
      .select()

    if (error) {
      throw new AppError(400, error.message)
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidUUID(params.id)) {
      throw new AppError(400, "Invalid trade ID format")
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AppError(401, "Unauthorized")
    }

    const { data: trade } = await supabase.from("trades").select("discord_id").eq("id", params.id).single()

    if (!trade) {
      throw new AppError(404, "Trade not found")
    }

    // Check if user is the trade owner or has interacted with this trade
    const { data: userInteraction } = await supabase
      .from("trade_interactions")
      .select("id")
      .eq("trade_id", params.id)
      .eq("initiator_id", user.id)
      .limit(1)

    const isAuthorized = trade.discord_id === user.id || userInteraction

    if (!isAuthorized) {
      throw new AppError(403, "Forbidden - You don't have access to these interactions")
    }

    const { data, error } = await supabase
      .from("trade_interactions")
      .select("*")
      .eq("trade_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(400, error.message)
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return handleApiError(error)
  }
}
