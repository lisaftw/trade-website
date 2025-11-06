"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthorized(Boolean(d.authorized)))
      .catch(() => setAuthorized(false))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!r.ok) throw new Error("Invalid password")
      setAuthorized(true)
    } catch (e: any) {
      setError(e.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  if (authorized === null) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">Checking access…</div>
    )
  }
  if (!authorized) {
    return (
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-3 rounded-lg border bg-card p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Admin Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full hover:opacity-90">
          {loading ? "Signing in…" : "Enter Admin"}
        </Button>
      </form>
    )
  }
  return <>{children}</>
}
