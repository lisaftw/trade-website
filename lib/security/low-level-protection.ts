import { timingSafeEqual } from "crypto"

// Maximum sizes to prevent memory exhaustion
export const MAX_JSON_SIZE = 1024 * 1024 // 1MB
export const MAX_ARRAY_LENGTH = 1000
export const MAX_STRING_LENGTH = 10000
export const MAX_REGEX_LENGTH = 100

// ReDoS protection - safe regex patterns
const SAFE_PATTERNS = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

export function safeRegexTest(pattern: keyof typeof SAFE_PATTERNS, input: string): boolean {
  if (input.length > MAX_STRING_LENGTH) return false
  return SAFE_PATTERNS[pattern].test(input)
}

// Prevent ReDoS by limiting regex complexity
export function sanitizeRegexInput(input: string): string {
  if (input.length > MAX_REGEX_LENGTH) {
    input = input.slice(0, MAX_REGEX_LENGTH)
  }

  // Escape special regex characters
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Safe JSON parsing with size limits
export function safeJsonParse<T>(json: string, maxSize: number = MAX_JSON_SIZE): T | null {
  try {
    // Check size before parsing
    const byteSize = new TextEncoder().encode(json).length
    if (byteSize > maxSize) {
      throw new Error("JSON payload too large")
    }

    const parsed = JSON.parse(json)

    // Validate parsed object doesn't have excessive nesting or size
    if (!validateObjectComplexity(parsed)) {
      throw new Error("JSON structure too complex")
    }

    return parsed
  } catch (error) {
    console.error("Safe JSON parse failed:", error)
    return null
  }
}

// Validate object complexity to prevent JSON bombs
function validateObjectComplexity(obj: any, depth = 0, maxDepth = 10): boolean {
  if (depth > maxDepth) return false

  if (Array.isArray(obj)) {
    if (obj.length > MAX_ARRAY_LENGTH) return false
    return obj.every((item) => validateObjectComplexity(item, depth + 1, maxDepth))
  }

  if (obj && typeof obj === "object") {
    const keys = Object.keys(obj)
    if (keys.length > MAX_ARRAY_LENGTH) return false
    return keys.every((key) => validateObjectComplexity(obj[key], depth + 1, maxDepth))
  }

  if (typeof obj === "string" && obj.length > MAX_STRING_LENGTH) return false

  return true
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to prevent timing leak on length
    const bufferA = Buffer.from(a, "utf8")
    const bufferB = Buffer.from(b.padEnd(a.length, "0"), "utf8")
    try {
      return timingSafeEqual(bufferA, bufferB)
    } catch {
      return false
    }
  }

  const bufferA = Buffer.from(a, "utf8")
  const bufferB = Buffer.from(b, "utf8")

  try {
    return timingSafeEqual(bufferA, bufferB)
  } catch {
    return false
  }
}

// Unicode normalization to prevent homograph attacks
export function normalizeUnicode(input: string): string {
  // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
  let normalized = input.normalize("NFC")

  // Remove zero-width characters and other invisible characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "")

  // Remove null bytes
  normalized = normalized.replace(/\0/g, "")

  // Limit to printable ASCII and common Unicode ranges
  normalized = normalized.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, "")

  return normalized
}

// Validate and sanitize numeric inputs to prevent integer overflow
export function safeParseInt(
  value: string | number,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): number | null {
  const num = typeof value === "string" ? Number.parseInt(value, 10) : value

  if (Number.isNaN(num)) return null
  if (!Number.isFinite(num)) return null
  if (num < min || num > max) return null

  return num
}

export function safeParseFloat(
  value: string | number,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): number | null {
  const num = typeof value === "string" ? Number.parseFloat(value) : value

  if (Number.isNaN(num)) return null
  if (!Number.isFinite(num)) return null
  if (num < min || num > max) return null

  return num
}

// HTTP Parameter Pollution protection
export function getSingleParam(url: URL, param: string): string | null {
  const values = url.searchParams.getAll(param)

  if (values.length === 0) return null
  if (values.length > 1) {
    console.warn(`Multiple values detected for parameter: ${param}`)
    return null // Reject requests with duplicate parameters
  }

  return values[0]
}

// Path traversal protection
export function sanitizePath(path: string): string {
  // Remove null bytes
  path = path.replace(/\0/g, "")

  // Remove path traversal attempts
  path = path.replace(/\.\./g, "")
  path = path.replace(/\/\//g, "/")

  // Normalize path
  path = path.normalize("NFC")

  return path
}

// Validate array bounds
export function validateArrayBounds<T>(arr: T[], maxLength: number = MAX_ARRAY_LENGTH): boolean {
  return Array.isArray(arr) && arr.length <= maxLength
}

// Deep clone with protection against prototype pollution
export function safeDeepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => safeDeepClone(item)) as unknown as T
  }

  const cloned: any = {}

  for (const key in obj) {
    // Skip prototype properties
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = safeDeepClone((obj as any)[key])
    }
  }

  return cloned
}

// Validate integer bounds
export function validateInteger(
  value: number,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): number {
  if (!Number.isInteger(value)) {
    throw new Error("Value must be an integer")
  }
  if (value < min || value > max) {
    throw new Error(`Value must be between ${min} and ${max}`)
  }
  return value
}

// Sanitize input to prevent various attacks
export function sanitizeInput(input: string): string {
  // Normalize Unicode to prevent homograph attacks
  let sanitized = normalizeUnicode(input)

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length
  if (sanitized.length > MAX_STRING_LENGTH) {
    sanitized = sanitized.slice(0, MAX_STRING_LENGTH)
  }

  return sanitized
}
