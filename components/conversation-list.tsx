"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
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

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
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
          </button>
        )
      })}
    </div>
  )
}
