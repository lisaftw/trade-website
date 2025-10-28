import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    // Only allow Discord CDN URLs for security
    if (!imageUrl.startsWith("https://cdn.discordapp.com/")) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    // Fetch the image from Discord
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("[Image Proxy] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
