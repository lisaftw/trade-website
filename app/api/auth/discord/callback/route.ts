export const dynamic = "force-dynamic"
export const revalidate = 0

import { cookies } from "next/headers"
import { createServiceClient } from "@/lib/supabase/service"
import { createSession } from "@/lib/auth/session"

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

  if (error) {
    console.error("[v0] Discord OAuth error:", error)
    return Response.redirect(`${url.origin}/login?error=oauth_denied`, 302)
  }

  if (!code || !state || !storedState || state !== storedState) {
    console.error("[v0] Invalid OAuth state")
    return Response.redirect(`${url.origin}/login?error=invalid_state`, 302)
  }

  // Clear state cookie
  cookieStore.set("discord_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  const origin = `${url.protocol}//${url.host}`
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("[v0] Missing Discord credentials")
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
      console.error("[v0] Token exchange failed:", errText)
      return Response.redirect(`${url.origin}/login?error=token_exchange_failed`, 302)
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error("[v0] Failed to fetch Discord user:", errText)
      return Response.redirect(`${url.origin}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null

    const supabase = await createServiceClient()

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("discord_id")
      .eq("discord_id", discordUser.id)
      .single()

    const isNewUser = !existingProfile

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        discord_id: discordUser.id,
        username: discordUser.username ?? null,
        global_name: discordUser.global_name ?? null,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "discord_id" },
    )

    if (upsertError) {
      console.error("[v0] Failed to upsert user:", upsertError)
      return Response.redirect(`${url.origin}/login?error=database_error`, 302)
    }

    await createSession(discordUser.id, tokenJson.access_token, tokenJson.refresh_token, tokenJson.expires_in)

    // Log login activity
    await supabase.from("activities").insert({
      discord_id: discordUser.id,
      type: "login",
      meta: { via: "discord" },
    })

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    return Response.redirect(`${url.origin}${redirectPath}`, 302)
  } catch (error: any) {
    console.error("[v0] OAuth callback error:", error)
    return Response.redirect(`${url.origin}/login?error=unexpected_error`, 302)
  }
}
