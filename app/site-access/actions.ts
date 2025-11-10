"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function verifySitePassword(formData: FormData) {
  const password = formData.get("password") as string
  const correctPassword = process.env.SITE_PASSWORD || "qsxcvbhjio987654"

  console.log("[v0] Server Action: Password verification attempt")
  console.log("[v0] Server Action: Password received:", password)
  console.log("[v0] Server Action: Expected password:", correctPassword)

  if (password === correctPassword) {
    console.log("[v0] Server Action: Password correct, setting cookie")
    const cookieStore = await cookies()
    cookieStore.set("site-access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    console.log("[v0] Server Action: Cookie set, redirecting to home")
    redirect("/")
  }

  console.log("[v0] Server Action: Password incorrect")
  return { success: false, error: "Invalid password" }
}
