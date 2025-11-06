import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { getUserInventory, addToInventory } from "@/lib/db/queries/inventory"
import { logActivity } from "@/lib/db/queries/activities"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inventory = await getUserInventory(session.discordId)

    return Response.json({ inventory })
  } catch (error) {
    console.error(" Unexpected error in GET /api/inventory:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      console.log(" Inventory add failed: No session")
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { itemId, quantity = 1 } = body

    console.log(" Adding to inventory:", { discordId: session.discordId, itemId, quantity })

    if (!itemId) {
      return Response.json({ error: "Item ID is required" }, { status: 400 })
    }

    await addToInventory(session.discordId, itemId, quantity)

    await logActivity(session.discordId, "add_inventory", { item_id: itemId, quantity })

    console.log(" Successfully added to inventory")
    return Response.json({ success: true })
  } catch (error) {
    console.error(" Unexpected error in POST /api/inventory:", error)
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
