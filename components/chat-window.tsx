"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

type Conversation = {
  id: string
  otherUser: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
}

export function ChatWindow({
  conversation,
  currentUserId,
  onBack,
}: {
  conversation: Conversation
  currentUserId: string
  onBack: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const displayName = conversation.otherUser.global_name || conversation.otherUser.username || "Unknown User"
  const avatarUrl = conversation.otherUser.avatar_url || "/placeholder.svg?height=40&width=40"

  useEffect(() => {
    fetchMessages()
    markMessagesAsRead()

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log("[v0] New message received:", payload)
          setMessages((prev) => [...prev, payload.new as Message])
          if ((payload.new as Message).sender_id !== currentUserId) {
            markMessagesAsRead()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markMessagesAsRead() {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", currentUserId)
    } catch (error) {
      console.error("[v0] Error marking messages as read:", error)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Image
          src={avatarUrl || "/placeholder.svg"}
          alt={displayName}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="font-semibold">{displayName}</h2>
          <p className="text-xs text-muted-foreground">@{conversation.otherUser.username || "unknown"}</p>
        </div>
      </div>

      {/* Messages Area with WhatsApp-like background */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "hsl(var(--background))",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2 shadow-sm",
                    isOwn ? "bg-primary text-primary-foreground" : "bg-card border border-border",
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={cn("text-xs mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
