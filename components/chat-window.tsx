"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send, Loader2, Check, CheckCheck, WifiOff, Wifi, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MessageActionsMenu } from "@/components/message-actions-menu"
import { EmojiPicker } from "@/components/emoji-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Reaction = {
  emoji: string
  users: string[]
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  edited_at?: string | null
  deleted_at?: string | null
  reply_to?: string | null
  reactions?: Reaction[]
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  tempId?: string
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
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTypingTimeRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const channelRef = useRef<any>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const markingReadRef = useRef(false)

  const displayName = conversation.otherUser.global_name || conversation.otherUser.username || "Unknown User"
  const avatarUrl = conversation.otherUser.avatar_url || "/placeholder.svg?height=40&width=40"

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    fetchMessages()
    markMessagesAsRead()

    console.log("Setting up realtime subscription for conversation:", conversation.id)

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
          console.log("Received new message via realtime:", payload.new)
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Remove optimistic message if it exists
            const filtered = prev.filter((m) => m.tempId !== newMsg.id)
            // Prevent duplicates
            if (filtered.some((m) => m.id === newMsg.id)) return filtered
            return [...filtered, { ...newMsg, status: "delivered" }]
          })

          if (newMsg.sender_id !== currentUserId) {
            audioRef.current?.play().catch(() => {})
            markMessagesAsRead()
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log("Message updated via realtime:", payload.new)
          const updatedMsg = payload.new as Message
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === updatedMsg.id) {
                return { ...updatedMsg, status: updatedMsg.is_read ? "read" : "delivered" }
              }
              return m
            }),
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log("Message deleted via realtime:", payload.old)
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        console.log("Typing indicator received:", payload)
        if (payload.userId !== currentUserId) {
          setIsTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
        }
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        setIsConnected(status === "SUBSCRIBED")
      })

    channelRef.current = channel

    return () => {
      console.log("Cleaning up realtime subscription")
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      fetchingRef.current = false
      markingReadRef.current = false
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || loadingMore || !hasMore) return

    if (container.scrollTop === 0) {
      loadMoreMessages()
    }
  }, [loadingMore, hasMore])

  async function fetchMessages() {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      const messagesWithStatus = (data || []).reverse().map((msg) => ({
        ...msg,
        status: msg.is_read ? "read" : msg.sender_id === currentUserId ? "delivered" : undefined,
      }))

      setMessages(messagesWithStatus)
      setHasMore((data || []).length === 50)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  async function loadMoreMessages() {
    if (messages.length === 0 || loadingMore) return

    setLoadingMore(true)
    try {
      const oldestMessage = messages[0]
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .lt("created_at", oldestMessage.created_at)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      if (data && data.length > 0) {
        const messagesWithStatus = data.reverse().map((msg) => ({
          ...msg,
          status: msg.is_read ? "read" : msg.sender_id === currentUserId ? "delivered" : undefined,
        }))
        setMessages((prev) => [...messagesWithStatus, ...prev])
        setHasMore(data.length === 50)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more messages:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  async function markMessagesAsRead() {
    if (markingReadRef.current) return
    markingReadRef.current = true

    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", currentUserId)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    } finally {
      markingReadRef.current = false
    }
  }

  function handleTyping() {
    const now = Date.now()
    if (now - lastTypingTimeRef.current > 2000) {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId },
      })
      lastTypingTimeRef.current = now
    }
  }

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || sending) return

    setSending(true)

    try {
      const moderationResponse = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editContent.trim() }),
      })

      if (!moderationResponse.ok) {
        const error = await moderationResponse.json()
        alert(error.reason || "Your message contains inappropriate content.")
        setSending(false)
        return
      }

      const { error } = await supabase
        .from("messages")
        .update({
          content: editContent.trim(),
          edited_at: new Date().toISOString(),
        })
        .eq("id", messageId)

      if (error) throw error

      setEditingMessageId(null)
      setEditContent("")
    } catch (error) {
      console.error("Error editing message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (sending) return
    setSending(true)

    try {
      const { error } = await supabase
        .from("messages")
        .update({
          deleted_at: new Date().toISOString(),
          content: "This message was deleted",
        })
        .eq("id", messageId)

      if (error) throw error

      setDeleteMessageId(null)
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (sending) return
    setSending(true)

    console.log("Adding reaction:", { messageId, emoji, currentUserId })
    try {
      const message = messages.find((m) => m.id === messageId)
      if (!message) {
        console.log("Message not found for reaction")
        return
      }

      const reactions = message.reactions || []
      const existingReaction = reactions.find((r) => r.emoji === emoji)

      let updatedReactions: Reaction[]
      if (existingReaction) {
        if (existingReaction.users.includes(currentUserId)) {
          // Remove reaction
          updatedReactions = reactions
            .map((r) => (r.emoji === emoji ? { ...r, users: r.users.filter((u) => u !== currentUserId) } : r))
            .filter((r) => r.users.length > 0)
        } else {
          // Add user to reaction
          updatedReactions = reactions.map((r) =>
            r.emoji === emoji ? { ...r, users: [...r.users, currentUserId] } : r,
          )
        }
      } else {
        // New reaction
        updatedReactions = [...reactions, { emoji, users: [currentUserId] }]
      }

      console.log("Updating reactions:", updatedReactions)

      const { error } = await supabase.from("messages").update({ reactions: updatedReactions }).eq("id", messageId)

      if (error) {
        console.error("Supabase error updating reactions:", error)
        throw error
      }

      console.log("Reaction updated successfully")
      setShowEmojiPicker(null)
    } catch (error) {
      console.error("Error adding reaction:", error)
      alert("Failed to add reaction. Make sure you've run the SQL script 011_add_message_features.sql")
    } finally {
      setSending(false)
    }
  }

  const startEdit = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)

    try {
      const moderationResponse = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage.trim() }),
      })

      if (!moderationResponse.ok) {
        const error = await moderationResponse.json()
        alert(error.reason || "Your message contains inappropriate content.")
        setSending(false)
        return
      }
    } catch (error) {
      console.error("Error checking message:", error)
      setSending(false)
      return
    }

    const tempId = `temp-${Date.now()}`
    const messageContent = newMessage.trim()

    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      status: "sending",
      reply_to: replyToMessage?.id || null,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")
    setReplyToMessage(null)
    setSending(true)

    try {
      const [messageResult] = await Promise.all([
        supabase
          .from("messages")
          .insert({
            conversation_id: conversation.id,
            sender_id: currentUserId,
            content: messageContent,
            reply_to: replyToMessage?.id || null,
          })
          .select()
          .single(),
        supabase
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversation.id),
      ])

      if (messageResult.error) throw messageResult.error

      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...messageResult.data, status: "sent" } : m)))
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, status: "failed" } : m)))
    } finally {
      setSending(false)
    }
  }

  const retryMessage = async (message: Message) => {
    if (!message.tempId) return

    setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...m, status: "sending" } : m)))

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: message.content,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...data, status: "sent" } : m)))
    } catch (error) {
      console.error("Error retrying message:", error)
      setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...m, status: "failed" } : m)))
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function renderMessageStatus(message: Message) {
    if (message.sender_id !== currentUserId) return null

    switch (message.status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "sent":
        return <Check className="h-3 w-3" />
      case "delivered":
        return <CheckCheck className="h-3 w-3" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "failed":
        return (
          <button onClick={() => retryMessage(message)} className="text-red-500 text-xs underline">
            Retry
          </button>
        )
      default:
        return <Check className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-border/50 bg-zinc-950/70 backdrop-blur-sm flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative">
          <Image
            src={avatarUrl || "/placeholder.svg"}
            alt={displayName}
            width={44}
            height={44}
            className="rounded-full object-cover ring-2 ring-border/50"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base md:text-lg truncate">{displayName}</h2>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">typing</span>
              </span>
            ) : (
              `@${conversation.otherUser.username || "unknown"}`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" title="Connected" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-zinc-950"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Send className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            const isDeleted = !!message.deleted_at
            const isEditing = editingMessageId === message.id
            const replyToMsg = message.reply_to ? messages.find((m) => m.id === message.reply_to) : null

            return (
              <div
                key={message.id || message.tempId}
                className={cn("flex group", isOwn ? "justify-end" : "justify-start")}
              >
                <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                  {showEmojiPicker === message.id && (
                    <div className="relative mt-2">
                      <EmojiPicker
                        onSelect={(emoji) => {
                          handleReaction(message.id, emoji)
                        }}
                        onClose={() => {
                          setShowEmojiPicker(null)
                        }}
                      />
                    </div>
                  )}

                  {replyToMsg && (
                    <div
                      className={cn(
                        "text-xs px-3 py-1.5 mb-1 rounded-t-lg border-l-2 backdrop-blur-sm",
                        isOwn ? "bg-primary/10 border-primary/50" : "bg-muted/50 border-muted-foreground/30",
                      )}
                    >
                      <p className="text-muted-foreground text-[10px] md:text-xs font-medium mb-0.5">Replying to</p>
                      <p className="truncate text-xs">{replyToMsg.content}</p>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        "flex-1 rounded-3xl px-3 py-2 md:px-4 md:py-2.5 shadow-md transition-all",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-lg"
                          : "bg-card border border-border/50 rounded-bl-lg",
                        message.status === "failed" && "opacity-50",
                        isDeleted && "italic opacity-60",
                        !isDeleted && "hover:shadow-lg",
                      )}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <p
                              className={cn(
                                "text-[10px] md:text-xs",
                                isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                              )}
                            >
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              {message.edited_at && !isDeleted && " (edited)"}
                            </p>
                            {isOwn && (
                              <span
                                className={cn(
                                  "text-xs flex items-center",
                                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                                )}
                              >
                                {renderMessageStatus(message)}
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all hover:scale-110",
                                reaction.users.includes(currentUserId)
                                  ? "bg-primary/20 border border-primary/50 shadow-md"
                                  : "bg-muted/50 hover:bg-muted border border-transparent",
                              )}
                            >
                              <span className="text-base">{reaction.emoji}</span>
                              <span className="text-xs font-medium">{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isDeleted && !isEditing && (
                      <MessageActionsMenu
                        messageId={message.id}
                        content={message.content}
                        isOwnMessage={isOwn}
                        onEdit={() => startEdit(message)}
                        onDelete={() => setDeleteMessageId(message.id)}
                        onReply={() => setReplyToMessage(message)}
                        onReact={() => setShowEmojiPicker(message.id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-border/50 bg-zinc-900/70 backdrop-blur-sm">
        {replyToMessage && (
          <div className="flex items-center gap-2 mb-2 p-2 md:p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex-1 text-sm min-w-0">
              <p className="text-muted-foreground text-xs font-medium mb-0.5">Replying to:</p>
              <p className="truncate text-sm">{replyToMessage.content}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setReplyToMessage(null)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-background border-border/50 focus-visible:ring-primary/50 text-sm md:text-base"
            disabled={sending || !isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim() || !isConnected}
            className="rounded-full h-10 w-10 md:h-11 md:w-11 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMessageId && handleDeleteMessage(deleteMessageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
