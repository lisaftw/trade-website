import postgres from "postgres"
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env.local"), override: true })

async function checkImageUrls() {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL not found in environment")
    process.exit(1)
  }

  const sql = postgres(process.env.POSTGRES_URL)

  try {
    console.log("Checking image URLs in database...\n")

    const itemsWithImages = await sql`
      SELECT id, name, game, image_url 
      FROM items 
      WHERE image_url IS NOT NULL AND image_url != '' 
      LIMIT 10
    `

    console.log("Items with image URLs:")
    console.table(itemsWithImages)

    const totalWithImages = await sql`
      SELECT COUNT(*) as count 
      FROM items 
      WHERE image_url IS NOT NULL AND image_url != ''
    `

    const totalWithoutImages = await sql`
      SELECT COUNT(*) as count 
      FROM items 
      WHERE image_url IS NULL OR image_url = ''
    `

    console.log(`\nTotal items with images: ${totalWithImages[0].count}`)
    console.log(`Total items without images: ${totalWithoutImages[0].count}`)

    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error("Error checking image URLs:", error)
    await sql.end()
    process.exit(1)
  }
}

checkImageUrls()
