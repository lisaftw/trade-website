"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Check, X, ImageIcon, Search } from "lucide-react"
import { useUser } from "@/lib/hooks/use-user"

interface Item {
  id: string
  name: string
  game: string
  image_url: string
  rap_value: number
  exist_count: number
}

interface UploadMatch {
  file: File
  itemId: string
  game: string
  itemName: string
  preview: string
}

export function BulkImageMigration() {
  const { user, isLoading } = useUser()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [matches, setMatches] = useState<UploadMatch[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/admin/items-needing-images")
        const data = await res.json()
        setItems(data.items || [])
        setFilteredItems(data.items || [])
      } catch (error) {
        console.error("[v0] Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        items.filter((item) => item.name.toLowerCase().includes(query) || item.game.toLowerCase().includes(query)),
      )
    }
  }, [searchQuery, items])

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newMatches: UploadMatch[] = []

      Array.from(files).forEach((file) => {
        // Try to auto-match based on filename
        const filename = file.name.toLowerCase().replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
        const matchedItem = items.find(
          (item) => item.name.toLowerCase().includes(filename) || filename.includes(item.name.toLowerCase()),
        )

        const preview = URL.createObjectURL(file)

        if (matchedItem) {
          newMatches.push({
            file,
            itemId: matchedItem.id,
            game: matchedItem.game,
            itemName: matchedItem.name,
            preview,
          })
        } else {
          // Add unmatched file
          newMatches.push({
            file,
            itemId: "",
            game: "",
            itemName: "",
            preview,
          })
        }
      })

      setMatches((prev) => [...prev, ...newMatches])
    },
    [items],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const updateMatch = (index: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      setMatches((prev) =>
        prev.map((m, i) => (i === index ? { ...m, itemId: item.id, game: item.game, itemName: item.name } : m)),
      )
    }
  }

  const removeMatch = (index: number) => {
    setMatches((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    const validMatches = matches.filter((m) => m.itemId)
    if (validMatches.length === 0) {
      setMessage({ type: "error", text: "No valid matches to upload" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()

      validMatches.forEach((match, index) => {
        formData.append(`file-${index}`, match.file)
        formData.append(`itemId-${index}`, match.itemId)
        formData.append(`game-${index}`, match.game)
      })

      const res = await fetch("/api/admin/bulk-upload-images", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setMessage({
        type: "success",
        text: `Successfully uploaded ${data.updated} image(s)${data.errors > 0 ? ` (${data.errors} failed)` : ""}`,
      })

      // Clear matches and refresh items
      matches.forEach((m) => URL.revokeObjectURL(m.preview))
      setMatches([])

      // Refresh items list
      const itemsRes = await fetch("/api/admin/items-needing-images")
      const itemsData = await itemsRes.json()
      setItems(itemsData.items || [])
      setFilteredItems(itemsData.items || [])
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setMessage({ type: "error", text: "Failed to upload images" })
    } finally {
      setUploading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">You must be logged in to access this tool.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Items Needing Images</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Files Selected</p>
          <p className="text-2xl font-bold">{matches.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ready to Upload</p>
          <p className="text-2xl font-bold">{matches.filter((m) => m.itemId).length}</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Upload Images</h2>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-12 text-center transition-colors hover:border-muted-foreground/50"
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-sm font-medium">Drag and drop images here</p>
          <p className="mb-4 text-xs text-muted-foreground">or click to browse</p>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="mx-auto max-w-xs"
          />
        </div>
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Match Images to Items</h2>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
                <img
                  src={match.preview || "/placeholder.svg"}
                  alt={match.file.name}
                  className="h-16 w-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{match.file.name}</p>
                  <select
                    value={match.itemId}
                    onChange={(e) => updateMatch(index, e.target.value)}
                    className="mt-2 w-full rounded-md border bg-background p-2 text-sm"
                  >
                    <option value="">Select item...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.game}] {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {match.itemId ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => removeMatch(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {message && (
            <div
              className={`mt-4 rounded-md border p-3 text-sm ${
                message.type === "success"
                  ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-destructive/50 bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={uploading || matches.filter((m) => m.itemId).length === 0}
            className="mt-4 w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : `Upload ${matches.filter((m) => m.itemId).length} Image(s)`}
          </Button>
        </div>
      )}

      {/* Items List */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Items Needing Images ({filteredItems.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.game} • RAP: {item.rap_value?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
