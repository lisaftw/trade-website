import { type NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || "")

const imageCache = new Map<string, { buffer: ArrayBuffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000

function getRobloxImageUrl(assetIdOrUrl: string): string | null {
  if (assetIdOrUrl.startsWith("http://") || assetIdOrUrl.startsWith("https://")) {
    return assetIdOrUrl
  }

  const proxyMatch = assetIdOrUrl.match(/\/api\/item-image\/(\d+)/)
  if (proxyMatch) {
    const assetId = proxyMatch[1]
    return `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`
  }

  if (/^\d+$/.test(assetIdOrUrl)) {
    return `https://assetdelivery.roblox.com/v1/asset/?id=${assetIdOrUrl}`
  }

  return null
}

function getImageFetchHeaders(url: string): HeadersInit {
  const headers: HeadersInit = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  }

  if (url.includes("cdn.discordapp.com")) {
    headers["Accept"] = "image/webp,image/apng,image/*,*/*;q=0.8"
    headers["Referer"] = "https://discord.com/"
  }

  if (url.includes("wikia.nocookie.net") || url.includes("fandom.com")) {
    headers["Accept"] = "image/webp,image/apng,image/*,*/*;q=0.8"
    headers["Referer"] = "https://www.fandom.com/"
  }

  return headers
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params

  try {
    console.log("[v0] Fetching image for item ID:", id)

    const items = await sql`
      SELECT image_url 
      FROM items 
      WHERE id = ${id}
      LIMIT 1
    `

    console.log("[v0] Database query result:", items.length > 0 ? "found" : "not found")

    if (items.length === 0 || !items[0].image_url) {
      console.log("[v0] No image URL found, returning placeholder")
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const rawImageUrl = items[0].image_url
    console.log("[v0] Raw image URL:", rawImageUrl)

    const imageUrl = getRobloxImageUrl(rawImageUrl) || rawImageUrl
    console.log("[v0] Processed image URL:", imageUrl)

    const cached = imageCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached image")
      return new NextResponse(cached.buffer, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=600",
        },
      })
    }

    console.log("[v0] Fetching image from:", imageUrl)
    const imageResponse = await fetch(imageUrl, {
      headers: getImageFetchHeaders(imageUrl),
    })

    console.log("[v0] Image fetch response status:", imageResponse.status)

    if (!imageResponse.ok) {
      console.log("[v0] Image fetch failed, returning placeholder")
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/png"

    imageCache.set(id, {
      buffer: imageBuffer,
      contentType,
      timestamp: Date.now(),
    })

    console.log("[v0] Successfully returning image")
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=600",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching image for id:", id, error)
    return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
  }
}
