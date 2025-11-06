"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Item {
  id: string
  name: string
  rap_value: number
  image_url: string
}

interface ItemSelectorProps {
  game: string
  onSelect: (itemName: string) => void
}

export default function ItemSelector({ game, onSelect }: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/items?game=${game}`)
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [game])

  const filteredItems = items.filter((item) => (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-gradient-to-b from-foreground/5 to-foreground/2 p-4 backdrop-blur-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background/50 pl-10 border-foreground/10"
        />
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {loading ? (
          <p className="text-center text-sm text-foreground/50 py-4">Loading items...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-sm text-foreground/50 py-4">No items found</p>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.name)}
              className="w-full rounded-lg bg-gradient-to-r from-background to-background/50 p-3 text-left transition-all hover:from-purple-500/10 hover:to-blue-500/10 border border-foreground/5 hover:border-purple-500/30"
            >
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-foreground/60">💰 {item.rap_value.toLocaleString()} RAP</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
