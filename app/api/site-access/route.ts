import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.SITE_PASSWORD || "qsxcvbhjio987654"

    console.log("[v0] Password verification attempt")
    console.log("[v0] Password received:", password)
    console.log("[v0] Expected password:", correctPassword)
    console.log("[v0] Match result:", password === correctPassword)

    if (password === correctPassword) {
      const cookieStore = await cookies()
      cookieStore.set("site-access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      })

      console.log("[v0] Password correct, access granted")
      return NextResponse.json({ success: true })
    }

    console.log("[v0] Password incorrect")
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Error in site-access route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
