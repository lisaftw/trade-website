export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[v0] Testing MongoDB connection...")
    console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)

    const client = await clientPromise
    const db = client.db("trading-db")

    // List all collections
    const collections = await db.listCollections().toArray()
    console.log(
      "[v0] Available collections:",
      collections.map((c) => c.name),
    )

    // Try to fetch from items collection
    const itemsCollection = db.collection("items")
    const itemCount = await itemsCollection.countDocuments()
    console.log("[v0] Items count:", itemCount)

    // Get sample items
    const sampleItems = await itemsCollection.find({}).limit(5).toArray()
    console.log("[v0] Sample items:", sampleItems)

    return NextResponse.json({
      success: true,
      mongodbUriExists: !!process.env.MONGODB_URI,
      database: "trading-db",
      collections: collections.map((c) => c.name),
      itemsCount: itemCount,
      sampleItems: sampleItems.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        game: item.game,
        fields: Object.keys(item),
      })),
    })
  } catch (error: any) {
    console.error("[v0] MongoDB debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        mongodbUriExists: !!process.env.MONGODB_URI,
      },
      { status: 500 },
    )
  }
}
