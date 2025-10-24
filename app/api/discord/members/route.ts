import { NextResponse } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    // Discord invite code from the URL: https://discord.gg/j44ZNCWVkW
    const inviteCode = "j44ZNCWVkW"

    // Fetch Discord invite data with approximate member count
    const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Discord data")
    }

    const data = await response.json()

    return NextResponse.json({
      memberCount: data.approximate_member_count || 0,
      onlineCount: data.approximate_presence_count || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching Discord member count:", error)
    // Return fallback data if API fails
    return NextResponse.json({
      memberCount: 10000,
      onlineCount: 0,
    })
  }
}
