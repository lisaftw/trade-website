import { cookies } from "next/headers"
import {
  createSession as createSessionDb,
  getSessionById,
  updateSessionActivity,
  updateSessionTokens,
  deleteSession,
} from "@/lib/db/queries/sessions"
import { getProfile } from "@/lib/db/queries/profiles"

const SESSION_COOKIE_NAME = "trade_session_id"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 

export type UserSession = {
  sessionId: string
  discordId: string
  username: string | null
  globalName: string | null
  avatarUrl: string | null
  email: string | null
}

export async function createSession(
  discordId: string,
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number,
): Promise<string> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  const sessionId = await createSessionDb({
    discordId,
    accessToken,
    refreshToken: refreshToken || null,
    tokenExpiresAt: expiresAt,
  })

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

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  try {
    
    const session = await getSessionById(sessionId)

    if (!session) {
      await destroySession()
      return null
    }

    const expiresAt = new Date(session.token_expires_at)
    if (expiresAt < new Date()) {
      await destroySession()
      return null
    }

    const profile = await getProfile(session.discord_id)

    if (!profile) {
      await destroySession()
      return null
    }

    updateSessionActivity(sessionId).catch(console.error)

    return {
      sessionId: session.id,
      discordId: profile.discord_id,
      username: profile.username,
      globalName: profile.global_name,
      avatarUrl: profile.avatar_url,
      email: profile.email,
    }
  } catch (error) {
    console.error(" Session fetch error:", error)
    await destroySession()
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    try {
      await deleteSession(sessionId)
    } catch (error) {
      console.error(" Session deletion error:", error)
    }
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export async function refreshDiscordToken(sessionId: string): Promise<boolean> {
  try {
    const session = await getSessionById(sessionId)

    if (!session?.refresh_token) {
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

    const tokenRes = await fetch("https:
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!tokenRes.ok) {
      return false
    }

    const tokenData = await tokenRes.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    await updateSessionTokens(
      sessionId,
      tokenData.access_token,
      tokenData.refresh_token || session.refresh_token,
      expiresAt,
    )

    return true
  } catch (error) {
    console.error(" Token refresh error:", error)
    return false
  }
}
