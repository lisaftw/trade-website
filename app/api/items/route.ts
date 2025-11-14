export const dynamic = 'force-dynamic'
export const revalidate = 3600

import { type NextRequest, NextResponse } from "next/server"
import { getItems, searchItems } from "@/lib/db/queries/items"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game") || undefined
    const q = searchParams.get("q")?.toLowerCase() || ""
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const items = q ? await searchItems(q, game) : await getItems(game)

    const paginatedItems = items.slice(offset, offset + limit)
    const totalCount = items.length

    const transformedItems = paginatedItems.map((item: any) => {
      const imageUrl = item.image_url || "/placeholder.svg?height=200&width=200"

      const isEgg = !item.value_f && !item.value_r && !item.value_fr && !item.value_n
      if (isEgg && item.game === 'adoptme') {
        console.log(`[v0] API Egg: ${item.name}, rap_value from DB:`, item.rap_value, typeof item.rap_value)
      }

      return {
        id: item.id,
        game: item.game,
        name: item.name,
        image_url: imageUrl,
        rap_value: item.rap_value ?? null,
        neon_value: item.neon_value || 0,
        mega_value: item.mega_value || 0,
        fly_bonus: item.fly_bonus || 50,
        ride_bonus: item.ride_bonus || 50,
        exist_count: item.exist_count || 0,
        rating: item.section || item.rating || item.rarity || 0,
        change_percent: item.change_percent || 0,
        last_updated_at: item.updated_at || item.created_at || new Date().toISOString(),
        section: item.section,
        rarity: item.rarity,
        demand: item.demand,
        pot: item.pot,
        value_f: item.value_f ?? null,
        value_r: item.value_r ?? null,
        value_n: item.value_n ?? null,
        value_fr: item.value_fr ?? null,
        value_h: item.value_h ?? null,
        value_nfr: item.value_nfr ?? null,
        value_np: item.value_np ?? null,
        value_nr: item.value_nr ?? null,
        value_mfr: item.value_mfr ?? null,
        value_mf: item.value_mf ?? null,
        value_mr: item.value_mr ?? null,
        value_m: item.value_m ?? null,
      }
    })

    return NextResponse.json(
      {
        items: transformedItems,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
