"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { MessageSquare } from "lucide-react"

type Conversation = {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string | null
  otherUser: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
  unreadCount: number
}

export function MessagesContent({
  currentUserId,
  initialConversationId,
}: {
  currentUserId: string
  initialConversationId?: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [currentUserId])

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])

  async function fetchConversations() {
    try {
      const supabase = createClient()

      // Fetch conversations where user is participant_1
      const { data: convos1 } = await supabase.from("conversations").select("*").eq("participant_1_id", currentUserId)

      // Fetch conversations where user is participant_2
      const { data: convos2 } = await supabase.from("conversations").select("*").eq("participant_2_id", currentUserId)

      // Merge and sort by last_message_at
      const allConvos = [...(convos1 || []), ...(convos2 || [])].sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return bTime - aTime
      })

      // Fetch other user profiles and unread counts
      const conversationsWithUsers = await Promise.all(
        allConvos.map(async (convo) => {
          const otherUserId = convo.participant_1_id === currentUserId ? convo.participant_2_id : convo.participant_1_id

          const { data: profile } = await supabase
            .from("profiles")
            .select("discord_id, username, global_name, avatar_url")
            .eq("discord_id", otherUserId)
            .single()

          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", convo.id)
            .eq("is_read", false)
            .neq("sender_id", currentUserId)

          return {
            ...convo,
            otherUser: profile || {
              discord_id: otherUserId,
              username: "Unknown User",
              global_name: null,
              avatar_url: null,
            },
            unreadCount: count || 0,
          }
        }),
      )

      setConversations(conversationsWithUsers)
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  return (
    <div className="flex h-screen">
      {/* Conversation List Sidebar */}
      <div className="w-full md:w-96 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Messages
          </h1>
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          loading={loading}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
