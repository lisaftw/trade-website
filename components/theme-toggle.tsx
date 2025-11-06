"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") || "light"
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
      const effectiveDark = saved === "dark" || (saved === "system" && prefersDark)
      document.documentElement.classList.toggle("dark", effectiveDark)
      setIsDark(effectiveDark)
    } catch {}
  }, [])

  const toggle = () => {
    const next = isDark ? "light" : "dark"
    document.documentElement.classList.toggle("dark", next === "dark")
    localStorage.setItem("theme", next)
    setIsDark(next === "dark")
  }

  return (
    <Button
      onClick={toggle}
      variant="secondary"
      size="icon"
      className="h-9 w-9 rounded-full border border-border bg-secondary/40 hover:bg-secondary/60"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
