import crypto from "crypto"

// Desktop-specific security utilities

/**
 * Validates and sanitizes DOM manipulation operations
 */
export function secureDOMOperation(operation: () => void): void {
  try {
    // Check if we're in a trusted context
    if (typeof window === "undefined") {
      throw new Error("DOM operations must run in browser context")
    }

    // Validate document is not compromised
    if (!document.documentElement || !document.body) {
      throw new Error("Document structure compromised")
    }

    operation()
  } catch (error) {
    console.error("[Security] DOM operation blocked:", error)
    throw new Error("Unsafe DOM operation prevented")
  }
}

/**
 * Secure localStorage wrapper with integrity checking
 */
export const secureStorage = {
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return

    try {
      // Create integrity hash
      const hash = crypto.createHash("sha256").update(value).digest("hex").slice(0, 16)
      const data = JSON.stringify({ value, hash, timestamp: Date.now() })

      localStorage.setItem(key, data)
    } catch (error) {
      console.error("[Security] Storage write blocked:", error)
    }
  },

  getItem(key: string): string | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null

      const data = JSON.parse(stored)

      // Verify integrity
      const expectedHash = crypto.createHash("sha256").update(data.value).digest("hex").slice(0, 16)
      if (data.hash !== expectedHash) {
        console.warn("[Security] Storage integrity check failed for:", key)
        localStorage.removeItem(key)
        return null
      }

      // Check if data is too old (24 hours)
      if (Date.now() - data.timestamp > 86400000) {
        localStorage.removeItem(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error("[Security] Storage read blocked:", error)
      return null
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  },
}

/**
 * Validates URL parameters to prevent injection
 */
export function validateURLParams(params: URLSearchParams): boolean {
  const allowedKeys = ["welcome", "tab", "page", "sort", "filter"]

  for (const key of params.keys()) {
    // Check if key is allowed
    if (!allowedKeys.includes(key)) {
      console.warn("[Security] Suspicious URL parameter:", key)
      return false
    }

    const value = params.get(key)
    if (!value) continue

    // Check for injection attempts
    if (/<script|javascript:|data:|vbscript:/i.test(value)) {
      console.warn("[Security] XSS attempt in URL parameter:", key)
      return false
    }

    // Check for path traversal
    if (/\.\.|\/\//i.test(value)) {
      console.warn("[Security] Path traversal attempt:", key)
      return false
    }
  }

  return true
}

/**
 * Secure event listener wrapper
 */
export function secureEventListener<K extends keyof WindowEventMap>(
  target: Window | Document | HTMLElement,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
): () => void {
  // Wrap handler with security checks
  const secureHandler = (e: Event) => {
    // Validate event is trusted (not synthetic)
    if (!e.isTrusted) {
      console.warn("[Security] Untrusted event blocked:", event)
      return
    }

    // Check if event target is valid
    if (!e.target || !(e.target instanceof Node)) {
      console.warn("[Security] Invalid event target:", event)
      return
    }

    handler(e as WindowEventMap[K])
  }

  target.addEventListener(event, secureHandler as EventListener, options)

  // Return cleanup function
  return () => {
    target.removeEventListener(event, secureHandler as EventListener, options)
  }
}

/**
 * Prevents multi-tab race conditions with distributed locking
 */
export class TabLock {
  private lockKey: string
  private lockId: string
  private lockTimeout: number

  constructor(resource: string, timeout = 5000) {
    this.lockKey = `lock:${resource}`
    this.lockId = crypto.randomBytes(16).toString("hex")
    this.lockTimeout = timeout
  }

  async acquire(): Promise<boolean> {
    const now = Date.now()
    const stored = localStorage.getItem(this.lockKey)

    if (stored) {
      const lock = JSON.parse(stored)

      // Check if lock is expired
      if (now - lock.timestamp < this.lockTimeout) {
        return false // Lock held by another tab
      }
    }

    // Acquire lock
    localStorage.setItem(this.lockKey, JSON.stringify({ id: this.lockId, timestamp: now }))

    // Verify we got the lock (handle race condition)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const verify = localStorage.getItem(this.lockKey)
    if (!verify) return false

    const verifyLock = JSON.parse(verify)
    return verifyLock.id === this.lockId
  }

  release(): void {
    const stored = localStorage.getItem(this.lockKey)
    if (!stored) return

    const lock = JSON.parse(stored)
    if (lock.id === this.lockId) {
      localStorage.removeItem(this.lockKey)
    }
  }
}

/**
 * Detects and prevents browser extension manipulation
 */
export function detectExtensionTampering(): boolean {
  if (typeof window === "undefined") return false

  // Check for common extension injection points
  const suspiciousGlobals = ["__REACT_DEVTOOLS_GLOBAL_HOOK__", "__REDUX_DEVTOOLS_EXTENSION__"]

  for (const global of suspiciousGlobals) {
    if ((window as any)[global]) {
      // DevTools are OK in development
      if (process.env.NODE_ENV === "development") continue

      console.warn("[Security] Browser extension detected:", global)
      return true
    }
  }

  // Check if DOM has been modified by extensions
  const scripts = document.querySelectorAll("script[src]")
  for (const script of scripts) {
    const src = script.getAttribute("src")
    if (src && (src.startsWith("chrome-extension://") || src.startsWith("moz-extension://"))) {
      console.warn("[Security] Extension script injection detected")
      return true
    }
  }

  return false
}

/**
 * Secure cookie setter with proper flags
 */
export function setSecureCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number
    path?: string
    sameSite?: "strict" | "lax" | "none"
    secure?: boolean
  } = {},
): void {
  const { maxAge = 86400, path = "/", sameSite = "strict", secure = true } = options

  const cookieParts = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    `path=${path}`,
    `samesite=${sameSite}`,
  ]

  if (secure) {
    cookieParts.push("secure")
  }

  document.cookie = cookieParts.join("; ")
}
