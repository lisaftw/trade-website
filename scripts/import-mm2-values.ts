import "dotenv/config"
import clientPromise from "../lib/mongodb"
import type { Item } from "../lib/db/items"
import fs from "fs"
import path from "path"

interface MM2ItemData {
  chroma: boolean
  display_name: string
  item_type: "Gun" | "Knife" | "Pet"
  value: number
  thumbnail: string
  rarity: string
}

type MM2ValuesJSON = Record<string, MM2ItemData>

function getThumbnailUrl(assetId: string): string {
  return `/api/item-image/${assetId}?size=150`
}

function calculateDemand(value: number, rarity: string): string {
  if (rarity === "Godly" || value >= 1000) return "High"
  if (rarity === "Legendary" || value >= 100) return "Medium"
  if (value >= 10) return "Low"
  return "Very Low"
}

async function importMM2Values() {
  try {
    console.log("[v0] Starting MM2 values import...")

    const jsonPath = path.join(process.cwd(), "data", "mm2-values.json")
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as MM2ValuesJSON

    console.log(`[v0] Found ${Object.keys(jsonData).length} items in JSON file`)

    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<Item>("items")

    const deleteResult = await collection.deleteMany({ game: "MM2" })
    console.log(`[v0] Deleted ${deleteResult.deletedCount} existing MM2 items`)

    const items: Omit<Item, "_id">[] = []

    for (const [key, data] of Object.entries(jsonData)) {
      const itemName = data.chroma ? `Chroma ${data.display_name}` : data.display_name

      items.push({
        name: itemName,
        value: data.value,
        game: "MM2",
        section: data.item_type, // Gun, Knife, or Pet
        image_url: getThumbnailUrl(data.thumbnail),
        rarity: data.rarity,
        demand: calculateDemand(data.value, data.rarity),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const result = await collection.insertMany(batch)
      insertedCount += result.insertedCount
      console.log(`[v0] Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.insertedCount} items`)
    }

    console.log(`[v0] ✅ Successfully imported ${insertedCount} MM2 items!`)

    const stats = {
      total: insertedCount,
      guns: items.filter((i) => i.section === "Gun").length,
      knives: items.filter((i) => i.section === "Knife").length,
      pets: items.filter((i) => i.section === "Pet").length,
      godly: items.filter((i) => i.rarity === "Godly").length,
      chroma: items.filter((i) => i.name?.startsWith("Chroma")).length,
    }

    console.log("\n📊 Import Statistics:")
    console.log(`   Total Items: ${stats.total}`)
    console.log(`   Guns: ${stats.guns}`)
    console.log(`   Knives: ${stats.knives}`)
    console.log(`   Pets: ${stats.pets}`)
    console.log(`   Godly Rarity: ${stats.godly}`)
    console.log(`   Chroma Items: ${stats.chroma}`)

    process.exit(0)
  } catch (error) {
    console.error("[v0] Error importing MM2 values:", error)
    process.exit(1)
  }
}

// Run the import
importMM2Values()
