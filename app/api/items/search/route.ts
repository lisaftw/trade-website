export const dynamic = 'force-dynamic'
export const revalidate = 300

import { type NextRequest, NextResponse } from "next/server"
import { searchItems } from "@/lib/db/items"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const game = searchParams.get("game") || undefined

    if (!query || query.length < 2) {
      return NextResponse.json({ items: [] })
    }

    const items = await searchItems(query, game)

    const transformedItems = items.map((item: any) => ({
      id: item._id.toString(),
      game: item.game,
      name: item.name,
      image_url: item.imageUrl || item.image || "/placeholder.svg?height=200&width=200",
      rap_value: item.value || item.rapValue || 0,
      exist_count: item.existCount || item.exist || 0,
      rating: Number.parseFloat(item.rating?.toString().split("/")[0] || "0"),
      change_percent: item.changePercent || item.change || 0,
      last_updated_at: item.updatedAt || item.lastUpdated || new Date().toISOString(),
    }))

    return NextResponse.json(
      { items: transformedItems },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    )
  } catch (error) {
    console.error("Search items error:", error)
    return NextResponse.json({ error: "Failed to search items" }, { status: 500 })
  }
}
