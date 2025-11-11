/**
 * MongoDB to PostgreSQL Migration Script
 *
 * This script migrates data from MongoDB to PostgreSQL on the VPS.
 * Run this ONCE after setting up the VPS database.
 *
 * Usage: npx tsx scripts/migrate-mongodb-to-postgres.ts
 */

import { config } from "dotenv"
import { resolve } from "path"
import { MongoClient } from "mongodb"
import postgres from "postgres"

// Load .env.local file with override
config({ path: resolve(process.cwd(), ".env.local"), override: true })

// MongoDB connection (your existing cloud MongoDB)
const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = "trading-db"

// PostgreSQL connection (your VPS)
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL!

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env.local")
  process.exit(1)
}

if (!POSTGRES_URL) {
  console.error("❌ POSTGRES_URL or DATABASE_URL is not set in .env.local")
  process.exit(1)
}

console.log(`[v0] Using database: ${POSTGRES_URL.split("@")[1]?.split("/")[0]}\n`)

interface MongoItem {
  _id: any
  name: string
  value: number
  game: string
  section: string
  image_url?: string
  rarity?: string
  demand?: string
  pot?: string
  createdAt?: Date
  updatedAt?: Date
}

interface MongoAdoptMePet {
  _id: any
  name: string
  game: string
  section: string
  baseValue: number
  neonValue: number
  megaValue: number
  flyBonus?: number
  rideBonus?: number
  image_url?: string
  rarity?: string
  demand?: string
  lastValueUpdate?: Date
  valueNotes?: string
  createdAt?: Date
  updatedAt?: Date
}

