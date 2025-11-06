import { config } from "dotenv"
import { resolve } from "path"
import { getPool } from "@/lib/db/postgres"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

config({ path: resolve(process.cwd(), ".env.local") })

async function downloadImageWithCurl(url: string): Promise<Buffer> {
  const cleanUrl = url.replace(/&$/, "").trim()
  console.log(` Downloading image from: ${cleanUrl}`)

  const curlCommand = `curl -L -s -f \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" \
    -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image*;q=0.8" \
    -H "Accept-Language: en-US,en;q=0.9" \
    -H "Cache-Control: no-cache" \
    -H "Pragma: no-cache" \
    --compressed \
    --max-time 30 \
    "${cleanUrl}"`

  try {
    const { stdout } = await execAsync(curlCommand, {
      encoding: "buffer",
      maxBuffer: 10 * 1024 * 1024, 
    })

    const buffer = Buffer.from(stdout)

    if (buffer.length === 0) {
      throw new Error("Downloaded file is empty")
    }

    console.log(` Downloaded ${buffer.length} bytes`)
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
  console.log(" Starting image migration with curl...")

  const pool = getPool()

  const imagesDir = join(process.cwd(), "public", "images", "items")
  if (!existsSync(imagesDir)) {
    await mkdir(imagesDir, { recursive: true })
    console.log(` Created directory: ${imagesDir}`)
  }

  const result = await pool.query(`
    SELECT id, name, game, image_url 
    FROM items 
    WHERE image_url IS NOT NULL 
    AND (
      image_url LIKE 'https:
      OR image_url LIKE 'https:
      OR image_url LIKE 'http%'
    )
    ORDER BY game, name
  `)

  console.log(` Found ${result.rows.length} items with external image URLs`)

  let successCount = 0
  let failCount = 0

  for (const item of result.rows) {
    try {
      console.log(`\n Processing: ${item.name} (${item.game})`)

      const imageBuffer = await downloadImageWithCurl(item.image_url)

      const extension = getImageExtension(item.image_url)
      const filename = `${item.game.toLowerCase().replace(/\s+/g, "-")}-${item.id}.${extension}`
      const filepath = join(imagesDir, filename)

      await writeFile(filepath, imageBuffer)
      console.log(` Saved image: ${filename} (${imageBuffer.length} bytes)`)

      const localPath = `/images/items/${filename}`
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, item.id])
      console.log(` Updated database: ${localPath}`)

      successCount++

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(` Failed to migrate image for ${item.name}:`, error)
      failCount++
    }
  }

  console.log(`\n Migration complete!`)
  console.log(` Success: ${successCount}`)
  console.log(` Failed: ${failCount}`)

  process.exit(0)
}

migrateImages().catch((error) => {
  console.error(" Migration failed:", error)
  process.exit(1)
})
