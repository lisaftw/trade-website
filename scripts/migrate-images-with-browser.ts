import { config } from "dotenv"
import { resolve } from "path"
import { getPool } from "@/lib/db/postgres"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import puppeteer from "puppeteer"

config({ path: resolve(process.cwd(), ".env.local") })

async function downloadImageWithBrowser(url: string): Promise<Buffer> {
  const cleanUrl = url.replace(/&$/, "").trim()
  console.log(` Downloading image from: ${cleanUrl}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    )

    const response = await page.goto(cleanUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    })

    if (!response || response.status() !== 200) {
      throw new Error(`Failed to load image: ${response?.status()} ${response?.statusText()}`)
    }

    const buffer = await response.buffer()
    console.log(` Downloaded ${buffer.length} bytes`)

    return buffer
  } finally {
    await browser.close()
  }
}

function getImageExtension(url: string): string {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/i)
  return match ? match[1].toLowerCase() : "png"
}

async function migrateImages() {
  console.log(" Starting image migration with browser...")

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

      const imageBuffer = await downloadImageWithBrowser(item.image_url)

      const extension = getImageExtension(item.image_url)
      const filename = `${item.game.toLowerCase()}-${item.id}.${extension}`
      const filepath = join(imagesDir, filename)

      await writeFile(filepath, imageBuffer)
      console.log(` Saved image: ${filename} (${imageBuffer.length} bytes)`)

      const localPath = `/images/items/${filename}`
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, item.id])
      console.log(` Updated database: ${localPath}`)

      successCount++

      await new Promise((resolve) => setTimeout(resolve, 500))
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
