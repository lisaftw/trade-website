"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie } from 'lucide-react'

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookie_consent", "declined")
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-5">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:p-6">
          <button
            onClick={declineCookies}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4 pr-8 md:flex-row md:items-center md:gap-6">
            <div className="flex items-start gap-3 md:flex-1">
              <Cookie className="h-6 w-6 flex-shrink-0 text-primary" />
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-semibold leading-tight">
                  We use cookies
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to provide essential features like Discord authentication and to remember your preferences. By accepting, you allow us to store cookies on your device.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:flex-shrink-0">
              <Button
                onClick={acceptCookies}
                className="w-full sm:w-auto"
                size="sm"
              >
                Accept All
              </Button>
              <Button
                onClick={declineCookies}
                variant="outline"
                className="w-full sm:w-auto"
                size="sm"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
