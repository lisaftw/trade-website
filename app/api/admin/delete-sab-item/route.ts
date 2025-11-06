import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-client"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    console.log(` Connecting to MongoDB...`)
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    const corruptItem = await collection.findOne({
      game: "SAB",
      name: itemName,
    })

    if (!corruptItem) {
      return NextResponse.json({ error: `No item named '${itemName}' found in SAB game` }, { status: 404 })
    }

    console.log(` Found item:`, {
      id: corruptItem._id.toString(),
      name: corruptItem.name,
      value: corruptItem.value,
      section: corruptItem.section,
    })

    const result = await collection.deleteOne({
      _id: corruptItem._id,
    })

    if (result.deletedCount > 0) {
      console.log(` Successfully deleted item!`)
      return NextResponse.json({
        success: true,
        message: `Successfully deleted '${itemName}' from SAB game`,
        deletedItem: {
          id: corruptItem._id.toString(),
          name: corruptItem.name,
          value: corruptItem.value,
        },
      })
    } else {
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
  } catch (error) {
    console.error(" Error deleting item:", error)
    return NextResponse.json(
      { error: "Failed to delete item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
