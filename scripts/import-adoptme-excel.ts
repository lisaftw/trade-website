import * as XLSX from "xlsx"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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
  PetName?: string
  ImageURL?: string
  Rarity?: string
  Demand?: string
  Base?: number
  FR?: number
  R?: number
  H?: number
  NFR?: number
  NP?: number
  NR?: number
  N?: number
  MFR?: number
  MF?: number
  MR?: number
  M?: number
}

interface AdoptMePetItem {
  game: string
  name: string
  section: string
  image_url: string
  rap_value: number
  rarity: string
  demand: string
  value_fr: number
  value_r: number
  value_h: number
  value_nfr: number
  value_np: number
  value_nr: number
  value_n: number
  value_mfr: number
  value_mf: number
  value_mr: number
  value_m: number
  rating: number
  change_percent: number
  exist_count: number
}

async function importAdoptMePets() {
  try {
    // Read the Excel file
    const filePath = path.join(process.cwd(), "adm.xlsx")

    if (!fs.existsSync(filePath)) {
      console.error("❌ Error: adm.xlsx file not found in project root")
      console.log("\n📝 Please place your adm.xlsx file in the project root directory")
      process.exit(1)
    }

    console.log("📖 Reading Excel file...")
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

    console.log(`✅ Found ${data.length} pets in Excel file\n`)

    console.log("🗑️  Clearing existing Adopt Me pets...")
    const { error: deleteError } = await supabase.from("items").delete().eq("game", "Adopt Me")

    if (deleteError) {
      console.error("Error clearing existing items:", deleteError)
    } else {
      console.log("   Cleared existing Adopt Me items\n")
    }

    // Transform and validate pets
    const pets: AdoptMePetItem[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowNum = index + 2 // +2 because Excel is 1-indexed and has header row

      // Check for Pet Name field
      if (!row.PetName) {
        errors.push(`Row ${rowNum}: Missing Pet Name`)
        return
      }

      const rarity = row.Rarity || "Unknown"
      let section = "Pets"
      if (rarity.toLowerCase().includes("legendary")) section = "Legendary"
      else if (rarity.toLowerCase().includes("ultra")) section = "Ultra-Rare"
      else if (rarity.toLowerCase().includes("rare")) section = "Rare"
      else if (rarity.toLowerCase().includes("uncommon")) section = "Uncommon"
      else if (rarity.toLowerCase().includes("common")) section = "Common"

      pets.push({
        game: "Adopt Me",
        name: row.PetName,
        section,
        image_url: row.ImageURL || "",
        rap_value: Number(row.Base) || 0,
        rarity: row.Rarity || "",
        demand: row.Demand || "",
        value_fr: Number(row.FR) || 0,
        value_r: Number(row.R) || 0,
        value_h: Number(row.H) || 0,
        value_nfr: Number(row.NFR) || 0,
        value_np: Number(row.NP) || 0,
        value_nr: Number(row.NR) || 0,
        value_n: Number(row.N) || 0,
        value_mfr: Number(row.MFR) || 0,
        value_mf: Number(row.MF) || 0,
        value_mr: Number(row.MR) || 0,
        value_m: Number(row.M) || 0,
        rating: 0,
        change_percent: 0,
        exist_count: 0,
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

    console.log(`💾 Importing ${pets.length} pets to Supabase...`)
    const { data: insertedData, error: insertError } = await supabase.from("items").insert(pets).select()

    if (insertError) {
      console.error("❌ Error importing pets:", insertError)
      process.exit(1)
    }

    console.log(`\n✅ Successfully imported ${pets.length} Adopt Me pets!\n`)

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
      console.log(`     Base Value: ${pet.rap_value}`)
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
