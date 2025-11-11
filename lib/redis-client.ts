import Redis from "ioredis"

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number.parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
    })

    redis.on("error", (err) => {
      console.error("Redis connection error:", err)
    })

    redis.on("connect", () => {
      console.log("Redis connected successfully")
    })
  }

  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function cacheSet(key: string, value: any, ttl = 300): Promise<void> {
  try {
    const client = getRedisClient()
    await client.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}
