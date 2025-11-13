"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks/use-user"
import { ItemCard } from "@/components/item-card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface InventoryItem {
  id: string
  item_id: string
  quantity: number
  created_at: string
}

interface Item {
  id: string
  name: string
  game: string
  image_url: string
  rap_value: number | null
  exist_count: number | null
  change_percent: number | null
  rating: number | null
  last_updated_at: string
  section?: string
  rarity?: string
  demand?: string
  pot?: string
}

export function InventoryContent() {
  const { user, loading: userLoading } = useUser()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!userLoading && user) {
      fetchInventory()
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user, userLoading])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inventory")

      if (!response.ok) {
        throw new Error("Failed to fetch inventory")
      }

      const data = await response.json()
      setInventory(data.inventory || [])

      // Fetch item details for each inventory item
      if (data.inventory && data.inventory.length > 0) {
        const itemIds = data.inventory.map((inv: InventoryItem) => inv.item_id)
        const itemsResponse = await fetch(`/api/items?ids=${itemIds.join(",")}`)

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json()
          setItems(itemsData.items || [])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (inventoryId: string, itemName: string) => {
    try {
      setRemoving(inventoryId)
      const response = await fetch(`/api/inventory/${inventoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      setInventory((prev) => prev.filter((item) => item.id !== inventoryId))
      toast({
        title: "Removed from inventory",
        description: `${itemName} has been removed from your inventory.`,
      })
    } catch (error) {
      console.error("[v0] Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemoving(null)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sign in to view your inventory</h2>
        <p className="text-muted-foreground mb-6">Save items to your inventory and access them anytime</p>
        <Button asChild>
          <Link href="/api/auth/discord">Sign in with Discord</Link>
        </Button>
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your inventory is empty</h2>
        <p className="text-muted-foreground mb-6">Start adding items to your inventory from the values page</p>
        <Button asChild>
          <Link href="/values">Browse Items</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {inventory.length} {inventory.length === 1 ? "item" : "items"} in your inventory
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
        {inventory.map((invItem) => {
          const item = items.find((i) => i.id === invItem.item_id)

          if (!item) {
            return (
              <div key={invItem.id} className="rounded-2xl border border-border bg-secondary/10 p-4">
                <p className="text-sm text-muted-foreground">Item not found</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleRemove(invItem.id, "Unknown item")}
                  disabled={removing === invItem.id}
                >
                  {removing === invItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            )
          }

          return (
            <div key={invItem.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                <ItemCard item={item} hideAddButton={true} />
                {invItem.quantity > 1 && (
                  <div className="absolute top-2 right-2 z-10 rounded-full bg-white/90 dark:bg-gray-900/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-md border-2 border-border backdrop-blur-sm">
                    ×{invItem.quantity}
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full max-w-[200px] h-9 px-3 shadow-lg"
                onClick={() => handleRemove(invItem.id, item.name)}
                disabled={removing === invItem.id}
              >
                {removing === invItem.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
