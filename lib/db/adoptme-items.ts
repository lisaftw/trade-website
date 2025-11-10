import { query } from "./postgres"

export interface AdoptMePetValue {
  id: string
  name: string
  game: "Adopt Me"
  section: string
  baseValue: number
  neonValue: number
  megaValue: number
  flyBonus?: number
  rideBonus?: number
  image_url?: string
  rarity?: string
  demand?: string
  lastValueUpdate?: Date
  valueNotes?: string
  created_at?: Date
  updated_at?: Date
}

export async function getAdoptMePets(): Promise<AdoptMePetValue[]> {
  try {
    const result = await query<any>(
      `SELECT 
        id,
        name,
        game,
        section,
        rap_value as "baseValue",
        image_url,
        rarity,
        demand,
        created_at,
        updated_at
      FROM items 
      WHERE game = 'Adopt Me' AND name NOT LIKE 'Neon %' AND name NOT LIKE 'Mega %'
      ORDER BY rap_value DESC`,
    )

    const pets: AdoptMePetValue[] = []

    for (const row of result.rows) {
      const neonResult = await query<any>(`SELECT rap_value FROM items WHERE game = 'Adopt Me' AND name = $1`, [
        `Neon ${row.name}`,
      ])

      const megaResult = await query<any>(`SELECT rap_value FROM items WHERE game = 'Adopt Me' AND name = $1`, [
        `Mega ${row.name}`,
      ])

      pets.push({
        ...row,
        baseValue: row.baseValue || 0,
        neonValue: neonResult.rows[0]?.rap_value || 0,
        megaValue: megaResult.rows[0]?.rap_value || 0,
        flyBonus: 50,
        rideBonus: 50,
      })
    }

    return pets
  } catch (error) {
    console.error("Error fetching Adopt Me pets:", error)
    return []
  }
}

export async function updatePetValue(
  id: string,
  variant: "base" | "neon" | "mega",
  newValue: number,
  changedBy?: string,
  reason?: string,
): Promise<boolean> {
  try {
    if (variant === "base") {
      await query(`UPDATE items SET rap_value = $1, updated_at = NOW() WHERE id = $2`, [newValue, id])
    } else {
      const petResult = await query<{ name: string }>(`SELECT name FROM items WHERE id = $1`, [id])

      if (petResult.rows.length === 0) return false

      const petName = petResult.rows[0].name
      const variantName = variant === "neon" ? `Neon ${petName}` : `Mega ${petName}`

      await query(`UPDATE items SET rap_value = $1, updated_at = NOW() WHERE name = $2 AND game = 'Adopt Me'`, [
        newValue,
        variantName,
      ])
    }

    return true
  } catch (error) {
    console.error("Error updating pet value:", error)
    return false
  }
}

export async function createAdoptMePet(
  pet: Omit<AdoptMePetValue, "id" | "created_at" | "updated_at" | "lastValueUpdate">,
): Promise<AdoptMePetValue | null> {
  try {
    const baseResult = await query<any>(
      `INSERT INTO items (name, rap_value, game, section, image_url, rarity, demand)
       VALUES ($1, $2, 'Adopt Me', $3, $4, $5, $6)
       RETURNING *`,
      [pet.name, pet.baseValue, pet.section, pet.image_url || "", pet.rarity, pet.demand],
    )

    await query(
      `INSERT INTO items (name, rap_value, game, section, image_url, rarity, demand)
       VALUES ($1, $2, 'Adopt Me', $3, $4, $5, $6)`,
      [`Neon ${pet.name}`, pet.neonValue, pet.section, pet.image_url || "", pet.rarity, pet.demand],
    )

    await query(
      `INSERT INTO items (name, rap_value, game, section, image_url, rarity, demand)
       VALUES ($1, $2, 'Adopt Me', $3, $4, $5, $6)`,
      [`Mega ${pet.name}`, pet.megaValue, pet.section, pet.image_url || "", pet.rarity, pet.demand],
    )

    return {
      id: baseResult.rows[0].id,
      ...pet,
      created_at: baseResult.rows[0].created_at,
      updated_at: baseResult.rows[0].updated_at,
    }
  } catch (error) {
    console.error("Error creating Adopt Me pet:", error)
    return null
  }
}
