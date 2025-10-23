import type { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getSession } from "@/lib/auth/session"

// GET - List user's inventory
export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from("user_inventories")
    .select(
      `
      id,
      quantity,
      created_at,
      items (
        id,
        name,
        game,
        image_url,
        rap_value,
        section,
        rarity,
        demand,
        pot
      )
    `,
    )
    .eq("discord_id", session.discordId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching inventory:", error)
    return Response.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }

  return Response.json({ inventory: data })
}

// POST - Add item to inventory
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    console.log("[v0] Inventory add failed: No session")
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { itemId, quantity = 1 } = body

  console.log("[v0] Adding to inventory:", { discordId: session.discordId, itemId, quantity })

  if (!itemId) {
    return Response.json({ error: "Item ID is required" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: itemExists, error: itemError } = await supabase.from("items").select("id").eq("id", itemId).single()

  if (itemError || !itemExists) {
    console.error("[v0] Item not found:", itemId, itemError)
    return Response.json({ error: "Item not found" }, { status: 404 })
  }

  const { data: existing } = await supabase
    .from("user_inventories")
    .select("id, quantity")
    .eq("discord_id", session.discordId)
    .eq("item_id", itemId)
    .single()

  if (existing) {
    console.log("[v0] Updating existing inventory item:", existing.id)
    const { error } = await supabase
      .from("user_inventories")
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      console.error("[v0] Error updating inventory:", error)
      return Response.json({ error: "Failed to update inventory" }, { status: 500 })
    }
  } else {
    console.log("[v0] Creating new inventory item")
    const { error } = await supabase.from("user_inventories").insert({
      discord_id: session.discordId,
      item_id: itemId,
      quantity,
    })

    if (error) {
      console.error("[v0] Error adding to inventory:", error)
      return Response.json({ error: "Failed to add to inventory" }, { status: 500 })
    }
  }

  await supabase
    .from("activities")
    .insert({
      discord_id: session.discordId,
      type: "add_inventory",
      meta: { item_id: itemId, quantity },
    })
    .catch((err) => console.error("[v0] Activity log failed:", err))

  console.log("[v0] Successfully added to inventory")
  return Response.json({ success: true })
}