async function migrate() {
  console.log("🚀 Starting MongoDB to PostgreSQL migration...\n")

  // Connect to MongoDB
  console.log("📦 Connecting to MongoDB...")
  const mongoClient = new MongoClient(MONGODB_URI)
  await mongoClient.connect()
  const mongodb = mongoClient.db(MONGODB_DB)
  console.log("✅ Connected to MongoDB\n")

  // Connect to PostgreSQL
  console.log("🐘 Connecting to PostgreSQL...")
  const sql = postgres(POSTGRES_URL, { ssl: false })
  await sql`SELECT NOW()`
  console.log("✅ Connected to PostgreSQL\n")

  try {
    // ========================================
    // STEP 1: Migrate Items Collection
    // ========================================
    console.log("📋 Step 1: Migrating items collection...")
    const itemsCollection = mongodb.collection<MongoItem>("items")
    const items = await itemsCollection.find({}).toArray()
    console.log(`   Found ${items.length} items in MongoDB`)

    if (items.length > 0) {
      const validItems = items.filter((item) => {
        const hasValidName = item.name && typeof item.name === "string" && item.name.trim() !== ""
        const hasValidGame = item.game && typeof item.game === "string" && item.game.trim() !== ""
        return hasValidName && hasValidGame
      })

      const invalidCount = items.length - validItems.length
      if (invalidCount > 0) {
        console.log(`   ⚠️  Skipped ${invalidCount} items with missing name or game`)
      }

      const itemMap = new Map<string, MongoItem>()

      validItems.forEach((item) => {
        const key = `${item.game}:${item.name}`
        const existing = itemMap.get(key)

        // Keep the item with the most recent updatedAt, or the first one if no updatedAt
        if (
          !existing ||
          (item.updatedAt && existing.updatedAt && item.updatedAt > existing.updatedAt) ||
          (item.updatedAt && !existing.updatedAt)
        ) {
          itemMap.set(key, item)
        }
      })

      const uniqueItems = Array.from(itemMap.values())
      console.log(`   Deduplicated to ${uniqueItems.length} unique items`)

      await sql`DELETE FROM public.items`
      console.log("   Cleared existing items from PostgreSQL")

      let insertedCount = 0
      for (const item of uniqueItems) {
        try {
          await sql`
            INSERT INTO public.items (name, game, section, image_url, rap_value, created_at, updated_at)
            VALUES (
              ${item.name},
              ${item.game},
              ${item.section || null},
              ${item.image_url || null},
              ${item.value || 0},
              ${item.createdAt || new Date()},
              ${item.updatedAt || new Date()}
            )
          `
          insertedCount++
        } catch (error: any) {
          console.log(`   ⚠️  Skipped duplicate item: ${item.name} (${item.game})`)
        }
      }

      console.log(`   ✅ Migrated ${insertedCount} items to PostgreSQL\n`)
    } else {
      console.log("   ⚠️  No items found to migrate\n")
    }

    // ========================================
    // STEP 2: Migrate Adopt Me Pets Collection
    // ========================================
    console.log("📋 Step 2: Migrating adoptme_pets collection...")
    const petsCollection = mongodb.collection<MongoAdoptMePet>("adoptme_pets")
    const pets = await petsCollection.find({}).toArray()
    console.log(`   Found ${pets.length} Adopt Me pets in MongoDB`)

    if (pets.length > 0) {
      const petMap = new Map<string, MongoAdoptMePet>()

      pets.forEach((pet) => {
        const existing = petMap.get(pet.name)

        if (
          !existing ||
          (pet.updatedAt && existing.updatedAt && pet.updatedAt > existing.updatedAt) ||
          (pet.updatedAt && !existing.updatedAt)
        ) {
          petMap.set(pet.name, pet)
        }
      })

      const uniquePets = Array.from(petMap.values())
      console.log(`   Deduplicated to ${uniquePets.length} unique pets`)

      const petItems: any[] = []

      uniquePets.forEach((pet) => {
        petItems.push({
          name: pet.name,
          game: "Adopt Me",
          image_url: pet.image_url || "",
          rap_value: pet.baseValue || 0,
          section: pet.section || "Unknown",
          variant: "base",
          created_at: pet.createdAt || new Date(),
          updated_at: pet.updatedAt || new Date(),
        })

        petItems.push({
          name: `Neon ${pet.name}`,
          game: "Adopt Me",
          image_url: pet.image_url || "",
          rap_value: pet.neonValue || 0,
          section: pet.section || "Unknown",
          variant: "neon",
          created_at: pet.createdAt || new Date(),
          updated_at: pet.updatedAt || new Date(),
        })

        petItems.push({
          name: `Mega ${pet.name}`,
          game: "Adopt Me",
          image_url: pet.image_url || "",
          rap_value: pet.megaValue || 0,
          section: pet.section || "Unknown",
          variant: "mega",
          created_at: pet.createdAt || new Date(),
          updated_at: pet.updatedAt || new Date(),
        })
      })

      let insertedPets = 0
      for (const petItem of petItems) {
        try {
          await sql`
            INSERT INTO public.items (name, game, section, image_url, rap_value, created_at, updated_at)
            VALUES (
              ${petItem.name},
              ${petItem.game},
              ${petItem.section},
              ${petItem.image_url},
              ${petItem.rap_value},
              ${petItem.created_at},
              ${petItem.updated_at}
            )
          `
          insertedPets++
        } catch (error: any) {
          console.log(`   ⚠️  Skipped duplicate pet: ${petItem.name}`)
        }
      }

      console.log(`   ✅ Migrated ${insertedPets} Adopt Me pet variants to PostgreSQL\n`)
    } else {
      console.log("   ⚠️  No Adopt Me pets found to migrate\n")
    }

    // ========================================
    // STEP 3: Summary
    // ========================================
    console.log("📊 Migration Summary:")
    const itemCount = await sql`SELECT COUNT(*) FROM public.items`
    console.log(`   Total items in PostgreSQL: ${itemCount[0].count}`)

    console.log("\n✅ Migration completed successfully!")
    console.log("\n💡 Next steps:")
    console.log("   1. Verify data in PostgreSQL")
    console.log("   2. Update your app to use PostgreSQL instead of MongoDB")
    console.log("   3. Keep MongoDB as backup until you confirm everything works")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await mongoClient.close()
    await sql.end()
  }
}

// Run migration
migrate().catch(console.error)
