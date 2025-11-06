import { config } from "dotenv"
import { resolve } from "path"
import { getPool } from "@/lib/db/postgres"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import https from "https"
import http from "http"

config({ path: resolve(process.cwd(), ".env.local") })

async function downloadImage(url: string): Promise<Buffer> {
  const cleanUrl = url.replace(/&$/, "").trim()
  console.log(` Downloading image from: ${cleanUrl}`)

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
        Accept: "image/webp,image/apng,image*;q=0.8",
      },
    }

    console.log(` Request headers:`, JSON.stringify(options.headers, null, 2))

    const req = client.request(options, (res) => {
      console.log(` Response status: ${res.statusCode} ${res.statusMessage}`)
      console.log(` Response headers:`, JSON.stringify(res.headers, null, 2))

      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const redirectUrl = res.headers.location
        if (redirectUrl) {
          console.log(` Following redirect to: ${redirectUrl}`)
          downloadImage(redirectUrl).then(resolve).catch(reject)
          return
        }
      }

      if (res.statusCode !== 200) {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString()
          console.log(` Error response body:`, body)
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
      console.log(` Request error:`, error)
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
  
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/i)
  return match ? match[1].toLowerCase() : "png"
}

async function migrateImages() {
  console.log(" Starting image migration...")

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

      const imageBuffer = await downloadImage(item.image_url)

      const extension = getImageExtension(item.image_url)
      const filename = `${item.game.toLowerCase()}-${item.id}.${extension}`
      const filepath = join(imagesDir, filename)

      await writeFile(filepath, imageBuffer)
      console.log(` Saved image: ${filename} (${imageBuffer.length} bytes)`)

      const localPath = `/images/items/${filename}`
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, item.id])
      console.log(` Updated database: ${localPath}`)

      successCount++

      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(` Failed to migrate image for ${item.name}:`, error)
      failCount++
    }
  }

  console.log(`\n Migration complete!`)
  console.log(` Success: ${successCount}`)
  console.log(` Failed: ${failCount}`)
}

migrateImages().catch(console.error)
