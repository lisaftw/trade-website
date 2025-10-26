/**
 * API Authentication & Authorization Utilities
 * Centralized security checks for API routes
 */

import { type NextRequest, NextResponse } from "next/server"
import { getSession, type UserSession } from "@/lib/auth/session"
import { rateLimit, getRateLimitIdentifier, type RateLimitConfig } from "./rate-limiter"

export type AuthResult = { success: true; session: UserSession } | { success: false; response: NextResponse }

/**
 * Validates that the request has a valid authenticated session
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const session = await getSession()

  if (!session) {
    return {
      success: false,
      response: NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 }),
    }
  }

  return { success: true, session }
}

/**
 * Validates admin session
 */
export async function requireAdmin(request: NextRequest): Promise<{ success: boolean; response?: NextResponse }> {
  const adminCookie = request.cookies.get("admin_session")

  if (!adminCookie || adminCookie.value !== "true") {
    return {
      success: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    }
  }

  return { success: true }
}

/**
 * Applies rate limiting to API requests
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string,
): { success: boolean; response?: NextResponse } {
  const identifier = getRateLimitIdentifier(request, userId)
  const result = rateLimit(identifier, config)

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(config.windowMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      ),
    }
  }

  return { success: true }
}

/**
 * Validates request body against expected schema
 */
export function validateRequestBody<T>(
  body: unknown,
  validator: (data: unknown) => data is T,
): { success: true; data: T } | { success: false; response: NextResponse } {
  if (!validator(body)) {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
    }
  }

  return { success: true, data: body }
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 10000) // Limit length
}

/**
 * Validates that user owns the resource
 */
export function requireOwnership(
  session: UserSession,
  resourceOwnerId: string,
): { success: boolean; response?: NextResponse } {
  if (session.discordId !== resourceOwnerId) {
    return {
      success: false,
      response: NextResponse.json({ error: "You don't have permission to access this resource" }, { status: 403 }),
    }
  }

  return { success: true }
}
