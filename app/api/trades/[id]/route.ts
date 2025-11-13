import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session-postgres"
import { deleteTrade, updateTrade } from "@/lib/db/queries/trades"
import { moderateContent } from "@/lib/utils/content-moderation"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await deleteTrade(params.id, session.discordId)

    if (!success) {
      return NextResponse.json({ error: "Trade not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, offering, requesting, notes } = body

    if (notes) {
      const moderationResult = await moderateContent(notes)
      if (!moderationResult.safe) {
        return NextResponse.json({ error: moderationResult.reason }, { status: 400 })
      }
    }

    const updatedTrade = await updateTrade(params.id, session.discordId, {
      status,
      offering,
      requesting,
      notes,
    })

    if (!updatedTrade) {
      return NextResponse.json({ error: "Trade not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json(updatedTrade)
  } catch (error) {
    console.error("Error updating trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
