"use client"

import { useEffect, useState, useCallback, useRef } from "react"

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
  const fetchingRef = useRef(false)

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) {
      console.log("[v0] Skipping duplicate user fetch request")
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      const res = await fetch("/api/user/me", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
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
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_logged_in" && e.storageArea === localStorage) {
        console.log("[v0] User login detected in another window, refetching")
        fetchUser()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [fetchUser])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      try {
        localStorage.removeItem("user_logged_in")
      } catch {}
      window.location.href = "/"
    } catch (err) {
      console.error("[v0] Logout failed:", err)
    }
  }

  return { user, loading, error, refetch: fetchUser, logout }
}
