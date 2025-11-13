import { type NextRequest, NextResponse } from "next/server"
import { moderateContent } from "@/lib/utils/content-moderation"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text provided" }, { status: 400 })
    }

    const result = await moderateContent(text)

    if (result.isInappropriate) {
      return NextResponse.json({ reason: result.reason }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Moderation error:", error)
    // Fail open - allow content if moderation fails
    return NextResponse.json({ ok: true })
  }
}
