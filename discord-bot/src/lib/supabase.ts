import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials not found in environment variables")
  console.error("Please ensure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file")
  throw new Error("Missing Supabase credentials")
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to get items table
export async function getItemsTable() {
  return supabase.from("items")
}
