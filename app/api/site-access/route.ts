import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const correctPassword = process.env.SITE_ACCESS_PASSWORD || "qsxcvbhjio987654"

    if (password === correctPassword) {
      const cookieStore = await cookies()
      cookieStore.set("site_access", "granted", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
