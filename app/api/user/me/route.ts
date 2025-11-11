export const dynamic = "force-dynamic"
export const revalidate = 0

import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return Response.json(
        { user: null },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, max-age=60",
          },
        },
      )
    }

    return Response.json(
      {
        user: {
          discordId: session.discordId,
          username: session.username,
          globalName: session.globalName,
          avatarUrl: session.avatarUrl,
          email: session.email,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
        },
      },
    )
  } catch (error) {
    console.error("User fetch error:", error)
    return Response.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
