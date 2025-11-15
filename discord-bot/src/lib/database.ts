import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config()

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  console.error("❌ DATABASE_URL or POSTGRES_URL environment variable is not set")
  console.error("Please ensure you have a .env file in the discord-bot directory with:")
  console.error("DATABASE_URL=your_postgres_connection_string")
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create PostgreSQL connection
export const sql = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Helper function to test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Additional updates can be added here if needed
