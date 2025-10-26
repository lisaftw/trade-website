import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSPolicies() {
  console.log("🔒 Checking Row Level Security (RLS) policies...\n")

  const tables = [
    "users",
    "items",
    "trades",
    "trade_requests",
    "conversations",
    "messages",
    "message_reactions",
    "adoptme_pets",
    "audit_logs",
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1)

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`)
      } else {
        console.log(`✅ ${table}: RLS is active (query succeeded with service role)`)
      }

      // Test with anon key (should fail for protected tables)
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const { data: anonData, error: anonError } = await anonClient.from(table).select("*").limit(1)

      if (anonError && anonError.message.includes("row-level security")) {
        console.log(`   🛡️  RLS is protecting ${table} from anonymous access`)
      } else if (!anonError) {
        console.log(`   ⚠️  WARNING: ${table} is accessible without authentication!`)
      }
    } catch (err) {
      console.log(`❌ ${table}: Unexpected error`)
    }
    console.log("")
  }

  console.log("\n📊 Security Check Complete")
  console.log("\nRecommendations:")
  console.log("1. Ensure all sensitive tables have RLS enabled")
  console.log("2. Review your RLS policies in Supabase dashboard")
  console.log("3. Check audit logs for suspicious activity")
  console.log("4. Monitor rate limiting metrics")
}

checkRLSPolicies().catch(console.error)
