import * as XLSX from "xlsx"
import clientPromise from "../lib/mongodb"
import * as fs from "fs"
import * as path from "path"

/**
 * Script to import Adopt Me pets from Excel file (adm.xlsx)
 *
 * Expected Excel columns (in this exact order):
 * 1. Pet Name
 * 2. Image URL
 * 3. Rarity
 * 4. Demand
 * 5. Base Value (No Pot) - Base value without potions
 * 6. FR - Fly Ride value
 * 7. F - Fly only value
 * 8. R - Ride only value
 * 9. NFR - Neon Fly Ride value
 * 10. NF - Neon Fly value
 * 11. NR - Neon Ride value
 * 12. N - Neon (no potion) value
 * 13. MFR - Mega Fly Ride value
 * 14. MF - Mega Fly value
 * 15. MR - Mega Ride value
 * 16. M - Mega (no potion) value
 *
 * Usage: npm run import:adoptme
 */

interface ExcelRow {
  "Pet Name"?: string
  "Image URL"?: string
  Rarity?: string
  Demand?: string
  "Base Value (No Pot)"?: number
  FR?: number
  F?: number
  R?: number
  NFR?: number
  NF?: number
  NR?: number
  N?: number
  MFR?: number
  MF?: number
  MR?: number
  M?: number
}

interface AdoptMePetDocument {
  name: string
  game: "Adopt Me"
  section: string
  image_url: string
  rarity: string
  demand: string

  // Base values (no potion)
  baseValue: number

  // Base with potions
  baseValueFR: number // Fly Ride
  baseValueF: number // Fly only
  baseValueR: number // Ride only

  // Neon values
  neonValue: number // No potion
  neonValueFR: number // Fly Ride
  neonValueF: number // Fly only
  neonValueR: number // Ride only

  // Mega values
  megaValue: number // No potion
  megaValueFR: number // Fly Ride
  megaValueF: number // Fly only
  megaValueR: number // Ride only

  lastValueUpdate: Date
  createdAt: Date
  updatedAt: Date
}

async function importAdoptMePets() {
  try {
    // Read the Excel file
    const filePath = path.join(process.cwd(), "adm.xlsx")

    if (!fs.existsSync(filePath)) {
      console.error("❌ Error: adm.xlsx file not found in project root")
      console.log("\n📝 Please place your adm.xlsx file in the project root directory")
      console.log("📋 Use the template: scripts/adoptme-template.csv")
      process.exit(1)
    }

    console.log("📖 Reading Excel file...")
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

    console.log(`✅ Found ${data.length} pets in Excel file\n`)

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("trading-db")
    const collection = db.collection<AdoptMePetDocument>("adoptme_pets")

    // Clear existing Adopt Me pets
    console.log("🗑️  Clearing existing Adopt Me pets...")
    const deleteResult = await collection.deleteMany({ game: "Adopt Me" })
    console.log(`   Deleted ${deleteResult.deletedCount} existing pets\n`)

    // Transform and validate pets
    const pets: AdoptMePetDocument[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowNum = index + 2 // +2 because Excel is 1-indexed and has header row

      // Validate required fields
      if (!row["Pet Name"]) {
        errors.push(`Row ${rowNum}: Missing Pet Name`)
        return
      }

      // Determine section from rarity
      const rarity = row.Rarity || "Unknown"
      let section = "Unknown"
      if (rarity.toLowerCase().includes("legendary")) section = "Legendary"
      else if (rarity.toLowerCase().includes("ultra")) section = "Ultra-Rare"
      else if (rarity.toLowerCase().includes("rare")) section = "Rare"
      else if (rarity.toLowerCase().includes("uncommon")) section = "Uncommon"
      else if (rarity.toLowerCase().includes("common")) section = "Common"

      pets.push({
        name: row["Pet Name"],
        game: "Adopt Me",
        section,
        image_url: row["Image URL"] || "/adopt-me-pet.jpg",
        rarity: rarity,
        demand: row.Demand || "Medium",

        // Base values
        baseValue: Number(row["Base Value (No Pot)"]) || 0,
        baseValueFR: Number(row.FR) || 0,
        baseValueF: Number(row.F) || 0,
        baseValueR: Number(row.R) || 0,

        // Neon values
        neonValue: Number(row.N) || 0,
        neonValueFR: Number(row.NFR) || 0,
        neonValueF: Number(row.NF) || 0,
        neonValueR: Number(row.NR) || 0,

        // Mega values
        megaValue: Number(row.M) || 0,
        megaValueFR: Number(row.MFR) || 0,
        megaValueF: Number(row.MF) || 0,
        megaValueR: Number(row.MR) || 0,

        lastValueUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    // Show errors if any
    if (errors.length > 0) {
      console.log("⚠️  Validation Errors:")
      errors.forEach((error) => console.log(`   ${error}`))
      console.log()
    }

    if (pets.length === 0) {
      console.error("❌ No valid pets to import")
      process.exit(1)
    }

    // Import to MongoDB
    console.log(`💾 Importing ${pets.length} pets to MongoDB...`)
    const result = await collection.insertMany(pets)

    console.log(`\n✅ Successfully imported ${result.insertedCount} Adopt Me pets!\n`)

    // Show summary by section
    const sections = pets.reduce(
      (acc, pet) => {
        acc[pet.section] = (acc[pet.section] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("📊 Import Summary:")
    Object.entries(sections).forEach(([section, count]) => {
      console.log(`   ${section}: ${count} pets`)
    })

    console.log("\n🎉 Sample imported pets:")
    pets.slice(0, 3).forEach((pet) => {
      console.log(`   • ${pet.name} (${pet.section})`)
      console.log(`     Base: ${pet.baseValue} | FR: ${pet.baseValueFR}`)
      console.log(`     Neon: ${pet.neonValue} | NFR: ${pet.neonValueFR}`)
      console.log(`     Mega: ${pet.megaValue} | MFR: ${pet.megaValueFR}`)
    })

    console.log("\n✨ Import complete!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error importing Adopt Me pets:", error)
    process.exit(1)
  }
}

// Run the import
importAdoptMePets()
