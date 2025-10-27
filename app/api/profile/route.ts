import type { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getSession } from "@/lib/auth/session"

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
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
  }
  const body = await req.json()
  // Minimal validation
  const updates: Record<string, any> = {}
  if (typeof body.bio === "string") updates.bio = body.bio.slice(0, 512)
  if (["light", "dark", "system"].includes(body.theme_preference)) updates.theme_preference = body.theme_preference
  if (typeof body.is_public === "boolean") updates.is_public = body.is_public
  if (typeof body.show_email === "boolean") updates.show_email = body.show_email
  if (typeof body.show_activity === "boolean") updates.show_activity = body.show_activity
  updates.updated_at = new Date().toISOString()

  const supabase = await createServiceClient()
  const { error } = await supabase.from("profiles").update(updates).eq("discord_id", session.discordId)
  if (error) {
    return new Response(JSON.stringify({ error: "profile_update_failed" }), { status: 500 })
  }

  // Log activity
  await supabase.from("activities").insert({
    discord_id: session.discordId,
    type: "update_profile",
    meta: { fields: Object.keys(updates) },
  })

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
