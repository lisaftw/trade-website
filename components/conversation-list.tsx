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
        <p>No conversations yet. Start a chat from a trade request!</p>
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
              "w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border",
              selectedId === conversation.id && "bg-accent",
            )}
          >
            <div className="relative">
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold truncate">{displayName}</p>
                {conversation.last_message_at && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.unreadCount > 0 ? `${conversation.unreadCount} new messages` : "No new messages"}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
