import { query } from "../postgres"

export type Session = {
  id: string
  discord_id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string
  last_activity_at: string
  created_at: string
  updated_at: string
}

export async function createSession(data: {
  discordId: string
  accessToken: string
  refreshToken: string | null
  tokenExpiresAt: Date
}): Promise<string> {
  
  await query("DELETE FROM sessions WHERE discord_id = $1", [data.discordId])

  const result = await query<{ id: string }>(
    `INSERT INTO sessions (discord_id, access_token, refresh_token, token_expires_at, last_activity_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id`,
    [data.discordId, data.accessToken, data.refreshToken, data.tokenExpiresAt],
  )

  return result.rows[0].id
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const result = await query<Session>("SELECT * FROM sessions WHERE id = $1", [sessionId])
  return result.rows[0] || null
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  await query("UPDATE sessions SET last_activity_at = NOW() WHERE id = $1", [sessionId])
}

export async function updateSessionTokens(
  sessionId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date,
): Promise<void> {
  await query(
    `UPDATE sessions 
     SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = NOW()
     WHERE id = $4`,
    [accessToken, refreshToken, tokenExpiresAt, sessionId],
  )
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query("DELETE FROM sessions WHERE id = $1", [sessionId])
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query("DELETE FROM sessions WHERE token_expires_at < NOW() RETURNING id")
  return result.rowCount || 0
}
