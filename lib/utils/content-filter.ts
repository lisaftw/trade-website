// Comprehensive content filtering utility for slurs and inappropriate content

const SLUR_LIST = [
  // Racial slurs
  "nigger",
  "nigga",
  "niga",
  "nigg",
  "negro",
  "chink",
  "coon",
  "cracker",
  "gook",
  "kike",
  "spic",
  "wetback",
  "beaner",
  "towelhead",
  "sandnigger",
  "camel jockey",

  // Homophobic slurs
  "faggot",
  "fag",
  "dyke",
  "tranny",

  // Ableist slurs
  "retard",
  "retarded",
  "mongoloid",
  "spaz",
  "midget",

  // General hate speech
  "kys",
  "kill yourself",
  "hitler",
]

const CHAR_SUBSTITUTIONS: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "1": "i",
  "!": "i",
  "|": "i",
  "0": "o",
  "9": "g",
  "5": "s",
  $: "s",
  "7": "t",
  "+": "t",
  "8": "b",
}

/**
 * Normalizes text to catch obfuscation attempts
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase()

  // Remove zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "")

  // Replace character substitutions
  for (const [char, replacement] of Object.entries(CHAR_SUBSTITUTIONS)) {
    normalized = normalized.replace(new RegExp(`\\${char}`, "g"), replacement)
  }

  // Remove special characters and extra spaces
  normalized = normalized.replace(/[_\-.*#^~`]+/g, "")
  normalized = normalized.replace(/\s+/g, " ")

  return normalized.trim()
}

/**
 * Checks if text contains blacklisted slurs or hate speech
 * @param text - The text to check
 * @returns true if inappropriate content is found, false otherwise
 */
export function containsSlurs(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false
  }

  const originalLower = text.toLowerCase()
  const normalized = normalizeText(text)

  console.log("[v0] Content filter checking:", {
    original: text,
    normalized,
    originalLower,
  })

  for (const slur of SLUR_LIST) {
    // Check if slur exists as a word (with word boundaries)
    const wordPattern = new RegExp(`\\b${slur}\\b`, "i")
    const containsPattern = new RegExp(slur, "i")

    // Check original text
    if (wordPattern.test(originalLower) || containsPattern.test(originalLower)) {
      console.log("[v0] Slur detected in original:", slur)
      return true
    }

    // Check normalized text
    if (wordPattern.test(normalized) || containsPattern.test(normalized)) {
      console.log("[v0] Slur detected in normalized:", slur)
      return true
    }

    // Check if slur appears with spaces between characters (e.g., "n i g g e r")
    const spacedSlur = slur.split("").join("\\s*")
    const spacedPattern = new RegExp(spacedSlur, "i")
    if (spacedPattern.test(originalLower)) {
      console.log("[v0] Spaced slur detected:", slur)
      return true
    }
  }

  console.log("[v0] No slurs detected")
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

  for (const slur of SLUR_LIST) {
    const pattern = new RegExp(`\\b${slur}\\b`, "gi")
    sanitized = sanitized.replace(pattern, (match) => "*".repeat(match.length))
  }

  return sanitized
}
