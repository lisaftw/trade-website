import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.ADMIN_PASSWORD

    console.log("[v0] API: Password verification attempt")
    console.log("[v0] API: Password received length:", password?.length)
    console.log("[v0] API: Expected password length:", correctPassword?.length)

    if (!correctPassword) {
      console.error("[v0] API: ADMIN_PASSWORD environment variable not set")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const trimmedPassword = password?.trim()
    const passwordMatch = trimmedPassword === correctPassword

    console.log("[v0] API: Passwords match:", passwordMatch)

    if (passwordMatch) {
      const cookieStore = await cookies()

      cookieStore.set("site-access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })

      console.log("[v0] API: Cookie set successfully, access granted")

      return NextResponse.json({ success: true })
    }

    console.log("[v0] API: Password incorrect")
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("[v0] API: Error in site-access route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
