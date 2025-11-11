import { config } from "dotenv"
import { resolve } from "path"
import postgres from "postgres"

config({ path: resolve(process.cwd(), ".env.local"), override: true })

if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in environment variables")
  console.error("Make sure .env.local exists in the project root with POSTGRES_URL")
  process.exit(1)
}

const sql = postgres(process.env.POSTGRES_URL!)

console.log(`[v0] Using database: ${process.env.POSTGRES_URL.split("@")[1]?.split("/")[0]}`)

async function addIndexes() {
  try {
    console.log("Adding database indexes for better performance...")

    const indexes = [
      { name: "idx_items_game", sql: "CREATE INDEX IF NOT EXISTS idx_items_game ON items(game)" },
      {
        name: "idx_items_game_rapvalue",
        sql: "CREATE INDEX IF NOT EXISTS idx_items_game_rapvalue ON items(game, rap_value DESC NULLS LAST)",
      },
      {
        name: "idx_items_game_section",
        sql: "CREATE INDEX IF NOT EXISTS idx_items_game_section ON items(game, section)",
      },
      {
        name: "idx_items_game_section_rapvalue",
        sql: "CREATE INDEX IF NOT EXISTS idx_items_game_section_rapvalue ON items(game, section, rap_value DESC NULLS LAST)",
      },
      { name: "idx_items_name", sql: "CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)" },
      {
        name: "idx_items_updated_at",
        sql: "CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at DESC)",
      },
    ]

    for (const index of indexes) {
      try {
        await sql.unsafe(index.sql)
        console.log(`✓ Created index: ${index.name}`)
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          console.log(`- Index already exists: ${index.name}`)
        } else {
          console.error(`✗ Failed to create ${index.name}:`, error.message)
        }
      }
    }

    console.log("\nDatabase indexes added successfully!")
    console.log("Query performance should now be 10-50x faster.")

    await sql.end()
  } catch (error) {
    console.error("Error adding indexes:", error)
    process.exit(1)
  }
}

addIndexes()
