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

    const supabase = createClient()

    // Subscribe to new conversations
    const conversationsChannel = supabase
      .channel("user-conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `or(participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId})`,
        },
        async (payload) => {
          console.log("New conversation created:", payload)
          // Fetch the new conversation with user details
          const newConvo = payload.new as any
          const otherUserId =
            newConvo.participant_1_id === currentUserId ? newConvo.participant_2_id : newConvo.participant_1_id

          const { data: profile } = await supabase
            .from("profiles")
            .select("discord_id, username, global_name, avatar_url")
            .eq("discord_id", otherUserId)
            .single()

          setConversations((prev) => [
            {
              ...newConvo,
              otherUser: profile || {
                discord_id: otherUserId,
                username: "Unknown User",
                global_name: null,
                avatar_url: null,
              },
              unreadCount: 0,
            },
            ...prev,
          ])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `or(participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId})`,
        },
        (payload) => {
          console.log("Conversation updated:", payload)
          // Update last_message_at to re-sort conversations
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === payload.new.id ? { ...c, last_message_at: (payload.new as any).last_message_at } : c,
            )
            // Re-sort by last_message_at
            return updated.sort((a, b) => {
              const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
              const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
              return bTime - aTime
            })
          })
        },
      )
      .subscribe()

    // Subscribe to new messages to update unread counts
    const messagesChannel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const message = payload.new as any
          console.log("New message received in conversation:", message.conversation_id)

          // Update unread count if message is not from current user and not in selected conversation
          if (message.sender_id !== currentUserId && message.conversation_id !== selectedConversationId) {
            setConversations((prev) =>
              prev.map((c) => (c.id === message.conversation_id ? { ...c, unreadCount: c.unreadCount + 1 } : c)),
            )
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const message = payload.new as any
          // If message was marked as read, update unread count
          if (message.is_read) {
            await updateUnreadCount(message.conversation_id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [currentUserId, selectedConversationId])

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])

  useEffect(() => {
    if (selectedConversationId) {
      // Reset unread count for selected conversation
      setConversations((prev) => prev.map((c) => (c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c)))
    }
  }, [selectedConversationId])

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
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateUnreadCount(conversationId: string) {
    const supabase = createClient()
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", currentUserId)

    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: count || 0 } : c)))
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
