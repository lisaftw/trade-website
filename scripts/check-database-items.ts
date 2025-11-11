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

async function checkDatabase() {
  const sql = postgres(process.env.POSTGRES_URL!)

  console.log("\n=== Checking Database Items ===\n")

  // Check total counts by game
  const gameCounts = await sql`
    SELECT game, COUNT(*) as count 
    FROM items 
    GROUP BY game 
    ORDER BY game
  `
  console.log("Items per game:")
  console.table(gameCounts)

  // Check SAB sections
  const sabSections = await sql`
    SELECT section, COUNT(*) as count 
    FROM items 
    WHERE game = 'SAB'
    GROUP BY section 
    ORDER BY count DESC
  `
  console.log("\nSAB items by section:")
  console.table(sabSections)

  // Check image URLs
  const imageUrls = await sql`
    SELECT 
      game,
      COUNT(*) as total,
      COUNT(CASE WHEN image_url LIKE '/placeholder%' THEN 1 END) as placeholders,
      COUNT(CASE WHEN image_url LIKE 'http%' THEN 1 END) as remote_urls,
      COUNT(CASE WHEN image_url LIKE '/images/%' THEN 1 END) as local_images
    FROM items
    GROUP BY game
    ORDER BY game
  `
  console.log("\nImage URL types:")
  console.table(imageUrls)

  // Sample items with their image URLs
  const samples = await sql`
    SELECT id, name, game, section, image_url
    FROM items
    LIMIT 10
  `
  console.log("\nSample items (first 10):")
  console.table(samples)

  const total = await sql`SELECT COUNT(*) as total FROM items`
  console.log(`\nTotal items in database: ${total[0].total}\n`)

  await sql.end()
}

checkDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
