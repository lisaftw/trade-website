import { z } from "zod"

// Input sanitization utilities
export function sanitizeString(input: string, maxLength = 1000): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, "") // Remove potential XSS characters
}

export function sanitizeMongoQuery(query: string): string {
  // Escape special MongoDB regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Validation schemas
export const tradeInteractionSchema = z.object({
  message: z.string().min(1).max(500),
})

export const profileUpdateSchema = z.object({
  bio: z.string().max(512).optional(),
  theme_preference: z.enum(["light", "dark", "system"]).optional(),
  is_public: z.boolean().optional(),
  show_email: z.boolean().optional(),
  show_activity: z.boolean().optional(),
})

export const tradeUpdateSchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]),
})

export const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  game: z.string().max(50).optional(),
})

// UUID validation
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// MongoDB ObjectId validation
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
