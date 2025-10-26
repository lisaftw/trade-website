export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { sanitizeMongoQuery, searchQuerySchema } from "@/lib/security/input-validator"
import { handleApiError } from "@/lib/security/error-handler"
import { checkRateLimit } from "@/lib/security/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, "read")
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)

    const validationResult = searchQuerySchema.safeParse({
      game: searchParams.get("game"),
      q: searchParams.get("q"),
    })

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
    }

    const { game, q } = validationResult.data
    const sanitizedQuery = q ? sanitizeMongoQuery(q.toLowerCase()) : ""

    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    const filter: any = {}
    if (game) {
      filter.game = game
    }
    if (sanitizedQuery) {
      filter.name = { $regex: sanitizedQuery, $options: "i" }
    }

    const items = await collection.find(filter).limit(100).sort({ createdAt: -1 }).toArray()

    const transformedItems = items.map((item: any) => {
      const imageUrl = item.image_url || item.image || item.imageUrl || "/placeholder.svg?height=200&width=200"
      const isNewSchema = item.value !== undefined || item.section !== undefined

      return {
        id: item._id.toString(),
        game: item.game,
        name: item.name,
        image_url: imageUrl,
        rap_value: item.value || item.rap_value || item.rapValue || item.rap || 0,
        neon_value: item.neon_value || item.neonValue || 0,
        mega_value: item.mega_value || item.megaValue || 0,
        fly_bonus: item.fly_bonus || item.flyBonus || 50,
        ride_bonus: item.ride_bonus || item.rideBonus || 50,
        exist_count: item.exist_count || item.existCount || item.exist || 0,
        rating: item.section || item.rating || item.rarity || 0,
        change_percent: item.change_percent || item.changePercent || item.change || 0,
        last_updated_at: item.updatedAt || item.lastUpdated || item.createdAt || new Date().toISOString(),
        section: item.section,
        rarity: item.rarity,
        demand: item.demand,
        pot: item.pot,
      }
    })

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    return handleApiError(error)
  }
}
