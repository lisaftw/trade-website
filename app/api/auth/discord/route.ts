import { cookies } from "next/headers"

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const state = crypto.randomUUID()

  // Set a short-lived state cookie for CSRF protection
  cookieStore.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  })

  const url = new URL(req.url)
  const origin = `${url.protocol}//${url.host}`
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

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  return Response.redirect(authorizeUrl, 302)
}
