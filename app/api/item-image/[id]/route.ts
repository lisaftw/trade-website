import { type NextRequest, NextResponse } from "next/server"

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

  // For now, just return placeholder SVG for all image requests
  // This prevents 400 errors and shows placeholder images consistently
  return NextResponse.redirect(new URL("/placeholder.svg?height=200&width=200", request.url))
}
