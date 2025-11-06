

type CacheEntry<T> = {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data, expiresAt })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

export const cache = new MemoryCache()

if (typeof process !== "undefined") {
  process.on("SIGTERM", () => {
    cache.destroy()
  })

  process.on("SIGINT", () => {
    cache.destroy()
  })
}

export async function cachedQuery<T>(key: string, queryFn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
  
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const result = await queryFn()
  cache.set(key, result, ttlSeconds)
  return result
}
