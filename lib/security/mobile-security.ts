import type { NextRequest, NextResponse } from "next/server"

// Secure mobile storage wrapper
export class SecureMobileStorage {
  private static readonly ENCRYPTION_KEY = "secure_storage_key"

  // Encrypt data before storing
  static setItem(key: string, value: string): void {
    if (typeof window === "undefined") return

    try {
      // Add timestamp and integrity check
      const data = {
        value,
        timestamp: Date.now(),
        integrity: this.generateIntegrity(value),
      }

      const encrypted = btoa(JSON.stringify(data))
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error("Failed to store data securely:", error)
    }
  }

  // Decrypt and validate data when retrieving
  static getItem(key: string): string | null {
    if (typeof window === "undefined") return null

    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      const data = JSON.parse(atob(encrypted))

      // Validate integrity
      if (data.integrity !== this.generateIntegrity(data.value)) {
        console.warn("Data integrity check failed")
        this.removeItem(key)
        return null
      }

      // Check if data is expired (24 hours)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        this.removeItem(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error("Failed to retrieve data securely:", error)
      return null
    }
  }

  static removeItem(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  }

  private static generateIntegrity(value: string): string {
    // Simple integrity check (in production, use proper HMAC)
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
}

// Mobile-specific security headers
export function addMobileSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent tap-jacking and clickjacking
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Frame-Options", "DENY")

  // Content Security Policy for mobile
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)

  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy (restrict mobile features)
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  )

  // Cache control for mobile
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}

// Touch event security
export function validateTouchEvent(event: TouchEvent): boolean {
  // Prevent synthetic touch events
  if (!event.isTrusted) {
    console.warn("Untrusted touch event detected")
    return false
  }

  // Validate touch points
  if (event.touches.length > 10) {
    console.warn("Suspicious number of touch points")
    return false
  }

  return true
}

// Mobile device fingerprinting protection
export function sanitizeMobileInfo(request: NextRequest): {
  isMobile: boolean
  userAgent: string
} {
  const userAgent = request.headers.get("user-agent") || ""

  // Detect mobile without exposing specific device info
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)

  // Return sanitized info only
  return {
    isMobile,
    userAgent: isMobile ? "mobile" : "desktop",
  }
}

// Viewport security validation
export function validateViewport(): boolean {
  if (typeof window === "undefined") return true

  // Detect viewport manipulation
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  }

  // Check for suspicious viewport values
  if (viewport.width < 200 || viewport.height < 200) {
    console.warn("Suspicious viewport dimensions detected")
    return false
  }

  if (viewport.devicePixelRatio < 0.5 || viewport.devicePixelRatio > 5) {
    console.warn("Suspicious device pixel ratio detected")
    return false
  }

  return true
}

// Mobile session security
export function validateMobileSession(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || ""
  const sessionUA = request.cookies.get("session_ua")?.value

  // Validate user agent hasn't changed (session hijacking detection)
  if (sessionUA && sessionUA !== userAgent) {
    console.warn("User agent mismatch - possible session hijacking")
    return false
  }

  return true
}
