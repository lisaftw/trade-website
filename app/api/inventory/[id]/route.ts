import { createServiceClient } from "@/lib/supabase/service"
import { getSession } from "@/lib/auth/session"

// DELETE - Remove item from inventory
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  const supabase = await createServiceClient()

  const { error } = await supabase.from("user_inventories").delete().eq("id", id).eq("discord_id", session.discordId)

  if (error) {
    console.error("[v0] Error removing from inventory:", error)
    return Response.json({ error: "Failed to remove from inventory" }, { status: 500 })
  }

  await supabase.from("activities").insert({
    discord_id: session.discordId,
    type: "remove_inventory",
    meta: { inventory_id: id },
  })

  return Response.json({ success: true })
}
