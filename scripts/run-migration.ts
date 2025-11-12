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

async function runMigration() {
  const sqlPath = path.join(__dirname, "add-adoptme-columns.sql")
  const sql = fs.readFileSync(sqlPath, "utf-8")

  console.log("Running migration to add Adopt Me columns...")

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!response.ok) {
    console.error("Migration failed. You need to run the SQL manually.")
    console.log("\n📝 Please run this SQL in your Supabase SQL Editor:")
    console.log("\n" + sql)
    console.log("\nOr you can skip the migration and run the import - it will work if columns already exist.")
    process.exit(1)
  }

  console.log("Migration completed successfully!")
}

runMigration().catch(console.error)
