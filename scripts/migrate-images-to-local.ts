import { config } from "dotenv"
import { resolve } from "path"
import { getPool } from "@/lib/db/postgres"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import https from "https"
import http from "http"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

async function downloadImage(url: string): Promise<Buffer> {
  const cleanUrl = url.replace(/&$/, "").trim()
  console.log(`[v0] Downloading image from: ${cleanUrl}`)

  return new Promise((resolve, reject) => {
    const urlObj = new URL(cleanUrl)
    const client = urlObj.protocol === "https:" ? https : http

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    }

    console.log(`[v0] Request headers:`, JSON.stringify(options.headers, null, 2))

    const req = client.request(options, (res) => {
      console.log(`[v0] Response status: ${res.statusCode} ${res.statusMessage}`)
      console.log(`[v0] Response headers:`, JSON.stringify(res.headers, null, 2))

      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const redirectUrl = res.headers.location
        if (redirectUrl) {
          console.log(`[v0] Following redirect to: ${redirectUrl}`)
          downloadImage(redirectUrl).then(resolve).catch(reject)
          return
        }
      }

      if (res.statusCode !== 200) {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString()
          console.log(`[v0] Error response body:`, body)
          reject(new Error(`Failed to download image: ${res.statusCode} ${res.statusMessage}`))
        })
        return
      }

      const chunks: Buffer[] = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => resolve(Buffer.concat(chunks)))
      res.on("error", reject)
    })

    req.on("error", (error) => {
      console.log(`[v0] Request error:`, error)
      reject(error)
    })
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error("Request timeout"))
    })
    req.end()
  })
}

function getImageExtension(url: string): string {
  // Extract extension from URL
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/i)
  return match ? match[1].toLowerCase() : "png"
}

async function migrateImages() {
  console.log("[v0] Starting image migration...")

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

      // Download image
      const imageBuffer = await downloadImage(item.image_url)

      // Generate filename: game-itemid.ext
      const extension = getImageExtension(item.image_url)
      const filename = `${item.game.toLowerCase()}-${item.id}.${extension}`
      const filepath = join(imagesDir, filename)

      // Save image to disk
      await writeFile(filepath, imageBuffer)
      console.log(`[v0] Saved image: ${filename} (${imageBuffer.length} bytes)`)

      // Update database with local path
      const localPath = `/images/items/${filename}`
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, item.id])
      console.log(`[v0] Updated database: ${localPath}`)

      successCount++

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`[v0] Failed to migrate image for ${item.name}:`, error)
      failCount++
    }
  }

  console.log(`\n[v0] Migration complete!`)
  console.log(`[v0] Success: ${successCount}`)
  console.log(`[v0] Failed: ${failCount}`)
}

migrateImages().catch(console.error)
