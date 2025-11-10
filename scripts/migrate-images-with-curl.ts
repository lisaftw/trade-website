import { config } from "dotenv"
import { resolve } from "path"
import { getPool } from "@/lib/db/postgres"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

async function downloadImageWithCurl(url: string): Promise<Buffer> {
  const cleanUrl = url.replace(/&$/, "").trim()
  console.log(`[v0] Downloading image from: ${cleanUrl}`)

  // Use curl with browser-like headers
  const curlCommand = `curl -L -s -f \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" \
    -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" \
    -H "Accept-Language: en-US,en;q=0.9" \
    -H "Cache-Control: no-cache" \
    -H "Pragma: no-cache" \
    --compressed \
    --max-time 30 \
    "${cleanUrl}"`

  try {
    const { stdout } = await execAsync(curlCommand, {
      encoding: "buffer",
      maxBuffer: 10 * 1024 * 1024, // 10MB max
    })

    const buffer = Buffer.from(stdout)

    if (buffer.length === 0) {
      throw new Error("Downloaded file is empty")
    }

    console.log(`[v0] Downloaded ${buffer.length} bytes`)
    return buffer
  } catch (error: any) {
    throw new Error(`Failed to download image: ${error.message}`)
  }
}

function getImageExtension(url: string): string {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/i)
  return match ? match[1].toLowerCase() : "png"
}

async function migrateImages() {
  console.log("[v0] Starting image migration with curl...")

  const pool = getPool()

  // Create images directory if it doesn't exist
  const imagesDir = join(process.cwd(), "public", "images", "items")
  if (!existsSync(imagesDir)) {
    await mkdir(imagesDir, { recursive: true })
    console.log(`[v0] Created directory: ${imagesDir}`)
  }

  // Get all items with external image URLs
  const result = await pool.query(`
    SELECT id, name, game, image_url 
    FROM items 
    WHERE image_url IS NOT NULL 
    AND (
      image_url LIKE 'https://cdn.discordapp.com/%'
      OR image_url LIKE 'https://static.wikia.nocookie.net/%'
      OR image_url LIKE 'http%'
    )
    ORDER BY game, name
  `)

  console.log(`[v0] Found ${result.rows.length} items with external image URLs`)

  let successCount = 0
  let failCount = 0

  for (const item of result.rows) {
    try {
      console.log(`\n[v0] Processing: ${item.name} (${item.game})`)

      // Download image using curl
      const imageBuffer = await downloadImageWithCurl(item.image_url)

      // Generate filename: game-itemid.ext
      const extension = getImageExtension(item.image_url)
      const filename = `${item.game.toLowerCase().replace(/\s+/g, "-")}-${item.id}.${extension}`
      const filepath = join(imagesDir, filename)

      // Save image to disk
      await writeFile(filepath, imageBuffer)
      console.log(`[v0] Saved image: ${filename} (${imageBuffer.length} bytes)`)

      // Update database with local path
      const localPath = `/images/items/${filename}`
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, item.id])
      console.log(`[v0] Updated database: ${localPath}`)

      successCount++

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`[v0] Failed to migrate image for ${item.name}:`, error)
      failCount++
    }
  }

  console.log(`\n[v0] Migration complete!`)
  console.log(`[v0] Success: ${successCount}`)
  console.log(`[v0] Failed: ${failCount}`)

  process.exit(0)
}

migrateImages().catch((error) => {
  console.error("[v0] Migration failed:", error)
  process.exit(1)
})
