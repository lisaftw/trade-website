import { type NextRequest, NextResponse } from "next/server"
import { getItemById } from "@/lib/db/queries/items"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const imageCache = new Map<string, { buffer: ArrayBuffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in memory

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const cached = imageCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return new NextResponse(cached.buffer, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Cache": "HIT",
        },
      })
    }

    const item = await getItemById(id)

    if (!item) {
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    if (!item.image_url) {
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    if (item.image_url.startsWith("/images/")) {
      const filepath = join(process.cwd(), "public", item.image_url)

      if (existsSync(filepath)) {
        const imageBuffer = await readFile(filepath)
        const extension = item.image_url.split(".").pop()?.toLowerCase()

        const contentType =
          {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
          }[extension || "png"] || "image/png"

        imageCache.set(id, {
          buffer: imageBuffer.buffer,
          contentType,
          timestamp: Date.now(),
        })

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Cache": "MISS",
          },
        })
      } else {
        return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
      }
    }

    const imageUrl = getRobloxImageUrl(item.image_url)

    if (!imageUrl) {
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(imageUrl, {
        headers: getImageFetchHeaders(imageUrl),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
      }

      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get("Content-Type") || "image/png"

      imageCache.set(id, { buffer: imageBuffer, contentType, timestamp: Date.now() })

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "CDN-Cache-Control": "public, max-age=31536000",
          "X-Cache": "MISS",
        },
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }
  } catch (error) {
    console.error("Error proxying image for item", id, ":", error)
    return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
  }
}
