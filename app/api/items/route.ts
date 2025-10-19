import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { searchParams } = new URL(request.url)
    const game = searchParams.get("game")
    const q = searchParams.get("q")?.toLowerCase() || ""

    let query = supabase.from("items").select("*")

    if (game) {
      query = query.eq("game", game)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Filter by search query if provided
    const filtered = data?.filter((item: any) => (q ? item.name.toLowerCase().includes(q) : true)) || []

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
