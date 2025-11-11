"use client"

import useSWR from "swr"
import { useCallback } from "react"

type User = {
  discordId: string
  username: string | null
  globalName: string | null
  avatarUrl: string | null
  email: string | null
} | null

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) {
      return { user: null }
    }
    throw new Error("Failed to fetch user")
  }
  return res.json()
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/api/user/me", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    focusThrottleInterval: 60000,
  })

  const user = data?.user ?? null

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      mutate({ user: null }, false)
      try {
        localStorage.removeItem("user_logged_in")
      } catch {}
      window.location.href = "/"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }, [mutate])

  const refetch = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    user,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    logout,
  }
}
