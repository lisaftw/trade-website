import { config } from "dotenv"
import { resolve } from "path"
import postgres from "postgres"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local"), override: true })

if (!process.env.POSTGRES_URL) {
  console.error("❌ POSTGRES_URL environment variable not found in .env.local")
  process.exit(1)
}

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "prefer",
})

async function addSectionColumn() {
  try {
    console.log("[v0] Using database:", new URL(process.env.POSTGRES_URL!).host)
    console.log("\n=== Adding section column to items table ===\n")

    // Add section column
    await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS section TEXT`
    console.log("✓ Added section column to items table")

    // Create indexes for section-based queries
    await sql`CREATE INDEX IF NOT EXISTS idx_items_game_section ON items(game, section)`
    console.log("✓ Created index: idx_items_game_section")

    await sql`CREATE INDEX IF NOT EXISTS idx_items_game_section_rapvalue ON items(game, section, rap_value DESC)`
    console.log("✓ Created index: idx_items_game_section_rapvalue")

    console.log("\n✅ Section column and indexes added successfully!")
    console.log("Now you can run: npm run db:migrate")

    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error adding section column:", error)
    await sql.end()
    process.exit(1)
  }
}

addSectionColumn()
