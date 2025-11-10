export const dynamic = "force-dynamic"
export const revalidate = 0

import { cookies } from "next/headers"
import { upsertProfile } from "@/lib/db/queries/profiles"
import { createSession as createDbSession } from "@/lib/db/queries/sessions"
import { query } from "@/lib/db/postgres"

type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
}

type DiscordUser = {
  id: string
  username?: string
  global_name?: string
  avatar?: string | null
  email?: string | null
}

const USE_SECURE_COOKIES = process.env.FORCE_SECURE_COOKIES === "true"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("discord_oauth_state")?.value

  console.log("[v0] OAuth callback - code:", !!code, "state:", !!state, "storedState:", !!storedState)

  if (error) {
    console.error("Discord OAuth error:", error)
    return Response.redirect(`${url.origin}/login?error=oauth_denied`, 302)
  }

  if (!code || !state || !storedState || state !== storedState) {
    console.error(
      "Invalid OAuth state - code:",
      !!code,
      "state:",
      !!state,
      "storedState:",
      !!storedState,
      "match:",
      state === storedState,
    )
    return Response.redirect(`${url.origin}/login?error=invalid_state`, 302)
  }

  cookieStore.set("discord_oauth_state", "", {
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  const origin = `${url.protocol}//${url.host}`
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("Missing Discord credentials - clientId:", !!clientId, "clientSecret:", !!clientSecret)
    return Response.redirect(`${url.origin}/login?error=config_error`, 302)
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    })

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("Token exchange failed - status:", tokenRes.status, "response:", errText)
      return Response.redirect(`${url.origin}/login?error=token_exchange_failed`, 302)
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error("Failed to fetch Discord user - status:", userRes.status, "response:", errText)
      return Response.redirect(`${url.origin}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null

    console.log("Checking for existing profile for discord_id:", discordUser.id)
    const existingProfileResult = await query<{ discord_id: string }>(
      "SELECT discord_id FROM profiles WHERE discord_id = $1",
      [discordUser.id],
    )
    const isNewUser = existingProfileResult.rows.length === 0
    console.log("User status - isNewUser:", isNewUser)

    console.log("Upserting profile...")
    try {
      await upsertProfile({
        discord_id: discordUser.id,
        username: discordUser.username ?? null,
        global_name: discordUser.global_name ?? null,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
      })
      console.log("Profile upserted successfully")
    } catch (error: any) {
      console.error("Failed to upsert user - error:", error.message, "details:", error)
      return Response.redirect(`${url.origin}/login?error=database_error`, 302)
    }

    console.log("Creating session...")
    const expiresAt = new Date(Date.now() + tokenJson.expires_in * 1000)
    const sessionId = await createDbSession({
      discordId: discordUser.id,
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token || null,
      tokenExpiresAt: expiresAt,
    })
    console.log("Session created successfully with ID:", sessionId)

    cookieStore.set("trade_session_id", sessionId, {
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    console.log("Logging activity...")
    try {
      await query("INSERT INTO activities (discord_id, type, meta) VALUES ($1, $2, $3)", [
        discordUser.id,
        "login",
        JSON.stringify({ via: "discord" }),
      ])
      console.log("Activity logged successfully")
    } catch (error) {
      console.error("Failed to log activity:", error)
      // Non-critical, continue anyway
    }

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    console.log("Login successful, redirecting to:", redirectPath)
    return Response.redirect(`${url.origin}${redirectPath}`, 302)
  } catch (error: any) {
    console.error("OAuth callback error - message:", error.message, "stack:", error.stack, "full error:", error)
    return Response.redirect(`${url.origin}/login?error=unexpected_error`, 302)
  }
}
