import { neon } from "@neondatabase/serverless"

async function fixPlaceholderImages() {
  const sql = neon(process.env.POSTGRES_URL!)

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
}

fixPlaceholderImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
