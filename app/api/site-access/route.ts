import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.ADMIN_PASSWORD

    console.log("[v0] API: Password verification")
    console.log("[v0] API: Received length:", password?.length)
    console.log("[v0] API: Expected length:", correctPassword?.length)

    if (!correctPassword) {
      console.error("[v0] API: ADMIN_PASSWORD not set")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const trimmedPassword = password?.trim()

    if (trimmedPassword === correctPassword) {
      const response = NextResponse.json({ success: true })

      // Set cookie directly in response headers
      response.cookies.set("site-access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })

      console.log("[v0] API: Password correct, cookie set in response")
      return response
    }

    console.log("[v0] API: Password incorrect")
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("[v0] API: Error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
