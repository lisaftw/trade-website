"use client"

import { useEffect, useState } from "react"

type User = {
  discordId: string
  username: string | null
  globalName: string | null
  avatarUrl: string | null
  email: string | null
} | null

export function useUser() {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/user/me")
      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("[v0] Failed to fetch user:", err)
      setError("Failed to load user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      window.location.href = "/"
    } catch (err) {
      console.error("[v0] Logout failed:", err)
    }
  }

  return { user, loading, error, refetch: fetchUser, logout }
}
