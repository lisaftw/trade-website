import { Pool, type PoolClient, type QueryResult } from "pg"

// Singleton pool instance
let pool: Pool | null = null

/**
 * Get or create PostgreSQL connection pool
 * Optimized for high concurrency (5000+ users)
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required")
    }

    pool = new Pool({
      connectionString,
      // Connection pool settings optimized for high traffic
      max: 100, // Maximum number of clients in the pool
      min: 10, // Minimum number of clients to keep in pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Timeout after 10 seconds if no connection available
      maxUses: 7500, // Close and replace a connection after it has been used 7500 times

      // Performance optimizations
      allowExitOnIdle: false, // Keep pool alive

      // SSL configuration for production
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("[v0] Unexpected database pool error:", err)
    })

    // Log pool stats for monitoring
    pool.on("connect", () => {
      console.log("[v0] New database client connected")
    })

    pool.on("remove", () => {
      console.log("[v0] Database client removed from pool")
    })
  }

  return pool
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const pool = getPool()
  const start = Date.now()

  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`[v0] Slow query (${duration}ms):`, text.substring(0, 100))
    }

    return result
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Execute a transaction
 */
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

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log("[v0] Database pool closed")
  }
}

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("SIGTERM", async () => {
    await closePool()
  })

  process.on("SIGINT", async () => {
    await closePool()
  })
}
