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

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("discord_oauth_state")?.value

  const USE_SECURE_COOKIES = true
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${url.protocol}//${url.host}`

  console.log("[v0] Callback received - code:", !!code, "state:", state, "storedState:", storedState, "match:", state === storedState)

  if (error) {
    return Response.redirect(`${baseUrl}/login?error=oauth_denied`, 302)
  }

  if (!code || !state || !storedState || state !== storedState) {
    console.log("[v0] State validation failed - code:", !!code, "state:", !!state, "storedState:", !!storedState, "match:", state === storedState)
    return Response.redirect(`${baseUrl}/login?error=invalid_state`, 302)
  }

  cookieStore.delete("discord_oauth_state")

  const origin = process.env.NEXT_PUBLIC_BASE_URL || `${url.protocol}//${url.host}`
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return Response.redirect(`${baseUrl}/login?error=config_error`, 302)
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
      console.error("Discord OAuth token exchange failed:", tokenRes.status, errText)
      return Response.redirect(`${baseUrl}/login?error=token_exchange_failed`, 302)
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error("Failed to fetch Discord user:", userRes.status, errText)
      return Response.redirect(`${baseUrl}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null

    const existingProfileResult = await query<{ discord_id: string }>(
      "SELECT discord_id FROM profiles WHERE discord_id = $1",
      [discordUser.id],
    )
    const isNewUser = existingProfileResult.rows.length === 0

    try {
      await upsertProfile({
        discord_id: discordUser.id,
        username: discordUser.username ?? null,
        global_name: discordUser.global_name ?? null,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
      })
    } catch (error: any) {
      console.error("Failed to upsert user profile:", error.message)
      return Response.redirect(`${baseUrl}/login?error=database_error`, 302)
    }

    const expiresAt = new Date(Date.now() + tokenJson.expires_in * 1000)
    const sessionId = await createDbSession({
      discordId: discordUser.id,
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token || null,
      tokenExpiresAt: expiresAt,
    })

    cookieStore.set("trade_session_id", sessionId, {
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    try {
      await query("INSERT INTO activities (discord_id, type, meta) VALUES ($1, $2, $3)", [
        discordUser.id,
        "login",
        JSON.stringify({ via: "discord" }),
      ])
    } catch (error) {
      console.error("Failed to log activity:", error)
    }

    console.log("[v0] Login successful for user:", discordUser.id, "isNewUser:", isNewUser)

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    return Response.redirect(`${baseUrl}${redirectPath}`, 302)
  } catch (error: any) {
    console.error("OAuth callback error:", error.message)
    return Response.redirect(`${baseUrl}/login?error=unexpected_error`, 302)
  }
}
