"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function SiteAccessProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid token
    const checkAccess = async () => {
      const token = localStorage.getItem("site-access-token")

      // If no token and not on site-access page, redirect
      if (!token && window.location.pathname !== "/site-access") {
        router.push("/site-access")
        return
      }

      // If we have a token, verify it's still valid
      if (token && window.location.pathname !== "/site-access") {
        try {
          const response = await fetch(`/api/site-access?token=${token}`)
          const data = await response.json()

          if (!data.valid) {
            localStorage.removeItem("site-access-token")
            router.push("/site-access")
          }
        } catch (error) {
          console.error("[v0] Token verification failed:", error)
        }
      }

      // If on site-access page with valid token, redirect home
      if (token && window.location.pathname === "/site-access") {
        router.push("/")
      }
    }

    checkAccess()
  }, [router])

  return <>{children}</>
}
