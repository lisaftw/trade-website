import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServiceClient } from "@/lib/supabase/service"

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 })
  }

  cookies().set({
    name: "admin_session",
    value: "true",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24, 
  })

  try {
    const supa = getServiceClient()
    await supa.from("activities").insert({ type: "admin_login" })
  } catch (e) {
    
  }

  return NextResponse.json({ ok: true })
}
