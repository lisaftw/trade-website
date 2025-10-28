import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const imageUrl = url.searchParams.get("url")

    console.log("[Image Proxy] Request received")
    console.log("[Image Proxy] URL parameter:", imageUrl)

    if (!imageUrl) {
      console.log("[Image Proxy] Missing URL parameter")
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    // Only allow Discord CDN URLs for security
    if (!imageUrl.startsWith("https://cdn.discordapp.com/")) {
      console.log("[Image Proxy] Invalid URL (not Discord CDN):", imageUrl)
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    console.log("[Image Proxy] Fetching from Discord:", imageUrl)

    // Fetch the image from Discord
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    console.log("[Image Proxy] Discord response status:", response.status)
    console.log("[Image Proxy] Discord response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.log("[Image Proxy] Discord returned error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"

    console.log("[Image Proxy] Successfully fetched image, size:", imageBuffer.byteLength, "bytes")
    console.log("[Image Proxy] Content-Type:", contentType)

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*", // Added CORS header
      },
    })
  } catch (error) {
    console.error("[Image Proxy] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
