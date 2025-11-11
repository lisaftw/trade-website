import { query } from "@/lib/db/postgres"

export interface Item {
  id: string
  name: string
  rap_value: number
  game: string
  section?: string
  image_url?: string
  rarity?: string
  demand?: string
  pot?: string
  neon_value?: number
  mega_value?: number
  fly_bonus?: number
  ride_bonus?: number
  exist_count?: number
  rating?: number
  change_percent?: number
  created_at?: Date
  updated_at?: Date
  last_updated_at?: Date
}

export async function getItems(game?: string): Promise<Item[]> {
  try {
    const sql = game
      ? `SELECT * FROM items WHERE game = $1 ORDER BY rap_value DESC NULLS LAST`
      : `SELECT * FROM items ORDER BY rap_value DESC NULLS LAST`

    const params = game ? [game] : []
    const result = await query(sql, params)

    return result.rows
  } catch (error) {
    console.error("Error fetching items:", error)
    return []
  }
}

export async function searchItems(searchQuery: string, game?: string): Promise<Item[]> {
  try {
    const sql = game
      ? `SELECT * FROM items 
         WHERE name ILIKE $1 AND game = $2 
         ORDER BY rap_value DESC NULLS LAST
         LIMIT 20`
      : `SELECT * FROM items 
         WHERE name ILIKE $1 
         ORDER BY rap_value DESC NULLS LAST
         LIMIT 20`

    const params = game ? [`%${searchQuery}%`, game] : [`%${searchQuery}%`]
    const result = await query(sql, params)

    return result.rows
  } catch (error) {
    console.error("Error searching items:", error)
    return []
  }
}

export async function getItemById(id: string): Promise<Item | null> {
  try {
    const result = await query(`SELECT * FROM items WHERE id = $1`, [id])

    return result.rows[0] || null
  } catch (error) {
    console.error("Error fetching item by ID:", error)
    return null
  }
}

export async function createItem(item: Omit<Item, "id" | "created_at" | "updated_at">): Promise<Item | null> {
  try {
    const result = await query(
      `INSERT INTO items (
        name, rap_value, game, section, image_url,
        rarity, demand, pot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [item.name, item.rap_value, item.game, item.section, item.image_url, item.rarity, item.demand, item.pot],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating item:", error)
    return null
  }
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<boolean> {
  try {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const values = Object.values(updates)

    await query(`UPDATE items SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id, ...values])

    return true
  } catch (error) {
    console.error("Error updating item:", error)
    return false
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    await query(`DELETE FROM items WHERE id = $1`, [id])
    return true
  } catch (error) {
    console.error("Error deleting item:", error)
    return false
  }
}
