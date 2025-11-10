import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { getProfile, updateProfile } from "@/lib/db/queries/profiles"
import { logActivity } from "@/lib/db/queries/activities"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
  }

  const profile = await getProfile(session.discordId)

  if (!profile) {
    return new Response(JSON.stringify({ error: "profile_fetch_failed" }), { status: 500 })
  }

  return new Response(JSON.stringify({ profile }), { status: 200 })
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

  const updatedProfile = await updateProfile(session.discordId, updates)

  if (!updatedProfile) {
    return new Response(JSON.stringify({ error: "profile_update_failed" }), { status: 500 })
  }

  // Log activity
  await logActivity(session.discordId, "update_profile", { fields: Object.keys(updates) })

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
