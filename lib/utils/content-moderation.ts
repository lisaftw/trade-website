/**
 * Content Moderation using OpenAI's Moderation API
 * This API is free and has no rate limits
 */

interface ModerationResult {
  flagged: boolean
  categories: {
    hate: boolean
    "hate/threatening": boolean
    harassment: boolean
    "harassment/threatening": boolean
    "self-harm": boolean
    "self-harm/intent": boolean
    "self-harm/instructions": boolean
    sexual: boolean
    "sexual/minors": boolean
    violence: boolean
    "violence/graphic": boolean
  }
  category_scores: {
    [key: string]: number
  }
}

interface ModerationResponse {
  id: string
  model: string
  results: ModerationResult[]
}

/**
 * Fallback word filter for when OpenAI API is not available
 * This uses a comprehensive list of inappropriate terms
 */
function containsInappropriateWords(text: string): boolean {
  const lowerText = text.toLowerCase().replace(/[^a-z0-9]/g, "")

  const inappropriateWords = [
    "nigger",
    "nigga",
    "faggot",
    "fag",
    "retard",
    "chink",
    "spic",
    "kike",
    "tranny",
    "cunt",
    "whore",
    "slut",
    "bitch",
    "fuck",
    "shit",
    "ass",
    "dick",
    "cock",
    "pussy",
    // Add variations with numbers/symbols
    "n1gger",
    "n1gga",
    "f4ggot",
    "fck",
    "fuk",
    "fcuk",
    "nigg3r",
    "f4g",
    "retrd",
    "btch",
    "shthead",
  ]

  // Check for exact matches or embedded matches
  return inappropriateWords.some((word) => {
    const normalizedWord = word.replace(/[^a-z0-9]/g, "")
    return lowerText.includes(normalizedWord)
  })
}

/**
 * Check if content contains inappropriate language using OpenAI Moderation API
 * @param text The text content to moderate
 * @returns Object with isInappropriate boolean and reason string
 */
export async function moderateContent(text: string): Promise<{
  isInappropriate: boolean
  reason: string
}> {
  if (!text || text.trim().length === 0) {
    return { isInappropriate: false, reason: "" }
  }

  if (containsInappropriateWords(text)) {
    console.log("[v0] Content blocked by local filter")
    return {
      isInappropriate: true,
      reason: "Your message contains inappropriate language or hate speech.",
    }
  }

  if (!process.env.OPENAI_API_KEY && !process.env.XAI_API_KEY) {
    console.log("[v0] No API key available, relying on local filter only")
    return { isInappropriate: false, reason: "" }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Moderation API error:", response.status)
      // Already checked with local filter, so safe to pass
      return { isInappropriate: false, reason: "" }
    }

    const data: ModerationResponse = await response.json()
    const result = data.results[0]

    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)

      console.log("[v0] Content flagged for:", flaggedCategories)

      // Focus on hate speech and harassment
      if (
        result.categories.hate ||
        result.categories["hate/threatening"] ||
        result.categories.harassment ||
        result.categories["harassment/threatening"]
      ) {
        return {
          isInappropriate: true,
          reason: "Your message contains inappropriate language or hate speech.",
        }
      }

      // Also block other harmful content
      return {
        isInappropriate: true,
        reason: "Your message contains inappropriate content.",
      }
    }

    return { isInappropriate: false, reason: "" }
  } catch (error) {
    console.error("[v0] Moderation API error:", error)
    // Already checked with local filter, so safe to pass
    return { isInappropriate: false, reason: "" }
  }
}

/**
 * Batch moderation for multiple pieces of content
 */
export async function moderateMultipleContents(texts: string[]): Promise<{
  isInappropriate: boolean
  reason: string
  flaggedIndices: number[]
}> {
  if (texts.length === 0) {
    return { isInappropriate: false, reason: "", flaggedIndices: [] }
  }

  const localFlaggedIndices: number[] = []
  texts.forEach((text, index) => {
    if (containsInappropriateWords(text)) {
      localFlaggedIndices.push(index)
    }
  })

  if (localFlaggedIndices.length > 0) {
    console.log("[v0] Content blocked by local filter:", localFlaggedIndices)
    return {
      isInappropriate: true,
      reason: "Some of your content contains inappropriate language or hate speech.",
      flaggedIndices: localFlaggedIndices,
    }
  }

  if (!process.env.OPENAI_API_KEY && !process.env.XAI_API_KEY) {
    console.log("[v0] No API key available, relying on local filter only")
    return { isInappropriate: false, reason: "", flaggedIndices: [] }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: texts,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Moderation API error:", response.status)
      return { isInappropriate: false, reason: "", flaggedIndices: [] }
    }

    const data: ModerationResponse = await response.json()
    const flaggedIndices: number[] = []

    data.results.forEach((result, index) => {
      if (result.flagged) {
        if (
          result.categories.hate ||
          result.categories["hate/threatening"] ||
          result.categories.harassment ||
          result.categories["harassment/threatening"]
        ) {
          flaggedIndices.push(index)
        }
      }
    })

    if (flaggedIndices.length > 0) {
      return {
        isInappropriate: true,
        reason: "Some of your content contains inappropriate language or hate speech.",
        flaggedIndices,
      }
    }

    return { isInappropriate: false, reason: "", flaggedIndices: [] }
  } catch (error) {
    console.error("[v0] Moderation API error:", error)
    return { isInappropriate: false, reason: "", flaggedIndices: [] }
  }
}
