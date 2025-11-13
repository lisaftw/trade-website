"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Trash2, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type Conversation = {
  id: string
  last_message_at: string | null
  otherUser: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
  unreadCount: number
  pinned?: boolean
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
  onDelete,
  onPin,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
  onDelete?: (id: string) => void
  onPin?: (id: string) => void
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-sm">No conversations yet. Start a chat from a trade request!</p>
        </div>
      </div>
    )
  }

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return bTime - aTime
  })

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedConversations.map((conversation) => {
        const displayName = conversation.otherUser.global_name || conversation.otherUser.username || "Unknown User"
        const avatarUrl = conversation.otherUser.avatar_url || "/placeholder.svg?height=48&width=48"

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full p-3 md:p-4 flex items-center gap-3 hover:bg-accent/50 transition-all border-b border-border/50 relative",
              selectedId === conversation.id && "bg-accent/70 border-l-4 border-l-primary",
            )}
          >
            {conversation.pinned && (
              <div className="absolute top-1 right-1">
                <Pin className="h-3 w-3 text-primary fill-primary" />
              </div>
            )}
            <div className="relative shrink-0">
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                width={48}
                height={48}
                className="rounded-full object-cover ring-2 ring-border/50"
              />
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ring-2 ring-background">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p
                  className={cn(
                    "font-semibold truncate text-sm md:text-base",
                    conversation.unreadCount > 0 && "text-foreground",
                  )}
                >
                  {displayName}
                </p>
                {conversation.last_message_at && (
                  <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-xs md:text-sm truncate",
                  conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {conversation.unreadCount > 0
                  ? `${conversation.unreadCount} new message${conversation.unreadCount > 1 ? "s" : ""}`
                  : "No new messages"}
              </p>
            </div>
            {(onDelete || onPin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <span className="sr-only">Open menu</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {onPin && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onPin(conversation.id)
                      }}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {conversation.pinned ? "Unpin" : "Pin"} Chat
                    </DropdownMenuItem>
                  )}
                  {onPin && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(conversation.id)
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </button>
        )
      })}
    </div>
  )
}
