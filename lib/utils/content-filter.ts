// Comprehensive content filtering utility for slurs and inappropriate content

const SLUR_PATTERNS = [
  // Racial slurs
  /\bn+[i1!|]+[g9]+[e3a@]+r+s?\b/gi,
  /\bc+h+[i1!|]+n+k+s?\b/gi,
  /\bc+r+[a@]+c+k+[e3a@]+r+s?\b/gi,
  /\bg+[o0]+[o0]+k+s?\b/gi,
  /\bk+[i1!|]+k+[e3a@]+s?\b/gi,
  /\bs+p+[i1!|]+c+s?\b/gi,
  /\bw+[e3a@]+t+b+[a@]+c+k+s?\b/gi,
  /\bb+[e3a@]+[a@]+n+[e3a@]+r+s?\b/gi,

  // Homophobic slurs
  /\bf+[a@]+[g9]+[g9]*[o0]*t+s?\b/gi,
  /\bd+y+k+[e3a@]+s?\b/gi,
  /\bqu+[e3a@]+[e3a@]+r+s?\b/gi,
  /\bt+r+[a@]+n+n+[yi1!|]+s?\b/gi,

  // Ableist slurs
  /\br+[e3a@]+t+[a@]+r+d+[e3a@]*[d]*s?\b/gi,
  /\bm+[o0]+n+g+[o0]+l+[o0]+[i1!|]+d+s?\b/gi,
  /\bc+r+[i1!|]+p+p*l+[e3a@]+[d]*s?\b/gi,

  // Gendered slurs
  /\bc+u+n+t+s?\b/gi,
  /\bb+[i1!|]+t+c+h+s?\b/gi,
  /\bw+h+[o0]+r+[e3a@]+s?\b/gi,
  /\bs+l+u+t+s?\b/gi,

  // General hate speech patterns
  /\bk+y+s+\b/gi, // "kill yourself"
  /\bn+[a@]+z+[i1!|]+s?\b/gi,
  /\bh+[i1!|]+t+l+[e3a@]+r+\b/gi,
]

/**
 * Checks if text contains blacklisted slurs or hate speech
 * @param text - The text to check
 * @returns true if inappropriate content is found, false otherwise
 */
export function containsSlurs(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false
  }

  // Normalize text by removing extra spaces and special characters used to bypass filters
  const normalizedText = text
    .toLowerCase()
    .replace(/[_\-\s]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")

  // Check against all slur patterns
  for (const pattern of SLUR_PATTERNS) {
    if (pattern.test(normalizedText) || pattern.test(text)) {
      return true
    }
  }

  return false
}

/**
 * Validates text content and returns error message if inappropriate content is found
 * @param text - The text to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns null if valid, error message string if invalid
 */
export function validateContent(text: string, fieldName = "content"): string | null {
  if (containsSlurs(text)) {
    return `Your ${fieldName} contains inappropriate language. Please remove offensive content and try again.`
  }
  return null
}

/**
 * Sanitizes text by censoring detected slurs
 * @param text - The text to sanitize
 * @returns Sanitized text with slurs replaced by asterisks
 */
export function sanitizeContent(text: string): string {
  if (!text || typeof text !== "string") {
    return text
  }

  let sanitized = text

  for (const pattern of SLUR_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => "*".repeat(match.length))
  }

  return sanitized
}
