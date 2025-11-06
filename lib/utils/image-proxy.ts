
export function getProxiedImageUrl(itemId: string): string {
  return `/api/item-image/${itemId}`
}

export function shouldProxyImage(url: string): boolean {
  return url.includes("cdn.discordapp.com") || url.includes("discord.com")
}
