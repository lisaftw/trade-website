import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("discord_id", session.discordId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error(" Activity fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
    }

    return NextResponse.json({ activities: data || [] })
  } catch (error) {
    console.error(" API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
