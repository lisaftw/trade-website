import clientPromise from "../lib/mongodb"

async function deleteCorruptItem() {
  try {
    console.log("[v0] Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    // Find the corrupt item
    const corruptItem = await collection.findOne({
      game: "SAB",
      name: "corrupt",
    })

    if (!corruptItem) {
      console.log("[v0] No item named 'corrupt' found in SAB game")
      return
    }

    console.log("[v0] Found corrupt item:", {
      id: corruptItem._id.toString(),
      name: corruptItem.name,
      value: corruptItem.value,
      section: corruptItem.section,
    })

    // Delete the item
    const result = await collection.deleteOne({
      _id: corruptItem._id,
    })

    if (result.deletedCount > 0) {
      console.log("[v0] ✅ Successfully deleted corrupt item")
    } else {
      console.log("[v0] ❌ Failed to delete item")
    }

    process.exit(0)
  } catch (error) {
    console.error("[v0] Error deleting corrupt item:", error)
    process.exit(1)
  }
}

deleteCorruptItem()
