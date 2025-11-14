import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const state = crypto.randomUUID()

  const url = new URL(req.url)
  const isSecure = true

  cookieStore.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax", // Changed from "none" to "lax" for OAuth compatibility
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  })

  const origin = process.env.NEXT_PUBLIC_BASE_URL || `${url.protocol}//${url.host}`
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`

  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) {
    return new Response("Missing DISCORD_CLIENT_ID. Add it in Project Settings > Environment Variables.", {
      status: 500,
    })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "identify email",
    redirect_uri: redirectUri,
    state,
    prompt: "consent",
  })

  console.log("[v0] Discord OAuth initiated - state:", state, "redirectUri:", redirectUri, "isSecure:", isSecure, "cookieSet: discord_oauth_state")

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  return Response.redirect(authorizeUrl, 302)
}
