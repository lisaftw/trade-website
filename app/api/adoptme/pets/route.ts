export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getAdoptMePets } from "@/lib/db/adoptme-items"

export async function GET(request: NextRequest) {
  try {
    const pets = await getAdoptMePets()

    return NextResponse.json({
      pets,
      count: pets.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching Adopt Me pets:", error)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}
