export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function GET() {
  try {
    console.log("[v0] Testing PostgreSQL connection...")
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    // Get all table names
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tables = tablesResult.rows.map((row) => row.table_name)
    console.log("[v0] Available tables:", tables)

    // Try to fetch from items table
    const itemCountResult = await query(`SELECT COUNT(*) as count FROM items`)
    const itemCount = Number.parseInt(itemCountResult.rows[0].count)
    console.log("[v0] Items count:", itemCount)

    // Get sample items with full details
    const sampleItemsResult = await query(`SELECT * FROM items LIMIT 10`)
    const sampleItems = sampleItemsResult.rows
    console.log("[v0] Sample items:", sampleItems)

    // Find specific item
    const noobiniResult = await query(`SELECT * FROM items WHERE name = $1`, ["Noobini Pizzanini"])
    const noobiniItem = noobiniResult.rows[0] || null
    console.log("[v0] Noobini Pizzanini item:", noobiniItem)

    return NextResponse.json({
      success: true,
      databaseUrlExists: !!process.env.DATABASE_URL,
      database: "trading_db",
      tables: tables,
      itemsCount: itemCount,
      sampleItems: sampleItems.map((item) => ({
        id: item.id,
        name: item.name,
        game: item.game,
        image_url: item.image_url || "NOT FOUND",
        allFields: Object.keys(item),
        rawItem: item,
      })),
      noobiniItem: noobiniItem
        ? {
            id: noobiniItem.id,
            name: noobiniItem.name,
            image_url: noobiniItem.image_url,
            allFields: Object.keys(noobiniItem),
            fullData: noobiniItem,
          }
        : null,
    })
  } catch (error: any) {
    console.error("[v0] PostgreSQL debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        databaseUrlExists: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}
