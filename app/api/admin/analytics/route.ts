import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db/postgres"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  // Check admin authorization
  const adminSession = cookies().get("admin_session")?.value
  if (adminSession !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "all"

    let timeCondition = ""
    switch (timeframe) {
      case "24h":
        timeCondition = "WHERE created_at >= NOW() - INTERVAL '24 hours'"
        break
      case "7d":
        timeCondition = "WHERE created_at >= NOW() - INTERVAL '7 days'"
        break
      case "30d":
        timeCondition = "WHERE created_at >= NOW() - INTERVAL '30 days'"
        break
    }

    // User statistics
    const totalUsersResult = await query("SELECT COUNT(*) as count FROM profiles")
    const totalUsers = Number(totalUsersResult.rows[0].count)

    const activeUsersResult = await query(
      `SELECT COUNT(DISTINCT discord_id) as count FROM activities ${timeCondition}`,
    )
    const activeUsers = Number(activeUsersResult.rows[0].count)

    const newUsersResult = await query(`SELECT COUNT(*) as count FROM profiles ${timeCondition}`)
    const newUsers = Number(newUsersResult.rows[0].count)

    const recentLoginsResult = await query(`SELECT COUNT(*) as count FROM activities WHERE type = 'login' ${timeCondition}`)
    const recentLogins = Number(recentLoginsResult.rows[0].count)

    // Trade statistics
    const totalTradesResult = await query(`SELECT COUNT(*) as count FROM trades ${timeCondition}`)
    const totalTrades = Number(totalTradesResult.rows[0].count)

    const activeTradesResult = await query(`SELECT COUNT(*) as count FROM trades WHERE status = 'active' ${timeCondition}`)
    const activeTrades = Number(activeTradesResult.rows[0].count)

    const completedTradesResult = await query(
      `SELECT COUNT(*) as count FROM trades WHERE status = 'completed' ${timeCondition}`,
    )
    const completedTrades = Number(completedTradesResult.rows[0].count)

    // Item statistics
    const totalItemsResult = await query("SELECT COUNT(*) as count FROM items")
    const totalItems = Number(totalItemsResult.rows[0].count)

    const adoptmeItemsResult = await query("SELECT COUNT(*) as count FROM items WHERE game = 'Adopt Me'")
    const adoptmeItems = Number(adoptmeItemsResult.rows[0].count)

    const mm2ItemsResult = await query("SELECT COUNT(*) as count FROM items WHERE game = 'MM2'")
    const mm2Items = Number(mm2ItemsResult.rows[0].count)

    const sabItemsResult = await query("SELECT COUNT(*) as count FROM items WHERE game = 'SAB'")
    const sabItems = Number(sabItemsResult.rows[0].count)

    // Activity breakdown
    const activityBreakdownResult = await query(
      `SELECT type, COUNT(*) as count FROM activities ${timeCondition} GROUP BY type ORDER BY count DESC LIMIT 10`,
    )
    const activityBreakdown = activityBreakdownResult.rows.map((row) => ({
      type: row.type,
      count: Number(row.count),
    }))

    // Most active users
    const mostActiveUsersResult = await query(`
      SELECT 
        a.discord_id,
        p.username,
        p.global_name,
        COUNT(*) as activity_count
      FROM activities a
      LEFT JOIN profiles p ON a.discord_id = p.discord_id
      ${timeCondition}
      GROUP BY a.discord_id, p.username, p.global_name
      ORDER BY activity_count DESC
      LIMIT 10
    `)
    const mostActiveUsers = mostActiveUsersResult.rows.map((row) => ({
      discordId: row.discord_id,
      username: row.username || "Unknown",
      globalName: row.global_name,
      activityCount: Number(row.activity_count),
    }))

    // Recent registrations
    const recentRegistrationsResult = await query(`
      SELECT discord_id, username, global_name, created_at
      FROM profiles
      ORDER BY created_at DESC
      LIMIT 10
    `)
    const recentRegistrations = recentRegistrationsResult.rows.map((row) => ({
      discordId: row.discord_id,
      username: row.username,
      globalName: row.global_name,
      createdAt: row.created_at,
    }))

    return NextResponse.json({
      timeframe,
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        logins: recentLogins,
      },
      trades: {
        total: totalTrades,
        active: activeTrades,
        completed: completedTrades,
      },
      items: {
        total: totalItems,
        adoptMe: adoptmeItems,
        mm2: mm2Items,
        sab: sabItems,
      },
      activityBreakdown,
      mostActiveUsers,
      recentRegistrations,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
