import clientPromise from "@/lib/mongodb"
import type { ObjectId } from "mongodb"

export interface AdoptMePetValue {
  _id?: ObjectId
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

  lastValueUpdate: Date
  valueNotes?: string 

  valueHistory?: Array<{
    variant: "base" | "neon" | "mega"
    oldValue: number
    newValue: number
    changedAt: Date
    changedBy?: string
    reason?: string
  }>

  createdAt?: Date
  updatedAt?: Date
}

export async function getAdoptMePets(): Promise<AdoptMePetValue[]> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<AdoptMePetValue>("adoptme_pets")

    const pets = await collection.find({ game: "Adopt Me" }).sort({ baseValue: -1 }).toArray()

    return pets.map((pet) => ({
      ...pet,
      _id: pet._id,
      
      baseValue: pet.baseValue || 0,
      neonValue: pet.neonValue || 0,
      megaValue: pet.megaValue || 0,
      flyBonus: pet.flyBonus || 50,
      rideBonus: pet.rideBonus || 50,
    }))
  } catch (error) {
    console.error(" Error fetching Adopt Me pets:", error)
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
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<AdoptMePetValue>("adoptme_pets")
    const { ObjectId } = await import("mongodb")

    const currentPet = await collection.findOne({ _id: new ObjectId(id) })
    if (!currentPet) return false

    const fieldName = variant === "base" ? "baseValue" : variant === "neon" ? "neonValue" : "megaValue"
    const oldValue = currentPet[fieldName] || 0

    const historyEntry = {
      variant,
      oldValue,
      newValue,
      changedAt: new Date(),
      changedBy,
      reason,
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          [fieldName]: newValue,
          lastValueUpdate: new Date(),
          updatedAt: new Date(),
        },
        $push: {
          valueHistory: historyEntry,
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(" Error updating pet value:", error)
    return false
  }
}

export async function createAdoptMePet(
  pet: Omit<AdoptMePetValue, "_id" | "createdAt" | "updatedAt" | "lastValueUpdate">,
): Promise<AdoptMePetValue | null> {
  try {
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<AdoptMePetValue>("adoptme_pets")

    const newPet = {
      ...pet,
      game: "Adopt Me" as const,
      lastValueUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      valueHistory: [],
    }

    const result = await collection.insertOne(newPet)

    return {
      ...newPet,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error(" Error creating Adopt Me pet:", error)
    return null
  }
}
