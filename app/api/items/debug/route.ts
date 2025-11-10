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

    // Get sample items with full details
    const sampleItems = await itemsCollection.find({}).limit(10).toArray()
    console.log("[v0] Sample items:", sampleItems)

    const noobiniItem = await itemsCollection.findOne({ name: "Noobini Pizzanini" })
    console.log("[v0] Noobini Pizzanini item:", noobiniItem)

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
        image_url: item.image_url || item.imageUrl || item.image || "NOT FOUND",
        allFields: Object.keys(item),
        rawItem: item,
      })),
      noobiniItem: noobiniItem
        ? {
            id: noobiniItem._id.toString(),
            name: noobiniItem.name,
            image_url: noobiniItem.image_url,
            imageUrl: noobiniItem.imageUrl,
            image: noobiniItem.image,
            allFields: Object.keys(noobiniItem),
            fullData: noobiniItem,
          }
        : null,
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
