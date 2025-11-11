import { Pool, type PoolClient, type QueryResult } from "pg"

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required")
    }

    const connectionStringWithSSL = connectionString.includes("?")
      ? `${connectionString}&sslmode=disable`
      : `${connectionString}?sslmode=disable`

    pool = new Pool({
      connectionString: connectionStringWithSSL,
      max: 100,
      min: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      maxUses: 7500,
      allowExitOnIdle: false,
    })

    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err)
    })
  }

  return pool
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getPool()
  const start = Date.now()

  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start

    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100))
    }

    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log("Database pool closed")
  }
}

if (typeof process !== "undefined") {
  process.on("SIGTERM", async () => {
    await closePool()
  })

  process.on("SIGINT", async () => {
    await closePool()
  })
}
