import { createClient } from "@supabase/supabase-js"

/**
 * Key Rotation Script
 *
 * This script helps you safely rotate API keys and credentials.
 * Run this after updating environment variables to verify everything works.
 */

async function verifySupabaseConnection() {
  console.log("🔍 Verifying Supabase connection...")

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables")
    return false
  }

  try {
    // Test anon key
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { error: anonError } = await anonClient.from("users").select("count").limit(1)

    if (anonError) {
      console.error("❌ Anon key test failed:", anonError.message)
      return false
    }
    console.log("✅ Anon key working")

    // Test service role key
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    const { error: serviceError } = await serviceClient.from("users").select("count").limit(1)

    if (serviceError) {
      console.error("❌ Service role key test failed:", serviceError.message)
      return false
    }
    console.log("✅ Service role key working")

    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}

async function verifyMongoDBConnection() {
  console.log("🔍 Verifying MongoDB connection...")

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error("❌ Missing MONGODB_URI environment variable")
    return false
  }

  try {
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(mongoUri)

    await client.connect()
    await client.db().admin().ping()
    await client.close()

    console.log("✅ MongoDB connection working")
    return true
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    return false
  }
}

async function verifyDiscordOAuth() {
  console.log("🔍 Verifying Discord OAuth credentials...")

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("❌ Missing Discord OAuth environment variables")
    return false
  }

  try {
    // Test Discord OAuth endpoint
    const response = await fetch("https://discord.com/api/oauth2/applications/@me", {
      headers: {
        Authorization: `Bot ${clientSecret}`,
      },
    })

    if (!response.ok) {
      console.error("❌ Discord OAuth test failed")
      return false
    }

    console.log("✅ Discord OAuth credentials working")
    return true
  } catch (error) {
    console.error("❌ Discord OAuth verification failed:", error)
    return false
  }
}

async function main() {
  console.log("🔐 Starting Key Rotation Verification\n")

  const results = {
    supabase: await verifySupabaseConnection(),
    mongodb: await verifyMongoDBConnection(),
    discord: await verifyDiscordOAuth(),
  }

  console.log("\n📊 Verification Results:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`Supabase:  ${results.supabase ? "✅ PASS" : "❌ FAIL"}`)
  console.log(`MongoDB:   ${results.mongodb ? "✅ PASS" : "❌ FAIL"}`)
  console.log(`Discord:   ${results.discord ? "✅ PASS" : "❌ FAIL"}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

  const allPassed = Object.values(results).every((result) => result)

  if (allPassed) {
    console.log("\n✅ All keys verified successfully!")
    console.log("You can now safely revoke the old keys.")
  } else {
    console.log("\n❌ Some keys failed verification.")
    console.log("Do NOT revoke old keys until all tests pass.")
    process.exit(1)
  }
}

main().catch(console.error)
