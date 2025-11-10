import { destroySession } from "@/lib/auth/session"

export async function POST() {
  try {
    await destroySession()
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return Response.json({ success: false, error: "Failed to logout" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await destroySession()
    return Response.redirect("/", 302)
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return Response.redirect("/?error=logout_failed", 302)
  }
}
