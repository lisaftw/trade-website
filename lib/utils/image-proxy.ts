/**
 * Generate a proxied image URL that goes through our API
 * This prevents Discord CDN URL expiration issues
 */
export function getProxiedImageUrl(itemId: string): string {
  return `/api/item-image/${itemId}`
}

/**
 * Check if a URL is a Discord CDN URL that should be proxied
 */
export function shouldProxyImage(url: string): boolean {
  return url.includes("cdn.discordapp.com") || url.includes("discord.com")
}
