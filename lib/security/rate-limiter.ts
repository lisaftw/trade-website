/**
 * Rate Limiter Implementation
 * Prevents API abuse by limiting requests per IP/user
 */

type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()

export type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

export const RATE_LIMITS = {
  // Strict limits for authentication endpoints
  auth: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 requests per 5 minutes (was 5 per 15 min)
  // Moderate limits for write operations
  write: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  // Generous limits for read operations
  read: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  // Very strict for admin operations
  admin: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
}

export function rateLimit(identifier: string, config: RateLimitConfig): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = store.get(identifier)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) {
        store.delete(key)
      }
    }
  }

  // Check if window has expired
  if (!record || record.resetAt < now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return { success: true, remaining: config.maxRequests - 1 }
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return { success: false, remaining: 0 }
  }

  // Increment count
  record.count++
  return { success: true, remaining: config.maxRequests - record.count }
}

export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  return `ip:${ip}`
}

export async function checkRateLimit(
  request: Request,
  operation: keyof typeof RATE_LIMITS,
  userId?: string,
): Promise<{ success: boolean; remaining: number }> {
  const identifier = getRateLimitIdentifier(request, userId)
  const config = RATE_LIMITS[operation]
  return rateLimit(identifier, config)
}
