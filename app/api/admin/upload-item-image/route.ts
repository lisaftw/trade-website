import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getPool } from "@/lib/db/postgres"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const itemId = formData.get("itemId") as string
    const game = formData.get("game") as string
    const imageUrl = formData.get("imageUrl") as string

    if (!itemId || !game) {
      return NextResponse.json({ error: "Missing itemId or game" }, { status: 400 })
    }

    const pool = getPool()
    let localPath: string

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const imagesDir = join(process.cwd(), "public", "images", "items")
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true })
      }

      const extension = file.name.split(".").pop() || "png"
      const filename = `${game.toLowerCase()}-${itemId}.${extension}`
      const filepath = join(imagesDir, filename)

      await writeFile(filepath, buffer)
      localPath = `/images/items/${filename}`
    }
    
    else if (imageUrl) {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/*",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const imagesDir = join(process.cwd(), "public", "images", "items")
      if (!existsSync(imagesDir)) {
        await mkdir(imagesDir, { recursive: true })
      }

      const extension = imageUrl.match(/\.(png|jpg|jpeg|gif|webp)/i)?.[1] || "png"
      const filename = `${game.toLowerCase()}-${itemId}.${extension}`
      const filepath = join(imagesDir, filename)

      await writeFile(filepath, buffer)
      localPath = `/images/items/${filename}`
    } else {
      return NextResponse.json({ error: "No file or imageUrl provided" }, { status: 400 })
    }

    await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [localPath, itemId])

    return NextResponse.json({
      success: true,
      path: localPath,
    })
  } catch (error) {
    console.error(" Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
