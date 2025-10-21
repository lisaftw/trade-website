import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { TradesContent } from "@/components/trades-content"

export default async function TradesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/trades")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TradesContent currentUser={session} />
    </div>
  )
}
