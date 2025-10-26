import { cookies } from "next/headers"

const CSRF_TOKEN_NAME = "csrf_token"
const CSRF_SECRET = process.env.CSRF_SECRET || "change-this-in-production"

/**
 * Generates a CSRF token and stores it in a cookie
 */
export async function generateCSRFToken(): Promise<string> {
  // Use Web Crypto API instead of Node.js crypto for Edge Runtime compatibility
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")

  const cookieStore = await cookies()

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  })

  return token
}

/**
 * Validates a CSRF token from request headers
 */
export async function validateCSRFToken(token: string | null): Promise<boolean> {
  if (!token) return false

  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!storedToken) return false

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(token, storedToken)
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Middleware to check CSRF token on state-changing requests
 */
export async function requireCSRF(request: Request): Promise<boolean> {
  const method = request.method

  // Only check CSRF on state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return true
  }

  const token = request.headers.get("x-csrf-token")
  return await validateCSRFToken(token)
}
