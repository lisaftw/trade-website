"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Activity, TrendingUp, ShoppingCart } from 'lucide-react'

type Timeframe = "24h" | "7d" | "30d" | "all"

interface AnalyticsData {
  timeframe: string
  users: {
    total: number
    active: number
    new: number
    logins: number
  }
  trades: {
    total: number
    active: number
    completed: number
  }
  items: {
    total: number
    adoptMe: number
    mm2: number
    sab: number
  }
  activityBreakdown: Array<{ type: string; count: number }>
  mostActiveUsers: Array<{
    discordId: string
    username: string
    globalName: string
    activityCount: number
  }>
  recentRegistrations: Array<{
    discordId: string
    username: string
    globalName: string
    createdAt: string
  }>
}

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("all")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  async function fetchAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`)
      if (!res.ok) throw new Error("Failed to fetch analytics")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const timeframeLabels: Record<Timeframe, string> = {
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    all: "All Time",
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">{error || "Failed to load analytics"}</p>
        <Button onClick={fetchAnalytics} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex flex-wrap gap-2">
        {(["24h", "7d", "30d", "all"] as Timeframe[]).map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(tf)}
          >
            {timeframeLabels[tf]}
          </Button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.users.new} new {timeframe !== "all" ? `in ${timeframeLabels[timeframe].toLowerCase()}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{data.users.logins} logins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.trades.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.trades.active} active, {data.trades.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.items.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.items.adoptMe} Adopt Me, {data.items.mm2} MM2, {data.items.sab} SAB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
          <CardDescription>Top activity types {timeframe !== "all" && `for ${timeframeLabels[timeframe].toLowerCase()}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.activityBreakdown.map((activity) => (
              <div key={activity.type} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{activity.type.replace(/_/g, " ")}</span>
                <span className="text-sm text-muted-foreground">{activity.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most active users */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
          <CardDescription>Users with highest activity {timeframe !== "all" && `in ${timeframeLabels[timeframe].toLowerCase()}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.mostActiveUsers.map((user) => (
              <div key={user.discordId} className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <p className="text-sm font-medium">{user.globalName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <span className="text-sm font-bold">{user.activityCount} actions</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>Latest users to join the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentRegistrations.map((user) => (
              <div key={user.discordId} className="flex items-center justify-between rounded-lg border p-2">
                <div>
                  <p className="text-sm font-medium">{user.globalName || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
