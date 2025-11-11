import { config } from "dotenv"
import { resolve } from "path"
import postgres from "postgres"

config({ path: resolve(process.cwd(), ".env.local"), override: true })

if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in environment variables")
  console.error("Make sure .env.local exists in the project root with POSTGRES_URL")
  process.exit(1)
}

console.log(`[v0] Using database: ${process.env.POSTGRES_URL.split("@")[1]?.split("/")[0]}`)

async function fixPlaceholderImages() {
  const sql = postgres(process.env.POSTGRES_URL!)

  console.log("\n=== Fixing Placeholder Image URLs ===\n")

  // Find items with placeholder URLs that are causing errors
  const placeholders = await sql`
    SELECT COUNT(*) as count
    FROM items
    WHERE image_url LIKE '/placeholder%'
  `
  console.log(`Found ${placeholders[0].count} items with placeholder URLs`)

  // Update to NULL so the image proxy can handle them properly
  const result = await sql`
    UPDATE items
    SET image_url = NULL
    WHERE image_url LIKE '/placeholder%'
    RETURNING id
  `

  console.log(`Updated ${result.length} items to NULL image_url\n`)

  await sql.end()
}

fixPlaceholderImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
