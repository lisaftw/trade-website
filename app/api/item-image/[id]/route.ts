import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const size = request.nextUrl.searchParams.get("size") || "150"

  console.log("[v0] Fetching image for ID:", id, "size:", size)

  try {
    // Fetch the image from the external source
    const imageUrl = `https://images.ro.shopping/asset-thumbnail/${id}?size=${size}`
    console.log("[v0] Fetching from:", imageUrl)

    const response = await fetch(imageUrl)

    if (!response.ok) {
      console.error("[v0] Image fetch failed:", response.status, response.statusText)
      return new NextResponse("Image not found", { status: 404 })
    }

    const imageBuffer = await response.arrayBuffer()
    console.log("[v0] Image fetched successfully, size:", imageBuffer.byteLength)

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching image:", error)
    return new NextResponse("Error fetching image", { status: 500 })
  }
}
