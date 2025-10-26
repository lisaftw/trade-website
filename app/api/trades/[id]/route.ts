import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { tradeUpdateSchema, isValidUUID } from "@/lib/security/input-validator"
import { handleApiError, AppError } from "@/lib/security/error-handler"
import { checkRateLimit } from "@/lib/security/rate-limiter"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidUUID(params.id)) {
      throw new AppError(400, "Invalid trade ID format")
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

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

    const { error } = await supabase.from("trades").delete().eq("id", params.id).eq("discord_id", user.id)

    if (error) {
      throw new AppError(400, error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidUUID(params.id)) {
      throw new AppError(400, "Invalid trade ID format")
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

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

    const validationResult = tradeUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      throw new AppError(400, "Invalid status value")
    }

    const { status } = validationResult.data

    const { data, error } = await supabase
      .from("trades")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("discord_id", user.id)
      .select()

    if (error) {
      throw new AppError(400, error.message)
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return handleApiError(error)
  }
}
