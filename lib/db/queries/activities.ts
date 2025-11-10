import { query } from "../postgres"

export type Activity = {
  id: string
  discord_id: string
  type: string
  meta: any
  created_at: string
}

/**
 * Log an activity
 */
export async function logActivity(discordId: string, type: string, meta?: any): Promise<void> {
  await query("INSERT INTO activities (discord_id, type, meta) VALUES ($1, $2, $3)", [
    discordId,
    type,
    meta ? JSON.stringify(meta) : null,
  ])
}

/**
 * Get user activities
 */
export async function getUserActivities(discordId: string, limit = 50): Promise<Activity[]> {
  const result = await query<Activity>(
    `SELECT * FROM activities 
     WHERE discord_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [discordId, limit],
  )

  return result.rows
}
