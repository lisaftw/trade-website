import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNFValues() {
  console.log("🔍 Checking NF values in database...\n")

  const { data: pets, error } = await supabase
    .from("items")
    .select("name, rap_value, value_f, value_nf, value_n, value_fr")
    .eq("game", "Adopt Me")
    .limit(10)

  if (error) {
    console.error("Error:", error)
    process.exit(1)
  }

  console.log("Sample pets with their values:\n")
  pets?.forEach((pet) => {
    console.log(`📦 ${pet.name}`)
    console.log(`   Base: ${pet.rap_value}`)
    console.log(`   F: ${pet.value_f}`)
    console.log(`   FR: ${pet.value_fr}`)
    console.log(`   N: ${pet.value_n}`)
    console.log(`   NF: ${pet.value_nf || "❌ NULL/MISSING"}`)
    console.log()
  })

  const { data: nfCount } = await supabase
    .from("items")
    .select("name", { count: "exact", head: true })
    .eq("game", "Adopt Me")
    .not("value_nf", "is", null)
    .gt("value_nf", 0)

  console.log(`\n📊 Pets with NF values > 0: ${nfCount?.length || 0}`)
}

checkNFValues()
