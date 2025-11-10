import { cookies } from "next/headers"
import { query } from "@/lib/db/postgres"

const SESSION_COOKIE_NAME = "trade_session_id"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// This allows HTTP deployments (like IP addresses) to work properly
const USE_SECURE_COOKIES = process.env.FORCE_SECURE_COOKIES === "true"

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
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  await query("DELETE FROM sessions WHERE discord_id = $1", [discordId])

  const result = await query(
    `INSERT INTO sessions (discord_id, access_token, refresh_token, token_expires_at, last_activity_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [discordId, accessToken, refreshToken || null, expiresAt.toISOString(), new Date().toISOString()],
  )

  if (!result.rows || result.rows.length === 0) {
    throw new Error("Failed to create session")
  }

  const sessionId = result.rows[0].id

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })

  console.log("[v0] Session created with ID:", sessionId, "secure:", USE_SECURE_COOKIES)
  return sessionId
}

/**
 * Gets the current user session from cookie and database
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  console.log("[v0] getSession - Looking for cookie:", SESSION_COOKIE_NAME)
  console.log("[v0] getSession - Cookie value:", sessionId ? `${sessionId.substring(0, 8)}...` : "null")

  if (!sessionId) {
    console.log("[v0] No session cookie found")
    return null
  }

  try {
    console.log("[v0] getSession - Querying database for session:", sessionId.substring(0, 8))
    const result = await query(
      `SELECT 
        s.id,
        s.discord_id,
        s.token_expires_at,
        s.last_activity_at,
        p.username,
        p.global_name,
        p.avatar_url,
        p.email
       FROM sessions s
       LEFT JOIN profiles p ON s.discord_id = p.discord_id
       WHERE s.id = $1`,
      [sessionId],
    )

    console.log("[v0] getSession - Query returned", result.rows.length, "rows")

    if (!result.rows || result.rows.length === 0) {
      console.log("[v0] Session not found in database")
      await destroySession()
      return null
    }

    const session = result.rows[0]

    // Check if token is expired
    const expiresAt = new Date(session.token_expires_at)
    if (expiresAt < new Date()) {
      console.log("[v0] Session expired")
      await destroySession()
      return null
    }

    query("UPDATE sessions SET last_activity_at = $1 WHERE id = $2", [new Date().toISOString(), sessionId]).catch(
      (err) => console.error("[v0] Failed to update last activity:", err),
    )

    console.log("[v0] Session retrieved successfully for user:", session.discord_id)

    return {
      sessionId: session.id,
      discordId: session.discord_id,
      username: session.username,
      globalName: session.global_name,
      avatarUrl: session.avatar_url,
      email: session.email,
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
      await query("DELETE FROM sessions WHERE id = $1", [sessionId])
      console.log("[v0] Session destroyed:", sessionId)
    } catch (error) {
      console.error("[v0] Session deletion error:", error)
    }
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
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
    const result = await query("SELECT refresh_token, discord_id FROM sessions WHERE id = $1", [sessionId])

    if (!result.rows || result.rows.length === 0 || !result.rows[0].refresh_token) {
      return false
    }

    const session = result.rows[0]
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

    await query(
      `UPDATE sessions 
       SET access_token = $1, 
           refresh_token = $2, 
           token_expires_at = $3, 
           updated_at = $4
       WHERE id = $5`,
      [
        tokenData.access_token,
        tokenData.refresh_token || session.refresh_token,
        expiresAt.toISOString(),
        new Date().toISOString(),
        sessionId,
      ],
    )

    console.log("[v0] Token refreshed successfully")
    return true
  } catch (error) {
    console.error("[v0] Token refresh error:", error)
    return false
  }
}
