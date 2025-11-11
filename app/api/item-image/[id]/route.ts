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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const items = await sql`
      SELECT image_url 
      FROM items 
      WHERE id = ${id}
      LIMIT 1
    `

    if (items.length === 0 || !items[0].image_url) {
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const rawImageUrl = items[0].image_url
    const imageUrl = getRobloxImageUrl(rawImageUrl) || rawImageUrl

    const cached = imageCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return new NextResponse(cached.buffer, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=600",
        },
      })
    }

    const imageResponse = await fetch(imageUrl, {
      headers: getImageFetchHeaders(imageUrl),
    })

    if (!imageResponse.ok) {
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/png"

    imageCache.set(id, {
      buffer: imageBuffer,
      contentType,
      timestamp: Date.now(),
    })

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
