"use client"

import type { ReactNode } from "react"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, LogIn, ShieldAlert } from "lucide-react"

export function AuthGate({
  children,
  feature = "this feature",
}: {
  children: ReactNode
  feature?: string
}) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Dialog open>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-foreground" />
                Sign in required
              </DialogTitle>
              <DialogDescription>
                Please sign in with Discord to use {feature}. This keeps your trades and preferences synced.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex flex-col gap-2">
              <a href="/api/auth/discord" className="w-full">
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Continue with Discord
                </Button>
              </a>
              <a href="/" className="w-full">
                <Button variant="secondary" className="w-full">
                  Go back home
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Authenticated: render the protected UI
  return <>{children}</>
}

export default AuthGate
