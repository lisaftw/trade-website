import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServiceClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import { auditLog } from "@/lib/security/audit-logger"
import { sanitizeInput } from "@/lib/security/low-level-protection"
import { handleSecureError } from "@/lib/security/error-handler"
import { z } from "zod"

const loginSchema = z.object({
  password: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  try {
    const rateLimitResult = await checkRateLimit(req, "admin")
    if (!rateLimitResult.allowed) {
      await auditLog({
        eventType: "admin_login_rate_limited",
        severity: "warning",
        request: req,
      })
      return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      await auditLog({
        eventType: "admin_login_invalid_input",
        severity: "warning",
        request: req,
      })
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    const { password } = validation.data
    const sanitizedPassword = sanitizeInput(password)
    const expected = process.env.ADMIN_PASSWORD

    if (!expected || sanitizedPassword !== expected) {
      await auditLog({
        eventType: "admin_login_failed",
        severity: "warning",
        request: req,
        metadata: { reason: "invalid_password" },
      })
      return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 })
    }

    const crypto = await import("crypto")
    const sessionToken = crypto.randomBytes(32).toString("hex")

    const cookieStore = await cookies()
    cookieStore.set({
      name: "admin_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    await auditLog({
      eventType: "admin_login_success",
      severity: "info",
      request: req,
      metadata: { session_token: sessionToken.substring(0, 8) + "..." },
    })

    try {
      const supa = getServiceClient()
      await supa.from("activities").insert({ type: "admin_login" })
    } catch (e) {
      console.error("[v0] Activity log error:", e)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleSecureError(error, req)
  }
}
