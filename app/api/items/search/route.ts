import { type NextRequest, NextResponse } from "next/server"
import { searchItems } from "@/lib/db/items"

const sampleItems = [
  { _id: "mm2-od", name: "Ornate Dagger", value: 1500, game: "MM2", imageUrl: "/ornate-dagger.jpg" },
  { _id: "mm2-scythe", name: "Abyssal Scythe", value: 2200, game: "MM2", imageUrl: "/scythe.jpg" },
  {
    _id: "adoptm-neon-uni",
    name: "Neon Unicorn",
    value: 3200,
    game: "Adopt Me",
    imageUrl: "/unicorn.jpg",
  },
  { _id: "sab-void", name: "Void Katana", value: 1800, game: "SAB", imageUrl: "/katana.jpg" },
  { _id: "mm2-chroma", name: "Chroma Shark", value: 2750, game: "MM2", imageUrl: "/chroma-shark.jpg" },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const game = searchParams.get("game") || undefined

    if (!query || query.length < 2) {
      return NextResponse.json({ items: [] })
    }

    // Fallback: if Mongo isn't configured, use sample data for preview
    if (!process.env.MONGODB_URI) {
      const items = sampleItems.filter((i) => {
        const matchesText = i.name.toLowerCase().includes(query.toLowerCase())
        const matchesGame = game ? i.game === game : true
        return matchesText && matchesGame
      })
      return NextResponse.json({ items })
    }

    const items = await searchItems(query, game)
    return NextResponse.json({ items })
  } catch (error) {
    console.error("[v0] Search items error:", error)
    return NextResponse.json({ error: "Failed to search items" }, { status: 500 })
  }
}
