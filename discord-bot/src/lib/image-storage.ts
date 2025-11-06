import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function downloadAndSaveImage(imageUrl: string, itemId: number, game: string): Promise<string> {
  
  const imagesDir = join(process.cwd(), "..", "public", "images", "items")
  if (!existsSync(imagesDir)) {
    await mkdir(imagesDir, { recursive: true })
  }

  const isDiscordCDN = imageUrl.includes("cdn.discordapp.com")

  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: isDiscordCDN ? "https:
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const imageBuffer = Buffer.from(arrayBuffer)

  const extension = getImageExtension(imageUrl)
  const filename = `${game.toLowerCase()}-${itemId}.${extension}`
  const filepath = join(imagesDir, filename)

  await writeFile(filepath, imageBuffer)

  return `/images/items/${filename}`
}

function getImageExtension(url: string): string {
  const match = url.match(/\.(png|jpg|jpeg|gif|webp)/i)
  return match ? match[1].toLowerCase() : "png"
}
