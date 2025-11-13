"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { MessageSquare, Home, ArrowLeft } from "lucide-react"
import { cn } from "@/utils/cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  pinned?: boolean
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
  const fetchingRef = useRef(false)
  const channelsRef = useRef<{ conversations: any; messages: any }>({ conversations: null, messages: null })

  useEffect(() => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    fetchConversations().finally(() => {
      fetchingRef.current = false
    })

    const supabase = createClient()

    if (channelsRef.current.conversations) {
      supabase.removeChannel(channelsRef.current.conversations)
    }
    if (channelsRef.current.messages) {
      supabase.removeChannel(channelsRef.current.messages)
    }

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

          setConversations((prev) => {
            if (prev.some((c) => c.id === newConvo.id)) return prev
            return [
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
            ]
          })
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

    channelsRef.current = { conversations: conversationsChannel, messages: messagesChannel }

    return () => {
      if (channelsRef.current.conversations) {
        supabase.removeChannel(channelsRef.current.conversations)
      }
      if (channelsRef.current.messages) {
        supabase.removeChannel(channelsRef.current.messages)
      }
      channelsRef.current = { conversations: null, messages: null }
      fetchingRef.current = false
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

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This cannot be undone.")) {
      return
    }

    try {
      const supabase = createClient()

      // Delete all messages in the conversation first
      await supabase.from("messages").delete().eq("conversation_id", conversationId)

      // Delete the conversation
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId)

      if (error) throw error

      // Remove from local state
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))

      // If this was the selected conversation, deselect it
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      alert("Failed to delete conversation. Please try again.")
    }
  }

  // Added handler to pin/unpin conversations
  const handlePinConversation = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (!conversation) return

    try {
      const supabase = createClient()

      // Toggle pinned status
      const { error } = await supabase
        .from("conversations")
        .update({ pinned: !conversation.pinned })
        .eq("id", conversationId)

      if (error) throw error

      // Update local state
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, pinned: !c.pinned } : c)))
    } catch (error) {
      console.error("Error pinning conversation:", error)
      alert("Failed to pin conversation. Please try again.")
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  return (
    <div className="flex h-screen bg-zinc-950">
      <div
        className={cn(
          "w-full md:w-96 border-r border-border/50 bg-zinc-900/50 backdrop-blur-sm flex flex-col",
          selectedConversationId && "hidden md:flex",
        )}
      >
        <div className="p-4 md:p-6 border-b border-border/50 bg-zinc-900/70 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <span>Messages</span>
          </h1>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 gap-2 rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          loading={loading}
          onDelete={handleDeleteConversation}
          onPin={handlePinConversation}
        />
      </div>

      <div className={cn("flex-1 flex flex-col", !selectedConversationId && "hidden md:flex")}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-zinc-950">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-30" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1">Select a conversation</p>
                <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 gap-2 rounded-lg hover:bg-zinc-800/80 transition-colors bg-transparent"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
