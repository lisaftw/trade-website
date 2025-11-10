import { query } from "../postgres"
import { cache, cachedQuery } from "../cache"

export type Profile = {
  discord_id: string
  username: string | null
  global_name: string | null
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

/**
 * Get profile by Discord ID (cached)
 */
export async function getProfile(discordId: string): Promise<Profile | null> {
  return cachedQuery(
    `profile:${discordId}`,
    async () => {
      const result = await query<Profile>("SELECT * FROM profiles WHERE discord_id = $1", [discordId])
      return result.rows[0] || null
    },
    300, // Cache for 5 minutes
  )
}

/**
 * Upsert profile
 */
export async function upsertProfile(profile: Partial<Profile> & { discord_id: string }): Promise<Profile> {
  const result = await query<Profile>(
    `INSERT INTO profiles (discord_id, username, global_name, avatar_url, email)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (discord_id) 
     DO UPDATE SET 
       username = EXCLUDED.username,
       global_name = EXCLUDED.global_name,
       avatar_url = EXCLUDED.avatar_url,
       email = EXCLUDED.email,
       updated_at = NOW()
     RETURNING *`,
    [
      profile.discord_id,
      profile.username || null,
      profile.global_name || null,
      profile.avatar_url || null,
      profile.email || null,
    ],
  )

  // Invalidate cache
  cache.delete(`profile:${profile.discord_id}`)

  return result.rows[0]
}

/**
 * Update profile
 */
export async function updateProfile(
  discordId: string,
  updates: Partial<Omit<Profile, "discord_id" | "created_at" | "updated_at">>,
): Promise<Profile | null> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${paramIndex}`)
    values.push(value)
    paramIndex++
  })

  if (fields.length === 0) {
    return getProfile(discordId)
  }

  values.push(discordId)

  const result = await query<Profile>(
    `UPDATE profiles 
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE discord_id = $${paramIndex}
     RETURNING *`,
    values,
  )

  // Invalidate cache
  cache.delete(`profile:${discordId}`)

  return result.rows[0] || null
}
