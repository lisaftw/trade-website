"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

export function DiscordMemberCount() {
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMemberCount() {
      try {
        console.log("Fetching Discord member count...")
        const response = await fetch("/api/discord/members")

        if (!response.ok) {
          console.error("Discord API returned non-OK status:", response.status)
          setMemberCount(10000) // Fallback
          setIsLoading(false)
          return
        }

        const data = await response.json()
        console.log("Discord member count data:", data)

        setMemberCount(data.memberCount)
      } catch (error) {
        console.error("Error fetching member count:", error)
        setMemberCount(10000) // Fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberCount()

    // Refresh every 5 minutes
    const interval = setInterval(fetchMemberCount, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`
    }
    return count.toString()
  }

  return (
    <a
      href="https://discord.gg/j44ZNCWVkW"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-2xl border border-border bg-secondary/20 p-4 transition-all hover:border-brand/50 hover:bg-secondary/30 hover:shadow-lg hover:shadow-brand/10"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Community Members</p>
          <p className="mt-1 text-xl font-semibold">
            {isLoading ? <span className="animate-pulse">Loading...</span> : formatCount(memberCount || 10000)}
          </p>
        </div>
        <Users className="h-5 w-5 text-brand/60 transition-colors group-hover:text-brand" />
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </span>
        <span className="text-[10px] text-muted-foreground">Live count • Click to join</span>
      </div>
    </a>
  )
}
