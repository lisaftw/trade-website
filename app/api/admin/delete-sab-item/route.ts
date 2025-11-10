import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    console.log(`[v0] Connecting to PostgreSQL...`)

    // Find the corrupt item
    const findResult = await query(`SELECT id, name, value, section FROM items WHERE game = $1 AND name = $2`, [
      "SAB",
      itemName,
    ])

    if (findResult.rows.length === 0) {
      return NextResponse.json({ error: `No item named '${itemName}' found in SAB game` }, { status: 404 })
    }

    const corruptItem = findResult.rows[0]

    console.log(`[v0] Found item:`, {
      id: corruptItem.id,
      name: corruptItem.name,
      value: corruptItem.value,
      section: corruptItem.section,
    })

    // Delete the item
    const deleteResult = await query(`DELETE FROM items WHERE id = $1 RETURNING *`, [corruptItem.id])

    if (deleteResult.rowCount && deleteResult.rowCount > 0) {
      console.log(`[v0] Successfully deleted item!`)
      return NextResponse.json({
        success: true,
        message: `Successfully deleted '${itemName}' from SAB game`,
        deletedItem: {
          id: corruptItem.id,
          name: corruptItem.name,
          value: corruptItem.value,
        },
      })
    } else {
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json(
      { error: "Failed to delete item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
