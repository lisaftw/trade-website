export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching items from MongoDB...")

    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")
    const q = searchParams.get("q")?.toLowerCase() || ""

    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    const filter: any = {}
    if (game) {
      filter.game = game
    }
    if (q) {
      filter.name = { $regex: q, $options: "i" }
    }

    console.log("[v0] MongoDB query filter:", filter)

    const items = await collection.find(filter).sort({ createdAt: -1 }).toArray()

    console.log("[v0] Found items count:", items.length)
    console.log("[v0] Sample item fields:", items[0] ? Object.keys(items[0]) : "No items")

    const transformedItems = items.map((item: any) => {
      const imageUrl = item.image_url || item.image || item.imageUrl || "/placeholder.svg?height=200&width=200"

      // Determine if this is old schema (has rap_value) or new schema (has value)
      const isNewSchema = item.value !== undefined || item.section !== undefined

      console.log("[v0] Item:", item.name)
      console.log("[v0]   - MongoDB image_url:", item.image_url)
      console.log("[v0]   - MongoDB image:", item.image)
      console.log("[v0]   - MongoDB imageUrl:", item.imageUrl)
      console.log("[v0]   - Final imageUrl:", imageUrl)
      console.log("[v0]   - Schema:", isNewSchema ? "NEW" : "OLD")

      return {
        id: item._id.toString(),
        game: item.game,
        name: item.name,
        image_url: imageUrl,
        // Map value fields (new schema uses 'value', old uses 'rap_value')
        rap_value: item.value || item.rap_value || item.rapValue || item.rap || 0,
        neon_value: item.neon_value || item.neonValue || 0,
        mega_value: item.mega_value || item.megaValue || 0,
        fly_bonus: item.fly_bonus || item.flyBonus || 50,
        ride_bonus: item.ride_bonus || item.rideBonus || 50,
        // Map section/type fields
        exist_count: item.exist_count || item.existCount || item.exist || 0,
        rating: item.section || item.rating || item.rarity || 0,
        change_percent: item.change_percent || item.changePercent || item.change || 0,
        last_updated_at: item.updatedAt || item.lastUpdated || item.createdAt || new Date().toISOString(),
        // Include new schema fields for display
        section: item.section,
        rarity: item.rarity,
        demand: item.demand,
        pot: item.pot,
      }
    })

    console.log("[v0] Transformed items sample:", transformedItems[0])

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error("[v0] Error fetching items from MongoDB:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
