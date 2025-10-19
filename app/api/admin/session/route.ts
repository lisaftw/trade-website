import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const authorized = cookies().get("admin_session")?.value === "true"
  return NextResponse.json({ authorized })
}
