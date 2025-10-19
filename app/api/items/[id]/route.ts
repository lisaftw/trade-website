import { NextResponse } from "next/server"
import { updateItem, deleteItem } from "@/lib/db/items"
import { getSession } from "@/lib/auth/session"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    const success = await updateItem(id, body)

    if (!success) {
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    const success = await deleteItem(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete item" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
