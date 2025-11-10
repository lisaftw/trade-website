import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getPool } from "@/lib/db/postgres"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const updates: Array<{ itemId: string; path: string }> = []
    const errors: Array<{ filename: string; error: string }> = []

    const imagesDir = join(process.cwd(), "public", "images", "items")
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-")) {
        const file = value as File
        const itemId = formData.get(`itemId-${key.split("-")[1]}`) as string
        const game = formData.get(`game-${key.split("-")[1]}`) as string

        if (!itemId || !game) {
          errors.push({ filename: file.name, error: "Missing itemId or game" })
          continue
        }

        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Generate filename
          const extension = file.name.split(".").pop() || "png"
          const filename = `${game.toLowerCase()}-${itemId}.${extension}`
          const filepath = join(imagesDir, filename)

          // Save file
          await writeFile(filepath, buffer)
          const localPath = `/images/items/${filename}`

          updates.push({ itemId, path: localPath })
        } catch (error) {
          console.error(`[v0] Error processing ${file.name}:`, error)
          errors.push({ filename: file.name, error: "Failed to save file" })
        }
      }
    }

    const pool = getPool()
    for (const { itemId, path } of updates) {
      await pool.query("UPDATE items SET image_url = $1 WHERE id = $2", [path, itemId])
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      errors: errors.length,
      details: { updates, errors },
    })
  } catch (error) {
    console.error("[v0] Error in bulk upload:", error)
    return NextResponse.json({ error: "Failed to process uploads" }, { status: 500 })
  }
}
