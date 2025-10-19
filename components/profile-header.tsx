"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks/use-user"

export function ProfileHeader() {
  const { user } = useUser()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
      const effective = saved === "dark" || (saved === "system" && prefersDark) ? "dark" : "light"
      document.documentElement.classList.toggle("dark", effective === "dark")
      setTheme(effective)
    } catch {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
    }
  }, [])

  const displayName = user?.globalName || user?.username || "Guest"
  const avatarUrl = user?.avatarUrl || "/placeholder.svg?height=64&width=64"

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/20 p-4">
      <Image src={avatarUrl || "/placeholder.svg"} alt={displayName} width={96} height={96} className="rounded-full" />
      <div className="flex-1">
        <p className="text-base font-semibold leading-tight">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          Theme: <span className="font-medium">{theme}</span>
        </p>
      </div>
      {/* theme is displayed here; no toggle per requirements */}
    </div>
  )
}
