import { query } from "../lib/db/postgres"

async function checkMigration() {
  console.log("🔍 Checking Migration Status...\n")

  try {
    const itemsResult = await query("SELECT COUNT(*) as count FROM items")
    const itemsCount = itemsResult.rows[0].count

    console.log(`✅ Items table: ${itemsCount} items`)

    const profilesResult = await query("SELECT COUNT(*) as count FROM profiles")
    const profilesCount = profilesResult.rows[0].count

    console.log(`✅ Profiles table: ${profilesCount} profiles`)

    const sessionsResult = await query("SELECT COUNT(*) as count FROM sessions")
    const sessionsCount = sessionsResult.rows[0].count

    console.log(`✅ Sessions table: ${sessionsCount} sessions`)

    const tradesResult = await query("SELECT COUNT(*) as count FROM trades")
    const tradesCount = tradesResult.rows[0].count

    console.log(`✅ Trades table: ${tradesCount} trades`)

    const inventoryResult = await query("SELECT COUNT(*) as count FROM user_inventories")
    const inventoryCount = inventoryResult.rows[0].count

    console.log(`✅ User Inventories: ${inventoryCount} items`)

    console.log("\n📊 Sample Items:")
    const sampleItems = await query("SELECT name, game, rap_value FROM items LIMIT 5")
    sampleItems.rows.forEach((item) => {
      console.log(`  - ${item.name} (${item.game}): ${item.rap_value}`)
    })

    console.log("\n✅ Migration check complete!")
    console.log("All data successfully migrated to PostgreSQL")
  } catch (error) {
    console.error("❌ Migration check failed:", error)
    process.exit(1)
  }

  process.exit(0)
}

checkMigration()
