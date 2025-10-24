"use client"

import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { Package, User } from "lucide-react"
import { useEffect } from "react"

export function UserMenu() {
  const { user, loading, logout, refetch } = useUser()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("welcome") === "true") {
      refetch()
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [refetch])

  if (loading) {
    return <div className="h-16 w-16 md:h-20 md:w-20 animate-pulse rounded-full bg-muted" />
  }

  if (!user) {
    return (
      <Button asChild variant="default" size="sm" className="rounded-full hover:scale-105 transition-transform">
        <Link href="/login">Login</Link>
      </Button>
    )
  }

  const displayName = user.globalName || user.username || "User"
  const avatarUrl = user.avatarUrl || "/placeholder.svg?height=80&width=80"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="User menu"
          className="group relative h-auto w-auto rounded-full p-0 hover:scale-105 transition-transform"
        >
          <div className="relative">
            <Image
              src={avatarUrl || "/placeholder.svg"}
              alt={displayName}
              width={80}
              height={80}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover ring-2 ring-border transition-all duration-300 group-hover:ring-4 group-hover:ring-primary/50"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
