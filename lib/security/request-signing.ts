import { createHmac } from "crypto"

const SIGNING_SECRET = process.env.REQUEST_SIGNING_SECRET || "change-this-in-production"

/**
 * Signs a request payload with HMAC
 */
export function signRequest(payload: any, timestamp: number): string {
  const data = JSON.stringify(payload) + timestamp.toString()
  return createHmac("sha256", SIGNING_SECRET).update(data).digest("hex")
}

/**
 * Verifies a signed request
 */
export function verifySignature(
  payload: any,
  timestamp: number,
  signature: string,
  maxAge = 300000, // 5 minutes
): boolean {
  // Check timestamp to prevent replay attacks
  const now = Date.now()
  if (now - timestamp > maxAge) {
    return false
  }

  const expectedSignature = signRequest(payload, timestamp)

  // Timing-safe comparison
  if (signature.length !== expectedSignature.length) return false

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }

  return result === 0
}
