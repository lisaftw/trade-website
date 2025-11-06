import { query } from "../postgres"
import { cache } from "../cache"

export type Trade = {
  id: string
  discord_id: string
  game: string
  offering: string
  requesting: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export type TradeWithCreator = Trade & {
  creator: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
}

export async function createTrade(data: {
  discordId: string
  game: string
  offering: any[]
  requesting: any[]
  notes?: string
}): Promise<Trade> {
  const result = await query<Trade>(
    `INSERT INTO trades (discord_id, game, offering, requesting, notes, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [data.discordId, data.game, JSON.stringify(data.offering), JSON.stringify(data.requesting), data.notes || null],
  )

  cache.deletePattern("trades:*")

  return result.rows[0]
}

export async function getActiveTrades(game?: string): Promise<Trade[]> {
  const cacheKey = game ? `trades:active:${game}` : "trades:active:all"
  const cached = cache.get<Trade[]>(cacheKey)

  if (cached) {
    return cached
  }

  let sql = `SELECT * FROM trades WHERE status = 'active'`
  const params: any[] = []

  if (game) {
    sql += " AND game = $1"
    params.push(game)
  }

  sql += " ORDER BY created_at DESC"

  const result = await query<Trade>(sql, params)

  cache.set(cacheKey, result.rows, 30) 
  return result.rows
}

export async function getUserTrades(discordId: string): Promise<Trade[]> {
  const result = await query<Trade>(
    `SELECT * FROM trades 
     WHERE discord_id = $1 
     ORDER BY created_at DESC`,
    [discordId],
  )

  return result.rows
}

export async function getTradeById(tradeId: string): Promise<Trade | null> {
  const result = await query<Trade>("SELECT * FROM trades WHERE id = $1", [tradeId])

  return result.rows[0] || null
}

export async function deleteTrade(tradeId: string, discordId: string): Promise<boolean> {
  const result = await query("DELETE FROM trades WHERE id = $1 AND discord_id = $2", [tradeId, discordId])

  cache.deletePattern("trades:*")

  return (result.rowCount || 0) > 0
}

export async function updateTrade(
  tradeId: string,
  discordId: string,
  updates: Partial<Pick<Trade, "offering" | "requesting" | "notes" | "status">>,
): Promise<Trade | null> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.offering) {
    fields.push(`offering = $${paramIndex}`)
    values.push(JSON.stringify(updates.offering))
    paramIndex++
  }

  if (updates.requesting) {
    fields.push(`requesting = $${paramIndex}`)
    values.push(JSON.stringify(updates.requesting))
    paramIndex++
  }

  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex}`)
    values.push(updates.notes)
    paramIndex++
  }

  if (updates.status) {
    fields.push(`status = $${paramIndex}`)
    values.push(updates.status)
    paramIndex++
  }

  if (fields.length === 0) {
    return getTradeById(tradeId)
  }

  values.push(tradeId, discordId)

  const result = await query<Trade>(
    `UPDATE trades 
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${paramIndex} AND discord_id = $${paramIndex + 1}
     RETURNING *`,
    values,
  )

  cache.deletePattern("trades:*")

  return result.rows[0] || null
}
