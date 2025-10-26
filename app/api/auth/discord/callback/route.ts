export const dynamic = "force-dynamic"
export const revalidate = 0

import { cookies } from "next/headers"
import { createServiceClient } from "@/lib/supabase/service"
import { createSession } from "@/lib/auth/session"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import { auditLog } from "@/lib/security/audit-logger"
import { sanitizeInput } from "@/lib/security/low-level-protection"

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
  try {
    const rateLimitResult = await checkRateLimit(req, "auth")
    if (!rateLimitResult.allowed) {
      await auditLog({
        eventType: "oauth_callback_rate_limited",
        severity: "warning",
        request: req,
      })
      const url = new URL(req.url)
      return Response.redirect(`${url.origin}/login?error=rate_limited`, 302)
    }

    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const error = url.searchParams.get("error")
    const cookieStore = await cookies()
    const storedState = cookieStore.get("discord_oauth_state")?.value

    if (error) {
      await auditLog({
        eventType: "oauth_error",
        severity: "warning",
        request: req,
        metadata: { error },
      })
      return Response.redirect(`${url.origin}/login?error=oauth_denied`, 302)
    }

    if (!code || !state || !storedState) {
      await auditLog({
        eventType: "oauth_missing_params",
        severity: "warning",
        request: req,
      })
      return Response.redirect(`${url.origin}/login?error=invalid_state`, 302)
    }

    // Constant-time comparison
    const crypto = await import("crypto")
    const stateMatch = crypto.timingSafeEqual(Buffer.from(state), Buffer.from(storedState))

    if (!stateMatch) {
      await auditLog({
        eventType: "oauth_state_mismatch",
        severity: "critical",
        request: req,
      })
      return Response.redirect(`${url.origin}/login?error=invalid_state`, 302)
    }

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
      await auditLog({
        eventType: "oauth_config_error",
        severity: "critical",
        request: req,
      })
      return Response.redirect(`${url.origin}/login?error=config_error`, 302)
    }

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
      await auditLog({
        eventType: "oauth_token_exchange_failed",
        severity: "error",
        request: req,
        metadata: { error: errText.substring(0, 200) },
      })
      return Response.redirect(`${url.origin}/login?error=token_exchange_failed`, 302)
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      await auditLog({
        eventType: "oauth_user_fetch_failed",
        severity: "error",
        request: req,
      })
      return Response.redirect(`${url.origin}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser

    const sanitizedUsername = discordUser.username ? sanitizeInput(discordUser.username) : null
    const sanitizedGlobalName = discordUser.global_name ? sanitizeInput(discordUser.global_name) : null

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
        username: sanitizedUsername,
        global_name: sanitizedGlobalName,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "discord_id" },
    )

    if (upsertError) {
      await auditLog({
        eventType: "oauth_database_error",
        severity: "error",
        request: req,
        userId: discordUser.id,
      })
      return Response.redirect(`${url.origin}/login?error=database_error`, 302)
    }

    await createSession(discordUser.id, tokenJson.access_token, tokenJson.refresh_token, tokenJson.expires_in)

    await auditLog({
      eventType: "user_login_success",
      severity: "info",
      request: req,
      userId: discordUser.id,
      metadata: { is_new_user: isNewUser },
    })

    await supabase.from("activities").insert({
      discord_id: discordUser.id,
      type: "login",
      meta: { via: "discord" },
    })

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    return Response.redirect(`${url.origin}${redirectPath}`, 302)
  } catch (error: any) {
    const url = new URL(req.url)
    await auditLog({
      eventType: "oauth_unexpected_error",
      severity: "critical",
      request: req,
      metadata: { error: error.message },
    })
    return Response.redirect(`${url.origin}/login?error=unexpected_error`, 302)
  }
}
