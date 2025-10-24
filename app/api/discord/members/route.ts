import { NextResponse } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Cache for 5 minutes

const FALLBACK_DATA = {
  memberCount: 10000,
  onlineCount: 0,
}

export async function GET() {
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
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse Discord API response:", parseError)
      return NextResponse.json(FALLBACK_DATA, { status: 200 })
    }

    console.log("[v0] Discord data received:", {
      members: data.approximate_member_count,
      online: data.approximate_presence_count,
    })

    const memberCount = data.approximate_member_count || FALLBACK_DATA.memberCount
    const onlineCount = data.approximate_presence_count || FALLBACK_DATA.onlineCount

    return NextResponse.json(
      {
        memberCount,
        onlineCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error in Discord API route:", error)
    return NextResponse.json(FALLBACK_DATA, { status: 200 })
  }
}
