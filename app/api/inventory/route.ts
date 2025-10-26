import type { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getSession } from "@/lib/auth/session"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import { auditLog } from "@/lib/security/audit-logger"
import { validateInteger } from "@/lib/security/low-level-protection"
import { handleSecureError } from "@/lib/security/error-handler"
import { z } from "zod"

const addInventorySchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
})

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(req, "read")
    if (!rateLimitResult.allowed) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }

    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServiceClient()

    const { data, error } = await supabase
      .from("user_inventories")
      .select("id, item_id, quantity, created_at")
      .eq("discord_id", session.discordId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching inventory:", error)
      return Response.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }

    return Response.json({ inventory: data })
  } catch (error) {
    return handleSecureError(error, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(req, "write")
    if (!rateLimitResult.allowed) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }

    const session = await getSession()
    if (!session) {
      await auditLog({
        eventType: "inventory_add_unauthorized",
        severity: "warning",
        request: req,
      })
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const validation = addInventorySchema.safeParse({
      itemId: body.itemId,
      quantity: body.quantity ?? 1,
    })

    if (!validation.success) {
      await auditLog({
        eventType: "inventory_add_invalid_input",
        severity: "warning",
        request: req,
        userId: session.discordId,
      })
      return Response.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const { itemId, quantity } = validation.data

    const supabase = await createServiceClient()

    const { data: existing } = await supabase
      .from("user_inventories")
      .select("id, quantity")
      .eq("discord_id", session.discordId)
      .eq("item_id", itemId)
      .single()

    if (existing) {
      const newQuantity = validateInteger(existing.quantity + quantity, 1, 999999)

      const { error } = await supabase
        .from("user_inventories")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (error) {
        console.error("[v0] Error updating inventory:", error)
        return Response.json({ error: "Failed to update inventory" }, { status: 500 })
      }
    } else {
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

    await auditLog({
      eventType: "inventory_add_success",
      severity: "info",
      request: req,
      userId: session.discordId,
      metadata: { item_id: itemId, quantity },
    })

    await supabase.from("activities").insert({
      discord_id: session.discordId,
      type: "add_inventory",
      meta: { item_id: itemId, quantity },
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleSecureError(error, req)
  }
}
