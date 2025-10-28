import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection("items")

    const item = await collection.findOne({ _id: new ObjectId(id) })

    if (!item || !item.image_url) {
      // Return placeholder if item not found or no image
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const imageUrl = item.image_url
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
    })

    if (!response.ok) {
      // If Discord URL expired or failed, return placeholder
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("Content-Type") || "image/png"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=2592000",
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    // Return placeholder on any error
    return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
  }
}
