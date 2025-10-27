import { cookies } from "next/headers"
import { createServiceClient } from "@/lib/supabase/service"

const SESSION_COOKIE_NAME = "trade_session_id"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export type UserSession = {
  sessionId: string
  discordId: string
  username: string | null
  globalName: string | null
  avatarUrl: string | null
  email: string | null
}

/**
 * Creates a new session in the database and sets a secure cookie
 */
export async function createSession(
  discordId: string,
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number,
): Promise<string> {
  const supabase = await createServiceClient()
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Delete any existing sessions for this user to prevent session buildup
  await supabase.from("sessions").delete().eq("discord_id", discordId)

  // Create new session
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      discord_id: discordId,
      access_token: accessToken,
      refresh_token: refreshToken || null,
      token_expires_at: expiresAt.toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(`Failed to create session: ${error?.message || "unknown error"}`)
  }

  const sessionId = data.id

  // Set secure HttpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })

  return sessionId
}

/**
 * Gets the current user session from cookie and database
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  try {
    const supabase = await createServiceClient()

    // Fetch session with profile data
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(
        `
        id,
        discord_id,
        token_expires_at,
        last_activity_at
      `,
      )
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      await destroySession()
      return null
    }

    // Check if token is expired
    const expiresAt = new Date(session.token_expires_at)
    if (expiresAt < new Date()) {
      await destroySession()
      return null
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("discord_id, username, global_name, avatar_url, email")
      .eq("discord_id", session.discord_id)
      .single()

    if (profileError || !profile) {
      await destroySession()
      return null
    }

    // Update last activity timestamp (fire and forget)
    supabase.from("sessions").update({ last_activity_at: new Date().toISOString() }).eq("id", sessionId).then()

    return {
      sessionId: session.id,
      discordId: profile.discord_id,
      username: profile.username,
      globalName: profile.global_name,
      avatarUrl: profile.avatar_url,
      email: profile.email,
    }
  } catch (error) {
    console.error("[v0] Session fetch error:", error)
    await destroySession()
    return null
  }
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    try {
      const supabase = await createServiceClient()
      await supabase.from("sessions").delete().eq("id", sessionId)
    } catch (error) {
      console.error("[v0] Session deletion error:", error)
    }
  }

  // Clear cookie
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

/**
 * Refreshes a Discord access token using the refresh token
 */
export async function refreshDiscordToken(sessionId: string): Promise<boolean> {
  try {
    const supabase = await createServiceClient()

    const { data: session, error } = await supabase
      .from("sessions")
      .select("refresh_token, discord_id")
      .eq("id", sessionId)
      .single()

    if (error || !session?.refresh_token) {
      return false
    }

    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return false
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: session.refresh_token,
    })

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!tokenRes.ok) {
      return false
    }

    const tokenData = await tokenRes.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // Update session with new tokens
    await supabase
      .from("sessions")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || session.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    return true
  } catch (error) {
    console.error("[v0] Token refresh error:", error)
    return false
  }
}
