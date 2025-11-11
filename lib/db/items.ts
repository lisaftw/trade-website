import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface Item {
  _id?: ObjectId
  name: string
  value: number
  game: string
  section: string
  image_url?: string

  // MM2, SAB, GAG specific fields
  rarity?: string
  demand?: string

  // Adopt Me specific fields
  pot?: string

  createdAt?: Date
  updatedAt?: Date
}

export async function getItems(game?: string): Promise<Item[]> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")

    const query = game ? { game } : {}
    const items = await collection.find(query).sort({ value: -1 }).toArray()

    return items.map((item) => ({
      ...item,
      _id: item._id,
    }))
  } catch (error) {
    console.error("[v0] Error fetching items:", error)
    return []
  }
}

export async function searchItems(query: string, game?: string): Promise<Item[]> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")

    const searchQuery: any = {
      name: { $regex: query, $options: "i" },
    }

    if (game) {
      searchQuery.game = game
    }

    const items = await collection.find(searchQuery).limit(20).sort({ value: -1 }).toArray()

    return items.map((item) => ({
      ...item,
      _id: item._id,
    }))
  } catch (error) {
    console.error("[v0] Error searching items:", error)
    return []
  }
}

export async function createItem(item: Omit<Item, "_id" | "createdAt" | "updatedAt">): Promise<Item | null> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")

    const newItem = {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newItem)

    return {
      ...newItem,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("[v0] Error creating item:", error)
    return null
  }
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")
    const { ObjectId } = await import("mongodb")

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("[v0] Error updating item:", error)
    return false
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")
    const { ObjectId } = await import("mongodb")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount > 0
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return false
  }
}
