export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { updatePetValue } from "@/lib/db/adoptme-items"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { variant, value, changedBy, reason } = body

    if (!variant || value === undefined) {
      return NextResponse.json({ error: "Missing required fields: variant, value" }, { status: 400 })
    }

    if (!["base", "neon", "mega"].includes(variant)) {
      return NextResponse.json({ error: "Invalid variant. Must be: base, neon, or mega" }, { status: 400 })
    }

    const success = await updatePetValue(
      params.id,
      variant as "base" | "neon" | "mega",
      Number(value),
      changedBy,
      reason,
    )

    if (!success) {
      return NextResponse.json({ error: "Failed to update pet value" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${variant} value updated successfully`,
    })
  } catch (error) {
    console.error("[v0] Error updating pet value:", error)
    return NextResponse.json({ error: "Failed to update pet value" }, { status: 500 })
  }
}
