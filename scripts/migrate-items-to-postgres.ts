import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import { MongoClient } from "mongodb"
import { query } from "@/lib/db/postgres"

async function migrateItems() {
  console.log("Starting items migration from MongoDB to PostgreSQL...")

  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables")
    }

    console.log("Connecting to MongoDB...")
    const mongoClient = new MongoClient(mongoUri)
    await mongoClient.connect()
    console.log("Connected to MongoDB successfully")

    const db = mongoClient.db("trading-db")
    const collection = db.collection("items")

    // Get all items from MongoDB
    const items = await collection.find({}).toArray()
    console.log(`Found ${items.length} items in MongoDB`)

    let successCount = 0
    let errorCount = 0

    // Insert items into PostgreSQL
    for (const item of items) {
      try {
        await query(
          `INSERT INTO items (
            name, value, game, section, image_url,
            rarity, demand, pot,
            rap_value, neon_value, mega_value, fly_bonus, ride_bonus,
            exist_count, rating, change_percent,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT DO NOTHING`,
          [
            item.name,
            item.value || item.rap_value || 0,
            item.game,
            item.section || null,
            item.image_url || item.image || item.imageUrl || null,
            item.rarity || null,
            item.demand || null,
            item.pot || null,
            item.rap_value || item.value || 0,
            item.neon_value || 0,
            item.mega_value || 0,
            item.fly_bonus || 50,
            item.ride_bonus || 50,
            item.exist_count || 0,
            item.rating || item.section || null,
            item.change_percent || 0,
            item.createdAt || new Date(),
            item.updatedAt || new Date(),
          ],
        )
        successCount++
        if (successCount % 100 === 0) {
          console.log(`Migrated ${successCount} items...`)
        }
      } catch (error) {
        console.error(`Error migrating item ${item.name}:`, error)
        errorCount++
      }
    }

    await mongoClient.close()
    console.log(`\nMigration complete!`)
    console.log(`Successfully migrated: ${successCount} items`)
    console.log(`Errors: ${errorCount} items`)

    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

migrateItems()
