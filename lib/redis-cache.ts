import Redis from "ioredis"

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    return JSON.parse(cached) as T
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCache(key: string, value: any, ttl = 300): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

export async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  await setCache(key, fresh, ttl)
  return fresh
}

export default redis
