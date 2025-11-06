export const revalidate = 3600 

import { type NextRequest, NextResponse } from "next/server"
import { getAdoptMePets } from "@/lib/db/adoptme-items"

export async function GET(request: NextRequest) {
  try {
    const pets = await getAdoptMePets()

    return NextResponse.json(
      {
        pets,
        count: pets.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching Adopt Me pets:", error)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}
