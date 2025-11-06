import clientPromise from "../lib/mongodb"

async function deleteCorruptItem() {
  try {
    console.log(" Connecting to MongoDB...")
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    const corruptItem = await collection.findOne({
      game: "SAB",
      name: "corrupt",
    })

    if (!corruptItem) {
      console.log(" No item named 'corrupt' found in SAB game")
      return
    }

    console.log(" Found corrupt item:", {
      id: corruptItem._id.toString(),
      name: corruptItem.name,
      value: corruptItem.value,
      section: corruptItem.section,
    })

    const result = await collection.deleteOne({
      _id: corruptItem._id,
    })

    if (result.deletedCount > 0) {
      console.log(" ✅ Successfully deleted corrupt item")
    } else {
      console.log(" ❌ Failed to delete item")
    }

    process.exit(0)
  } catch (error) {
    console.error(" Error deleting corrupt item:", error)
    process.exit(1)
  }
}

deleteCorruptItem()
