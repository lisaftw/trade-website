import { NextResponse } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    // Discord invite code from the URL: https://discord.gg/j44ZNCWVkW
    const inviteCode = "j44ZNCWVkW"

    console.log("[v0] Fetching Discord member count for invite:", inviteCode)

    // Fetch Discord invite data with approximate member count
    const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    console.log("[v0] Discord API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Discord API error:", errorText)
      throw new Error(`Failed to fetch Discord data: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Discord data received:", data)

    const memberCount = data.approximate_member_count || 10000
    const onlineCount = data.approximate_presence_count || 0

    return NextResponse.json({
      memberCount,
      onlineCount,
    })
  } catch (error) {
    console.error("[v0] Error fetching Discord member count:", error)
    // Return fallback data if API fails
    return NextResponse.json(
      {
        memberCount: 10000,
        onlineCount: 0,
        error: "Failed to fetch live count",
      },
      { status: 200 }, // Return 200 to prevent client errors
    )
  }
}
