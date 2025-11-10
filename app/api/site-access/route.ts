import { NextResponse } from "next/server"
import { createSession, validateSession } from "@/lib/session-store"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.ADMIN_PASSWORD

    console.log("[v0] Password check - Received length:", password?.trim().length)
    console.log("[v0] Expected password:", correctPassword)
    console.log("[v0] Expected length:", correctPassword?.length)

    if (!correctPassword) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    if (password?.trim() === correctPassword) {
      const token = createSession()
      console.log("[v0] Password correct! Token created:", token)

      return NextResponse.json({ success: true, token })
    }

    console.log("[v0] Password incorrect")
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const isValid = validateSession(token)
    return NextResponse.json({ valid: isValid }, { status: isValid ? 200 : 401 })
  } catch (error) {
    console.error("[v0] Validation error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
