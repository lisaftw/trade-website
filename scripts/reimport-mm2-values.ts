import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"
import { fileURLToPath } from "url"
import * as fs from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "..", ".env") })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface MM2Item {
  chroma: boolean
  display_name: string
  item_type: string
  value: number
  thumbnail: string
  rarity: string
}

async function reimportMM2Items() {
  // Read the values.json file
  const valuesPath = path.join(__dirname, "..", "values.json")

  if (!fs.existsSync(valuesPath)) {
    console.error("values.json not found! Please place it in the project root.")
    process.exit(1)
  }

  const rawData = fs.readFileSync(valuesPath, "utf-8")
  const data: Record<string, MM2Item> = JSON.parse(rawData)

  const items = Object.entries(data)
  console.log(`Found ${items.length} MM2 items to import`)

  let successCount = 0
  let errorCount = 0

  for (const [key, item] of items) {
    // Convert thumbnail ID to Roblox CDN URL
    const imageUrl = `https://assetdelivery.roblox.com/v1/asset/?id=${item.thumbnail}`

    const dbItem = {
      game: "MM2",
      name: item.display_name,
      section: item.item_type, // Gun or Knife
      image_url: imageUrl,
      rap_value: item.value,
      rarity: item.rarity,
      rating: 0,
      change_percent: 0,
      exist_count: 0,
    }

    const { error } = await supabase.from("items").insert(dbItem)

    if (error) {
      console.error(`Failed to import ${item.display_name}:`, error.message)
      errorCount++
    } else {
      console.log(`✓ Imported: ${item.display_name} (${item.item_type}) - Value: ${item.value}`)
      successCount++
    }
  }

  console.log("\n=== Import Complete ===")
  console.log(`Successfully imported: ${successCount} items`)
  console.log(`Failed: ${errorCount} items`)
}

reimportMM2Items().catch(console.error)
