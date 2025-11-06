import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db/postgres"

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()

    const result = await pool.query(
      `SELECT id, name, game, image_url, rap_value, exist_count 
       FROM items 
       WHERE image_url LIKE 'https:
          OR image_url LIKE 'https:
          OR image_url LIKE 'http%'
       ORDER BY game, name`,
    )

    return NextResponse.json({
      items: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error(" Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
