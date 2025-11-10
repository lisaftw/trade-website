import { type NextRequest, NextResponse } from "next/server"
import { getItemById } from "@/lib/db/queries/items"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const imageCache = new Map<string, { buffer: ArrayBuffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in memory

function getRobloxImageUrl(assetIdOrUrl: string): string | null {
  // If it's already a full URL, return it
  if (assetIdOrUrl.startsWith("http://") || assetIdOrUrl.startsWith("https://")) {
    return assetIdOrUrl
  }

  // If it's a proxy URL like /api/item-image/12345, extract the asset ID
  const proxyMatch = assetIdOrUrl.match(/\/api\/item-image\/(\d+)/)
  if (proxyMatch) {
    const assetId = proxyMatch[1]
    return `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`
  }

  // If it's just a number, treat it as an asset ID
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

  // Discord CDN needs specific headers
  if (url.includes("cdn.discordapp.com")) {
    headers["Accept"] = "image/webp,image/apng,image/*,*/*;q=0.8"
    headers["Referer"] = "https://discord.com/"
  }

  // Wikia/Fandom needs specific headers
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

    console.log("[v0] Fetching image for item ID:", id)
    const item = await getItemById(id)

    if (!item) {
      console.log("[v0] Item not found:", id)
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    if (!item.image_url) {
      console.log("[v0] Item has no image_url:", id, item.name)
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

        // Cache in memory
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
        console.log(`[v0] Local image not found: ${filepath}`)
        return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
      }
    }

    const imageUrl = getRobloxImageUrl(item.image_url)

    if (!imageUrl) {
      console.error("[v0] Invalid image URL for item", item.name, ":", item.image_url)
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }

    console.log("[v0] Fetching image from URL:", imageUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(imageUrl, {
        headers: getImageFetchHeaders(imageUrl),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.log("[v0] Image fetch failed:", response.status, response.statusText, "for", item.name)
        return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
      }

      console.log("[v0] Image fetched successfully for:", item.name)
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
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[v0] Image fetch timeout for", item.name, ":", imageUrl)
      } else {
        console.error("[v0] Image fetch error for", item.name, ":", fetchError)
      }
      return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
    }
  } catch (error) {
    console.error("[v0] Error proxying image for item", id, ":", error)
    return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
  }
}
