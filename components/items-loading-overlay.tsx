"use client"

import { useItems } from "@/lib/contexts/items-context"
import { Loader2 } from 'lucide-react'

export function ItemsLoadingOverlay() {
  const { isLoading, error } = useItems()

  if (!isLoading && !error) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg border bg-card p-8 shadow-lg">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-semibold">Loading Items...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preparing your trading experience
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-destructive">Failed to Load Items</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
