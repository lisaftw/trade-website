import { NextResponse } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  const fallbackData = {
    memberCount: 10000,
    onlineCount: 0,
  }

  try {
    const inviteCode = "j44ZNCWVkW"

    console.log("[v0] Fetching Discord member count for invite:", inviteCode)

    const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("[v0] Discord API response status:", response.status)

    if (!response.ok) {
      console.error("[v0] Discord API returned non-OK status:", response.status)
      return NextResponse.json(fallbackData, { status: 200 })
    }

    const data = await response.json()
    console.log("[v0] Discord data received:", {
      members: data.approximate_member_count,
      online: data.approximate_presence_count,
    })

    const memberCount = data.approximate_member_count || fallbackData.memberCount
    const onlineCount = data.approximate_presence_count || fallbackData.onlineCount

    return NextResponse.json(
      {
        memberCount,
        onlineCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error in Discord API route:", error)
    return NextResponse.json(fallbackData, { status: 200 })
  }
}
