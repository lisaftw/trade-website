import { neon } from "@neondatabase/serverless"

async function checkItems() {
  const sql = neon(process.env.POSTGRES_URL!)

  const result = await sql`
    SELECT game, COUNT(*) as count 
    FROM items 
    GROUP BY game 
    ORDER BY game
  `

  console.log("\n=== Items in Database ===")
  console.table(result)

  const total = await sql`SELECT COUNT(*) as total FROM items`
  console.log(`\nTotal items: ${total[0].total}\n`)
}

checkItems()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
