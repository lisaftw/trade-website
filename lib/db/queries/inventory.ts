import { query } from "../postgres"
import { cache } from "../cache"

export type UserInventory = {
  id: string
  discord_id: string
  item_id: string
  quantity: number
  created_at: string
  updated_at: string
}

/**
 * Get user's inventory (cached)
 */
export async function getUserInventory(discordId: string): Promise<UserInventory[]> {
  const cacheKey = `inventory:${discordId}`
  const cached = cache.get<UserInventory[]>(cacheKey)

  if (cached) {
    return cached
  }

  const result = await query<UserInventory>(
    `SELECT id, discord_id, item_id, quantity, created_at, updated_at
     FROM user_inventories
     WHERE discord_id = $1
     ORDER BY created_at DESC`,
    [discordId],
  )

  cache.set(cacheKey, result.rows, 60) // Cache for 1 minute
  return result.rows
}

/**
 * Add item to inventory or update quantity
 */
export async function addToInventory(discordId: string, itemId: string, quantity = 1): Promise<void> {
  // Check if item already exists
  const existingResult = await query<{ id: string; quantity: number }>(
    "SELECT id, quantity FROM user_inventories WHERE discord_id = $1 AND item_id = $2",
    [discordId, itemId],
  )

  if (existingResult.rows.length > 0) {
    // Update existing
    const existing = existingResult.rows[0]
    await query(
      `UPDATE user_inventories 
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2`,
      [existing.quantity + quantity, existing.id],
    )
  } else {
    // Insert new
    await query(
      `INSERT INTO user_inventories (discord_id, item_id, quantity)
       VALUES ($1, $2, $3)`,
      [discordId, itemId, quantity],
    )
  }

  // Invalidate cache
  cache.delete(`inventory:${discordId}`)
}

/**
 * Remove item from inventory
 */
export async function removeFromInventory(discordId: string, inventoryId: string): Promise<boolean> {
  const result = await query("DELETE FROM user_inventories WHERE id = $1 AND discord_id = $2", [inventoryId, discordId])

  // Invalidate cache
  cache.delete(`inventory:${discordId}`)

  return (result.rowCount || 0) > 0
}
