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

    const transformedItems = items.map((item: any) => ({
      id: item._id.toString(),
      game: item.game,
      name: item.name,
      image_url: item.image_url || item.image || item.imageUrl || "/placeholder.svg?height=200&width=200",
      rap_value: item.value || item.rap_value || item.rapValue || item.rap || 0,
      exist_count: item.exist_count || item.existCount || item.exist || 0,
      rating: item.rating || 0,
      change_percent: item.change_percent || item.changePercent || item.change || 0,
      last_updated_at: item.updatedAt || item.lastUpdated || item.createdAt || new Date().toISOString(),
      // Game-specific fields
      section: item.section,
      rarity: item.rarity,
      demand: item.demand,
      pot: item.pot,
    }))

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error("[v0] Error fetching items from MongoDB:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
