/**
 * Prepare PostgreSQL database for migration
 * This script adds the necessary constraints and indexes
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") })

import { Pool } from "pg"

const POSTGRES_URL = process.env.DATABASE_URL!

if (!POSTGRES_URL) {
  console.error("❌ DATABASE_URL is not set in .env.local")
  process.exit(1)
}

async function prepare() {
  console.log("🔧 Preparing PostgreSQL database for migration...\n")

  const pool = new Pool({ connectionString: POSTGRES_URL })

  try {
    // Add unique constraint to items table
    console.log("📋 Adding unique constraint to items table...")
    await pool.query(`
      -- Drop existing constraint if it exists
      ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_name_game_unique;

      -- Add unique constraint on name + game combination
      ALTER TABLE public.items ADD CONSTRAINT items_name_game_unique UNIQUE (name, game);

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_items_name_game ON public.items(name, game);
    `)
    console.log("✅ Database prepared successfully!\n")
  } catch (error) {
    console.error("❌ Failed to prepare database:", error)
    throw error
  } finally {
    await pool.end()
  }
}

prepare().catch(console.error)
