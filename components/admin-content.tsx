"use client"

import type React from "react"
import Link from "next/link"
import { Upload, BarChart3 } from 'lucide-react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from 'lucide-react'
import { useUser } from "@/lib/hooks/use-user"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const GAMES = ["MM2", "SAB", "Adopt Me"] as const

export function AdminContent() {
  const { user, isLoading } = useUser()
  const [game, setGame] = useState<string>("Adopt Me") // Default to Adopt Me
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [rapValue, setRapValue] = useState("")
  const [existCount, setExistCount] = useState("")
  const [changePercent, setChangePercent] = useState("")
  const [rating, setRating] = useState("5.0")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [deleteItemName, setDeleteItemName] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">You must be logged in to access the admin panel.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game,
          name,
          image_url: imageUrl || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(name)}`,
          rap_value: Number.parseFloat(rapValue),
          exist_count: Number.parseInt(existCount) || 0,
          change_percent: Number.parseFloat(changePercent) || 0,
          rating: Number.parseFloat(rating) || 5.0,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create item")
      }

      setMessage({ type: "success", text: "Item created successfully!" })
      // Reset form
      setName("")
      setImageUrl("")
      setRapValue("")
      setExistCount("")
      setChangePercent("")
      setRating("5.0")
    } catch (error) {
      console.error("[v0] Create error:", error)
      setMessage({ type: "error", text: "Failed to create item. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setDeleting(true)
    setDeleteMessage(null)

    try {
      const res = await fetch("/api/admin/delete-sab-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: deleteItemName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete item")
      }

      setDeleteMessage({ type: "success", text: data.message })
      setDeleteItemName("")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      setDeleteMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Tabs defaultValue="manage" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manage">Manage Items</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="space-y-6">
        {/* Bulk Image Migration Tool */}
        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">Bulk Image Migration</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload new images for items with expired Discord CDN URLs
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/migrate-images">
              <Upload className="mr-2 h-4 w-4" />
              Open Migration Tool
            </Link>
          </Button>
        </div>

        {/* Delete SAB Item section */}
        <div className="rounded-lg border border-destructive/50 bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-destructive">Delete SAB Item</h2>

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Item Name</label>
              <Input
                type="text"
                value={deleteItemName}
                onChange={(e) => setDeleteItemName(e.target.value)}
                placeholder="e.g., corrupt"
                required
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Enter the exact name of the SAB item you want to delete.
              </p>
            </div>

            {deleteMessage && (
              <div
                className={`rounded-md border p-3 text-sm ${
                  deleteMessage.type === "success"
                    ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-destructive/50 bg-destructive/10 text-destructive"
                }`}
              >
                {deleteMessage.text}
              </div>
            )}

            <Button type="submit" disabled={deleting} variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete Item"}
            </Button>
          </form>
        </div>

        {/* Existing Add Item section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Add New Item</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Game</label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  required
                >
                  {GAMES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Item Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Shadow Dragon"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">RAP Value</label>
                <Input
                  type="number"
                  step="0.01"
                  value={rapValue}
                  onChange={(e) => setRapValue(e.target.value)}
                  placeholder="e.g., 150000.00"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Exist Count</label>
                <Input
                  type="number"
                  value={existCount}
                  onChange={(e) => setExistCount(e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Change Percent</label>
                <Input
                  type="number"
                  step="0.01"
                  value={changePercent}
                  onChange={(e) => setChangePercent(e.target.value)}
                  placeholder="e.g., 5.2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Rating (0-10)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="e.g., 9.5"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Image URL (optional)</label>
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Leave blank to auto-generate placeholder"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                If left blank, a placeholder will be generated based on the item name.
              </p>
            </div>

            {message && (
              <div
                className={`rounded-md border p-3 text-sm ${
                  message.type === "success"
                    ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-destructive/50 bg-destructive/10 text-destructive"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {saving ? "Creating..." : "Create Item"}
            </Button>
          </form>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsDashboard />
      </TabsContent>
    </Tabs>
  )
}
