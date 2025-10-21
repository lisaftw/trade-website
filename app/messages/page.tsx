import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { MessagesContent } from "@/components/messages-content"

export default async function MessagesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/messages")
  }

  return (
    <div className="min-h-screen bg-background">
      <MessagesContent currentUserId={session.discordId} />
    </div>
  )
}
