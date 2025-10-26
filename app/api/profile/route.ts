import type { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getSession } from "@/lib/auth/session"
import { profileUpdateSchema, sanitizeHtml } from "@/lib/security/input-validator"
import { handleApiError } from "@/lib/security/error-handler"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import { requireCSRF } from "@/lib/security/csrf"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "discord_id, username, global_name, avatar_url, email, bio, theme_preference, is_public, show_email, show_activity, last_login_at, updated_at",
    )
    .eq("discord_id", session.discordId)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: "profile_fetch_failed" }), { status: 500 })
  }
  return new Response(JSON.stringify({ profile: data }), { status: 200 })
}

export async function PATCH(req: NextRequest) {
  try {
    const csrfValid = await requireCSRF(req)
    if (!csrfValid) {
      return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403 })
    }

    const session = await getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(req, "write", session.discordId)
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 })
    }

    const body = await req.json()

    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid input", details: validationResult.error }), { status: 400 })
    }

    const updates: Record<string, any> = {}
    const validated = validationResult.data

    if (validated.bio) updates.bio = sanitizeHtml(validated.bio)
    if (validated.theme_preference) updates.theme_preference = validated.theme_preference
    if (validated.is_public !== undefined) updates.is_public = validated.is_public
    if (validated.show_email !== undefined) updates.show_email = validated.show_email
    if (validated.show_activity !== undefined) updates.show_activity = validated.show_activity
    updates.updated_at = new Date().toISOString()

    const supabase = await createServiceClient()
    const { error } = await supabase.from("profiles").update(updates).eq("discord_id", session.discordId)
    if (error) {
      return new Response(JSON.stringify({ error: "profile_update_failed" }), { status: 500 })
    }

    await supabase.from("activities").insert({
      discord_id: session.discordId,
      type: "update_profile",
      meta: { fields: Object.keys(updates) },
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
