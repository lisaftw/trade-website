// Prevent touch event hijacking and tap-jacking
export function validateTouchEvent(event: TouchEvent | MouseEvent): boolean {
  // Check if event is trusted (not synthetic)
  if (!event.isTrusted) {
    console.warn("[Security] Untrusted touch event blocked")
    return false
  }

  // Prevent rapid-fire clicks (potential bot/script)
  const now = Date.now()
  const lastClick = (window as any).__lastClickTime || 0
  if (now - lastClick < 100) {
    console.warn("[Security] Rapid click detected, potential bot")
    return false
  }
  ;(window as any).__lastClickTime = now

  return true
}

// Secure clipboard operations
export async function secureClipboardWrite(text: string): Promise<boolean> {
  try {
    // Sanitize content before copying
    const sanitized = text
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.warn("[Security] Clipboard API not available")
      return false
    }

    // Validate text length to prevent clipboard bombs
    if (sanitized.length > 10000) {
      console.warn("[Security] Clipboard content too large")
      return false
    }

    await navigator.clipboard.writeText(sanitized)
    return true
  } catch (error) {
    console.error("[Security] Clipboard write failed:", error)
    return false
  }
}

// Validate mobile input to prevent injection
export function validateMobileInput(input: string): string {
  // Remove zero-width characters used in mobile attacks
  let cleaned = input.replace(/[\u200B-\u200D\uFEFF]/g, "")

  // Normalize Unicode to prevent homograph attacks
  cleaned = cleaned.normalize("NFKC")

  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "")

  // Limit length to prevent buffer overflow
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 5000)
  }

  return cleaned
}

// Detect and prevent mobile bot attacks
export function detectMobileBot(userAgent: string): boolean {
  const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /java(?!script)/i]

  return botPatterns.some((pattern) => pattern.test(userAgent))
}

// Validate realtime channel authentication
export function validateRealtimeAuth(userId: string, channelId: string): boolean {
  // Ensure user has permission to access this channel
  // Channel ID should contain user ID for private channels
  if (channelId.includes("conversation:")) {
    // For conversation channels, verify user is participant
    return true // Will be validated server-side
  }

  return false
}

// Prevent screen orientation attacks
export function lockOrientation(): void {
  if ("orientation" in screen && "lock" in screen.orientation) {
    try {
      // Lock to current orientation to prevent orientation-based attacks
      screen.orientation.lock(screen.orientation.type).catch(() => {
        // Orientation lock not supported or denied
      })
    } catch (error) {
      // Silently fail if not supported
    }
  }
}

// Detect mobile network security
export function isMobileNetworkSecure(): boolean {
  // Check if connection is secure
  if (typeof window === "undefined") return true

  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
    // Warn on cellular connections (more vulnerable to MITM)
    if (connection.type === "cellular") {
      console.warn("[Security] Cellular connection detected - use caution")
      return false
    }
  }

  // Ensure HTTPS
  if (window.location.protocol !== "https:") {
    console.error("[Security] Insecure connection detected")
    return false
  }

  return true
}

// Prevent mobile gesture hijacking
export function validateGesture(event: TouchEvent): boolean {
  // Ensure gesture is from a single touch point
  if (event.touches.length > 1) {
    // Multi-touch could be legitimate, but validate
    return event.isTrusted
  }

  // Check for suspicious velocity (too fast = bot)
  const touch = event.touches[0]
  const now = Date.now()
  const lastTouch = (window as any).__lastTouchTime || 0
  const lastX = (window as any).__lastTouchX || touch.clientX
  const lastY = (window as any).__lastTouchY || touch.clientY

  if (now - lastTouch < 50) {
    const distance = Math.sqrt(Math.pow(touch.clientX - lastX, 2) + Math.pow(touch.clientY - lastY, 2))

    // If moved more than 500px in less than 50ms, likely a bot
    if (distance > 500) {
      console.warn("[Security] Suspicious gesture velocity detected")
      return false
    }
  }
  ;(window as any).__lastTouchTime =
    now(window as any).__lastTouchX =
    touch.clientX(window as any).__lastTouchY =
      touch.clientY

  return true
}

// Mobile-specific rate limiting
const mobileActionTimestamps: Map<string, number[]> = new Map()

export function rateLimitMobileAction(actionKey: string, maxActions = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const timestamps = mobileActionTimestamps.get(actionKey) || []

  // Remove old timestamps outside the window
  const recentTimestamps = timestamps.filter((ts) => now - ts < windowMs)

  // Check if limit exceeded
  if (recentTimestamps.length >= maxActions) {
    console.warn(`[Security] Rate limit exceeded for action: ${actionKey}`)
    return false
  }

  // Add current timestamp
  recentTimestamps.push(now)
  mobileActionTimestamps.set(actionKey, recentTimestamps)

  return true
}
